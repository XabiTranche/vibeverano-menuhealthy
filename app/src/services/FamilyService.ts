import { supabase } from '../lib/supabase';
import type { Family, FamilyMember, MealType, Sex } from '../types/database';

// --- Input types ---

export interface CreateFamilyInput {
  name: string;
}

export interface CreateMemberInput {
  name: string;
  age: number;
  sex: Sex;
}

export interface UpdateMemberInput {
  name?: string;
  age?: number;
  sex?: Sex;
}

// --- Service ---

export const FamilyService = {
  async createFamily(input: CreateFamilyInput): Promise<Family> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('families')
      .insert({
        name: input.name.trim(),
        owner_id: user.id,
        active_meal_types: ['breakfast', 'lunch', 'dinner', 'snack'],
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getFamily(familyId: string): Promise<Family | null> {
    const { data, error } = await supabase
      .from('families')
      .select('*')
      .eq('id', familyId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async getMyFamily(): Promise<Family | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('families')
      .select('*')
      .eq('owner_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async updateFamily(familyId: string, input: Partial<CreateFamilyInput>): Promise<Family> {
    const updateData: Record<string, unknown> = {};
    if (input.name !== undefined) updateData.name = input.name.trim();
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('families')
      .update(updateData)
      .eq('id', familyId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateMealTypes(familyId: string, mealTypes: MealType[]): Promise<Family> {
    if (mealTypes.length === 0) throw new Error('At least one meal type must be active');

    const { data, error } = await supabase
      .from('families')
      .update({
        active_meal_types: mealTypes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', familyId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // --- Members ---

  async addMember(familyId: string, input: CreateMemberInput): Promise<FamilyMember> {
    const { data, error } = await supabase
      .from('family_members')
      .insert({
        family_id: familyId,
        name: input.name.trim(),
        age: input.age,
        sex: input.sex,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateMember(memberId: string, input: UpdateMemberInput): Promise<FamilyMember> {
    const updateData: Record<string, unknown> = {};
    if (input.name !== undefined) updateData.name = input.name.trim();
    if (input.age !== undefined) updateData.age = input.age;
    if (input.sex !== undefined) updateData.sex = input.sex;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('family_members')
      .update(updateData)
      .eq('id', memberId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async archiveMember(memberId: string): Promise<void> {
    const { error } = await supabase
      .from('family_members')
      .update({ archived_at: new Date().toISOString() })
      .eq('id', memberId);

    if (error) throw error;
  },

  async reactivateMember(memberId: string): Promise<void> {
    const { error } = await supabase
      .from('family_members')
      .update({ archived_at: null })
      .eq('id', memberId);

    if (error) throw error;
  },

  async getActiveMembers(familyId: string): Promise<FamilyMember[]> {
    const { data, error } = await supabase
      .from('family_members')
      .select('*')
      .eq('family_id', familyId)
      .is('archived_at', null)
      .order('created_at');

    if (error) throw error;
    return data ?? [];
  },

  async getAllMembers(familyId: string): Promise<FamilyMember[]> {
    const { data, error } = await supabase
      .from('family_members')
      .select('*')
      .eq('family_id', familyId)
      .order('created_at');

    if (error) throw error;
    return data ?? [];
  },
};
