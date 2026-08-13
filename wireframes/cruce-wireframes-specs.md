# Cruce Wireframes ↔ Specs & Plans

**Fecha**: 2026-08-10
**Propósito**: Mapear cada pantalla diseñada en wireframes con las specs, historias de usuario, requisitos funcionales y contracts que la implementan. Detectar gaps y diferencias.

---

## 01 — Planificador Semanal → Spec 002 + Spec 004

| Elemento del wireframe | Spec / FR | Contrato/Servicio | Estado |
|------------------------|-----------|-------------------|--------|
| Vista 7 días × 4 momentos (desayuno, comida, cena, snack) | 002 FR-005 | PlannedMeal.mealType enum | ✅ Alineado |
| Selector de semana con flechas | 002 FR-013 (tramos parciales) | PlannedWeek.startDate/endDate | ✅ Alineado |
| Badge "En borrador / Aprobada / Modificada" | 002 FR-008, FR-009 | ApprovalService (draft/approved/replaced) | ⚠️ Parcial — wireframe muestra "Modificada" que no está en enum de estados. En spec 002 el estado post-ajuste sigue siendo `approved` hasta que se reemplace. Ver nota 1. |
| Botón "Aprobar semana" | 002 HU4, FR-008 | ApprovalService.approveProposal() | ✅ Alineado |
| Tarjetas de comida con nombre + badges kcal/proteínas | 002 HU2, 005 FR-010 | FamilyRecipe.nutritionalTotal | ✅ Alineado |
| Icono ⇄ para sustituir | **004** HU1, FR-001 | SubstitutionService.validateSubstitution() + applySubstitution() | ✅ Alineado — spec 004 absorbe esta funcionalidad |
| Slot vacío "+ Añadir comida" | 002 HU2 (estructura por slots) | PlanGeneratorService (generación) o navegación a catálogo | ✅ Alineado |
| Barra lateral de color por tipo de comida | UI design — no funcional | N/A | ✅ Decisión de diseño visual |
| Tab bar: Plan, Recetas, Compra, Familia | Navegación global | Todas las specs | ✅ Coherente con las 4 pantallas principales |

### Nota 1: Estado "Modificada"
El wireframe muestra un estado visual "Modificada" (cambios desde última aprobación). En el data model de spec 002, el PlannedWeek permanece en `approved` tras ajustes (spec 004 solo crea MealAdjustment). **Solución propuesta**: el badge "Modificada" se calcula en UI como `hasBeenModified(weekId)` de HistoryService (spec 004), no es un estado de PlannedWeek. ✅ Compatible.

---

## 02 — Catálogo de Recetas → Spec 005

| Elemento del wireframe | Spec / FR | Contrato/Servicio | Estado |
|------------------------|-----------|-------------------|--------|
| Barra de búsqueda por nombre o ingrediente | 005 HU2, FR-006 | RecipeService.searchRecipes(query) | ✅ Alineado |
| Filtros como chips (tipo comida, compatibilidad) | 005 HU2 FR-007, FR-020 | RecipeService.searchRecipes(filters) | ✅ Alineado |
| Tarjetas con nombre + badges + nutrición | 005 HU3, FR-008, FR-010 | FamilyRecipe entity | ✅ Alineado |
| Foto del plato (miniatura) | Diseño visual | FamilyRecipe — no tiene campo "photo" en data model | ⚠️ Gap — ver nota 2 |
| Badge "Dot verde" (receta en uso) | 005 HU5, FR-004 | ProtectionService / FamilyRecipe.inActivePlan (computed) | ✅ Alineado |
| Tiempo de preparación visible | Diseño — filtro de complejidad | 002 FR-016 (quick/medium/elaborate) | ⚠️ Parcial — wireframe muestra tiempo en minutos, spec 002 usa niveles (quick/medium/elaborate). Ver nota 3. |
| Botón "Nueva receta" | 005 HU1, FR-001 | RecipeService.createRecipe() | ✅ Alineado |
| Acceso contextual (desde planificador con filtro pre-aplicado) | UX flow | SearchQuery.mealType filter | ✅ Alineado |
| Etiquetas en femenino (Vegana, Vegetariana) | i18n | react-i18next gender-aware translations | ✅ Decisión de diseño i18n |

### Nota 2: Campo "foto" de receta
El wireframe muestra una miniatura por receta. El data model de spec 005 no incluye campo `photo/imageUrl` en FamilyRecipe. **Acción**: Añadir campo opcional `imageUrl: string?` a FamilyRecipe con placeholder de color cálido cuando es null (tal como indica el wireframe).

### Nota 3: Tiempo de preparación vs. nivel de complejidad
El wireframe muestra "⏱ 30 min" como tiempo explícito. El spec 002 usa niveles abstractos (quick/medium/elaborate) como filtro global del hogar. **Solución propuesta**: añadir campo `prepTimeMinutes: number?` a FamilyRecipe para display en catálogo. El filtro de complejidad del spec 002 puede derivarse: quick=<30min, medium=30-60min, elaborate=>60min. ✅ Compatible con ambas perspectivas.

---

## 03 — Detalle de Receta → Spec 005 + Spec 002

| Elemento del wireframe | Spec / FR | Contrato/Servicio | Estado |
|------------------------|-----------|-------------------|--------|
| Título + tipo de comida | 005 FR-001 | FamilyRecipe.name + .mealType | ✅ Alineado |
| Badges compatibilidad (Sin gluten, Alta en proteína) | 005 FR-011, FR-013 | CompatibilityTag + GoalTag | ✅ Alineado |
| Tiempo de preparación badge | Ver nota 3 arriba | prepTimeMinutes (propuesto) | ⚠️ Requiere campo adicional |
| Valores nutricionales (4 recuadros: kcal, carbos, grasas, proteína) | 005 FR-010, FR-009 | FamilyRecipe.nutritionalTotal (NutritionalInfo) | ✅ Alineado exactamente (mismos 4 campos) |
| Lista de ingredientes con cantidades | 005 FR-001 | RecipeIngredient (quantity + unit + ingredientId) | ✅ Alineado |
| Compatibilidad familiar (✓/⚠ por miembro) | 005 HU1 esc.2, FR-011 | TagInferenceService + cruce con CriteriaService (spec 001) | ✅ Alineado |
| Porciones | 005 FR-019 | FamilyRecipe.servings | ✅ Alineado |
| Indicador "En uso" (📅 días/momentos) | 005 HU5, FR-004 | ProtectionService → PlannedMeal query | ✅ Alineado |
| Botón "Añadir al plan" | Navegación → spec 002 | PlanGeneratorService o manual assignment | ✅ Alineado |
| Botón "Editar" | 005 FR-003 | RecipeService.updateRecipe() | ✅ Alineado |
| Botón "Eliminar" (disabled si en uso) | 005 FR-004 | RecipeService.deleteRecipe() → ProtectionService | ✅ Alineado exactamente |
| Foto grande del plato | Ver nota 2 arriba | imageUrl (propuesto) | ⚠️ Requiere campo adicional |

---

## 04 — Lista de la Compra → Spec 003

| Elemento del wireframe | Spec / FR | Contrato/Servicio | Estado |
|------------------------|-----------|-------------------|--------|
| Checklist con tap para tachar | 003 HU5, FR-009 | ChecklistService.markAsBought() | ✅ Alineado |
| Desmarcar item tachado | 003 HU5 esc.2 | ChecklistService.unmarkItem() | ✅ Alineado |
| Agrupación por categoría (VERDURAS, PROTEÍNAS, LÁCTEOS) | 003 HU3, FR-006 | ShoppingItem.category (5 categorías) | ⚠️ Parcial — wireframe usa "PROTEÍNAS", spec usa "meats" (carnes y pescados). Ver nota 4. |
| Contador progreso "3/14" | 003 SC-004 | ChecklistService.getProgress() | ✅ Alineado |
| Cantidades a la derecha (1 kg, 4 uds) | 003 FR-005 | ShoppingItem.approximateQuantity + unit | ✅ Alineado |
| Items tachados con fondo crema + texto muted | UI design | ShoppingItem.status = 'bought' | ✅ Decisión de diseño |
| Checkbox circular | UI design | N/A | ✅ Decisión de diseño |
| Sin acciones complejas (solo tap) | UX decision | ChecklistService interface simplificada | ✅ Alineado con filosofía |
| Aviso lista desactualizada | 003 FR-004 (regeneración) | ListGeneratorService.regenerateList() trigger | ✅ Alineado |
| Referencia temporal (semana) | 003 FR-002 | ShoppingList.weekId | ✅ Alineado |

### Nota 4: Nombre de categorías para display
Las categorías en el data model son enums técnicos (`fruits_vegetables`, `meats`, `dairy`, `cereals`, `other`). El wireframe usa nombres de display orientados al supermercado ("VERDURAS", "PROTEÍNAS", "LÁCTEOS"). **Solución**: i18n mapping — el enum se traduce a label de display via react-i18next. ✅ Coherente con Constitution §VI.

**Gap detectado**: El wireframe no muestra:
- Marcado "ya lo tengo" (FR-007) — ¿sería un gesto diferente al "comprado"? **Propuesta**: swipe left = "ya lo tengo", tap = "comprado". O bien un menú contextual al mantener presionado.
- Sección "Cubierto" (items available_at_home) — no está en el wireframe.

---

## 05 — Familia y Configuración → Spec 001

| Elemento del wireframe | Spec / FR | Contrato/Servicio | Estado |
|------------------------|-----------|-------------------|--------|
| Lista de miembros con avatar + nombre + edad | 001 HU1, FR-001, FR-002 | FamilyService.getActiveMembers() | ✅ Alineado |
| Badge de restricción por miembro | 001 HU2, FR-003 | CriteriaService.getMandatoryRestrictions() | ✅ Alineado |
| Objetivo nutricional visible | 001 HU3, FR-006 | CriteriaService.getActiveGoals() | ✅ Alineado |
| Flecha › para editar miembro | 001 FR-002 | FamilyService.updateMember() | ✅ Alineado |
| Banner "✓ Lista / ⚠ Faltan datos" | 001 HU4, FR-008 | ReadinessService.checkReadiness() | ✅ Alineado exactamente |
| Chips "Comidas del día" (toggle activo/inactivo) | Configuración del hogar | 002 FR-005 (momentos de comida) | ⚠️ Parcial — ver nota 5 |
| Resumen restricciones consolidado | 001 FR-003 (global view) | CriteriaService + query cross-member | ✅ Alineado |
| Botón "Añadir miembro" | 001 HU1, FR-001 | FamilyService.addMember() | ✅ Alineado |

### Nota 5: Chips "Comidas del día"
El wireframe muestra toggles para activar/desactivar qué momentos de comida se planifican (ej: desactivar snack). Este concepto no está formalizado como entidad en ninguna spec/plan. Se relaciona con:
- Spec 002 FR-005: estructura por momentos de comida
- El wireframe de spec 002 HU2 esc.2: "el hogar tiene configurado un patrón de comidas global"

**Acción propuesta**: Añadir a la entidad Family (spec 001) o como configuración del hogar un campo `activeMealTypes: MealType[]` que define qué slots se generan en el planificador.

---

## Resumen de Gaps y Acciones

| # | Gap | Wireframe | Spec/Plan | Acción propuesta |
|---|-----|-----------|-----------|------------------|
| 1 | Campo foto/imagen de receta | 02, 03 | 005 data-model sin `imageUrl` | Añadir `imageUrl: string?` a FamilyRecipe |
| 2 | Tiempo de preparación en minutos | 02, 03 | 002 usa niveles (quick/medium/elaborate) | Añadir `prepTimeMinutes: number?` a FamilyRecipe. Derivar nivel de complejidad: quick<30, medium 30-60, elaborate>60 |
| 3 | Configuración "Comidas del día" | 05 | No formalizado en entidad | Añadir `activeMealTypes: MealType[]` a Family o como nueva entidad de configuración |
| 4 | Gesto para "ya lo tengo" vs "comprado" | 04 | 003 FR-007 (available_at_home) | Definir UX: swipe vs tap vs menú contextual. Añadir al wireframe 04 |
| 5 | Estado visual "Modificada" en planificador | 01 | 004 HistoryService.hasBeenModified() | Calculado en UI, no requiere cambio en data model ✅ |

---

## Pantallas NO cubiertas por wireframes

| Funcionalidad (spec) | Pantalla necesaria | Prioridad |
|----------------------|-------------------|-----------|
| Formulario alta/edición de receta (005 HU1) | RecipeForm screen | P1 |
| Confirmación de sustitución con warnings (004 HU1) | SubstitutionConfirm screen | P1 |
| Historial de ajustes por semana (004 HU4) | AdjustmentHistory screen | P2 |
| Explicación de encaje del menú (002 HU3) | ExplanationPanel (dentro de planificador) | P2 |
| Detalle/edición de miembro individual (001 HU1-3) | MemberDetail screen | P1 |
| Catálogo base / recetas precargadas (005 HU4) | Sección dentro de catálogo o tab | P1 |
| Configuración de complejidad (002 FR-016) | Dentro de Familia/Config o modal | P2 |
