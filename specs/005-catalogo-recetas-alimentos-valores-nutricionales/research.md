# Research: Catálogo de recetas, alimentos y valores nutricionales

**Feature**: 005-catalogo-recetas-alimentos-valores-nutricionales
**Date**: 2026-08-10

## R1: Full-text search en WatermelonDB

**Decision**: Q.like para búsqueda por nombre + compound queries para filtrado por ingrediente/tag

**Rationale**:
- WatermelonDB no soporta FTS (Full-Text Search) nativo como SQLite FTS5
- Para el volumen esperado (≤500 recetas por hogar), `Q.like('%término%')` es suficiente y cumple <3s
- Búsqueda por nombre: `Q.where('name', Q.like(`%${sanitized}%`))`
- Búsqueda por ingrediente: query en RecipeIngredient → join con MasterIngredient por `canonicalName`
- Filtrado por tag: query directa en CompatibilityTag/GoalTag por `recipeId`
- Combinación de filtros: `Q.and(...)` para queries compuestas (nombre + mealType + tag)
- Índices en `name`, `canonicalName`, `recipeId` garantizan rendimiento

**Alternatives considered**:
- FlexSearch/Lunr.js en memoria: overhead innecesario para ≤500 registros, complica sync
- SQLite FTS5 directo: requiere salir de WatermelonDB, rompe observable queries
- Búsqueda solo server-side: incompatible con offline-first

## R2: Catálogo maestro de ingredientes

**Decision**: Seeded desde JSON asset bundleado, sincronizado via Supabase, ~500 ingredientes base

**Rationale**:
- El catálogo maestro debe estar disponible offline desde el primer uso (NFR-002)
- Se distribuye como `seeds/master-ingredients.json` dentro del bundle de la app
- En primera ejecución, se insertan los ingredientes en WatermelonDB local
- Actualizaciones del catálogo se entregan via Supabase sync (nuevos ingredientes, correcciones)
- Estructura por ingrediente: nombre canónico, sinónimos[], categoría, valores nutricionales por 100g
- Categorías alineadas con spec 003 (lista de compra):
  - `fruits_vegetables` (frutas y verduras)
  - `meats` (carnes y pescados)
  - `dairy` (lácteos)
  - `cereals` (cereales y legumbres)
  - `other` (otros: aceites, especias, condimentos, etc.)
- Los sinónimos permiten búsqueda flexible: "tomate" = "jitomate" = "tomato"

**Alternatives considered**:
- Descargar catálogo desde API en primer uso: falla si no hay conexión inicial
- Catálogo mínimo local + expansión online: experiencia degradada offline
- Sin catálogo maestro (texto libre): imposibilita normalización para spec 003 y tag inference

## R3: Catálogo base de recetas (~50 recetas precargadas)

**Decision**: Bundled como JSON asset, read-only; usuarios copian al catálogo familiar para personalizar

**Rationale**:
- Reduce barrera de entrada: nuevo usuario puede planificar menús inmediatamente
- Se distribuye como `seeds/base-recipes.json` — separado del catálogo maestro
- Las recetas base son read-only: no se pueden editar ni eliminar del catálogo base
- Para personalizar, el usuario "copia" una receta base a su catálogo familiar (FR-017)
- La copia mantiene referencia al original (`baseRecipeId`) pero es independiente
- Actualizaciones del catálogo base via Supabase no afectan copias ya personalizadas
- Las recetas base cubren los 4 tipos de comida equilibradamente (~12 por tipo)
- Cada receta base incluye ingredientes del catálogo maestro, raciones, nutricional y tags

**Alternatives considered**:
- Insertar recetas base directamente en catálogo familiar: confuso, mezcla contenido propio con precargado
- Catálogo base como entidad separada sin posibilidad de copiar: limita personalización
- Sin catálogo base: barrera de entrada alta, usuario debe crear todo desde cero

## R4: Lógica de inferencia de etiquetas (TagInferenceService)

**Decision**: Reglas basadas en composición de ingredientes (compatibilidad) y valores nutricionales (objetivos)

**Rationale**:
- **Etiquetas de compatibilidad** (inferidas automáticamente):
  - Cada ingrediente del catálogo maestro tiene metadata de alérgenos/restricciones asociadas
  - Al añadir/modificar ingredientes de una receta, se evalúan las reglas:
    - Contiene trigo/cebada/centeno → incompatible con "sin_gluten"
    - Contiene leche/queso/yogur → incompatible con "sin_lactosa"
    - Contiene carne/pescado → incompatible con "vegetariano"/"vegano"
    - Contiene productos animales → incompatible con "vegano"
  - Resultado: lista de restricciones con las que la receta ES compatible
  - Origin = "inferred"; el usuario puede override (origin = "manual")

- **Etiquetas de objetivo** (sugeridas):
  - Basadas en valores nutricionales totales de la receta POR RACIÓN:
    - Proteínas >30g/ración → "alta_en_proteina"
    - Calorías <300 kcal/ración → "baja_en_calorias"
    - Grasas <10g/ración → "baja_en_grasas"
    - Fibra >8g/ración → "alta_en_fibra" (post-MVP, requiere campo adicional)
  - Origin = "suggested"; el usuario acepta/rechaza/añade manualmente (origin = "manual")

- Las reglas se implementan como funciones puras en `utils/tag-rules.ts` para facilitar testing
- Se re-evalúan al guardar/editar receta (no en tiempo real durante edición)

**Alternatives considered**:
- ML/clasificación automática: overkill para MVP, requiere datos de entrenamiento
- Solo etiquetas manuales: no cumple FR-011 y FR-013
- Evaluación en tiempo real: overhead innecesario, confuso durante edición parcial

## R5: Protección de recetas en uso (ProtectionService)

**Decision**: Query a planificaciones activas (spec 002) antes de permitir eliminación; notificación en edición

**Rationale**:
- Al intentar eliminar: ProtectionService consulta MealPlanSlot (spec 002) buscando `recipeId` en planes activos
- Si encontrado → bloqueo con mensaje indicando qué planificación(es) la usan
- Si no encontrado → eliminación permitida tras confirmación del usuario
- Al editar receta en uso: no se bloquea la edición, pero se muestra notificación (FR-005)
  - Opción 1: aplicar cambios a la planificación activa
  - Opción 2: mantener versión anterior en la planificación (snapshot)
- "Plan activo" = plan semanal cuya fecha de fin ≥ hoy (no planes pasados)
- Dependencia con spec 002: ProtectionService importa repository de MealPlan

**Alternatives considered**:
- Soft-delete siempre (nunca borrar): acumula datos innecesarios
- Permitir borrado con cascade: rompe planificaciones activas
- Versionado completo de recetas: demasiado complejo para MVP

## R6: Entrada de datos nutricionales

**Decision**: Manual en MVP, almacenado por ingrediente con campos estándar

**Rationale**:
- En MVP no hay integración con API externa (decisión explícita en spec)
- Se almacenan 4 campos por ingrediente (en NutritionalInfo):
  - `kcal`: calorías (kilocalorías)
  - `carbs`: carbohidratos (gramos)
  - `fat`: grasas (gramos)
  - `protein`: proteínas (gramos)
- Dos niveles de almacenamiento:
  - `MasterIngredient.nutritionalPer100g`: valores por 100g (referencia del catálogo maestro)
  - `RecipeIngredient.nutritionalForQuantity`: valores para la cantidad usada en la receta (manual)
- El aporte nutricional total de la receta se introduce manualmente (no se calcula como suma)
- Los valores pueden quedar en null/0 si el usuario no los conoce (no obligatorios)
- El catálogo maestro viene pre-rellenado con valores nutricionales de los ~500 ingredientes base

**Alternatives considered**:
- Cálculo automático (suma de ingredientes): fuera de MVP, requiere conversión de unidades compleja
- Solo a nivel de receta (sin por ingrediente): pierde granularidad para tag inference
- Campos obligatorios: barrera de entrada demasiado alta
