# Contract: CriteriaService

**Module**: 001-perfiles-y-criterios-familiares
**Type**: Internal service interface

## Interface

```typescript
interface CriteriaService {
  // Restricciones
  addRestriction(memberId: string, input: CreateRestrictionInput): Promise<DietaryRestriction>;
  updateRestriction(restrictionId: string, input: UpdateRestrictionInput): Promise<DietaryRestriction>;
  removeRestriction(restrictionId: string): Promise<void>;
  getMemberRestrictions(memberId: string): Promise<DietaryRestriction[]>;
  getMandatoryRestrictions(memberId: string): Promise<DietaryRestriction[]>;

  // Preferencias
  addPreference(memberId: string, input: CreatePreferenceInput): Promise<FoodPreference>;
  updatePreference(preferenceId: string, input: UpdatePreferenceInput): Promise<FoodPreference>;
  removePreference(preferenceId: string): Promise<void>;
  getMemberPreferences(memberId: string): Promise<FoodPreference[]>;

  // Objetivos
  addGoal(memberId: string, input: CreateGoalInput): Promise<NutritionalGoal>;
  updateGoal(goalId: string, input: UpdateGoalInput): Promise<NutritionalGoal>;
  removeGoal(goalId: string): Promise<void>;
  getActiveGoals(memberId: string): Promise<NutritionalGoal[]>;

  // Coherencia
  checkCoherence(memberId: string): Promise<CoherenceResult>;
}

interface CreateRestrictionInput {
  category: 'allergy' | 'intolerance' | 'ethical_religious' | 'preference';
  name: string;
  notes?: string;
}

interface CreatePreferenceInput {
  foodItem: string;
  type: 'liked' | 'disliked';
  intensity?: 'mild' | 'strong';
}

interface CreateGoalInput {
  goalType: 'lose_weight' | 'maintain' | 'gain_muscle';
  priority?: number;
}

interface CoherenceResult {
  isCoherent: boolean;
  warnings: CoherenceWarning[];
}

interface CoherenceWarning {
  type: 'restriction_preference_conflict' | 'goal_conflict';
  message: string;  // i18n key
  affectedItems: string[];
}
```

## Behavior Rules

- `addRestriction`: `severity` se infiere automáticamente de `category`
- `checkCoherence`: No bloquea. Retorna warnings informativos.
  - Conflicto restricción/preferencia: restriction.name coincide con preference.foodItem (type=liked)
  - Conflicto de objetivos: lose_weight + gain_muscle en mismo miembro
- `removeRestriction/Preference/Goal`: Borrado real (no soft delete para criterios)
- Todas las operaciones funcionan offline
