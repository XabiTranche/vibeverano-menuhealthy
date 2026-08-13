import { useEffect, useState, useCallback } from 'react';
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
import { useTranslation } from 'react-i18next';
import { RecipeService } from '../../services/RecipeService';
import type { BaseCatalogRecipe, MealType } from '../../types/database';

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: 'Desayuno',
  lunch: 'Comida',
  dinner: 'Cena',
  snack: 'Snack',
};

const MEAL_TYPE_COLORS: Record<MealType, string> = {
  breakfast: '#F5A623',
  lunch: '#7ED321',
  dinner: '#9B59B6',
  snack: '#E07C4F',
};

export default function RecipesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [recipes, setRecipes] = useState<BaseCatalogRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState<MealType | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadRecipes = useCallback(async () => {
    try {
      console.log('[RecipesScreen] Loading recipes from Supabase...');
      const data = await RecipeService.getBaseCatalog();
      console.log('[RecipesScreen] Got recipes:', data.length);
      setRecipes(data);
    } catch (err) {
      console.error('[RecipesScreen] Error loading recipes:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  const filteredRecipes = recipes.filter((r) => {
    const matchesSearch = !searchText.trim() ||
      r.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesFilter = !activeFilter || r.meal_type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const onRefresh = () => {
    setRefreshing(true);
    loadRecipes();
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
      <Text style={styles.title}>Recetas</Text>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar plato o ingrediente..."
          placeholderTextColor="#9E9E9E"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Filter Chips */}
      <View style={styles.filterRow}>
        {(Object.keys(MEAL_TYPE_LABELS) as MealType[]).map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.chip,
              activeFilter === type && styles.chipActive,
            ]}
            onPress={() => setActiveFilter(activeFilter === type ? null : type)}
          >
            <Text style={[
              styles.chipText,
              activeFilter === type && styles.chipTextActive,
            ]}>
              {MEAL_TYPE_LABELS[type]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recipe List */}
      <FlatList
        data={filteredRecipes}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4CAF50" />
        }
        renderItem={({ item }) => (
          <RecipeCard recipe={item} />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No se encontraron recetas</Text>
          </View>
        }
      />

      {/* New Recipe Button */}
      <TouchableOpacity style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>Nueva receta</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function RecipeCard({ recipe }: { recipe: BaseCatalogRecipe }) {
  const color = MEAL_TYPE_COLORS[recipe.meal_type];
  const nutritional = recipe.nutritional_total;

  return (
    <View style={styles.recipeCard}>
      {/* Color sidebar */}
      <View style={[styles.recipeSidebar, { backgroundColor: color }]} />

      {/* Photo placeholder */}
      <View style={[styles.recipePhoto, { backgroundColor: `${color}20` }]}>
        <Text style={styles.recipeEmoji}>🍽️</Text>
      </View>

      {/* Content */}
      <View style={styles.recipeContent}>
        <Text style={styles.recipeName} numberOfLines={2}>{recipe.name}</Text>

        {/* Tags */}
        <View style={styles.tagRow}>
          <Text style={[styles.tag, { borderColor: color }]}>
            {MEAL_TYPE_LABELS[recipe.meal_type]}
          </Text>
          {recipe.compatibility_tags.slice(0, 2).map((tag) => (
            <Text key={tag} style={styles.tag}>{tag.replace('sin_', 'Sin ')}</Text>
          ))}
        </View>

        {/* Nutritional badges */}
        {nutritional && (
          <View style={styles.badgeRow}>
            <Text style={styles.badge}>{nutritional.kcal} kcal</Text>
            <Text style={styles.badge}>{nutritional.protein}g prot</Text>
            <Text style={styles.badgeTime}>
              {recipe.servings} {recipe.servings === 1 ? 'ración' : 'raciones'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  title: { fontSize: 28, fontWeight: '700', color: '#1a1a1a', paddingHorizontal: 16, paddingTop: 8 },

  // Search
  searchBar: { flexDirection: 'row', alignItems: 'center', margin: 16, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#FFF8F0', borderRadius: 8 },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: '#1a1a1a' },

  // Filters
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 12, gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#FFF8F0', borderWidth: 1, borderColor: '#E0D5C8' },
  chipActive: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  chipText: { fontSize: 13, color: '#757575', fontWeight: '500' },
  chipTextActive: { color: '#FFFFFF' },

  // List
  listContent: { paddingHorizontal: 16, paddingBottom: 80 },
  emptyState: { alignItems: 'center', paddingTop: 40 },
  emptyText: { fontSize: 15, color: '#9E9E9E' },

  // Recipe Card
  recipeCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 12, marginBottom: 8, overflow: 'hidden', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  recipeSidebar: { width: 3 },
  recipePhoto: { width: 64, height: 64, borderRadius: 8, margin: 10, justifyContent: 'center', alignItems: 'center' },
  recipeEmoji: { fontSize: 24 },
  recipeContent: { flex: 1, paddingVertical: 10, paddingRight: 12 },
  recipeName: { fontSize: 15, fontWeight: '600', color: '#1a1a1a', marginBottom: 4 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 4 },
  tag: { fontSize: 11, color: '#757575', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#E0D5C8' },
  badgeRow: { flexDirection: 'row', gap: 6 },
  badge: { fontSize: 11, color: '#4CAF50', backgroundColor: '#E8F5E9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  badgeTime: { fontSize: 11, color: '#757575', backgroundColor: '#FFF8F0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },

  // Primary Button
  primaryButton: { position: 'absolute', bottom: 16, left: 16, right: 16, backgroundColor: '#4CAF50', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
