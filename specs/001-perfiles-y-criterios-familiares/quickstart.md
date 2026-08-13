# Quickstart Validation: Perfiles familiares y criterios alimentarios

**Feature**: 001-perfiles-y-criterios-familiares
**Date**: 2026-08-10

## Prerequisites

- Node.js 18+
- Expo CLI (`npx expo`)
- iOS Simulator o Android Emulator (o dispositivo físico)
- Supabase project creado con tablas del data model

## Setup

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con SUPABASE_URL y SUPABASE_ANON_KEY

# Iniciar en desarrollo
npx expo start
```

## Validation Scenarios

### Escenario 1: Crear unidad familiar con miembros

**Objetivo**: Verificar HU1 (Registrar miembros de la familia)

**Pasos**:
1. Abrir la app → pantalla de bienvenida
2. Crear un hogar con nombre "Familia García"
3. Añadir miembro: "Carlos", 42 años, masculino
4. Añadir miembro: "María", 39 años, femenino
5. Añadir miembro: "Lucas", 12 años, masculino

**Expected**:
- El hogar aparece creado con 3 miembros activos
- Cada miembro muestra nombre, edad y sexo
- Los datos persisten al cerrar y reabrir la app

**Test command**:
```bash
npm test -- --testPathPattern="tests/integration/family-creation"
```

### Escenario 2: Definir restricciones y preferencias

**Objetivo**: Verificar HU2 (Restricciones, preferencias y aversiones)

**Pasos**:
1. Seleccionar miembro "Lucas"
2. Añadir restricción: alergia al cacahuete
3. Añadir restricción: intolerancia a la lactosa
4. Añadir preferencia: le gusta el pollo (liked)
5. Añadir preferencia: rechaza el pescado (disliked)
6. Intentar añadir preferencia: le gusta el cacahuete (liked)

**Expected**:
- Restricciones guardadas con severity=mandatory automáticamente
- Preferencias guardadas con tipo correcto
- Al intentar "le gusta el cacahuete" → warning de incoherencia (conflicto con alergia)
- La restricción prevalece; la preferencia se puede guardar pero con aviso

**Test command**:
```bash
npm test -- --testPathPattern="tests/integration/criteria-coherence"
```

### Escenario 3: Definir objetivos nutricionales

**Objetivo**: Verificar HU3 (Objetivos nutricionales)

**Pasos**:
1. Seleccionar miembro "Carlos" → añadir objetivo "perder peso"
2. Seleccionar miembro "María" → añadir objetivo "mantener"
3. Seleccionar miembro "Lucas" → añadir objetivo "ganar músculo"
4. Intentar añadir "ganar músculo" también a Carlos

**Expected**:
- Cada miembro tiene su objetivo independiente
- Carlos con "perder peso" + "ganar músculo" → warning informativo de conflicto
- No se bloquea, pero se informa

**Test command**:
```bash
npm test -- --testPathPattern="tests/integration/goals"
```

### Escenario 4: Verificar readiness

**Objetivo**: Verificar HU4 (Familia lista para planificar)

**Pasos**:
1. Crear hogar con un miembro sin edad definida
2. Revisar estado de preparación → debe mostrar "incompleto" indicando qué falta
3. Completar edad del miembro
4. Confirmar pantalla de restricciones (aunque vacía)
5. Revisar estado → debe mostrar "listo para planificar"

**Expected**:
- Estado incompleto muestra campos faltantes por miembro
- Estado completo cuando todos los datos mínimos están cubiertos
- El estado se actualiza en tiempo real al completar datos

**Test command**:
```bash
npm test -- --testPathPattern="tests/integration/readiness"
```

### Escenario 5: Archivar miembro

**Objetivo**: Verificar soft delete

**Pasos**:
1. Archivar miembro "Lucas"
2. Verificar que no aparece en listado de miembros activos
3. Verificar que el estado de readiness se recalcula sin Lucas
4. Reactivar miembro "Lucas"
5. Verificar que vuelve a aparecer con todos sus datos intactos

**Expected**:
- Archivar: desaparece de activos, readiness recalculado
- Reactivar: reaparece con todos sus datos (restricciones, preferencias, objetivos)
- Nunca se borran datos

**Test command**:
```bash
npm test -- --testPathPattern="tests/integration/archive-member"
```

### Escenario 6: Offline capability

**Objetivo**: Verificar NFR offline-first

**Pasos**:
1. Desactivar conexión a internet
2. Crear un nuevo miembro
3. Añadir restricciones y preferencias
4. Reactivar conexión
5. Verificar que los datos se sincronizan al backend

**Expected**:
- Todas las operaciones CRUD funcionan sin conexión
- Al reconectar, los datos aparecen en Supabase
- No hay pérdida de datos

**Test command**:
```bash
npm test -- --testPathPattern="tests/integration/offline-sync"
```

## Full Test Suite

```bash
# Unit tests
npm test -- --testPathPattern="tests/unit"

# Integration tests
npm test -- --testPathPattern="tests/integration"

# Component tests
npm test -- --testPathPattern="tests/component"

# All tests
npm test
```

## Success Criteria Validation

| Criterio | Cómo validar |
|----------|-------------|
| SC-001: Config <15 min | Timer manual: crear hogar + 3 miembros + criterios completos |
| SC-002: 90% planificaciones con perfiles completos | ReadinessService check antes de generar menú (spec 002) |
| SC-003: Restricciones sin ambigüedad | Unit tests de CriteriaService + coherence checks |
| SC-004: Usuario entiende qué falta | Component test de ReadinessCheck screen |
