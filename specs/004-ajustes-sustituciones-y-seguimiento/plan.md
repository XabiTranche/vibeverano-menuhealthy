# Implementation Plan: Ajustes, sustituciones y seguimiento del menú

**Branch**: `004-ajustes-sustituciones-y-seguimiento` | **Date**: 2026-08-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/004-ajustes-sustituciones-y-seguimiento/spec.md`

## Summary

Módulo de sustitución de comidas (pre y post-aprobación del menú), validación de restricciones obligatorias, sincronización de la lista de la compra tras cambios, señales de ajuste para aprendizaje futuro, e histórico de menús (original vs. ajustado). Absorbe toda la funcionalidad de modificación de platos individuales que spec 002 delega aquí (tanto propuestas en revisión como menús aprobados).

## Technical Context

**Language/Version**: TypeScript 5.x (strict: true)

**Primary Dependencies**: React Native (Expo), react-i18next, Jest + React Native Testing Library

**Storage**: WatermelonDB + SQLCipher (cifrado en reposo) + Supabase (sync backend)

**Testing**: Jest + React Native Testing Library (unit + integration), TDD obligatorio

**Target Platform**: Mobile (iOS + Android via React Native/Expo)

**Project Type**: mobile-app

**Performance Goals**: Validación de sustitución <3s (NFR-006), actualización de lista automática tras confirmación

**Constraints**: Offline-capable, datos cifrados en reposo y tránsito (NFR-005), i18n desde día 1, colaborativo (multi-usuario)

**Scale/Scope**: Menús semanales con ~21-35 comidas, hasta 5+ sustituciones/semana antes de sugerencia de regeneración

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Estado | Notas |
|-----------|--------|-------|
| I. Mobile-First | ✅ PASS | React Native, flujo de sustitución optimizado para móvil |
| II. TypeScript Estricto | ✅ PASS | strict: true, sin any explícitos |
| III. TDD (NON-NEGOTIABLE) | ✅ PASS | Jest + RNTL, ciclo red-green-refactor |
| IV. Offline-First | ✅ PASS | Validación y aplicación offline con datos locales |
| V. Colaborativo | ✅ PASS | Merge automático para platos distintos, last-write-wins + notificación para mismo plato |
| VI. i18n-Ready | ✅ PASS | react-i18next, mensajes de validación internacionalizados |
| CWE Top 25 | ✅ PASS | Validación de input, ORM para queries |
| OWASP Mobile Top 10 | ✅ PASS | SQLCipher, auth segura |
| ISO/IEC 5055 | ✅ PASS | Métricas de calidad via linting/análisis |
| CISQ | ✅ PASS | Low coupling entre services, responsabilidad única |
| RGPD | ✅ PASS | Señales de ajuste cifradas (datos de salud indirectos) |

**Gate Result**: ✅ ALL PASS — Proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/004-ajustes-sustituciones-y-seguimiento/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (internal interfaces)
│   ├── substitution-service.md
│   └── history-service.md
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── models/
│   ├── MealAdjustment.ts         # Ajuste realizado sobre una comida
│   ├── SubstitutionSignal.ts     # Señal para aprendizaje futuro
│   ├── MenuHistory.ts            # Snapshot del menú original por semana
│   └── SubstitutionCounter.ts    # Contador de sustituciones por semana
├── services/
│   ├── SubstitutionService.ts    # Core: validar + aplicar sustitución
│   ├── RestrictionValidatorService.ts  # Verificar restricciones obligatorias
│   ├── ListSyncService.ts        # Actualizar lista de compra tras cambio
│   ├── SignalRecorderService.ts  # Registrar señales de ajuste
│   └── HistoryService.ts         # Gestionar original vs. ajustado
├── screens/
│   ├── MealSubstitution/         # Selección de nueva receta
│   ├── SubstitutionConfirm/      # Resultado de validación + warnings
│   └── AdjustmentHistory/        # Historial por semana
├── components/
│   ├── SubstitutionCard.tsx
│   ├── ValidationResultBanner.tsx
│   ├── WarningDismissable.tsx
│   ├── ListDiffView.tsx
│   └── RegenerationSuggestion.tsx
├── database/
│   ├── schema.ts                 # Schema extendido con nuevas tablas
│   ├── migrations/
│   └── repositories/
├── i18n/
│   ├── es.json                   # Traducciones (namespace 004)
│   └── index.ts
└── hooks/
    ├── useSubstitution.ts
    ├── useMenuHistory.ts
    └── useSubstitutionCounter.ts

tests/
├── unit/
│   ├── services/
│   │   ├── SubstitutionService.test.ts
│   │   ├── RestrictionValidatorService.test.ts
│   │   ├── ListSyncService.test.ts
│   │   ├── SignalRecorderService.test.ts
│   │   └── HistoryService.test.ts
│   └── models/
├── integration/
│   ├── substitution-flow.test.ts
│   ├── list-sync.test.ts
│   ├── history-tracking.test.ts
│   └── offline-substitution.test.ts
└── component/
    ├── MealSubstitution.test.tsx
    ├── SubstitutionConfirm.test.tsx
    └── AdjustmentHistory.test.tsx
```

**Structure Decision**: Misma arquitectura por capas que el resto del proyecto (models → services → screens/components). SubstitutionService orquesta la lógica core, delegando validación a RestrictionValidatorService y efectos secundarios a ListSyncService, SignalRecorderService e HistoryService.

## Dependencies (inter-spec)

| Spec | Dependencia | Cómo se usa |
|------|-------------|-------------|
| 001 - Perfiles y criterios | DietaryRestriction, FoodPreference, NutritionalGoal | RestrictionValidatorService carga restricciones/preferencias/objetivos del miembro para validar sustitución |
| 002 - Planificación semanal | PlannedMeal, WeeklyMenu | SubstitutionService modifica PlannedMeal directamente; distingue estado draft vs approved |
| 003 - Lista de la compra | ShoppingList, ListGeneratorService | ListSyncService invoca regeneración parcial tras confirmación en menú aprobado |
| 005 - Catálogo de recetas | Recipe, CompatibilityTags | MealSubstitution screen lista recetas disponibles; RestrictionValidatorService verifica tags de compatibilidad |

## Performance Notes

- Validación de restricciones <3s: se cachean localmente las restricciones del hogar (spec 001 sync)
- Actualización de lista automática: ListSyncService se ejecuta async tras confirmación, no bloquea UI
- Histórico snapshot: se crea solo en la primera modificación de la semana (lazy)
