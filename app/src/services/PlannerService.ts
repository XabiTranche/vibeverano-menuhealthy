import { supabase } from '../lib/supabase';
import { getFamilyId } from '../lib/familyHelper';
import type { BaseCatalogRecipe, MealType } from '../types/database';

export interface PlannedWeek {
  id: string;
  family_id: string;
  start_date: string;
  end_date: string;
  status: 'draft' | 'approved' | 'incompatible' | 'replaced';
  approved_at: string | null;
  created_at: string;
}

export interface PlannedMeal {
  id: string;
  proposal_id: string;
  day: string;
  meal_type: MealType;
  recipe_id: string | null;
  base_recipe_id: string | null;
  status: 'planned' | 'out_of_house';
  recipe_name?: string;
  recipe_nutritional?: { kcal: number; protein: number } | null;
}

export interface MenuProposal {
  id: string;
  week_id: string;
  generated_at: string;
  generation_source: 'backend' | 'offline';
}

// Family ID resolved from auth
const DEV_FAMILY_ID = 'f0000001-0001-4000-8000-000000000001'; // fallback for dev

export const PlannerService = {
  /**
   * Get the current week's plan (if exists)
   */
  async getCurrentWeek(startDate: string): Promise<PlannedWeek | null> {
    const familyId = await getFamilyId();
    const { data, error } = await supabase
      .from('planned_weeks')
      .select('*')
      .eq('family_id', familyId)
      .eq('start_date', startDate)
      .neq('status', 'replaced')
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  /**
   * Get meals for a proposal (resolves recipe names from both sources)
   */
  async getMeals(proposalId: string): Promise<PlannedMeal[]> {
    const { data, error } = await supabase
      .from('planned_meals')
      .select('*')
      .eq('proposal_id', proposalId)
      .order('day')
      .order('meal_type');

    if (error) throw error;

    const meals = data ?? [];

    // Collect IDs by source
    const baseIds = meals.map((m) => m.base_recipe_id).filter(Boolean) as string[];
    const familyIds = meals.map((m) => m.recipe_id).filter(Boolean) as string[];

    // Fetch names from both sources in parallel
    const [baseResult, familyResult] = await Promise.all([
      baseIds.length > 0
        ? supabase
            .from('base_catalog_recipes')
            .select('id, name, nutritional_total')
            .in('id', baseIds)
        : { data: [] },
      familyIds.length > 0
        ? supabase
            .from('family_recipes')
            .select('id, name, nutritional_total')
            .in('id', familyIds)
        : { data: [] },
    ]);

    const recipeMap = new Map<string, { name: string; nutritional_total: { kcal: number; protein: number } | null }>();

    for (const r of baseResult.data ?? []) {
      recipeMap.set(r.id, { name: r.name, nutritional_total: r.nutritional_total });
    }
    for (const r of familyResult.data ?? []) {
      recipeMap.set(r.id, { name: r.name, nutritional_total: r.nutritional_total });
    }

    return meals.map((meal) => {
      const recipeId = meal.recipe_id ?? meal.base_recipe_id;
      const info = recipeId ? recipeMap.get(recipeId) : undefined;
      return {
        ...meal,
        recipe_name: info?.name,
        recipe_nutritional: info?.nutritional_total ?? null,
      };
    });
  },

  /**
   * Generate a weekly menu from family recipes + base catalog (mixed)
   * Priority: family recipes first, fill gaps with base catalog
   * Algorithm: filter by restrictions, then pick per meal type, avoid repetition in lunch/dinner
   */
  async generateWeek(startDate: string, endDate: string): Promise<PlannedWeek> {
    // 1. Get family members' mandatory restrictions
    const familyId = await getFamilyId();
    const { data: members } = await supabase
      .from('family_members')
      .select('id')
      .eq('family_id', familyId)
      .is('archived_at', null);

    const memberIds = (members ?? []).map((m) => m.id);

    let restrictedAllergens: string[] = [];
    if (memberIds.length > 0) {
      const { data: restrictions } = await supabase
        .from('dietary_restrictions')
        .select('name, category')
        .in('member_id', memberIds)
        .in('category', ['allergy', 'intolerance', 'ethical_religious']);

      restrictedAllergens = [...new Set(
        (restrictions ?? []).map((r) => r.name.toLowerCase()),
      )];
    }

    // 2. Get all master ingredients for allergen checking
    const { data: masterIngredients } = await supabase
      .from('master_ingredients')
      .select('id, canonical_name, allergen_flags');

    const restrictedIngredientIds = new Set<string>();
    if (restrictedAllergens.length > 0) {
      for (const ing of masterIngredients ?? []) {
        const flags = (ing.allergen_flags ?? []) as string[];
        const name = ing.canonical_name.toLowerCase();
        for (const allergen of restrictedAllergens) {
          if (flags.includes(allergen) || name === allergen || name.includes(allergen)) {
            restrictedIngredientIds.add(ing.id);
            break;
          }
        }
      }
    }

    // Helper to check if a recipe's ingredients are safe
    const isSafe = (ingredients: Array<{ ingredient_id: string }>): boolean => {
      if (restrictedIngredientIds.size === 0) return true;
      return !ingredients.some((ing) => restrictedIngredientIds.has(ing.ingredient_id));
    };

    // 3. Get family recipes + their ingredients
    const { data: allFamilyRecipes } = await supabase
      .from('family_recipes')
      .select('*')
      .eq('family_id', familyId);

    const familyRecipeList = allFamilyRecipes ?? [];
    let safeFamilyRecipes = familyRecipeList;

    if (restrictedIngredientIds.size > 0 && familyRecipeList.length > 0) {
      // Get ingredients for all family recipes to check restrictions
      const familyRecipeIds = familyRecipeList.map((r) => r.id);
      const { data: familyIngredients } = await supabase
        .from('recipe_ingredients')
        .select('recipe_id, ingredient_id')
        .in('recipe_id', familyRecipeIds);

      const ingredientsByRecipe = new Map<string, Array<{ ingredient_id: string }>>();
      for (const ing of familyIngredients ?? []) {
        const list = ingredientsByRecipe.get(ing.recipe_id) ?? [];
        list.push({ ingredient_id: ing.ingredient_id });
        ingredientsByRecipe.set(ing.recipe_id, list);
      }

      safeFamilyRecipes = familyRecipeList.filter((r) => {
        const ings = ingredientsByRecipe.get(r.id) ?? [];
        return isSafe(ings);
      });
    }

    // 4. Get base catalog recipes (as fallback / to fill gaps)
    const { data: allBaseRecipes, error: recError } = await supabase
      .from('base_catalog_recipes')
      .select('*');

    if (recError) throw recError;

    let safeBaseRecipes = allBaseRecipes ?? [];
    if (restrictedIngredientIds.size > 0) {
      safeBaseRecipes = safeBaseRecipes.filter((recipe) => {
        const ingredients = (recipe.ingredients ?? []) as Array<{ ingredient_id: string }>;
        return isSafe(ingredients);
      });
    }

    console.log(`[PlannerService] Family: ${safeFamilyRecipes.length} safe, Base: ${safeBaseRecipes.length} safe, Restrictions: ${restrictedAllergens.join(', ')}`);

    // 5. Build unified pool per meal type — family recipes first, then base
    interface UnifiedRecipe {
      id: string;
      name: string;
      meal_type: MealType;
      source: 'family' | 'base';
    }

    const poolByType: Record<MealType, UnifiedRecipe[]> = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
    };

    // Add family recipes first (higher priority)
    for (const r of safeFamilyRecipes) {
      poolByType[r.meal_type as MealType]?.push({
        id: r.id,
        name: r.name,
        meal_type: r.meal_type as MealType,
        source: 'family',
      });
    }

    // Then base recipes
    for (const r of safeBaseRecipes) {
      poolByType[r.meal_type as MealType]?.push({
        id: r.id,
        name: r.name,
        meal_type: r.meal_type as MealType,
        source: 'base',
      });
    }

    // 6. Create PlannedWeek
    const { data: week, error: weekError } = await supabase
      .from('planned_weeks')
      .insert({
        family_id: familyId,
        start_date: startDate,
        end_date: endDate,
        status: 'draft',
      })
      .select()
      .single();

    if (weekError) throw weekError;

    // 7. Create MenuProposal
    const { data: proposal, error: propError } = await supabase
      .from('menu_proposals')
      .insert({
        week_id: week.id,
        generation_source: 'backend',
        criteria_snapshot: {
          restricted_allergens: restrictedAllergens,
          members_count: memberIds.length,
          safe_family_recipes: safeFamilyRecipes.length,
          safe_base_recipes: safeBaseRecipes.length,
        },
      })
      .select()
      .single();

    if (propError) throw propError;

    // 8. Generate meals for each day
    const days = getDaysBetween(startDate, endDate);
    const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];
    const usedLunch = new Set<string>();
    const usedDinner = new Set<string>();
    const meals: Array<{
      proposal_id: string;
      day: string;
      meal_type: MealType;
      recipe_id: string | null;
      base_recipe_id: string | null;
      status: string;
    }> = [];

    for (const day of days) {
      for (const mealType of mealTypes) {
        const pool = poolByType[mealType];
        if (!pool || pool.length === 0) continue;

        let available = [...pool];

        // Avoid repetition for lunch/dinner
        if (mealType === 'lunch') {
          const filtered = available.filter((r) => !usedLunch.has(r.id));
          if (filtered.length > 0) available = filtered;
        }
        if (mealType === 'dinner') {
          const filtered = available.filter((r) => !usedDinner.has(r.id));
          if (filtered.length > 0) available = filtered;
        }

        // Pick random recipe from pool
        const recipe = available[Math.floor(Math.random() * available.length)];

        if (mealType === 'lunch') usedLunch.add(recipe.id);
        if (mealType === 'dinner') usedDinner.add(recipe.id);

        meals.push({
          proposal_id: proposal.id,
          day,
          meal_type: mealType,
          recipe_id: recipe.source === 'family' ? recipe.id : null,
          base_recipe_id: recipe.source === 'base' ? recipe.id : null,
          status: 'planned',
        });
      }
    }

    // 9. Insert meals
    if (meals.length > 0) {
      const { error: mealsError } = await supabase
        .from('planned_meals')
        .insert(meals);

      if (mealsError) throw mealsError;
    }

    return week;
  },

  /**
   * Approve a week
   */
  async approveWeek(weekId: string): Promise<PlannedWeek> {
    const { data, error } = await supabase
      .from('planned_weeks')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', weekId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get proposal for a week
   */
  async getProposal(weekId: string): Promise<MenuProposal | null> {
    const { data, error } = await supabase
      .from('menu_proposals')
      .select('*')
      .eq('week_id', weekId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },
};

// Helper: get array of date strings between two dates
function getDaysBetween(start: string, end: string): string[] {
  const days: string[] = [];
  const current = new Date(start);
  const endDate = new Date(end);
  while (current <= endDate) {
    days.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  return days;
}
