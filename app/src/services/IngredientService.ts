import { supabase } from '../lib/supabase';
import type { MasterIngredient, IngredientCategory } from '../types/database';

export interface CategoryInfo {
  category: IngredientCategory;
  count: number;
}

const MAX_SEARCH_RESULTS = 20;

export const IngredientService = {
  async searchIngredients(query: string): Promise<MasterIngredient[]> {
    if (!query.trim()) return [];

    const { data, error } = await supabase
      .from('master_ingredients')
      .select('*')
      .ilike('canonical_name', `%${query.trim()}%`)
      .limit(MAX_SEARCH_RESULTS)
      .order('canonical_name');

    if (error) throw error;
    return data ?? [];
  },

  async getById(ingredientId: string): Promise<MasterIngredient | null> {
    const { data, error } = await supabase
      .from('master_ingredients')
      .select('*')
      .eq('id', ingredientId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async getByCategory(category: IngredientCategory): Promise<MasterIngredient[]> {
    const { data, error } = await supabase
      .from('master_ingredients')
      .select('*')
      .eq('category', category)
      .order('canonical_name');

    if (error) throw error;
    return data ?? [];
  },

  async getAllCategories(): Promise<CategoryInfo[]> {
    const { data, error } = await supabase
      .from('master_ingredients')
      .select('category');

    if (error) throw error;

    const counts = (data ?? []).reduce<Record<string, number>>((acc, row) => {
      acc[row.category] = (acc[row.category] || 0) + 1;
      return acc;
    }, {});

    const categories: IngredientCategory[] = [
      'fruits_vegetables',
      'meats',
      'dairy',
      'cereals',
      'other',
    ];

    return categories.map((cat) => ({
      category: cat,
      count: counts[cat] || 0,
    }));
  },
};
