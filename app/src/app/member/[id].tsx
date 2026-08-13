import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import type {
  FamilyMember,
  DietaryRestriction,
  RestrictionCategory,
  NutritionalGoal,
  GoalType,
} from '../../types/database';

const CATEGORY_LABELS: Record<RestrictionCategory, string> = {
  allergy: 'Alergia',
  intolerance: 'Intolerancia',
  ethical_religious: 'Ética/Religiosa',
  preference: 'Preferencia',
};

const CATEGORY_COLORS: Record<RestrictionCategory, string> = {
  allergy: '#F44336',
  intolerance: '#FF9800',
  ethical_religious: '#9C27B0',
  preference: '#2196F3',
};

const GOAL_LABELS: Record<GoalType, string> = {
  lose_weight: 'Perder peso',
  maintain: 'Mantenimiento',
  gain_muscle: 'Ganar músculo',
};

export default function MemberDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [member, setMember] = useState<FamilyMember | null>(null);
  const [restrictions, setRestrictions] = useState<DietaryRestriction[]>([]);
  const [goals, setGoals] = useState<NutritionalGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddRestriction, setShowAddRestriction] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const { data: mem } = await supabase
        .from('family_members')
        .select('*')
        .eq('id', id)
        .single();
      setMember(mem);

      const { data: rests } = await supabase
        .from('dietary_restrictions')
        .select('*')
        .eq('member_id', id)
        .order('created_at');
      setRestrictions(rests ?? []);

      const { data: g } = await supabase
        .from('nutritional_goals')
        .select('*')
        .eq('member_id', id)
        .eq('is_active', true);
      setGoals(g ?? []);
    } catch (err) {
      console.error('[MemberDetail] Error:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const deleteRestriction = async (restrictionId: string) => {
    await supabase.from('dietary_restrictions').delete().eq('id', restrictionId);
    setRestrictions((prev) => prev.filter((r) => r.id !== restrictionId));
  };

  const deleteGoal = async (goalId: string) => {
    await supabase.from('nutritional_goals').delete().eq('id', goalId);
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
  };

  if (loading || !member) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Back button */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>

        {/* Member info */}
        <View style={styles.headerSection}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>{member.name.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.memberName}>{member.name}</Text>
          <Text style={styles.memberMeta}>{member.age} años · {member.sex === 'male' ? 'Hombre' : member.sex === 'female' ? 'Mujer' : 'Otro'}</Text>
        </View>

        {/* Restrictions */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Restricciones alimentarias</Text>
            <TouchableOpacity onPress={() => setShowAddRestriction(true)}>
              <Text style={styles.addButton}>+ Añadir</Text>
            </TouchableOpacity>
          </View>

          {restrictions.length === 0 ? (
            <Text style={styles.emptyText}>Sin restricciones registradas</Text>
          ) : (
            restrictions.map((r) => (
              <View key={r.id} style={styles.restrictionRow}>
                <View style={[styles.categoryDot, { backgroundColor: CATEGORY_COLORS[r.category] }]} />
                <View style={styles.restrictionInfo}>
                  <Text style={styles.restrictionName}>{r.name}</Text>
                  <Text style={styles.restrictionCategory}>{CATEGORY_LABELS[r.category]} · {r.severity === 'mandatory' ? 'Obligatoria' : 'Deseable'}</Text>
                </View>
                <TouchableOpacity onPress={() => deleteRestriction(r.id)}>
                  <Text style={styles.deleteBtn}>✕</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Goals */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Objetivos nutricionales</Text>
            <TouchableOpacity onPress={() => setShowAddGoal(true)}>
              <Text style={styles.addButton}>+ Añadir</Text>
            </TouchableOpacity>
          </View>

          {goals.length === 0 ? (
            <Text style={styles.emptyText}>Sin objetivos definidos</Text>
          ) : (
            goals.map((g) => (
              <View key={g.id} style={styles.goalRow}>
                <Text style={styles.goalIcon}>🎯</Text>
                <Text style={styles.goalText}>{GOAL_LABELS[g.goal_type] ?? g.goal_type}</Text>
                <TouchableOpacity onPress={() => deleteGoal(g.id)}>
                  <Text style={styles.deleteBtn}>✕</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Add Restriction Modal */}
      <AddRestrictionModal
        visible={showAddRestriction}
        onClose={() => setShowAddRestriction(false)}
        onSave={async (name, category) => {
          const severity = category === 'preference' ? 'desirable' : 'mandatory';
          await supabase.from('dietary_restrictions').insert({
            member_id: id,
            name,
            category,
            severity,
          });
          setShowAddRestriction(false);
          loadData();
        }}
      />

      {/* Add Goal Modal */}
      <AddGoalModal
        visible={showAddGoal}
        onClose={() => setShowAddGoal(false)}
        onSave={async (goalType) => {
          await supabase.from('nutritional_goals').insert({
            member_id: id,
            goal_type: goalType,
            is_active: true,
          });
          setShowAddGoal(false);
          loadData();
        }}
      />
    </SafeAreaView>
  );
}

function AddRestrictionModal({
  visible, onClose, onSave,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (name: string, category: RestrictionCategory) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<RestrictionCategory>('allergy');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await onSave(name.trim(), category);
    setName('');
    setSaving(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.content}>
          <Text style={modalStyles.title}>Nueva restricción</Text>

          <Text style={modalStyles.label}>Nombre</Text>
          <TextInput
            style={modalStyles.input}
            value={name}
            onChangeText={setName}
            placeholder="Ej: Gluten, Lactosa, Marisco..."
          />

          <Text style={modalStyles.label}>Tipo</Text>
          <View style={modalStyles.categoryRow}>
            {(Object.keys(CATEGORY_LABELS) as RestrictionCategory[]).map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[modalStyles.catChip, category === cat && { backgroundColor: CATEGORY_COLORS[cat] }]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[modalStyles.catText, category === cat && { color: '#fff' }]}>
                  {CATEGORY_LABELS[cat]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={modalStyles.hint}>
            {category === 'preference' ? 'Severidad: Deseable (no bloquea)' : 'Severidad: Obligatoria (bloquea en planificación)'}
          </Text>

          <View style={modalStyles.buttons}>
            <TouchableOpacity style={modalStyles.cancelBtn} onPress={onClose}>
              <Text style={modalStyles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={modalStyles.saveBtn} onPress={handleSave} disabled={saving}>
              <Text style={modalStyles.saveText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function AddGoalModal({
  visible, onClose, onSave,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (goalType: GoalType) => Promise<void>;
}) {
  const [selected, setSelected] = useState<GoalType>('maintain');

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.content}>
          <Text style={modalStyles.title}>Objetivo nutricional</Text>

          <View style={{ gap: 8, marginTop: 12 }}>
            {(Object.keys(GOAL_LABELS) as GoalType[]).map((g) => (
              <TouchableOpacity
                key={g}
                style={[modalStyles.goalOption, selected === g && modalStyles.goalOptionActive]}
                onPress={() => setSelected(g)}
              >
                <Text style={[modalStyles.goalOptionText, selected === g && { color: '#fff' }]}>
                  {GOAL_LABELS[g]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={[modalStyles.buttons, { marginTop: 20 }]}>
            <TouchableOpacity style={modalStyles.cancelBtn} onPress={onClose}>
              <Text style={modalStyles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={modalStyles.saveBtn} onPress={() => onSave(selected)}>
              <Text style={modalStyles.saveText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  content: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40 },
  title: { fontSize: 20, fontWeight: '700', color: '#1a1a1a', marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#757575', marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  hint: { fontSize: 12, color: '#9E9E9E', marginTop: 8 },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  catChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: '#F5F5F5' },
  catText: { fontSize: 12, fontWeight: '500', color: '#757575' },
  buttons: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#E0E0E0', alignItems: 'center' },
  cancelText: { fontSize: 16, color: '#757575' },
  saveBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#4CAF50', alignItems: 'center' },
  saveText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  goalOption: { paddingVertical: 14, paddingHorizontal: 16, borderRadius: 8, backgroundColor: '#F5F5F5' },
  goalOptionActive: { backgroundColor: '#4CAF50' },
  goalOptionText: { fontSize: 15, fontWeight: '500', color: '#1a1a1a' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  backBtn: { marginBottom: 8 },
  backText: { fontSize: 15, color: '#4CAF50', fontWeight: '500' },

  // Header
  headerSection: { alignItems: 'center', marginBottom: 24 },
  avatarLarge: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarLargeText: { fontSize: 28, fontWeight: '700', color: '#4CAF50' },
  memberName: { fontSize: 22, fontWeight: '700', color: '#1a1a1a' },
  memberMeta: { fontSize: 14, color: '#757575', marginTop: 4 },

  // Sections
  section: { marginTop: 24 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  addButton: { fontSize: 14, fontWeight: '600', color: '#4CAF50' },
  emptyText: { fontSize: 14, color: '#9E9E9E', fontStyle: 'italic' },

  // Restriction row
  restrictionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  categoryDot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  restrictionInfo: { flex: 1 },
  restrictionName: { fontSize: 15, fontWeight: '500', color: '#1a1a1a' },
  restrictionCategory: { fontSize: 12, color: '#757575', marginTop: 2 },
  deleteBtn: { fontSize: 16, color: '#BDBDBD', padding: 8 },

  // Goal row
  goalRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  goalIcon: { fontSize: 16, marginRight: 10 },
  goalText: { flex: 1, fontSize: 15, color: '#1a1a1a' },
});
