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
   * Get meals for a proposal
   */
  async getMeals(proposalId: string): Promise<PlannedMeal[]> {
    const { data, error } = await supabase
      .from('planned_meals')
      .select('*')
      .eq('proposal_id', proposalId)
      .order('day')
      .order('meal_type');

    if (error) throw error;

    // Enrich with recipe names from base catalog
    const meals = data ?? [];
    const recipeIds = meals.map((m) => m.base_recipe_id).filter(Boolean);

    if (recipeIds.length > 0) {
      const { data: recipes } = await supabase
        .from('base_catalog_recipes')
        .select('id, name, nutritional_total')
        .in('id', recipeIds);

      const recipeMap = new Map(
        (recipes ?? []).map((r) => [r.id, r]),
      );

      return meals.map((meal) => ({
        ...meal,
        recipe_name: meal.base_recipe_id
          ? recipeMap.get(meal.base_recipe_id)?.name
          : undefined,
        recipe_nutritional: meal.base_recipe_id
          ? recipeMap.get(meal.base_recipe_id)?.nutritional_total
          : null,
      }));
    }

    return meals;
  },

  /**
   * Generate a weekly menu from base catalog recipes
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

      // Collect all allergen names (lowercase for matching)
      restrictedAllergens = [...new Set(
        (restrictions ?? []).map((r) => r.name.toLowerCase()),
      )];
    }

    // 2. Get all base recipes
    const { data: allRecipes, error: recError } = await supabase
      .from('base_catalog_recipes')
      .select('*');

    if (recError) throw recError;

    // 3. Filter out recipes that conflict with mandatory restrictions
    // Strategy: check recipe ingredients against restricted allergens
    // A recipe is unsafe if it contains an ingredient whose canonical_name or allergen_flags match a restriction
    let safeRecipes = allRecipes ?? [];

    if (restrictedAllergens.length > 0) {
      // Get all master ingredients to check allergen_flags and names
      const { data: masterIngredients } = await supabase
        .from('master_ingredients')
        .select('id, canonical_name, allergen_flags');

      // Build set of ingredient IDs that are restricted
      const restrictedIngredientIds = new Set<string>();
      for (const ing of masterIngredients ?? []) {
        const flags = (ing.allergen_flags ?? []) as string[];
        const name = ing.canonical_name.toLowerCase();

        for (const allergen of restrictedAllergens) {
          // Match by allergen flag (ej: restriction "lactosa" matches flag "lactosa")
          if (flags.includes(allergen)) {
            restrictedIngredientIds.add(ing.id);
            break;
          }
          // Match by ingredient name (ej: restriction "tomate" matches ingredient "tomate")
          if (name === allergen || name.includes(allergen)) {
            restrictedIngredientIds.add(ing.id);
            break;
          }
        }
      }

      // Filter recipes: exclude those containing restricted ingredients
      safeRecipes = safeRecipes.filter((recipe) => {
        const ingredients = (recipe.ingredients ?? []) as Array<{ ingredient_id: string }>;
        return !ingredients.some((ing) => restrictedIngredientIds.has(ing.ingredient_id));
      });
    }

    console.log(`[PlannerService] ${allRecipes?.length} total recipes, ${safeRecipes.length} safe after filtering ${restrictedAllergens.length} restrictions: ${restrictedAllergens.join(', ')}`);

    // 4. Group safe recipes by meal type
    const recipesByType: Record<MealType, BaseCatalogRecipe[]> = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
    };
    for (const r of safeRecipes) {
      recipesByType[r.meal_type as MealType]?.push(r);
    }

    // 5. Create PlannedWeek
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

    // 6. Create MenuProposal
    const { data: proposal, error: propError } = await supabase
      .from('menu_proposals')
      .insert({
        week_id: week.id,
        generation_source: 'backend',
        criteria_snapshot: {
          restricted_allergens: restrictedAllergens,
          members_count: memberIds.length,
          safe_recipes_count: safeRecipes.length,
        },
      })
      .select()
      .single();

    if (propError) throw propError;

    // 7. Generate meals for each day
    const days = getDaysBetween(startDate, endDate);
    const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];
    const usedLunch = new Set<string>();
    const usedDinner = new Set<string>();
    const meals: Array<{
      proposal_id: string;
      day: string;
      meal_type: MealType;
      base_recipe_id: string;
      status: string;
    }> = [];

    for (const day of days) {
      for (const mealType of mealTypes) {
        const pool = recipesByType[mealType];
        if (!pool || pool.length === 0) continue;

        let available = [...pool];

        // Avoid repetition for lunch/dinner
        if (mealType === 'lunch') {
          available = available.filter((r) => !usedLunch.has(r.id));
          if (available.length === 0) available = [...pool]; // fallback if all used
        }
        if (mealType === 'dinner') {
          available = available.filter((r) => !usedDinner.has(r.id));
          if (available.length === 0) available = [...pool]; // fallback
        }

        // Pick random recipe from safe pool
        const recipe = available[Math.floor(Math.random() * available.length)];

        if (mealType === 'lunch') usedLunch.add(recipe.id);
        if (mealType === 'dinner') usedDinner.add(recipe.id);

        meals.push({
          proposal_id: proposal.id,
          day,
          meal_type: mealType,
          base_recipe_id: recipe.id,
          status: 'planned',
        });
      }
    }

    // 8. Insert meals
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
