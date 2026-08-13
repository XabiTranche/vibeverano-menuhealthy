# Contract: TagService (TagInferenceService + GoalTagService)

**Module**: 005-catalogo-recetas-alimentos-valores-nutricionales
**Type**: Internal service interface

## Interface

```typescript
interface TagService {
  // Inferencia de etiquetas de compatibilidad
  inferCompatibilityTags(recipeId: string): Promise<InferredTag[]>;

  // Sugerencia de etiquetas de objetivo
  suggestGoalTags(recipeId: string): Promise<SuggestedTag[]>;

  // Actualización manual de etiquetas
  updateCompatibilityTags(recipeId: string, tags: TagUpdate[]): Promise<CompatibilityTag[]>;
  updateGoalTags(recipeId: string, tags: TagUpdate[]): Promise<GoalTag[]>;

  // Consulta de etiquetas
  getCompatibilityTags(recipeId: string): Promise<CompatibilityTag[]>;
  getGoalTags(recipeId: string): Promise<GoalTag[]>;

  // Detección de inconsistencias
  detectInconsistencies(recipeId: string): Promise<Inconsistency[]>;
}

// --- Types ---

type TagOrigin = 'inferred' | 'manual';
type GoalOrigin = 'suggested' | 'manual';

interface CompatibilityTag {
  id: string;
  recipeId: string;
  restrictionType: string;    // ej: "sin_gluten", "vegetariano"
  origin: TagOrigin;
  createdAt: Date;
}

interface GoalTag {
  id: string;
  recipeId: string;
  goalType: string;           // ej: "alta_en_proteina", "baja_en_calorias"
  origin: GoalOrigin;
  createdAt: Date;
}

interface InferredTag {
  restrictionType: string;
  compatible: boolean;        // true = receta ES compatible con esta restricción
  reason: string;             // explicación (ej: "No contiene ingredientes con gluten")
  triggerIngredients: string[]; // ingredientes que causan incompatibilidad (vacío si compatible)
}

interface SuggestedTag {
  goalType: string;
  applicable: boolean;        // true = receta cumple criterio para este objetivo
  reason: string;             // explicación (ej: "45g proteína/ración > umbral 30g")
  value: number;              // valor que dispara la sugerencia
  threshold: number;          // umbral configurado
}

interface TagUpdate {
  type: string;               // restrictionType o goalType
  action: 'add' | 'remove';  // añadir o quitar tag
}

interface Inconsistency {
  restrictionType: string;
  message: string;            // descripción del conflicto
  manualTag: CompatibilityTag;  // tag manual que contradice inferencia
  conflictingIngredients: string[]; // ingredientes que causan conflicto
}
```

## Behavior Rules

### inferCompatibilityTags

- Lee los ingredientes de la receta (RecipeIngredient → MasterIngredient)
- Evalúa `allergenFlags` de cada ingrediente contra reglas predefinidas:
  - Si algún ingrediente tiene flag "gluten" → receta NO es compatible con "sin_gluten"
  - Si algún ingrediente tiene flag "lactosa" → receta NO es compatible con "sin_lactosa"
  - Si algún ingrediente tiene flag "carne" o "pescado" → receta NO es compatible con "vegetariano"
  - Si algún ingrediente tiene flag "animal" → receta NO es compatible con "vegano"
- Retorna lista completa de restricciones evaluadas con resultado compatible/incompatible
- Se ejecuta automáticamente al crear/editar receta (disparado por RecipeService)
- Persiste tags con origin="inferred" (reemplaza inferidos anteriores, no toca manuales)

### suggestGoalTags

- Lee `nutritionalTotal` de la receta (por ración: nutritionalTotal / servings)
- Evalúa contra umbrales:
  - protein > 30g/ración → sugiere "alta_en_proteina"
  - kcal < 300/ración → sugiere "baja_en_calorias"
  - fat < 10g/ración → sugiere "baja_en_grasas"
- Si nutritionalTotal es null/incompleto → no sugiere (retorna array vacío)
- Retorna sugerencias con origin="suggested" — NO persiste automáticamente
- El usuario debe aceptar/rechazar explícitamente (via updateGoalTags)

### updateCompatibilityTags / updateGoalTags

- Permite al usuario añadir o quitar tags manualmente
- Tags añadidos manualmente: origin="manual"
- Tags inferidos/sugeridos eliminados manualmente: se borran
- Valida que `type` sea de la lista predefinida

### detectInconsistencies

- Compara tags manuales con inferencia automática
- Detecta: tag manual "sin_gluten" pero ingredientes contienen gluten → inconsistencia
- Retorna lista de conflictos con explicación clara
- Se ejecuta al guardar y muestra avisos al usuario (no bloquea guardado)

### Reglas generales

- Todas las operaciones funcionan offline
- Las reglas de inferencia se implementan como funciones puras en `utils/tag-rules.ts`
- Los umbrales de goal tags son configurables (constantes en código, no BD)
- La inferencia es determinista: mismos ingredientes → mismos tags siempre
