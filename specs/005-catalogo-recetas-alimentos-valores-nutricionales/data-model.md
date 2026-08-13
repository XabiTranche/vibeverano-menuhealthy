# Data Model: Catálogo de recetas, alimentos y valores nutricionales

**Feature**: 005-catalogo-recetas-alimentos-valores-nutricionales
**Date**: 2026-08-10

## Entity Relationship Diagram (textual)

```
MasterIngredient (1) ──── (N) RecipeIngredient
FamilyRecipe (1) ──── (N) RecipeIngredient
FamilyRecipe (1) ──── (N) CompatibilityTag
FamilyRecipe (1) ──── (N) GoalTag
BaseCatalogRecipe (1) ──── (0..N) FamilyRecipe [sourceType=copied_from_base]
Family (1) ──── (N) FamilyRecipe
```

## Entities

### MasterIngredient (Ingrediente del Catálogo Maestro)

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| id | UUID | Sí | Identificador único |
| canonicalName | string | Sí | Nombre normalizado (ej: "tomate") |
| synonyms | string[] | No | Nombres alternativos (ej: ["jitomate"]) |
| category | enum | Sí | Categoría: fruits_vegetables, meats, dairy, cereals, other |
| nutritionalPer100g | NutritionalInfo | No | Valores nutricionales por 100g |
| allergenFlags | string[] | No | Alérgenos asociados (ej: ["gluten", "lactosa"]) |
| createdAt | DateTime | Sí | Fecha de creación |
| updatedAt | DateTime | Sí | Última modificación |

**Validaciones**:
- `canonicalName`: no vacío, máx 100 caracteres, único en catálogo
- `category`: uno de los 5 valores enum
- `synonyms`: array de strings, máx 10 sinónimos por ingrediente
- `allergenFlags`: array de strings predefinidos

**NutritionalInfo** (type, no entidad separada):
```typescript
interface NutritionalInfo {
  kcal: number;    // kilocalorías
  carbs: number;   // carbohidratos en gramos
  fat: number;     // grasas en gramos
  protein: number; // proteínas en gramos
}
```

**Seed**: ~500 ingredientes precargados desde `seeds/master-ingredients.json`

---

### BaseCatalogRecipe (Receta del Catálogo Base)

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| id | UUID | Sí | Identificador único |
| name | string | Sí | Nombre del plato |
| mealType | enum | Sí | Tipo: breakfast, lunch, dinner, snack |
| ingredients | RecipeIngredientData[] | Sí | Lista de ingredientes con cantidades |
| servings | number | Sí | Número de raciones |
| nutritionalTotal | NutritionalInfo | No | Aporte nutricional total por ración |
| compatibilityTags | string[] | Sí | Etiquetas de compatibilidad precalculadas |
| goalTags | string[] | No | Etiquetas de objetivo precalculadas |
| version | number | Sí | Versión del catálogo base |
| createdAt | DateTime | Sí | Fecha de creación |

**Validaciones**:
- `name`: no vacío, máx 150 caracteres
- `mealType`: uno de los 4 valores enum
- `ingredients`: al menos 1 ingrediente
- `servings`: ≥1
- `version`: entero positivo, incrementa con actualizaciones del catálogo

**Estado**: Read-only. No editable por usuarios. Se actualiza via Supabase sync.

**Seed**: ~50 recetas precargadas desde `seeds/base-recipes.json`

---

### FamilyRecipe (Receta Familiar)

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| id | UUID | Sí | Identificador único |
| familyId | UUID (FK) | Sí | Referencia a Family (spec 001) |
| name | string | Sí | Nombre del plato |
| mealType | enum | Sí | Tipo: breakfast, lunch, dinner, snack |
| servings | number | Sí | Número de raciones |
| nutritionalTotal | NutritionalInfo? | No | Aporte nutricional total por ración (manual) |
| sourceType | enum | Sí | Origen: own, copied_from_base |
| baseRecipeId | UUID (FK)? | No | Referencia a BaseCatalogRecipe (null si sourceType=own) |
| imageUrl | string? | No | URL o path local de la imagen del plato (placeholder de color si null) |
| prepTimeMinutes | number? | No | Tiempo de preparación aproximado en minutos. Deriva nivel de complejidad: <30=quick, 30-60=medium, >60=elaborate |
| inActivePlan | boolean (computed) | No | Si está en una planificación activa (no persistido) |
| createdAt | DateTime | Sí | Fecha de creación |
| updatedAt | DateTime | Sí | Última modificación |

**Validaciones**:
- `name`: no vacío, máx 150 caracteres
- `mealType`: uno de los 4 valores enum
- `servings`: ≥1
- `sourceType`: own o copied_from_base
- `baseRecipeId`: obligatorio si sourceType=copied_from_base, null si sourceType=own
- Debe tener al menos 1 RecipeIngredient asociado para poder guardarse
- `familyId`: debe ser familia existente y activa

**Computed**: `inActivePlan` se calcula on-demand via ProtectionService (no se persiste).

---

### RecipeIngredient (Ingrediente en Receta)

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| id | UUID | Sí | Identificador único |
| recipeId | UUID (FK) | Sí | Referencia a FamilyRecipe |
| ingredientId | UUID (FK) | Sí | Referencia a MasterIngredient |
| quantity | number | Sí | Cantidad numérica |
| unit | string | Sí | Unidad de medida (g, ml, unidades, cucharadas, etc.) |
| nutritionalForQuantity | NutritionalInfo? | No | Valores nutricionales para esta cantidad (manual) |
| createdAt | DateTime | Sí | Fecha de creación |

**Validaciones**:
- `quantity`: >0
- `unit`: no vacío, máx 30 caracteres
- `ingredientId`: debe existir en MasterIngredient
- No se permiten duplicados: mismo recipeId + mismo ingredientId (se actualiza quantity)

---

### CompatibilityTag (Etiqueta de Compatibilidad)

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| id | UUID | Sí | Identificador único |
| recipeId | UUID (FK) | Sí | Referencia a FamilyRecipe |
| restrictionType | string | Sí | Tipo de restricción (ej: "sin_gluten", "sin_lactosa", "vegetariano", "vegano") |
| origin | enum | Sí | Origen: inferred (automático) / manual (usuario) |
| createdAt | DateTime | Sí | Fecha de creación |

**Validaciones**:
- `restrictionType`: no vacío, máx 50 caracteres, de un conjunto predefinido
- `origin`: inferred o manual
- No se permiten duplicados: mismo recipeId + mismo restrictionType

**Tipos predefinidos**:
- `sin_gluten` — Compatible con celíacos
- `sin_lactosa` — Compatible con intolerancia a lactosa
- `sin_frutos_secos` — Compatible con alergia a frutos secos
- `vegetariano` — Sin carne ni pescado
- `vegano` — Sin productos animales
- `sin_huevo` — Compatible con alergia al huevo
- `sin_marisco` — Compatible con alergia a marisco

---

### GoalTag (Etiqueta de Objetivo Nutricional)

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| id | UUID | Sí | Identificador único |
| recipeId | UUID (FK) | Sí | Referencia a FamilyRecipe |
| goalType | string | Sí | Tipo de objetivo (ej: "alta_en_proteina", "baja_en_calorias") |
| origin | enum | Sí | Origen: suggested (sistema) / manual (usuario) |
| createdAt | DateTime | Sí | Fecha de creación |

**Validaciones**:
- `goalType`: no vacío, máx 50 caracteres, de un conjunto predefinido
- `origin`: suggested o manual
- No se permiten duplicados: mismo recipeId + mismo goalType

**Tipos predefinidos**:
- `alta_en_proteina` — >30g proteína/ración
- `baja_en_calorias` — <300 kcal/ración
- `baja_en_grasas` — <10g grasa/ración
- `equilibrada` — valores moderados en todos los macros

---

## State Transitions

### FamilyRecipe lifecycle

```
[Creada] → activa en catálogo familiar
        ↓ (usuario elimina, no en plan activo)
[Eliminada] → borrado real

[Creada] → activa en catálogo familiar
        ↓ (asignada a plan semanal)
[En uso] → no eliminable, editable con notificación
        ↓ (plan semanal finaliza)
[Disponible] → eliminable de nuevo
```

### BaseCatalogRecipe → FamilyRecipe (copy flow)

```
[BaseCatalogRecipe visible] → usuario selecciona "copiar"
                           ↓
[FamilyRecipe creada] → sourceType=copied_from_base, baseRecipeId=original
                      → editable independientemente del original
```

### Tag inference lifecycle

```
[Receta sin tags] → se guardan/editan ingredientes
                  ↓ (TagInferenceService evalúa)
[Tags inferidos] → origin=inferred, visibles al usuario
                 ↓ (usuario ajusta)
[Tags mixtos] → algunos inferred, algunos manual
```

## Indexes

| Tabla | Index | Tipo | Propósito |
|-------|-------|------|-----------|
| FamilyRecipe | familyId + mealType | Compound | Listar recetas por tipo de comida |
| FamilyRecipe | familyId + name | Compound | Búsqueda por nombre |
| RecipeIngredient | recipeId | Simple | Listar ingredientes de una receta |
| RecipeIngredient | ingredientId | Simple | Buscar recetas por ingrediente |
| MasterIngredient | canonicalName | Simple | Búsqueda por nombre de ingrediente |
| MasterIngredient | category | Simple | Filtrar por categoría |
| CompatibilityTag | recipeId | Simple | Tags de compatibilidad de una receta |
| CompatibilityTag | restrictionType | Simple | Filtrar recetas por restricción |
| GoalTag | recipeId | Simple | Tags de objetivo de una receta |
| GoalTag | goalType | Simple | Filtrar recetas por objetivo |

## Sync Strategy

- **Pull**: Al abrir app o reconectar, sync desde Supabase → WatermelonDB local
- **Push**: Cambios locales se encolan y envían cuando hay conexión
- **Conflict resolution**: Last-write-wins por registro (timestamp-based) — misma estrategia que spec 001
- **Campos sync**: `createdAt`, `updatedAt`, `_syncStatus` (synced/created/updated/deleted)
- **Catálogo maestro**: sync unidireccional (server → device). Usuarios no crean ingredientes maestros.
- **Catálogo base**: sync unidireccional (server → device). Read-only en el dispositivo.
- **Recetas familiares + tags**: sync bidireccional entre dispositivos del mismo hogar.
