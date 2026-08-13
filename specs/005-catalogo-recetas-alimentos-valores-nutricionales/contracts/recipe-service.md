# Contract: RecipeService

**Module**: 005-catalogo-recetas-alimentos-valores-nutricionales
**Type**: Internal service interface

## Interface

```typescript
interface RecipeService {
  // CRUD Recetas familiares
  createRecipe(familyId: string, input: CreateRecipeInput): Promise<FamilyRecipe>;
  updateRecipe(recipeId: string, input: UpdateRecipeInput): Promise<FamilyRecipe>;
  deleteRecipe(recipeId: string): Promise<DeleteResult>;
  getRecipe(recipeId: string): Promise<FamilyRecipe | null>;

  // Búsqueda y filtrado
  searchRecipes(familyId: string, query: SearchQuery): Promise<FamilyRecipe[]>;
  getByMealType(familyId: string, mealType: MealType): Promise<FamilyRecipe[]>;

  // Catálogo base
  copyFromBase(familyId: string, baseRecipeId: string): Promise<FamilyRecipe>;
  getBaseCatalog(): Promise<BaseCatalogRecipe[]>;
  getBaseCatalogByMealType(mealType: MealType): Promise<BaseCatalogRecipe[]>;
}

// --- Types ---

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

type SourceType = 'own' | 'copied_from_base';

interface NutritionalInfo {
  kcal: number;
  carbs: number;
  fat: number;
  protein: number;
}

interface IngredientInput {
  ingredientId: string;  // FK → MasterIngredient
  quantity: number;
  unit: string;
  nutritionalForQuantity?: NutritionalInfo;
}

interface CreateRecipeInput {
  name: string;
  mealType: MealType;
  servings: number;
  ingredients: IngredientInput[];          // ≥1 ingrediente obligatorio
  nutritionalTotal?: NutritionalInfo;      // manual, opcional
}

interface UpdateRecipeInput {
  name?: string;
  mealType?: MealType;
  servings?: number;
  ingredients?: IngredientInput[];
  nutritionalTotal?: NutritionalInfo;
}

interface SearchQuery {
  text?: string;                           // búsqueda por nombre (Q.like)
  ingredientId?: string;                   // filtrar por ingrediente
  compatibilityTag?: string;               // filtrar por restricción (ej: "sin_gluten")
  goalTag?: string;                        // filtrar por objetivo (ej: "alta_en_proteina")
  mealType?: MealType;                     // filtrar por tipo de comida
}

interface DeleteResult {
  success: boolean;
  blocked: boolean;
  reason?: string;                         // motivo de bloqueo si blocked=true
  affectedPlans?: string[];                // IDs de planes activos que usan la receta
}
```

## Behavior Rules

- `createRecipe`: Valida campos obligatorios (name, ≥1 ingrediente). Dispara TagInferenceService después de crear. Asocia a familyId. sourceType=own.
- `updateRecipe`: Valida igual que create. Re-dispara TagInferenceService si cambian ingredientes o nutritionalTotal. Si receta está en plan activo, retorna warning (no bloquea edición).
- `deleteRecipe`: Consulta ProtectionService antes de eliminar. Si está en plan activo → blocked=true, no elimina. Si no → elimina tras confirmación (cascade: RecipeIngredient, CompatibilityTag, GoalTag).
- `getRecipe`: Retorna receta con ingredientes, tags y computed `inActivePlan`.
- `searchRecipes`: Aplica filtros combinados con AND. Texto busca en `name` con Q.like. Resultados ordenados por updatedAt desc.
- `getByMealType`: Shortcut para listar recetas de un tipo. Retorna solo recetas del familyId indicado.
- `copyFromBase`: Crea FamilyRecipe con sourceType=copied_from_base y baseRecipeId. Copia ingredientes y tags. La copia es editable independientemente.
- Todas las operaciones funcionan offline (WatermelonDB local).
