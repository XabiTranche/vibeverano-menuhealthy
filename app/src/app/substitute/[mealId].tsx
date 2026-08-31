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
import type { MealType, NutritionalInfo } from '../../types/database';

const COLORS = {
  primary: '#2d7a4f',
  primarySoft: '#e8f5ee',
  canvas: '#faf8f5',
  surface: '#ffffff',
  surfaceWarm: '#f5f0e8',
  ink: '#1a1a1a',
  body: '#3d3d3d',
  muted: '#7a7a72',
  hairline: '#e8e4dc',
  error: '#c53030',
  onPrimary: '#ffffff',
};

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: 'Desayuno',
  lunch: 'Comida',
  dinner: 'Cena',
  snack: 'Snack',
};

const MEAL_TYPE_COLORS: Record<MealType, string> = {
  breakfast: '#f5a623',
  lunch: '#2d7a4f',
  dinner: '#5b4fa0',
  snack: '#d4763a',
};

// Unified recipe for both sources
interface SubstituteOption {
  id: string;
  name: string;
  source: 'base' | 'family';
  nutritional_total: NutritionalInfo | null;
  ingredients: Array<{ ingredient_id: string }>;
}

export default function SubstituteScreen() {
  const { mealId } = useLocalSearchParams<{ mealId: string }>();
  const router = useRouter();
  const [currentRecipeId, setCurrentRecipeId] = useState<string | null>(null);
  const [currentRecipeSource, setCurrentRecipeSource] = useState<'base' | 'family'>('base');
  const [currentRecipeName, setCurrentRecipeName] = useState('');
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [options, setOptions] = useState<SubstituteOption[]>([]);
  const [restrictedIngredientIds, setRestrictedIngredientIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [substituting, setSubstituting] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      // 1. Get current meal info (both recipe_id and base_recipe_id)
      const { data: meal } = await supabase
        .from('planned_meals')
        .select('meal_type, base_recipe_id, recipe_id')
        .eq('id', mealId)
        .single();

      if (!meal) return;
      setMealType(meal.meal_type as MealType);

      // Resolve current recipe name from the correct source
      if (meal.recipe_id) {
        setCurrentRecipeId(meal.recipe_id);
        setCurrentRecipeSource('family');
        const { data: recipe } = await supabase
          .from('family_recipes')
          .select('name')
          .eq('id', meal.recipe_id)
          .single();
        setCurrentRecipeName(recipe?.name ?? '');
      } else if (meal.base_recipe_id) {
        setCurrentRecipeId(meal.base_recipe_id);
        setCurrentRecipeSource('base');
        const { data: recipe } = await supabase
          .from('base_catalog_recipes')
          .select('name')
          .eq('id', meal.base_recipe_id)
          .single();
        setCurrentRecipeName(recipe?.name ?? '');
      }

      // 2. Load family restrictions
      const familyId = await getFamilyId();
      const { data: members } = await supabase
        .from('family_members')
        .select('id')
        .eq('family_id', familyId)
        .is('archived_at', null);

      const memberIds = (members ?? []).map((m) => m.id);
      const restricted = new Set<string>();

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

      // 3. Load alternatives from BOTH sources for this meal type
      const allOptions: SubstituteOption[] = [];

      // Family recipes
      const { data: familyRecipes } = await supabase
        .from('family_recipes')
        .select('id, name, nutritional_total')
        .eq('family_id', familyId)
        .eq('meal_type', meal.meal_type)
        .order('name');

      // Get ingredients for family recipes to check restrictions
      const familyIds = (familyRecipes ?? []).map((r) => r.id);
      let familyIngMap = new Map<string, Array<{ ingredient_id: string }>>();
      if (familyIds.length > 0) {
        const { data: familyIngs } = await supabase
          .from('recipe_ingredients')
          .select('recipe_id, ingredient_id')
          .in('recipe_id', familyIds);
        for (const ing of familyIngs ?? []) {
          const list = familyIngMap.get(ing.recipe_id) ?? [];
          list.push({ ingredient_id: ing.ingredient_id });
          familyIngMap.set(ing.recipe_id, list);
        }
      }

      for (const r of familyRecipes ?? []) {
        allOptions.push({
          id: r.id,
          name: r.name,
          source: 'family',
          nutritional_total: r.nutritional_total,
          ingredients: familyIngMap.get(r.id) ?? [],
        });
      }

      // Base catalog recipes
      const { data: baseRecipes } = await supabase
        .from('base_catalog_recipes')
        .select('*')
        .eq('meal_type', meal.meal_type)
        .order('name');

      for (const r of baseRecipes ?? []) {
        allOptions.push({
          id: r.id,
          name: r.name,
          source: 'base',
          nutritional_total: r.nutritional_total,
          ingredients: (r.ingredients ?? []) as Array<{ ingredient_id: string }>,
        });
      }

      setOptions(allOptions);
    } catch (err) {
      console.error('[SubstituteScreen] Error:', err);
    } finally {
      setLoading(false);
    }
  }, [mealId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const isOptionSafe = (option: SubstituteOption): boolean => {
    if (restrictedIngredientIds.size === 0) return true;
    return !option.ingredients.some((ing) => restrictedIngredientIds.has(ing.ingredient_id));
  };

  const handleSubstitute = async (option: SubstituteOption) => {
    if (!isOptionSafe(option)) {
      Alert.alert(
        'Restricción detectada',
        'Esta receta contiene ingredientes incompatibles con las restricciones de la familia.',
        [{ text: 'Entendido' }],
      );
      return;
    }

    setSubstituting(option.id);
    try {
      // Set the correct field based on source, clear the other
      const updateData =
        option.source === 'family'
          ? { recipe_id: option.id, base_recipe_id: null }
          : { base_recipe_id: option.id, recipe_id: null };

      const { error } = await supabase
        .from('planned_meals')
        .update(updateData)
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

  const mealColor = MEAL_TYPE_COLORS[mealType];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Cancelar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Sustituir plato</Text>
        <Text style={styles.subtitle}>
          {currentRecipeName} → Elige nueva receta de {MEAL_TYPE_LABELS[mealType]}
        </Text>
      </View>

      {/* Recipe list */}
      <FlatList
        data={options}
        keyExtractor={(item) => `${item.source}-${item.id}`}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const safe = isOptionSafe(item);
          const isCurrent = item.id === currentRecipeId && item.source === currentRecipeSource;

          return (
            <TouchableOpacity
              style={[
                styles.recipeOption,
                !safe && styles.recipeOptionBlocked,
                isCurrent && styles.recipeOptionCurrent,
              ]}
              onPress={() => handleSubstitute(item)}
              disabled={isCurrent || substituting !== null}
              accessibilityRole="button"
            >
              {/* Color sidebar */}
              <View style={[styles.optionSidebar, { backgroundColor: mealColor }]} />

              <View style={styles.recipeInfo}>
                <View style={styles.nameRow}>
                  <Text
                    style={[styles.recipeName, !safe && styles.recipeNameBlocked]}
                    numberOfLines={2}
                  >
                    {item.name}
                  </Text>
                  {item.source === 'family' && (
                    <View style={styles.sourceTag}>
                      <Text style={styles.sourceTagText}>Propia</Text>
                    </View>
                  )}
                </View>

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
                {isCurrent && (
                  <Text style={styles.currentText}>← Receta actual</Text>
                )}
              </View>

              {safe && !isCurrent && (
                <View style={styles.selectBadge}>
                  {substituting === item.id ? (
                    <ActivityIndicator size="small" color={COLORS.onPrimary} />
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
  container: { flex: 1, backgroundColor: COLORS.canvas },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.hairline },
  backBtn: { paddingVertical: 4, minHeight: 48, justifyContent: 'center' },
  backText: { fontSize: 15, color: COLORS.primary, fontWeight: '600', marginBottom: 8 },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.ink },
  subtitle: { fontSize: 13, color: COLORS.muted, marginTop: 4 },
  listContent: { padding: 16 },

  // Recipe option
  recipeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  recipeOptionBlocked: { backgroundColor: '#FFF3F3' },
  recipeOptionCurrent: { backgroundColor: COLORS.surfaceWarm },
  optionSidebar: { width: 3, alignSelf: 'stretch' },
  recipeInfo: { flex: 1, padding: 14 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  recipeName: { flex: 1, fontSize: 15, fontWeight: '600', color: COLORS.ink },
  recipeNameBlocked: { color: COLORS.muted },
  sourceTag: {
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sourceTagText: { fontSize: 11, fontWeight: '600', color: COLORS.primary },
  metaRow: { flexDirection: 'row', marginTop: 4 },
  metaText: { fontSize: 12, color: COLORS.muted },
  blockedText: { fontSize: 12, color: COLORS.error, marginTop: 4, fontWeight: '500' },
  currentText: { fontSize: 12, color: COLORS.muted, marginTop: 4, fontStyle: 'italic' },
  selectBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 12,
    minHeight: 36,
    justifyContent: 'center',
  },
  selectText: { color: COLORS.onPrimary, fontSize: 13, fontWeight: '600' },
});
