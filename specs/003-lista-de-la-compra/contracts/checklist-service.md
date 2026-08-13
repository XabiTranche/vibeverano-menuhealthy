# Contract: ChecklistService

**Module**: 003-lista-de-la-compra
**Type**: Internal service interface

## Interface

```typescript
interface ChecklistService {
  /**
   * Marca un item como comprado.
   * Actualiza lastModifiedBy y lastModifiedAt.
   * Puede actualizar el status de la ShoppingList a in_use.
   *
   * @throws ItemNotFoundError si no existe
   * @throws ItemAlreadyInStatusError si ya está en status bought
   */
  markAsBought(itemId: string): Promise<ShoppingItem>;

  /**
   * Marca un item como disponible en casa ("ya lo tengo").
   * El item se mueve a sección "Cubierto" pero permanece en la lista.
   * Puede actualizar el status de la ShoppingList a adjusted.
   *
   * @throws ItemNotFoundError si no existe
   * @throws ItemAlreadyInStatusError si ya está en status available_at_home
   */
  markAsAvailableAtHome(itemId: string): Promise<ShoppingItem>;

  /**
   * Revierte un item a estado pending.
   * Permite deshacer tanto bought como available_at_home.
   *
   * @throws ItemNotFoundError si no existe
   * @throws ItemAlreadyInStatusError si ya está en status pending
   */
  unmarkItem(itemId: string): Promise<ShoppingItem>;

  /**
   * Obtiene todos los items pendientes de una lista.
   * Ordenados por categoría.
   */
  getPendingItems(listId: string): Promise<ShoppingItem[]>;

  /**
   * Obtiene todos los items comprados de una lista.
   */
  getBoughtItems(listId: string): Promise<ShoppingItem[]>;

  /**
   * Obtiene todos los items marcados como disponibles en casa.
   */
  getAvailableItems(listId: string): Promise<ShoppingItem[]>;

  /**
   * Obtiene el progreso de compra de una lista.
   * Útil para mostrar barra de progreso.
   */
  getProgress(listId: string): Promise<ChecklistProgress>;
}
```

## Types

```typescript
interface ChecklistProgress {
  total: number;
  pending: number;
  bought: number;
  available: number;
}

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
class ItemNotFoundError extends Error {
  constructor(itemId: string) {
    super(`Shopping item not found: ${itemId}`);
  }
}

class ItemAlreadyInStatusError extends Error {
  constructor(itemId: string, currentStatus: ShoppingItemStatus) {
    super(`Item ${itemId} is already in status: ${currentStatus}`);
  }
}
```

## Behavior Rules

- `markAsBought`:
  - Cambia status de `pending` o `available_at_home` → `bought`
  - Registra userId en `lastModifiedBy` y now() en `lastModifiedAt`
  - Si es el primer item bought de la lista → actualiza ShoppingList.status a `in_use`
  - Sync inmediato via Supabase Realtime (otros miembros ven el cambio)

- `markAsAvailableAtHome`:
  - Cambia status de `pending` → `available_at_home`
  - Registra userId y timestamp
  - Si la lista estaba en `generated` → actualiza a `adjusted`
  - Items available no se eliminan — permanecen visibles en sección "Cubierto"

- `unmarkItem`:
  - Revierte cualquier status → `pending`
  - Permite deshacer errores (toqué sin querer, cambié de opinión)
  - Registra userId y timestamp
  - Nota: si todos los items vuelven a pending y la lista estaba in_use, no se revierte el status de la lista

- `getPendingItems`: Filtra por status=pending, ordena por category (fruits_vegetables → meats → dairy → cereals → other)

- `getBoughtItems`: Filtra por status=bought, sin orden específico

- `getAvailableItems`: Filtra por status=available_at_home, sin orden específico

- `getProgress`: Count de items por status. Cálculo local, sin round-trip.

- Todas las operaciones funcionan offline (WatermelonDB local). Sync posterior al reconectar.

- **Collaborative behavior**: Cada item es independiente. Cuando un miembro marca un item, el cambio se propaga via Supabase Realtime a otros miembros con la lista abierta. No hay conflictos posibles a nivel de item (cada miembro tacha items distintos en uso normal). En el caso edge de misma acción sobre mismo item → last-write-wins por timestamp.
