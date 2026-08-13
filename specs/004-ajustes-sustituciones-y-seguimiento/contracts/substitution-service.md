# Contract: SubstitutionService

**Module**: 004-ajustes-sustituciones-y-seguimiento
**Type**: Internal service interface

## Interface

```typescript
interface SubstitutionService {
  /**
   * Valida si una sustitución es posible sin violar restricciones obligatorias.
   * Retorna resultado con flag de bloqueo y warnings informativos.
   * Funciona offline con datos locales.
   */
  validateSubstitution(mealId: string, newRecipeId: string): Promise<ValidationResult>;

  /**
   * Aplica una sustitución previamente validada.
   * Crea MealAdjustment, registra signal, actualiza counter, snapshottea historial si es primera vez.
   * Si el menú es aprobado, dispara ListSyncService.
   * Precondición: validateSubstitution() debe haber retornado valid=true.
   */
  applySubstitution(mealId: string, newRecipeId: string, reason?: SubstitutionReason): Promise<MealAdjustment>;

  /**
   * Retorna todos los ajustes realizados en una semana.
   * Ordenados por timestamp descendente.
   */
  getAdjustments(weekId: string): Promise<MealAdjustment[]>;

  /**
   * Retorna el número de sustituciones acumuladas en una semana.
   */
  getSubstitutionCount(weekId: string): Promise<number>;
}

// --- Types ---

interface ValidationResult {
  /** true si la sustitución es válida (no viola restricciones obligatorias) */
  valid: boolean;
  /** true si la sustitución está bloqueada (restricción obligatoria violada) */
  blocked: boolean;
  /** Mensaje descriptivo del bloqueo (solo si blocked=true). i18n key. */
  blockReason?: string;
  /** Restricción(es) violada(s) que causan el bloqueo */
  blockedRestrictions?: BlockedRestriction[];
  /** Warnings informativos (preferencias, objetivos, nutricional) */
  warnings: Warning[];
}

interface BlockedRestriction {
  restrictionId: string;
  restrictionName: string;
  memberName: string;
  category: 'allergy' | 'intolerance' | 'ethical_religious';
}

interface Warning {
  type: 'preference' | 'goal' | 'nutritional';
  message: string;  // i18n key
  severity: 'info';
}

type SubstitutionReason =
  | 'gusto'
  | 'falta_ingredientes'
  | 'tiempo'
  | 'rechazo_infantil'
  | 'otro';

interface MealAdjustment {
  id: string;
  weekId: string;
  mealId: string;
  originalRecipeId: string;
  newRecipeId: string;
  reason: SubstitutionReason | null;
  memberId: string;
  timestamp: Date;
  validationResult: {
    passed: boolean;
    warnings: Warning[];
  };
  createdAt: Date;
}
```

## Behavior Rules

- `validateSubstitution`:
  - Carga el PlannedMeal por mealId → obtiene weekId, memberIds afectados
  - Para cada member afectado, carga restricciones con severity=mandatory (via spec 001 CriteriaService)
  - Obtiene CompatibilityTags de la receta newRecipeId (via spec 005)
  - Match: si algún tag de la receta coincide con una restricción mandatory → `blocked: true`, `valid: false`
  - Si no hay bloqueo: verifica preferencias (disliked + strong) y objetivos → genera warnings
  - Funciona 100% offline (datos locales de WatermelonDB)
  - Rendimiento: <3 segundos (NFR-006)

- `applySubstitution`:
  - Precondición implícita: se espera que se haya validado previamente con `validateSubstitution`
  - Actualiza PlannedMeal.recipeId al newRecipeId
  - Crea registro MealAdjustment
  - Invoca SignalRecorderService.recordSignal() (async, no bloquea)
  - Incrementa SubstitutionCounter (crea si no existe)
  - Si es la primera sustitución de la semana → HistoryService.createSnapshot()
  - Si menú está en estado "approved" → ListSyncService.syncAfterSubstitution()
  - Si SubstitutionCounter.count >= 5 → marca regenerationSuggested = true

- `getAdjustments`:
  - Query simple por weekId, ordenado por timestamp DESC
  - Incluye todos los ajustes independientemente del estado del menú

- `getSubstitutionCount`:
  - Lee SubstitutionCounter.count para el weekId dado
  - Retorna 0 si no existe contador (semana sin sustituciones)

## Error Handling

- `mealId` no encontrado → throw `MealNotFoundError`
- `newRecipeId` no encontrado en catálogo → throw `RecipeNotFoundError`
- `newRecipeId` igual a receta actual → throw `SameRecipeError`
- Intento de `applySubstitution` cuando validación habría fallado → throw `ValidationRequiredError`
