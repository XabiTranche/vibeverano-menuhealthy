import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { RecipeService, type CreateRecipeInput, type IngredientInput } from '../../services/RecipeService';
import { IngredientService } from '../../services/IngredientService';
import { getFamilyId } from '../../lib/familyHelper';
import type { MasterIngredient, MealType, FamilyRecipe } from '../../types/database';

// Design tokens
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

const MEAL_TYPES: { key: MealType; label: string; color: string }[] = [
  { key: 'breakfast', label: 'Desayuno', color: '#f5a623' },
  { key: 'lunch', label: 'Comida', color: '#2d7a4f' },
  { key: 'dinner', label: 'Cena', color: '#5b4fa0' },
  { key: 'snack', label: 'Snack', color: '#d4763a' },
];

const CATEGORY_LABELS: Record<string, string> = {
  fruits_vegetables: 'Frutas y verduras',
  meats: 'Carnes y pescados',
  dairy: 'Lácteos',
  cereals: 'Cereales y legumbres',
  other: 'Otros',
};

interface SelectedIngredient {
  ingredient: MasterIngredient;
  quantity: string;
  unit: string;
}

export default function RecipeFormScreen() {
  const { recipeId } = useLocalSearchParams<{ recipeId?: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const isEditing = !!recipeId;

  const goBack = () => {
    if (navigation.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/recipes');
    }
  };

  // Form state
  const [name, setName] = useState('');
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [servings, setServings] = useState('4');
  const [prepTime, setPrepTime] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState<SelectedIngredient[]>([]);

  // Ingredient picker state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MasterIngredient[]>([]);
  const [searching, setSearching] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  // UI state
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load existing recipe data for editing
  useEffect(() => {
    if (!isEditing) return;
    (async () => {
      try {
        const recipe = await RecipeService.getRecipe(recipeId);
        if (!recipe) return;
        setName(recipe.name);
        setMealType(recipe.meal_type);
        setServings(String(recipe.servings));
        setPrepTime(recipe.prep_time_minutes ? String(recipe.prep_time_minutes) : '');

        // Load ingredients
        const ingredients = await RecipeService.getRecipeIngredients(recipeId);
        const resolved = await Promise.all(
          ingredients.map(async (ing) => {
            const master = await IngredientService.getById(ing.ingredient_id);
            return {
              ingredient: master!,
              quantity: String(ing.quantity),
              unit: ing.unit,
            };
          }),
        );
        setSelectedIngredients(resolved.filter((r) => r.ingredient !== null));
      } catch (err) {
        console.error('[RecipeForm] Error loading recipe:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [recipeId, isEditing]);

  // Search ingredients with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await IngredientService.searchIngredients(searchQuery);
        // Filter out already selected ingredients
        const selectedIds = new Set(selectedIngredients.map((s) => s.ingredient.id));
        setSearchResults(results.filter((r) => !selectedIds.has(r.id)));
      } catch (err) {
        console.error('[RecipeForm] Search error:', err);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery, selectedIngredients]);

  const addIngredient = (ingredient: MasterIngredient) => {
    setSelectedIngredients((prev) => [
      ...prev,
      { ingredient, quantity: '100', unit: 'g' },
    ]);
    setSearchQuery('');
    setSearchResults([]);
    setShowPicker(false);
  };

  const removeIngredient = (index: number) => {
    setSelectedIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: 'quantity' | 'unit', value: string) => {
    setSelectedIngredients((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = t('recipeForm.validationName');
    if (selectedIngredients.length === 0)
      newErrors.ingredients = t('recipeForm.validationIngredients');
    if (!servings || parseInt(servings, 10) < 1)
      newErrors.servings = t('recipeForm.validationServings');

    // Validate all ingredient quantities are > 0
    const hasInvalidQty = selectedIngredients.some(
      (s) => !s.quantity || parseFloat(s.quantity) <= 0,
    );
    if (hasInvalidQty && !newErrors.ingredients)
      newErrors.ingredients = 'Todas las cantidades deben ser mayores que 0';

    // Validate all ingredients have a unit
    const hasEmptyUnit = selectedIngredients.some((s) => !s.unit.trim());
    if (hasEmptyUnit && !newErrors.ingredients)
      newErrors.ingredients = 'Todos los ingredientes necesitan una unidad';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const familyId = await getFamilyId();

      // Calculate nutritional values per ingredient and total
      let totalKcal = 0;
      let totalCarbs = 0;
      let totalFat = 0;
      let totalProtein = 0;

      const ingredients: IngredientInput[] = selectedIngredients.map((s) => {
        const qty = parseFloat(s.quantity) || 0;
        const nutPer100 = s.ingredient.nutritional_per_100g;
        let nutForQty = null;

        // Calculate proportional nutrition if unit is grams-based and data exists
        if (nutPer100 && qty > 0) {
          const factor = qty / 100;
          nutForQty = {
            kcal: Math.round(nutPer100.kcal * factor),
            carbs: Math.round(nutPer100.carbs * factor * 10) / 10,
            fat: Math.round(nutPer100.fat * factor * 10) / 10,
            protein: Math.round(nutPer100.protein * factor * 10) / 10,
          };
          totalKcal += nutForQty.kcal;
          totalCarbs += nutForQty.carbs;
          totalFat += nutForQty.fat;
          totalProtein += nutForQty.protein;
        }

        return {
          ingredient_id: s.ingredient.id,
          quantity: qty,
          unit: s.unit,
          nutritional_for_quantity: nutForQty,
        };
      });

      const nutritionalTotal = totalKcal > 0
        ? {
            kcal: Math.round(totalKcal),
            carbs: Math.round(totalCarbs * 10) / 10,
            fat: Math.round(totalFat * 10) / 10,
            protein: Math.round(totalProtein * 10) / 10,
          }
        : null;

      const input: CreateRecipeInput = {
        name: name.trim(),
        meal_type: mealType,
        servings: parseInt(servings, 10),
        prep_time_minutes: prepTime ? parseInt(prepTime, 10) : null,
        ingredients,
        nutritional_total: nutritionalTotal,
      };

      if (isEditing) {
        await RecipeService.updateRecipe(recipeId, input);
      } else {
        await RecipeService.createRecipe(familyId, input);
      }

      goBack();
    } catch (err) {
      console.error('[RecipeForm] Save error:', err);
      Alert.alert(t('common.error'), t('recipeForm.saveError'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => goBack()}
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
          >
            <Text style={styles.backText}>← {t('common.cancel')}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditing ? t('recipeForm.editTitle') : t('recipeForm.createTitle')}
          </Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Recipe name */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>{t('recipeForm.name')}</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder={t('recipeForm.namePlaceholder')}
              placeholderTextColor={COLORS.mutedSoft}
              value={name}
              onChangeText={(v) => {
                setName(v);
                if (errors.name) setErrors((e) => ({ ...e, name: '' }));
              }}
              accessibilityLabel={t('recipeForm.name')}
            />
            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
          </View>

          {/* Meal type picker */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>{t('recipeForm.mealType')}</Text>
            <View style={styles.mealTypeRow}>
              {MEAL_TYPES.map((mt) => (
                <TouchableOpacity
                  key={mt.key}
                  style={[
                    styles.mealTypeChip,
                    mealType === mt.key && { backgroundColor: mt.color },
                  ]}
                  onPress={() => setMealType(mt.key)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: mealType === mt.key }}
                >
                  <Text
                    style={[
                      styles.mealTypeText,
                      mealType === mt.key && styles.mealTypeTextActive,
                    ]}
                  >
                    {mt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Servings + Prep time */}
          <View style={styles.rowFields}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>{t('recipeForm.servings')}</Text>
              <TextInput
                style={[styles.input, errors.servings && styles.inputError]}
                keyboardType="number-pad"
                value={servings}
                onChangeText={(v) => {
                  setServings(v);
                  if (errors.servings) setErrors((e) => ({ ...e, servings: '' }));
                }}
                accessibilityLabel={t('recipeForm.servings')}
              />
              {errors.servings ? (
                <Text style={styles.errorText}>{errors.servings}</Text>
              ) : null}
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>{t('recipeForm.prepTime')}</Text>
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                placeholder={t('recipeForm.prepTimePlaceholder')}
                placeholderTextColor={COLORS.mutedSoft}
                value={prepTime}
                onChangeText={setPrepTime}
                accessibilityLabel={t('recipeForm.prepTime')}
              />
            </View>
          </View>

          {/* Ingredients section */}
          <View style={styles.field}>
            <View style={styles.ingredientHeader}>
              <Text style={styles.fieldLabel}>{t('recipeForm.ingredients')}</Text>
              {errors.ingredients ? (
                <Text style={styles.errorText}>{errors.ingredients}</Text>
              ) : null}
            </View>

            {/* Selected ingredients */}
            {selectedIngredients.map((item, index) => (
              <View key={`${item.ingredient.id}-${index}`} style={styles.ingredientItem}>
                <View style={styles.ingredientInfo}>
                  <Text style={styles.ingredientName} numberOfLines={1}>
                    {item.ingredient.canonical_name}
                  </Text>
                  <Text style={styles.ingredientCategory}>
                    {CATEGORY_LABELS[item.ingredient.category] ?? item.ingredient.category}
                  </Text>
                </View>
                <TextInput
                  style={styles.qtyInput}
                  keyboardType="decimal-pad"
                  value={item.quantity}
                  onChangeText={(v) => updateIngredient(index, 'quantity', v)}
                  accessibilityLabel={`${t('recipeForm.quantity')} ${item.ingredient.canonical_name}`}
                />
                <TextInput
                  style={styles.unitInput}
                  value={item.unit}
                  onChangeText={(v) => updateIngredient(index, 'unit', v)}
                  placeholder={t('recipeForm.unitPlaceholder')}
                  placeholderTextColor={COLORS.mutedSoft}
                  accessibilityLabel={`${t('recipeForm.unit')} ${item.ingredient.canonical_name}`}
                />
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => removeIngredient(index)}
                  accessibilityRole="button"
                  accessibilityLabel={`${t('recipeForm.removeIngredient')} ${item.ingredient.canonical_name}`}
                >
                  <Text style={styles.removeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}

            {/* Add ingredient button / picker */}
            {showPicker ? (
              <View style={styles.pickerContainer}>
                <TextInput
                  style={styles.pickerSearch}
                  placeholder={t('recipeForm.searchIngredient')}
                  placeholderTextColor={COLORS.mutedSoft}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus
                  accessibilityLabel={t('recipeForm.searchIngredient')}
                />
                {searching && (
                  <ActivityIndicator
                    size="small"
                    color={COLORS.primary}
                    style={{ marginVertical: 8 }}
                  />
                )}
                {searchResults.length > 0 && (
                  <View style={styles.searchResultsList}>
                    {searchResults.slice(0, 8).map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={styles.searchResultItem}
                        onPress={() => addIngredient(item)}
                        accessibilityRole="button"
                      >
                        <Text style={styles.searchResultName}>
                          {item.canonical_name}
                        </Text>
                        <Text style={styles.searchResultCategory}>
                          {CATEGORY_LABELS[item.category] ?? item.category}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                {searchQuery.trim() && !searching && searchResults.length === 0 && (
                  <Text style={styles.noResults}>{t('recipes.emptyState')}</Text>
                )}
                <TouchableOpacity
                  style={styles.cancelPickerBtn}
                  onPress={() => {
                    setShowPicker(false);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  accessibilityRole="button"
                >
                  <Text style={styles.cancelPickerText}>{t('common.cancel')}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addIngredientBtn}
                onPress={() => setShowPicker(true)}
                accessibilityRole="button"
              >
                <Text style={styles.addIngredientText}>
                  + {t('recipeForm.addIngredient')}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Nutritional preview (auto-calculated) */}
          <NutritionPreview ingredients={selectedIngredients} />

          {/* Bottom spacing */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Save button */}
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
            accessibilityRole="button"
          >
            <Text style={styles.saveBtnText}>
              {saving ? t('common.loading') : t('common.save')}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function NutritionPreview({ ingredients }: { ingredients: SelectedIngredient[] }) {
  if (ingredients.length === 0) return null;

  let totalKcal = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalProtein = 0;
  let hasData = false;

  for (const s of ingredients) {
    const qty = parseFloat(s.quantity) || 0;
    const nutPer100 = s.ingredient.nutritional_per_100g;
    if (nutPer100 && qty > 0) {
      const factor = qty / 100;
      totalKcal += nutPer100.kcal * factor;
      totalCarbs += nutPer100.carbs * factor;
      totalFat += nutPer100.fat * factor;
      totalProtein += nutPer100.protein * factor;
      hasData = true;
    }
  }

  if (!hasData) return null;

  return (
    <View style={styles.nutritionPreview}>
      <Text style={styles.nutritionPreviewTitle}>Valores nutricionales (estimados)</Text>
      <View style={styles.nutritionRow}>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionValue}>{Math.round(totalKcal)}</Text>
          <Text style={styles.nutritionLabel}>kcal</Text>
        </View>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionValue}>{Math.round(totalProtein * 10) / 10}g</Text>
          <Text style={styles.nutritionLabel}>Proteínas</Text>
        </View>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionValue}>{Math.round(totalCarbs * 10) / 10}g</Text>
          <Text style={styles.nutritionLabel}>Carbos</Text>
        </View>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionValue}>{Math.round(totalFat * 10) / 10}g</Text>
          <Text style={styles.nutritionLabel}>Grasas</Text>
        </View>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.canvas },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.hairline,
  },
  backButton: { paddingVertical: 8, minHeight: 48, justifyContent: 'center' },
  backText: { fontSize: 15, fontWeight: '600', color: COLORS.primary },
  headerTitle: { fontSize: 18, fontWeight: '600', color: COLORS.ink },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },

  // Fields
  field: { marginBottom: 20 },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.2,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.hairline,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.ink,
    minHeight: 48,
  },
  inputError: { borderColor: COLORS.error },
  errorText: { fontSize: 12, color: COLORS.error, marginTop: 4 },
  rowFields: { flexDirection: 'row', gap: 12 },

  // Meal type
  mealTypeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  mealTypeChip: {
    backgroundColor: COLORS.surfaceWarm,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    minHeight: 40,
    justifyContent: 'center',
  },
  mealTypeText: { fontSize: 13, fontWeight: '600', color: COLORS.body },
  mealTypeTextActive: { color: COLORS.onPrimary },

  // Ingredients
  ingredientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  ingredientInfo: { flex: 1, minWidth: 0 },
  ingredientName: { fontSize: 14, fontWeight: '600', color: COLORS.ink },
  ingredientCategory: { fontSize: 11, color: COLORS.muted, marginTop: 1 },
  qtyInput: {
    width: 60,
    backgroundColor: COLORS.surfaceWarm,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
    color: COLORS.ink,
    textAlign: 'center',
  },
  unitInput: {
    width: 50,
    backgroundColor: COLORS.surfaceWarm,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
    color: COLORS.ink,
    textAlign: 'center',
  },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeBtnText: { fontSize: 16, color: COLORS.error, fontWeight: '600' },

  // Picker
  pickerContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  pickerSearch: {
    backgroundColor: COLORS.surfaceWarm,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.ink,
  },
  searchResultsList: { marginTop: 8 },
  searchResultItem: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.hairline,
  },
  searchResultName: { fontSize: 15, color: COLORS.ink, fontWeight: '500' },
  searchResultCategory: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  noResults: {
    fontSize: 13,
    color: COLORS.mutedSoft,
    textAlign: 'center',
    paddingVertical: 12,
  },
  cancelPickerBtn: {
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 8,
  },
  cancelPickerText: { fontSize: 14, color: COLORS.muted, fontWeight: '600' },
  addIngredientBtn: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addIngredientText: { fontSize: 15, color: COLORS.primary, fontWeight: '600' },

  // Action bar
  actionBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.canvas,
    borderTopWidth: 1,
    borderTopColor: COLORS.hairline,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: COLORS.onPrimary, fontSize: 15, fontWeight: '700' },

  // Nutrition preview
  nutritionPreview: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  nutritionPreviewTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.2,
    marginBottom: 12,
  },
  nutritionRow: { flexDirection: 'row', gap: 8 },
  nutritionItem: {
    flex: 1,
    backgroundColor: COLORS.primarySoft,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  nutritionValue: { fontSize: 16, fontWeight: '700', color: COLORS.primary },
  nutritionLabel: { fontSize: 11, fontWeight: '500', color: COLORS.muted, marginTop: 2 },
});
