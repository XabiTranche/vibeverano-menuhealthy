# Research: Ajustes, sustituciones y seguimiento del menú

**Feature**: 004-ajustes-sustituciones-y-seguimiento
**Date**: 2026-08-10

## R1: Flujo de sustitución de comidas

**Decision**: Usuario selecciona comida → elige nueva receta libremente → sistema valida restricciones obligatorias → si válido: aplica, si inválido: bloquea con explicación

**Rationale**:
- El usuario tiene control total sobre la elección (FR-003): no se limita a sugerencias del sistema
- La validación es posterior a la elección, no previa (no se filtran recetas disponibles)
- Si la nueva receta viola una restricción obligatoria → bloqueo con mensaje claro indicando qué restricción se incumple (FR-002)
- Si es válida → se aplica directamente al PlannedMeal, sin afectar al resto del menú (FR-004)
- El flujo es idéntico para menús en revisión (draft) y aprobados (approved), con la diferencia de que la sincronización de lista solo ocurre en menús aprobados

**Alternatives considered**:
- Sugerencias automáticas: descartado por complejidad y porque limita la libertad del usuario
- Filtrar catálogo por compatibilidad: descartado; mejor mostrar todo y validar después (más transparente)
- Validación previa (solo mostrar recetas compatibles): demasiado restrictivo, oculta opciones al usuario

## R2: Validación de restricciones en sustitución

**Decision**: SubstitutionService carga restricciones del miembro (spec 001) y verifica CompatibilityTags de la nueva receta (spec 005). Solo restricciones MANDATORY bloquean. Objetivos y preferencias generan avisos informativos (FR-012).

**Rationale**:
- RestrictionValidatorService recibe: memberId (o memberIds si plato compartido) + newRecipeId
- Carga `DietaryRestriction` con severity=mandatory del miembro (vía CriteriaService de spec 001)
- Obtiene `CompatibilityTags` de la receta (spec 005): lista de alérgenos, categorías de ingredientes
- Match: si alguna restricción mandatory coincide con un tag de la receta → bloqueo
- Para preferencias (disliked con intensity=strong) → warning informativo, no bloqueo
- Para objetivos nutricionales (ej: receta alta en calorías + miembro con lose_weight) → warning informativo
- Todo funciona offline porque restricciones y recetas están cacheadas localmente (WatermelonDB)

**Alternatives considered**:
- Bloquear también por preferencias fuertes: demasiado restrictivo, viola FR-003 (libertad de elección)
- No validar preferencias/objetivos: se pierde feedback útil al usuario
- Motor de reglas externo: overkill para MVP, las reglas son simples (match de tags)

## R3: Sincronización de lista de compra tras cambio

**Decision**: Cuando sustitución se confirma en menú aprobado, invocar ListGeneratorService.regenerateList() de spec 003. Solo items pendientes se actualizan. Items ya comprados (tachados) se preservan. Se muestra diff de ingredientes añadidos/eliminados.

**Rationale**:
- FR-005: actualizar parte pendiente (no tachada) de la lista
- FR-006: avisar si cambio afecta a items ya comprados (no eliminarlos)
- FR-007: mostrar qué se añadió/eliminó
- ListSyncService actúa como adaptador entre SubstitutionService y ListGeneratorService (spec 003)
- Flujo: confirmar sustitución → ListSyncService calcula diff de ingredientes → invoca regeneración parcial → retorna diff al UI
- Solo se ejecuta para menús aprobados (pre-aprobación no tiene lista generada aún)
- Se ejecuta async para no bloquear la confirmación de la sustitución

**Alternatives considered**:
- Recalcular toda la lista desde cero: pierde estado de items tachados, ineficiente
- No actualizar automáticamente (manual): viola FR-005
- Actualizar solo al abrir la lista: retrasa el feedback, peor UX

## R4: Contador de sustituciones y sugerencia de regeneración

**Decision**: Contador por semana almacenado en SubstitutionCounter. Al alcanzar ≥5, mostrar sugerencia "Quizás sea mejor regenerar el menú completo" (FR-011). La sugerencia es informativa, no bloquea.

**Rationale**:
- El umbral de 5 sustituciones indica que el menú original no encajó bien con la semana real
- SubstitutionCounter persiste el count por weekId para sobrevivir reinicios de app
- Campo `regenerationSuggested: boolean` evita mostrar la sugerencia repetidamente tras dismissal
- El usuario puede seguir haciendo sustituciones puntuales sin límite
- La sugerencia enlaza a la acción de regenerar menú completo (spec 002)

**Alternatives considered**:
- Bloquear a partir de N sustituciones: viola la libertad del usuario
- No contar: se pierde oportunidad de feedback útil
- Umbral dinámico según tamaño de familia: sobreingeniería para MVP, 5 es razonable para todos

## R5: Registro de señales de ajuste

**Decision**: Cada sustitución crea un SubstitutionSignal con {originalRecipeId, newRecipeId, mealType, reason (opcional), memberId, familyId, weekId, timestamp}. Motivos opcionales: gusto, falta_ingredientes, tiempo, rechazo_infantil, otro. NO se usa para aprendizaje automático en MVP.

**Rationale**:
- FR-009 y FR-010: registrar señal + motivo opcional
- Los motivos predefinidos cubren los casos más comunes sin sobrecargar al usuario
- El campo reason es nullable (el usuario puede omitirlo)
- familyId se incluye para queries futuras de aprendizaje por hogar
- En MVP solo se almacenan; no alimentan ningún motor de recomendación
- SignalRecorderService se ejecuta post-confirmación, no bloquea el flujo principal

**Alternatives considered**:
- Motivo obligatorio: friction innecesaria, el usuario quiere cambiar rápido
- Texto libre para motivo: difícil de agregar/analizar en el futuro
- No registrar en MVP: perdería datos valiosos para el futuro

## R6: Histórico de menú (original vs. ajustado)

**Decision**: En la primera modificación de una semana, hacer snapshot del PlannedMeal[] original como "versión original". Los ajustes posteriores modifican directamente el PlannedMeal (versión actual). Ambas versiones se conservan por semana. MenuHistory vincula weekId → originalMeals[] (JSON snapshot) + timestamp del snapshot.

**Rationale**:
- FR-008: conservar original y final
- El snapshot se crea lazy (solo si se hace al menos un ajuste) → no overhead para semanas sin cambios
- originalMeals es un JSON estático (array de PlannedMeal serializados en el momento del snapshot)
- La "versión actual" siempre es el estado live de PlannedMeal[] para ese weekId
- Ahorra espacio: no se snapshottea cada cambio intermedio, solo el original
- MenuHistory tiene constraint UNIQUE(weekId) → un solo snapshot por semana

**Alternatives considered**:
- Event sourcing completo (cada cambio como evento): demasiado complejo para MVP
- Snapshot en cada sustitución: costoso en espacio, innecesario (basta original vs. actual)
- No conservar original: viola FR-008

## R7: Pre-aprobación vs. post-aprobación

**Decision**: El mismo SubstitutionService maneja ambos casos. Si el menú está en draft (pre-aprobación), los cambios se aplican sobre la propuesta directamente. Si el menú está aprobado (post-aprobación), los cambios actualizan el PlannedMeal activo. La sincronización de lista solo se dispara para menús aprobados.

**Rationale**:
- El flujo de validación de restricciones es idéntico en ambos casos
- La diferencia es solo en efectos secundarios:
  - Draft: no list sync (no hay lista generada), no counter increment significativo
  - Approved: list sync + counter increment + señal registrada con más peso
- SubstitutionService lee el estado del WeeklyMenu (spec 002) para determinar si es draft o approved
- Simplifica la implementación: un solo punto de entrada para toda sustitución

**Alternatives considered**:
- Servicios separados para pre/post: duplicación innecesaria
- Ignorar pre-aprobación (solo permitir cambios post-aprobación): limita la flexibilidad del flujo de planificación

## R8: Avisos informativos para criterios no obligatorios

**Decision**: Cuando una sustitución pasa las restricciones obligatorias pero conflicta con preferencias o objetivos, mostrar warning dismissable con detalle (FR-012). Ejemplos: "Este plato tiene más calorías que el anterior" o "Este plato no es una preferencia de María". El warning no bloquea.

**Rationale**:
- Respetar FR-003 (libertad de elección) pero informar para decisiones conscientes
- ValidationResult incluye array de Warning[] con type, message y severity='info'
- La pantalla SubstitutionConfirm muestra warnings como banners dismissables
- El usuario puede confirmar la sustitución ignorando warnings
- Los warnings se registran en MealAdjustment.validationResult para trazabilidad

**Alternatives considered**:
- No mostrar warnings: el usuario pierde información útil
- Warnings como step adicional obligatorio: añade friction innecesaria
- Modal de confirmación por cada warning: demasiado intrusivo para avisos informativos
