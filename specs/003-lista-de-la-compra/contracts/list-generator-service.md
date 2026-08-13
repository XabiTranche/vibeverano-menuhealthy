# Contract: ListGeneratorService

**Module**: 003-lista-de-la-compra
**Type**: Internal service interface

## Interface

```typescript
interface ListGeneratorService {
  /**
   * Genera una lista de la compra a partir del menú aprobado de una semana.
   * Recorre PlannedMeal → RecipeIngredient → MasterIngredient,
   * consolida ingredientes y crea ShoppingList + ShoppingItems.
   *
   * @throws MenuNotApprovedError si la semana no tiene menú aprobado
   * @throws ListAlreadyExistsError si ya existe lista para esa familia+semana
   */
  generateList(familyId: string, weekId: string): Promise<ShoppingList>;

  /**
   * Regenera la lista tras un cambio de menú.
   * Preserva items con status bought/available_at_home.
   * Solo recalcula items pending.
   * Retorna la lista actualizada con diff info.
   *
   * @throws ListNotFoundError si no existe lista con ese id
   */
  regenerateList(listId: string): Promise<ShoppingList>;

  /**
   * Obtiene una lista por su ID.
   *
   * @throws ListNotFoundError si no existe
   */
  getList(listId: string): Promise<ShoppingList>;

  /**
   * Obtiene la lista activa para una familia+semana.
   * Retorna null si no se ha generado lista para esa semana.
   */
  getListForWeek(familyId: string, weekId: string): Promise<ShoppingList | null>;
}
```

## Types

```typescript
interface ShoppingList {
  id: string;
  familyId: string;
  weekId: string;
  menuId: string;
  status: ShoppingListStatus;
  unmappedRecipes: string[];
  items: ShoppingItem[];
  generatedAt: Date;
  updatedAt: Date;
}

type ShoppingListStatus = 'generated' | 'adjusted' | 'in_use' | 'completed';

interface ShoppingItem {
  id: string;
  listId: string;
  ingredientId: string;
  ingredientName: string;
  approximateQuantity: number | null;
  unit: string | null;
  category: ShoppingCategory;
  status: ShoppingItemStatus;
  lastModifiedBy: string | null;
  lastModifiedAt: Date;
}

type ShoppingCategory =
  | 'fruits_vegetables'
  | 'meats'
  | 'dairy'
  | 'cereals'
  | 'other';

type ShoppingItemStatus = 'pending' | 'bought' | 'available_at_home';
```

## Errors

```typescript
class MenuNotApprovedError extends Error {
  constructor(weekId: string) {
    super(`No approved menu found for week ${weekId}`);
  }
}

class ListAlreadyExistsError extends Error {
  constructor(familyId: string, weekId: string) {
    super(`Shopping list already exists for family ${familyId}, week ${weekId}`);
  }
}

class ListNotFoundError extends Error {
  constructor(listId: string) {
    super(`Shopping list not found: ${listId}`);
  }
}
```

## Behavior Rules

- `generateList`:
  - Verifica que existe menú aprobado para la semana (via spec 002 ApprovalService)
  - Verifica que no existe lista previa para esa familia+semana
  - Recorre todas las PlannedMeals del menú aprobado
  - Resuelve ingredientes via RecipeIngredient → MasterIngredient
  - Consolida ingredientes repetidos (suma cantidades por MasterIngredient.id)
  - Recetas sin ingredientes mapeados → se omiten, se registran en unmappedRecipes
  - Crea ShoppingList con status=generated + ShoppingItems con status=pending
  - Funciona offline (usa datos locales de WatermelonDB)

- `regenerateList`:
  - Lee el menú actual aprobado (puede haber cambiado desde la generación original)
  - Regenera el set de ingredientes desde el nuevo menú
  - Preserva items con status `bought` o `available_at_home` (no se tocan)
  - Items `pending` que ya no son necesarios → se eliminan
  - Items nuevos → se añaden como `pending`
  - Items existentes con cantidad cambiada → se actualiza la cantidad
  - Actualiza `ShoppingList.updatedAt` y `menuId` si cambió

- `getList`: Retorna la lista con todos sus items (eager load)

- `getListForWeek`: Query por compound index familyId+weekId. Retorna null si no hay lista.

- Todas las operaciones funcionan offline (se ejecutan sobre WatermelonDB local)
