import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { RecipeService } from '../../services/RecipeService';
import { IngredientService } from '../../services/IngredientService';
import { getFamilyId } from '../../lib/familyHelper';
import type {
  BaseCatalogRecipe,
  FamilyRecipe,
  MasterIngredient,
  MealType,
  NutritionalInfo,
  RecipeIngredient,
} from '../../types/database';

// Design tokens from DESIGN.md
const COLORS = {
  primary: '#2d7a4f',
  primarySoft: '#e8f5ee',
  canvas: '#faf8f5',
  surface: '#ffffff',
  surfaceWarm: '#f5f0e8',
  ink: '#1a1a1a',
  body: '#3d3d3d',
  muted: '#7a7a72',
  mutedSoft: '#a8a8a0',
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

interface ResolvedIngredient {
  ingredient: MasterIngredient | null;
  quantity: number;
  unit: string;
  nutritional_for_quantity: NutritionalInfo | null;
}

type RecipeData =
  | { type: 'base'; recipe: BaseCatalogRecipe }
  | { type: 'family'; recipe: FamilyRecipe; ingredients: RecipeIngredient[] };

export default function RecipeDetailScreen() {
  const { id, source } = useLocalSearchParams<{ id: string; source?: string }>();
  const router = useRouter();
  const navigation = useNavigation();

  const goBack = () => {
    if (navigation.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/recipes');
    }
  };
  const { t } = useTranslation();

  const [data, setData] = useState<RecipeData | null>(null);
  const [resolvedIngredients, setResolvedIngredients] = useState<ResolvedIngredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [copying, setCopying] = useState(false);

  const isBase = source === 'base';

  const loadRecipe = useCallback(async () => {
    try {
      if (isBase) {
        // Load from base catalog
        const catalog = await RecipeService.getBaseCatalog();
        const recipe = catalog.find((r) => r.id === id);
        if (recipe) {
          setData({ type: 'base', recipe });
          // Resolve ingredient names
          const resolved = await Promise.all(
            recipe.ingredients.map(async (ing) => {
              const ingredient = await IngredientService.getById(ing.ingredient_id);
              return {
                ingredient,
                quantity: ing.quantity,
                unit: ing.unit,
                nutritional_for_quantity: ing.nutritional_for_quantity,
              };
            }),
          );
          setResolvedIngredients(resolved);
        }
      } else {
        // Load family recipe
        const recipe = await RecipeService.getRecipe(id!);
        if (recipe) {
          const ingredients = await RecipeService.getRecipeIngredients(id!);
          setData({ type: 'family', recipe, ingredients });
          // Resolve ingredient names
          const resolved = await Promise.all(
            ingredients.map(async (ing) => {
              const ingredient = await IngredientService.getById(ing.ingredient_id);
              return {
                ingredient,
                quantity: ing.quantity,
                unit: ing.unit,
                nutritional_for_quantity: ing.nutritional_for_quantity,
              };
            }),
          );
          setResolvedIngredients(resolved);
        }
      }
    } catch (err) {
      console.error('[RecipeDetail] Error loading recipe:', err);
    } finally {
      setLoading(false);
    }
  }, [id, isBase]);

  useEffect(() => {
    loadRecipe();
  }, [loadRecipe]);

  const recipe = data?.type === 'base' ? data.recipe : data?.recipe;
  const nutritional = recipe
    ? data?.type === 'base'
      ? data.recipe.nutritional_total
      : data?.recipe.nutritional_total
    : null;

  const handleDelete = async () => {
    if (!data || data.type === 'base') return;

    // window.confirm works on web; Alert.alert with buttons does not
    const confirmed = Platform.OS === 'web'
      ? window.confirm(
          t('recipeDetail.deleteConfirmMessage', { name: data.recipe.name }),
        )
      : await new Promise<boolean>((resolve) => {
          Alert.alert(
            t('recipeDetail.deleteConfirmTitle'),
            t('recipeDetail.deleteConfirmMessage', { name: data.recipe.name }),
            [
              { text: t('common.cancel'), style: 'cancel', onPress: () => resolve(false) },
              { text: t('common.delete'), style: 'destructive', onPress: () => resolve(true) },
            ],
          );
        });

    if (!confirmed) return;

    setDeleting(true);
    try {
      const result = await RecipeService.deleteRecipe(data.recipe.id);
      if (result.blocked) {
        Alert.alert(t('recipeDetail.deleteBlocked'), result.reason ?? '');
      } else {
        goBack();
      }
    } catch (err) {
      console.error('[RecipeDetail] Error deleting:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleCopyToFamily = async () => {
    if (!data || data.type !== 'base') return;
    setCopying(true);
    try {
      const familyId = await getFamilyId();
      const copied = await RecipeService.copyFromBase(familyId, data.recipe.id);
      // Navigate to the copied recipe in the family catalog
      router.replace(`/recipe/${copied.id}`);
    } catch (err) {
      console.error('[RecipeDetail] Error copying:', err);
      Alert.alert(t('common.error'), t('recipeForm.saveError'));
    } finally {
      setCopying(false);
    }
  };

  const handleEdit = () => {
    if (!data || data.type === 'base') return;
    router.push(`/recipe/form?recipeId=${data.recipe.id}`);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  if (!recipe) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => goBack()}>
          <Text style={styles.backText}>← {t('common.back')}</Text>
        </TouchableOpacity>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>{t('common.error')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const mealType = recipe.meal_type as MealType;
  const mealColor = MEAL_TYPE_COLORS[mealType];
  const compatibilityTags =
    data?.type === 'base' ? data.recipe.compatibility_tags : [];
  const goalTags = data?.type === 'base' ? data.recipe.goal_tags : [];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => goBack()}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
        >
          <Text style={styles.backText}>← {t('common.back')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Hero section */}
        <View style={styles.heroSection}>
          <View style={[styles.heroImage, { backgroundColor: `${mealColor}15` }]}>
            <Text style={styles.heroEmoji}>🍽️</Text>
          </View>
          <Text style={styles.recipeName}>{recipe.name}</Text>

          {/* Meal type + prep time badges */}
          <View style={styles.badgeRow}>
            <View style={[styles.mealBadge, { backgroundColor: `${mealColor}20` }]}>
              <View style={[styles.mealDot, { backgroundColor: mealColor }]} />
              <Text style={[styles.mealBadgeText, { color: mealColor }]}>
                {MEAL_TYPE_LABELS[mealType]}
              </Text>
            </View>
            {recipe.servings > 0 && (
              <View style={styles.infoBadge}>
                <Text style={styles.infoBadgeText}>
                  {recipe.servings} {recipe.servings === 1 ? 'ración' : 'raciones'}
                </Text>
              </View>
            )}
            {'prep_time_minutes' in recipe && recipe.prep_time_minutes && (
              <View style={styles.timeBadge}>
                <Text style={styles.timeBadgeText}>
                  {recipe.prep_time_minutes} {t('recipeDetail.minutes')}
                </Text>
              </View>
            )}
          </View>

          {/* Compatibility tags */}
          {compatibilityTags.length > 0 && (
            <View style={styles.tagSection}>
              <Text style={styles.sectionLabel}>{t('recipeDetail.compatibility')}</Text>
              <View style={styles.tagRow}>
                {compatibilityTags.map((tag) => (
                  <View key={tag} style={styles.compatTag}>
                    <Text style={styles.compatTagText}>
                      {tag.replace('sin_', 'Sin ')}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Goal tags */}
          {goalTags.length > 0 && (
            <View style={styles.tagSection}>
              <Text style={styles.sectionLabel}>{t('recipeDetail.goals')}</Text>
              <View style={styles.tagRow}>
                {goalTags.map((tag) => (
                  <View key={tag} style={styles.goalTag}>
                    <Text style={styles.goalTagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Nutritional info */}
        {nutritional && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('recipeDetail.nutrition')}</Text>
            <View style={styles.nutritionGrid}>
              <NutrientCard
                label={t('recipeDetail.kcal')}
                value={`${nutritional.kcal}`}
                accent
              />
              <NutrientCard
                label={t('recipeDetail.protein')}
                value={`${nutritional.protein}g`}
              />
              <NutrientCard
                label={t('recipeDetail.carbs')}
                value={`${nutritional.carbs}g`}
              />
              <NutrientCard
                label={t('recipeDetail.fat')}
                value={`${nutritional.fat}g`}
              />
            </View>
          </View>
        )}

        {/* Ingredients */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('recipeDetail.ingredients')}</Text>
          {resolvedIngredients.length > 0 ? (
            resolvedIngredients.map((item, index) => (
              <View key={index} style={styles.ingredientRow}>
                <View style={styles.ingredientDot} />
                <Text style={styles.ingredientName}>
                  {item.ingredient?.canonical_name ?? 'Ingrediente desconocido'}
                </Text>
                <Text style={styles.ingredientQty}>
                  {item.quantity} {item.unit}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyIngredients}>{t('recipeDetail.noIngredients')}</Text>
          )}
        </View>

        {/* Bottom spacing for buttons */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Action buttons */}
      <View style={styles.actionBar}>
        {isBase ? (
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handleCopyToFamily}
            disabled={copying}
            accessibilityRole="button"
          >
            <Text style={styles.primaryBtnText}>
              {copying ? t('common.loading') : t('recipeDetail.copyToFamily')}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={handleEdit}
              accessibilityRole="button"
            >
              <Text style={styles.secondaryBtnText}>{t('recipeDetail.editRecipe')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dangerBtn}
              onPress={handleDelete}
              disabled={deleting}
              accessibilityRole="button"
            >
              <Text style={styles.dangerBtnText}>
                {deleting ? t('common.loading') : t('recipeDetail.deleteRecipe')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

function NutrientCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <View style={[styles.nutrientCard, accent && styles.nutrientCardAccent]}>
      <Text style={[styles.nutrientValue, accent && styles.nutrientValueAccent]}>
        {value}
      </Text>
      <Text style={styles.nutrientLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.canvas },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButton: { paddingVertical: 8, paddingRight: 16, minHeight: 48, justifyContent: 'center' },
  backText: { fontSize: 15, fontWeight: '600', color: COLORS.primary },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16 },

  // Hero
  heroSection: { alignItems: 'center', paddingTop: 8, paddingBottom: 24 },
  heroImage: {
    width: 120,
    height: 120,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroEmoji: { fontSize: 48 },
  recipeName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.ink,
    textAlign: 'center',
    marginBottom: 12,
  },
  badgeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  mealBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    gap: 6,
  },
  mealDot: { width: 8, height: 8, borderRadius: 4 },
  mealBadgeText: { fontSize: 13, fontWeight: '600' },
  infoBadge: {
    backgroundColor: COLORS.surfaceWarm,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  infoBadgeText: { fontSize: 11, fontWeight: '500', color: COLORS.muted },
  timeBadge: {
    backgroundColor: COLORS.surfaceWarm,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  timeBadgeText: { fontSize: 11, fontWeight: '500', color: COLORS.muted },

  // Tags
  tagSection: { marginTop: 12, alignItems: 'center' },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.2,
    marginBottom: 6,
  },
  tagRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', justifyContent: 'center' },
  compatTag: {
    borderWidth: 1,
    borderColor: COLORS.hairline,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  compatTagText: { fontSize: 11, color: COLORS.body },
  goalTag: {
    backgroundColor: COLORS.primarySoft,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  goalTagText: { fontSize: 11, color: COLORS.primary },

  // Section
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.ink,
    marginBottom: 12,
  },

  // Nutrition grid
  nutritionGrid: { flexDirection: 'row', gap: 8 },
  nutrientCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  nutrientCardAccent: { backgroundColor: COLORS.primarySoft },
  nutrientValue: { fontSize: 18, fontWeight: '700', color: COLORS.ink, marginBottom: 2 },
  nutrientValueAccent: { color: COLORS.primary },
  nutrientLabel: { fontSize: 11, fontWeight: '500', color: COLORS.muted },

  // Ingredients
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  ingredientDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginRight: 12,
  },
  ingredientName: { flex: 1, fontSize: 15, color: COLORS.ink },
  ingredientQty: { fontSize: 13, color: COLORS.muted, fontWeight: '500' },
  emptyIngredients: { fontSize: 15, color: COLORS.mutedSoft, fontStyle: 'italic' },

  // Empty
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 15, color: COLORS.muted },

  // Action bar
  actionBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.canvas,
    borderTopWidth: 1,
    borderTopColor: COLORS.hairline,
  },
  actionRow: { flexDirection: 'row', gap: 12 },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  primaryBtnText: { color: COLORS.onPrimary, fontSize: 15, fontWeight: '700' },
  secondaryBtn: {
    flex: 1,
    backgroundColor: COLORS.surface,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
    minHeight: 48,
    justifyContent: 'center',
  },
  secondaryBtnText: { color: COLORS.primary, fontSize: 15, fontWeight: '700' },
  dangerBtn: {
    flex: 1,
    backgroundColor: COLORS.surface,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.error,
    minHeight: 48,
    justifyContent: 'center',
  },
  dangerBtnText: { color: COLORS.error, fontSize: 15, fontWeight: '700' },
});
