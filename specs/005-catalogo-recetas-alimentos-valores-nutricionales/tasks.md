# Tasks: Catálogo de recetas, alimentos y valores nutricionales

**Spec**: 005-catalogo-recetas-alimentos-valores-nutricionales
**Generated**: 2026-08-10
**Implementation Order**: 1st (foundational — specs 001, 002, 003, 004 depend on this)

---

## Phase 1: Setup

- [ ] T001 Initialize React Native project with Expo + TypeScript strict + WatermelonDB + SQLCipher + Supabase + react-i18next (shared infrastructure — skip if already done)
  - Path: `package.json`, `tsconfig.json`, `app.json`, `src/database/index.ts`, `src/i18n/index.ts`
  - Acceptance: Project builds with `npx expo start`, TypeScript strict mode enabled, WatermelonDB configured with SQLCipher, Supabase client initialized, react-i18next configured with Spanish default locale
  - Refs: plan.md > Technical Context

- [ ] T002 Configure Jest + React Native Testing Library
  - Path: `jest.config.ts`, `jest.setup.ts`, `package.json` (devDependencies)
  - Acceptance: `npm test` runs successfully, RNTL renders a trivial component, mocks for WatermelonDB and react-native configured
  - Refs: plan.md > Technical Context > Testing

- [ ] T003 [P] Configure ESLint + Prettier with project rules
  - Path: `.eslintrc.js`, `.prettierrc`, `package.json` (scripts: lint, format)
  - Acceptance: `npm run lint` passes on existing code, no-any rule enforced, Prettier formats on save
  - Refs: plan.md > Constitution Check > TypeScript Estricto

---

## Phase 2: Foundational (Database + Seeds)

- [ ] T004 Create WatermelonDB schema for spec 005 tables (MasterIngredient, BaseCatalogRecipe, FamilyRecipe, RecipeIngredient, CompatibilityTag, GoalTag) in `src/database/schema.ts`
  - Path: `src/database/schema.ts`, `src/database/migrations/`
  - Acceptance: Schema defines all 6 tables with columns per data-model.md, indexes created (familyId+mealType, familyId+name, recipeId, ingredientId, canonicalName, category, restrictionType, goalType), migration v1 registered
  - Refs: data-model.md > Entities, data-model.md > Indexes

- [ ] T005 [P] Create seed data: `src/database/seeds/master-ingredients.json` (~500 ingredients with canonicalName, synonyms, category, nutritionalPer100g, allergenFlags)
  - Path: `src/database/seeds/master-ingredients.json`
  - Acceptance: JSON contains ~500 entries, each with id, canonicalName, synonyms[], category (one of fruits_vegetables|meats|dairy|cereals|other), nutritionalPer100g (kcal, carbs, fat, protein), allergenFlags[]; categories balanced; Spanish canonical names
  - Refs: data-model.md > MasterIngredient > Seed

- [ ] T006 [P] Create seed data: `src/database/seeds/base-recipes.json` (~50 recipes with all fields)
  - Path: `src/database/seeds/base-recipes.json`
  - Acceptance: JSON contains ~50 recipes, each with id, name, mealType, ingredients[] (ingredientId referencing master-ingredients, quantity, unit), servings, nutritionalTotal, compatibilityTags[], goalTags[], version; balanced across 4 mealTypes; Spanish names
  - Refs: data-model.md > BaseCatalogRecipe > Seed

- [ ] T007 Implement seed loading mechanism (first-run insert from bundled JSON to WatermelonDB)
  - Path: `src/database/seeds/seed-loader.ts`, `src/database/seeds/index.ts`
  - Acceptance: On first app launch, MasterIngredient and BaseCatalogRecipe tables populated from JSON assets; idempotent (re-running does not duplicate); batch insert for performance; flag stored in AsyncStorage to prevent re-seed
  - Refs: plan.md > Performance Considerations > Carga catálogo base

- [ ] T008 [P] Configure Supabase tables + RLS policies for spec 005 entities
  - Path: `supabase/migrations/005_catalog_tables.sql`
  - Acceptance: SQL migration creates all 6 tables with correct columns/types/FKs; RLS policies: MasterIngredient and BaseCatalogRecipe readable by all authenticated users; FamilyRecipe/RecipeIngredient/CompatibilityTag/GoalTag restricted to family members (familyId match via auth.uid → family_members join)
  - Refs: data-model.md > Sync Strategy, spec.md > NFR-003, NFR-005

- [ ] T009 [P] Setup i18n namespace `005-catalog` with es.json translations
  - Path: `src/i18n/namespaces/005-catalog/es.json`, `src/i18n/index.ts`
  - Acceptance: Namespace registered and loadable; keys for: meal types (breakfast, lunch, dinner, snack), categories (fruits_vegetables, meats, dairy, cereals, other), restriction types, goal types, form labels, error messages, search placeholders, empty states; all in Spanish
  - Refs: plan.md > Constitution Check > i18n-Ready

---

## Phase 3: US1 — Dar de alta recetas familiares (P1)

**Goal**: User can create/edit recipes with ingredients from master catalog

- [ ] T010 [P] [US1] Create MasterIngredient model in `src/models/MasterIngredient.ts`
  - Path: `src/models/MasterIngredient.ts`
  - Acceptance: WatermelonDB Model class with columns: canonicalName (string), synonyms (json), category (string), nutritionalPer100g (json), allergenFlags (json), createdAt (number), updatedAt (number); typed with TypeScript interfaces; exported
  - Refs: data-model.md > MasterIngredient

- [ ] T011 [P] [US1] Create FamilyRecipe model in `src/models/FamilyRecipe.ts`
  - Path: `src/models/FamilyRecipe.ts`
  - Acceptance: WatermelonDB Model class with columns: familyId (string), name (string), mealType (string), servings (number), nutritionalTotal (json, nullable), sourceType (string), baseRecipeId (string, nullable), imageUrl (string, nullable), prepTimeMinutes (number, nullable), createdAt (number), updatedAt (number); relations: hasMany RecipeIngredient, hasMany CompatibilityTag, hasMany GoalTag
  - Refs: data-model.md > FamilyRecipe

- [ ] T012 [P] [US1] Create RecipeIngredient model in `src/models/RecipeIngredient.ts`
  - Path: `src/models/RecipeIngredient.ts`
  - Acceptance: WatermelonDB Model class with columns: recipeId (string), ingredientId (string), quantity (number), unit (string), nutritionalForQuantity (json, nullable), createdAt (number); relations: belongsTo FamilyRecipe, belongsTo MasterIngredient
  - Refs: data-model.md > RecipeIngredient

- [ ] T013 [US1] Implement IngredientService in `src/services/IngredientService.ts` (search, getById, getByCategory, getAllCategories)
  - Path: `src/services/IngredientService.ts`, `tests/unit/services/IngredientService.test.ts`
  - Acceptance: searchIngredients searches canonicalName+synonyms with Q.like, case-insensitive, max 20 results, exact match first; getById returns single ingredient or null; getByCategory returns alphabetical list; getAllCategories returns 5 categories with localized label and count; all methods work with WatermelonDB queries; unit tests pass (TDD)
  - Refs: contracts/ingredient-service.md

- [ ] T014 [US1] Implement RecipeService.createRecipe + updateRecipe + deleteRecipe in `src/services/RecipeService.ts`
  - Path: `src/services/RecipeService.ts`, `tests/unit/services/RecipeService.test.ts`
  - Acceptance: createRecipe validates name+≥1 ingredient+servings≥1, creates FamilyRecipe+RecipeIngredient records in WatermelonDB batch, sets sourceType='own', triggers TagInferenceService; updateRecipe validates same, updates records, re-triggers tag inference if ingredients/nutritional changed; deleteRecipe calls ProtectionService first, blocks if in active plan, cascades delete (RecipeIngredient+tags) if allowed; unit tests cover happy path + validation errors + protection block
  - Refs: contracts/recipe-service.md > Behavior Rules

- [ ] T015 [US1] Implement RecipeForm screen in `src/screens/RecipeForm/` (name, mealType, servings, prepTimeMinutes, imageUrl, nutritionalTotal inputs + ingredient picker)
  - Path: `src/screens/RecipeForm/index.tsx`, `src/screens/RecipeForm/RecipeForm.test.tsx`
  - Acceptance: Form fields for name (text), mealType (selector: 4 options), servings (numeric), prepTimeMinutes (numeric, optional), imageUrl (optional), nutritionalTotal (kcal, carbs, fat, protein — all optional numeric); embedded IngredientPicker for adding ingredients; calls RecipeService.createRecipe on submit (or updateRecipe if editing); shows validation errors inline; i18n labels; component test verifies render + submit flow
  - Refs: spec.md > FR-001, FR-009, FR-019, FR-021, FR-022; wireframes/02-catalogo-recetas.md

- [ ] T016 [US1] Implement IngredientPicker component (search master catalog, select + set quantity/unit)
  - Path: `src/components/IngredientPicker.tsx`, `tests/component/components/IngredientPicker.test.tsx`
  - Acceptance: SearchBar for ingredient search (calls IngredientService.searchIngredients); displays results list with canonicalName + category; on select, shows quantity (numeric) + unit (text/picker) inputs; "Añadir" button adds to recipe ingredient list; shows selected ingredients with remove option; component test covers search → select → set quantity → add flow
  - Refs: contracts/ingredient-service.md, spec.md > FR-001

- [ ] T017 [US1] Implement validation (name required, ≥1 ingredient, servings ≥1)
  - Path: `src/utils/recipe-validation.ts`, `tests/unit/utils/recipe-validation.test.ts`
  - Acceptance: validateRecipeInput function checks: name non-empty, ingredients array length ≥1, servings ≥1; returns { valid: boolean, errors: Record<string, string> }; errors are i18n keys; unit tests cover all invalid cases + valid case
  - Refs: spec.md > FR-002, spec.md > HU1 Escenario 3

---

## Phase 4: US2 — Buscar recetas (P1)

**Goal**: Search by name, ingredient, or compatibility filter

- [ ] T018 [US2] Implement RecipeService.searchRecipes (text search Q.like + filters) in `src/services/RecipeService.ts`
  - Path: `src/services/RecipeService.ts`, `tests/unit/services/RecipeService.search.test.ts`
  - Acceptance: Accepts SearchQuery (text, ingredientId, compatibilityTag, goalTag, mealType); text searches name with Q.like case-insensitive; ingredientId joins through RecipeIngredient; compatibilityTag/goalTag joins through respective tag tables; mealType filters directly; filters combined with AND; results ordered by updatedAt desc; unit tests cover each filter individually + combined
  - Refs: contracts/recipe-service.md > searchRecipes, spec.md > FR-006, FR-007, FR-020

- [ ] T019 [US2] Implement SearchBar component in `src/components/SearchBar.tsx`
  - Path: `src/components/SearchBar.tsx`, `tests/component/components/SearchBar.test.tsx`
  - Acceptance: TextInput with search icon, placeholder (i18n), clear button; debounced onChange (300ms); onSearch callback with current text; accessible (label, role); component test verifies typing + debounce + clear
  - Refs: spec.md > FR-006

- [ ] T020 [US2] Implement filter chips UI (mealType, compatibilityTag, goalTag) in `src/components/FilterChips.tsx`
  - Path: `src/components/FilterChips.tsx`, `tests/component/components/FilterChips.test.tsx`
  - Acceptance: Renders horizontal scrollable row of chip buttons; supports multi-select within same category; visually distinguishes active/inactive chips; onFilterChange callback returns selected filters as SearchQuery partial; i18n labels for all chip values; component test verifies select/deselect + callback
  - Refs: spec.md > FR-007, FR-008, FR-020

- [ ] T021 [US2] Implement RecipeCatalog screen in `src/screens/RecipeCatalog/` (list + search + filters + contextual pre-filter from planner)
  - Path: `src/screens/RecipeCatalog/index.tsx`, `src/screens/RecipeCatalog/RecipeCatalog.test.tsx`
  - Acceptance: Integrates SearchBar + FilterChips + FlatList of RecipeCards; calls RecipeService.searchRecipes with combined query; supports route param preFilter (mealType from planner context); shows empty state when no results (i18n message); pull-to-refresh; navigation to RecipeDetail on card press; component test verifies integration + empty state
  - Refs: spec.md > HU2, HU3; wireframes/02-catalogo-recetas.md

---

## Phase 5: US3 — Listado por tipo de comida (P1)

**Goal**: Recipes grouped by breakfast/lunch/dinner/snack

- [ ] T022 [US3] Implement RecipeService.getByMealType in `src/services/RecipeService.ts`
  - Path: `src/services/RecipeService.ts`, `tests/unit/services/RecipeService.mealType.test.ts`
  - Acceptance: Queries FamilyRecipe by familyId + mealType; returns array sorted by updatedAt desc; returns empty array for types with no recipes; unit test covers each mealType + empty result
  - Refs: contracts/recipe-service.md > getByMealType

- [ ] T023 [US3] Implement MealTypeFilter component + section headers in RecipeCatalog screen
  - Path: `src/components/MealTypeFilter.tsx`, `tests/component/components/MealTypeFilter.test.tsx`
  - Acceptance: 4 tab-style buttons (Desayuno, Comida, Cena, Snack) + "Todos" option; active tab highlighted; onSelect callback; when "Todos" selected, RecipeCatalog shows SectionList grouped by mealType with section headers; i18n labels; component test verifies tab selection + callback
  - Refs: spec.md > FR-008, HU3

---

## Phase 6: US4 — Catálogo base precargado (P1)

**Goal**: ~50 base recipes available from first use, copyable to family catalog

- [ ] T024 [US4] Implement RecipeService.getBaseCatalog + getBaseCatalogByMealType + copyFromBase in `src/services/RecipeService.ts`
  - Path: `src/services/RecipeService.ts`, `tests/unit/services/RecipeService.baseCatalog.test.ts`
  - Acceptance: getBaseCatalog queries BaseCatalogRecipe table, returns all; getBaseCatalogByMealType filters by mealType; copyFromBase creates new FamilyRecipe with sourceType='copied_from_base', baseRecipeId set, copies all ingredients as RecipeIngredient records, copies compatibilityTags and goalTags; the copy is independent (editable); unit tests cover list + filter + copy + independence verification
  - Refs: contracts/recipe-service.md > copyFromBase, spec.md > FR-016, FR-017

- [ ] T025 [US4] Implement BaseCatalog section in RecipeCatalog screen (visual distinction base vs own, "Copiar" button)
  - Path: `src/screens/RecipeCatalog/BaseCatalogSection.tsx`, `tests/component/screens/BaseCatalogSection.test.tsx`
  - Acceptance: Section/tab in RecipeCatalog showing base recipes with distinct visual style (badge "Base", different card background); "Copiar a mi catálogo" button on each card; on copy, calls RecipeService.copyFromBase; success toast (i18n); base recipes are read-only (no edit/delete buttons); component test verifies render + copy action
  - Refs: spec.md > HU4, FR-016, FR-017

---

## Phase 7: US5 — Proteger recetas en uso (P1)

**Goal**: Cannot delete recipe if used in active meal plan

- [ ] T026 [US5] Implement ProtectionService in `src/services/ProtectionService.ts` (query PlannedMeal for recipeId, return block/allow)
  - Path: `src/services/ProtectionService.ts`, `tests/unit/services/ProtectionService.test.ts`
  - Acceptance: isRecipeInActivePlan(recipeId) queries PlannedMeal table (spec 002) for matching recipeId in plans with status='active'; returns { inUse: boolean, affectedPlans: string[] }; handles case where PlannedMeal table doesn't exist yet (graceful fallback: inUse=false); unit tests with mocked DB
  - Refs: contracts/recipe-service.md > deleteRecipe behavior, spec.md > FR-004

- [ ] T027 [US5] Integrate protection check in RecipeService.deleteRecipe (block + return affected plans)
  - Path: `src/services/RecipeService.ts`, `tests/unit/services/RecipeService.protection.test.ts`
  - Acceptance: deleteRecipe calls ProtectionService.isRecipeInActivePlan before deleting; if inUse=true → returns { success: false, blocked: true, reason, affectedPlans }; if inUse=false → cascades delete (RecipeIngredient, CompatibilityTag, GoalTag, FamilyRecipe); unit tests verify both paths
  - Refs: contracts/recipe-service.md > DeleteResult, spec.md > FR-004, HU5

- [ ] T028 [US5] Implement edit-in-use notification flow (notify user, offer apply/keep-previous)
  - Path: `src/screens/RecipeForm/EditInUseDialog.tsx`, `tests/component/screens/EditInUseDialog.test.tsx`
  - Acceptance: When editing a recipe that is in an active plan, show dialog/bottom-sheet with message (i18n): "Esta receta está en una planificación activa"; two options: "Aplicar cambios" (proceeds with update) and "Mantener versión anterior" (cancels edit); dialog triggered by RecipeService.updateRecipe returning warning; component test verifies dialog render + both actions
  - Refs: spec.md > FR-005, HU5 Escenario 3

- [ ] T029 [US5] Implement RecipeDetail screen in `src/screens/RecipeDetail/` (full detail view per wireframe 03: image, badges, nutrition, ingredients, compatibility check, "Añadir al plan", Edit, Delete buttons with protection logic)
  - Path: `src/screens/RecipeDetail/index.tsx`, `src/screens/RecipeDetail/RecipeDetail.test.tsx`
  - Acceptance: Shows recipe image (or color placeholder), name, mealType badge, prepTime, servings; NutritionalSummary component (kcal, carbs, fat, protein); ingredient list with quantities; CompatibilityTag badges + GoalTag badges; "Añadir al plan" button (navigates to planner — spec 002 integration point); Edit button → navigates to RecipeForm; Delete button → calls deleteRecipe, handles blocked response with alert showing affected plans; "En uso" indicator if inActivePlan; component test covers render + delete blocked + delete allowed flows
  - Refs: spec.md > HU5, FR-004, FR-005; wireframes (wireframe 03 referenced in plan)

---

## Phase 8: US6 — Etiquetas de objetivo (P2)

**Goal**: System suggests goal tags based on nutritional values

- [ ] T030 [US6] Create tag rules in `src/utils/tag-rules.ts` (inference logic for compatibility + goal thresholds)
  - Path: `src/utils/tag-rules.ts`, `tests/unit/utils/tag-rules.test.ts`
  - Acceptance: Pure functions: inferCompatibility(allergenFlags[]) → InferredTag[]; shouldSuggestGoal(nutritionalPerServing, goalType) → boolean; COMPATIBILITY_RULES constant mapping allergenFlag → restrictionType incompatibility; GOAL_THRESHOLDS constant: { alta_en_proteina: { field: 'protein', operator: '>', value: 30 }, baja_en_calorias: { field: 'kcal', operator: '<', value: 300 }, baja_en_grasas: { field: 'fat', operator: '<', value: 10 } }; deterministic (same input → same output); unit tests cover all rules + edge cases (empty flags, null nutritional, boundary values)
  - Refs: contracts/tag-service.md > inferCompatibilityTags, suggestGoalTags; spec.md > HU6

- [ ] T031 [US6] Implement TagInferenceService in `src/services/TagInferenceService.ts` (inferCompatibilityTags from ingredient allergenFlags)
  - Path: `src/services/TagInferenceService.ts`, `tests/unit/services/TagInferenceService.test.ts`
  - Acceptance: inferCompatibilityTags(recipeId) loads recipe's ingredients → MasterIngredient.allergenFlags → applies tag-rules; persists inferred CompatibilityTag records (origin='inferred'); replaces previous inferred tags (does not touch manual); returns InferredTag[] with compatible boolean + reason + triggerIngredients; unit tests with mocked ingredients
  - Refs: contracts/tag-service.md > inferCompatibilityTags behavior

- [ ] T032 [US6] Implement GoalTagService (suggestGoalTags based on nutritionalTotal/servings thresholds: >30g protein, <300 kcal, <10g fat)
  - Path: `src/services/GoalTagService.ts`, `tests/unit/services/GoalTagService.test.ts`
  - Acceptance: suggestGoalTags(recipeId) loads recipe nutritionalTotal, divides by servings for per-serving values; evaluates against GOAL_THRESHOLDS; returns SuggestedTag[] (does NOT auto-persist — user must accept); returns empty array if nutritionalTotal is null; updateGoalTags persists accepted tags with origin='manual' or 'suggested'; unit tests cover suggestion logic + null nutritional + boundary values
  - Refs: contracts/tag-service.md > suggestGoalTags behavior

- [ ] T033 [US6] Implement tag suggestion UI in RecipeForm (show suggested tags, accept/reject/manual add)
  - Path: `src/screens/RecipeForm/TagSuggestions.tsx`, `tests/component/screens/TagSuggestions.test.tsx`
  - Acceptance: After saving recipe or changing nutritional values, shows suggestion chips for goal tags and inferred compatibility tags; each chip has accept (✓) / reject (✗) actions; manual "Añadir etiqueta" button opens picker from predefined list; accepted tags displayed as confirmed badges; component test verifies suggestion display + accept + reject + manual add
  - Refs: spec.md > FR-012, FR-013, FR-014, HU6

- [ ] T034 [US6] Implement detectInconsistencies (manual tag contradicts inference → warning)
  - Path: `src/services/TagInferenceService.ts` (extend), `tests/unit/services/TagInferenceService.inconsistency.test.ts`
  - Acceptance: detectInconsistencies(recipeId) compares manual CompatibilityTags (origin='manual') against inferred results; if manual tag says "sin_gluten" but ingredients contain gluten → returns Inconsistency with message + conflictingIngredients; shown as warning in RecipeForm (non-blocking); unit tests cover: no inconsistency, single inconsistency, multiple inconsistencies
  - Refs: contracts/tag-service.md > detectInconsistencies, spec.md > Casos límite

---

## Phase 9: Polish & Cross-Cutting

- [ ] T035 [P] Implement WatermelonDB sync adapter for spec 005 tables (push/pull with Supabase)
  - Path: `src/database/sync/sync-adapter-005.ts`, `tests/integration/sync/sync-005.test.ts`
  - Acceptance: Implements @nozbe/watermelondb/sync protocol for 6 tables; pull: fetches changes from Supabase since lastPulledAt; push: sends local created/updated/deleted records to Supabase; handles MasterIngredient + BaseCatalogRecipe as pull-only (server → device); FamilyRecipe + RecipeIngredient + CompatibilityTag + GoalTag bidirectional; conflict resolution: last-write-wins by updatedAt; integration test with mocked Supabase responses
  - Refs: data-model.md > Sync Strategy, plan.md > Technical Context

- [ ] T036 [P] Implement SQLCipher encryption for local database
  - Path: `src/database/encryption.ts`, `src/database/index.ts`
  - Acceptance: WatermelonDB initialized with SQLCipher adapter; encryption key derived from device keychain/secure storage; database file encrypted at rest; tests verify DB is not readable without key
  - Refs: spec.md > NFR-005, plan.md > Constitution Check > OWASP

- [ ] T037 [P] Add offline tests (create recipe without connection, verify local persistence + sync on reconnect)
  - Path: `tests/integration/offline-catalog.test.ts`
  - Acceptance: Test creates recipe with network mocked as offline; verifies recipe persists in local WatermelonDB; simulates reconnect; verifies sync push is triggered; verifies recipe appears on "server" (mocked Supabase); covers: create, edit, delete offline → sync on reconnect
  - Refs: quickstart.md > Escenario 8, spec.md > NFR-001, NFR-002

- [ ] T038 Run quickstart.md validation scenarios 1-8
  - Path: `tests/integration/validation-scenarios.test.ts`
  - Acceptance: Integration test suite covering all 8 quickstart.md scenarios end-to-end: (1) create recipe with ingredients, (2) search by name+ingredient, (3) filter by compatibility, (4) copy from base catalog, (5) delete protection, (6) tag inference, (7) goal tag suggestion, (8) offline operation; all pass green
  - Refs: quickstart.md > Validation Scenarios 1-8

- [ ] T039 [P] RecipeCard component (thumbnail, name, badges, nutrition, time, dot-in-use indicator — per wireframe 02)
  - Path: `src/components/RecipeCard.tsx`, `tests/component/components/RecipeCard.test.tsx`
  - Acceptance: Displays: image thumbnail (or color placeholder if null), recipe name, mealType badge, prepTimeMinutes (with icon), servings, nutritional summary (kcal), compatibility badges (max 3 + "+N"), goalTag badges, "en uso" dot indicator if inActivePlan; pressable (onPress callback); accessible (labels); component test verifies all visual elements + onPress + placeholder fallback
  - Refs: wireframes/02-catalogo-recetas.md, plan.md > Project Structure > components

---

## Dependencies

```
Phase 1 (Setup)          → No external dependencies
Phase 2 (Database+Seeds) → Depends on Phase 1
Phase 3 (US1)            → Depends on Phase 2 (schema + seeds + models)
Phase 4 (US2)            → Depends on Phase 3 (RecipeService + models)
Phase 5 (US3)            → Depends on Phase 2 (can run parallel to Phase 3)
Phase 6 (US4)            → Depends on Phase 2 (can run parallel to Phase 3)
Phase 7 (US5)            → Depends on Phase 3 (needs RecipeService CRUD)
Phase 8 (US6 — P2)       → Depends on Phase 3 (needs RecipeService + models)
Phase 9 (Polish)         → Depends on all previous phases
```

### Cross-spec dependencies

| This task | Depends on (external) |
|-----------|----------------------|
| T001 | — (foundational) |
| T008 | Supabase project initialized (shared infra) |
| T026 | spec 002: PlannedMeal entity (graceful fallback if not yet implemented) |
| T029 | spec 002: navigation to planner (stub if not yet available) |

---

## Legend

- `[P]` = Parallelizable — can be worked on independently / in parallel with other [P] tasks in the same phase
- `[US1]`…`[US6]` = Maps to User Story 1–6 from spec.md
- `Path:` = Primary file(s) created or modified
- `Acceptance:` = Definition of Done for the task
- `Refs:` = Source documents that inform implementation
