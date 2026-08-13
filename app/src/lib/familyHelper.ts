import { supabase } from './supabase';

let cachedFamilyId: string | null = null;

/**
 * Get the current user's family ID.
 * Creates a family if user doesn't have one yet (onboarding).
 */
export async function getFamilyId(): Promise<string> {
  if (cachedFamilyId) return cachedFamilyId;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Check if user already has a family (get first one if multiple exist)
  const { data: families } = await supabase
    .from('families')
    .select('id')
    .eq('owner_id', user.id)
    .limit(1);

  if (families && families.length > 0) {
    cachedFamilyId = families[0].id;
    return cachedFamilyId;
  }

  // Create family for new user (auto-onboarding)
  const { data: newFamily, error } = await supabase
    .from('families')
    .insert({
      name: 'Mi familia',
      owner_id: user.id,
      active_meal_types: ['breakfast', 'lunch', 'dinner', 'snack'],
    })
    .select()
    .single();

  if (error) throw error;
  cachedFamilyId = newFamily.id;
  return newFamily.id;
}

/**
 * Clear cached family ID (call on logout)
 */
export function clearFamilyCache() {
  cachedFamilyId = null;
}
