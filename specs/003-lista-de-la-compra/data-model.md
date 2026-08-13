# Data Model: Lista de la compra automática desde el menú semanal

**Feature**: 003-lista-de-la-compra
**Date**: 2026-08-10

## Entity Relationship Diagram (textual)

```
Family (1) ──── (N) ShoppingList
PlannedWeek (1) ──── (1) ShoppingList
ShoppingList (1) ──── (N) ShoppingItem
ShoppingItem (N) ──── (1) MasterIngredient (spec 005)
```

## Entities

### ShoppingList (Lista de la compra)

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| id | UUID | Sí | Identificador único |
| familyId | UUID (FK → Family) | Sí | Hogar al que pertenece la lista |
| weekId | UUID (FK → PlannedWeek) | Sí | Semana planificada de origen |
| menuId | UUID (FK → MenuProposal) | Sí | Menú aprobado de origen |
| status | enum | Sí | Estado actual de la lista |
| unmappedRecipes | string[] | No | Nombres de recetas que no pudieron incluirse (sin ingredientes mapeados) |
| generatedAt | DateTime | Sí | Fecha/hora de generación |
| updatedAt | DateTime | Sí | Última modificación |

**Status enum values**:
- `generated`: lista recién generada, sin interacción del usuario
- `adjusted`: usuario ha marcado items como "ya lo tengo"
- `in_use`: usuario está usando la lista en el supermercado (al menos un item bought)
- `completed`: todos los items están bought o available_at_home

**Validaciones**:
- `familyId`: debe existir en Family (spec 001)
- `weekId`: debe existir en PlannedWeek (spec 002) y estar aprobado
- Solo puede existir UNA lista activa por familyId + weekId (unique constraint)
- `unmappedRecipes`: array vacío si todas las recetas tienen ingredientes mapeados

**Lifecycle**:
```
[generated] → usuario marca "ya lo tengo" → [adjusted]
[adjusted] → usuario empieza a comprar → [in_use]
[in_use] → todos los items resueltos → [completed]
[any] → menú cambia → [generated] (regenerada con preservación de estado)
```

---

### ShoppingItem (Línea de compra)

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| id | UUID | Sí | Identificador único |
| listId | UUID (FK → ShoppingList) | Sí | Lista a la que pertenece |
| ingredientId | UUID (FK → MasterIngredient) | Sí | Ingrediente canónico del catálogo |
| ingredientName | string | Sí | Nombre denormalizado para display offline |
| approximateQuantity | number | No | Cantidad aproximada total (suma consolidada) |
| unit | string | No | Unidad de medida (g, ml, unidades, etc.) |
| category | enum | Sí | Categoría de compra |
| status | enum | Sí | Estado del item |
| lastModifiedBy | UUID | No | ID del usuario que realizó último cambio de status |
| lastModifiedAt | DateTime | Sí | Timestamp del último cambio de status |

**Category enum values**:
- `fruits_vegetables`: Frutas y verduras
- `meats`: Carnes y pescados
- `dairy`: Lácteos
- `cereals`: Cereales y legumbres
- `other`: Otros

**Status enum values**:
- `pending`: necesario, no comprado ni disponible
- `bought`: comprado durante la sesión de compra
- `available_at_home`: usuario indica que ya lo tiene en casa

**Validaciones**:
- `ingredientName`: no vacío, denormalizado desde MasterIngredient.name para funcionar offline
- `approximateQuantity`: ≥ 0 o null (null = "sin cantidad especificada")
- `category`: heredado de MasterIngredient.category
- `status`: default `pending` al generar
- No se permiten duplicados de ingredientId dentro de la misma lista (consolidación previa)

**Denormalization rationale**: `ingredientName` y `category` se copian de MasterIngredient al generar la lista para garantizar display correcto offline sin necesidad de JOIN.

---

### IngredientConsolidation (Modelo transitorio — NO se persiste)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| ingredientId | UUID | MasterIngredient.id |
| ingredientName | string | Nombre canónico |
| category | enum | Categoría de compra |
| sourceRecipes | Array<{recipeId, recipeName, quantity, unit}> | Recetas que aportan este ingrediente |
| totalQuantity | number | Suma de cantidades |
| unit | string | Unidad resultante |

**Propósito**: Estructura intermedia durante la generación. Permite trackear de dónde viene cada ingrediente antes de crear los ShoppingItems finales. Se usa para:
1. Debugging: saber qué recetas contribuyeron a cada línea
2. Diff: al regenerar, poder informar al usuario qué cambió
3. No se almacena en BD — se calcula en memoria durante `generateList()`

---

## State Transitions

### ShoppingList lifecycle

```
[generated] → markAsAvailableAtHome() en algún item → [adjusted]
[generated] → markAsBought() en algún item → [in_use]
[adjusted] → markAsBought() en algún item → [in_use]
[in_use] → all items resolved → [completed]
[any] → menu changes → regenerate → [generated] (preserving bought/available)
```

### ShoppingItem lifecycle

```
[pending] → markAsBought() → [bought]
[pending] → markAsAvailableAtHome() → [available_at_home]
[bought] → unmarkItem() → [pending]
[available_at_home] → unmarkItem() → [pending]
```

## Indexes

| Tabla | Index | Tipo | Propósito |
|-------|-------|------|-----------|
| ShoppingList | familyId + weekId | Compound (Unique) | Una lista por familia+semana |
| ShoppingItem | listId + category | Compound | Listar items agrupados por categoría |
| ShoppingItem | listId + status | Compound | Filtrar items por estado (pending/bought/available) |

## Sync Strategy

- **Granularity**: Per-item sync. Cada ShoppingItem se sincroniza independientemente.
- **Realtime**: Supabase Realtime subscription en tabla `shopping_items` filtrado por `listId`
- **Conflict resolution**: Last-write-wins por item (basado en `lastModifiedAt`)
- **No conflicts possible**: En uso normal, cada miembro tacha items diferentes. Si dos modifican el mismo item → LWW es aceptable (el resultado final converge rápidamente).
- **Offline**: Cambios se encolan localmente. Al reconectar, push pendientes + pull updates.
- **Campos sync**: `lastModifiedAt`, `lastModifiedBy`, `_syncStatus` (synced/created/updated)

## Relationships with Other Specs

| Spec | Entidad | Relación |
|------|---------|----------|
| 001 | Family | ShoppingList.familyId → Family.id |
| 002 | PlannedWeek | ShoppingList.weekId → PlannedWeek.id |
| 002 | MenuProposal | ShoppingList.menuId → MenuProposal.id |
| 005 | MasterIngredient | ShoppingItem.ingredientId → MasterIngredient.id |
| 005 | RecipeIngredient | Input para generación (no FK directa en modelo final) |
