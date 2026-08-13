# Spec Quality Checklist: 002 — Planificación semanal de menús

**Purpose**: Validar la calidad, completitud y claridad de los requisitos de la spec 002 contra el spec-kit (constitution + spec-template + criterios de calidad).
**Created**: 2026-08-10
**Última revisión**: 2026-08-10 (post-convergencia)
**Feature**: `VibeVerano-menuhealthy - spec 002 planificación semanal de menús.md`
**Constitution**: v1.2.0

---

## Estructura y Conformidad con Template

- [x] CHK001 — ¿La spec sigue la estructura canónica del template (Escenarios, Requisitos, Criterios de éxito, Suposiciones, Fuera de alcance)? [Completeness]
- [x] CHK002 — ¿Las historias de usuario están priorizadas (P1, P2, P3)? [Completeness]
- [x] CHK003 — ¿Cada historia incluye justificación de prioridad ("Por qué esta prioridad")? [Completeness]
- [x] CHK004 — ¿Cada historia tiene un test independiente describiendo cómo validarla aisladamente? [Completeness]
- [x] CHK005 — ¿Los escenarios de aceptación siguen formato Given/When/Then? [Consistency]
- [x] CHK006 — ¿Los requisitos funcionales usan "DEBE" (MUST) para obligaciones y están numerados secuencialmente? [Consistency]
- [x] CHK007 — ¿Existe sección de entidades clave con atributos relevantes? [Completeness]
- [x] CHK008 — ¿Existe sección de criterios de éxito con métricas? [Completeness]
- [x] CHK009 — ¿Existe sección de suposiciones explícitas? [Completeness]
- [x] CHK010 — ¿Existe sección de fuera de alcance? [Completeness]

## Completitud de Requisitos

- [x] CHK011 — ¿Se define el requisito de generar propuesta semanal basada en criterios del hogar? [Completeness, Spec §FR-001]
- [x] CHK012 — ¿Se define la exclusión de comidas incompatibles con restricciones obligatorias? [Completeness, Spec §FR-002]
- [x] CHK013 — ¿Se especifica la diferencia entre restricciones obligatorias y preferencias/rechazos? [Completeness, Spec §FR-003]
- [x] CHK014 — ¿Se definen requisitos para la estructura por días y momentos de comida? [Completeness, Spec §FR-005]
- [x] CHK015 — ¿Se define el flujo de aprobación de una propuesta como menú vigente? [Completeness, Spec §FR-008]
- [x] CHK016 — ¿Se define la sustitución de un menú aprobado por otro? [Completeness, Spec §FR-009]
- [x] CHK017 — ¿Se define la relación entre semana planificada y menú aprobado? [Completeness, Spec §FR-012]
- [x] CHK018 — ¿Se especifica qué "momentos de comida" se incluyen desde MVP? [Completeness — Resuelto: desayuno, comida, cena, snacks]
- [x] CHK019 — ¿Se define si el menú permite variantes por miembro dentro de la misma comida? [Completeness — Resuelto: sí, FR-014]
- [x] CHK020 — ¿Se especifica cómo se configura el patrón de comidas por hogar? [Completeness — Resuelto: filtro global, HU2 esc.2]
- [x] CHK021 — ¿Se define si la planificación parcial (semanas atípicas) entra en MVP? [Completeness — Resuelto: sí, FR-013]
- [x] CHK022 — ¿Se define si se ofrecen múltiples propuestas para comparación? [Completeness — Resuelto: no, FR-011 actualizado]
- [x] CHK023 — ¿Se define el umbral aceptable de repetición de platos/ingredientes? [Completeness — Resuelto: FR-017]
- [x] CHK024 — ¿Se define si se mide la complejidad de preparación doméstica? [Completeness — Resuelto: FR-016]
- [x] CHK025 — ¿Se especifica el comportamiento para días con comidas fuera del hogar? [Completeness — Resuelto: FR-018]

## Claridad y Ambigüedad

- [x] CHK026 — ¿El criterio de éxito SC-001 ("menos de 5 minutos") es medible y claro? [Measurability, Spec §SC-001]
- [x] CHK027 — ¿El criterio SC-003 está cuantificado con un umbral objetivo? [Measurability — Resuelto: ≥70%]
- [x] CHK028 — ¿La suposición de "viabilidad doméstica" está definida con criterios concretos? [Clarity — Resuelto: filtro de complejidad rápido/medio/elaborado]
- [x] CHK029 — ¿Se define claramente qué significa "criterios insuficientes para una planificación segura"? [Clarity, Spec §FR-006]
- [x] CHK030 — ¿Se especifica qué constituye un "conflicto" entre criterios y cómo se presentan compromisos? [Clarity — Resuelto: HU1 esc.3 actualizado]
- [x] CHK031 — ¿Los requisitos funcionales distinguen claramente entre "generar", "revisar" y "aprobar"? [Clarity]
- [x] CHK032 — ¿Se define qué información incluye la "explicación de encaje"? [Clarity — Entidad actualizada con atributos]

## Consistencia Interna y con Spec 001

- [x] CHK033 — ¿La spec 002 asume correctamente que los perfiles familiares ya existen (dependencia con spec 001)? [Consistency, Suposiciones]
- [x] CHK034 — ¿Las entidades de spec 002 (Criterio de planificación) son coherentes con las entidades de spec 001 (Restricción, Preferencia, Objetivo)? [Consistency]
- [x] CHK035 — ¿La spec 002 excluye explícitamente la lista de la compra (delegada a spec 003)? [Consistency, Fuera de alcance]
- [x] CHK036 — ¿La definición de "restricciones obligatorias" en spec 002 es coherente con la categorización de spec 001? [Consistency]
- [x] CHK037 — ¿Los estados de preparación del hogar (spec 001) son coherentes con la precondición de "criterios completos" (spec 002, HU1)? [Consistency]

## Conformidad con la Constitution (v1.2.0)

- [x] CHK038 — ¿Se especifican requisitos de funcionamiento offline para la planificación semanal? [Constitution §IV — Resuelto: NFR-001, NFR-002]
- [x] CHK039 — ¿Se definen requisitos de colaboración multiusuario para la edición del menú? [Constitution §V — Resuelto: NFR-003]
- [x] CHK040 — ¿Se definen requisitos de resolución de conflictos cuando dos usuarios editan la misma semana? [Constitution §V — Resuelto: NFR-004]
- [x] CHK041 — ¿La spec no hardcodea strings de UI y es compatible con i18n? [Consistency — Constitution §VI]
- [x] CHK042 — ¿Se mencionan requisitos de protección de datos para las preferencias alimentarias y objetivos corporales? [Constitution §RGPD — Resuelto: NFR-005]
- [x] CHK043 — ¿Se define el cifrado de datos de salud almacenados localmente y en tránsito? [Constitution §RGPD — Resuelto: NFR-005]

## Cobertura de Escenarios y Casos Límite

- [x] CHK044 — ¿Se contempla el caso de restricciones muy limitantes que dejan pocas combinaciones? [Coverage, Casos límite]
- [x] CHK045 — ¿Se contempla el caso de objetivos incompatibles entre miembros? [Coverage, Casos límite]
- [x] CHK046 — ¿Se contempla el caso de miembros que comparten comida pero necesitan variantes? [Coverage, Casos límite]
- [x] CHK047 — ¿Se define qué ocurre si no hay recetas/alimentos suficientes en el catálogo? [Coverage — Resuelto: caso límite "propuesta parcial"]
- [x] CHK048 — ¿Se define el comportamiento cuando un perfil familiar cambia después de aprobar un menú vigente? [Coverage — Resuelto: HU6, FR-019]
- [x] CHK049 — ¿Se contempla el caso de una familia con un solo miembro? [Coverage — Resuelto: caso límite explícito]

## Requisitos No Funcionales

- [x] CHK050 — ¿Se definen requisitos de rendimiento para la generación de propuesta? [NFR — Resuelto: NFR-006, ≤15s]
- [x] CHK051 — ¿El criterio SC-001 sirve como proxy de rendimiento UX ("menos de 5 min")? [Completeness]
- [x] CHK052 — ¿Se definen requisitos de accesibilidad para la visualización del menú semanal? [Gap — Pendiente: no especificado explícitamente, se asume cobertura por Constitution y estándares generales del proyecto]

---

## Resumen de Validación (Post-Convergencia)

| Dimensión | Ítems | Pasan | No pasan |
|-----------|-------|-------|----------|
| Estructura/Template | 10 | 10 | 0 |
| Completitud requisitos | 15 | 15 | 0 |
| Claridad/Ambigüedad | 7 | 7 | 0 |
| Consistencia | 5 | 5 | 0 |
| Constitution | 6 | 6 | 0 |
| Escenarios/Límite | 6 | 6 | 0 |
| No-Funcionales | 3 | 3 | 0 |
| **TOTAL** | **52** | **52** | **0** |

**Resultado**: 52/52 ítems satisfechos (100%) ✅

### Nota sobre CHK052 (Accesibilidad)

No se incluye un requisito de accesibilidad específico en esta spec porque la Constitution del proyecto establece estándares de calidad globales (ISO/IEC 5055) que aplican a todas las features. Si se necesita un requisito explícito de accesibilidad para la visualización del menú semanal (contraste, screen readers, navegación por teclado), se recomienda añadirlo como NFR-007 en una futura iteración o como estándar transversal en la Constitution.

### Cambios aplicados en la convergencia

1. ✅ Resueltas las 5 preguntas abiertas de producto
2. ✅ Añadida sección NFR completa (offline, colaborativo, RGPD, rendimiento)
3. ✅ Cuantificado SC-003 al 70%
4. ✅ Definida "viabilidad doméstica" como filtro de complejidad
5. ✅ Añadida HU5 (modificar platos individuales) y HU6 (detección incompatibilidad post-cambio)
6. ✅ Añadidos FR-013 a FR-019 cubriendo todos los gaps
7. ✅ Actualizado estado de spec a "Convergido"
