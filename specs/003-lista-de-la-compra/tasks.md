# Tasks: Lista de la compra automática desde el menú semanal

**Feature**: 003-lista-de-la-compra
**Branch**: `003-lista-de-la-compra`
**Date**: 2026-08-10
**Implementation order**: 4th (after 005 → 001 → 002)
**Dependencies**: spec 002 (menú aprobado — ApprovalService), spec 005 (MasterIngredient catalog)
**Wireframe reference**: [04-lista-compra.md](../../wireframes/04-lista-compra.md)

---

## Phase 1: Setup

> Skip if project scaffolding already done (Expo, WatermelonDB, Supabase client, i18n, test infra).

---

## Phase 2: Foundational

- [ ] T001: WatermelonDB schema for ShoppingList + ShoppingItem tables in `src/database/schema.ts`
  - Add `shopping_lists` table: id, family_id, week_id, menu_id, status (generated|adjusted|in_use|completed), unmapped_recipes (JSON string), generated_at, updated_at
  - Add `shopping_items` table: id, list_id, ingredient_id, ingredient_name, approximate_quantity (nullable), unit (nullable), category (fruits_vegetables|meats|dairy|cereals|other), status (pending|bought|available_at_home), last_modified_by (nullable), last_modified_at
  - Add compound index: shopping_lists (family_id + week_id) UNIQUE
  - Add compound indexes: shopping_items (list_id + category), shopping_items (list_id + status)
  - Ref: data-model.md Indexes section

- [ ] T002: [P] Migration + Supabase tables + RLS + Realtime subscriptions on shopping_items
  - WatermelonDB migration file in `src/database/migrations/`
  - Supabase SQL: CREATE TABLE shopping_lists, shopping_items with same schema
  - RLS policies: family members can read/write their own family's lists
  - Enable Supabase Realtime on `shopping_items` table (granularity: per-item)
  - Sync strategy: last-write-wins per item based on last_modified_at

- [ ] T003: [P] i18n namespace `003-shopping` with category labels, status labels, actions
  - File: `src/i18n/namespaces/shopping-list.json`
  - Category labels: FRUTAS Y VERDURAS, CARNES Y PESCADOS, LÁCTEOS, CEREALES Y LEGUMBRES, OTROS
  - Status labels: Pendiente, Comprado, Ya lo tengo
  - Actions: Generar lista, Regenerar lista, Marcar comprado, Ya lo tengo, Desmarcar
  - Progress: "{{bought}}/{{total}}" format
  - Warnings: unmapped recipes message template
  - Sections: "Cubierto" section header

---

## Phase 3: US1 — Generar lista desde menú aprobado (P1)

> **User Story 1**: Como responsable de la compra familiar, quiero que la aplicación convierta el menú semanal aprobado en una lista de la compra, para ahorrar tiempo y evitar olvidos.

- [ ] T004: [P] [US1] Create ShoppingList model in `src/models/ShoppingList.ts`
  - Extend WatermelonDB Model class
  - Fields: familyId, weekId, menuId, status, unmappedRecipes (JSON), generatedAt, updatedAt
  - Associations: hasMany ShoppingItem
  - Validation: status must be one of ShoppingListStatus enum values
  - Lifecycle transitions per data-model.md: generated → adjusted → in_use → completed

- [ ] T005: [P] [US1] Create ShoppingItem model in `src/models/ShoppingItem.ts`
  - Extend WatermelonDB Model class
  - Fields: listId, ingredientId, ingredientName, approximateQuantity, unit, category, status, lastModifiedBy, lastModifiedAt
  - Associations: belongsTo ShoppingList
  - Validation: category must be one of ShoppingCategory, status must be one of ShoppingItemStatus
  - ingredientName denormalized from MasterIngredient for offline display

- [ ] T006: [US1] Implement ConsolidationService in `src/services/ConsolidationService.ts`
  - Traverse PlannedMeal → RecipeIngredient → MasterIngredient
  - Aggregate by MasterIngredient.id (same ingredientId = same line)
  - Sum quantities when units match
  - When units differ → keep both entries or convert if trivial (g/kg, ml/l)
  - Build IngredientConsolidation[] (transient model, not persisted)
  - Inherit category from MasterIngredient.category
  - Recipes without mapped ingredients → return in unmappedRecipes array, do NOT block generation
  - Stateless service — pure function of menu data + catalog data
  - Must work offline (reads from WatermelonDB local data)

- [ ] T007: [US1] Implement ListGeneratorService in `src/services/ListGeneratorService.ts`
  - `generateList(familyId, weekId)`: per contract — verify approved menu (spec 002 ApprovalService), verify no existing list (unique constraint), call ConsolidationService, create ShoppingList + ShoppingItems, return list
  - `regenerateList(listId)`: per contract — re-read approved menu, regenerate consolidation, preserve bought/available items, remove obsolete pending items, add new pending items, update quantities if changed
  - `getList(listId)`: eager load with items
  - `getListForWeek(familyId, weekId)`: query compound index, return null if not found
  - Error handling: MenuNotApprovedError, ListAlreadyExistsError, ListNotFoundError
  - All operations work offline (WatermelonDB)
  - Performance: <5s online, <3s offline

- [ ] T008: [US1] Wire generation to UI: "Generar lista" button after menu approval triggers ListGeneratorService.generateList
  - Button placement: after menu approval confirmation (spec 002 flow)
  - Loading state during generation (<5s budget)
  - On success: navigate to ShoppingListView
  - On error (MenuNotApprovedError): show inline message "La lista solo se genera desde un menú aprobado"
  - On error (ListAlreadyExistsError): navigate to existing list

---

## Phase 4: US2 — Consolidar ingredientes (P1)

> **User Story 2**: Como persona que hace la compra, quiero que los ingredientes repetidos aparezcan consolidados, para no llevar una lista duplicada y confusa.

- [ ] T009: [US2] Unit tests for ConsolidationService
  - File: `tests/unit/services/ConsolidationService.test.ts`
  - Test: same ingredient across multiple recipes → single line with summed quantity
  - Test: different units for same ingredient → show both entries or convert (g↔kg, ml↔l)
  - Test: missing/unmapped ingredients → omit from list, return recipe name in unmappedRecipes
  - Test: empty menu (no meals) → empty list, no crash
  - Test: ingredient appearing in same recipe twice → sum within recipe too
  - Test: normalization via MasterIngredient.id (not name matching) — "tomate" and "tomate maduro" same if same ingredientId
  - TDD: write tests FIRST, then ensure T006 passes them

---

## Phase 5: US3 — Categorías de compra (P1)

> **User Story 3**: Como persona encargada de comprar, quiero que la lista esté ordenada por categorías útiles, para hacer la compra de forma más rápida y con menos fricción.
> **Wireframe ref**: 04-lista-compra.md — uppercase muted headers, no background, text-only separators.

- [ ] T010: [US3] Implement CategorySection component in `src/components/CategorySection.tsx`
  - Collapsible section per category
  - Categories in order: FRUTAS Y VERDURAS → CARNES Y PESCADOS → LÁCTEOS → CEREALES Y LEGUMBRES → OTROS
  - Header: uppercase text, muted color, no background (per wireframe 04: "Sin fondo — solo texto para separar visualmente")
  - Renders children (ShoppingItemRow list)
  - Collapsed state persists per session (not across restarts)
  - i18n: category labels from `003-shopping` namespace

- [ ] T011: [US3] Implement ShoppingListView screen in `src/screens/ShoppingListView/`
  - Per wireframe 04 layout:
    - Title: "Lista de la compra" (h1)
    - Week reference: "Semana del X al Y mes" (subtitle)
    - Progress counter: "{{bought}}/{{total}}" in green, top-right
    - Category sections with CategorySection component
    - Item rows with ShoppingItemRow component
  - Tab bar with 🛒 "Compra" active (green)
  - Data: fetch via ListGeneratorService.getListForWeek or useShoppingList hook
  - Empty state: if no list generated, show "Generar lista" CTA
  - UnmappedWarning banner if list.unmappedRecipes.length > 0

---

## Phase 6: US4 — Marcar "ya lo tengo" (P1)

> **User Story 4**: Como responsable del hogar, quiero poder indicar ingredientes que ya tengo, para que la lista final refleje solo lo que realmente necesito comprar.
> **Spec behavior**: swipe-left = "ya lo tengo" (available_at_home), distinct from tap = "comprado" (bought).

- [ ] T012: [US4] Implement ChecklistService in `src/services/ChecklistService.ts`
  - `markAsBought(itemId)`: status → bought, update lastModifiedBy/At, list status → in_use if first bought
  - `markAsAvailableAtHome(itemId)`: status → available_at_home, update lastModifiedBy/At, list status → adjusted if was generated
  - `unmarkItem(itemId)`: status → pending, update lastModifiedBy/At
  - `getPendingItems(listId)`: filter pending, order by category (fruits_vegetables → meats → dairy → cereals → other)
  - `getBoughtItems(listId)`: filter bought
  - `getAvailableItems(listId)`: filter available_at_home
  - `getProgress(listId)`: return {total, pending, bought, available}
  - Error handling: ItemNotFoundError, ItemAlreadyInStatusError
  - All operations offline-capable (WatermelonDB)
  - Collaborative: changes propagate via Supabase Realtime

- [ ] T013: [US4] Implement swipe-left gesture on ShoppingItemRow for "ya lo tengo" (available_at_home)
  - Swipe-left on pending item → call ChecklistService.markAsAvailableAtHome
  - Visual feedback: item slides out of pending section, appears in "Cubierto" section
  - Distinct from tap (tap = bought per US5)
  - Per spec: "desliza un ingrediente a la izquierda (swipe)" → marca disponible en casa
  - Touch target: 52px height (per wireframe 04)

- [ ] T014: [US4] Implement "Cubierto" section at bottom of list
  - Section at bottom of ShoppingListView below all category sections
  - Shows items with status `available_at_home`
  - Different styling from pending/bought (visually distinct)
  - Items can be unmarked (tap or swipe-right → revert to pending via ChecklistService.unmarkItem)
  - Section hidden when empty (0 available items)
  - Header: "Cubierto" (i18n key from 003-shopping namespace)

---

## Phase 7: US5 — Checklist interactivo (P1) — wireframe 04 CORE

> **User Story 5**: Como persona que está en el supermercado, quiero ir tachando productos de la lista en mi móvil a medida que los meto en el carro, para no perderme nada.
> **Wireframe 04 is THE reference** for all visual decisions in this phase.

- [ ] T015: [US5] Implement ShoppingItemRow component in `src/components/ShoppingItemRow.tsx`
  - Per wireframe 04 design:
    - Row height: 52px (touch target — "Zonas de tap de 52px")
    - Pending state: white background, circular checkbox (grey border) left, ingredient name 15px center, quantity right in muted text
    - Bought state: crema/surface-warm background, green checkbox with white ✓, text strikethrough in muted color
    - Font: 15px ingredient name ("Tipografía grande (15px) — legible a distancia de brazo")
  - Tap anywhere on row = mark bought (ChecklistService.markAsBought)
  - Accessibility: role=checkbox, aria-checked state, label includes ingredient name + quantity

- [ ] T016: [US5] Implement state persistence (tap → status changes in WatermelonDB → persists across app restarts)
  - On tap: update ShoppingItem.status in WatermelonDB immediately
  - On app cold start: read all items from WatermelonDB → render with persisted status
  - Verify: close app → reopen → bought items remain bought (HU5 ac2)
  - No network required for persistence (offline-first)

- [ ] T017: [US5] Implement ProgressBar component in `src/components/ProgressBar.tsx`
  - Counter format: "{{bought}}/{{total}}" (per wireframe 04: "un contador de progreso ("3/14") en verde")
  - Color: green
  - Position: top-right of ShoppingListView header area
  - Updates in real-time as items are marked bought
  - Uses ChecklistService.getProgress for data
  - Does NOT count available_at_home in bought (separate semantics)

- [ ] T018: [US5] Implement unmark gesture (tap on bought item → revert to pending)
  - Tap on bought item (crema background + strikethrough) → call ChecklistService.unmarkItem
  - Visual: item reverts to white background, empty checkbox, normal text
  - Per wireframe 04: "Desmarcar un ingrediente si se tachó por error"
  - Progress counter decrements accordingly

---

## Phase 8: US6 — Colaboración en tiempo real (P1)

> **User Story 6**: Como miembro del hogar, quiero que la lista sea compartida y se actualice en tiempo real, para repartirnos la compra sin duplicar esfuerzos.

- [ ] T019: [US6] Implement CollaborativeListService in `src/services/CollaborativeListService.ts`
  - Supabase Realtime subscription on `shopping_items` table, filtered by listId
  - On INSERT/UPDATE from remote: update local WatermelonDB record
  - Conflict resolution: last-write-wins by lastModifiedAt timestamp
  - Subscribe on list open, unsubscribe on list close/navigation away
  - Handle reconnection: re-subscribe, pull missed changes
  - Propagate local changes: after WatermelonDB write → push to Supabase

- [ ] T020: [US6] Wire realtime sync: when member A marks item, member B sees change <500ms
  - Integration: ShoppingListView subscribes via CollaborativeListService on mount
  - Visual: remote changes animate in (item transitions to bought state)
  - Progress counter updates for all connected members
  - Performance budget: <500ms from tap to visible on other device (with connection)
  - Edge case: same item marked by both → LWW, final state converges

---

## Phase 9: Menu change & Edge cases

- [ ] T021: Implement regenerateList flow (when approved menu replaced via spec 002)
  - Trigger: spec 002 ApprovalService.replaceApproved event
  - Call ListGeneratorService.regenerateList(existingListId)
  - Preserve bought/available items (already purchased/at home)
  - Recalculate pending items from new menu
  - Remove obsolete pending items (no longer in new menu)
  - Add new pending items from new menu
  - Update quantities if same ingredient has different total
  - Show diff to user: "Se añadieron X, se eliminaron Y items"
  - Update ShoppingList.menuId to new menu ID

- [ ] T022: Implement unmappedRecipes warning (recipes without mapped ingredients → banner with names)
  - Component: `src/components/UnmappedWarning.tsx`
  - Display when ShoppingList.unmappedRecipes.length > 0
  - Banner at top of ShoppingListView (below header, above categories)
  - Message: "{{count}} plato(s) no pudieron incluirse: {{names}}" (i18n)
  - Dismissible but re-shows if list is regenerated with same issue
  - Non-blocking: list is fully usable, warning is informational

- [ ] T023: [P] Implement offline tests (generate list offline, mark items offline, sync on reconnect)
  - Test: generate list with no network → uses local WatermelonDB data (approved menu cached)
  - Test: mark items as bought offline → persists locally
  - Test: mark items as available_at_home offline → persists locally
  - Test: reconnect → local changes push to Supabase, remote changes pull
  - Test: conflicting offline edits → LWW by timestamp resolves
  - File: `tests/integration/offline-sync.test.ts`

---

## Phase 10: Polish

- [ ] T024: [P] WatermelonDB sync adapter for spec 003 tables
  - Configure sync adapter for shopping_lists and shopping_items tables
  - Push local changes to Supabase on connectivity
  - Pull remote changes on reconnect
  - Handle deleted records (soft delete or hard delete per project convention)
  - Integrate with existing sync infrastructure from specs 001/002/005

- [ ] T025: [P] Tab bar: 🛒 Compra active when on ShoppingListView
  - Per wireframe 04: "Navegación fija con 🛒 'Compra' activa en verde"
  - Tab bar item: icon 🛒, label "Compra"
  - Active state: green highlight (matches progress counter color)
  - Navigation: tapping tab when already on list → scroll to top

- [ ] T026: Run quickstart.md scenarios 1-8
  - Scenario 1: Generate list from approved menu (HU1 + FR-001, FR-002, FR-010)
  - Scenario 2: Consolidation of repeated ingredients (HU2 + FR-003, FR-005, FR-011)
  - Scenario 3: Category grouping (HU3 + FR-006)
  - Scenario 4: Mark "ya lo tengo" (HU4 + FR-007, FR-008)
  - Scenario 5: Checklist mode in supermarket (HU5 + FR-009)
  - Scenario 6: Collaborative simultaneous use (HU5 ac3 + HU6 + FR-013, FR-014)
  - Scenario 7: Menu change with existing list (HU1 ac3 + FR-004)
  - Scenario 8: Recipe without mapped ingredients (HU1 ac4 + FR-012)
  - All scenarios must pass before feature is considered complete
  - Ref: [quickstart.md](./quickstart.md)

- [ ] T027: [P] ShoppingList status lifecycle (generated → adjusted → in_use → completed)
  - Automatic transitions:
    - generated → adjusted: when first markAsAvailableAtHome is called
    - generated/adjusted → in_use: when first markAsBought is called
    - in_use → completed: when all items are bought OR available_at_home (none pending)
  - Revert rules: unmarkItem does NOT revert list status (per ChecklistService contract)
  - Regeneration: any state → generated (preserving item states)
  - Expose lifecycle via ShoppingList model computed properties (isInUse, isCompleted, etc.)
  - UI: optionally show list status badge in ShoppingListView header
