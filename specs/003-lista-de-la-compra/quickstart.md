# Quickstart Validation: Lista de la compra automática desde el menú semanal

**Feature**: 003-lista-de-la-compra
**Date**: 2026-08-10

## Prerequisites

- Node.js 18+
- Expo CLI (`npx expo`)
- iOS Simulator o Android Emulator (o dispositivo físico)
- Supabase project con tablas del data model (specs 001, 002, 003, 005)
- Menú semanal aprobado existente (spec 002 completada)
- Catálogo de ingredientes con al menos 10 MasterIngredients (spec 005)

## Setup

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con SUPABASE_URL y SUPABASE_ANON_KEY

# Seed de datos para validación
npm run seed:shopping-list-test

# Iniciar en desarrollo
npx expo start
```

## Validation Scenarios

### Escenario 1: Generar lista desde menú aprobado

**Objetivo**: Verificar HU1 (Generación automática) + FR-001, FR-002, FR-010

**Pasos**:
1. Tener un menú semanal aprobado con 5 recetas (lunes a viernes, comida)
2. Navegar a la pantalla de lista de la compra
3. Pulsar "Generar lista de la compra"
4. Verificar que se crea una lista vinculada a la semana y menú

**Expected**:
- La lista se genera en <5s
- Contiene todos los ingredientes de las 5 recetas
- Estado inicial: `generated`
- Vinculada a familyId + weekId + menuId correctos
- Sin intentar generar desde menú no aprobado → error informativo

**Test command**:
```bash
npm test -- --testPathPattern="tests/integration/list-generation"
```

### Escenario 2: Consolidación de ingredientes repetidos

**Objetivo**: Verificar HU2 (Consolidación) + FR-003, FR-005, FR-011

**Pasos**:
1. Menú con 3 recetas que usan "tomate" (200g + 150g + 100g)
2. Menú con 2 recetas que usan "aceite de oliva" (20ml + 30ml)
3. Generar la lista

**Expected**:
- "Tomate" aparece UNA sola vez con cantidad ≈ 450g
- "Aceite de oliva" aparece UNA sola vez con cantidad ≈ 50ml
- No hay líneas duplicadas para el mismo ingrediente
- Las cantidades son aproximadas (orientativas)

**Test command**:
```bash
npm test -- --testPathPattern="tests/unit/services/ConsolidationService"
```

### Escenario 3: Agrupación por categorías de compra

**Objetivo**: Verificar HU3 (Categorías) + FR-006

**Pasos**:
1. Generar lista con ingredientes de distintas categorías:
   - Tomate, lechuga (fruits_vegetables)
   - Pollo, salmón (meats)
   - Leche, yogur (dairy)
   - Arroz, lentejas (cereals)
   - Sal, aceite (other)
2. Abrir la lista generada

**Expected**:
- Items agrupados en 5 secciones visibles
- Orden de presentación: Frutas/Verduras → Carnes → Lácteos → Cereales → Otros
- Cada item aparece en su categoría correcta (heredada de MasterIngredient.category)
- Ingredientes sin categoría → sección "Otros"

**Test command**:
```bash
npm test -- --testPathPattern="tests/component/CategoryView"
```

### Escenario 4: Marcar "ya lo tengo" (available at home)

**Objetivo**: Verificar HU4 (Marcado binario) + FR-007, FR-008

**Pasos**:
1. Generar lista con 10 items
2. Marcar 3 items como "ya lo tengo en casa"
3. Verificar que pasan a sección "Cubierto"
4. Desmarcar 1 de los 3 items
5. Verificar que vuelve a sección "Pendiente"

**Expected**:
- Items marcados desaparecen de lista pendiente
- Items marcados visibles en sección "Cubierto" (no eliminados)
- Desmarcar devuelve a pendiente
- Estado de la lista cambia a `adjusted`
- El estado persiste al cerrar/reabrir la app

**Test command**:
```bash
npm test -- --testPathPattern="tests/integration/mark-available"
```

### Escenario 5: Checklist mode (uso en supermercado)

**Objetivo**: Verificar HU5 (Checklist interactivo) + FR-009

**Pasos**:
1. Abrir lista en el móvil
2. Tachar 5 items como "comprado" (tap individual)
3. Cerrar la app
4. Reabrir la app
5. Verificar que los 5 items siguen tachados

**Expected**:
- Tap marca visualmente como comprado (tachado)
- Estado de item cambia a `bought`
- Estado persiste entre sesiones (WatermelonDB local)
- La lista muestra progreso (ej: "5/15 comprados")
- Estado de la lista cambia a `in_use`

**Test command**:
```bash
npm test -- --testPathPattern="tests/integration/checklist-mode"
```

### Escenario 6: Uso colaborativo simultáneo

**Objetivo**: Verificar HU5 (ac3) + HU6 (Colaboración) + FR-013, FR-014

**Pasos**:
1. Dos miembros del hogar abren la misma lista simultáneamente
2. Miembro A tacha items 1, 2, 3
3. Miembro B tacha items 4, 5, 6
4. Verificar que ambos ven los 6 items tachados

**Expected**:
- Cambios de A visibles para B en <500ms (con conexión)
- Cambios de B visibles para A en <500ms
- No hay conflictos (items distintos)
- Si ambos tachan el mismo item → last-write-wins (resultado final idéntico: bought)
- Barra de progreso actualizada en tiempo real para ambos

**Test command**:
```bash
npm test -- --testPathPattern="tests/integration/collaborative-sync"
```

### Escenario 7: Cambio de menú con lista existente

**Objetivo**: Verificar HU1 (ac3) + FR-004

**Pasos**:
1. Generar lista desde menú A (10 items)
2. Marcar 3 items como bought
3. Cambiar menú aprobado a menú B (que comparte 6 ingredients con A, añade 2 nuevos, elimina 4)
4. Regenerar lista

**Expected**:
- 3 items bought se mantienen (aunque 1 ya no está en menú B)
- 6 items compartidos se mantienen (actualizando cantidad si cambió)
- 2 items nuevos aparecen como pending
- 4 items que ya no son necesarios:
  - Si eran pending → se eliminan
  - Si eran bought → se mantienen (ya se compraron)
- Se muestra diff al usuario: "Se añadieron 2, se eliminaron N items"

**Test command**:
```bash
npm test -- --testPathPattern="tests/integration/menu-change"
```

### Escenario 8: Receta sin ingredientes mapeados

**Objetivo**: Verificar HU1 (ac4) + FR-012

**Pasos**:
1. Menú con 5 recetas, de las cuales 1 no tiene ingredientes en el catálogo
2. Generar la lista

**Expected**:
- La lista se genera con los ingredientes de las 4 recetas mapeadas
- El campo `unmappedRecipes` contiene el nombre de la receta sin mapear
- Se muestra aviso al usuario: "1 plato no pudo incluirse: [nombre de la receta]"
- La lista es usable (no se bloquea la generación)

**Test command**:
```bash
npm test -- --testPathPattern="tests/unit/services/ListGeneratorService.test.ts"
```

## Full Test Suite

```bash
# Unit tests
npm test -- --testPathPattern="tests/unit"

# Integration tests
npm test -- --testPathPattern="tests/integration"

# Component tests
npm test -- --testPathPattern="tests/component"

# All tests for this feature
npm test -- --testPathPattern="tests/(unit|integration|component).*(shopping|list|consolidation|checklist|collaborative)"
```

## Success Criteria Validation

| Criterio | Cómo validar |
|----------|-------------|
| SC-001: Lista completa en <1 min | Timer: aprobar menú → generar lista → resultado visible |
| SC-002: 70% listas solo requieren ajustes menores | Metric: contar listas con solo markAsAvailable vs añadidos manuales |
| SC-003: Sin duplicidades evidentes | Unit tests de ConsolidationService con datasets reales |
| SC-004: Usable como checklist sin herramientas externas | Manual: completar compra real usando solo la app |
