# Data Model: Planificación semanal de menús

**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Research**: [research.md](./research.md)

## Entidades

### PlannedWeek

Semana planificada. Unidad temporal sobre la que se construye el menú.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | `string (UUID)` | ✅ | Identificador único |
| `familyId` | `string (FK → Family)` | ✅ | Hogar al que pertenece |
| `startDate` | `date (ISO 8601)` | ✅ | Fecha de inicio del plan |
| `endDate` | `date (ISO 8601)` | ✅ | Fecha de fin del plan |
| `status` | `enum` | ✅ | Estado actual del plan |
| `approvedAt` | `datetime?` | ❌ | Timestamp de aprobación (null si draft) |
| `replacedBy` | `string? (FK → PlannedWeek)` | ❌ | ID del plan que lo reemplazó |
| `createdAt` | `datetime` | ✅ | Timestamp de creación |
| `updatedAt` | `datetime` | ✅ | Timestamp de última modificación |

**Status enum**: `draft` | `approved` | `incompatible` | `replaced`

**Constraints**:
- `endDate >= startDate`
- Máximo 7 días entre start y end
- Solo un PlannedWeek con `status: approved` por `familyId` + rango de fechas solapado

---

### MenuProposal

Propuesta de menú generada para una semana planificada.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | `string (UUID)` | ✅ | Identificador único |
| `weekId` | `string (FK → PlannedWeek)` | ✅ | Semana a la que pertenece |
| `criteriaSnapshot` | `JSON` | ✅ | Criterios usados en el momento de la generación |
| `generatedAt` | `datetime` | ✅ | Timestamp de generación |
| `generationSource` | `enum` | ✅ | Origen de la generación |
| `complexityApplied` | `JSON?` | ❌ | Configuración de complejidad aplicada |

**generationSource enum**: `backend` | `offline`

**criteriaSnapshot structure**:
```typescript
interface CriteriaSnapshot {
  restrictions: Array<{
    memberId: string;
    type: string;
    severity: 'mandatory' | 'preference';
  }>;
  preferences: Array<{
    memberId: string;
    foodItem: string;
    attitude: 'like' | 'dislike';
  }>;
  goals: Array<{
    memberId: string;
    type: string;
    target: string;
  }>;
  complexityConfig: {
    weekdayLevel: ComplexityLevel;
    weekendLevel: ComplexityLevel;
  } | null;
}
```

---

### PlannedMeal

Unidad de planificación: una comida específica de un día.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | `string (UUID)` | ✅ | Identificador único |
| `proposalId` | `string (FK → MenuProposal)` | ✅ | Propuesta a la que pertenece |
| `day` | `date (ISO 8601)` | ✅ | Día de la comida |
| `mealType` | `enum` | ✅ | Momento del día |
| `recipeId` | `string (FK → FamilyRecipe)` | ✅ | Receta principal asignada |
| `status` | `enum` | ✅ | Estado de la comida |
| `variants` | `JSON (MealVariant[])` | ❌ | Variantes por miembro |

**mealType enum**: `breakfast` | `lunch` | `dinner` | `snack`

**status enum**: `planned` | `out_of_house`

**variants structure**:
```typescript
interface MealVariant {
  memberId: string;   // FK → FamilyMember
  recipeId: string;   // FK → FamilyRecipe (receta alternativa)
  reason: string;     // Motivo de la variante
}
```

---

### ComplexityConfig

Configuración de complejidad de preparación por hogar.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | `string (UUID)` | ✅ | Identificador único |
| `familyId` | `string (FK → Family)` | ✅ | Hogar al que pertenece |
| `weekdayLevel` | `enum` | ✅ | Nivel de complejidad entre semana |
| `weekendLevel` | `enum` | ✅ | Nivel de complejidad fin de semana |

**ComplexityLevel enum**: `quick` | `medium` | `elaborate`

**Constraints**:
- Un solo ComplexityConfig por `familyId`

**Derivación del nivel de complejidad**: El nivel de una receta se deriva de `FamilyRecipe.prepTimeMinutes` (spec 005):
- `quick`: prepTimeMinutes < 30
- `medium`: 30 ≤ prepTimeMinutes ≤ 60  
- `elaborate`: prepTimeMinutes > 60
- Si prepTimeMinutes es null: la receta se considera `medium` por defecto

---

### MealExplanation

Explicación de por qué una propuesta encaja con la familia.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | `string (UUID)` | ✅ | Identificador único |
| `proposalId` | `string (FK → MenuProposal)` | ✅ | Propuesta explicada |
| `summary` | `string (i18n key)` | ✅ | Resumen legible de encaje |
| `criteriaRespected` | `JSON (string[])` | ✅ | Lista de criterios respetados |
| `conflictsDetected` | `JSON (string[])` | ✅ | Conflictos encontrados |
| `compromisesApplied` | `JSON (string[])` | ✅ | Compromisos aplicados (criterios relajados) |

---

## Indexes

| Tabla | Índice | Columnas | Propósito |
|-------|--------|----------|-----------|
| PlannedWeek | `idx_week_family_status` | `familyId + status` | Buscar menú aprobado de una familia |
| PlannedWeek | `idx_week_family_dates` | `familyId + startDate` | Buscar por rango temporal |
| PlannedMeal | `idx_meal_proposal_day` | `proposalId + day + mealType` | Acceso rápido a comidas de un día |
| MenuProposal | `idx_proposal_week` | `weekId` | Relación propuesta → semana |
| ComplexityConfig | `idx_complexity_family` | `familyId` | Lookup único por familia |

---

## Relaciones

```text
Family (spec 001)
  │
  ├── 1:N → PlannedWeek
  │           │
  │           └── 1:1 → MenuProposal
  │                       │
  │                       ├── 1:N → PlannedMeal
  │                       │           │
  │                       │           └── N:1 → FamilyRecipe (spec 005)
  │                       │
  │                       └── 1:1 → MealExplanation
  │
  └── 1:1 → ComplexityConfig

FamilyMember (spec 001)
  │
  └── referenced in → PlannedMeal.variants[].memberId
```

---

## Sync Strategy

### WatermelonDB Sync

- Todas las entidades se almacenan localmente con sync habilitado
- Push/pull incremental con Supabase
- Timestamps `createdAt`/`updatedAt` para tracking de cambios

### Collaborative Merge

| Escenario | Estrategia |
|-----------|------------|
| Diferentes días editados | Merge automático sin conflicto |
| Mismo día, diferente mealType | Merge automático sin conflicto |
| Mismo día + mismo mealType | Last-write-wins + notificación al otro usuario |
| Aprobación simultánea | Primera aprobación gana, segunda recibe error |

### Resolución de conflictos

```text
Conflicto detectado:
  1. Sistema guarda ambas versiones temporalmente
  2. Notifica al segundo usuario: "Tu cambio en [día, comida] colisiona con otro"
  3. Usuario elige: mantener su versión o aceptar la del otro
  4. Se resuelve y se sincroniza
```

---

## Ejemplo de datos

```json
{
  "plannedWeek": {
    "id": "pw-001",
    "familyId": "fam-001",
    "startDate": "2026-08-11",
    "endDate": "2026-08-17",
    "status": "approved",
    "approvedAt": "2026-08-10T18:30:00Z",
    "replacedBy": null
  },
  "menuProposal": {
    "id": "mp-001",
    "weekId": "pw-001",
    "criteriaSnapshot": { "restrictions": [...], "preferences": [...], "goals": [...] },
    "generatedAt": "2026-08-10T18:25:00Z",
    "generationSource": "backend",
    "complexityApplied": { "weekdayLevel": "quick", "weekendLevel": "medium" }
  },
  "plannedMeals": [
    {
      "id": "pm-001",
      "proposalId": "mp-001",
      "day": "2026-08-11",
      "mealType": "lunch",
      "recipeId": "recipe-pasta-verduras",
      "status": "planned",
      "variants": [
        { "memberId": "member-002", "recipeId": "recipe-pasta-sin-gluten", "reason": "celiaquía" }
      ]
    },
    {
      "id": "pm-002",
      "proposalId": "mp-001",
      "day": "2026-08-11",
      "mealType": "dinner",
      "recipeId": "recipe-salmon-plancha",
      "status": "planned",
      "variants": []
    },
    {
      "id": "pm-003",
      "proposalId": "mp-001",
      "day": "2026-08-13",
      "mealType": "lunch",
      "recipeId": null,
      "status": "out_of_house",
      "variants": []
    }
  ]
}
```
