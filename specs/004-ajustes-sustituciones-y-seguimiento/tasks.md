# Tasks: Ajustes, sustituciones y seguimiento del menú

**Spec**: 004-ajustes-sustituciones-y-seguimiento
**Generated**: 2026-08-10
**Implementation Order**: 5th (last — depends on ALL other specs: 001 for restrictions validation, 002 for PlannedMeal to modify, 003 for list sync after change, 005 for recipe catalog)

---

## Phase 1: Setup (skip)

> Project infrastructure (Expo, TypeScript, WatermelonDB, Jest, i18n) already initialized by spec 005 (1st in implementation order). No setup tasks needed.

---

## Phase 2: Foundational

- [ ] T001 Create WatermelonDB schema for spec 004 tables (MealAdjustment, SubstitutionSignal, MenuHistory, SubstitutionCounter) in `src/database/schema.ts`
  - Path: `src/database/schema.ts`, `src/database/migrations/`
  - Acceptance: Schema extends existing file with 4 new tables; MealAdjustment columns: weekId, mealId, originalRecipeId, newRecipeId, reason (nullable), memberId, timestamp, validationResult (json), createdAt; SubstitutionSignal columns: weekId, originalRecipeId, newRecipeId, mealType, reason (nullable), memberId, familyId, timestamp, createdAt; MenuHistory columns: weekId (unique), originalMeals (json), snapshotCreatedAt; SubstitutionCounter columns: weekId (unique), count, regenerationSuggested, updatedAt; indexes per data-model.md (weekId on all, mealId on MealAdjustment, familyId+timestamp compound on SubstitutionSignal)
  - Refs: data-model.md > Entities, data-model.md > Indexes

- [ ] T002 [P] Create Supabase migration + RLS policies for spec 004 tables
  - Path: `supabase/migrations/004_substitution_tables.sql`
  - Acceptance: SQL migration creates 4 tables with correct columns/types/FKs; RLS policies: all tables restricted to family members (familyId match via auth.uid → family_members join); MealAdjustment and SubstitutionSignal are insert+read (no update/delete in normal flow); MenuHistory is insert+read (immutable after creation); SubstitutionCounter allows update (count increment)
  - Refs: data-model.md > Sync Strategy, spec.md > NFR-005

- [ ] T003 [P] Setup i18n namespace `004-substitution` with es.json translations
  - Path: `src/i18n/namespaces/004-substitution/es.json`, `src/i18n/index.ts`
  - Acceptance: Namespace registered and loadable; keys for: validation messages (blocked, warnings), substitution reasons (gusto, falta_ingredientes, tiempo, rechazo_infantil, otro), confirmation prompts, list diff labels (added/removed), regeneration suggestion text, history screen labels, error messages, empty states; all in Spanish
  - Refs: plan.md > Constitution Check > i18n-Ready

---

## Phase 3: US1 — Sustituir comida (P1)

**Goal**: User can substitute a specific meal with any recipe, validated against mandatory restrictions

**Independent test**: Start from a menu (approved or draft), substitute a meal, verify restriction validation blocks/allows correctly

- [ ] T004 [P] [US1] Create MealAdjustment model in `src/models/MealAdjustment.ts`
  - Path: `src/models/MealAdjustment.ts`
  - Acceptance: WatermelonDB Model class with columns: weekId (string), mealId (string), originalRecipeId (string), newRecipeId (string), reason (string, nullable), memberId (string), timestamp (number), validationResult (json), createdAt (number); typed with TypeScript interfaces matching data-model.md; exported
  - Refs: data-model.md > MealAdjustment

- [ ] T005 [P] [US1] Create SubstitutionCounter model in `src/models/SubstitutionCounter.ts`
  - Path: `src/models/SubstitutionCounter.ts`
  - Acceptance: WatermelonDB Model class with columns: weekId (string), count (number), regenerationSuggested (boolean, default false), updatedAt (number); typed with TypeScript interfaces; exported
  - Refs: data-model.md > SubstitutionCounter

- [ ] T006 [US1] Implement RestrictionValidatorService in `src/services/RestrictionValidatorService.ts`
  - Path: `src/services/RestrictionValidatorService.ts`, `tests/unit/services/RestrictionValidatorService.test.ts`
  - Acceptance: validateAgainstRestrictions(memberIds, newRecipeId) loads mandatory restrictions from spec 001 CriteriaService for each affected member; loads CompatibilityTags of newRecipeId from spec 005; if any tag matches a mandatory restriction (allergy, intolerance, ethical_religious) → returns blocked=true with BlockedRestriction details; if no block → checks preferences (disliked+strong) and goals → returns warnings (type preference|goal|nutritional, severity info); works 100% offline with local WatermelonDB data; <3s execution; unit tests cover: no restrictions, single block, multiple blocks, warnings only, mixed block+warning
  - Refs: contracts/substitution-service.md > validateSubstitution behavior, spec.md > FR-002, FR-012, NFR-002, NFR-006

- [ ] T007 [US1] Implement SubstitutionService in `src/services/SubstitutionService.ts`
  - Path: `src/services/SubstitutionService.ts`, `tests/unit/services/SubstitutionService.test.ts`
  - Acceptance: validateSubstitution(mealId, newRecipeId) loads PlannedMeal → gets memberIds → delegates to RestrictionValidatorService → returns ValidationResult; applySubstitution(mealId, newRecipeId, reason?) validates precondition, updates PlannedMeal.recipeId, creates MealAdjustment, calls SignalRecorderService (async), increments SubstitutionCounter (creates if not exists), calls HistoryService.createSnapshot if first substitution, calls ListSyncService if menu approved, sets regenerationSuggested if count≥5; getAdjustments(weekId) queries by weekId sorted timestamp DESC; getSubstitutionCount(weekId) reads counter or returns 0; error cases: MealNotFoundError, RecipeNotFoundError, SameRecipeError; unit tests cover all paths including error cases
  - Refs: contracts/substitution-service.md (full contract), spec.md > FR-001, FR-003, FR-004, FR-011

- [ ] T008 [US1] Implement MealSubstitution screen in `src/screens/MealSubstitution/`
  - Path: `src/screens/MealSubstitution/index.tsx`, `src/screens/MealSubstitution/MealSubstitution.test.tsx`
  - Acceptance: Opened from ⇄ button with mealId param; shows current meal info at top (recipe name, mealType, day); displays recipe catalog filtered by mealType (reuses spec 005 RecipeCatalog components); user picks any recipe freely (FR-003); on selection, calls SubstitutionService.validateSubstitution; navigates to SubstitutionConfirm with validation result; back button cancels flow; component test verifies render + selection + navigation
  - Refs: spec.md > FR-001, FR-003; plan.md > Project Structure > screens

- [ ] T009 [US1] Implement SubstitutionConfirm screen in `src/screens/SubstitutionConfirm/`
  - Path: `src/screens/SubstitutionConfirm/index.tsx`, `src/screens/SubstitutionConfirm/SubstitutionConfirm.test.tsx`
  - Acceptance: Receives ValidationResult + mealId + newRecipeId; if blocked: shows red ValidationResultBanner with blockReason + blockedRestrictions details, only Cancel button available; if valid: shows green banner + optional WarningDismissable components for each warning, Confirm + Cancel buttons; on Confirm: calls SubstitutionService.applySubstitution, shows success feedback, navigates back to WeekPlanner; optional reason picker shown before final confirm (FR-010); component test verifies blocked state, valid state with warnings, confirm flow, cancel flow
  - Refs: spec.md > FR-002, FR-010, FR-012; contracts/substitution-service.md > ValidationResult

- [ ] T010 [US1] Implement ValidationResultBanner + WarningDismissable components
  - Path: `src/components/ValidationResultBanner.tsx`, `src/components/WarningDismissable.tsx`, `tests/component/components/ValidationResultBanner.test.tsx`, `tests/component/components/WarningDismissable.test.tsx`
  - Acceptance: ValidationResultBanner: green background when valid, red when blocked; shows blockReason text (i18n) and member name + restriction name when blocked; shows "Sustitución válida" when valid; accessible (role alert). WarningDismissable: shows warning message (i18n) with info icon; dismissable via X button (per FR-012: informational, non-blocking); once dismissed stays hidden for that session; component tests verify both states + dismiss behavior
  - Refs: spec.md > FR-012; contracts/substitution-service.md > Warning type

---

## Phase 4: US1 continued — Counter & regeneration suggestion

**Goal**: Track substitution count per week and suggest full menu regeneration at ≥5

- [ ] T011 [US1] Implement counter increment logic in SubstitutionService.applySubstitution
  - Path: `src/services/SubstitutionService.ts`, `tests/unit/services/SubstitutionService.counter.test.ts`
  - Acceptance: On each confirmed applySubstitution: finds or creates SubstitutionCounter for weekId; increments count by 1; if count reaches 5 → sets regenerationSuggested=true; if count already ≥5 → keeps regenerationSuggested=true but does NOT block the substitution; applySubstitution returns the updated count in its response; unit tests cover: first substitution (counter created with count=1), 4th substitution (count=4, suggestion=false), 5th substitution (count=5, suggestion=true), 6th+ (count increments, no block)
  - Refs: spec.md > FR-011; data-model.md > SubstitutionCounter lifecycle

- [ ] T012 [US1] Implement RegenerationSuggestion component
  - Path: `src/components/RegenerationSuggestion.tsx`, `tests/component/components/RegenerationSuggestion.test.tsx`
  - Acceptance: Shown when SubstitutionCounter.regenerationSuggested=true (count≥5); displays informational message: "Quizás sea mejor regenerar el menú completo" (i18n); dismissable (user can close it); links/navigates to spec 002 menu generation flow; does NOT block further substitutions; only shown once per session after dismissal (local state); component test verifies render at count≥5, dismiss behavior, navigation link
  - Refs: spec.md > FR-011, HU1 Escenario 4

---

## Phase 5: US2 — Reflejar cambio en lista (P1)

**Goal**: After substitution on approved menu, shopping list updates automatically (pending items only)

**Independent test**: Substitute a meal in approved menu, verify shopping list recalculates pending section

- [ ] T013 [US2] Implement ListSyncService in `src/services/ListSyncService.ts`
  - Path: `src/services/ListSyncService.ts`, `tests/unit/services/ListSyncService.test.ts`
  - Acceptance: syncAfterSubstitution(weekId, originalRecipeId, newRecipeId) calls spec 003 ListGeneratorService.regenerateList for the affected week; calculates diff between previous list items and new list items; returns ListDiff { added: IngredientItem[], removed: IngredientItem[] }; only affects non-tachado (pending) items; tachado (bought) items remain untouched; triggers async — does not block the substitution confirmation UI; unit tests cover: items added, items removed, mixed add/remove, no change (same ingredients), all items already bought (no change)
  - Refs: spec.md > FR-005, FR-007; plan.md > Dependencies > 003

- [ ] T014 [US2] Implement ListDiffView component
  - Path: `src/components/ListDiffView.tsx`, `tests/component/components/ListDiffView.test.tsx`
  - Acceptance: Shows two sections: "Añadidos" (green, + icon) listing new ingredients with quantities, "Eliminados" (red, − icon) listing removed ingredients; displayed after substitution confirmation on approved menus; accessible (semantic lists); handles empty sections gracefully (e.g., only additions); component test verifies both sections render, empty state, accessibility labels
  - Refs: spec.md > FR-007, HU2 Escenario 3

- [ ] T015 [US2] Handle edge case: items already bought (tachados) remain untouched
  - Path: `src/services/ListSyncService.ts` (extend), `tests/unit/services/ListSyncService.bought.test.ts`
  - Acceptance: When substitution affects ingredients that are already marked as bought (tachado=true in spec 003 ShoppingList), those items are NOT removed from the list; instead, a warning is generated: "Algunos ingredientes ya comprados pueden no ser necesarios" (i18n); warning shown via WarningDismissable component; unit tests cover: substitution removes ingredient that is already bought → warning generated + item untouched; substitution removes ingredient that is pending → item removed normally
  - Refs: spec.md > FR-005, FR-006; HU2 Escenario 2; spec.md > Casos límite

---

## Phase 6: US3 — Registrar señales (P2)

**Goal**: Record substitution signals for future learning (write-only in MVP)

**Independent test**: Perform substitutions with and without reasons, verify signals are persisted correctly

- [ ] T016 [P] [US3] Create SubstitutionSignal model in `src/models/SubstitutionSignal.ts`
  - Path: `src/models/SubstitutionSignal.ts`
  - Acceptance: WatermelonDB Model class with columns: weekId (string), originalRecipeId (string), newRecipeId (string), mealType (string), reason (string, nullable), memberId (string), familyId (string), timestamp (number), createdAt (number); typed with TypeScript interfaces matching data-model.md; exported; write-only entity (no update/delete in normal flow)
  - Refs: data-model.md > SubstitutionSignal

- [ ] T017 [US3] Implement SignalRecorderService in `src/services/SignalRecorderService.ts`
  - Path: `src/services/SignalRecorderService.ts`, `tests/unit/services/SignalRecorderService.test.ts`
  - Acceptance: recordSignal(params: {originalRecipeId, newRecipeId, mealType, reason?, memberId, familyId, weekId}) creates SubstitutionSignal record with current timestamp; executes async (fire-and-forget from SubstitutionService — does not block UI); handles errors gracefully (logs but does not throw to caller); unit tests verify: signal created with all fields, signal created without reason (nullable), error handling (DB write failure does not propagate)
  - Refs: spec.md > FR-009; data-model.md > SubstitutionSignal > Nota

- [ ] T018 [US3] Implement optional reason picker in SubstitutionConfirm screen
  - Path: `src/screens/SubstitutionConfirm/ReasonPicker.tsx`, `tests/component/screens/ReasonPicker.test.tsx`
  - Acceptance: Shown in SubstitutionConfirm screen before final Confirm button; displays 5 predefined reason chips: gusto, falta_ingredientes, tiempo, rechazo_infantil, otro (i18n labels); selection is optional (user can skip — "Sin motivo" option or just confirm without selecting); selected reason passed to SubstitutionService.applySubstitution; component test verifies: renders all options, allows selection, allows skipping, passes value to parent
  - Refs: spec.md > FR-010; contracts/substitution-service.md > SubstitutionReason type

---

## Phase 7: US4 — Histórico original vs ajustado (P2)

**Goal**: Preserve original menu snapshot and show side-by-side comparison with current state

**Independent test**: Make adjustments to a menu, verify original snapshot preserved and side-by-side view works

- [ ] T019 [P] [US4] Create MenuHistory model in `src/models/MenuHistory.ts`
  - Path: `src/models/MenuHistory.ts`
  - Acceptance: WatermelonDB Model class with columns: weekId (string, unique), originalMeals (json), snapshotCreatedAt (number); typed with TypeScript interfaces; PlannedMealSnapshot type defined (id, recipeId, mealType, day, memberIds); exported; immutable after creation (no update methods)
  - Refs: data-model.md > MenuHistory

- [ ] T020 [US4] Implement HistoryService in `src/services/HistoryService.ts`
  - Path: `src/services/HistoryService.ts`, `tests/unit/services/HistoryService.test.ts`
  - Acceptance: getMenuHistory(weekId) queries MenuHistory by weekId (unique index), returns record or null; getOriginalMeals(weekId) returns deserialized PlannedMealSnapshot[] from getMenuHistory or empty array; getCurrentMeals(weekId) reads live PlannedMeal[] from spec 002 repository; hasBeenModified(weekId) returns boolean (true if MenuHistory exists for weekId); createSnapshot(weekId) reads current PlannedMeal[], serializes to JSON, creates MenuHistory record — idempotent (if already exists, returns existing without modification); error: WeekNotFoundError if weekId has no WeeklyMenu; unit tests cover: no history exists, snapshot creation, idempotent re-creation, getOriginalMeals vs getCurrentMeals divergence after adjustment
  - Refs: contracts/history-service.md (full contract), spec.md > FR-008

- [ ] T021 [US4] Implement AdjustmentHistory screen in `src/screens/AdjustmentHistory/`
  - Path: `src/screens/AdjustmentHistory/index.tsx`, `src/screens/AdjustmentHistory/AdjustmentHistory.test.tsx`
  - Acceptance: Shows side-by-side comparison for a selected week: left column "Menú original" with original meals, right column "Menú actual" with current meals; meals grouped by day (lunes→domingo) and mealType; modified meals highlighted (different background/badge); shows "Sin cambios" message if no modifications; navigable from WeekPlanner; component test verifies: side-by-side render, highlight on modified meals, empty state
  - Refs: spec.md > HU4; contracts/history-service.md > UI Usage

---

## Phase 8: Polish & Cross-Cutting

- [ ] T022 [P] Implement WatermelonDB sync adapter for spec 004 tables (push/pull with Supabase)
  - Path: `src/database/sync/sync-adapter-004.ts`, `tests/integration/sync/sync-004.test.ts`
  - Acceptance: Implements @nozbe/watermelondb/sync protocol for 4 tables; pull: fetches changes from Supabase since lastPulledAt; push: sends local created/updated records; conflict resolution: MealAdjustment + SubstitutionSignal + MenuHistory are append-only (no conflicts); SubstitutionCounter: last-write-wins based on highest count; collaborative: different meals = merge, same meal substituted by 2 users = last-write-wins + notification to other user (NFR-004); integration test with mocked Supabase responses
  - Refs: data-model.md > Sync Strategy, spec.md > NFR-003, NFR-004

- [ ] T023 [P] Add offline tests (substitute offline, verify local persistence + sync on reconnect)
  - Path: `tests/integration/offline-substitution.test.ts`
  - Acceptance: Test performs full substitution flow with network mocked as offline; verifies MealAdjustment persists in local WatermelonDB; verifies PlannedMeal.recipeId updated locally; verifies SubstitutionCounter incremented locally; simulates reconnect; verifies sync push sends records to "server" (mocked Supabase); covers: substitute offline → sync, validate offline (restrictions cached locally), counter increments offline
  - Refs: quickstart.md (if exists), spec.md > NFR-001, NFR-002

- [ ] T024 Wire ⇄ button in MealCard (spec 002 WeekPlanner) to open MealSubstitution screen with correct mealId context
  - Path: `src/components/MealCard.tsx` (spec 002 component, extend), `src/navigation/substitution-navigator.ts`
  - Acceptance: ⇄ button on MealCard navigates to MealSubstitution screen with params { mealId, weekId, mealType, currentRecipeId }; navigation registered in app navigator; works for both draft and approved menus; button visible and accessible; integration: pressing ⇄ opens correct screen with pre-filled context
  - Refs: wireframes/01 (MealCard with ⇄ button); plan.md > Dependencies > spec 002

- [ ] T025 Run quickstart.md validation scenarios 1-8
  - Path: `tests/integration/substitution-scenarios.test.ts`
  - Acceptance: Integration test suite covering end-to-end substitution scenarios: (1) substitute meal → valid, (2) substitute meal → blocked by allergy, (3) substitute with preference warning, (4) 5th substitution → regeneration suggestion, (5) substitution on approved menu → list syncs, (6) substitution affects bought items → warning, (7) signal recorded with reason, (8) history snapshot created on first change; all pass green
  - Refs: quickstart.md > Validation Scenarios (if exists)

- [ ] T026 [P] Integrate "⚠ Modificada" badge in WeekSelector (spec 002) using HistoryService.hasBeenModified
  - Path: `src/components/WeekSelector.tsx` (spec 002 component, extend)
  - Acceptance: WeekSelector shows "⚠ Modificada" badge/indicator next to weeks that have been modified (HistoryService.hasBeenModified returns true); badge is subtle (small icon or text, not blocking); badge updates reactively when a substitution is confirmed; accessible (aria-label describes modification status); does not break existing WeekSelector functionality
  - Refs: spec.md > FR-008; plan.md > Dependencies > spec 002

---

## Dependencies

```
Phase 1 (Setup)          → SKIP (already done by spec 005)
Phase 2 (Foundational)   → Depends on spec 005 Phase 2 (schema.ts exists)
Phase 3 (US1)            → Depends on Phase 2 + spec 001 (CriteriaService) + spec 002 (PlannedMeal) + spec 005 (Recipe, CompatibilityTags)
Phase 4 (US1 cont.)      → Depends on Phase 3 (SubstitutionService exists)
Phase 5 (US2)            → Depends on Phase 3 + spec 003 (ListGeneratorService)
Phase 6 (US3)            → Depends on Phase 3 (can start after T007 SubstitutionService)
Phase 7 (US4)            → Depends on Phase 3 (can start after T007 SubstitutionService)
Phase 8 (Polish)         → Depends on all previous phases
```

### Cross-spec dependencies (ALL specs required)

| This task | Depends on (external) |
|-----------|----------------------|
| T006 | spec 001: CriteriaService (load mandatory restrictions per member) |
| T006 | spec 005: CompatibilityTags (recipe compatibility data) |
| T007 | spec 002: PlannedMeal entity + WeeklyMenu status (draft/approved) |
| T008 | spec 005: RecipeCatalog components (recipe list/search UI reuse) |
| T013 | spec 003: ListGeneratorService.regenerateList (shopping list recalculation) |
| T015 | spec 003: ShoppingList item tachado status |
| T020 | spec 002: PlannedMeal repository (read live meals) |
| T024 | spec 002: MealCard component + WeekPlanner navigation |
| T026 | spec 002: WeekSelector component |

### Parallel execution opportunities

```
Phase 2: T001 sequential (schema) → T002 + T003 parallel
Phase 3: T004 + T005 parallel → T006 (needs models) → T007 (needs validator) → T008 + T009 + T010 parallel (UI)
Phase 4: T011 → T012 (sequential, builds on counter logic)
Phase 5: T013 → T014 + T015 parallel (ListDiffView and edge case are independent UI/logic)
Phase 6: T016 parallel with T017 start → T017 → T018 (needs signal service)
Phase 7: T019 parallel → T020 (needs model) → T021 (needs service)
Phase 8: T022 + T023 + T024 + T026 all parallel → T025 (integration — needs everything)
```

---

## Implementation Strategy

**MVP Scope**: Phases 2–5 (US1 + US2 = P1 stories). This delivers core substitution with validation + list sync.

**Incremental delivery**:
1. Phase 2 (Foundational) — database ready
2. Phase 3 (US1 core) — substitute with validation
3. Phase 4 (US1 counter) — regeneration suggestion
4. Phase 5 (US2) — list sync after change
5. Phase 6 (US3, P2) — signal recording for learning
6. Phase 7 (US4, P2) — history comparison
7. Phase 8 (Polish) — sync, offline, wiring, integration tests

**Key integration point**: The ⇄ button on MealCard (wireframe 01, spec 002) is the entry point for this entire spec. T024 wires that button to this spec's MealSubstitution screen.

---

## Legend

- `[P]` = Parallelizable — can be worked on independently / in parallel with other [P] tasks in the same phase
- `[US1]`…`[US4]` = Maps to User Story 1–4 from spec.md
- `Path:` = Primary file(s) created or modified
- `Acceptance:` = Definition of Done for the task
- `Refs:` = Source documents that inform implementation
