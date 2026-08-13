# Contract: PlanGeneratorService

**Spec**: [../spec.md](../spec.md) | **Plan**: [../plan.md](../plan.md) | **Research**: [../research.md](../research.md)

## Responsabilidad

Motor principal de generación de propuestas de menú semanal. Orquesta el pipeline de constraint satisfaction: filtrado de recetas por restricciones, tipo de comida, complejidad, preferencias y repetición. Ejecuta preferentemente en backend (Supabase Edge Function) con fallback a generación local offline.

## Interface

```typescript
interface PlanGeneratorService {
  /**
   * Genera una propuesta de menú para una familia y rango de fechas.
   * 
   * Flujo:
   * 1. Intenta generación via backend (Supabase Edge Function)
   * 2. Si falla (sin conexión, timeout): ejecuta motor local
   * 3. Retorna propuesta con source indicado
   * 
   * @throws InsufficientCriteriaError - Si la familia no tiene criterios mínimos
   * @throws InsufficientRecipesError - Si el catálogo no cubre los días solicitados
   */
  generateProposal(
    familyId: string,
    dateRange: DateRange,
    options?: GenerationOptions
  ): Promise<MenuProposal>;
}

interface DateRange {
  startDate: string;  // ISO 8601 date (YYYY-MM-DD)
  endDate: string;    // ISO 8601 date (YYYY-MM-DD)
}

interface GenerationOptions {
  /** Forzar generación offline (bypass del backend) */
  forceOffline?: boolean;
}
```

## Tipos de retorno

```typescript
interface MenuProposal {
  id: string;
  weekId: string;
  meals: PlannedMeal[];
  criteriaSnapshot: CriteriaSnapshot;
  generatedAt: string;          // ISO 8601 datetime
  generationSource: 'backend' | 'offline';
  complexityApplied: ComplexityApplied | null;
  explanation: MealExplanation;
}

interface PlannedMeal {
  id: string;
  proposalId: string;
  day: string;                  // ISO 8601 date
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  recipeId: string;
  status: 'planned' | 'out_of_house';
  variants: MealVariant[];
}

interface MealVariant {
  memberId: string;
  recipeId: string;
  reason: string;
}

interface ComplexityApplied {
  weekdayLevel: 'quick' | 'medium' | 'elaborate';
  weekendLevel: 'quick' | 'medium' | 'elaborate';
}
```

## Errores

```typescript
class InsufficientCriteriaError extends Error {
  missingFields: string[];  // Campos que faltan para generar
}

class InsufficientRecipesError extends Error {
  coveredDays: number;      // Días que sí se pudieron cubrir
  totalDays: number;        // Días solicitados
  partialProposal?: MenuProposal;  // Propuesta parcial si hay algo
}
```

## Pipeline interno

```typescript
// Pasos internos del motor de generación (no expuestos en la interface pública)

/** 1. Obtener criterios activos de la familia */
function fetchCriteria(familyId: string): Promise<CriteriaSnapshot>;

/** 2. Filtrar recetas por restricciones obligatorias */
function filterRecipes(
  allRecipes: FamilyRecipe[],
  restrictions: Restriction[]
): FamilyRecipe[];

/** 3. Aplicar filtro de complejidad según día */
function applyComplexity(
  recipes: FamilyRecipe[],
  dayType: 'weekday' | 'weekend',
  config: ComplexityConfig
): FamilyRecipe[];

/** 4. Evitar repetición en lunch/dinner */
function avoidRepetition(
  recipes: FamilyRecipe[],
  usedRecipes: RepetitionTracker,
  mealType: MealType
): FamilyRecipe[];

/** 5. Priorizar por preferencias y objetivos */
function prioritize(
  recipes: FamilyRecipe[],
  preferences: Preference[],
  goals: Goal[]
): ScoredRecipe[];

/** 6. Construir estructura semanal */
function buildWeekStructure(
  selectedRecipes: Map<string, ScoredRecipe[]>,
  dateRange: DateRange
): PlannedMeal[];

/** 7. Generar explicación de encaje */
function generateExplanation(
  proposal: MenuProposal,
  criteria: CriteriaSnapshot
): MealExplanation;
```

## Comportamiento por escenario

| Escenario | Comportamiento |
|-----------|---------------|
| Conexión OK | Genera via backend, retorna `source: 'backend'` |
| Sin conexión | Fallback local, retorna `source: 'offline'` |
| `forceOffline: true` | Siempre local, sin intentar backend |
| Criterios insuficientes | Throw `InsufficientCriteriaError` |
| Pocas recetas | Genera propuesta parcial + throw `InsufficientRecipesError` con propuesta parcial |
| Filtro complejidad vacía pool | Relaja un nivel, documenta en explicación |
| Restricciones muy limitantes | Genera con compromisos, documenta en explicación |

## Dependencias

- **CriteriaService** (spec 001): obtener restricciones, preferencias, objetivos
- **RecipeCatalogService** (spec 005): obtener recetas con metadatos
- **ComplexityService**: obtener y aplicar configuración de complejidad
- **NetworkService**: detectar conectividad para decidir backend vs local
- **WatermelonDB**: acceso a recetas cacheadas para modo offline
