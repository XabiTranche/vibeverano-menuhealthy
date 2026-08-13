import { supabase } from '../lib/supabase';
import { getFamilyId } from '../lib/familyHelper';
import type { IngredientCategory } from '../types/database';

export interface ShoppingList {
  id: string;
  family_id: string;
  week_id: string;
  menu_id: string;
  status: 'generated' | 'adjusted' | 'in_use' | 'completed';
  unmapped_recipes: string[];
  generated_at: string;
}

export interface ShoppingItem {
  id: string;
  list_id: string;
  ingredient_id: string;
  ingredient_name: string;
  approximate_quantity: number | null;
  unit: string | null;
  category: IngredientCategory;
  status: 'pending' | 'bought' | 'available_at_home';
}

export interface ShoppingProgress {
  total: number;
  pending: number;
  bought: number;
  available: number;
}

const DEV_FAMILY_ID = 'f0000001-0001-4000-8000-000000000001'; // fallback

const CATEGORY_ORDER: IngredientCategory[] = [
  'fruits_vegetables',
  'meats',
  'dairy',
  'cereals',
  'other',
];

export const ShoppingService = {
  /**
   * Generate shopping list from an approved week's menu
   */
  async generateList(weekId: string): Promise<ShoppingList> {
    // 1. Get the proposal for this week
    const { data: proposal } = await supabase
      .from('menu_proposals')
      .select('id')
      .eq('week_id', weekId)
      .maybeSingle();

    if (!proposal) throw new Error('No proposal found for this week');

    // 2. Get all planned meals with their base_recipe_ids
    const { data: meals } = await supabase
      .from('planned_meals')
      .select('base_recipe_id')
      .eq('proposal_id', proposal.id)
      .eq('status', 'planned')
      .not('base_recipe_id', 'is', null);

    const recipeIds = [...new Set((meals ?? []).map((m) => m.base_recipe_id))];

    if (recipeIds.length === 0) throw new Error('No recipes in this menu');

    // 3. Get recipe details with ingredients
    const { data: recipes } = await supabase
      .from('base_catalog_recipes')
      .select('id, name, ingredients')
      .in('id', recipeIds);

    // 4. Consolidate ingredients
    const ingredientMap = new Map<string, { quantity: number; unit: string; count: number }>();
    const recipeCountPerIngredient = new Map<string, number>();

    for (const recipe of recipes ?? []) {
      const ingredients = recipe.ingredients as Array<{
        ingredient_id: string;
        quantity: number;
        unit: string;
      }>;

      for (const ing of ingredients) {
        const existing = ingredientMap.get(ing.ingredient_id);
        if (existing) {
          existing.quantity += ing.quantity;
          existing.count += 1;
        } else {
          ingredientMap.set(ing.ingredient_id, {
            quantity: ing.quantity,
            unit: ing.unit,
            count: 1,
          });
        }
      }
    }

    // 5. Get ingredient details from master catalog
    const ingredientIds = [...ingredientMap.keys()];
    const { data: masterIngredients } = await supabase
      .from('master_ingredients')
      .select('id, canonical_name, category')
      .in('id', ingredientIds);

    // 6. Create shopping list
    const familyId = await getFamilyId();
    const { data: list, error: listError } = await supabase
      .from('shopping_lists')
      .insert({
        family_id: familyId,
        week_id: weekId,
        menu_id: proposal.id,
        status: 'generated',
        unmapped_recipes: [],
      })
      .select()
      .single();

    if (listError) throw listError;

    // 7. Create shopping items
    const items = (masterIngredients ?? []).map((ing) => {
      const consolidated = ingredientMap.get(ing.id)!;
      return {
        list_id: list.id,
        ingredient_id: ing.id,
        ingredient_name: ing.canonical_name,
        approximate_quantity: Math.round(consolidated.quantity * 10) / 10,
        unit: consolidated.unit,
        category: ing.category,
        status: 'pending',
      };
    });

    if (items.length > 0) {
      const { error: itemsError } = await supabase
        .from('shopping_items')
        .insert(items);

      if (itemsError) throw itemsError;
    }

    return list;
  },

  /**
   * Get existing list for a week
   */
  async getListForWeek(weekId: string): Promise<ShoppingList | null> {
    const familyId = await getFamilyId();
    const { data, error } = await supabase
      .from('shopping_lists')
      .select('*')
      .eq('family_id', familyId)
      .eq('week_id', weekId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  /**
   * Get items grouped by category
   */
  async getItems(listId: string): Promise<ShoppingItem[]> {
    const { data, error } = await supabase
      .from('shopping_items')
      .select('*')
      .eq('list_id', listId)
      .order('category')
      .order('ingredient_name');

    if (error) throw error;
    return data ?? [];
  },

  /**
   * Mark item as bought (tap)
   */
  async markBought(itemId: string): Promise<void> {
    const { error } = await supabase
      .from('shopping_items')
      .update({ status: 'bought', last_modified_at: new Date().toISOString() })
      .eq('id', itemId);

    if (error) throw error;
  },

  /**
   * Mark item as available at home (swipe)
   */
  async markAvailable(itemId: string): Promise<void> {
    const { error } = await supabase
      .from('shopping_items')
      .update({ status: 'available_at_home', last_modified_at: new Date().toISOString() })
      .eq('id', itemId);

    if (error) throw error;
  },

  /**
   * Unmark item (revert to pending)
   */
  async unmarkItem(itemId: string): Promise<void> {
    const { error } = await supabase
      .from('shopping_items')
      .update({ status: 'pending', last_modified_at: new Date().toISOString() })
      .eq('id', itemId);

    if (error) throw error;
  },

  /**
   * Get progress
   */
  getProgress(items: ShoppingItem[]): ShoppingProgress {
    return {
      total: items.length,
      pending: items.filter((i) => i.status === 'pending').length,
      bought: items.filter((i) => i.status === 'bought').length,
      available: items.filter((i) => i.status === 'available_at_home').length,
    };
  },

  /**
   * Get category display order
   */
  getCategoryOrder(): IngredientCategory[] {
    return CATEGORY_ORDER;
  },
};
