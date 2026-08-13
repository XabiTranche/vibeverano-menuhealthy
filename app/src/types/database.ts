// ============================================================
// Database Types — Shared across all specs
// Source of truth: specs/*/data-model.md
// ============================================================

// --- Common ---

export interface NutritionalInfo {
  kcal: number;
  carbs: number;
  fat: number;
  protein: number;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

// --- Spec 005: Catálogo de recetas ---

export type IngredientCategory =
  | 'fruits_vegetables'
  | 'meats'
  | 'dairy'
  | 'cereals'
  | 'other';

export interface MasterIngredient {
  id: string;
  canonical_name: string;
  synonyms: string[];
  category: IngredientCategory;
  nutritional_per_100g: NutritionalInfo | null;
  allergen_flags: string[];
  created_at: string;
  updated_at: string;
}

export interface BaseCatalogRecipe {
  id: string;
  name: string;
  meal_type: MealType;
  ingredients: RecipeIngredientData[];
  servings: number;
  nutritional_total: NutritionalInfo | null;
  compatibility_tags: string[];
  goal_tags: string[];
  version: number;
  created_at: string;
}

export interface RecipeIngredientData {
  ingredient_id: string;
  quantity: number;
  unit: string;
  nutritional_for_quantity: NutritionalInfo | null;
}

export type RecipeSourceType = 'own' | 'copied_from_base';

export interface FamilyRecipe {
  id: string;
  family_id: string;
  name: string;
  meal_type: MealType;
  servings: number;
  nutritional_total: NutritionalInfo | null;
  source_type: RecipeSourceType;
  base_recipe_id: string | null;
  image_url: string | null;
  prep_time_minutes: number | null;
  created_at: string;
  updated_at: string;
}

export interface RecipeIngredient {
  id: string;
  recipe_id: string;
  ingredient_id: string;
  quantity: number;
  unit: string;
  nutritional_for_quantity: NutritionalInfo | null;
  created_at: string;
}

export type TagOrigin = 'inferred' | 'manual';
export type GoalTagOrigin = 'suggested' | 'manual';

export interface CompatibilityTag {
  id: string;
  recipe_id: string;
  restriction_type: string;
  origin: TagOrigin;
  created_at: string;
}

export interface GoalTag {
  id: string;
  recipe_id: string;
  goal_type: string;
  origin: GoalTagOrigin;
  created_at: string;
}

// --- Spec 001: Perfiles familiares ---

export interface Family {
  id: string;
  name: string;
  owner_id: string;
  active_meal_types: MealType[];
  created_at: string;
  updated_at: string;
}

export type Sex = 'male' | 'female' | 'other';

export interface FamilyMember {
  id: string;
  family_id: string;
  name: string;
  age: number;
  sex: Sex;
  archived_at: string | null;
  restrictions_reviewed: boolean;
  created_at: string;
  updated_at: string;
}

export type RestrictionCategory = 'allergy' | 'intolerance' | 'ethical_religious' | 'preference';
export type RestrictionSeverity = 'mandatory' | 'desirable';

export interface DietaryRestriction {
  id: string;
  member_id: string;
  category: RestrictionCategory;
  name: string;
  severity: RestrictionSeverity;
  notes: string | null;
  created_at: string;
}

export type PreferenceType = 'liked' | 'disliked';
export type PreferenceIntensity = 'mild' | 'strong';

export interface FoodPreference {
  id: string;
  member_id: string;
  food_item: string;
  type: PreferenceType;
  intensity: PreferenceIntensity;
  created_at: string;
}

export type GoalType = 'lose_weight' | 'maintain' | 'gain_muscle';

export interface NutritionalGoal {
  id: string;
  member_id: string;
  goal_type: GoalType;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
