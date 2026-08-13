# Contract: IngredientService

**Module**: 005-catalogo-recetas-alimentos-valores-nutricionales
**Type**: Internal service interface

## Interface

```typescript
interface IngredientService {
  // Búsqueda de ingredientes
  searchIngredients(query: string): Promise<MasterIngredient[]>;

  // Acceso por ID
  getById(ingredientId: string): Promise<MasterIngredient | null>;

  // Filtrado por categoría
  getByCategory(category: IngredientCategory): Promise<MasterIngredient[]>;

  // Listar categorías disponibles
  getAllCategories(): Promise<CategoryInfo[]>;
}

// --- Types ---

type IngredientCategory =
  | 'fruits_vegetables'   // Frutas y verduras
  | 'meats'               // Carnes y pescados
  | 'dairy'               // Lácteos
  | 'cereals'             // Cereales y legumbres
  | 'other';              // Otros (aceites, especias, condimentos)

interface NutritionalInfo {
  kcal: number;
  carbs: number;
  fat: number;
  protein: number;
}

interface MasterIngredient {
  id: string;
  canonicalName: string;
  synonyms: string[];
  category: IngredientCategory;
  nutritionalPer100g: NutritionalInfo | null;
  allergenFlags: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface CategoryInfo {
  category: IngredientCategory;
  label: string;           // nombre localizado (i18n)
  count: number;           // número de ingredientes en esta categoría
}
```

## Behavior Rules

- `searchIngredients`: Busca en `canonicalName` y `synonyms` usando Q.like. Case-insensitive. Retorna máx 20 resultados ordenados por relevancia (exact match primero, luego parciales).
- `getById`: Retorna ingrediente completo o null si no existe.
- `getByCategory`: Retorna todos los ingredientes de una categoría, ordenados alfabéticamente por canonicalName.
- `getAllCategories`: Retorna las 5 categorías con su label localizado (via i18n) y count de ingredientes.
- El catálogo maestro es read-only para el usuario. No hay operaciones de escritura en esta interface.
- Todas las operaciones funcionan offline (datos seeded en WatermelonDB local).
- La búsqueda incluye sinónimos: buscar "jitomate" retorna "tomate" (canonicalName).
- Alineado con spec 003: las categorías son las mismas que usa la lista de la compra para agrupar.
