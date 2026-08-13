# Quickstart Validation: Catálogo de recetas, alimentos y valores nutricionales

**Feature**: 005-catalogo-recetas-alimentos-valores-nutricionales
**Date**: 2026-08-10

## Prerequisites

- Node.js 18+
- Expo CLI (`npx expo`)
- iOS Simulator o Android Emulator (o dispositivo físico)
- Supabase project con tablas del data model (spec 001 + spec 005)
- Spec 001 implementada (Family entity disponible)
- Spec 002 implementada parcialmente (MealPlan entity para protección)

## Setup

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con SUPABASE_URL y SUPABASE_ANON_KEY

# Seed de datos maestros (primera vez)
npx expo start
# Los seeds se cargan automáticamente en primera ejecución
```

## Validation Scenarios

### Escenario 1: Crear receta con ingredientes del catálogo maestro

**Objetivo**: Verificar HU1 (Dar de alta recetas familiares)

**Pasos**:
1. Abrir la app → navegar al catálogo de recetas
2. Pulsar "Nueva receta"
3. Introducir nombre: "Ensalada César"
4. Seleccionar tipo de comida: "Comida"
5. Buscar y añadir ingrediente "lechuga" (200g)
6. Buscar y añadir ingrediente "pollo" (150g)
7. Buscar y añadir ingrediente "queso parmesano" (30g)
8. Establecer raciones: 2
9. Introducir valores nutricionales totales: 450 kcal, 15g carbos, 25g grasas, 40g proteínas
10. Guardar

**Expected**:
- La receta aparece en el catálogo familiar bajo "Comida"
- Los 3 ingredientes están vinculados del catálogo maestro
- Los datos nutricionales se muestran correctamente
- El sistema infiere automáticamente etiquetas de compatibilidad (contiene lácteos → no sin_lactosa)
- Los datos persisten al cerrar y reabrir la app

**Test command**:
```bash
npm test -- --testPathPattern="tests/integration/recipe-creation"
```

### Escenario 2: Buscar por nombre y por ingrediente

**Objetivo**: Verificar HU2 (Buscar recetas por nombre, ingrediente o compatibilidad)

**Pasos**:
1. Con varias recetas en el catálogo (incluida "Ensalada César")
2. Buscar por nombre: escribir "César" en la barra de búsqueda
3. Verificar que aparece "Ensalada César"
4. Limpiar búsqueda
5. Buscar por ingrediente: seleccionar filtro "por ingrediente" → escribir "pollo"
6. Verificar que aparecen todas las recetas que contienen pollo

**Expected**:
- Búsqueda por nombre: resultados en <3s, coincidencia parcial funciona
- Búsqueda por ingrediente: muestra todas las recetas con ese ingrediente
- Sin resultados: mensaje "No se encontraron recetas"
- La búsqueda funciona offline

**Test command**:
```bash
npm test -- --testPathPattern="tests/integration/recipe-search"
```

### Escenario 3: Filtrar por compatibilidad (sin gluten)

**Objetivo**: Verificar HU2 (Filtrado por restricción)

**Pasos**:
1. Tener recetas variadas: algunas con gluten, otras sin
2. Activar filtro de compatibilidad: "sin_gluten"
3. Verificar que solo aparecen recetas compatibles con celíacos
4. Desactivar filtro: vuelven todas las recetas

**Expected**:
- Solo recetas sin ingredientes con gluten aparecen al filtrar
- El filtro se combina con la búsqueda por nombre
- Rendimiento <3s

**Test command**:
```bash
npm test -- --testPathPattern="tests/integration/recipe-filter-compatibility"
```

### Escenario 4: Usar receta del catálogo base (copiar a familia)

**Objetivo**: Verificar HU4 (Catálogo base precargado)

**Pasos**:
1. Navegar a sección "Catálogo base" / "Recetas sugeridas"
2. Verificar que hay ~50 recetas disponibles organizadas por tipo
3. Seleccionar receta "Tortilla española"
4. Pulsar "Copiar a mi catálogo"
5. Modificar: cambiar raciones de 4 a 2
6. Guardar
7. Verificar que la receta original del catálogo base no ha cambiado

**Expected**:
- Catálogo base muestra ~50 recetas read-only
- La copia aparece en el catálogo familiar con sourceType=copied_from_base
- La receta original permanece intacta en el catálogo base
- La copia es completamente editable

**Test command**:
```bash
npm test -- --testPathPattern="tests/integration/base-catalog-copy"
```

### Escenario 5: Intentar eliminar receta en plan activo (bloqueado)

**Objetivo**: Verificar HU5 (Proteger recetas en uso)

**Pasos**:
1. Tener una receta "Ensalada César" asignada a un menú semanal activo (spec 002)
2. Ir al catálogo familiar → seleccionar "Ensalada César"
3. Intentar eliminar la receta
4. Verificar que el sistema bloquea la eliminación

**Expected**:
- El sistema muestra aviso: "Esta receta está en uso en la planificación de [fecha]"
- La eliminación NO se ejecuta
- Si se edita en vez de eliminar: se muestra notificación de que está en uso con opciones (aplicar cambios / mantener versión anterior)

**Test command**:
```bash
npm test -- --testPathPattern="tests/integration/recipe-protection"
```

### Escenario 6: Inferencia de etiquetas de compatibilidad

**Objetivo**: Verificar FR-011 (Inferencia automática de compatibilidad)

**Pasos**:
1. Crear nueva receta "Pan de molde casero"
2. Añadir ingrediente "harina de trigo" (contiene flag "gluten")
3. Añadir ingrediente "levadura"
4. Guardar la receta
5. Verificar etiquetas inferidas

**Expected**:
- El sistema NO marca la receta como "sin_gluten" (contiene trigo)
- Se muestra tag inferido: incompatible con "sin_gluten", origin=inferred
- El usuario puede ver el origen de cada etiqueta
- Si se elimina el ingrediente con gluten y se añade "harina de arroz", las tags se recalculan

**Test command**:
```bash
npm test -- --testPathPattern="tests/integration/tag-inference"
```

### Escenario 7: Sugerencia de etiqueta de objetivo (alta en proteína)

**Objetivo**: Verificar HU6 (Etiquetas de objetivo nutricional)

**Pasos**:
1. Crear receta "Pechuga a la plancha con verduras"
2. Introducir valores nutricionales por ración: 350 kcal, 10g carbos, 8g grasas, 45g proteínas
3. Guardar la receta
4. Verificar etiquetas de objetivo sugeridas

**Expected**:
- El sistema sugiere "alta_en_proteina" (45g >30g umbral)
- El sistema sugiere "baja_en_grasas" (8g <10g umbral)
- El usuario puede aceptar, rechazar o añadir tags manualmente
- Las sugerencias muestran origin=suggested

**Test command**:
```bash
npm test -- --testPathPattern="tests/integration/goal-tag-suggestion"
```

### Escenario 8: Capacidad offline

**Objetivo**: Verificar NFR-001 y NFR-002 (Offline-first)

**Pasos**:
1. Desactivar conexión a internet
2. Navegar al catálogo de recetas → funciona
3. Buscar recetas por nombre → funciona
4. Buscar ingredientes en catálogo maestro → funciona
5. Crear nueva receta con ingredientes → funciona
6. Reactivar conexión
7. Verificar que la receta se sincroniza al backend

**Expected**:
- Todas las operaciones de lectura funcionan offline (catálogo maestro + recetas)
- Escrituras (crear/editar receta) se ejecutan localmente
- Al reconectar, datos se sincronizan a Supabase
- No hay pérdida de datos
- Catálogo maestro de ingredientes disponible offline desde primera ejecución

**Test command**:
```bash
npm test -- --testPathPattern="tests/integration/offline-catalog"
```

## Full Test Suite

```bash
# Unit tests
npm test -- --testPathPattern="tests/unit"

# Integration tests (spec 005)
npm test -- --testPathPattern="tests/integration/recipe|tests/integration/ingredient|tests/integration/tag|tests/integration/base-catalog|tests/integration/offline-catalog"

# Component tests
npm test -- --testPathPattern="tests/component"

# All tests
npm test
```

## Success Criteria Validation

| Criterio | Cómo validar |
|----------|-------------|
| SC-001: Alta de receta <3 min | Timer manual: crear receta con 5 ingredientes + nutricional + guardar |
| SC-002: Búsqueda <3s | Performance test con 500 recetas en catálogo |
| SC-003: 100% bloqueo de eliminación en uso | Integration test: eliminar receta en plan activo → error |
| SC-004: Filtrado por tipo/restricción/objetivo | Integration tests de búsqueda con filtros combinados |
| SC-005: Planificar sin crear recetas | Verificar que catálogo base disponible en hogar nuevo |
