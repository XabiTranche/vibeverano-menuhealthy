import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { RecipeService } from '../../services/RecipeService';
import { supabase } from '../../lib/supabase';
import { getFamilyId } from '../../lib/familyHelper';
import type { BaseCatalogRecipe, FamilyRecipe, MealType } from '../../types/database';

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

type CatalogTab = 'base' | 'family';

// Unified shape so both tabs can share the same RecipeCard
interface DisplayRecipe {
  id: string;
  name: string;
  meal_type: MealType;
  servings: number;
  nutritional_total: { kcal: number; carbs: number; fat: number; protein: number } | null;
  compatibility_tags: string[];
  prep_time_minutes: number | null;
  source: 'base' | 'family';
}

function toDisplayRecipe(r: BaseCatalogRecipe): DisplayRecipe {
  return {
    id: r.id,
    name: r.name,
    meal_type: r.meal_type,
    servings: r.servings,
    nutritional_total: r.nutritional_total,
    compatibility_tags: r.compatibility_tags,
    prep_time_minutes: null,
    source: 'base',
  };
}

function familyToDisplayRecipe(r: FamilyRecipe): DisplayRecipe {
  return {
    id: r.id,
    name: r.name,
    meal_type: r.meal_type,
    servings: r.servings,
    nutritional_total: r.nutritional_total,
    compatibility_tags: [],
    prep_time_minutes: r.prep_time_minutes,
    source: 'family',
  };
}

export default function RecipesScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const [catalogTab, setCatalogTab] = useState<CatalogTab>('base');
  const [baseRecipes, setBaseRecipes] = useState<BaseCatalogRecipe[]>([]);
  const [familyRecipes, setFamilyRecipes] = useState<FamilyRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState<MealType | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [inUseRecipeIds, setInUseRecipeIds] = useState<Set<string>>(new Set());

  const loadRecipes = useCallback(async () => {
    try {
      const familyId = await getFamilyId();

      // Load both catalogs in parallel
      const [baseData, familyData] = await Promise.all([
        RecipeService.getBaseCatalog(),
        RecipeService.searchRecipes(familyId, {}),
      ]);
      setBaseRecipes(baseData);
      setFamilyRecipes(familyData);

      // Reset in-use state
      setInUseRecipeIds(new Set());

      // Check current approved week for in-use indicator
      const today = new Date().toISOString().split('T')[0];
      const { data: approvedWeeks } = await supabase
        .from('planned_weeks')
        .select('id')
        .eq('family_id', familyId)
        .eq('status', 'approved')
        .lte('start_date', today)
        .gte('end_date', today)
        .limit(1);

      if (approvedWeeks && approvedWeeks.length > 0) {
        const weekIds = approvedWeeks.map((w) => w.id);
        const { data: proposals } = await supabase
          .from('menu_proposals')
          .select('id')
          .in('week_id', weekIds);

        if (proposals && proposals.length > 0) {
          const proposalIds = proposals.map((p) => p.id);
          const { data: meals } = await supabase
            .from('planned_meals')
            .select('base_recipe_id, recipe_id')
            .in('proposal_id', proposalIds);

          if (meals) {
            const ids = new Set<string>();
            for (const meal of meals) {
              if (meal.base_recipe_id) ids.add(meal.base_recipe_id);
              if (meal.recipe_id) ids.add(meal.recipe_id);
            }
            setInUseRecipeIds(ids);
          }
        }
      }
    } catch (err) {
      console.error('[RecipesScreen] Error loading recipes:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRecipes();
    }, [loadRecipes]),
  );

  // Build display list based on active tab
  const displayRecipes: DisplayRecipe[] =
    catalogTab === 'base'
      ? baseRecipes.map(toDisplayRecipe)
      : familyRecipes.map(familyToDisplayRecipe);

  const filteredRecipes = displayRecipes.filter((r) => {
    const matchesSearch =
      !searchText.trim() ||
      r.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesFilter = !activeFilter || r.meal_type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const onRefresh = () => {
    setRefreshing(true);
    loadRecipes();
  };

  const handleRecipePress = (recipe: DisplayRecipe) => {
    if (recipe.source === 'base') {
      router.push(`/recipe/${recipe.id}?source=base`);
    } else {
      router.push(`/recipe/${recipe.id}`);
    }
  };

  const handleNewRecipe = () => {
    router.push('/recipe/form');
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
      <Text style={styles.title}>{t('recipes.title')}</Text>

      {/* Catalog toggle: Base / Mis recetas */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, catalogTab === 'base' && styles.toggleBtnActive]}
          onPress={() => setCatalogTab('base')}
          accessibilityRole="button"
          accessibilityState={{ selected: catalogTab === 'base' }}
        >
          <Text style={[styles.toggleText, catalogTab === 'base' && styles.toggleTextActive]}>
            Catálogo base
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, catalogTab === 'family' && styles.toggleBtnActive]}
          onPress={() => setCatalogTab('family')}
          accessibilityRole="button"
          accessibilityState={{ selected: catalogTab === 'family' }}
        >
          <Text style={[styles.toggleText, catalogTab === 'family' && styles.toggleTextActive]}>
            Mis recetas
          </Text>
          {familyRecipes.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{familyRecipes.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder={t('recipes.searchPlaceholder')}
          placeholderTextColor={COLORS.mutedSoft}
          value={searchText}
          onChangeText={setSearchText}
          accessibilityLabel={t('recipes.searchPlaceholder')}
        />
      </View>

      {/* Filter Chips */}
      <View style={styles.filterRow}>
        {(Object.keys(MEAL_TYPE_LABELS) as MealType[]).map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.chip, activeFilter === type && styles.chipActive]}
            onPress={() => setActiveFilter(activeFilter === type ? null : type)}
            accessibilityRole="button"
            accessibilityState={{ selected: activeFilter === type }}
          >
            <Text style={[styles.chipText, activeFilter === type && styles.chipTextActive]}>
              {MEAL_TYPE_LABELS[type]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recipe List */}
      <FlatList
        data={filteredRecipes}
        keyExtractor={(item) => `${item.source}-${item.id}`}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        renderItem={({ item }) => (
          <RecipeCard
            recipe={item}
            inUse={inUseRecipeIds.has(item.id)}
            onPress={() => handleRecipePress(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {catalogTab === 'family'
                ? 'Aún no tienes recetas propias. Copia una del catálogo base o crea una nueva.'
                : t('recipes.emptyState')}
            </Text>
          </View>
        }
      />

      {/* New Recipe Button — only on "Mis recetas" tab */}
      {catalogTab === 'family' && (
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleNewRecipe}
          accessibilityRole="button"
        >
          <Text style={styles.primaryButtonText}>{t('recipes.newRecipe')}</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

function RecipeCard({
  recipe,
  inUse,
  onPress,
}: {
  recipe: DisplayRecipe;
  inUse: boolean;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const color = MEAL_TYPE_COLORS[recipe.meal_type];
  const nutritional = recipe.nutritional_total;

  return (
    <TouchableOpacity
      style={styles.recipeCard}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={recipe.name}
    >
      {/* Color sidebar — 3px indicator per DESIGN.md */}
      <View style={[styles.recipeSidebar, { backgroundColor: color }]} />

      {/* Photo placeholder */}
      <View style={[styles.recipePhoto, { backgroundColor: `${color}15` }]}>
        <Text style={styles.recipeEmoji}>🍽️</Text>
      </View>

      {/* Content */}
      <View style={styles.recipeContent}>
        <View style={styles.recipeNameRow}>
          <Text style={styles.recipeName} numberOfLines={2}>
            {recipe.name}
          </Text>
          {inUse && (
            <View style={styles.inUseDot} accessibilityLabel={t('recipes.inUse')}>
              <View style={styles.inUseDotInner} />
            </View>
          )}
        </View>

        {/* Tags row */}
        <View style={styles.tagRow}>
          <View style={[styles.mealTag, { backgroundColor: `${color}20` }]}>
            <Text style={[styles.mealTagText, { color }]}>
              {MEAL_TYPE_LABELS[recipe.meal_type]}
            </Text>
          </View>
          {recipe.source === 'family' && (
            <View style={styles.sourceTag}>
              <Text style={styles.sourceTagText}>Propia</Text>
            </View>
          )}
          {recipe.compatibility_tags.slice(0, 2).map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag.replace('sin_', 'Sin ')}</Text>
            </View>
          ))}
          {recipe.compatibility_tags.length > 2 && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>+{recipe.compatibility_tags.length - 2}</Text>
            </View>
          )}
        </View>

        {/* Nutritional badges + servings + prep time */}
        <View style={styles.badgeRow}>
          {nutritional && (
            <>
              <View style={styles.nutrientBadge}>
                <Text style={styles.nutrientBadgeText}>{nutritional.kcal} kcal</Text>
              </View>
              <View style={styles.nutrientBadge}>
                <Text style={styles.nutrientBadgeText}>{nutritional.protein}g prot</Text>
              </View>
            </>
          )}
          {recipe.prep_time_minutes && (
            <View style={styles.timeBadge}>
              <Text style={styles.timeBadgeText}>{recipe.prep_time_minutes} min</Text>
            </View>
          )}
          <View style={styles.timeBadge}>
            <Text style={styles.timeBadgeText}>
              {recipe.servings} {recipe.servings === 1 ? 'ración' : 'raciones'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.canvas },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.ink,
    paddingHorizontal: 16,
    paddingTop: 8,
    letterSpacing: -0.3,
  },

  // Toggle
  toggleRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: COLORS.surfaceWarm,
    borderRadius: 12,
    padding: 3,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  toggleBtnActive: {
    backgroundColor: COLORS.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  toggleText: { fontSize: 13, fontWeight: '600', color: COLORS.muted },
  toggleTextActive: { color: COLORS.ink },
  countBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 9999,
    paddingHorizontal: 6,
    paddingVertical: 1,
    minWidth: 20,
    alignItems: 'center',
  },
  countBadgeText: { fontSize: 11, fontWeight: '700', color: COLORS.onPrimary },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.surfaceWarm,
    borderRadius: 12,
    minHeight: 44,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: COLORS.ink },

  // Filters
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 12, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceWarm,
  },
  chipActive: { backgroundColor: COLORS.primary },
  chipText: { fontSize: 12, color: COLORS.body, fontWeight: '600', letterSpacing: 0.2 },
  chipTextActive: { color: COLORS.onPrimary },

  // List
  listContent: { paddingHorizontal: 16, paddingBottom: 80 },
  emptyState: { alignItems: 'center', paddingTop: 40, paddingHorizontal: 32 },
  emptyText: { fontSize: 15, color: COLORS.mutedSoft, textAlign: 'center', lineHeight: 22 },

  // Recipe Card
  recipeCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginBottom: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  recipeSidebar: { width: 3 },
  recipePhoto: {
    width: 64,
    height: 64,
    borderRadius: 12,
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipeEmoji: { fontSize: 24 },
  recipeContent: { flex: 1, paddingVertical: 10, paddingRight: 12 },
  recipeNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  recipeName: { flex: 1, fontSize: 16, fontWeight: '600', color: COLORS.ink, marginBottom: 4 },

  // In-use dot
  inUseDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inUseDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },

  // Tags
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 4 },
  mealTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  mealTagText: { fontSize: 11, fontWeight: '600' },
  sourceTag: {
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sourceTagText: { fontSize: 11, fontWeight: '600', color: COLORS.primary },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.hairline,
  },
  tagText: { fontSize: 11, color: COLORS.muted },

  // Badges
  badgeRow: { flexDirection: 'row', gap: 6 },
  nutrientBadge: {
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  nutrientBadgeText: { fontSize: 11, fontWeight: '500', color: COLORS.primary },
  timeBadge: {
    backgroundColor: COLORS.surfaceWarm,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  timeBadgeText: { fontSize: 11, fontWeight: '500', color: COLORS.muted },

  // Primary Button
  primaryButton: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: { color: COLORS.onPrimary, fontSize: 15, fontWeight: '700' },
});
