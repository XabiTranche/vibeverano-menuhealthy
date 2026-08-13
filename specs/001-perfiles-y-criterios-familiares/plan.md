# Implementation Plan: Perfiles familiares y criterios alimentarios

**Branch**: `001-perfiles-y-criterios-familiares` | **Date**: 2026-08-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-perfiles-y-criterios-familiares/spec.md`

## Summary

Implementar el módulo de creación y gestión de perfiles familiares: unidades familiares, miembros, restricciones alimentarias, preferencias y objetivos nutricionales. Este módulo es la base de datos del sistema sobre la que se construyen las specs posteriores (planificación, lista de compra, ajustes, catálogo). El enfoque técnico es una app React Native con TypeScript estricto, almacenamiento local con sincronización a backend, siguiendo TDD obligatorio y arquitectura offline-first.

## Technical Context

**Language/Version**: TypeScript 5.x (strict: true)

**Primary Dependencies**: React Native (Expo), react-i18next, Jest + React Native Testing Library

**Storage**: SQLite local (WatermelonDB o similar) + Firebase/Supabase como BaaS para sincronización

**Testing**: Jest + React Native Testing Library (unit + integration), TDD obligatorio

**Target Platform**: Mobile (iOS + Android via React Native/Expo)

**Project Type**: mobile-app

**Performance Goals**: Configuración completa del hogar en <15 min (UX), operaciones CRUD <1s (técnico)

**Constraints**: Offline-capable, datos cifrados en reposo y tránsito, i18n desde día 1, colaborativo (multi-usuario)

**Scale/Scope**: Hogares de 1-10 miembros, cada miembro con N restricciones/preferencias/objetivos

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Estado | Notas |
|-----------|--------|-------|
| I. Mobile-First | ✅ PASS | React Native, diseño exclusivamente móvil |
| II. TypeScript Estricto | ✅ PASS | strict: true, sin any explícitos |
| III. TDD (NON-NEGOTIABLE) | ✅ PASS | Jest + RNTL, ciclo red-green-refactor |
| IV. Offline-First | ✅ PASS | SQLite local + sync con backend |
| V. Colaborativo | ✅ PASS | Sync multi-usuario via BaaS |
| VI. i18n-Ready | ✅ PASS | react-i18next desde día 1 |
| CWE Top 25 | ✅ PASS | Validación de input, no SQL injection (ORM) |
| OWASP Mobile Top 10 | ✅ PASS | Cifrado local, auth segura |
| ISO/IEC 5055 | ✅ PASS | Métricas de calidad via linting/análisis |
| CISQ | ✅ PASS | Low coupling, no dead code |
| RGPD | ✅ PASS | Datos sensibles cifrados, minimización, consentimiento |

**Gate Result**: ✅ ALL PASS — Proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/001-perfiles-y-criterios-familiares/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (internal interfaces)
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── models/
│   ├── Family.ts              # Unidad familiar
│   ├── FamilyMember.ts        # Miembro familiar
│   ├── DietaryRestriction.ts  # Restricción alimentaria
│   ├── FoodPreference.ts      # Preferencia alimentaria
│   └── NutritionalGoal.ts     # Objetivo nutricional
├── services/
│   ├── FamilyService.ts       # CRUD unidad familiar
│   ├── MemberService.ts       # CRUD miembros
│   ├── CriteriaService.ts     # Gestión restricciones/preferencias/objetivos
│   ├── ReadinessService.ts    # Validación datos mínimos
│   └── SyncService.ts         # Sincronización offline/online
├── screens/
│   ├── FamilySetup/           # Pantalla creación hogar
│   ├── MemberProfile/         # Pantalla perfil miembro
│   ├── Restrictions/          # Pantalla restricciones
│   ├── Preferences/           # Pantalla preferencias
│   ├── Goals/                 # Pantalla objetivos
│   └── ReadinessCheck/        # Pantalla estado preparación
├── components/
│   ├── MemberCard.tsx
│   ├── RestrictionBadge.tsx
│   ├── GoalSelector.tsx
│   └── ReadinessIndicator.tsx
├── database/
│   ├── schema.ts              # Schema SQLite/WatermelonDB
│   ├── migrations/            # Migraciones de esquema
│   └── repositories/          # Acceso a datos
├── i18n/
│   ├── es.json                # Traducciones español
│   └── index.ts               # Configuración i18n
└── utils/
    ├── validation.ts          # Validaciones de coherencia
    └── encryption.ts          # Cifrado datos sensibles

tests/
├── unit/
│   ├── models/
│   ├── services/
│   └── utils/
├── integration/
│   ├── database/
│   └── sync/
└── component/
    ├── screens/
    └── components/
```

**Structure Decision**: Mobile app con estructura por capas (models → services → screens/components). La base de datos local es el source of truth offline, con sync bidireccional al backend. Tests organizados por tipo (unit/integration/component).
