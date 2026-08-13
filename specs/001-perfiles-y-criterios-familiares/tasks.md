# Tasks: Perfiles familiares y criterios alimentarios

**Input**: Design documents from `/specs/001-perfiles-y-criterios-familiares/`

**Prerequisites**: plan.md ✓, spec.md ✓, data-model.md ✓, contracts/ ✓, wireframes/05-familia-configuracion.md ✓

**Implementation Order**: Second (after spec 005 — Catálogo). Shared setup may already exist.

**Wireframe Reference**: wireframe 05 — Familia y Configuración

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Exact file paths included in descriptions

---

## Phase 1: Setup (Shared Infrastructure — skip if already done in spec 005)

**Purpose**: Project initialization and basic structure. If spec 005 has already been implemented, this phase is a no-op.

- [ ] T001 Create project structure per implementation plan (skip if already done in spec 005)

**Checkpoint**: Project scaffolding exists with Expo + TypeScript + WatermelonDB + react-i18next + Jest configured.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database schema, migrations, backend tables, and i18n namespace for spec 001 entities

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T002 Create WatermelonDB schema for spec 001 tables (Family, FamilyMember, DietaryRestriction, FoodPreference, NutritionalGoal) in `src/database/schema.ts` — extend existing schema from spec 005
- [ ] T003 [P] Create initial migration for spec 001 tables in `src/database/migrations/`
- [ ] T004 [P] Configure Supabase tables + RLS policies for spec 001 entities (Family, FamilyMember, DietaryRestriction, FoodPreference, NutritionalGoal)
- [ ] T005 [P] Setup i18n namespace `001-profiles` with `src/i18n/001-profiles/es.json` (labels for family, members, restrictions, preferences, goals, readiness, meal types)

**Checkpoint**: Foundation ready — database schema defined, migrations runnable, backend tables created, i18n keys available. User story implementation can now begin.

---

## Phase 3: US1 — Registrar miembros de la familia (Priority: P1) 🎯 MVP

**Goal**: Create family unit + add/edit/archive members. Main screen per wireframe 05 layout (member cards, banner, meal chips, consolidated restrictions, add button).

**Independent Test**: Create a family with several members, edit one, archive another, verify member list reflects changes correctly.

### Implementation for User Story 1

- [ ] T006 [P] [US1] Create Family model in `src/models/Family.ts` (fields: id, name, ownerId, activeMealTypes, createdAt, updatedAt — per data-model.md)
- [ ] T007 [P] [US1] Create FamilyMember model in `src/models/FamilyMember.ts` (fields: id, familyId, name, age, sex, archivedAt, restrictionsReviewed, createdAt, updatedAt — with soft delete via archivedAt)
- [ ] T008 [US1] Implement FamilyService in `src/services/FamilyService.ts` (createFamily, getFamily, updateFamily, addMember, updateMember, archiveMember, reactivateMember, getActiveMembers, getAllMembers, updateMealTypes — per contracts/family-service.md)
- [ ] T009 [US1] Implement FamilySetup screen in `src/screens/FamilySetup/` (create household flow — onboarding: input family name, add first member)
- [ ] T010 [US1] Implement FamiliaConfiguracion screen in `src/screens/FamiliaConfiguracion/` (main screen per wireframe 05: member list with cards, banner readiness, meal type chips, consolidated restrictions, "Añadir miembro" button, tab bar with Familia active)
- [ ] T011 [US1] Implement MemberCard component in `src/components/MemberCard.tsx` (avatar circle with initial — green for owner/crema for others, name, age, goal badge, restriction badges with 🚫, arrow › for navigation to detail)
- [ ] T012 [US1] Implement MemberDetail screen in `src/screens/MemberDetail/` (edit member: name, age, sex fields + navigation links to restrictions/preferences/goals screens)

**Checkpoint**: Family unit can be created, members added/edited/archived, main FamiliaConfiguracion screen renders member cards with wireframe 05 layout.

---

## Phase 4: US2 — Restricciones, preferencias y aversiones (Priority: P1)

**Goal**: Associate dietary restrictions and food preferences per member. Detect coherence conflicts (restriction vs liked preference). Per spec: restriction prevails, warning shown.

**Independent Test**: Configure allergies, intolerances, preferences and disliked foods for a member. Verify they are stored differentiated. Create a conflict and verify warning appears.

### Implementation for User Story 2

- [ ] T013 [P] [US2] Create DietaryRestriction model in `src/models/DietaryRestriction.ts` (fields: id, memberId, category, name, severity, notes, createdAt — severity auto-inferred from category per data-model.md)
- [ ] T014 [P] [US2] Create FoodPreference model in `src/models/FoodPreference.ts` (fields: id, memberId, foodItem, type, intensity, createdAt)
- [ ] T015 [US2] Implement CriteriaService in `src/services/CriteriaService.ts` (addRestriction, updateRestriction, removeRestriction, getMemberRestrictions, getMandatoryRestrictions, addPreference, updatePreference, removePreference, getMemberPreferences, checkCoherence — per contracts/criteria-service.md)
- [ ] T016 [US2] Implement Restrictions screen in `src/screens/Restrictions/` (list restrictions by member, add new with category picker: allergy/intolerance/ethical_religious/preference, severity auto-assigned based on category, notes optional)
- [ ] T017 [US2] Implement Preferences screen in `src/screens/Preferences/` (list liked/disliked items per member, add with foodItem + type toggle + intensity picker)
- [ ] T018 [US2] Implement coherence warning UI (when preference type=liked conflicts with restriction name → show warning banner: "La restricción tiene prioridad", restriction prevails — non-blocking)

**Checkpoint**: Member restrictions and preferences stored correctly. Coherence check detects conflicts and displays warning without blocking.

---

## Phase 5: US3 — Objetivos nutricionales (Priority: P1)

**Goal**: Define nutritional goals per member as simple labels (lose_weight/maintain/gain_muscle). Detect conflicting goals (lose_weight + gain_muscle → warning).

**Independent Test**: Assign different goals to members, verify they persist as active criteria. Create a conflict and verify warning.

### Implementation for User Story 3

- [ ] T019 [P] [US3] Create NutritionalGoal model in `src/models/NutritionalGoal.ts` (fields: id, memberId, goalType, priority, isActive, createdAt, updatedAt)
- [ ] T020 [US3] Implement CriteriaService goal methods — extend existing service in `src/services/CriteriaService.ts` (addGoal, updateGoal, removeGoal, getActiveGoals + goal conflict detection in checkCoherence)
- [ ] T021 [US3] Implement Goals screen in `src/screens/Goals/` (select goalType per member: lose_weight/maintain/gain_muscle, show conflict warning if contradictory goals coexist)
- [ ] T022 [US3] Implement GoalSelector component in `src/components/GoalSelector.tsx` (toggle/picker for goal type, visual feedback for active selection, warning indicator for conflicts)

**Checkpoint**: Goals assigned per member, conflicts detected informatively, goal badge visible in MemberCard.

---

## Phase 6: US4 — Revisar readiness (Priority: P2)

**Goal**: Show whether family has minimum data to generate reliable meal plans. Computed on-demand, not persisted. Per wireframe 05: top banner green "✓ Lista para planificar" or yellow "⚠ Faltan datos de [nombre]".

**Independent Test**: Leave profiles incomplete → system shows what's missing. Complete all profiles → system marks as ready.

### Implementation for User Story 4

- [ ] T023 [US4] Implement ReadinessService in `src/services/ReadinessService.ts` (checkReadiness: computed on-demand, returns ReadinessResult with ready/missing per member — per contracts/readiness-service.md. Ready = name + age + sex + restrictionsReviewed for all active members)
- [ ] T024 [US4] Implement useReadinessCheck hook in `src/hooks/useReadinessCheck.ts` (reactive via WatermelonDB observables, auto-recalculates on data changes, exposes result/loading/refresh)
- [ ] T025 [US4] Implement ReadinessIndicator component in `src/components/ReadinessIndicator.tsx` (banner: "✓ Lista para planificar" green background / "⚠ Faltan datos de [nombre]" yellow background — per wireframe 05)
- [ ] T026 [US4] Integrate ReadinessIndicator into FamiliaConfiguracion screen (top position banner, uses useReadinessCheck hook)

**Checkpoint**: Readiness banner shows correct state. Completing all member data transitions banner from yellow to green.

---

## Phase 7: Meal Type Configuration

**Purpose**: User can toggle which meal types are planned for the household (per wireframe 05 chips section: "Comidas del día")

- [ ] T027 [US1] Implement MealTypeChips component in `src/components/MealTypeChips.tsx` (toggle chips: active state = green/rounded, inactive state = crema/rounded. Labels: Desayuno, Comida, Cena, Snack. At least 1 must remain active)
- [ ] T028 [US1] Wire MealTypeChips to FamilyService.updateMealTypes in FamiliaConfiguracion screen (tap chip → toggle state → persist via FamilyService → UI reflects change)

**Checkpoint**: Meal type chips visible in FamiliaConfiguracion, toggling persists to Family.activeMealTypes.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Sync, offline resilience, consolidated views, validation, and navigation integration

- [ ] T029 [P] Implement WatermelonDB sync adapter for spec 001 tables in `src/database/sync/` (pull from Supabase → local, push local changes → Supabase, last-write-wins conflict resolution)
- [ ] T030 [P] Implement offline integration tests (create member without connection, verify local persistence, verify sync on reconnect)
- [ ] T031 [P] Implement consolidated restrictions list in FamiliaConfiguracion (aggregate all restrictions from all active members, display with member name in parentheses — per wireframe 05 "Resumen de restricciones del hogar")
- [ ] T032 Run quickstart.md validation scenarios 1-6 (verify end-to-end flows per quickstart.md acceptance tests)
- [ ] T033 Tab bar navigation integration (Plan, Recetas, Compra, Familia tabs — with Familia highlighted/active in green when on FamiliaConfiguracion screen)

**Checkpoint**: Full feature complete. Offline works. Sync works. All wireframe 05 elements present. Validation scenarios pass.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — skip if already done in spec 005
- **Phase 2 (Foundational)**: Depends on Phase 1 — BLOCKS all user stories
- **Phase 3 (US1)**: Depends on Phase 2 — Foundation must be complete
- **Phase 4 (US2)**: Depends on Phase 2 + T007 (FamilyMember model from US1)
- **Phase 5 (US3)**: Depends on Phase 2 + T007 (FamilyMember model from US1)
- **Phase 6 (US4)**: Depends on Phase 3 (US1) + Phase 4 (US2) — needs members + restrictions to validate readiness
- **Phase 7 (Meal Types)**: Depends on T006 (Family model) + T008 (FamilyService) + T010 (FamiliaConfiguracion screen)
- **Phase 8 (Polish)**: Depends on all previous phases being substantially complete

### Parallel Opportunities

```text
Phase 2: T003 ║ T004 ║ T005 (all parallel — different systems)
Phase 3: T006 ║ T007 (models parallel — different files)
Phase 4: T013 ║ T014 (models parallel — different files)
Phase 4 & 5: Can start in parallel after US1 models exist
Phase 8: T029 ║ T030 ║ T031 (all parallel — different concerns)
```

### Within Each User Story

- Models before services
- Services before screens
- Screens before polish/integration
- Components can parallelize with screens if interface is defined

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1 (or verify from spec 005)
2. Complete Phase 2: Foundational
3. Complete Phase 3: US1 — family + members CRUD + main screen
4. **STOP and VALIDATE**: FamiliaConfiguracion renders per wireframe 05
5. Demo-ready with family management

### Full P1 Delivery

1. Setup + Foundational
2. US1 → US2 → US3 (all P1 stories)
3. Phase 7 (Meal Types — completes wireframe 05)
4. **VALIDATE**: All P1 stories work independently

### Complete Feature

1. All P1 stories + Meal Types
2. US4 (P2 — Readiness)
3. Phase 8 (Polish — sync, offline, consolidated view, navigation)
4. Run quickstart.md validation
5. Feature complete ✓

---

## Notes

- [P] tasks = different files, no dependencies between them
- Spec 005 (Catálogo) is implemented first — shared infrastructure should already exist
- Wireframe 05 is the primary visual reference for FamiliaConfiguracion screen
- `restrictionsReviewed` field on FamilyMember tracks whether the user has visited the restrictions screen (even if 0 restrictions added)
- Severity is always auto-inferred from category — never user-input
- Coherence warnings are non-blocking — they inform but don't prevent saving
- All CRUD operations must work offline (SQLite local first, sync later)
- Commit after each task or logical group
