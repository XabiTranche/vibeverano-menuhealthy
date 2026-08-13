# Quickstart Validation: Ajustes, sustituciones y seguimiento del menú

**Feature**: 004-ajustes-sustituciones-y-seguimiento
**Date**: 2026-08-10

## Prerequisites

- Node.js 18+
- Expo CLI (`npx expo`)
- iOS Simulator o Android Emulator (o dispositivo físico)
- Supabase project con tablas de specs 001, 002, 003, 004 y 005 creadas
- Datos de prueba: familia con miembros, restricciones, un menú semanal (aprobado), lista de compra generada, catálogo de recetas

## Setup

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con SUPABASE_URL y SUPABASE_ANON_KEY

# Seed de datos de prueba (familia + menú + recetas)
npm run seed:test-data

# Iniciar en desarrollo
npx expo start
```

## Validation Scenarios

### Escenario 1: Sustituir comida con receta válida (sin violación de restricciones)

**Objetivo**: Verificar HU1 escenario 1 + FR-001, FR-003, FR-004

**Pasos**:
1. Abrir menú semanal aprobado
2. Seleccionar una comida (ej: almuerzo del martes → "Pasta carbonara")
3. Tocar "Sustituir"
4. Navegar catálogo de recetas → elegir "Ensalada César"
5. El sistema valida restricciones → resultado: válido, sin warnings
6. Confirmar sustitución

**Expected**:
- La receta del almuerzo del martes cambia a "Ensalada César"
- El resto del menú permanece intacto
- Se crea un MealAdjustment en base de datos
- El cambio persiste al cerrar y reabrir la app

**Test command**:
```bash
npm test -- --testPathPattern="tests/integration/substitution-flow"
```

---

### Escenario 2: Sustitución bloqueada por restricción obligatoria

**Objetivo**: Verificar HU1 escenario 2 + FR-002

**Pasos**:
1. Asegurar que miembro "Lucas" tiene restricción: alergia al cacahuete (mandatory)
2. Abrir menú → seleccionar comida de Lucas (ej: merienda del miércoles)
3. Tocar "Sustituir" → elegir receta que contiene cacahuete (ej: "Galletas de cacahuete")
4. El sistema valida restricciones

**Expected**:
- Validación retorna `blocked: true`
- Se muestra mensaje claro: "No se puede aplicar: violación de alergia al cacahuete (Lucas)"
- La sustitución NO se aplica
- No se crea MealAdjustment
- El PlannedMeal original permanece sin cambios

**Test command**:
```bash
npm test -- --testPathPattern="tests/integration/substitution-blocked"
```

---

### Escenario 3: Sustitución con aviso informativo (preferencia/objetivo)

**Objetivo**: Verificar FR-012 + R8

**Pasos**:
1. Asegurar que miembro "Carlos" tiene objetivo: perder peso
2. Abrir menú → seleccionar almuerzo de Carlos
3. Tocar "Sustituir" → elegir receta con más calorías que la original
4. El sistema valida → pasa restricciones obligatorias pero genera warning

**Expected**:
- Validación retorna `valid: true, blocked: false`
- Se muestra warning dismissable: "Este plato tiene más calorías que el anterior"
- El usuario puede descartar el warning y confirmar la sustitución
- La sustitución se aplica correctamente
- El warning queda registrado en MealAdjustment.validationResult

**Test command**:
```bash
npm test -- --testPathPattern="tests/integration/substitution-warning"
```

---

### Escenario 4: Actualización de lista de compra tras sustitución

**Objetivo**: Verificar HU2 + FR-005, FR-006, FR-007

**Pasos**:
1. Tener menú aprobado con lista de compra generada
2. Marcar algunos items como "comprados" (tachados) en la lista
3. Sustituir una comida (ej: cambiar "Pollo al horno" por "Salmón a la plancha")
4. Confirmar sustitución
5. Abrir lista de compra

**Expected**:
- Items ya tachados permanecen intactos
- Ingredientes del pollo se eliminan de la parte pendiente (si no los usa otra comida)
- Ingredientes del salmón se añaden a la parte pendiente
- Se muestra diff: "Añadido: salmón fresco, limón. Eliminado: pechuga de pollo"
- Si algún ingrediente eliminado ya estaba tachado → aviso de inconsistencia

**Test command**:
```bash
npm test -- --testPathPattern="tests/integration/list-sync"
```

---

### Escenario 5: Sugerencia de regeneración al 5° cambio

**Objetivo**: Verificar FR-011 + R4

**Pasos**:
1. Hacer 4 sustituciones válidas en la misma semana → sin sugerencia
2. Hacer la 5ª sustitución
3. Observar el comportamiento

**Expected**:
- Tras la 5ª sustitución, se muestra sugerencia: "Quizás sea mejor regenerar el menú completo"
- La sugerencia es dismissable (no bloquea)
- El usuario puede seguir haciendo sustituciones puntuales
- SubstitutionCounter.count = 5, SubstitutionCounter.regenerationSuggested = true
- La sugerencia no se vuelve a mostrar tras ser dismissada

**Test command**:
```bash
npm test -- --testPathPattern="tests/integration/substitution-counter"
```

---

### Escenario 6: Registro de motivo (con y sin motivo)

**Objetivo**: Verificar HU3 + FR-009, FR-010

**Pasos**:
1. Sustituir una comida → en el flujo de confirmación, seleccionar motivo "gusto" → confirmar
2. Sustituir otra comida → en el flujo de confirmación, omitir motivo → confirmar

**Expected**:
- Primera sustitución: MealAdjustment.reason = "gusto", SubstitutionSignal.reason = "gusto"
- Segunda sustitución: MealAdjustment.reason = null, SubstitutionSignal.reason = null
- Ambas señales se registran correctamente con todos los demás campos
- El motivo es opcional en la UI (se puede saltar sin friction)

**Test command**:
```bash
npm test -- --testPathPattern="tests/integration/signal-recording"
```

---

### Escenario 7: Histórico de menú (original vs. ajustado)

**Objetivo**: Verificar HU4 + FR-008 + R6

**Pasos**:
1. Generar menú semanal y aprobarlo (todas las comidas en su estado original)
2. Hacer la primera sustitución de la semana
3. Verificar que se creó snapshot del original
4. Hacer 2 sustituciones más
5. Abrir pantalla de historial de la semana

**Expected**:
- MenuHistory creado con `originalMeals` = snapshot del menú antes de la primera sustitución
- La pantalla muestra dos versiones: "Menú original" y "Menú actual"
- El menú original refleja el estado previo a cualquier cambio
- El menú actual refleja todas las sustituciones aplicadas
- Sustituciones posteriores NO modifican el snapshot original (inmutable)

**Test command**:
```bash
npm test -- --testPathPattern="tests/integration/history-tracking"
```

---

### Escenario 8: Sustitución offline + sincronización

**Objetivo**: Verificar NFR-001, NFR-002

**Pasos**:
1. Desactivar conexión a internet
2. Abrir menú → sustituir una comida (validación funciona offline con datos locales)
3. Confirmar sustitución
4. Verificar que el cambio se aplica localmente (MealAdjustment + PlannedMeal actualizados)
5. Reactivar conexión
6. Verificar sincronización con Supabase

**Expected**:
- Validación de restricciones funciona sin conexión (datos del perfil cacheados)
- Sustitución se confirma y persiste localmente
- Lista de compra se actualiza localmente (si menú aprobado)
- Al reconectar, MealAdjustment + SubstitutionSignal + PlannedMeal actualizado se sincronizan
- No hay pérdida de datos

**Test command**:
```bash
npm test -- --testPathPattern="tests/integration/offline-substitution"
```

## Full Test Suite

```bash
# Unit tests
npm test -- --testPathPattern="tests/unit/services/Substitution"
npm test -- --testPathPattern="tests/unit/services/RestrictionValidator"
npm test -- --testPathPattern="tests/unit/services/ListSync"
npm test -- --testPathPattern="tests/unit/services/SignalRecorder"
npm test -- --testPathPattern="tests/unit/services/History"

# Integration tests
npm test -- --testPathPattern="tests/integration/substitution"
npm test -- --testPathPattern="tests/integration/list-sync"
npm test -- --testPathPattern="tests/integration/history"
npm test -- --testPathPattern="tests/integration/offline"

# Component tests
npm test -- --testPathPattern="tests/component/MealSubstitution"
npm test -- --testPathPattern="tests/component/SubstitutionConfirm"
npm test -- --testPathPattern="tests/component/AdjustmentHistory"

# All spec 004 tests
npm test -- --testPathPattern="tests/(unit|integration|component)/.*(substitution|adjustment|history|signal|list-sync)"
```

## Success Criteria Validation

| Criterio | Cómo validar |
|----------|-------------|
| SC-001: Ajustar comida en <2 min | Timer manual: seleccionar comida → elegir alternativa → confirmar |
| SC-002: 100% coherencia con restricciones obligatorias | Unit tests de RestrictionValidatorService (nunca permite violación) |
| SC-003: 100% sustituciones reflejadas en lista | Integration tests de ListSyncService + verificación manual |
| SC-004: 100% semanas con cambios tienen histórico | Integration test: toda semana con MealAdjustment tiene MenuHistory |
