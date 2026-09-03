import { supabase } from '../lib/supabase';
import type {
  FamilyRecipe,
  RecipeIngredient,
  BaseCatalogRecipe,
  MealType,
  NutritionalInfo,
  CompatibilityTag,
  GoalTag,
} from '../types/database';

// --- Input types ---

export interface CreateRecipeInput {
  name: string;
  meal_type: MealType;
  servings: number;
  prep_time_minutes?: number | null;
  image_url?: string | null;
  nutritional_total?: NutritionalInfo | null;
  ingredients: IngredientInput[];
}

export interface IngredientInput {
  ingredient_id: string;
  quantity: number;
  unit: string;
  nutritional_for_quantity?: NutritionalInfo | null;
}

export interface SearchQuery {
  text?: string;
  ingredient_id?: string;
  compatibility_tag?: string;
  goal_tag?: string;
  meal_type?: MealType;
}

export interface DeleteResult {
  success: boolean;
  blocked: boolean;
  reason?: string;
}

// --- Service ---

export const RecipeService = {
  async createRecipe(familyId: string, input: CreateRecipeInput): Promise<FamilyRecipe> {
    if (!input.name.trim()) throw new Error('Recipe name is required');
    if (input.ingredients.length === 0) throw new Error('At least one ingredient is required');
    if (input.servings < 1) throw new Error('Servings must be at least 1');

    // Validate quantities before inserting anything
    for (const ing of input.ingredients) {
      if (ing.quantity <= 0) throw new Error('All ingredient quantities must be greater than 0');
    }

    const { data: recipe, error } = await supabase
      .from('family_recipes')
      .insert({
        family_id: familyId,
        name: input.name.trim(),
        meal_type: input.meal_type,
        servings: input.servings,
        prep_time_minutes: input.prep_time_minutes ?? null,
        image_url: input.image_url ?? null,
        nutritional_total: input.nutritional_total ?? null,
        source_type: 'own',
        base_recipe_id: null,
      })
      .select()
      .single();

    if (error) throw error;

    // Insert ingredients
    const ingredientRows = input.ingredients.map((ing) => ({
      recipe_id: recipe.id,
      ingredient_id: ing.ingredient_id,
      quantity: ing.quantity,
      unit: ing.unit,
      nutritional_for_quantity: ing.nutritional_for_quantity ?? null,
    }));

    const { error: ingError } = await supabase
      .from('recipe_ingredients')
      .insert(ingredientRows);

    if (ingError) {
      // Rollback: delete the recipe if ingredients failed
      await supabase.from('family_recipes').delete().eq('id', recipe.id);
      throw ingError;
    }

    return recipe;
  },

  async updateRecipe(
    recipeId: string,
    input: Partial<CreateRecipeInput>,
  ): Promise<FamilyRecipe> {
    const updateData: Record<string, unknown> = {};
    if (input.name !== undefined) updateData.name = input.name.trim();
    if (input.meal_type !== undefined) updateData.meal_type = input.meal_type;
    if (input.servings !== undefined) updateData.servings = input.servings;
    if (input.prep_time_minutes !== undefined) updateData.prep_time_minutes = input.prep_time_minutes;
    if (input.image_url !== undefined) updateData.image_url = input.image_url;
    if (input.nutritional_total !== undefined) updateData.nutritional_total = input.nutritional_total;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('family_recipes')
      .update(updateData)
      .eq('id', recipeId)
      .select()
      .single();

    if (error) throw error;

    // Update ingredients if provided
    if (input.ingredients !== undefined) {
      await supabase.from('recipe_ingredients').delete().eq('recipe_id', recipeId);
      if (input.ingredients.length > 0) {
        const rows = input.ingredients.map((ing) => ({
          recipe_id: recipeId,
          ingredient_id: ing.ingredient_id,
          quantity: ing.quantity,
          unit: ing.unit,
          nutritional_for_quantity: ing.nutritional_for_quantity ?? null,
        }));
        await supabase.from('recipe_ingredients').insert(rows);
      }
    }

    return data;
  },

  async deleteRecipe(recipeId: string): Promise<DeleteResult> {
    // TODO: Check if recipe is in active plan (spec 002 ProtectionService)
    // For now, allow deletion
    const { error } = await supabase
      .from('family_recipes')
      .delete()
      .eq('id', recipeId);

    if (error) throw error;
    return { success: true, blocked: false };
  },

  async getRecipe(recipeId: string): Promise<FamilyRecipe | null> {
    const { data, error } = await supabase
      .from('family_recipes')
      .select('*')
      .eq('id', recipeId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async getRecipeIngredients(recipeId: string): Promise<RecipeIngredient[]> {
    const { data, error } = await supabase
      .from('recipe_ingredients')
      .select('*')
      .eq('recipe_id', recipeId);

    if (error) throw error;
    return data ?? [];
  },

  async searchRecipes(familyId: string, query: SearchQuery): Promise<FamilyRecipe[]> {
    let q = supabase.from('family_recipes').select('*').eq('family_id', familyId);

    if (query.text) {
      q = q.ilike('name', `%${query.text.trim()}%`);
    }
    if (query.meal_type) {
      q = q.eq('meal_type', query.meal_type);
    }

    q = q.order('updated_at', { ascending: false });

    const { data, error } = await q;
    if (error) throw error;

    let results = data ?? [];

    // Filter by ingredient (requires join — post-filter for now)
    if (query.ingredient_id) {
      const { data: ingredientRecipes } = await supabase
        .from('recipe_ingredients')
        .select('recipe_id')
        .eq('ingredient_id', query.ingredient_id);

      const recipeIds = new Set((ingredientRecipes ?? []).map((r) => r.recipe_id));
      results = results.filter((r) => recipeIds.has(r.id));
    }

    // Filter by compatibility tag
    if (query.compatibility_tag) {
      const { data: taggedRecipes } = await supabase
        .from('compatibility_tags')
        .select('recipe_id')
        .eq('restriction_type', query.compatibility_tag);

      const recipeIds = new Set((taggedRecipes ?? []).map((r) => r.recipe_id));
      results = results.filter((r) => recipeIds.has(r.id));
    }

    // Filter by goal tag
    if (query.goal_tag) {
      const { data: goalRecipes } = await supabase
        .from('goal_tags')
        .select('recipe_id')
        .eq('goal_type', query.goal_tag);

      const recipeIds = new Set((goalRecipes ?? []).map((r) => r.recipe_id));
      results = results.filter((r) => recipeIds.has(r.id));
    }

    return results;
  },

  async getByMealType(familyId: string, mealType: MealType): Promise<FamilyRecipe[]> {
    const { data, error } = await supabase
      .from('family_recipes')
      .select('*')
      .eq('family_id', familyId)
      .eq('meal_type', mealType)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data ?? [];
  },

  async getBaseCatalog(): Promise<BaseCatalogRecipe[]> {
    const { data, error } = await supabase
      .from('base_catalog_recipes')
      .select('*')
      .order('name');

    if (error) throw error;
    return data ?? [];
  },

  async copyFromBase(familyId: string, baseRecipeId: string): Promise<FamilyRecipe> {
    const { data: base, error: baseError } = await supabase
      .from('base_catalog_recipes')
      .select('*')
      .eq('id', baseRecipeId)
      .single();

    if (baseError) throw baseError;

    const { data: recipe, error } = await supabase
      .from('family_recipes')
      .insert({
        family_id: familyId,
        name: base.name,
        meal_type: base.meal_type,
        servings: base.servings,
        nutritional_total: base.nutritional_total,
        source_type: 'copied_from_base',
        base_recipe_id: baseRecipeId,
      })
      .select()
      .single();

    if (error) throw error;

    // Copy ingredients from base recipe
    if (base.ingredients && base.ingredients.length > 0) {
      const rows = base.ingredients.map((ing: IngredientInput) => ({
        recipe_id: recipe.id,
        ingredient_id: ing.ingredient_id,
        quantity: ing.quantity,
        unit: ing.unit,
        nutritional_for_quantity: ing.nutritional_for_quantity ?? null,
      }));
      await supabase.from('recipe_ingredients').insert(rows);
    }

    return recipe;
  },

  async getRecipeTags(recipeId: string): Promise<{
    compatibility: CompatibilityTag[];
    goals: GoalTag[];
  }> {
    const [{ data: compat }, { data: goals }] = await Promise.all([
      supabase.from('compatibility_tags').select('*').eq('recipe_id', recipeId),
      supabase.from('goal_tags').select('*').eq('recipe_id', recipeId),
    ]);

    return {
      compatibility: compat ?? [],
      goals: goals ?? [],
    };
  },
};
