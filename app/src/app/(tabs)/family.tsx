import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { FamilyService } from '../../services/FamilyService';
import { getFamilyId } from '../../lib/familyHelper';
import type { Family, FamilyMember, MealType, Sex } from '../../types/database';
import { supabase } from '../../lib/supabase';


const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Desayuno',
  lunch: 'Comida',
  dinner: 'Cena',
  snack: 'Snack',
};

const GOAL_LABELS: Record<string, string> = {
  lose_weight: 'Perder peso',
  maintain: 'Mantenimiento',
  gain_muscle: 'Ganar músculo',
};

export default function FamilyScreen() {
  const router = useRouter();
  const [family, setFamily] = useState<Family | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [restrictions, setRestrictions] = useState<Array<{ name: string; member_name: string }>>([]);
  const [goals, setGoals] = useState<Array<{ member_id: string; goal_type: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const loadFamily = useCallback(async () => {
    try {
      const familyId = await getFamilyId();
      const fam = await FamilyService.getFamily(familyId);
      setFamily(fam);

      if (fam) {
        const mems = await FamilyService.getActiveMembers(fam.id);
        setMembers(mems);

        // Load restrictions for all members
        if (mems.length > 0) {
          const memberIds = mems.map((m) => m.id);
          const { data: rests } = await supabase
            .from('dietary_restrictions')
            .select('name, member_id')
            .in('member_id', memberIds);

          const restWithNames = (rests ?? []).map((r) => ({
            name: r.name,
            member_name: mems.find((m) => m.id === r.member_id)?.name ?? '',
          }));
          setRestrictions(restWithNames);

          // Load goals
          const { data: g } = await supabase
            .from('nutritional_goals')
            .select('member_id, goal_type')
            .in('member_id', memberIds)
            .eq('is_active', true);
          setGoals(g ?? []);
        }
      }
    } catch (err) {
      console.error('[FamilyScreen] Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFamily();
  }, [loadFamily]);

  useFocusEffect(
    useCallback(() => {
      loadFamily();
    }, [loadFamily])
  );

  const getReadiness = (): { ready: boolean; missing: string[] } => {
    const missing: string[] = [];
    for (const m of members) {
      if (!m.name || !m.age || !m.sex) {
        missing.push(m.name || 'Miembro sin nombre');
      }
    }
    return { ready: missing.length === 0 && members.length > 0, missing };
  };

  const readiness = getReadiness();

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{family?.name ?? 'Mi familia'}</Text>

        {/* Readiness banner */}
        {members.length > 0 && (
          <View style={[styles.banner, readiness.ready ? styles.bannerOk : styles.bannerWarn]}>
            <Text style={readiness.ready ? styles.bannerTextOk : styles.bannerTextWarn}>
              {readiness.ready ? '✓ Lista para planificar' : `⚠ Faltan datos de ${readiness.missing.join(', ')}`}
            </Text>
          </View>
        )}

        {/* Members */}
        <Text style={styles.sectionHeader}>Miembros</Text>
        {members.map((member) => {
          const memberGoal = goals.find((g) => g.member_id === member.id);
          const memberRestrictions = restrictions.filter((r) => r.member_name === member.name);

          return (
            <TouchableOpacity key={member.id} style={styles.memberCard} onPress={() => router.push(`/member/${member.id}`)}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{member.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberGoal}>
                  {memberGoal ? GOAL_LABELS[memberGoal.goal_type] ?? memberGoal.goal_type : `${member.age} años`}
                </Text>
                {memberRestrictions.length > 0 && (
                  <View style={styles.tagRow}>
                    {memberRestrictions.map((r, i) => (
                      <Text key={i} style={styles.restrictionTag}>🚫 {r.name}</Text>
                    ))}
                  </View>
                )}
                {memberRestrictions.length === 0 && (
                  <Text style={styles.noRestriction}>Sin restricciones</Text>
                )}
              </View>
              <Text style={styles.memberArrow}>›</Text>
            </TouchableOpacity>
          );
        })}

        {/* Meal type chips */}
        <Text style={[styles.sectionHeader, { marginTop: 24 }]}>Comidas del día</Text>
        <View style={styles.chipsRow}>
          {(Object.keys(MEAL_LABELS) as MealType[]).map((type) => {
            const active = family?.active_meal_types?.includes(type) ?? true;
            return (
              <TouchableOpacity
                key={type}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => toggleMealType(type)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {MEAL_LABELS[type]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={styles.hint}>Selecciona los momentos de comida que planificas</Text>

        {/* Restrictions summary */}
        {restrictions.length > 0 && (
          <>
            <Text style={[styles.sectionHeader, { marginTop: 24 }]}>Restricciones del hogar</Text>
            {restrictions.map((r, i) => (
              <Text key={i} style={styles.restrictionItem}>🚫 {r.name} ({r.member_name})</Text>
            ))}
          </>
        )}

        {/* Add member button */}
        <TouchableOpacity style={styles.primaryButton} onPress={() => setShowAddModal(true)}>
          <Text style={styles.primaryButtonText}>Añadir miembro</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Add Member Modal */}
      <AddMemberModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={async (input) => {
          const familyId = await getFamilyId();
          await FamilyService.addMember(familyId, input);
          setShowAddModal(false);
          loadFamily();
        }}
      />
    </SafeAreaView>
  );

  async function toggleMealType(type: MealType) {
    if (!family) return;
    const current = family.active_meal_types ?? ['breakfast', 'lunch', 'dinner', 'snack'];
    let updated: MealType[];
    if (current.includes(type)) {
      updated = current.filter((t) => t !== type);
      if (updated.length === 0) return; // at least 1
    } else {
      updated = [...current, type];
    }
    try {
      const fam = await FamilyService.updateMealTypes(family.id, updated);
      setFamily(fam);
    } catch (err) {
      console.error('[FamilyScreen] Toggle error:', err);
    }
  }
}

// --- Add Member Modal ---
function AddMemberModal({
  visible,
  onClose,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (input: { name: string; age: number; sex: Sex }) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState<Sex>('female');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !age) return;
    setSaving(true);
    try {
      await onSave({ name: name.trim(), age: parseInt(age, 10), sex });
      setName('');
      setAge('');
      setSex('female');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.content}>
          <Text style={modalStyles.title}>Nuevo miembro</Text>

          <Text style={modalStyles.label}>Nombre</Text>
          <TextInput style={modalStyles.input} value={name} onChangeText={setName} placeholder="Ej: Carlos" />

          <Text style={modalStyles.label}>Edad</Text>
          <TextInput style={modalStyles.input} value={age} onChangeText={setAge} placeholder="Ej: 35" keyboardType="numeric" />

          <Text style={modalStyles.label}>Sexo</Text>
          <View style={modalStyles.sexRow}>
            {(['female', 'male', 'other'] as Sex[]).map((s) => (
              <TouchableOpacity
                key={s}
                style={[modalStyles.sexChip, sex === s && modalStyles.sexChipActive]}
                onPress={() => setSex(s)}
              >
                <Text style={[modalStyles.sexText, sex === s && modalStyles.sexTextActive]}>
                  {s === 'female' ? 'Mujer' : s === 'male' ? 'Hombre' : 'Otro'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={modalStyles.buttons}>
            <TouchableOpacity style={modalStyles.cancelBtn} onPress={onClose}>
              <Text style={modalStyles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={modalStyles.saveBtn} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={modalStyles.saveText}>Guardar</Text>}
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
  title: { fontSize: 20, fontWeight: '700', color: '#1a1a1a', marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#757575', marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  sexRow: { flexDirection: 'row', gap: 8 },
  sexChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: '#FFF8F0', borderWidth: 1, borderColor: '#E0D5C8' },
  sexChipActive: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  sexText: { fontSize: 14, color: '#757575' },
  sexTextActive: { color: '#fff' },
  buttons: { flexDirection: 'row', gap: 12, marginTop: 24 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#E0E0E0', alignItems: 'center' },
  cancelText: { fontSize: 16, color: '#757575' },
  saveBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#4CAF50', alignItems: 'center' },
  saveText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '700', color: '#1a1a1a', marginBottom: 12 },

  // Banner
  banner: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8, marginBottom: 16 },
  bannerOk: { backgroundColor: '#E8F5E9' },
  bannerWarn: { backgroundColor: '#FFF3E0' },
  bannerTextOk: { color: '#2E7D32', fontSize: 14, fontWeight: '500' },
  bannerTextWarn: { color: '#E65100', fontSize: 14, fontWeight: '500' },

  // Section
  sectionHeader: { fontSize: 12, fontWeight: '600', color: '#9E9E9E', letterSpacing: 0.5, marginBottom: 8, textTransform: 'uppercase' },

  // Member card (wireframe 05)
  memberCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF8F0', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontSize: 16, fontWeight: '700', color: '#4CAF50' },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
  memberGoal: { fontSize: 13, color: '#757575', marginTop: 2 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  restrictionTag: { fontSize: 11, color: '#E65100', backgroundColor: '#FFF3E0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  noRestriction: { fontSize: 11, color: '#9E9E9E', marginTop: 4 },
  memberArrow: { fontSize: 20, color: '#BDBDBD' },

  // Chips
  chipsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: '#FFF8F0', borderWidth: 1, borderColor: '#E0D5C8' },
  chipActive: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  chipText: { fontSize: 13, fontWeight: '500', color: '#757575' },
  chipTextActive: { color: '#fff' },
  hint: { fontSize: 13, color: '#9E9E9E', marginTop: 8 },

  // Restrictions summary
  restrictionItem: { fontSize: 14, color: '#1a1a1a', paddingVertical: 6 },

  // Button
  primaryButton: { backgroundColor: '#4CAF50', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 24 },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
