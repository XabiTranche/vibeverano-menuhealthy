import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ShoppingService,
  type ShoppingList,
  type ShoppingItem,
  type ShoppingProgress,
} from '../../services/ShoppingService';
import { PlannerService } from '../../services/PlannerService';
import type { IngredientCategory } from '../../types/database';

const CATEGORY_LABELS: Record<IngredientCategory, string> = {
  fruits_vegetables: 'FRUTAS Y VERDURAS',
  meats: 'CARNES Y PESCADOS',
  dairy: 'LÁCTEOS',
  cereals: 'CEREALES Y LEGUMBRES',
  other: 'OTROS',
};

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  return date;
}

export default function ShoppingScreen() {
  const [list, setList] = useState<ShoppingList | null>(null);
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [weekId, setWeekId] = useState<string | null>(null);

  const loadList = useCallback(async () => {
    try {
      // Find current week's approved plan
      const monday = getMonday(new Date());
      const startDate = monday.toISOString().split('T')[0];
      const week = await PlannerService.getCurrentWeek(startDate);

      if (!week) {
        setList(null);
        setItems([]);
        setWeekId(null);
        return;
      }

      setWeekId(week.id);

      // Check if list already exists
      const existing = await ShoppingService.getListForWeek(week.id);
      if (existing) {
        setList(existing);
        const listItems = await ShoppingService.getItems(existing.id);
        setItems(listItems);
      } else {
        setList(null);
        setItems([]);
      }
    } catch (err) {
      console.error('[ShoppingScreen] Error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const handleGenerate = async () => {
    if (!weekId) return;
    setGenerating(true);
    try {
      const newList = await ShoppingService.generateList(weekId);
      setList(newList);
      const listItems = await ShoppingService.getItems(newList.id);
      setItems(listItems);
    } catch (err) {
      console.error('[ShoppingScreen] Generate error:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleItem = async (item: ShoppingItem) => {
    try {
      if (item.status === 'pending') {
        await ShoppingService.markBought(item.id);
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, status: 'bought' } : i)),
        );
      } else {
        await ShoppingService.unmarkItem(item.id);
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, status: 'pending' } : i)),
        );
      }
    } catch (err) {
      console.error('[ShoppingScreen] Toggle error:', err);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadList();
  };

  const progress = ShoppingService.getProgress(items);

  // Group items by category for SectionList
  const sections = ShoppingService.getCategoryOrder()
    .map((cat) => ({
      title: CATEGORY_LABELS[cat],
      data: items.filter((i) => i.category === cat),
    }))
    .filter((s) => s.data.length > 0);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  // No approved week
  if (!weekId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Sin menú aprobado</Text>
          <Text style={styles.emptySubtitle}>
            Aprueba un menú semanal en la pestaña "Plan" para generar la lista de la compra
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Week exists but no list generated
  if (!list) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Lista de la compra</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Lista no generada</Text>
          <Text style={styles.emptySubtitle}>
            Genera la lista de ingredientes a partir del menú aprobado
          </Text>
          <TouchableOpacity
            style={styles.generateButton}
            onPress={handleGenerate}
            disabled={generating}
          >
            {generating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.generateButtonText}>Generar lista</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Lista de la compra</Text>
          <Text style={styles.subtitle}>Semana actual</Text>
        </View>
        <Text style={styles.progressCounter}>
          {progress.bought}/{progress.total}
        </Text>
      </View>

      {/* Item list */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4CAF50" />
        }
        renderSectionHeader={({ section }) => (
          <Text style={styles.categoryHeader}>{section.title}</Text>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.shopItem,
              item.status === 'bought' && styles.shopItemBought,
            ]}
            onPress={() => handleToggleItem(item)}
            activeOpacity={0.7}
          >
            <View style={[
              styles.checkbox,
              item.status === 'bought' && styles.checkboxChecked,
            ]}>
              {item.status === 'bought' && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </View>
            <Text style={[
              styles.itemName,
              item.status === 'bought' && styles.itemNameBought,
            ]}>
              {item.ingredient_name}
            </Text>
            {item.approximate_quantity && (
              <Text style={styles.itemQty}>
                {item.approximate_quantity} {item.unit}
              </Text>
            )}
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: '700', color: '#1a1a1a' },
  subtitle: { fontSize: 13, color: '#757575', marginTop: 2 },
  progressCounter: { fontSize: 18, fontWeight: '700', color: '#4CAF50', marginTop: 8 },

  // Empty states
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#1a1a1a', marginBottom: 8 },
  emptySubtitle: { fontSize: 15, color: '#757575', textAlign: 'center', marginBottom: 24 },
  generateButton: { backgroundColor: '#4CAF50', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 12 },
  generateButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  // List
  listContent: { paddingHorizontal: 16, paddingBottom: 32 },

  // Category headers (wireframe 04: uppercase, muted, no background)
  categoryHeader: { fontSize: 12, fontWeight: '600', color: '#9E9E9E', letterSpacing: 0.5, marginTop: 20, marginBottom: 8 },

  // Shopping item (wireframe 04: 52px height, 15px font)
  shopItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', minHeight: 52, paddingVertical: 12, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  shopItemBought: { backgroundColor: '#FFF8F0' },

  // Checkbox (wireframe 04: circular, grey border / green filled)
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  checkboxChecked: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  checkmark: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },

  // Item text
  itemName: { flex: 1, fontSize: 15, color: '#1a1a1a' },
  itemNameBought: { textDecorationLine: 'line-through', color: '#9E9E9E' },
  itemQty: { fontSize: 13, color: '#9E9E9E', marginLeft: 8 },
});
