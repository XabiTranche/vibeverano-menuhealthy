import { supabase } from '../lib/supabase';
import type { MealType } from '../types/database';

// --- Types ---

export interface PlannedWeek {
  id: string;
  family_id: string;
  start_date: string;
  end_date: string;
  status: 'draft' | 'approved' | 'incompatible' | 'replaced';
  approved_at: string | null;
  replaced_by: string | null;
}

export interface PlannedMeal {
  id: string;
  proposal_id: string;
  day: string;
  meal_type: MealType;
  recipe_id: string | null;
  status: 'planned' | 'out_of_house';
  variants: unknown[];
}

export interface MenuProposal {
  id: string;
  week_id: string;
  generated_at: string;
  generation_source: 'backend' | 'offline';
}

export interface PlannedMealWithRecipe extends PlannedMeal {
  recipe_name: string | null;
  recipe_kcal: number | null;
  recipe_protein: number | null;
  recipe_prep_time: number | null;
}

// --- Service ---

export const PlanService = {
  async getOrCreateWeek(familyId: string, startDate: string, endDate: string): Promise<PlannedWeek> {
    // Try to find existing week
    const { data: existing } = await supabase
      .from('planned_weeks')
      .select('*')
      .eq('family_id', familyId)
      .eq('start_date', startDate)
      .neq('status', 'replaced')
      .single();

    if (existing) return existing;

    // Create new week
    const { data, error } = await supabase
      .from('planned_weeks')
      .insert({ family_id: familyId, start_date: startDate, end_date: endDate })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async generateSimpleMenu(weekId: string, familyId: string, startDate: string, endDate: string): Promise<void> {
    // Create proposal
    const { data: proposal, error: propError } = await supabase
      .from('menu_proposals')
      .insert({ week_id: weekId, generation_source: 'offline' })
      .select()
      .single();

    if (propError) throw propError;

    // Get available recipes (from base catalog copied to family, or base directly)
    const { data: recipes } = await supabase
      .from('base_catalog_recipes')
      .select('id, name, meal_type, nutritional_total');

    if (!recipes || recipes.length === 0) throw new Error('No recipes available');

    // Build meals for each day
    const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];
    const meals: Array<{
      proposal_id: string;
      day: string;
      meal_type: MealType;
      recipe_id: string;
    }> = [];

    const start = new Date(startDate);
    const end = new Date(endDate);
    const usedLunch = new Set<string>();
    const usedDinner = new Set<string>();

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayStr = d.toISOString().split('T')[0];

      for (const mealType of mealTypes) {
        const candidates = recipes.filter((r) => r.meal_type === mealType);
        if (candidates.length === 0) continue;

        // Avoid repetition for lunch/dinner
        let selected = candidates[0];
        if (mealType === 'lunch') {
          const available = candidates.filter((r) => !usedLunch.has(r.id));
          selected = available.length > 0 ? available[Math.floor(Math.random() * available.length)] : candidates[Math.floor(Math.random() * candidates.length)];
          usedLunch.add(selected.id);
        } else if (mealType === 'dinner') {
          const available = candidates.filter((r) => !usedDinner.has(r.id));
          selected = available.length > 0 ? available[Math.floor(Math.random() * available.length)] : candidates[Math.floor(Math.random() * candidates.length)];
          usedDinner.add(selected.id);
        } else {
          selected = candidates[Math.floor(Math.random() * candidates.length)];
        }

        meals.push({
          proposal_id: proposal.id,
          day: dayStr,
          meal_type: mealType,
          recipe_id: selected.id,
        });
      }
    }

    const { error: mealsError } = await supabase.from('planned_meals').insert(meals);
    if (mealsError) throw mealsError;
  },

  async getWeekMeals(weekId: string): Promise<PlannedMealWithRecipe[]> {
    // Get proposal for this week
    const { data: proposal } = await supabase
      .from('menu_proposals')
      .select('id')
      .eq('week_id', weekId)
      .order('generated_at', { ascending: false })
      .limit(1)
      .single();

    if (!proposal) return [];

    // Get meals with recipe info
    const { data: meals, error } = await supabase
      .from('planned_meals')
      .select('*')
      .eq('proposal_id', proposal.id)
      .order('day')
      .order('meal_type');

    if (error) throw error;
    if (!meals) return [];

    // Enrich with recipe names
    const recipeIds = [...new Set(meals.map((m) => m.recipe_id).filter(Boolean))];
    const { data: recipes } = await supabase
      .from('base_catalog_recipes')
      .select('id, name, nutritional_total')
      .in('id', recipeIds);

    const recipeMap = new Map(
      (recipes ?? []).map((r) => [r.id, r]),
    );

    return meals.map((meal) => {
      const recipe = meal.recipe_id ? recipeMap.get(meal.recipe_id) : null;
      const nutri = recipe?.nutritional_total as { kcal?: number; protein?: number } | null;
      return {
        ...meal,
        recipe_name: recipe?.name ?? null,
        recipe_kcal: nutri?.kcal ?? null,
        recipe_protein: nutri?.protein ?? null,
        recipe_prep_time: null,
      };
    });
  },

  async approveWeek(weekId: string): Promise<void> {
    const { error } = await supabase
      .from('planned_weeks')
      .update({ status: 'approved', approved_at: new Date().toISOString() })
      .eq('id', weekId);

    if (error) throw error;
  },
};
