# Research: Planificación semanal de menús

**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## R1: Algoritmo de generación de menú

### Decisión

Constraint satisfaction con pipeline secuencial, implementado como Supabase Edge Function (backend-first) con fallback offline simplificado.

### Pipeline de generación

```text
1. fetchCriteria(familyId)
   → Obtener restricciones obligatorias, preferencias, objetivos, complejidad

2. filterRecipes(restrictions)
   → Excluir recetas incompatibles con restricciones obligatorias (alergias, intolerancias)
   → Resultado: pool de recetas "seguras"

3. filterByMealType(pool, mealType)
   → Segmentar pool por tipo de comida (breakfast/lunch/dinner/snack)

4. applyComplexity(pool, dayType)
   → Filtrar por nivel de complejidad según día (weekday/weekend)

5. prioritize(pool, preferences, goals)
   → Scoring: preferencias positivas (+), rechazos (-), alineación con objetivos (+)
   → Ordenar pool por score descendente

6. avoidRepetition(pool, usedRecipes, mealType)
   → Para lunch/dinner: excluir recetas ya usadas en la semana
   → Para breakfast/snack: no aplicar filtro de repetición

7. buildWeekStructure(selectedRecipes, dateRange)
   → Asignar recetas a cada slot (día × mealType)
   → Detectar slots sin candidatos viables → marcar como "sin propuesta"

8. generateExplanation(proposal, criteria)
   → Generar resumen de criterios respetados, conflictos y compromisos
```

### Implementación backend (Supabase Edge Function)

- Acceso directo a catálogo completo de recetas
- Scoring más sofisticado con pesos configurables
- Capacidad de considerar historial de semanas anteriores
- Respuesta en <15s para hogares estándar

### Fallback offline (motor local)

- Usa recetas cacheadas en WatermelonDB
- Pipeline simplificado (sin historial, scoring básico)
- Genera propuesta parcial si el catálogo local es insuficiente
- Marca la propuesta con `generationSource: 'offline'`

### Justificación

El enfoque backend-first permite un algoritmo más potente con acceso a datos completos. El fallback offline garantiza que el usuario nunca se quede bloqueado. El pipeline secuencial es determinista y testeable paso a paso.

---

## R2: Soporte de semana parcial

### Decisión

PlannedWeek almacena `startDate` + `endDate` explícitos. No asume semanas naturales (lunes-domingo).

### Diseño

- El usuario selecciona rango de fechas en la UI (DateRangePicker)
- Validación: `endDate >= startDate`, máximo 7 días
- La generación solo produce PlannedMeal para los días dentro del rango
- La vista semanal muestra solo los días planificados

### Casos soportados

| Caso | startDate | endDate | Días |
|------|-----------|---------|------|
| Semana completa | Lunes | Domingo | 7 |
| Media semana | Miércoles | Domingo | 5 |
| Fin de semana | Sábado | Domingo | 2 |
| Un solo día | Jueves | Jueves | 1 |

### Justificación

Muchas familias planifican parcialmente (ya tienen menú para los primeros días, o solo quieren resolver el fin de semana). El modelo flexible con fechas explícitas cubre todos los casos sin complejidad adicional.

---

## R3: Filtro de complejidad

### Decisión

Preferencia global del hogar almacenada en la entidad `ComplexityConfig`, con diferenciación weekday/weekend. Se aplica como filtro sobre el pool de recetas durante la generación.

### Niveles

| Nivel | Significado | Tiempo orientativo |
|-------|-------------|-------------------|
| `quick` | Platos rápidos, mínima elaboración | <30 min |
| `medium` | Preparación estándar | 30-60 min |
| `elaborate` | Platos elaborados, cocina creativa | >60 min |

### Aplicación

```typescript
// Durante el paso 4 del pipeline
function applyComplexity(pool: Recipe[], dayType: 'weekday' | 'weekend'): Recipe[] {
  const config = getComplexityConfig(familyId);
  const maxLevel = dayType === 'weekday' ? config.weekdayLevel : config.weekendLevel;
  return pool.filter(r => r.complexityLevel <= complexityOrder[maxLevel]);
}
```

### Comportamiento por defecto

- Si no hay ComplexityConfig: no se aplica filtro (todas las complejidades disponibles)
- El filtro es inclusivo hacia abajo: `medium` incluye `quick` + `medium`
- Si el filtro deja el pool vacío, se relaja un nivel y se registra en la explicación

### Justificación

La complejidad es el proxy más práctico de "esfuerzo en cocina". La diferenciación weekday/weekend refleja la realidad: entre semana poco tiempo, fin de semana más disponibilidad.

---

## R4: Evitar repetición de platos

### Decisión

Mantener un set de recetas usadas por tipo de comida durante la generación. Lunch/dinner no repiten en la misma semana. Breakfast/snack permiten repetición.

### Implementación

```typescript
interface RepetitionTracker {
  usedLunchRecipes: Set<string>;   // recipeIds usados en comidas
  usedDinnerRecipes: Set<string>;  // recipeIds usados en cenas
  // breakfast y snack NO tienen tracker
}

function canUseRecipe(recipeId: string, mealType: MealType, tracker: RepetitionTracker): boolean {
  if (mealType === 'lunch') return !tracker.usedLunchRecipes.has(recipeId);
  if (mealType === 'dinner') return !tracker.usedDinnerRecipes.has(recipeId);
  return true; // breakfast/snack: siempre permitido
}
```

### Cross-type

- Un mismo plato PUEDE aparecer como comida un día y cena otro día (son trackers separados)
- Si el catálogo es muy limitado y no hay suficientes recetas únicas, se permite repetición con aviso en la explicación

### Justificación

Refleja la expectativa del usuario: variedad en las comidas principales, pero no necesariamente en desayunos (muchas familias desayunan lo mismo). El tracking separado por tipo permite flexibilidad.

---

## R5: Flujo de aprobación

### Decisión

Máquina de estados sobre PlannedWeek: `draft → approved → replaced`. Solo puede haber un menú aprobado por semana y hogar.

### Estados

```text
┌─────────┐    approve()     ┌──────────┐    replace()    ┌──────────┐
│  draft  │ ───────────────► │ approved │ ──────────────► │ replaced │
└─────────┘                  └──────────┘                 └──────────┘
                                   │
                                   │ markIncompatible()
                                   ▼
                             ┌──────────────┐
                             │ incompatible │
                             └──────────────┘
```

### Reglas

- Solo un PlannedWeek con `status: approved` por `familyId + dateRange` solapado
- `approve()`: cambia draft → approved, setea `approvedAt`
- `replace()`: crea nuevo PlannedWeek (draft → approved), el anterior pasa a `replaced` con `replacedBy` apuntando al nuevo
- `markIncompatible()`: añade flag sin cambiar el estado base (sigue vigente hasta que el usuario actúe)
- El usuario puede volver a aprobar un menú incompatible (bajo su responsabilidad)

### Justificación

El modelo simple de estados cubre el flujo real del usuario sin over-engineering. La semántica de "replaced" permite mantener historial sin complejidad de versionado.

---

## R6: Detección de incompatibilidad

### Decisión

Observer reactivo sobre cambios en FamilyMember (restricciones). Cuando cambia una restricción, se verifican los menús aprobados vigentes.

### Flujo

```text
1. FamilyMember.restrictions cambia (spec 001 emite evento)
2. IncompatibilityService recibe el cambio
3. Buscar PlannedWeek(familyId, status: approved, endDate >= today)
4. Para cada menú vigente:
   a. Obtener recetas de todos los PlannedMeal
   b. Verificar cada receta contra las nuevas restricciones
   c. Si alguna receta es incompatible → marcar PlannedWeek como incompatible
5. Notificar al usuario con detalle de qué comidas están afectadas
```

### Trigger

- Observer de WatermelonDB sobre la tabla de restricciones
- Se ejecuta en background (no bloquea UI)
- Solo verifica menús futuros o de la semana actual (no históricos)

### Justificación

La detección proactiva evita que un menú aprobado sea peligroso sin que el usuario lo sepa. El approach reactivo es eficiente (solo se verifica cuando hay un cambio real).

---

## R7: Variantes por miembro

### Decisión

PlannedMeal tiene un campo `variants[]` embebido. Cada variante vincula un miembro con una receta alternativa. Se usa cuando una comida compartida tiene un miembro con restricción conflictiva.

### Estructura

```typescript
interface MealVariant {
  memberId: string;        // Miembro que necesita variante
  recipeId: string;        // Receta alternativa
  reason: string;          // Motivo (ej: "intolerancia a lactosa")
}

interface PlannedMeal {
  // ... campos base
  recipeId: string;        // Receta principal (para la mayoría)
  variants: MealVariant[]; // Variantes por miembro si aplica
}
```

### Generación

- Durante el pipeline, si una receta seleccionada es incompatible con un miembro específico pero válida para el resto:
  1. Se mantiene como receta principal
  2. Se busca alternativa compatible para ese miembro
  3. Se añade como variante

### Límites

- Máximo 1 variante por miembro por comida
- Si más de 50% de miembros necesitan variante, se busca otra receta principal
- Las variantes se muestran en la UI con indicación visual del miembro

### Justificación

Refleja la realidad familiar: una familia de 4 puede compartir el 90% del menú pero un miembro celíaco necesita adaptación. Es más eficiente que generar menús completamente independientes.

---

## R8: Comidas "fuera de casa"

### Decisión

PlannedMeal tiene un campo `status` con enum que incluye `out_of_house`. Estas comidas se excluyen de la generación y de la lista de la compra.

### Comportamiento

- El usuario marca un slot (día × mealType) como "fuera de casa" antes o después de la generación
- Si se marca ANTES: el generador no produce receta para ese slot
- Si se marca DESPUÉS: la receta existente se "desactiva" (no se elimina, por si se revierte)
- Status enum: `planned | out_of_house`

### Impacto en otros sistemas

| Sistema | Comportamiento con out_of_house |
|---------|--------------------------------|
| Generación | Salta el slot |
| Vista semanal | Muestra badge "fuera" |
| Lista de compra | Excluye ingredientes |
| Repetición | No cuenta como "usado" |

### Justificación

Es un caso muy común (comer fuera un día, viaje de un miembro, invitación). La solución es mínima (un enum) y tiene impacto claro en todos los flujos downstream.
