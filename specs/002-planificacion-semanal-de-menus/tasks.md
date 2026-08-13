# Tasks: Planificación semanal de menús

**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Data Model**: [data-model.md](./data-model.md)

**Branch**: `feature/002-planificacion-semanal-de-menus`
**Implementation Order**: 3rd (after spec 005, then spec 001)
**Dependencies**: spec 001 (Family, FamilyMember, restrictions/preferences/goals), spec 005 (FamilyRecipe, MasterIngredient catalog)
**Core Screen**: Wireframe 01 — Planificador Semanal (la pantalla MÁS IMPORTANTE del MVP)

---

## Phase 1: Setup (skip if shared setup already done in spec 005/001)

- [ ] T000: Verify project scaffolding exists (Expo + TypeScript strict + WatermelonDB + react-i18next + Jest + RNTL). If not, run shared setup from spec 005.

---

## Phase 2: Foundational — Schema, Migrations, Backend & i18n

- [ ] T001: Create WatermelonDB schema extension for spec 002 tables in `src/database/schema.ts`
  - Add `planned_weeks` table: id, family_id, start_date, end_date, status (draft|approved|incompatible|replaced), approved_at, replaced_by, created_at, updated_at
  - Add `menu_proposals` table: id, week_id, criteria_snapshot (json), generated_at, generation_source (backend|offline), complexity_applied (json)
  - Add `planned_meals` table: id, proposal_id, day, meal_type (breakfast|lunch|dinner|snack), recipe_id, status (planned|out_of_house), variants (json)
  - Add `complexity_configs` table: id, family_id, weekday_level (quick|medium|elaborate), weekend_level (quick|medium|elaborate)
  - Add `meal_explanations` table: id, proposal_id, summary, criteria_respected (json), conflicts_detected (json), compromises_applied (json)
  - Add indexes: idx_week_family_status, idx_week_family_dates, idx_meal_proposal_day, idx_proposal_week, idx_complexity_family

- [ ] T002: [P] Create migration for spec 002 tables in `src/database/migrations/`
  - Migration version increment from spec 001/005 baseline
  - All 5 tables created with correct column types
  - Indexes created
  - Verify migration runs cleanly on fresh DB and on existing DB with spec 001+005 tables

- [ ] T003: [P] Configure Supabase tables + RLS for spec 002
  - Create SQL migration for: planned_weeks, menu_proposals, planned_meals, complexity_configs, meal_explanations
  - RLS policies: users can only access rows where family_id matches their household membership
  - Enable realtime subscriptions on planned_weeks.status changes
  - Foreign keys: planned_weeks.family_id → families.id, menu_proposals.week_id → planned_weeks.id, planned_meals.proposal_id → menu_proposals.id, planned_meals.recipe_id → family_recipes.id, complexity_configs.family_id → families.id

- [ ] T004: [P] Setup i18n namespace `002-planner` with `src/i18n/002-planner/es.json`
  - Keys: weekPlanner.title, weekPlanner.weekOf, weekPlanner.statusDraft, weekPlanner.statusApproved, weekPlanner.statusModified, weekPlanner.statusIncompatible
  - Keys: mealCard.kcal, mealCard.protein, mealCard.substitute, mealCard.outOfHouse
  - Keys: emptySlot.addBreakfast, emptySlot.addLunch, emptySlot.addDinner, emptySlot.addSnack
  - Keys: approval.approveWeek, approval.confirmReplace, approval.alreadyApproved
  - Keys: generation.generating, generation.insufficientCriteria, generation.insufficientRecipes, generation.generateMenu
  - Keys: explanation.criteriaRespected, explanation.conflicts, explanation.compromises
  - Keys: incompatibility.warning, incompatibility.replan, incompatibility.keep

---

## Phase 3: US1 — Generar menú semanal (P1) 🎯 MVP CORE

**Goal**: Generate weekly menu proposal respecting family criteria (restrictions, preferences, goals, complexity, no-repeat rules).

- [ ] T005: [P] [US1] Create PlannedWeek model in `src/models/PlannedWeek.ts`
  - WatermelonDB Model class extending Model
  - Fields: familyId, startDate, endDate, status, approvedAt, replacedBy, createdAt, updatedAt
  - Associations: hasMany MenuProposal (via weekId)
  - Computed: isApproved, isDraft, isIncompatible, dateRangeLabel
  - Validation: endDate >= startDate, max 7 days span

- [ ] T006: [P] [US1] Create MenuProposal model in `src/models/MenuProposal.ts`
  - WatermelonDB Model class extending Model
  - Fields: weekId, criteriaSnapshot (json), generatedAt, generationSource, complexityApplied (json)
  - Associations: belongsTo PlannedWeek, hasMany PlannedMeal (via proposalId), hasOne MealExplanation
  - Computed: source label for UI display

- [ ] T007: [P] [US1] Create PlannedMeal model in `src/models/PlannedMeal.ts`
  - WatermelonDB Model class extending Model
  - Fields: proposalId, day, mealType, recipeId, status, variants (json)
  - Associations: belongsTo MenuProposal, belongsTo FamilyRecipe (spec 005)
  - Computed: hasVariants, isOutOfHouse, mealTypeColor (orange/green/purple/terracotta per wireframe)
  - Enum: MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

- [ ] T008: [P] [US1] Create ComplexityConfig model in `src/models/ComplexityConfig.ts`
  - WatermelonDB Model class extending Model
  - Fields: familyId, weekdayLevel, weekendLevel
  - Enum: ComplexityLevel = 'quick' | 'medium' | 'elaborate'
  - Constraint: one per familyId (enforced in service layer)

- [ ] T009: [US1] Implement PlanGeneratorService in `src/services/PlanGeneratorService.ts`
  - Full pipeline orchestration:
    1. `fetchCriteria(familyId)` → load restrictions, preferences, goals from spec 001 models
    2. `filterRecipes(allRecipes, restrictions)` → exclude recipes violating mandatory restrictions
    3. `filterByMealType(recipes, mealType)` → filter by FamilyRecipe.suitableForMealTypes
    4. `applyComplexity(recipes, dayType, config)` → filter by prepTimeMinutes thresholds (quick<30, medium 30-60, elaborate>60; null→medium)
    5. `prioritize(recipes, preferences, goals)` → score recipes by preference matches and goal alignment
    6. `avoidRepetition(recipes, usedTracker, mealType)` → enforce no-repeat for lunch/dinner; allow repeat for breakfast/snack
    7. `buildWeekStructure(selectedRecipes, dateRange, activeMealTypes)` → assemble PlannedMeal[] respecting Family.activeMealTypes
    8. `generateExplanation(proposal, criteria)` → build MealExplanation with criteria respected/conflicts/compromises
  - Strategy pattern: BackendGenerator (primary) + OfflineGenerator (fallback)
  - Error handling: InsufficientCriteriaError, InsufficientRecipesError (with partial proposal)
  - Complexity relaxation: if pool empty at current level, relax one notch and document in explanation
  - Variant detection: when recipe incompatible for specific member, find alternative and store as MealVariant

- [ ] T010: [US1] Implement Supabase Edge Function for backend generation in `supabase/functions/generate-menu/`
  - Receives: familyId, dateRange, options
  - Loads: family criteria, recipe catalog from Supabase tables
  - Runs: constraint satisfaction algorithm (same logic as local but with full catalog)
  - Returns: MenuProposal JSON with all PlannedMeals
  - Performance: <15s for standard household (≤6 members, full week)
  - Auth: verify user belongs to family via RLS context

- [ ] T011: [US1] Implement offline fallback generator in `src/services/OfflineGenerator.ts`
  - Simplified local algorithm using WatermelonDB cached recipes
  - Operates on locally-available FamilyRecipe subset
  - Same pipeline steps but with reduced recipe pool
  - Returns generationSource: 'offline'
  - Graceful degradation: may produce partial proposal if local catalog insufficient

- [ ] T012: [US1] Implement ComplexityService in `src/services/ComplexityService.ts`
  - CRUD operations: getConfig(familyId), createConfig(familyId, weekdayLevel, weekendLevel), updateConfig(configId, levels)
  - Derive level from prepTimeMinutes: quick (<30), medium (30-60), elaborate (>60), null → medium
  - Used by PlanGeneratorService.applyComplexity step
  - Default config: weekday=quick, weekend=medium (created on first use if missing)

- [ ] T013: [US1] Implement repetition checker in `src/utils/repetitionChecker.ts`
  - Track used recipeIds per mealType within a week
  - `canUseRecipe(recipeId, mealType, usedTracker)` → boolean
  - Rules: lunch/dinner → no repeat within same week; breakfast/snack → repeat allowed
  - `markUsed(recipeId, mealType, usedTracker)` → updated tracker
  - Type: RepetitionTracker = Map<MealType, Set<string>>

---

## Phase 4: US2 — Vista semanal (P1) 🎯 CORE UI (wireframe 01) — LA PANTALLA PRINCIPAL DEL MVP

**Goal**: Display plan organized by days and meal types. This is THE MAIN SCREEN of the entire application per wireframe 01.

**Wireframe reference**: `wireframes/01-planificador-semanal.md`
**Design principles**: Scroll vertical por días, zona de acción inferior (thumb-reachable), un solo color de acento (verde), touch targets 52px mínimo, uso con una mano.

---

### T014: [US2] WeekPlanner Screen — `src/screens/WeekPlanner/`

- [ ] T014: [US2] Implement WeekPlanner screen — CORE SCREEN per wireframe 01

  **Layout structure** (top to bottom):
  ```
  ┌─────────────────────────────────────┐
  │  WeekSelector (sticky top)          │
  │  ← Semana del 4 al 10 ago →        │
  │        ● En borrador                │
  ├─────────────────────────────────────┤
  │  ScrollView (vertical)              │
  │                                     │
  │  ── Lunes 4 ago ──────────────────  │
  │  [MealCard: Desayuno - naranja]     │
  │  [MealCard: Comida - verde]         │
  │  [MealCard: Cena - violeta]         │
  │  [EmptySlot: + Añadir snack]        │
  │                                     │
  │  ── Martes 5 ago ─────────────────  │
  │  [MealCard: Desayuno - naranja]     │
  │  ...                                │
  │                                     │
  │  ── (repeat for each day) ──        │
  │                                     │
  ├─────────────────────────────────────┤
  │  [████ Aprobar semana ████] (green) │
  ├─────────────────────────────────────┤
  │  Tab Bar: Plan | Recetas | 🛒 | 👥 │
  └─────────────────────────────────────┘
  ```

  **Implementation details**:
  - Screen registered in navigation stack as main/home screen
  - FlatList/ScrollView with vertical scroll per days (no horizontal swipe, no grid)
  - Sticky WeekSelector at top (does not scroll away)
  - "Aprobar semana" button fixed above tab bar (in SafeAreaView bottom zone)
  - If no proposal exists for current week: show centered "Generar menú" button (green outline) instead of day list
  - Loading state during generation: skeleton cards with shimmer animation
  - Pull-to-refresh: re-fetch latest proposal from WatermelonDB observable
  - Empty state: friendly illustration + "Genera tu primer menú semanal" CTA

  **Accessibility**:
  - Screen reader: announce current week and status on focus
  - All touch targets ≥ 52px
  - Color contrast ratio ≥ 4.5:1 for text on colored backgrounds
  - Semantic heading structure: day names as headings

---

### T015: [US2] WeekSelector Component — `src/components/WeekSelector.tsx`

- [ ] T015: [US2] Implement WeekSelector component

  **Visual spec** (per wireframe 01):
  ```
  ┌───────────────────────────────────┐
  │  ◀   Semana del 4 al 10 ago   ▶  │
  │          ● En borrador            │
  └───────────────────────────────────┘
  ```

  **Props**:
  ```typescript
  interface WeekSelectorProps {
    startDate: Date;
    endDate: Date;
    status: 'draft' | 'approved' | 'incompatible' | 'replaced';
    onPreviousWeek: () => void;
    onNextWeek: () => void;
    hasModifications?: boolean;  // true → show "⚠ Modificada" instead of "✓ Aprobada"
  }
  ```

  **Behavior**:
  - Date range display: "Semana del {startDay} al {endDay} {month}" (abbreviated month, i18n)
  - Left arrow: navigate to previous week (wraps to prev month)
  - Right arrow: navigate to next week (wraps to next month)
  - Arrow touch targets: 52px × 52px minimum
  - Status badge below date range, centered:
    - Draft: "● En borrador" — grey dot + grey text
    - Approved (no modifications): "✓ Aprobada" — green check + green text
    - Approved (with modifications): "⚠ Modificada" — amber warning + amber text
    - Incompatible: "⚠ Incompatible" — red warning + red text
  - Status computed from PlannedWeek.status + HistoryService check for post-approval edits
  - Haptic feedback on arrow tap (light impact)

  **Styling**:
  - Background: white, subtle bottom shadow (elevation 2)
  - Date text: 16px semibold, color.textPrimary
  - Badge text: 13px medium, color per status
  - Padding: 16px horizontal, 12px vertical

---

### T016: [US2] MealCard Component — `src/components/MealCard.tsx`

- [ ] T016: [US2] Implement MealCard component

  **Visual spec** (per wireframe 01 — the MOST USED component in the app):
  ```
  ┌──┬──────────────────────────────────┐
  │▐▐│  Pasta con verduras              │
  │▐▐│  🔥 450 kcal   💪 22g prot      │
  │▐▐│                            ⇄    │
  └──┴──────────────────────────────────┘
   ↑ color sidebar (3px)          ↑ substitute button (52×52 touch)
  ```

  **Props**:
  ```typescript
  interface MealCardProps {
    meal: PlannedMeal;
    recipe: FamilyRecipe;       // from spec 005 - needed for name, kcal, protein
    mealType: MealType;
    onSubstitute: (mealId: string) => void;
    onLongPress?: (mealId: string) => void;  // for "out of house" marking
    variants?: MealVariant[];
  }
  ```

  **Color sidebar mapping** (per wireframe 01):
  - `breakfast` → naranja (#F5A623 / orange-400)
  - `lunch` → verde (#7ED321 / green-500)
  - `dinner` → violeta (#9B59B6 / purple-500)
  - `snack` → terracota (#E07C4F / terracotta-400)
  - Sidebar width: 3px, full height of card, left edge, rounded corners on card

  **Content layout**:
  - Recipe name: 15px medium, color.textPrimary, max 2 lines with ellipsis
  - Nutritional badges (row below name):
    - Calories: "🔥 {kcal} kcal" — light green background pill (border-radius 12px)
    - Protein: "💪 {protein}g prot" — light green background pill
    - Badge text: 12px regular, color.textSecondary
  - Substitute button (⇄): positioned right-center of card
    - Touch target: 52px × 52px (per wireframe accessibility requirement)
    - Icon: swap/arrows icon, 20px, color.textTertiary
    - onPress → navigates to RecipeCatalog with filters pre-applied (mealType + day)

  **States**:
  - Normal: white background, subtle shadow (elevation 1)
  - Out of house: grey overlay + "Fuera" badge top-right
  - Pressed: slight scale down (0.98) + background darken
  - Long press (500ms): trigger bottom sheet with "Marcar fuera de casa" option

  **Card dimensions**:
  - Width: 100% - 32px (16px padding each side)
  - Height: auto (content-driven), min 72px
  - Margin bottom: 8px between cards
  - Border radius: 12px
  - Padding: 12px top/bottom, 16px right (for substitute button space), 0 left (sidebar flush)

---

### T017: [US2] EmptySlot Component — `src/components/EmptySlot.tsx`

- [ ] T017: [US2] Implement EmptySlot component

  **Visual spec** (per wireframe 01):
  ```
  ┌─────────────────────────────────────┐
  │                                     │
  │         + Añadir comida             │
  │                                     │
  └─────────────────────────────────────┘
  (crema/warm background, dashed border)
  ```

  **Props**:
  ```typescript
  interface EmptySlotProps {
    mealType: MealType;
    day: string;              // ISO date
    onAdd: (mealType: MealType, day: string) => void;
  }
  ```

  **Behavior**:
  - Display text: "+ Añadir {mealTypeName}" where mealTypeName is localized (desayuno/comida/cena/snack)
  - On tap: navigate to RecipeCatalog screen (spec 005) with pre-applied filters:
    - `mealType` filter active
    - On recipe selection → create PlannedMeal with selected recipe
  - Touch target: entire card area (full width, min height 56px)

  **Styling**:
  - Background: crema cálido (#FFF8F0 / cream-50)
  - Border: 1px dashed, color.borderLight (#E0D5C8)
  - Border radius: 12px (same as MealCard)
  - Text: 14px medium, color.textTertiary, centered
  - "+" prefix: slightly larger (16px), same color
  - Margin bottom: 8px (same rhythm as MealCard)
  - Width: same as MealCard (100% - 32px padding)

---

### T018: [US2] DayView Section — within WeekPlanner

- [ ] T018: [US2] Implement DayView section within WeekPlanner

  **Visual spec**:
  ```
  ── Lunes 4 ago ──────────────────────
  [MealCard: Desayuno]     ← only if 'breakfast' in activeMealTypes
  [MealCard: Comida]       ← only if 'lunch' in activeMealTypes
  [EmptySlot: + Añadir cena]  ← if no recipe assigned for dinner
  [MealCard: Snack]        ← only if 'snack' in activeMealTypes
  ```

  **Props**:
  ```typescript
  interface DayViewProps {
    date: string;                    // ISO date
    meals: PlannedMeal[];            // meals for this day
    activeMealTypes: MealType[];     // from Family.activeMealTypes (spec 001)
    onSubstitute: (mealId: string) => void;
    onAddMeal: (mealType: MealType, day: string) => void;
    onMarkOutOfHouse: (mealId: string) => void;
  }
  ```

  **Behavior**:
  - Day header: "{DayName} {dayNumber} {monthAbbr}" — 14px semibold, color.textSecondary, with horizontal line
  - For each mealType in activeMealTypes (ordered: breakfast → lunch → dinner → snack):
    - If meal exists for that type → render MealCard
    - If no meal → render EmptySlot
  - Meal order always follows: breakfast, lunch, dinner, snack (regardless of activeMealTypes order)
  - Day separator: 24px vertical spacing between days
  - First day: 8px top margin (below WeekSelector)

---

### T019: [US2] "Out of House" Marking

- [ ] T019: [US2] Implement "out of house" marking via long press

  **Interaction flow**:
  1. User long-presses (500ms) on a MealCard
  2. Bottom sheet appears with option: "Marcar como fuera de casa"
  3. On confirm → PlannedMeal.status changes to 'out_of_house'
  4. MealCard visual changes: grey overlay + "Fuera" badge (grey pill, top-right)
  5. Long-press again on out_of_house meal → option to "Restaurar comida planificada"

  **Implementation**:
  - Use `Pressable` with `onLongPress` handler (delayLongPress: 500)
  - Bottom sheet: react-native-bottom-sheet or similar
  - Update PlannedMeal.status via WatermelonDB writer
  - Visual feedback: haptic (medium impact) on long-press trigger
  - Grey badge: background #9E9E9E, text white "Fuera", 11px, border-radius 8px

---

### T020: [US2] Wire WeekPlanner to PlanGeneratorService

- [ ] T020: [US2] Wire WeekPlanner to PlanGeneratorService (generate → display)

  **Flow**:
  1. User lands on WeekPlanner with no proposal for current week
  2. Screen shows empty state: "Genera tu menú semanal" + green outline button "Generar menú"
  3. User taps "Generar menú"
  4. Loading state: skeleton MealCards with shimmer (7 days × activeMealTypes count)
  5. PlanGeneratorService.generateProposal(familyId, currentWeekRange) called
  6. On success: PlannedWeek + MenuProposal + PlannedMeals written to WatermelonDB
  7. WatermelonDB observable triggers re-render → DayViews populate with MealCards
  8. On error (InsufficientCriteria): show inline error with link to family config
  9. On error (InsufficientRecipes): show partial results + warning banner

  **State management**:
  - Use WatermelonDB `withObservables` HOC or `useObservable` hook
  - Query: PlannedWeek where familyId = currentFamily AND startDate matches current week
  - Nested query: MenuProposal → PlannedMeals for the active proposal
  - Recipes loaded via PlannedMeal.recipeId → FamilyRecipe lookup

  **Loading skeleton**:
  - Same dimensions as MealCard (72px height, full width)
  - Animated gradient shimmer (left to right, 1.5s loop)
  - Show for each expected slot (activeMealTypes × days in range)

---

## Phase 5: US4 — Aprobar menú (P1)

**Goal**: Approve proposal as active menu for the week. Enables lista de la compra generation (spec 003).

- [ ] T021: [US4] Implement ApprovalService in `src/services/ApprovalService.ts`
  - `approveProposal(proposalId)` → PlannedWeek.status → 'approved', set approvedAt timestamp
  - `replaceApproved(weekId, newProposalId)` → old status → 'replaced' + replacedBy set, new → 'approved'
  - `getApprovedWeek(familyId, dateRange)` → find PlannedWeek with status 'approved' overlapping dateRange
  - `markIncompatible(weekId, reason)` → status → 'incompatible', store IncompatibilityReason
  - Validation: draft → approved only, approved → replaced only, replaced is immutable
  - Error types: AlreadyApprovedError, NotApprovedError, InvalidStateError
  - Offline-capable: all operations via WatermelonDB, sync in background

- [ ] T022: [US4] Implement "Aprobar semana" button in WeekPlanner (per wireframe 01)

  **Visual spec**:
  ```
  ┌─────────────────────────────────────┐
  │        ████████████████████         │
  │        █  Aprobar semana  █         │
  │        ████████████████████         │
  └─────────────────────────────────────┘
  (green rectangular button, bottom of scroll, above tab bar)
  ```

  **Implementation**:
  - Position: fixed at bottom of screen content (scrolls with content, always visible when scrolled to bottom); OR sticky above tab bar if proposal short
  - Color: verde (#4CAF50 / green-500) background, white text
  - Text: "Aprobar semana" — 16px semibold, centered
  - Dimensions: width calc(100% - 32px), height 52px, border-radius 12px
  - Touch target: entire button (52px height satisfies minimum)
  - Margin: 24px top (from last DayView), 16px bottom (above tab bar safe area)
  - States:
    - Default: green background
    - Pressed: darker green (#388E3C)
    - Disabled: grey background (#BDBDBD) — when no proposal exists or already approved
    - Loading: spinner replacing text during approval
  - On tap: call ApprovalService.approveProposal → update WeekSelector badge to "✓ Aprobada"
  - Success feedback: haptic (success), brief toast "Semana aprobada ✓"
  - Hidden when: PlannedWeek.status is already 'approved' (show "✓ Aprobada" label instead)

- [ ] T023: [US4] Implement status badge updates in WeekSelector
  - On approval: badge transitions from "● En borrador" → "✓ Aprobada" with brief animation (fade)
  - On modification post-approval: badge shows "⚠ Modificada" (amber)
  - On incompatibility detection: badge shows "⚠ Incompatible" (red)
  - Reactive: observes PlannedWeek.status via WatermelonDB observable
  - No manual refresh needed — UI updates immediately on status write

- [ ] T024: [US4] Implement replace flow (if week already approved)
  - Trigger: user generates new proposal for an already-approved week
  - Confirmation dialog: "Ya tienes un menú aprobado para esta semana. ¿Quieres reemplazarlo?"
  - Options: "Reemplazar" (destructive, red text) / "Cancelar"
  - On confirm: ApprovalService.replaceApproved(weekId, newProposalId)
  - Old proposal: PlannedWeek.status → 'replaced', replacedBy → new weekId
  - New proposal: shown in WeekPlanner, status 'draft' (user must re-approve)
  - History preserved: replaced weeks accessible in history (future feature)

---

## Phase 6: US3 — Explicación de encaje (P2)

**Goal**: Show why the proposal fits family criteria. Increases trust, reduces "black box" feeling.

- [ ] T025: [P] [US3] Create MealExplanation model in `src/models/MealExplanation.ts`
  - WatermelonDB Model class extending Model
  - Fields: proposalId, summary (i18n key), criteriaRespected (json string[]), conflictsDetected (json string[]), compromisesApplied (json string[])
  - Association: belongsTo MenuProposal
  - Computed: hasCriteria, hasConflicts, hasCompromises

- [ ] T026: [US3] Implement explanation generation in PlanGeneratorService.generateExplanation()
  - Input: completed MenuProposal + CriteriaSnapshot
  - Output: MealExplanation record
  - Logic:
    - criteriaRespected: list restrictions honored (e.g., "Sin gluten respetado para María")
    - conflictsDetected: list conflicts found (e.g., "Objetivo proteico de Pedro difícil con restricciones actuales")
    - compromisesApplied: list relaxed criteria (e.g., "Complejidad relajada de 'quick' a 'medium' el miércoles por falta de recetas rápidas")
    - summary: i18n key describing overall fit level ("Buen encaje" / "Encaje con compromisos" / "Encaje parcial")
  - Explanation generated as part of generateProposal pipeline (step 8)

- [ ] T027: [US3] Implement ExplanationPanel component in `src/components/ExplanationPanel.tsx`
  - Expandable section within WeekPlanner (below WeekSelector, above day list)
  - Collapsed state: single line "ℹ️ Ver por qué este menú encaja" — tap to expand
  - Expanded state:
    - Section "✓ Criterios respetados": green checkmarks + list
    - Section "⚠ Conflictos": amber warnings + list (only if any)
    - Section "↔ Compromisos": neutral icons + list (only if any)
  - Animation: expand/collapse with LayoutAnimation (200ms ease)
  - Styling: light grey background, 12px padding, below WeekSelector

---

## Phase 7: US5 — Detección de incompatibilidad (P2)

**Goal**: Warn when profile change makes approved menu potentially incompatible.

- [ ] T028: [US5] Implement IncompatibilityService in `src/services/IncompatibilityService.ts`
  - Observer pattern: watches DietaryRestriction table (spec 001) for changes
  - On restriction added/modified: check all approved PlannedWeeks for the family
  - For each approved week: check if any PlannedMeal uses a recipe incompatible with new restriction
  - If incompatible meals found: call ApprovalService.markIncompatible(weekId, reason)
  - IncompatibilityReason: { memberId, changeType: 'restriction_added'|'restriction_modified', affectedMeals: string[], description }
  - Runs locally (no backend needed), triggered by WatermelonDB observer

- [ ] T029: [US5] Implement IncompatibilityBanner component in `src/components/IncompatibilityBanner.tsx`
  - Position: below WeekSelector, above day list (replaces ExplanationPanel position when active)
  - Visual: yellow/amber background (#FFF3CD), amber border, warning icon
  - Text: "⚠ Este menú puede ser incompatible con los cambios recientes en perfiles"
  - Actions (two buttons, side by side):
    - "Replanificar" → triggers new generation (goes through replace flow)
    - "Mantener" → dismisses banner, keeps menu as-is (status stays incompatible but user acknowledged)
  - Shown only when PlannedWeek.status === 'incompatible'
  - Dismissible: "Mantener" hides for session, but banner returns if user navigates away and back

- [ ] T030: [US5] Wire observer to WatermelonDB changes on DietaryRestriction table
  - Setup subscription in app initialization (or WeekPlanner mount)
  - WatermelonDB `experimentalSubscribe` or `observe()` on DietaryRestriction collection
  - On change event: IncompatibilityService.checkAllApprovedWeeks(familyId)
  - Debounce: 1000ms (avoid triggering on rapid successive changes)
  - Cleanup: unsubscribe on app background/unmount

---

## Phase 8: Variants & Partial Weeks

**Goal**: Handle per-member recipe alternatives and non-standard week ranges.

- [ ] T031: [US1] Implement variant support in PlannedMeal
  - During generation: when main recipe incompatible for specific member → find alternative
  - Store in PlannedMeal.variants JSON: [{ memberId, recipeId, reason }]
  - Logic in PlanGeneratorService: after selecting main recipe, check each member's restrictions
  - If conflict: search for closest alternative (same mealType, similar nutrition) and store as variant
  - Reason field: human-readable explanation (e.g., "celiaquía", "alergia a frutos secos")

- [ ] T032: [US2] Display variants in MealCard
  - When meal.variants is non-empty: show small badge below recipe name
  - Badge format: "👤 {memberName}: {altRecipeName}" — 11px, grey background pill
  - If multiple variants: stack vertically (max 2 visible, "+N más" if overflow)
  - Tap on variant badge → navigates to recipe detail of the alternative

- [ ] T033: [US2] Implement partial week selection in WeekSelector
  - Instead of always Mon-Sun, allow user to pick custom date range
  - Tap on date range text → opens DateRangePicker modal
  - Validation: max 7 days, startDate ≤ endDate, startDate ≥ today
  - Selected range updates WeekPlanner view (only shows selected days)
  - PlanGeneratorService receives custom dateRange instead of full week

---

## Phase 9: Polish & Cross-Cutting

**Goal**: Sync, collaboration, complexity configuration, and integration validation.

- [ ] T034: [P] Implement WatermelonDB sync for spec 002 tables
  - Configure push/pull rules for: planned_weeks, menu_proposals, planned_meals, complexity_configs, meal_explanations
  - Sync strategy: incremental based on updatedAt timestamps
  - Pull: fetch changes from Supabase since last pull timestamp
  - Push: send local changes to Supabase
  - Conflict: server-wins for same record, with local notification

- [ ] T035: [P] Implement collaborative merge logic
  - Different days edited by different users: auto-merge without conflict
  - Same day, different mealType: auto-merge without conflict
  - Same day + same mealType: last-write-wins + push notification to other user
  - Approval race: first approval wins, second user gets AlreadyApprovedError with option to view approved version
  - Implementation: merge logic in sync adapter, conflict detection in pull handler

- [ ] T036: [P] Implement ComplexitySelector screen/modal in `src/components/ComplexitySelector.tsx`
  - Accessible from: FamiliaConfiguracion screen (spec 001) or via WeekPlanner settings gear
  - UI: two rows — "Entre semana" and "Fin de semana"
  - Each row: segmented control with 3 options — Rápido | Medio | Elaborado
  - Visual: selected segment highlighted in green, with time estimate below (< 30 min / 30-60 min / > 60 min)
  - On change: ComplexityService.updateConfig → affects next generation
  - Default: weekday=Rápido, weekend=Medio

- [ ] T037: Run quickstart.md validation scenarios 1-8
  - Scenario 1: Generate menu for family with complete criteria → verify all days covered
  - Scenario 2: Generate with insufficient criteria → verify InsufficientCriteriaError
  - Scenario 3: Generate with restrictive criteria → verify compromises in explanation
  - Scenario 4: Approve menu → verify status transitions and approvedAt set
  - Scenario 5: Replace approved menu → verify old=replaced, new=draft
  - Scenario 6: Mark out of house → verify PlannedMeal.status change
  - Scenario 7: Add restriction post-approval → verify incompatibility detection
  - Scenario 8: Offline generation → verify fallback works with cached recipes

- [ ] T038: Tab bar integration — "Plan" tab active (green) when on WeekPlanner
  - Tab bar position: bottom of screen, fixed (below safe area)
  - Tabs: Plan (calendar icon) | Recetas (book icon) | Compra 🛒 | Familia (people icon)
  - "Plan" tab: first position, highlighted green when active
  - Active indicator: filled icon + green color (#4CAF50), label bold
  - Inactive: outlined icon + grey (#757575), label regular
  - WeekPlanner is the default/home screen when app launches

---

## Summary

| Phase | Tasks | Priority | Status |
|-------|-------|----------|--------|
| 1. Setup | T000 | — | Skip if done |
| 2. Foundational | T001–T004 | P1 | Not started |
| 3. US1 Generation | T005–T013 | P1 🎯 | Not started |
| 4. US2 Core UI | T014–T020 | P1 🎯🎯 | Not started |
| 5. US4 Approval | T021–T024 | P1 | Not started |
| 6. US3 Explanation | T025–T027 | P2 | Not started |
| 7. US5 Incompatibility | T028–T030 | P2 | Not started |
| 8. Variants & Partial | T031–T033 | P2 | Not started |
| 9. Polish & Cross-Cutting | T034–T038 | P1/P2 | Not started |

**Critical path**: Phase 2 → Phase 3 → **Phase 4 (CORE UI)** → Phase 5

**Phase 4 is the most critical deliverable** — it is the primary screen users interact with and the centerpiece of the wireframe validation. All other features feed into or extend this screen.

---

## Notes

- All tasks marked `[P]` are parallelizable (can be worked on simultaneously with other `[P]` tasks in same phase)
- All UI components must follow wireframe 01 specifications exactly
- TDD mandatory per constitution: write failing test → implement → refactor
- i18n: every user-visible string must use `t('002-planner.key')` format
- Offline: all read/write operations must work without network
- Touch targets: minimum 52px per wireframe accessibility requirements
- Single accent color: verde (#4CAF50) for actions only, never decoration
