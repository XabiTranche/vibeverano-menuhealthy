# Data Model: Ajustes, sustituciones y seguimiento del menú

**Feature**: 004-ajustes-sustituciones-y-seguimiento
**Date**: 2026-08-10

## Entity Relationship Diagram (textual)

```
WeeklyMenu (1) ──── (N) MealAdjustment
WeeklyMenu (1) ──── (1) MenuHistory
WeeklyMenu (1) ──── (1) SubstitutionCounter
WeeklyMenu (1) ──── (N) SubstitutionSignal
PlannedMeal (1) ──── (N) MealAdjustment
```

## Entities

### MealAdjustment (Ajuste de comida)

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| id | UUID | Sí | Identificador único |
| weekId | UUID (FK) | Sí | Referencia a WeeklyMenu (spec 002) |
| mealId | UUID (FK) | Sí | Referencia a PlannedMeal (spec 002) |
| originalRecipeId | UUID | Sí | ID de la receta original que se sustituyó |
| newRecipeId | UUID | Sí | ID de la nueva receta elegida |
| reason | enum? | No | Motivo: gusto, falta_ingredientes, tiempo, rechazo_infantil, otro |
| memberId | UUID | Sí | ID del usuario que realizó el cambio |
| timestamp | DateTime | Sí | Momento del cambio |
| validationResult | JSON | Sí | {passed: boolean, warnings: Warning[]} |
| createdAt | DateTime | Sí | Fecha de creación del registro |

**Validaciones**:
- `weekId`: debe referenciar un WeeklyMenu existente (spec 002)
- `mealId`: debe referenciar un PlannedMeal existente dentro de ese weekId
- `originalRecipeId`: debe coincidir con el recipeId actual del PlannedMeal antes del cambio
- `newRecipeId`: debe referenciar una Recipe existente (spec 005), distinto de originalRecipeId
- `reason`: nullable; si se provee, debe ser uno de los 5 valores enum
- `validationResult`: JSON con estructura `{passed: boolean, warnings: [{type, message, severity}]}`

**Regla**: Solo se crea un MealAdjustment si la validación de restricciones obligatorias pasa (`passed: true`).

---

### SubstitutionSignal (Señal de aprendizaje)

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| id | UUID | Sí | Identificador único |
| weekId | UUID (FK) | Sí | Referencia a WeeklyMenu |
| originalRecipeId | UUID | Sí | Receta original |
| newRecipeId | UUID | Sí | Receta elegida como reemplazo |
| mealType | enum | Sí | Tipo de comida: desayuno, almuerzo, merienda, cena |
| reason | enum? | No | Motivo: gusto, falta_ingredientes, tiempo, rechazo_infantil, otro |
| memberId | UUID | Sí | Miembro afectado por el cambio |
| familyId | UUID | Sí | Familia para queries de aprendizaje futuro |
| timestamp | DateTime | Sí | Momento del cambio |
| createdAt | DateTime | Sí | Fecha de creación |

**Validaciones**:
- `mealType`: uno de los 4 valores enum (desayuno, almuerzo, merienda, cena)
- `reason`: nullable; mismos valores que MealAdjustment.reason
- `familyId`: debe coincidir con la familia del WeeklyMenu referenciado

**Nota**: Esta entidad es un registro de solo escritura en MVP. No se lee para generar recomendaciones automáticas. Se almacena para uso en fases futuras.

---

### MenuHistory (Histórico de menú original)

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| id | UUID | Sí | Identificador único |
| weekId | UUID (FK) | Sí | Referencia a WeeklyMenu (UNIQUE) |
| originalMeals | JSON | Sí | Snapshot completo de PlannedMeal[] al momento de la primera modificación |
| snapshotCreatedAt | DateTime | Sí | Momento en que se creó el snapshot |

**Validaciones**:
- `weekId`: UNIQUE — solo un snapshot por semana
- `originalMeals`: JSON array con estructura de PlannedMeal serializado: `[{id, recipeId, mealType, day, memberIds, ...}]`
- Se crea SOLO en la primera sustitución de una semana (lazy snapshot)

**Regla**: Una vez creado, `originalMeals` NUNCA se modifica. Es inmutable. La "versión actual" siempre es el estado live de PlannedMeal[] para ese weekId.

---

### SubstitutionCounter (Contador de sustituciones)

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| id | UUID | Sí | Identificador único |
| weekId | UUID (FK) | Sí | Referencia a WeeklyMenu (UNIQUE) |
| count | integer | Sí | Número de sustituciones acumuladas en la semana |
| regenerationSuggested | boolean | Sí | Si ya se mostró la sugerencia de regenerar (default: false) |
| updatedAt | DateTime | Sí | Última actualización del contador |

**Validaciones**:
- `weekId`: UNIQUE — un solo contador por semana
- `count`: >= 0
- `regenerationSuggested`: se pone a `true` cuando count >= 5 y se muestra al usuario

**Regla**: Se incrementa `count` con cada MealAdjustment confirmado en esa semana. Al alcanzar 5, se sugiere regeneración (FR-011).

---

## State Transitions

### Substitution Flow

```
[Usuario selecciona comida] → SubstitutionService.validateSubstitution()
    ├── [Bloqueo] → restricción obligatoria violada → mostrar error → FIN
    └── [Válido] → mostrar warnings (si hay) → usuario confirma
                   → SubstitutionService.applySubstitution()
                   → [MealAdjustment creado]
                   → [SubstitutionSignal registrado]
                   → [SubstitutionCounter incrementado]
                   → [MenuHistory snapshot si es primera vez]
                   → [ListSyncService si menú aprobado]
                   → FIN
```

### SubstitutionCounter lifecycle

```
[No existe] → primera sustitución de la semana → count=1, regenerationSuggested=false
           → ... sustituciones ...
           → count=5 → regenerationSuggested=true, mostrar sugerencia
           → usuario sigue sustituyendo → count sigue incrementando (sin bloqueo)
```

### MenuHistory lifecycle

```
[No existe] → primera sustitución de la semana → snapshot PlannedMeal[] actual → creado
           → ajustes posteriores → MenuHistory NO se modifica (inmutable)
           → para ver "versión actual" se leen PlannedMeal[] live
```

## Indexes

| Tabla | Index | Tipo | Propósito |
|-------|-------|------|-----------|
| MealAdjustment | weekId | Simple | Listar ajustes de una semana |
| MealAdjustment | mealId | Simple | Historial de cambios de una comida |
| SubstitutionSignal | familyId + timestamp | Compound | Queries de aprendizaje futuro por familia |
| SubstitutionSignal | weekId | Simple | Señales de una semana específica |
| MenuHistory | weekId | Unique | Lookup directo por semana |
| SubstitutionCounter | weekId | Unique | Lookup directo por semana |

## Sync Strategy

- **Pull**: Al abrir app o reconectar, sync desde Supabase → WatermelonDB local
- **Push**: Cambios locales se encolan y envían cuando hay conexión
- **Conflict resolution**:
  - Platos distintos del mismo menú: merge automático sin conflicto (NFR-003)
  - Mismo plato sustituido por dos usuarios: last-write-wins basado en timestamp + notificación al otro usuario (NFR-004)
  - MealAdjustment, SubstitutionSignal, MenuHistory: append-only, sin conflictos
  - SubstitutionCounter: last-write-wins (basado en count más alto)
- **Campos sync**: `createdAt`, `updatedAt`, `_syncStatus` (synced/created/updated/deleted)

## JSON Schema Details

### validationResult (MealAdjustment)

```json
{
  "passed": true,
  "warnings": [
    {
      "type": "preference",
      "message": "i18n.key.preference_conflict",
      "severity": "info"
    },
    {
      "type": "nutritional",
      "message": "i18n.key.higher_calories",
      "severity": "info"
    }
  ]
}
```

### originalMeals (MenuHistory)

```json
[
  {
    "id": "uuid-meal-1",
    "recipeId": "uuid-recipe-1",
    "mealType": "almuerzo",
    "day": "lunes",
    "memberIds": ["uuid-member-1", "uuid-member-2"]
  },
  {
    "id": "uuid-meal-2",
    "recipeId": "uuid-recipe-2",
    "mealType": "cena",
    "day": "lunes",
    "memberIds": ["uuid-member-1"]
  }
]
```
