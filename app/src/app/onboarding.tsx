import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type {
  MealType,
  Sex,
  RestrictionCategory,
  GoalType,
  PreferenceType,
} from '../types/database';

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

const TOTAL_STEPS = 5;

const SEX_OPTIONS: { key: Sex; label: string }[] = [
  { key: 'female', label: 'Mujer' },
  { key: 'male', label: 'Hombre' },
  { key: 'other', label: 'Otro' },
];

const RESTRICTION_PRESETS = [
  { name: 'Gluten', category: 'intolerance' as RestrictionCategory },
  { name: 'Lactosa', category: 'intolerance' as RestrictionCategory },
  { name: 'Huevo', category: 'allergy' as RestrictionCategory },
  { name: 'Frutos secos', category: 'allergy' as RestrictionCategory },
  { name: 'Marisco', category: 'allergy' as RestrictionCategory },
  { name: 'Pescado', category: 'allergy' as RestrictionCategory },
  { name: 'Vegetariano', category: 'ethical_religious' as RestrictionCategory },
  { name: 'Vegano', category: 'ethical_religious' as RestrictionCategory },
];

const GOAL_OPTIONS: { key: GoalType; label: string; emoji: string }[] = [
  { key: 'lose_weight', label: 'Perder peso', emoji: '⬇️' },
  { key: 'maintain', label: 'Mantenimiento', emoji: '⚖️' },
  { key: 'gain_muscle', label: 'Ganar músculo', emoji: '💪' },
];

type Step = 'family' | 'member' | 'restrictions' | 'goals' | 'preferences';
const STEP_ORDER: Step[] = ['family', 'member', 'restrictions', 'goals', 'preferences'];

export default function OnboardingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState<Step>('family');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Family
  const [familyName, setFamilyName] = useState('');

  // Member
  const [memberName, setMemberName] = useState('');
  const [memberAge, setMemberAge] = useState('');
  const [memberSex, setMemberSex] = useState<Sex>('female');

  // Restrictions
  const [selectedRestrictions, setSelectedRestrictions] = useState<Set<string>>(new Set());

  // Goals
  const [selectedGoal, setSelectedGoal] = useState<GoalType | null>(null);

  // Preferences
  const [likedItems, setLikedItems] = useState('');
  const [dislikedItems, setDislikedItems] = useState('');

  // Stored IDs
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [memberId, setMemberId] = useState<string | null>(null);

  const stepIndex = STEP_ORDER.indexOf(step);

  const navigateToApp = async () => {
    const { clearFamilyCache } = await import('../lib/familyHelper');
    clearFamilyCache();
    router.replace('/(tabs)/plan');
  };

  // --- Step handlers ---

  const handleFamilyNext = async () => {
    if (!familyName.trim()) { setError('El nombre de la familia es obligatorio'); return; }
    setSaving(true); setError('');
    try {
      const { data, error: err } = await supabase
        .from('families')
        .insert({
          name: familyName.trim(),
          owner_id: user!.id,
          active_meal_types: ['breakfast', 'lunch', 'dinner', 'snack'] as MealType[],
        })
        .select().single();
      if (err) throw err;
      setFamilyId(data.id);
      setStep('member');
    } catch (err) {
      console.error('[Onboarding] Error creating family:', err);
      setError('Error al crear la familia');
    } finally { setSaving(false); }
  };

  const handleMemberNext = async () => {
    if (!memberName.trim()) { setError('El nombre es obligatorio'); return; }
    if (!memberAge || parseInt(memberAge, 10) < 0) { setError('La edad es obligatoria'); return; }
    setSaving(true); setError('');
    try {
      const { data, error: err } = await supabase
        .from('family_members')
        .insert({
          family_id: familyId,
          name: memberName.trim(),
          age: parseInt(memberAge, 10),
          sex: memberSex,
          restrictions_reviewed: false,
        })
        .select().single();
      if (err) throw err;
      setMemberId(data.id);
      setStep('restrictions');
    } catch (err) {
      console.error('[Onboarding] Error creating member:', err);
      setError('Error al crear el miembro');
    } finally { setSaving(false); }
  };

  const handleRestrictionsNext = async () => {
    setSaving(true); setError('');
    try {
      if (selectedRestrictions.size > 0 && memberId) {
        const rows = [...selectedRestrictions].map((name) => {
          const preset = RESTRICTION_PRESETS.find((p) => p.name === name);
          return {
            member_id: memberId,
            name,
            category: preset?.category ?? 'preference',
            severity: preset?.category === 'preference' ? 'desirable' : 'mandatory',
          };
        });
        await supabase.from('dietary_restrictions').insert(rows);
      }
      setStep('goals');
    } catch (err) {
      console.error('[Onboarding] Error saving restrictions:', err);
      setError('Error al guardar las restricciones');
    } finally { setSaving(false); }
  };

  const handleGoalsNext = async () => {
    setSaving(true); setError('');
    try {
      if (selectedGoal && memberId) {
        await supabase.from('nutritional_goals').insert({
          member_id: memberId,
          goal_type: selectedGoal,
          is_active: true,
        });
      }
      setStep('preferences');
    } catch (err) {
      console.error('[Onboarding] Error saving goal:', err);
      setError('Error al guardar el objetivo');
    } finally { setSaving(false); }
  };

  const handleFinish = async () => {
    setSaving(true); setError('');
    try {
      // Parse comma-separated preference items
      const liked = likedItems.split(',').map((s) => s.trim()).filter(Boolean);
      const disliked = dislikedItems.split(',').map((s) => s.trim()).filter(Boolean);

      const prefRows = [
        ...liked.map((item) => ({
          member_id: memberId!,
          food_item: item,
          type: 'liked' as PreferenceType,
          intensity: 'mild' as const,
        })),
        ...disliked.map((item) => ({
          member_id: memberId!,
          food_item: item,
          type: 'disliked' as PreferenceType,
          intensity: 'strong' as const,
        })),
      ];

      if (prefRows.length > 0) {
        await supabase.from('food_preferences').insert(prefRows);
      }

      await navigateToApp();
    } catch (err) {
      console.error('[Onboarding] Error saving preferences:', err);
      setError('Error al guardar las preferencias');
    } finally { setSaving(false); }
  };

  const toggleRestriction = (name: string) => {
    setSelectedRestrictions((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Progress */}
        <View style={styles.progressRow}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <View key={i} style={[styles.progressDot, i <= stepIndex && styles.progressDotActive]} />
          ))}
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

          {/* Step 1: Family */}
          {step === 'family' && (
            <View style={styles.stepContent}>
              <Text style={styles.emoji}>👨‍👩‍👧‍👦</Text>
              <Text style={styles.stepTitle}>¿Cómo se llama tu familia?</Text>
              <Text style={styles.stepSubtitle}>Dale un nombre a tu hogar para empezar a planificar</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Familia García, Casa de los López..."
                placeholderTextColor={COLORS.mutedSoft}
                value={familyName}
                onChangeText={(v) => { setFamilyName(v); setError(''); }}
                autoFocus
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>
          )}

          {/* Step 2: Member */}
          {step === 'member' && (
            <View style={styles.stepContent}>
              <Text style={styles.emoji}>🧑</Text>
              <Text style={styles.stepTitle}>Primer miembro</Text>
              <Text style={styles.stepSubtitle}>Empieza por ti o por quien quieras. Podrás añadir más después.</Text>

              <Text style={styles.fieldLabel}>Nombre</Text>
              <TextInput style={styles.input} placeholder="Ej: María, Pablo..." placeholderTextColor={COLORS.mutedSoft} value={memberName} onChangeText={(v) => { setMemberName(v); setError(''); }} autoFocus />

              <Text style={styles.fieldLabel}>Edad</Text>
              <TextInput style={styles.input} placeholder="Ej: 35" placeholderTextColor={COLORS.mutedSoft} value={memberAge} onChangeText={(v) => { setMemberAge(v); setError(''); }} keyboardType="number-pad" />

              <Text style={styles.fieldLabel}>Sexo</Text>
              <View style={styles.chipRow}>
                {SEX_OPTIONS.map((opt) => (
                  <TouchableOpacity key={opt.key} style={[styles.chip, memberSex === opt.key && styles.chipActive]} onPress={() => setMemberSex(opt.key)}>
                    <Text style={[styles.chipText, memberSex === opt.key && styles.chipTextActive]}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>
          )}

          {/* Step 3: Restrictions */}
          {step === 'restrictions' && (
            <View style={styles.stepContent}>
              <Text style={styles.emoji}>🚫</Text>
              <Text style={styles.stepTitle}>¿{memberName} tiene alguna restricción?</Text>
              <Text style={styles.stepSubtitle}>Selecciona las que apliquen. Podrás cambiarlas después.</Text>
              <View style={styles.restrictionGrid}>
                {RESTRICTION_PRESETS.map((preset) => {
                  const selected = selectedRestrictions.has(preset.name);
                  return (
                    <TouchableOpacity key={preset.name} style={[styles.restrictionChip, selected && styles.restrictionChipActive]} onPress={() => toggleRestriction(preset.name)}>
                      <Text style={[styles.restrictionChipText, selected && styles.restrictionChipTextActive]}>{preset.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>
          )}

          {/* Step 4: Goals */}
          {step === 'goals' && (
            <View style={styles.stepContent}>
              <Text style={styles.emoji}>🎯</Text>
              <Text style={styles.stepTitle}>¿Cuál es el objetivo de {memberName}?</Text>
              <Text style={styles.stepSubtitle}>El planificador priorizará recetas que encajen con este objetivo.</Text>
              <View style={styles.goalGrid}>
                {GOAL_OPTIONS.map((opt) => {
                  const selected = selectedGoal === opt.key;
                  return (
                    <TouchableOpacity key={opt.key} style={[styles.goalOption, selected && styles.goalOptionActive]} onPress={() => setSelectedGoal(selected ? null : opt.key)}>
                      <Text style={styles.goalEmoji}>{opt.emoji}</Text>
                      <Text style={[styles.goalLabel, selected && styles.goalLabelActive]}>{opt.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>
          )}

          {/* Step 5: Preferences */}
          {step === 'preferences' && (
            <View style={styles.stepContent}>
              <Text style={styles.emoji}>😋</Text>
              <Text style={styles.stepTitle}>¿Qué le gusta y qué no a {memberName}?</Text>
              <Text style={styles.stepSubtitle}>Separa los alimentos con comas. El planificador los tendrá en cuenta.</Text>

              <Text style={styles.fieldLabel}>👍 Le gusta</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: pollo, arroz, pasta..."
                placeholderTextColor={COLORS.mutedSoft}
                value={likedItems}
                onChangeText={setLikedItems}
                autoFocus
              />

              <Text style={styles.fieldLabel}>👎 No le gusta</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: brócoli, pescado..."
                placeholderTextColor={COLORS.mutedSoft}
                value={dislikedItems}
                onChangeText={setDislikedItems}
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>
          )}
        </ScrollView>

        {/* Bottom actions */}
        <View style={styles.actionBar}>
          {step === 'family' && (
            <TouchableOpacity style={[styles.primaryBtn, saving && styles.primaryBtnDisabled]} onPress={handleFamilyNext} disabled={saving}>
              {saving ? <ActivityIndicator color={COLORS.onPrimary} /> : <Text style={styles.primaryBtnText}>Siguiente</Text>}
            </TouchableOpacity>
          )}
          {step === 'member' && (
            <TouchableOpacity style={[styles.primaryBtn, saving && styles.primaryBtnDisabled]} onPress={handleMemberNext} disabled={saving}>
              {saving ? <ActivityIndicator color={COLORS.onPrimary} /> : <Text style={styles.primaryBtnText}>Siguiente</Text>}
            </TouchableOpacity>
          )}
          {step === 'restrictions' && (
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.ghostBtn} onPress={() => setStep('goals')}>
                <Text style={styles.ghostBtnText}>Saltar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.primaryBtn, { flex: 1 }, saving && styles.primaryBtnDisabled]} onPress={handleRestrictionsNext} disabled={saving}>
                {saving ? <ActivityIndicator color={COLORS.onPrimary} /> : <Text style={styles.primaryBtnText}>Siguiente</Text>}
              </TouchableOpacity>
            </View>
          )}
          {step === 'goals' && (
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.ghostBtn} onPress={() => setStep('preferences')}>
                <Text style={styles.ghostBtnText}>Saltar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.primaryBtn, { flex: 1 }, saving && styles.primaryBtnDisabled]} onPress={handleGoalsNext} disabled={saving}>
                {saving ? <ActivityIndicator color={COLORS.onPrimary} /> : <Text style={styles.primaryBtnText}>Siguiente</Text>}
              </TouchableOpacity>
            </View>
          )}
          {step === 'preferences' && (
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.ghostBtn} onPress={navigateToApp}>
                <Text style={styles.ghostBtnText}>Saltar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.primaryBtn, { flex: 1 }, saving && styles.primaryBtnDisabled]} onPress={handleFinish} disabled={saving}>
                {saving ? <ActivityIndicator color={COLORS.onPrimary} /> : <Text style={styles.primaryBtnText}>Empezar a planificar</Text>}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.canvas },
  scroll: { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 40 },

  progressRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  progressDot: { width: 24, height: 4, borderRadius: 2, backgroundColor: COLORS.hairline },
  progressDotActive: { backgroundColor: COLORS.primary },

  stepContent: { alignItems: 'center', paddingTop: 24 },
  emoji: { fontSize: 48, marginBottom: 16 },
  stepTitle: { fontSize: 22, fontWeight: '700', color: COLORS.ink, textAlign: 'center', marginBottom: 8 },
  stepSubtitle: { fontSize: 15, color: COLORS.muted, textAlign: 'center', lineHeight: 22, marginBottom: 24, paddingHorizontal: 16 },

  fieldLabel: { fontSize: 13, fontWeight: '600', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 0.2, marginBottom: 8, alignSelf: 'flex-start', width: '100%' },
  input: { width: '100%', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.hairline, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: COLORS.ink, minHeight: 48, marginBottom: 16 },
  errorText: { fontSize: 13, color: COLORS.error, marginTop: 4, alignSelf: 'flex-start' },

  chipRow: { flexDirection: 'row', gap: 8, width: '100%', marginBottom: 16 },
  chip: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: COLORS.surfaceWarm, alignItems: 'center' },
  chipActive: { backgroundColor: COLORS.primary },
  chipText: { fontSize: 14, fontWeight: '600', color: COLORS.body },
  chipTextActive: { color: COLORS.onPrimary },

  restrictionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, width: '100%', justifyContent: 'center' },
  restrictionChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: COLORS.surfaceWarm, borderWidth: 1, borderColor: COLORS.hairline },
  restrictionChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  restrictionChipText: { fontSize: 14, fontWeight: '600', color: COLORS.body },
  restrictionChipTextActive: { color: COLORS.onPrimary },

  goalGrid: { width: '100%', gap: 10 },
  goalOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20, borderRadius: 12, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.hairline, gap: 12 },
  goalOptionActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  goalEmoji: { fontSize: 24 },
  goalLabel: { fontSize: 16, fontWeight: '600', color: COLORS.ink },
  goalLabelActive: { color: COLORS.onPrimary },

  actionBar: { paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: COLORS.hairline },
  actionRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  primaryBtn: { backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center', minHeight: 48, justifyContent: 'center' },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: COLORS.onPrimary, fontSize: 15, fontWeight: '700' },
  ghostBtn: { paddingVertical: 14, paddingHorizontal: 16, minHeight: 48, justifyContent: 'center' },
  ghostBtnText: { color: COLORS.primary, fontSize: 15, fontWeight: '700' },
});
