import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { getFamilyId } from '../../lib/familyHelper';
import type { BaseCatalogRecipe, MealType } from '../../types/database';


const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: 'Desayuno',
  lunch: 'Comida',
  dinner: 'Cena',
  snack: 'Snack',
};

export default function SubstituteScreen() {
  const { mealId } = useLocalSearchParams<{ mealId: string }>();
  const router = useRouter();
  const [currentRecipeName, setCurrentRecipeName] = useState('');
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [recipes, setRecipes] = useState<BaseCatalogRecipe[]>([]);
  const [restrictedIngredientIds, setRestrictedIngredientIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [substituting, setSubstituting] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      // 1. Get current meal info
      const { data: meal } = await supabase
        .from('planned_meals')
        .select('meal_type, base_recipe_id')
        .eq('id', mealId)
        .single();

      if (!meal) return;
      setMealType(meal.meal_type as MealType);

      // Get current recipe name
      if (meal.base_recipe_id) {
        const { data: recipe } = await supabase
          .from('base_catalog_recipes')
          .select('name')
          .eq('id', meal.base_recipe_id)
          .single();
        setCurrentRecipeName(recipe?.name ?? '');
      }

      // 2. Load family restrictions to validate
      const familyId = await getFamilyId();
      const { data: members } = await supabase
        .from('family_members')
        .select('id')
        .eq('family_id', familyId)
        .is('archived_at', null);

      const memberIds = (members ?? []).map((m) => m.id);
      let restricted = new Set<string>();

      if (memberIds.length > 0) {
        const { data: restrictions } = await supabase
          .from('dietary_restrictions')
          .select('name')
          .in('member_id', memberIds)
          .in('category', ['allergy', 'intolerance', 'ethical_religious']);

        const allergens = [...new Set((restrictions ?? []).map((r) => r.name.toLowerCase()))];

        if (allergens.length > 0) {
          const { data: masterIngredients } = await supabase
            .from('master_ingredients')
            .select('id, canonical_name, allergen_flags');

          for (const ing of masterIngredients ?? []) {
            const flags = (ing.allergen_flags ?? []) as string[];
            const name = ing.canonical_name.toLowerCase();
            for (const allergen of allergens) {
              if (flags.includes(allergen) || name === allergen || name.includes(allergen)) {
                restricted.add(ing.id);
                break;
              }
            }
          }
        }
      }
      setRestrictedIngredientIds(restricted);

      // 3. Load recipes of same meal type
      const { data: allRecipes } = await supabase
        .from('base_catalog_recipes')
        .select('*')
        .eq('meal_type', meal.meal_type)
        .order('name');

      setRecipes(allRecipes ?? []);
    } catch (err) {
      console.error('[SubstituteScreen] Error:', err);
    } finally {
      setLoading(false);
    }
  }, [mealId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const isRecipeSafe = (recipe: BaseCatalogRecipe): boolean => {
    if (restrictedIngredientIds.size === 0) return true;
    const ingredients = (recipe.ingredients ?? []) as Array<{ ingredient_id: string }>;
    return !ingredients.some((ing) => restrictedIngredientIds.has(ing.ingredient_id));
  };

  const handleSubstitute = async (recipe: BaseCatalogRecipe) => {
    if (!isRecipeSafe(recipe)) {
      Alert.alert(
        'Restricción detectada',
        'Esta receta contiene ingredientes incompatibles con las restricciones de la familia. No se puede asignar.',
        [{ text: 'Entendido' }],
      );
      return;
    }

    setSubstituting(recipe.id);
    try {
      const { error } = await supabase
        .from('planned_meals')
        .update({ base_recipe_id: recipe.id })
        .eq('id', mealId);

      if (error) throw error;
      router.back();
    } catch (err) {
      console.error('[SubstituteScreen] Substitute error:', err);
      Alert.alert('Error', 'No se pudo realizar la sustitución');
    } finally {
      setSubstituting(null);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Cancelar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Sustituir plato</Text>
        <Text style={styles.subtitle}>
          {currentRecipeName} → Elige nueva receta de {MEAL_TYPE_LABELS[mealType]}
        </Text>
      </View>

      {/* Recipe list */}
      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const safe = isRecipeSafe(item);
          const isCurrentRecipe = item.name === currentRecipeName;

          return (
            <TouchableOpacity
              style={[
                styles.recipeOption,
                !safe && styles.recipeOptionBlocked,
                isCurrentRecipe && styles.recipeOptionCurrent,
              ]}
              onPress={() => handleSubstitute(item)}
              disabled={isCurrentRecipe || substituting !== null}
            >
              <View style={styles.recipeInfo}>
                <Text style={[styles.recipeName, !safe && styles.recipeNameBlocked]}>
                  {item.name}
                </Text>
                <View style={styles.metaRow}>
                  {item.nutritional_total && (
                    <Text style={styles.metaText}>
                      {item.nutritional_total.kcal} kcal · {item.nutritional_total.protein}g prot
                    </Text>
                  )}
                </View>
                {!safe && (
                  <Text style={styles.blockedText}>⚠ Incompatible con restricciones</Text>
                )}
                {isCurrentRecipe && (
                  <Text style={styles.currentText}>← Receta actual</Text>
                )}
              </View>
              {safe && !isCurrentRecipe && (
                <View style={styles.selectBadge}>
                  {substituting === item.id ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.selectText}>Elegir</Text>
                  )}
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  backText: { fontSize: 15, color: '#4CAF50', fontWeight: '500', marginBottom: 8 },
  title: { fontSize: 22, fontWeight: '700', color: '#1a1a1a' },
  subtitle: { fontSize: 13, color: '#757575', marginTop: 4 },
  listContent: { padding: 16 },

  // Recipe option
  recipeOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 14, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: '#F0F0F0' },
  recipeOptionBlocked: { backgroundColor: '#FFF3F3', borderColor: '#FFCDD2' },
  recipeOptionCurrent: { backgroundColor: '#F5F5F5', borderColor: '#E0E0E0' },
  recipeInfo: { flex: 1 },
  recipeName: { fontSize: 15, fontWeight: '500', color: '#1a1a1a' },
  recipeNameBlocked: { color: '#9E9E9E' },
  metaRow: { flexDirection: 'row', marginTop: 4 },
  metaText: { fontSize: 12, color: '#757575' },
  blockedText: { fontSize: 12, color: '#F44336', marginTop: 4, fontWeight: '500' },
  currentText: { fontSize: 12, color: '#9E9E9E', marginTop: 4, fontStyle: 'italic' },
  selectBadge: { backgroundColor: '#4CAF50', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  selectText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
