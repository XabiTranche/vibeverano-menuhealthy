# Research: Lista de la compra automática desde el menú semanal

**Feature**: 003-lista-de-la-compra
**Date**: 2026-08-10

## R1: Algoritmo de generación de lista

**Decision**: Traversal PlannedMeal → RecipeIngredient → MasterIngredient con agregación por ingrediente canónico

**Rationale**:
- El menú aprobado (spec 002) contiene PlannedMeal para cada slot (día × comida)
- Cada PlannedMeal referencia una receta del catálogo (spec 005)
- Cada receta tiene RecipeIngredient con cantidad y unidad referenciando MasterIngredient
- El algoritmo recorre todos los PlannedMeal de la semana, extrae sus RecipeIngredient, y agrupa por MasterIngredient.id
- Las cantidades se suman por ingrediente canónico (mismo MasterIngredient)
- El resultado final se agrupa por MasterIngredient.category (5 categorías)

**Algorithm (pseudocode)**:
```
1. Get approvedWeek.plannedMeals[]
2. For each meal → get recipe.ingredients[] (RecipeIngredient)
3. For each recipeIngredient → resolve MasterIngredient via ingredientId
4. Group by MasterIngredient.id → sum quantities
5. Group result by MasterIngredient.category
6. Create ShoppingList + ShoppingItems
```

**Alternatives considered**:
- Generar desde recetas sin resolver a MasterIngredient: no permite consolidación correcta
- Usar nombre de ingrediente como key: propenso a duplicados por variantes de nombre

## R2: Lógica de consolidación

**Decision**: Consolidación por MasterIngredient.id con suma de cantidades aproximadas

**Rationale**:
- El mismo MasterIngredient puede aparecer en múltiples recetas del menú semanal
- Se suma la cantidad total (orientativa) por ingrediente canónico
- Las cantidades de RecipeIngredient son orientativas (spec dice "cantidades aproximadas")
- No se busca precisión de gramo exacto — la suma es la mejor aproximación útil
- La normalización se resuelve en el catálogo (spec 005): dos recetas que usan "tomate" y "tomate maduro" deben apuntar al mismo MasterIngredient.id
- IngredientConsolidation es un modelo transitorio (no se persiste) que durante la generación trackea qué recetas contribuyeron a cada ingrediente

**Consolidation rules**:
- Same MasterIngredient.id → sum quantities
- Same unit → direct sum
- Different units for same ingredient → keep largest unit, approximate conversion (or show both)
- Zero or null quantity → include as "sin cantidad especificada"

**Alternatives considered**:
- Persistir la consolidación: overhead sin beneficio claro (la lista final ya tiene el resultado)
- No consolidar (lista plana): lista inutilizable con duplicados

## R3: Categorías de compra

**Decision**: Usar MasterIngredient.category directamente (5 categorías del catálogo maestro)

**Rationale**:
- MasterIngredient (spec 005) ya define category como enum: `fruits_vegetables`, `meats`, `dairy`, `cereals`, `other`
- Estas 5 categorías son suficientes para organizar la compra en supermercado
- No se crea un sistema de categorías adicional — se reutiliza lo existente
- El orden de presentación es fijo: frutas/verduras → carnes → lácteos → cereales → otros
- Ingredientes sin categoría asignada → default a `other`

**Alternatives considered**:
- Categorías definidas por el usuario: complejidad innecesaria para MVP
- Más granularidad (10+ categorías): la spec define exactamente 5
- Categorías basadas en pasillo de supermercado: demasiado específico y variable entre tiendas

## R4: Marcado "ya lo tengo" (available at home)

**Decision**: Campo binario `status` en ShoppingItem con valor `available_at_home`

**Rationale**:
- La spec es explícita: marcado binario (lo tengo / no lo tengo)
- No hay inventario/despensa persistente — es marcado puntual por lista
- Items marcados como "available_at_home" se muestran en sección separada "Cubierto" pero permanecen en la lista
- El usuario puede desmarcar (volver a pending) si cambia la situación
- Estado del item: `pending` → `available_at_home` (o → `bought`)
- Los items `available_at_home` no se eliminan al regenerar la lista (se preservan)

**Alternatives considered**:
- Eliminar items de la lista al marcarlos: pierde información, no permite desmarcar
- Sistema de cantidades parciales ("tengo 200g de 500g"): fuera de alcance explícitamente
- Despensa persistente entre semanas: fuera de alcance del MVP

## R5: Checklist colaborativo en tiempo real

**Decision**: WatermelonDB sync + Supabase Realtime subscriptions con last-write-wins por item

**Rationale**:
- WatermelonDB maneja la persistencia local y el sync push/pull con Supabase
- Supabase Realtime (PostgreSQL LISTEN/NOTIFY) notifica cambios entre dispositivos
- Cada ShoppingItem es independiente → no hay conflictos posibles a nivel de item
- Si dos usuarios modifican el mismo item simultáneamente → last-write-wins (timestamp)
- En la práctica, dos usuarios en el supermercado tachan items DIFERENTES (se reparten pasillos)
- El caso edge (mismo item) se resuelve trivialmente con LWW

**Sync flow**:
```
User A marks item X as "bought"
  → WatermelonDB updates local
  → Push to Supabase
  → Supabase Realtime notifies User B
  → User B's WatermelonDB pulls update
  → UI re-renders with item X as "bought"
```

**Latency target**: <500ms end-to-end en condiciones normales de red

**Alternatives considered**:
- CRDTs para resolución de conflictos: overkill, no hay conflictos reales (items son independientes)
- Polling periódico: latencia inaceptable para uso simultáneo en supermercado
- Firebase Realtime Database: descartado en R2 de spec 001 (NoSQL no ideal)

## R6: Manejo de cambio de menú

**Decision**: Regeneración selectiva preservando items bought/available

**Rationale**:
- Cuando el menú aprobado cambia (spec 002 `ApprovalService.replaceApproved`), la lista debe actualizarse
- El sistema regenera la lista de ingredientes desde el nuevo menú
- Items ya marcados como `bought` o `available_at_home` NO se revierten (el usuario ya los tiene)
- Solo los items `pending` se recalculan (pueden aparecer nuevos, pueden desaparecer viejos)
- Se muestra un diff al usuario: "Se añadieron X items, se eliminaron Y items"
- Si un item `pending` ya no es necesario con el nuevo menú → se elimina
- Si un item `bought` ya no es necesario → se mantiene (ya se compró, no podemos des-comprarlo)

**Regeneration algorithm**:
```
1. Generate new ingredient set from new menu
2. Compare with existing list items
3. For items in BOTH sets → keep (update quantity if changed)
4. For items ONLY in new set → add as pending
5. For items ONLY in old set:
   - If pending → remove
   - If bought/available → keep (warn user)
6. Show diff summary to user
```

**Alternatives considered**:
- Borrar lista completa y regenerar: pierde estado de bought/available
- No actualizar la lista al cambiar menú: lista queda desincronizada
- Actualización automática silenciosa: confuso para el usuario (items aparecen/desaparecen sin aviso)

## R7: Recetas sin ingredientes mapeados

**Decision**: Omitir contribución de la receta y añadir warning a la lista

**Rationale**:
- Puede haber recetas en el catálogo que aún no tienen todos sus ingredientes mapeados a MasterIngredient
- En ese caso, la receta se omite de la generación (no aporta items a la lista)
- Se registra el nombre de la receta en `ShoppingList.unmappedRecipes[]`
- Se muestra un aviso al usuario: "X platos no pudieron incluirse en la lista porque no tienen ingredientes en el catálogo"
- Esto es un estado transitorio: cuando se mapeen los ingredientes, la próxima generación los incluirá

**Behavior**:
- PlannedMeal → Recipe → RecipeIngredients is empty → skip, add to unmappedRecipes
- PlannedMeal → Recipe → some RecipeIngredients have no MasterIngredient → include what's mapped, note partial coverage
- All ingredients mapped → normal generation

**Alternatives considered**:
- Bloquear generación si hay recetas sin mapear: impide uso parcial de la lista
- Incluir ingredientes como texto libre sin MasterIngredient: rompe consolidación y categorización

## R8: Generación offline

**Decision**: Generación completa desde datos locales de WatermelonDB

**Rationale**:
- WatermelonDB contiene copia local de: PlannedMeal, Recipe, RecipeIngredient, MasterIngredient
- Estos datos se sincronizan periódicamente (spec 005 catálogo, spec 002 menú aprobado)
- La generación de lista es un cálculo puro sobre datos locales — no necesita backend
- El flujo normal intenta primero confirmar con backend (NFR-001 de la spec)
- Si no hay conexión → genera desde datos locales directamente
- La lista generada offline se sincronizará cuando haya conexión

**Offline guarantees**:
- Generación: ✅ funciona sin conexión (datos locales)
- Visualización de lista: ✅ datos locales
- Marcar bought/available: ✅ local, sync posterior
- Colaboración en tiempo real: ❌ requiere conexión (graceful degradation: cambios locales se sincronizan al reconectar)

**Alternatives considered**:
- Requerir conexión para generar lista: contradice principio offline-first
- Cache selectivo solo de ingredientes: insuficiente si no están las recetas
