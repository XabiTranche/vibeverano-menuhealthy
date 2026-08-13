# Implementation Plan: Catálogo de recetas, alimentos y valores nutricionales

**Branch**: `005-catalogo-recetas-alimentos-valores-nutricionales` | **Date**: 2026-08-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/005-catalogo-recetas-alimentos-valores-nutricionales/spec.md`

## Summary

Implementar el módulo de catálogo de recetas familiares, catálogo maestro de ingredientes y valores nutricionales. Incluye: alta/edición/eliminación de recetas, búsqueda y filtrado (por nombre, ingrediente, compatibilidad, objetivo), catálogo base precargado (~50 recetas), inferencia automática de etiquetas de compatibilidad, sugerencia de etiquetas de objetivo nutricional, y protección contra eliminación de recetas en uso en planificaciones activas. Este módulo es la capa de datos fundacional sobre la que se construyen la planificación semanal (spec 002), la lista de la compra (spec 003) y los ajustes/sustituciones (spec 004).

## Technical Context

**Language/Version**: TypeScript 5.x (strict: true)

**Primary Dependencies**: React Native (Expo), react-i18next, Jest + React Native Testing Library

**Storage**: WatermelonDB + SQLCipher (cifrado en reposo) + Supabase (sync + RLS)

**Testing**: Jest + React Native Testing Library (unit + integration), TDD obligatorio

**Target Platform**: Mobile (iOS + Android via React Native/Expo)

**Project Type**: mobile-app

**Performance Goals**: Búsqueda en catálogo <3s, soporte hasta 500 recetas por hogar sin degradación

**Constraints**: Offline-first, datos cifrados en reposo y tránsito, i18n desde día 1, colaborativo (multi-usuario), catálogo maestro disponible offline

**Scale/Scope**: ~500 ingredientes maestros, ~50 recetas base, hasta 500 recetas por hogar, 4 tipos de comida

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Estado | Notas |
|-----------|--------|-------|
| I. Mobile-First | ✅ PASS | React Native, diseño exclusivamente móvil |
| II. TypeScript Estricto | ✅ PASS | strict: true, sin any explícitos |
| III. TDD (NON-NEGOTIABLE) | ✅ PASS | Jest + RNTL, ciclo red-green-refactor |
| IV. Offline-First | ✅ PASS | WatermelonDB local + sync con Supabase |
| V. Colaborativo | ✅ PASS | Sync multi-usuario via Supabase RLS |
| VI. i18n-Ready | ✅ PASS | react-i18next, namespace 005-catalog |
| CWE Top 25 | ✅ PASS | Validación de input, ORM previene SQL injection |
| OWASP Mobile Top 10 | ✅ PASS | SQLCipher cifrado local, auth segura |
| ISO/IEC 5055 | ✅ PASS | Métricas de calidad via linting/análisis |
| CISQ | ✅ PASS | Low coupling, separación models/services/screens |
| RGPD | ✅ PASS | Restricciones = datos de salud → cifrados, minimización |

**Gate Result**: ✅ ALL PASS — Proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/005-catalogo-recetas-alimentos-valores-nutricionales/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (internal interfaces)
│   ├── recipe-service.md
│   ├── ingredient-service.md
│   └── tag-service.md
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── models/
│   ├── Recipe.ts                 # Receta familiar (FamilyRecipe)
│   ├── MasterIngredient.ts       # Ingrediente maestro (catálogo normalizado)
│   ├── RecipeIngredient.ts       # Ingrediente en receta (join con cantidades)
│   ├── NutritionalInfo.ts        # Valor nutricional (type/interface)
│   ├── CompatibilityTag.ts       # Etiqueta de compatibilidad
│   ├── GoalTag.ts                # Etiqueta de objetivo nutricional
│   └── BaseCatalogRecipe.ts      # Receta del catálogo base (read-only)
├── services/
│   ├── RecipeService.ts          # CRUD + búsqueda + filtrado de recetas
│   ├── IngredientService.ts      # Catálogo maestro de ingredientes
│   ├── TagInferenceService.ts    # Inferencia de etiquetas de compatibilidad
│   ├── GoalTagService.ts         # Sugerencia de etiquetas de objetivo
│   └── ProtectionService.ts      # Protección contra borrado de recetas en uso
├── screens/
│   ├── RecipeCatalog/            # Listado por tipo de comida + búsqueda
│   ├── RecipeDetail/             # Detalle de receta
│   ├── RecipeForm/               # Alta y edición de receta
│   └── IngredientSearch/         # Búsqueda en catálogo maestro
├── components/
│   ├── RecipeCard.tsx
│   ├── IngredientPicker.tsx
│   ├── TagBadge.tsx
│   ├── NutritionalSummary.tsx
│   ├── MealTypeFilter.tsx
│   └── SearchBar.tsx
├── database/
│   ├── schema.ts                 # Schema WatermelonDB (tablas spec 005)
│   ├── migrations/               # Migraciones de esquema
│   ├── repositories/             # Acceso a datos (queries)
│   └── seeds/
│       ├── master-ingredients.json  # ~500 ingredientes maestros
│       └── base-recipes.json        # ~50 recetas precargadas
├── i18n/
│   ├── es.json                   # Traducciones español (namespace 005)
│   └── index.ts
└── utils/
    ├── nutritional-calc.ts       # Helpers para valores nutricionales
    └── tag-rules.ts              # Reglas de inferencia de tags

tests/
├── unit/
│   ├── models/
│   ├── services/
│   └── utils/
├── integration/
│   ├── database/
│   ├── search/
│   └── sync/
└── component/
    ├── screens/
    └── components/
```

**Structure Decision**: Misma arquitectura por capas que spec 001 (models → services → screens/components). Los seeds (ingredientes + recetas base) se distribuyen como assets JSON bundleados con la app. El catálogo maestro es compartido con spec 003 (lista de compra) para normalización.

## Performance Considerations

| Aspecto | Objetivo | Estrategia |
|---------|----------|------------|
| Búsqueda por nombre | <3s | Q.like en WatermelonDB con índice en `name` |
| Búsqueda por ingrediente | <3s | Join query RecipeIngredient → MasterIngredient |
| Filtrado por tags | <3s | Compound index en `recipeId` + tipo |
| Listado por tipo comida | Instantáneo | Índice compuesto `familyId + mealType` |
| Carga catálogo base | Primera vez | Seed desde JSON bundleado, insert batch |
| Hasta 500 recetas/hogar | Sin degradación | Paginación lazy + observable queries |
