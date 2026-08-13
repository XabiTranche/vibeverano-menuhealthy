import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { PlannerService, type PlannedWeek, type PlannedMeal } from '../../services/PlannerService';
import type { MealType } from '../../types/database';

const MEAL_TYPE_COLORS: Record<MealType, string> = {
  breakfast: '#F5A623',
  lunch: '#7ED321',
  dinner: '#9B59B6',
  snack: '#E07C4F',
};

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: 'desayuno',
  lunch: 'comida',
  dinner: 'cena',
  snack: 'snack',
};

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MONTH_NAMES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  return date;
}

function formatDateRange(start: Date, end: Date): string {
  const sDay = start.getDate();
  const eDay = end.getDate();
  const month = MONTH_NAMES[end.getMonth()];
  return `Semana del ${sDay} al ${eDay} ${month}`;
}

export default function PlanScreen() {
  const router = useRouter();
  const [week, setWeek] = useState<PlannedWeek | null>(null);
  const [meals, setMeals] = useState<PlannedMeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [approving, setApproving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentMonday, setCurrentMonday] = useState(() => getMonday(new Date()));

  const startDate = currentMonday.toISOString().split('T')[0];
  const endDate = new Date(currentMonday.getTime() + 6 * 86400000).toISOString().split('T')[0];

  const loadWeek = useCallback(async () => {
    try {
      const w = await PlannerService.getCurrentWeek(startDate);
      setWeek(w);
      if (w) {
        const proposal = await PlannerService.getProposal(w.id);
        if (proposal) {
          const m = await PlannerService.getMeals(proposal.id);
          setMeals(m);
        }
      } else {
        setMeals([]);
      }
    } catch (err) {
      console.error('[PlanScreen] Error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [startDate]);

  useEffect(() => {
    setLoading(true);
    loadWeek();
  }, [loadWeek]);

  useFocusEffect(
    useCallback(() => {
      loadWeek();
    }, [loadWeek])
  );

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const w = await PlannerService.generateWeek(startDate, endDate);
      setWeek(w);
      const proposal = await PlannerService.getProposal(w.id);
      if (proposal) {
        const m = await PlannerService.getMeals(proposal.id);
        setMeals(m);
      }
    } catch (err) {
      console.error('[PlanScreen] Generate error:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleApprove = async () => {
    if (!week) return;
    setApproving(true);
    try {
      const updated = await PlannerService.approveWeek(week.id);
      setWeek(updated);
    } catch (err) {
      console.error('[PlanScreen] Approve error:', err);
    } finally {
      setApproving(false);
    }
  };

  const navigateWeek = (direction: -1 | 1) => {
    setCurrentMonday((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + direction * 7);
      return next;
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadWeek();
  };

  // Group meals by day
  const mealsByDay = meals.reduce<Record<string, PlannedMeal[]>>((acc, meal) => {
    if (!acc[meal.day]) acc[meal.day] = [];
    acc[meal.day].push(meal);
    return acc;
  }, {});

  const days = getDaysBetween(startDate, endDate);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Week Selector */}
      <View style={styles.weekSelector}>
        <TouchableOpacity onPress={() => navigateWeek(-1)} style={styles.weekArrow}>
          <Text style={styles.weekArrowText}>←</Text>
        </TouchableOpacity>
        <View style={styles.weekCenter}>
          <Text style={styles.weekLabel}>
            {formatDateRange(currentMonday, new Date(endDate))}
          </Text>
          <StatusBadge status={week?.status ?? null} />
        </View>
        <TouchableOpacity onPress={() => navigateWeek(1)} style={styles.weekArrow}>
          <Text style={styles.weekArrowText}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {!week ? (
        // Empty state
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Genera tu menú semanal</Text>
          <Text style={styles.emptySubtitle}>
            El sistema creará un plan basado en las recetas del catálogo
          </Text>
          <TouchableOpacity
            style={styles.generateButton}
            onPress={handleGenerate}
            disabled={generating}
          >
            {generating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.generateButtonText}>Generar menú</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        // Week view with meals
        <>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4CAF50" />
            }
          >
            {days.map((day, index) => (
              <DaySection
                key={day}
                date={day}
                meals={mealsByDay[day] ?? []}
                showSeparator={index > 0}
              />
            ))}
          </ScrollView>

          {/* Approve button */}
          {week.status === 'draft' && (
            <TouchableOpacity
              style={styles.approveButton}
              onPress={handleApprove}
              disabled={approving}
            >
              {approving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.approveButtonText}>Aprobar semana</Text>
              )}
            </TouchableOpacity>
          )}

          {week.status === 'approved' && (
            <View style={styles.approvedBanner}>
              <Text style={styles.approvedText}>✓ Semana aprobada</Text>
            </View>
          )}
        </>
      )}
    </SafeAreaView>
  );
}

function StatusBadge({ status }: { status: string | null }) {
  if (!status) return null;

  const config: Record<string, { label: string; color: string }> = {
    draft: { label: '● En borrador', color: '#9E9E9E' },
    approved: { label: '✓ Aprobada', color: '#4CAF50' },
    incompatible: { label: '⚠ Incompatible', color: '#F44336' },
  };

  const { label, color } = config[status] ?? config.draft;

  return <Text style={[styles.statusBadge, { color }]}>{label}</Text>;
}

function DaySection({
  date,
  meals,
  showSeparator,
}: {
  date: string;
  meals: PlannedMeal[];
  showSeparator: boolean;
}) {
  const d = new Date(date + 'T12:00:00');
  const dayName = DAY_NAMES[d.getDay()];
  const dayNum = d.getDate();
  const month = MONTH_NAMES[d.getMonth()];

  const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

  return (
    <View>
      {showSeparator && <View style={styles.daySeparator} />}
      <Text style={styles.dayHeader}>{`${dayName} ${dayNum} ${month}`}</Text>
      {mealTypes.map((type) => {
        const meal = meals.find((m) => m.meal_type === type);
        if (meal && meal.status === 'planned') {
          return <MealCard key={type} meal={meal} mealType={type} />;
        }
        return <EmptySlot key={type} mealType={type} />;
      })}
    </View>
  );
}

function MealCard({ meal, mealType }: { meal: PlannedMeal; mealType: MealType }) {
  const router = useRouter();
  const color = MEAL_TYPE_COLORS[mealType];
  const nutritional = meal.recipe_nutritional;

  return (
    <View style={styles.mealCard}>
      <View style={[styles.mealSidebar, { backgroundColor: color }]} />
      <View style={styles.mealContent}>
        <Text style={styles.mealName} numberOfLines={2}>
          {meal.recipe_name ?? 'Receta'}
        </Text>
        {nutritional && (
          <View style={styles.mealBadges}>
            <Text style={styles.nutriBadge}>{nutritional.kcal} kcal</Text>
            <Text style={styles.nutriBadge}>{nutritional.protein}g prot</Text>
          </View>
        )}
      </View>
      <TouchableOpacity style={styles.swapButton} onPress={() => router.push(`/substitute/${meal.id}`)}>
        <Text style={styles.swapIcon}>⇄</Text>
      </TouchableOpacity>
    </View>
  );
}

function EmptySlot({ mealType }: { mealType: MealType }) {
  return (
    <TouchableOpacity style={styles.emptySlot}>
      <Text style={styles.emptySlotText}>+ Añadir {MEAL_TYPE_LABELS[mealType]}</Text>
    </TouchableOpacity>
  );
}

function getDaysBetween(start: string, end: string): string[] {
  const days: string[] = [];
  const current = new Date(start);
  const endDate = new Date(end);
  while (current <= endDate) {
    days.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  return days;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },

  // Week Selector
  weekSelector: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  weekArrow: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  weekArrowText: { fontSize: 20, color: '#1a1a1a' },
  weekCenter: { flex: 1, alignItems: 'center' },
  weekLabel: { fontSize: 16, fontWeight: '600', color: '#1a1a1a' },
  statusBadge: { fontSize: 13, fontWeight: '500', marginTop: 2 },

  // Empty state
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: '#1a1a1a', marginBottom: 8 },
  emptySubtitle: { fontSize: 15, color: '#757575', textAlign: 'center', marginBottom: 24 },
  generateButton: { backgroundColor: '#4CAF50', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 12 },
  generateButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  // Scroll
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 100 },

  // Day section
  daySeparator: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 16 },
  dayHeader: { fontSize: 14, fontWeight: '600', color: '#757575', marginBottom: 8, marginTop: 8 },

  // Meal Card (wireframe 01)
  mealCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 12, marginBottom: 8, overflow: 'hidden', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, minHeight: 64 },
  mealSidebar: { width: 3 },
  mealContent: { flex: 1, paddingVertical: 12, paddingLeft: 12, justifyContent: 'center' },
  mealName: { fontSize: 15, fontWeight: '500', color: '#1a1a1a', marginBottom: 4 },
  mealBadges: { flexDirection: 'row', gap: 6 },
  nutriBadge: { fontSize: 11, color: '#4CAF50', backgroundColor: '#E8F5E9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, overflow: 'hidden' },
  swapButton: { width: 52, justifyContent: 'center', alignItems: 'center' },
  swapIcon: { fontSize: 18, color: '#9E9E9E' },

  // Empty Slot
  emptySlot: { backgroundColor: '#FFF8F0', borderRadius: 12, borderWidth: 1, borderColor: '#E0D5C8', borderStyle: 'dashed', paddingVertical: 16, alignItems: 'center', marginBottom: 8 },
  emptySlotText: { fontSize: 14, fontWeight: '500', color: '#9E9E9E' },

  // Approve button
  approveButton: { position: 'absolute', bottom: 16, left: 16, right: 16, backgroundColor: '#4CAF50', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  approveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  // Approved banner
  approvedBanner: { position: 'absolute', bottom: 16, left: 16, right: 16, backgroundColor: '#E8F5E9', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  approvedText: { color: '#4CAF50', fontSize: 16, fontWeight: '600' },
});
