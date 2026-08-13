# Implementation Plan: Lista de la compra automática desde el menú semanal

**Branch**: `003-lista-de-la-compra` | **Date**: 2026-08-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/003-lista-de-la-compra/spec.md`

## Summary

Generación automática de la lista de la compra a partir del menú semanal aprobado. El sistema consolida ingredientes de todas las recetas del menú, los agrupa por categoría de compra (5 categorías del catálogo maestro), y ofrece una checklist colaborativa en tiempo real donde los miembros del hogar pueden marcar items como "comprado" o "ya lo tengo" (marcado binario). La lista se actualiza automáticamente cuando cambia el menú aprobado, preservando el estado de items ya marcados.

## Technical Context

**Language/Version**: TypeScript 5.x (strict: true)

**Primary Dependencies**: React Native (Expo), WatermelonDB + SQLCipher, Supabase (Realtime + RLS), react-i18next, Jest + React Native Testing Library

**Storage**: WatermelonDB (SQLite cifrado con SQLCipher) + Supabase PostgreSQL para sync y Realtime

**Testing**: Jest + React Native Testing Library (unit + integration), TDD obligatorio

**Target Platform**: Mobile (iOS + Android via React Native/Expo)

**Project Type**: mobile-app

**Performance Goals**: Generación de lista <5s, sync en tiempo real entre miembros del hogar

**Constraints**: Offline-first (generación local posible), datos cifrados (RGPD - datos de salud indirectos), colaborativo (multi-usuario simultáneo), i18n desde día 1

**Scale/Scope**: Hogares de 1-6 miembros, menú semanal completo (21 comidas × ingredientes)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Estado | Notas |
|-----------|--------|-------|
| I. Mobile-First | ✅ PASS | Checklist interactivo diseñado para uso en supermercado (móvil) |
| II. TypeScript Estricto | ✅ PASS | strict: true, sin any explícitos |
| III. TDD (NON-NEGOTIABLE) | ✅ PASS | Jest + RNTL, ciclo red-green-refactor |
| IV. Offline-First | ✅ PASS | Generación local desde WatermelonDB cuando no hay conexión |
| V. Colaborativo | ✅ PASS | Supabase Realtime, merge sin conflicto (last-write-wins per item) |
| VI. i18n-Ready | ✅ PASS | react-i18next, namespace 003-shopping-list |
| CWE Top 25 | ✅ PASS | Validación de input, ORM (sin SQL injection) |
| OWASP Mobile Top 10 | ✅ PASS | SQLCipher cifrado local, auth segura |
| ISO/IEC 5055 | ✅ PASS | Métricas de calidad via linting/análisis |
| CISQ | ✅ PASS | Low coupling, servicios independientes |
| RGPD | ✅ PASS | Datos cifrados (lista puede revelar datos de salud indirectamente) |

**Gate Result**: ✅ ALL PASS — Proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/003-lista-de-la-compra/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (internal interfaces)
│   ├── list-generator-service.md
│   └── checklist-service.md
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── models/
│   ├── ShoppingList.ts            # Lista de compra (entidad principal)
│   ├── ShoppingItem.ts            # Línea de compra individual
│   └── IngredientConsolidation.ts # Modelo transiente para consolidación
├── services/
│   ├── ListGeneratorService.ts    # Generación de lista desde menú aprobado
│   ├── ConsolidationService.ts    # Merge de duplicados via catálogo maestro
│   ├── ChecklistService.ts       # Marcado bought/available/pending
│   └── CollaborativeListService.ts # Sync tiempo real entre miembros
├── screens/
│   ├── ShoppingListView/          # Checklist mode (uso en supermercado)
│   ├── ListReview/                # Revisión pre-compra (marcar "ya lo tengo")
│   └── CategoryView/             # Vista agrupada por categoría
├── components/
│   ├── ShoppingItemRow.tsx        # Fila individual con swipe/tap
│   ├── CategorySection.tsx        # Sección colapsable por categoría
│   ├── ProgressBar.tsx            # Progreso de compra
│   └── UnmappedWarning.tsx        # Aviso de recetas no incluidas
├── database/
│   ├── schema.ts                  # Schema WatermelonDB (tablas shopping)
│   ├── migrations/                # Migraciones de esquema
│   └── repositories/
│       ├── ShoppingListRepository.ts
│       └── ShoppingItemRepository.ts
├── i18n/
│   └── namespaces/
│       └── shopping-list.json     # Traducciones específicas
└── hooks/
    ├── useShoppingList.ts         # Hook principal de lista
    ├── useChecklistProgress.ts    # Hook de progreso
    └── useCollaborativeSync.ts    # Hook de sync Realtime

tests/
├── unit/
│   ├── services/
│   │   ├── ListGeneratorService.test.ts
│   │   ├── ConsolidationService.test.ts
│   │   └── ChecklistService.test.ts
│   └── models/
├── integration/
│   ├── list-generation.test.ts
│   ├── consolidation.test.ts
│   ├── collaborative-sync.test.ts
│   └── menu-change.test.ts
└── component/
    ├── ShoppingListView.test.tsx
    └── CategoryView.test.tsx
```

**Structure Decision**: Servicios separados por responsabilidad (generación, consolidación, checklist, colaboración). El `ListGeneratorService` orquesta la generación completa. El `ConsolidationService` es stateless y reutilizable. La sincronización colaborativa se maneja como una capa independiente sobre WatermelonDB sync + Supabase Realtime.

## Dependencies

| Spec | Dependencia | Qué se necesita |
|------|-------------|-----------------|
| 002 | PlannedWeek aprobado | `ApprovalService.getApprovedWeek(familyId, weekId)` — Fuente de verdad del menú |
| 002 | ApprovalService.replaceApproved | Evento de cambio de menú que dispara regeneración |
| 005 | MasterIngredient | Catálogo de ingredientes genéricos para normalización |
| 005 | RecipeIngredient | Cantidades de ingredientes por receta |
| 005 | MasterIngredient.category | Categoría de compra (fruits_vegetables, meats, dairy, cereals, other) |

## Performance Budget

| Operación | Objetivo | Contexto |
|-----------|----------|----------|
| Generación de lista (online) | <5s | Menú completo, ≤6 miembros |
| Generación de lista (offline) | <3s | Datos locales, sin round-trip |
| Sync de item (Realtime) | <500ms | Tiempo hasta que otro miembro ve el cambio |
| Renderizado de lista | <100ms | 50-100 items, scroll fluido |
