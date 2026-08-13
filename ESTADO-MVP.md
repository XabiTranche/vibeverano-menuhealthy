# Estado del MVP — MenuFamiliaresHealthy

**Fecha**: 2026-08-13
**Versión**: MVP 0.1.0

---

## Resumen

El MVP funcional está completado. El flujo completo "configurar familia → generar menú → aprobar → lista de compra → ir al súper" funciona de punta a punta con datos reales en Supabase y autenticación por usuario.

---

## Tasks completadas (MVP)

### Spec 005 — Catálogo de recetas

| Task | Descripción | Estado |
|------|-------------|--------|
| T001 | Setup proyecto (Expo + TS + Supabase + i18n) | ✅ |
| T002 | Configurar Jest + RNTL | ✅ |
| T003 | Configurar ESLint + Prettier | ✅ |
| T004 | Schema WatermelonDB / tipos TS | ✅ |
| T005 | Seed ingredientes maestros (~50) | ✅ |
| T006 | Seed recetas base (~10) | ✅ |
| T007 | Seed loading en Supabase | ✅ |
| T008 | Supabase tables + RLS + indexes | ✅ |
| T009 | i18n namespace base | ✅ |
| T010-T012 | Models (tipos TypeScript) | ✅ |
| T013 | IngredientService (búsqueda, categorías) | ✅ |
| T014 | RecipeService (CRUD + search + filters) | ✅ |
| T018-T021 | RecipeCatalog screen + búsqueda + filtros | ✅ |
| T022-T023 | Listado por tipo de comida | ✅ |
| T024 | RecipeService.copyFromBase + getBaseCatalog | ✅ |

### Spec 001 — Perfiles familiares

| Task | Descripción | Estado |
|------|-------------|--------|
| T002-T005 | Schema, migrations, Supabase, i18n | ✅ |
| T006-T008 | Family + FamilyMember models + FamilyService | ✅ |
| T010-T012 | FamiliaConfiguracion screen + MemberCard + MemberDetail | ✅ |
| T013-T016 | Restricciones (modelo + servicio + pantalla) | ✅ |
| T019-T022 | Objetivos nutricionales (modelo + servicio + pantalla) | ✅ |
| T023-T026 | ReadinessService + banner (básico) | ✅ |
| T027-T028 | MealType chips (config comidas del día) | ✅ |

### Spec 002 — Planificación semanal

| Task | Descripción | Estado |
|------|-------------|--------|
| T001-T004 | Schema, migrations, Supabase, i18n | ✅ |
| T005-T008 | Models (PlannedWeek, MenuProposal, PlannedMeal) | ✅ |
| T009 | PlanGeneratorService (con filtrado por restricciones) | ✅ |
| T014-T020 | WeekPlanner screen (core UI, wireframe 01) | ✅ |
| T015 | WeekSelector (flechas + badge estado) | ✅ |
| T016 | MealCard (sidebar color + nombre + badges + ⇄) | ✅ |
| T017 | EmptySlot ("+ Añadir...") | ✅ |
| T021-T024 | ApprovalService + botón "Aprobar semana" | ✅ |

### Spec 003 — Lista de la compra

| Task | Descripción | Estado |
|------|-------------|--------|
| T001-T003 | Schema, migrations, Supabase | ✅ |
| T004-T005 | ShoppingList + ShoppingItem models | ✅ |
| T006-T007 | ConsolidationService + ListGeneratorService | ✅ |
| T008 | Wire generación a UI | ✅ |
| T010-T011 | CategorySection + ShoppingListView screen | ✅ |
| T015-T018 | ShoppingItemRow + tap/check + progress + unmark | ✅ |

### Spec 004 — Ajustes y sustituciones

| Task | Descripción | Estado |
|------|-------------|--------|
| T006 | RestrictionValidatorService (validar contra restricciones) | ✅ |
| T007 | SubstitutionService (validar + aplicar) | ✅ |
| T008-T009 | MealSubstitution screen + SubstitutionConfirm | ✅ |
| T024 | Wire ⇄ button → pantalla sustitución | ✅ |

### Transversal — Auth

| Task | Descripción | Estado |
|------|-------------|--------|
| — | AuthContext + AuthProvider | ✅ |
| — | Login/Registro screen | ✅ |
| — | Sesión persistente (AsyncStorage) | ✅ |
| — | familyHelper (auto-crear familia por usuario) | ✅ |
| — | Root layout con redirect auth | ✅ |

---

## Tasks pendientes (fuera del MVP actual)

### Prioridad ALTA — Mejoras inmediatas

| Task | Spec | Descripción |
|------|------|-------------|
| T015-T016 | 005 | RecipeForm screen (crear/editar recetas propias) + IngredientPicker |
| T029 | 005 | RecipeDetail screen (tap en tarjeta → detalle completo) |
| T039 | 005 | RecipeCard mejorado (foto placeholder, tiempo, dot in-use) |
| T017 | 001 | Preferencias alimentarias screen (liked/disliked) |
| T009 | 001 | Onboarding (crear familia al registrarse — flow guiado) |
| T013-T014 | 003 | Swipe "ya lo tengo" + sección "Cubierto" |
| T010 | 004 | ValidationResultBanner + WarningDismissable |
| T011-T012 | 004 | Contador sustituciones + sugerencia regenerar a 5 cambios |

### Prioridad MEDIA — Funcionalidad completa

| Task | Spec | Descripción |
|------|------|-------------|
| T025-T027 | 002 | Explicación de encaje del menú (por qué se eligieron esas recetas) |
| T028-T030 | 002 | Detección incompatibilidad (aviso si perfil cambia post-aprobación) |
| T031-T032 | 002 | Variantes por miembro (adaptación por restricción individual) |
| T033 | 002 | Semana parcial (selección de rango de días) |
| T013-T015 | 004 | ListSyncService (actualizar lista de compra tras sustitución) |
| T016-T018 | 004 | Señales de aprendizaje (registrar motivo del cambio) |
| T019-T021 | 004 | Historial menú original vs ajustado |
| T019-T020 | 003 | Colaboración en tiempo real (Supabase Realtime) |
| T021-T022 | 003 | Regenerar lista tras cambio de menú + unmapped warning |
| T025-T029 | 005 | Protección recetas en uso (bloquear borrado si en plan activo) |
| T030-T034 | 005 | Tag inference + goal suggestions automáticos |
| T018 | 001 | Coherencia warnings (preferencia conflicta con restricción) |

### Prioridad BAJA — Polish y producción

| Task | Spec | Descripción |
|------|------|-------------|
| T035-T037 | 005 | Sync offline (WatermelonDB) + SQLCipher cifrado |
| T029-T030 | 001 | Sync offline + tests offline |
| T034-T035 | 002 | Sync + merge colaborativo |
| T022-T024 | 003 | Sync + offline tests + tab bar |
| T022-T023 | 004 | Sync + offline tests |
| — | — | RLS policies reales (activar para producción) |
| — | — | Ampliar seed a 500 ingredientes + 50 recetas |
| — | — | Tests de integración (quickstart.md scenarios) |
| — | — | Performance optimization (lazy loading, paginación) |
| — | — | Accessibility audit (screen readers, contraste) |
| — | — | Deploy a stores (EAS Build + Submit) |

---

## Métricas del MVP

| Métrica | Valor |
|---------|-------|
| Pantallas implementadas | 7 (login, plan, recetas, compra, familia, detalle miembro, sustitución) |
| Tablas Supabase | 14 |
| Services implementados | 5 (Recipe, Ingredient, Family, Planner, Shopping) |
| Seed data | 50 ingredientes + 10 recetas base |
| Specs completadas | 5/5 convergidas |
| Tasks completadas MVP | ~45/163 total |
| Flujo E2E funcional | ✅ Completo |

---

## Cómo continuar

1. **Siguiente iteración recomendada**: Prioridad ALTA (RecipeForm, RecipeDetail, preferencias, swipe lista)
2. **Para producción**: Activar RLS, ampliar seeds, deploy con EAS
3. **Para escalar**: Migrar a WatermelonDB para offline-first real, añadir Realtime para colaboración
