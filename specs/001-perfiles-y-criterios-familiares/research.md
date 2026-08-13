# Research: Perfiles familiares y criterios alimentarios

**Feature**: 001-perfiles-y-criterios-familiares
**Date**: 2026-08-10

## R1: Base de datos local offline-first para React Native

**Decision**: WatermelonDB sobre SQLite

**Rationale**:
- Diseñado específicamente para React Native con rendimiento optimizado
- Soporte nativo de sincronización (pull/push) con backends personalizados
- Lazy loading de relaciones — ideal para hogares con muchos miembros/criterios
- Observable queries — los componentes se re-renderizan automáticamente al cambiar datos
- Migraciones de esquema integradas
- Compatible con Expo (bare workflow)

**Alternatives considered**:
- AsyncStorage: demasiado simple para relaciones complejas (miembro → restricciones → preferencias)
- Realm: buena opción pero vendor lock-in con MongoDB Atlas y SDK más pesado
- SQLite directo (expo-sqlite): funcional pero sin capa de sync ni observables

## R2: Sincronización con backend (BaaS)

**Decision**: Supabase con sync custom via WatermelonDB sync adapter

**Rationale**:
- PostgreSQL como base — relacional, ideal para entidades con relaciones fuertes
- Row Level Security (RLS) nativo — RGPD compliance por diseño
- Auth integrado con soporte multi-usuario (colaborativo)
- Open source, sin vendor lock-in total
- API REST + Realtime subscriptions para notificar cambios entre dispositivos
- WatermelonDB tiene protocolo de sync documentado que encaja con Supabase

**Alternatives considered**:
- Firebase Firestore: NoSQL no ideal para relaciones fuertes familia→miembro→restricción; RLS más complejo
- Appwrite: menos maduro en el ecosistema React Native
- Custom backend: demasiado overhead para MVP

## R3: Cifrado de datos sensibles en dispositivo

**Decision**: react-native-encrypted-storage para credenciales + cifrado a nivel de campo en WatermelonDB

**Rationale**:
- Los datos de restricciones médicas (alergias, intolerancias) son datos de salud según RGPD
- WatermelonDB almacena en SQLite sin cifrar por defecto
- SQLCipher (via WatermelonDB plugin) cifra toda la BD en reposo
- react-native-encrypted-storage para tokens y secretos de auth
- Supabase usa HTTPS por defecto (cifrado en tránsito)

**Alternatives considered**:
- Cifrar solo campos sensibles a nivel de aplicación: más complejo, posibles leaks en queries
- No cifrar (solo confiar en cifrado del OS): insuficiente para RGPD con datos de salud

## R4: Internacionalización desde día 1

**Decision**: react-i18next con ficheros JSON por idioma

**Rationale**:
- Estándar de facto en React/React Native
- Interpolación, pluralización, formateo de fechas
- Lazy loading de idiomas
- Compatible con herramientas de traducción profesional
- Namespace por feature (001-profiles, 002-planning, etc.)

**Alternatives considered**:
- expo-localization + solución custom: más trabajo manual
- LinguiJS: buena opción pero comunidad más pequeña en React Native

## R5: Validación de coherencia entre criterios

**Decision**: Service layer con reglas de negocio declarativas

**Rationale**:
- Las incoherencias son del dominio (ej: preferencia contradice restricción), no de UI
- Se implementa en `CriteriaService.ts` con reglas tipo:
  - Si restricción = "alergia a X" y preferencia = "me gusta X" → incoherencia
  - Si objetivo = "perder peso" y otro objetivo del mismo miembro = "ganar masa" → conflicto
- Las reglas se ejecutan al guardar, retornando warnings (no bloqueos para preferencias)
- Las restricciones obligatorias SÍ bloquean si se contradicen

**Alternatives considered**:
- Validación solo en UI: no garantiza coherencia en sync/offline
- Motor de reglas externo: overkill para MVP

## R6: Gestión de estado "preparado para planificar"

**Decision**: Computed property en ReadinessService basado en datos mínimos

**Rationale**:
- Los datos mínimos por miembro son: nombre, edad, sexo, restricciones obligatorias
- ReadinessService evalúa todos los miembros activos y retorna:
  - `ready: true/false`
  - `missing: [{member, fields: [...]}]`
- Se calcula on-demand (no persiste), siempre refleja estado actual
- Se expone como hook React: `useReadinessCheck(familyId)`

**Alternatives considered**:
- Persistir estado de readiness: introduce inconsistencias si datos cambian sin recalcular
- Validar solo al generar menú (spec 002): tarde para el usuario, mejor feedback temprano

## R7: Archivado vs borrado de miembros

**Decision**: Soft delete con campo `archivedAt: Date | null`

**Rationale**:
- Spec exige "no se permite borrado total" + "conservar historial"
- Miembros archivados no aparecen en planificación pero sus datos persisten
- Permite reactivar si vuelven al hogar
- Queries de miembros activos filtran por `archivedAt IS NULL`

**Alternatives considered**:
- Borrado real con backup: más complejo y no permite reactivación fácil
- Campo booleano `isActive`: menos expresivo (no se sabe cuándo se archivó)
