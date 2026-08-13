# Quickstart: Planificación semanal de menús

**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Escenarios de validación

Estos escenarios sirven como smoke tests para verificar que la implementación cubre los flujos principales. Cada uno debe ser ejecutable como test de integración.

---

### 1. Generar menú semanal completo sin violaciones

**Precondiciones**:
- Familia con 3 miembros configurados (spec 001)
- Miembro A: alergia a frutos secos (restricción obligatoria)
- Catálogo con ≥30 recetas variadas (spec 005)

**Pasos**:
1. Solicitar generación de menú para semana completa (lunes-domingo)
2. Verificar que la propuesta tiene 7 días × 4 comidas = 28 slots
3. Verificar que ninguna receta asignada contiene frutos secos
4. Verificar que cada slot tiene una receta válida (o variante para el miembro A)

**Resultado esperado**: Propuesta completa, sin violación de restricciones obligatorias.

---

### 2. Generar semana parcial (miércoles a domingo)

**Precondiciones**:
- Familia configurada con criterios completos
- Catálogo con recetas suficientes

**Pasos**:
1. Solicitar generación con `startDate: miércoles`, `endDate: domingo`
2. Verificar que solo se generan PlannedMeal para 5 días
3. Verificar que no existen comidas para lunes ni martes
4. Verificar estructura completa (4 mealTypes × 5 días = 20 slots)

**Resultado esperado**: Solo los días seleccionados tienen comidas planificadas.

---

### 3. Aplicar filtro de complejidad (quick entre semana)

**Precondiciones**:
- ComplexityConfig: `weekdayLevel: quick`, `weekendLevel: medium`
- Catálogo con recetas de todas las complejidades

**Pasos**:
1. Generar menú para semana completa
2. Verificar recetas de lunes a viernes: todas con `complexityLevel ≤ quick`
3. Verificar recetas de sábado-domingo: pueden incluir `medium`
4. Verificar que no hay recetas `elaborate` en ningún día

**Resultado esperado**: La complejidad de cada receta respeta el filtro configurado por tramo.

---

### 4. Aprobar propuesta y verificar cambio de estado

**Precondiciones**:
- PlannedWeek en estado `draft` con propuesta generada

**Pasos**:
1. Llamar `approveProposal(proposalId)`
2. Verificar que PlannedWeek cambia a `status: approved`
3. Verificar que `approvedAt` tiene timestamp actual
4. Verificar que es el único PlannedWeek aprobado para esa familia + rango

**Resultado esperado**: Estado cambia a `approved`, timestamp registrado, unicidad garantizada.

---

### 5. Reemplazar menú aprobado por uno nuevo

**Precondiciones**:
- PlannedWeek A en estado `approved` para la semana 33
- Nueva propuesta generada para la misma semana (PlannedWeek B en draft)

**Pasos**:
1. Llamar `replaceApproved(weekA.id, weekB.proposalId)`
2. Verificar que PlannedWeek A cambia a `status: replaced`
3. Verificar que PlannedWeek A tiene `replacedBy: weekB.id`
4. Verificar que PlannedWeek B cambia a `status: approved`
5. Verificar que solo PlannedWeek B está aprobado para esa semana

**Resultado esperado**: El antiguo se archiva, el nuevo es el vigente.

---

### 6. Cambio de perfil dispara aviso de incompatibilidad

**Precondiciones**:
- PlannedWeek aprobado con receta que contiene "gambas"
- Miembro sin restricción de marisco

**Pasos**:
1. Añadir alergia a marisco al miembro (spec 001)
2. IncompatibilityService detecta el cambio
3. Verificar que PlannedWeek se marca como `status: incompatible`
4. Verificar que se identifica la comida afectada (la que tiene "gambas")
5. Verificar que el menú sigue visible (no se elimina)

**Resultado esperado**: Aviso de incompatibilidad sin eliminar el menú; el usuario decide.

---

### 7. No repetición de lunch/dinner dentro de la semana

**Precondiciones**:
- Catálogo con ≥14 recetas aptas para lunch/dinner
- Familia sin restricciones especiales

**Pasos**:
1. Generar menú para semana completa
2. Extraer todas las recetas asignadas a `mealType: lunch` (7)
3. Extraer todas las recetas asignadas a `mealType: dinner` (7)
4. Verificar que no hay recipeId duplicado en el set de lunch
5. Verificar que no hay recipeId duplicado en el set de dinner
6. (Opcional) Verificar que breakfast/snack SÍ pueden repetir

**Resultado esperado**: Variedad garantizada en comidas y cenas; desayunos/snacks sin restricción.

---

### 8. Generación offline como fallback

**Precondiciones**:
- Familia configurada con criterios
- Recetas cacheadas localmente en WatermelonDB
- Sin conexión a internet (simular network offline)

**Pasos**:
1. Solicitar generación de menú semanal
2. Verificar que la llamada al backend falla (timeout/error de red)
3. Verificar que el motor local genera una propuesta
4. Verificar que `generationSource` es `'offline'`
5. Verificar que la propuesta respeta restricciones obligatorias
6. Verificar que la propuesta es funcional (tiene comidas para los días solicitados)

**Resultado esperado**: El usuario obtiene una propuesta válida sin conexión, marcada como generada offline.

---

## Notas de ejecución

- Los escenarios 1-7 pueden ejecutarse como tests de integración con base de datos in-memory
- El escenario 8 requiere mock de la capa de red (simular fallo de conexión)
- Todos los escenarios asumen que spec 001 (perfiles) y spec 005 (catálogo) están implementados
- El seed de datos para tests debe incluir un catálogo diverso con metadatos de complejidad y restricciones
