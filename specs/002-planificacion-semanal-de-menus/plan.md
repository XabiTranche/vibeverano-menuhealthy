# Implementation Plan: Planificación semanal de menús

**Branch**: `002-planificacion-semanal-de-menus` | **Date**: 2026-08-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/002-planificacion-semanal-de-menus/spec.md`

## Summary

Motor de generación de planificación semanal de menús. Genera propuestas respetando los criterios familiares, estructuradas por día y tipo de comida (desayuno/comida/cena/snack). Soporta semanas parciales, filtro de complejidad, flujo de aprobación y detección de incompatibilidades por cambios en perfiles. La generación se ejecuta preferentemente en backend con fallback offline para garantizar funcionamiento sin conexión.

## Technical Context

**Language/Version**: TypeScript 5.x (strict: true)

**Primary Dependencies**: React Native (Expo), react-i18next, Jest + React Native Testing Library

**Storage**: WatermelonDB + SQLCipher (local cifrado) + Supabase (backend BaaS, Edge Functions para generación)

**Testing**: Jest + React Native Testing Library (unit + integration), TDD obligatorio

**Target Platform**: Mobile (iOS + Android via React Native/Expo)

**Project Type**: mobile-app

**Performance Goals**: Generación de propuesta <15s (backend), operaciones locales <1s, fallback offline disponible

**Constraints**: Offline-first, datos cifrados en reposo y tránsito, i18n desde día 1, colaborativo (multi-usuario), merge automático en ediciones no solapadas

**Scale/Scope**: Hogares de 1-10 miembros, semanas de 1-7 días, 4 tipos de comida por día

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Estado | Notas |
|-----------|--------|-------|
| I. Mobile-First | ✅ PASS | React Native, diseño exclusivamente móvil |
| II. TypeScript Estricto | ✅ PASS | strict: true, sin any explícitos |
| III. TDD (NON-NEGOTIABLE) | ✅ PASS | Jest + RNTL, ciclo red-green-refactor |
| IV. Offline-First | ✅ PASS | Generación backend-first con fallback local |
| V. Colaborativo | ✅ PASS | Merge automático por días, conflicto si mismo día/comida |
| VI. i18n-Ready | ✅ PASS | react-i18next, explicaciones con claves i18n |
| CWE Top 25 | ✅ PASS | Validación de input, ORM sin inyección SQL |
| OWASP Mobile Top 10 | ✅ PASS | SQLCipher local, TLS en tránsito |
| ISO/IEC 5055 | ✅ PASS | Métricas de calidad via linting/análisis |
| CISQ | ✅ PASS | Low coupling, servicios desacoplados |
| RGPD | ✅ PASS | Datos sensibles cifrados, minimización de datos |

**Gate Result**: ✅ ALL PASS — Proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/002-planificacion-semanal-de-menus/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (internal interfaces)
│   ├── plan-generator-service.md
│   └── approval-service.md
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── models/
│   ├── PlannedWeek.ts           # Semana planificada
│   ├── MenuProposal.ts          # Propuesta de menú generada
│   ├── PlannedMeal.ts           # Comida planificada (unidad)
│   └── ComplexityConfig.ts      # Configuración de complejidad
├── services/
│   ├── PlanGeneratorService.ts  # Motor de generación (core)
│   ├── ProposalService.ts       # CRUD de propuestas
│   ├── ApprovalService.ts       # Aprobar/reemplazar menús
│   ├── IncompatibilityService.ts # Detectar cambios de perfil
│   └── ComplexityService.ts     # Filtro de complejidad
├── screens/
│   ├── WeekPlanner/             # Vista semanal principal
│   ├── DayView/                 # Vista de un día
│   ├── MealDetail/              # Detalle de una comida
│   ├── ProposalReview/          # Revisión de propuesta
│   └── ApprovalFlow/            # Flujo de aprobación
├── components/
│   ├── WeekCalendar.tsx         # Calendario semanal
│   ├── MealCard.tsx             # Tarjeta de comida
│   ├── ProposalSummary.tsx      # Resumen de propuesta
│   ├── ExplanationPanel.tsx     # Panel de explicación
│   ├── ComplexitySelector.tsx   # Selector de complejidad
│   └── IncompatibilityBanner.tsx # Banner de incompatibilidad
├── database/
│   ├── schema.ts                # Schema WatermelonDB (extensión)
│   ├── migrations/              # Migraciones
│   └── repositories/
│       ├── PlannedWeekRepo.ts
│       ├── MenuProposalRepo.ts
│       └── PlannedMealRepo.ts
├── i18n/
│   ├── es.json                  # Traducciones español (extensión)
│   └── index.ts
└── utils/
    ├── repetitionChecker.ts     # Verificación no-repetición
    ├── criteriaSnapshot.ts      # Snapshot de criterios
    └── dateRange.ts             # Utilidades de rango de fechas

tests/
├── unit/
│   ├── models/
│   ├── services/
│   │   ├── PlanGeneratorService.test.ts
│   │   ├── ApprovalService.test.ts
│   │   └── IncompatibilityService.test.ts
│   └── utils/
├── integration/
│   ├── generation/
│   └── sync/
└── component/
    ├── screens/
    └── components/
```

**Structure Decision**: Extensión de la arquitectura por capas de spec 001. El PlanGeneratorService es el core de la feature, ejecutando lógica en backend (Supabase Edge Function) con fallback a motor local simplificado. Los servicios de aprobación e incompatibilidad operan localmente con sync.

## Dependencies

| Spec | Relación | Detalle |
|------|----------|---------|
| 001 - Perfiles y criterios familiares | **Requiere** | Family, FamilyMember, DietaryRestriction, FoodPreference, NutritionalGoal |
| 005 - Catálogo de recetas | **Requiere** | FamilyRecipe con metadatos de complejidad, tipo de comida, restricciones |
| 003 - Lista de la compra | **Consumido por** | Usa PlannedWeek aprobada como input |
| 004 - Ajustes y sustituciones | **Consumido por** | Opera sobre PlannedMeal para sustituciones post-aprobación |

## Performance Budget

| Operación | Objetivo | Estrategia |
|-----------|----------|------------|
| Generación backend | <15s | Supabase Edge Function, constraint satisfaction optimizado |
| Generación offline | <30s | Motor local simplificado, caché de recetas |
| Navegación semanal | <200ms | Datos locales WatermelonDB, queries indexados |
| Aprobación/reemplazo | <1s | Operación local + sync en background |
| Detección incompatibilidad | <2s | Observer reactivo sobre cambios en perfiles |
