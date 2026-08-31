import { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Animated,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import {
  ShoppingService,
  type ShoppingList,
  type ShoppingItem,
} from '../../services/ShoppingService';
import { PlannerService } from '../../services/PlannerService';
import type { IngredientCategory } from '../../types/database';

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
  warning: '#e6a817',
};

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
      const monday = getMonday(new Date());
      const startDate = monday.toISOString().split('T')[0];
      const week = await PlannerService.getCurrentWeek(startDate);

      if (!week) {
        setList(null); setItems([]); setWeekId(null); return;
      }
      setWeekId(week.id);

      const existing = await ShoppingService.getListForWeek(week.id);
      if (existing) {
        setList(existing);
        const listItems = await ShoppingService.getItems(existing.id);
        setItems(listItems);
      } else {
        setList(null); setItems([]);
      }
    } catch (err) {
      console.error('[ShoppingScreen] Error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadList(); }, [loadList]));

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
    } finally { setGenerating(false); }
  };

  const handleTapItem = async (item: ShoppingItem) => {
    try {
      if (item.status === 'pending') {
        await ShoppingService.markBought(item.id);
        setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: 'bought' } : i)));
      } else if (item.status === 'bought') {
        await ShoppingService.unmarkItem(item.id);
        setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: 'pending' } : i)));
      } else if (item.status === 'available_at_home') {
        await ShoppingService.unmarkItem(item.id);
        setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: 'pending' } : i)));
      }
    } catch (err) {
      console.error('[ShoppingScreen] Toggle error:', err);
    }
  };

  const handleSwipeLeft = async (item: ShoppingItem) => {
    if (item.status !== 'pending') return;
    try {
      await ShoppingService.markAvailable(item.id);
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: 'available_at_home' } : i)),
      );
    } catch (err) {
      console.error('[ShoppingScreen] Swipe error:', err);
    }
  };

  const onRefresh = () => { setRefreshing(true); loadList(); };

  const progress = ShoppingService.getProgress(items);

  // Pending + bought items grouped by category
  const pendingAndBought = items.filter((i) => i.status !== 'available_at_home');
  const sections = ShoppingService.getCategoryOrder()
    .map((cat) => ({
      title: CATEGORY_LABELS[cat],
      data: pendingAndBought.filter((i) => i.category === cat),
    }))
    .filter((s) => s.data.length > 0);

  // Available at home items (Cubierto section)
  const availableItems = items.filter((i) => i.status === 'available_at_home');
  if (availableItems.length > 0) {
    sections.push({ title: '✅ CUBIERTO', data: availableItems });
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

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

  if (!list) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Lista de la compra</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Lista no generada</Text>
          <Text style={styles.emptySubtitle}>
            Genera la lista de ingredientes a partir del menú aprobado
          </Text>
          <TouchableOpacity style={styles.generateButton} onPress={handleGenerate} disabled={generating}>
            {generating ? <ActivityIndicator color="#fff" /> : <Text style={styles.generateButtonText}>Generar lista</Text>}
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
        <View style={styles.progressBox}>
          <Text style={styles.progressCounter}>
            {progress.bought}/{progress.total - progress.available}
          </Text>
          {progress.available > 0 && (
            <Text style={styles.progressAvailable}>
              {progress.available} cubierto{progress.available !== 1 ? 's' : ''}
            </Text>
          )}
        </View>
      </View>

      {/* Swipe hint */}
      {progress.available === 0 && progress.bought === 0 && (
        <View style={styles.hintBar}>
          <Text style={styles.hintText}>💡 Desliza a la izquierda un ingrediente para marcar "ya lo tengo"</Text>
        </View>
      )}

      {/* Item list */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        renderSectionHeader={({ section }) => (
          <Text style={[
            styles.categoryHeader,
            section.title === '✅ CUBIERTO' && styles.coveredHeader,
          ]}>
            {section.title}
          </Text>
        )}
        renderItem={({ item }) => (
          <SwipeableItem
            item={item}
            onTap={() => handleTapItem(item)}
            onSwipeLeft={() => handleSwipeLeft(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false}
      />
    </SafeAreaView>
  );
}

function SwipeableItem({
  item,
  onTap,
  onSwipeLeft,
}: {
  item: ShoppingItem;
  onTap: () => void;
  onSwipeLeft: () => void;
}) {
  const translateX = useRef(new Animated.Value(0)).current;
  const SWIPE_THRESHOLD = -80;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to horizontal gestures
        return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow left swipe (negative dx), and only for pending items
        if (gestureState.dx < 0 && item.status === 'pending') {
          translateX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < SWIPE_THRESHOLD && item.status === 'pending') {
          // Animate out and trigger action
          Animated.timing(translateX, {
            toValue: -400,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            onSwipeLeft();
            translateX.setValue(0);
          });
        } else {
          // Snap back
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  const isBought = item.status === 'bought';
  const isAvailable = item.status === 'available_at_home';

  return (
    <View style={styles.swipeContainer}>
      {/* Background revealed on swipe */}
      {item.status === 'pending' && (
        <View style={styles.swipeBackground}>
          <Text style={styles.swipeBackgroundText}>Ya lo tengo</Text>
        </View>
      )}

      <Animated.View
        style={[{ transform: [{ translateX }] }]}
        {...(item.status === 'pending' ? panResponder.panHandlers : {})}
      >
        <TouchableOpacity
          style={[
            styles.shopItem,
            isBought && styles.shopItemBought,
            isAvailable && styles.shopItemAvailable,
          ]}
          onPress={onTap}
          activeOpacity={0.7}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: isBought || isAvailable }}
          accessibilityLabel={`${item.ingredient_name}${item.approximate_quantity ? `, ${item.approximate_quantity} ${item.unit}` : ''}`}
        >
          <View style={[
            styles.checkbox,
            isBought && styles.checkboxChecked,
            isAvailable && styles.checkboxAvailable,
          ]}>
            {isBought && <Text style={styles.checkmark}>✓</Text>}
            {isAvailable && <Text style={styles.checkmarkAvailable}>🏠</Text>}
          </View>
          <Text style={[
            styles.itemName,
            isBought && styles.itemNameBought,
            isAvailable && styles.itemNameAvailable,
          ]}>
            {item.ingredient_name}
          </Text>
          {item.approximate_quantity != null && (
            <Text style={styles.itemQty}>
              {item.approximate_quantity} {item.unit}
            </Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.canvas },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: { fontSize: 28, fontWeight: '700', color: COLORS.ink, letterSpacing: -0.3 },
  subtitle: { fontSize: 13, color: COLORS.muted, marginTop: 2 },
  progressBox: { alignItems: 'flex-end', marginTop: 8 },
  progressCounter: { fontSize: 18, fontWeight: '700', color: COLORS.primary },
  progressAvailable: { fontSize: 11, color: COLORS.muted, marginTop: 2 },

  // Hint
  hintBar: {
    backgroundColor: COLORS.surfaceWarm,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  hintText: { fontSize: 13, color: COLORS.muted, textAlign: 'center' },

  // Empty states
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.ink, marginBottom: 8 },
  emptySubtitle: { fontSize: 15, color: COLORS.muted, textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  generateButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    minHeight: 48,
    justifyContent: 'center',
  },
  generateButtonText: { color: COLORS.onPrimary, fontSize: 16, fontWeight: '600' },

  // List
  listContent: { paddingHorizontal: 16, paddingBottom: 32 },

  // Category headers
  categoryHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.mutedSoft,
    letterSpacing: 0.5,
    marginTop: 20,
    marginBottom: 8,
  },
  coveredHeader: {
    color: COLORS.primary,
    marginTop: 32,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.hairline,
  },

  // Swipe
  swipeContainer: { position: 'relative', overflow: 'hidden', marginBottom: 2 },
  swipeBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '100%',
    backgroundColor: COLORS.warning,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 20,
  },
  swipeBackgroundText: { color: COLORS.onPrimary, fontSize: 14, fontWeight: '700' },

  // Shopping item
  shopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    minHeight: 52,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  shopItemBought: { backgroundColor: COLORS.surfaceWarm },
  shopItemAvailable: { backgroundColor: COLORS.primarySoft },

  // Checkbox
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.hairline,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  checkboxAvailable: { backgroundColor: COLORS.surfaceWarm, borderColor: COLORS.primary },
  checkmark: { color: COLORS.onPrimary, fontSize: 14, fontWeight: '700' },
  checkmarkAvailable: { fontSize: 12 },

  // Item text
  itemName: { flex: 1, fontSize: 15, color: COLORS.ink },
  itemNameBought: { textDecorationLine: 'line-through', color: COLORS.mutedSoft },
  itemNameAvailable: { color: COLORS.muted },
  itemQty: { fontSize: 13, color: COLORS.mutedSoft, marginLeft: 8 },
});
