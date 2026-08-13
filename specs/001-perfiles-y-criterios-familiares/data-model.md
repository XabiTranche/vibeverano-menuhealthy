# Data Model: Perfiles familiares y criterios alimentarios

**Feature**: 001-perfiles-y-criterios-familiares
**Date**: 2026-08-10

## Entity Relationship Diagram (textual)

```
Family (1) ──── (N) FamilyMember
FamilyMember (1) ──── (N) DietaryRestriction
FamilyMember (1) ──── (N) FoodPreference
FamilyMember (1) ──── (N) NutritionalGoal
```

## Entities

### Family (Unidad Familiar)

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| id | UUID | Sí | Identificador único |
| name | string | Sí | Nombre del hogar |
| ownerId | UUID | Sí | ID del usuario responsable principal |
| createdAt | DateTime | Sí | Fecha de creación |
| updatedAt | DateTime | Sí | Última modificación |
| activeMealTypes | MealType[] | Sí | Momentos de comida activos para planificación. Default: ['breakfast', 'lunch', 'dinner', 'snack'] |

**Validaciones**:
- `name`: no vacío, máx 100 caracteres
- `ownerId`: debe ser un usuario autenticado válido
- `activeMealTypes`: al menos 1 momento activo, valores válidos del enum MealType

**Estado**: Siempre activa (no se contempla archivado de familias en MVP)

---

### FamilyMember (Miembro Familiar)

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| id | UUID | Sí | Identificador único |
| familyId | UUID (FK) | Sí | Referencia a Family |
| name | string | Sí | Nombre o rol del miembro |
| age | integer | Sí | Edad en años |
| sex | enum (male/female/other) | Sí | Sexo biológico |
| archivedAt | DateTime? | No | Null = activo; fecha = archivado |
| createdAt | DateTime | Sí | Fecha de creación |
| updatedAt | DateTime | Sí | Última modificación |

**Validaciones**:
- `name`: no vacío, máx 50 caracteres
- `age`: 0-120
- `sex`: uno de los valores enum
- Datos mínimos para readiness: name + age + sex + al menos una revisión de restricciones

**Soft delete**: `archivedAt` ≠ null indica miembro archivado. No aparece en planificación.

---

### DietaryRestriction (Restricción Alimentaria)

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| id | UUID | Sí | Identificador único |
| memberId | UUID (FK) | Sí | Referencia a FamilyMember |
| category | enum | Sí | Tipo: allergy, intolerance, ethical_religious, preference |
| name | string | Sí | Nombre de la restricción (ej: "gluten", "lactosa", "cerdo") |
| severity | enum | Sí | mandatory (obligatoria) / desirable (deseable) |
| notes | string? | No | Observaciones adicionales |
| createdAt | DateTime | Sí | Fecha de creación |

**Validaciones**:
- `category`: uno de los 4 valores enum
- `severity`: allergy e intolerance siempre son mandatory; ethical_religious siempre mandatory; preference siempre desirable
- `name`: no vacío, máx 100 caracteres
- No se permiten duplicados exactos (mismo member + mismo name + misma category)

**Regla de inferencia**: El sistema asigna `severity` automáticamente según `category`:
- allergy → mandatory
- intolerance → mandatory
- ethical_religious → mandatory
- preference → desirable

---

### FoodPreference (Preferencia Alimentaria)

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| id | UUID | Sí | Identificador único |
| memberId | UUID (FK) | Sí | Referencia a FamilyMember |
| foodItem | string | Sí | Alimento o categoría (ej: "pescado", "brócoli") |
| type | enum | Sí | liked (gusta) / disliked (rechazado) |
| intensity | enum | No | mild / strong (default: mild) |
| createdAt | DateTime | Sí | Fecha de creación |

**Validaciones**:
- `foodItem`: no vacío, máx 100 caracteres
- `type`: liked o disliked
- No se permiten duplicados exactos (mismo member + mismo foodItem)

**Coherencia**: Si existe DietaryRestriction(category=allergy, name=X) y se intenta crear FoodPreference(foodItem=X, type=liked), el sistema advierte de la incoherencia pero prioriza la restricción.

---

### NutritionalGoal (Objetivo Nutricional)

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| id | UUID | Sí | Identificador único |
| memberId | UUID (FK) | Sí | Referencia a FamilyMember |
| goalType | enum | Sí | lose_weight / maintain / gain_muscle |
| priority | integer | No | Prioridad relativa (1 = máxima). Default: 1 |
| isActive | boolean | Sí | Si el objetivo está activo actualmente |
| createdAt | DateTime | Sí | Fecha de creación |
| updatedAt | DateTime | Sí | Última modificación |

**Validaciones**:
- `goalType`: uno de los 3 valores
- Un miembro puede tener varios objetivos (ej: perder peso + ganar músculo no es coherente → se detecta como conflicto informativo)
- `priority`: 1-10

**Regla de coherencia**: Si `lose_weight` y `gain_muscle` coexisten para el mismo miembro → warning (no bloqueo).

---

## State Transitions

### FamilyMember lifecycle

```
[Creado] → activo (archivedAt = null)
         ↓
[Archivado] → archivedAt = now()
         ↓
[Reactivado] → archivedAt = null (se puede deshacer)
```

### Readiness Check (computed, no persisted)

```
[Incompleto] → falta algún dato mínimo en algún miembro activo
            ↓ (todos los miembros activos tienen name + age + sex + restricciones revisadas)
[Listo para planificar]
```

## Indexes

| Tabla | Index | Tipo | Propósito |
|-------|-------|------|-----------|
| FamilyMember | familyId + archivedAt | Compound | Listar miembros activos del hogar |
| DietaryRestriction | memberId + severity | Compound | Filtrar restricciones obligatorias |
| FoodPreference | memberId + type | Compound | Filtrar gustos vs rechazos |
| NutritionalGoal | memberId + isActive | Compound | Objetivos activos de un miembro |

## Sync Strategy

- **Pull**: Al abrir app o reconectar, sync desde Supabase → SQLite local
- **Push**: Cambios locales se encolan y envían cuando hay conexión
- **Conflict resolution**: Last-write-wins por registro (timestamp-based)
- **Campos sync**: `createdAt`, `updatedAt`, `_syncStatus` (synced/created/updated/deleted)
