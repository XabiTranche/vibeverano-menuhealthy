# Contract: HistoryService

**Module**: 004-ajustes-sustituciones-y-seguimiento
**Type**: Internal service interface

## Interface

```typescript
interface HistoryService {
  /**
   * Retorna el MenuHistory de una semana (snapshot original + metadata).
   * Retorna null si la semana no tiene ajustes (no se creó snapshot).
   */
  getMenuHistory(weekId: string): Promise<MenuHistory | null>;

  /**
   * Retorna las comidas originales (snapshot) de una semana.
   * Retorna array vacío si no existe historial.
   */
  getOriginalMeals(weekId: string): Promise<PlannedMeal[]>;

  /**
   * Retorna las comidas actuales (estado live) de una semana.
   * Equivale a leer PlannedMeal[] directamente, pero expuesto aquí para
   * facilitar comparación side-by-side con getOriginalMeals().
   */
  getCurrentMeals(weekId: string): Promise<PlannedMeal[]>;

  /**
   * Indica si una semana ha sido modificada (tiene al menos un ajuste).
   * Equivale a verificar si existe MenuHistory para ese weekId.
   */
  hasBeenModified(weekId: string): Promise<boolean>;

  /**
   * Crea el snapshot del menú original (solo si no existe ya para esa semana).
   * Llamado internamente por SubstitutionService en la primera sustitución.
   * Idempotente: si ya existe snapshot, no hace nada.
   */
  createSnapshot(weekId: string): Promise<MenuHistory>;
}

// --- Types ---

interface MenuHistory {
  id: string;
  weekId: string;
  originalMeals: PlannedMealSnapshot[];
  snapshotCreatedAt: Date;
}

interface PlannedMealSnapshot {
  id: string;
  recipeId: string;
  mealType: 'desayuno' | 'almuerzo' | 'merienda' | 'cena';
  day: 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';
  memberIds: string[];
}

/**
 * PlannedMeal es la entidad live de spec 002.
 * Se re-exporta aquí para tipado de getCurrentMeals().
 */
interface PlannedMeal {
  id: string;
  weekId: string;
  recipeId: string;
  mealType: 'desayuno' | 'almuerzo' | 'merienda' | 'cena';
  day: 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';
  memberIds: string[];
  updatedAt: Date;
}
```

## Behavior Rules

- `getMenuHistory`:
  - Query por weekId (UNIQUE index)
  - Retorna null si la semana nunca tuvo sustituciones
  - Incluye el snapshot deserializado de originalMeals

- `getOriginalMeals`:
  - Atajo: `getMenuHistory(weekId)?.originalMeals ?? []`
  - El snapshot es inmutable; siempre retorna el mismo estado original

- `getCurrentMeals`:
  - Lee PlannedMeal[] live del weekId (spec 002 repository)
  - Refleja todos los ajustes aplicados hasta el momento
  - Útil para comparación side-by-side con getOriginalMeals

- `hasBeenModified`:
  - `return (await getMenuHistory(weekId)) !== null`
  - Rápido: usa el UNIQUE index sobre weekId

- `createSnapshot`:
  - Lee PlannedMeal[] actual del weekId
  - Serializa a JSON (PlannedMealSnapshot[])
  - Crea MenuHistory con originalMeals = snapshot
  - **Idempotente**: si ya existe MenuHistory para el weekId, retorna el existente sin modificar
  - Llamado por SubstitutionService antes de aplicar la primera sustitución

## Error Handling

- `weekId` no corresponde a un WeeklyMenu existente → throw `WeekNotFoundError`
- `createSnapshot` con weekId ya existente → retorna MenuHistory existente (no error, idempotente)

## Usage from SubstitutionService

```typescript
// En SubstitutionService.applySubstitution():
async applySubstitution(mealId, newRecipeId, reason?) {
  const meal = await this.getMeal(mealId);
  
  // Crear snapshot si es la primera sustitución de la semana
  await this.historyService.createSnapshot(meal.weekId);
  
  // Aplicar el cambio al PlannedMeal...
  // ...
}
```

## UI Usage (AdjustmentHistory screen)

```typescript
// En pantalla de historial:
const history = await historyService.getMenuHistory(weekId);
if (history) {
  const original = history.originalMeals;
  const current = await historyService.getCurrentMeals(weekId);
  // Renderizar comparación side-by-side
}
```
