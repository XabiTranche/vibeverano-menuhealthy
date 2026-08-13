# Spec Quality Checklist: 004 — Ajustes, sustituciones y seguimiento

**Purpose**: Validar la calidad, completitud y claridad de los requisitos de la spec 004 contra el spec-kit (constitution + spec-template + criterios de calidad).
**Created**: 2026-08-10
**Última revisión**: 2026-08-10 (post-convergencia)
**Feature**: `VibeVerano-menuhealthy - spec 004 ajustes sustituciones y seguimiento.md`
**Constitution**: v1.2.0

---

## Estructura y Conformidad con Template

- [x] CHK001 — ¿La spec sigue la estructura canónica del template? [Completeness]
- [x] CHK002 — ¿Las historias de usuario están priorizadas (P1, P2)? [Completeness]
- [x] CHK003 — ¿Cada historia incluye justificación de prioridad? [Completeness]
- [x] CHK004 — ¿Cada historia tiene un test independiente? [Completeness]
- [x] CHK005 — ¿Los escenarios de aceptación siguen formato Given/When/Then? [Consistency]
- [x] CHK006 — ¿Los requisitos funcionales usan "DEBE" y están numerados? [Consistency]
- [x] CHK007 — ¿Existe sección de entidades clave con atributos? [Completeness]
- [x] CHK008 — ¿Existe sección de criterios de éxito? [Completeness]
- [x] CHK009 — ¿Existe sección de suposiciones? [Completeness]
- [x] CHK010 — ¿Existe sección de fuera de alcance? [Completeness]

## Completitud de Requisitos

- [x] CHK011 — ¿Se define la capacidad de sustituir una comida concreta? [Completeness, Spec §FR-001]
- [x] CHK012 — ¿Se define la validación de restricciones en sustituciones? [Completeness, Spec §FR-002]
- [x] CHK013 — ¿Se define la actualización de lista de compra tras cambio? [Completeness, Spec §FR-005]
- [x] CHK014 — ¿Se define si las sustituciones se ofrecen automáticamente o son manuales? [Completeness — Resuelto: manuales, FR-003]
- [x] CHK015 — ¿Se define si se recoge el motivo del cambio? [Completeness — Resuelto: opcional, FR-010]
- [x] CHK016 — ¿Se define si el aprendizaje entra en MVP o solo se registran señales? [Completeness — Resuelto: solo registro, FR-009]
- [x] CHK017 — ¿Se define si se mantiene histórico de menús? [Completeness — Resuelto: sí, FR-008]
- [x] CHK018 — ¿Se define el nivel de detalle del seguimiento semanal? [Completeness — Resuelto: fuera MVP, detalle por miembro futuro]
- [x] CHK019 — ¿Se resuelve si FR-007 (señales para recomendaciones) aplica en MVP? [Completeness — Resuelto: solo registro]
- [x] CHK020 — ¿Se resuelve si FR-008 (cumplimiento) entra en MVP? [Completeness — Resuelto: fuera MVP]
- [x] CHK021 — ¿Se define comportamiento de la lista tras cambio con items tachados? [Completeness — Resuelto: FR-005/FR-006]

## Claridad y Ambigüedad

- [x] CHK022 — ¿El criterio SC-001 ("menos de 2 minutos") es medible? [Measurability]
- [x] CHK023 — ¿El criterio SC-002 ("100% coherencia") es medible? [Measurability]
- [x] CHK024 — ¿El criterio SC-003 (lista refleja cambios) tiene umbral cuantificado? [Measurability — Resuelto: 100%]
- [x] CHK025 — ¿El criterio SC-004 (histórico conservado) es medible? [Measurability — 100% semanas con cambios]
- [x] CHK026 — ¿La entidad "Ajuste de menú" tiene definido si recoge motivo? [Clarity — Resuelto: opcional con motivos predefinidos]

## Consistencia con Specs Anteriores

- [x] CHK027 — ¿La spec 004 asume el menú de spec 002? [Consistency]
- [x] CHK028 — ¿La actualización de lista es coherente con spec 003? [Consistency]
- [x] CHK029 — ¿Se resuelve el solapamiento con spec 002 HU5? [Consistency — Resuelto: spec 004 absorbe, spec 002 delega]
- [x] CHK030 — ¿Se clarifica la frontera pre/post-aprobación? [Clarity — Resuelto: ambas cubiertas por spec 004]

## Conformidad con la Constitution (v1.2.0)

- [x] CHK031 — ¿Se especifican requisitos offline? [Constitution §IV — Resuelto: NFR-001, NFR-002]
- [x] CHK032 — ¿Se definen requisitos colaborativos? [Constitution §V — Resuelto: NFR-003, NFR-004]
- [x] CHK033 — ¿Se definen requisitos de resolución de conflictos? [Constitution §V — Resuelto: merge + last-write-wins]
- [x] CHK034 — ¿La spec no hardcodea strings de UI? [Consistency — Constitution §VI]
- [x] CHK035 — ¿Se mencionan requisitos RGPD? [Constitution §RGPD — Resuelto: NFR-005]

## Cobertura de Escenarios y Casos Límite

- [x] CHK036 — ¿Se contempla cambio cuando ya se hizo la compra? [Coverage]
- [x] CHK037 — ¿Se contempla sustituciones que empeoran objetivo nutricional? [Coverage — FR-012 aviso informativo]
- [x] CHK038 — ¿Se contempla varias sustituciones encadenadas? [Coverage — FR-011 umbral 5]
- [x] CHK039 — ¿Se contempla cambio de plato compartido vs. solo un miembro? [Coverage]
- [x] CHK040 — ¿Se define qué pasa con lista parcialmente usada? [Coverage — Resuelto: FR-005/FR-006]
- [x] CHK041 — ¿Se define límite de sustituciones? [Coverage — Resuelto: 5, FR-011]

## Requisitos No Funcionales

- [x] CHK042 — ¿Se define rendimiento para la sustitución? [NFR — Resuelto: NFR-006, ≤3s]
- [x] CHK043 — ¿Se define persistencia offline de ajustes? [NFR — Resuelto: NFR-001]

---

## Resumen de Validación (Post-Convergencia)

| Dimensión | Ítems | Pasan | No pasan |
|-----------|-------|-------|----------|
| Estructura/Template | 10 | 10 | 0 |
| Completitud requisitos | 11 | 11 | 0 |
| Claridad/Ambigüedad | 5 | 5 | 0 |
| Consistencia | 4 | 4 | 0 |
| Constitution | 5 | 5 | 0 |
| Escenarios/Límite | 6 | 6 | 0 |
| No-Funcionales | 2 | 2 | 0 |
| **TOTAL** | **43** | **43** | **0** |

**Resultado**: 43/43 ítems satisfechos (100%) ✅

### Cambios aplicados en la convergencia

1. ✅ Resueltas las 5 preguntas abiertas de producto
2. ✅ Absorbida HU5 de spec 002 (sustitución de platos) — spec 002 actualizada para delegar
3. ✅ Definido modelo de sustitución: usuario elige libremente, sistema valida restricciones
4. ✅ Motivo del cambio: opcional con categorías predefinidas
5. ✅ Aprendizaje: solo registro de señales en MVP
6. ✅ Histórico menú original vs. ajustado: se conserva siempre
7. ✅ Seguimiento/cumplimiento: fuera MVP, con detalle por miembro cuando entre
8. ✅ Umbral de sustituciones: 5 cambios → sugerencia de regenerar
9. ✅ Lista parcialmente usada: se actualiza solo lo pendiente, aviso de inconsistencias
10. ✅ Añadida sección NFR completa (offline, colaborativo, RGPD, rendimiento)
11. ✅ SC-003 y SC-004 cuantificados al 100%
12. ✅ Estado actualizado a "Convergido"
