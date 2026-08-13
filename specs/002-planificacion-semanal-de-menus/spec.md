# Especificación de Feature: Planificación semanal de menús familiares

**Feature Branch**: `002-planificacion-semanal-de-menus`
**Creada**: 2026-07-17
**Estado**: Convergido
**Última revisión**: 2026-08-10
**Input**: Descripción del usuario: "una aplicación que ayudara a planificar los menús familiares teniendo en cuenta distintos criterios: necesidades nutricionales, preferencias alimentarias, restricciones, objetivos (perder peso, ganar masa muscular, etc.) e incluso que generase automáticamente la lista de la compra a partir del menú semanal."

## Escenarios de usuario y pruebas *(obligatorio)*

### Historia de Usuario 1 - Generar un menú semanal compatible con la familia (Prioridad: P1)

Como responsable de la alimentación del hogar, quiero obtener un menú semanal que respete las restricciones, preferencias y objetivos de la familia, para dejar resuelta la semana con una propuesta usable.

**Por qué esta prioridad**: es el núcleo del producto; sin menú semanal no existe el valor principal.

**Test independiente**: partir de una familia ya configurada, generar un menú de siete días y comprobar que la propuesta cubre las comidas previstas sin violar restricciones obligatorias.

**Escenarios de aceptación**:
1. **Dado** una familia con criterios completos, **Cuando** la persona responsable solicita un menú semanal, **Entonces** el sistema genera una propuesta para toda la semana respetando restricciones y objetivos activos.
2. **Dado** una familia con criterios insuficientes para una planificación segura, **Cuando** solicita un menú semanal, **Entonces** el sistema no genera la propuesta final y señala qué información falta.
3. **Dado** criterios familiares muy limitantes, **Cuando** el sistema no encuentra una propuesta plenamente compatible, **Entonces** informa del conflicto y presenta compromisos explícitos indicando qué criterios no obligatorios se han relajado.

### Historia de Usuario 2 - Distribuir comidas a lo largo de la semana (Prioridad: P1)

Como responsable del menú, quiero ver el plan organizado por días y momentos de comida, para entender de un vistazo qué toca preparar cada día.

**Por qué esta prioridad**: un menú sin estructura diaria no sirve para la operativa real del hogar.

**Test independiente**: generar una semana y comprobar que cada día tiene las comidas esperadas (desayuno, comida, cena, snacks) y que pueden revisarse una a una.

**Escenarios de aceptación**:
1. **Dado** una propuesta semanal generada, **Cuando** la persona responsable la visualiza, **Entonces** el sistema muestra las comidas organizadas por día y por momento de consumo (desayuno, comida, cena, snacks).
2. **Dado** que el hogar tiene configurado un patrón de comidas global (ej: "entre semana sin snack de mañana"), **Cuando** se genera la planificación, **Entonces** el sistema adapta la estructura semanal al patrón configurado.
3. **Dado** una semana parcial o atípica, **Cuando** se solicita la planificación, **Entonces** el sistema permite planificar solo el tramo temporal deseado (ej: de miércoles a domingo).

### Historia de Usuario 3 - Explicar por qué una propuesta encaja (Prioridad: P2)

Como persona que decide si acepta el menú, quiero entender por qué una propuesta es adecuada para mi familia, para confiar en ella y ajustarla con criterio si hace falta.

**Por qué esta prioridad**: aumenta confianza y reduce la sensación de caja negra.

**Test independiente**: abrir una propuesta semanal y comprobar que cada menú o la semana completa incluye una explicación legible de encaje.

**Escenarios de aceptación**:
1. **Dado** una propuesta semanal generada, **Cuando** la persona responsable revisa el plan, **Entonces** el sistema explica de forma comprensible qué criterios importantes ha respetado.
2. **Dado** una propuesta que prioriza ciertos objetivos sobre otros, **Cuando** se muestra la explicación, **Entonces** el sistema indica ese equilibrio de forma explícita.

### Historia de Usuario 4 - Aprobar un menú como base operativa de la semana (Prioridad: P1)

Como responsable del hogar, quiero aprobar un menú semanal cuando me convenza, para convertirlo en la referencia oficial de esa semana y poder generar la compra a partir de él.

**Por qué esta prioridad**: conecta la planificación con la ejecución posterior de la compra y evita trabajar sobre borradores.

**Test independiente**: generar una propuesta, aprobarla y comprobar que queda marcada como menú vigente de esa semana.

**Escenarios de aceptación**:
1. **Dado** una propuesta semanal satisfactoria, **Cuando** la persona responsable la aprueba, **Entonces** el sistema la marca como menú activo para esa semana.
2. **Dado** una propuesta ya aprobada, **Cuando** se sustituye por otra, **Entonces** el sistema actualiza el menú vigente y deja claro que el anterior ya no es el activo.

### Historia de Usuario 5 - Detectar incompatibilidad por cambio de perfil (Prioridad: P2)

Como responsable del hogar, quiero ser avisado si un cambio en los perfiles familiares hace que el menú vigente pueda ser incompatible, para decidir si replanificar.

**Por qué esta prioridad**: evita que un menú aprobado siga vigente cuando ya no es seguro para la familia.

**Test independiente**: aprobar un menú, añadir una nueva alergia a un miembro y comprobar que el menú vigente muestra un aviso de posible incompatibilidad.

**Escenarios de aceptación**:
1. **Dado** un menú vigente aprobado, **Cuando** un perfil familiar cambia (ej: se añade una alergia), **Entonces** el sistema marca el menú con un aviso de posible incompatibilidad.
2. **Dado** un menú marcado como posiblemente incompatible, **Cuando** el usuario lo revisa, **Entonces** puede decidir replanificar o mantenerlo bajo su responsabilidad.

### Casos límite

- Restricciones que dejan muy pocas combinaciones viables.
- Familias con objetivos incompatibles entre sí.
- Miembros que comparten comida principal pero requieren variantes (ej: plato base con adaptación por intolerancia).
- Semanas con días fuera de casa: el usuario marca esos días/comidas como "fuera" y no se planifican.
- Repetición de platos: un mismo plato NO debe repetirse en comidas y cenas dentro de la misma semana. En desayunos y snacks SÍ se permite repetición.
- Complejidad de preparación: se aplica un filtro global por hogar (rápido/medio/elaborado, configurable por tramo semanal, ej: "entre semana rápido, fin de semana elaborado").
- Familia con un solo miembro (soportado desde MVP, coherente con spec 001).
- Catálogo insuficiente de recetas/alimentos para cubrir todos los días (el sistema informa y genera propuesta parcial).

## Requisitos *(obligatorio)*

### Requisitos funcionales

- **FR-001**: El sistema DEBE generar una propuesta de menú semanal basada en los criterios activos del hogar.
- **FR-002**: El sistema DEBE excluir de las propuestas cualquier comida incompatible con restricciones obligatorias.
- **FR-003**: El sistema DEBE tener en cuenta preferencias y rechazos como criterio de priorización, aunque no sean obligatorios.
- **FR-004**: El sistema DEBE considerar objetivos nutricionales o corporales activos al construir la propuesta semanal.
- **FR-005**: El sistema DEBE estructurar la propuesta por días y momentos de comida: desayuno, comida, cena y snacks.
- **FR-006**: El sistema DEBE indicar cuándo no puede generar una propuesta plenamente compatible y explicar el motivo.
- **FR-007**: El sistema DEBE permitir revisar una propuesta antes de aprobarla.
- **FR-008**: El sistema DEBE permitir aprobar una propuesta semanal como menú vigente.
- **FR-009**: El sistema DEBE permitir sustituir una propuesta aprobada por otra nueva para la misma semana.
- **FR-010**: El sistema DEBE mostrar una explicación legible de por qué una propuesta encaja con los criterios principales.
- **FR-011**: El sistema DEBE generar una sola propuesta por solicitud. El usuario modifica platos individuales si no le convence (no se generan múltiples alternativas completas).
- **FR-012**: El sistema DEBE conservar la relación entre semana planificada y menú aprobado.
- **FR-013**: El sistema DEBE permitir planificar tramos parciales de semana (no solo semanas naturales completas).
- **FR-014**: El sistema DEBE permitir variantes por miembro dentro de una misma comida cuando las restricciones u objetivos lo requieran.
- **FR-015**: El sistema DEBE aplicar un filtro de complejidad de preparación configurado como preferencia global del hogar (rápido/medio/elaborado), con posibilidad de diferenciar entre semana y fin de semana.
- **FR-016**: El sistema DEBE evitar repetir el mismo plato en comidas y cenas dentro de la misma semana. En desayunos y snacks se permite repetición.
- **FR-020**: El sistema DEBE generar comidas solo para los momentos de comida activos configurados en el hogar (spec 001 FR-011). Si un momento está desactivado, no se genera slot para él.
- **FR-021**: El sistema DEBE usar el tiempo de preparación de las recetas (spec 005 FR-022) como base para aplicar el filtro de complejidad: quick (<30 min), medium (30-60 min), elaborate (>60 min).
- **FR-017**: El sistema DEBE permitir marcar días o comidas individuales como "fuera de casa" para excluirlas de la planificación.
- **FR-018**: El sistema DEBE marcar un menú vigente con un aviso de posible incompatibilidad cuando un perfil familiar cambie después de la aprobación. El menú sigue vigente hasta que el usuario actúe.
- **FR-019**: La modificación de platos individuales (sustituciones tanto pre como post-aprobación) se define en spec 004.

### Requisitos no funcionales

- **NFR-001 (Offline-first)**: La generación de propuestas DEBE intentar primero la llamada al backend. Si no hay conexión, el sistema DEBE utilizar un motor local como fallback para generar propuestas basadas en datos disponibles en el dispositivo.
- **NFR-002 (Offline-first)**: La visualización, edición y aprobación de propuestas ya generadas DEBE funcionar sin conexión a internet.
- **NFR-003 (Colaborativo)**: Cuando varios miembros del hogar editan el menú de la misma semana simultáneamente, el sistema DEBE realizar merge automático si los cambios no solapan (ej: uno edita martes, otro edita jueves).
- **NFR-004 (Colaborativo)**: Si los cambios simultáneos solapan (mismo día/comida), el sistema DEBE notificar el conflicto al segundo usuario y pedir resolución manual.
- **NFR-005 (RGPD)**: Los datos de criterios alimentarios, restricciones de salud y objetivos corporales utilizados en la planificación DEBEN almacenarse cifrados tanto en reposo (dispositivo) como en tránsito (comunicación con backend).
- **NFR-006 (Rendimiento)**: La generación de propuesta con conexión al backend DEBE completarse en menos de 15 segundos para un hogar estándar (≤6 miembros, semana completa).

### Entidades clave *(incluir si la feature maneja datos)*

- **Semana planificada**: periodo temporal sobre el que se construye el menú. Atributos clave: fechas de inicio y fin (permite tramos parciales), estado (borrador/aprobado/incompatible), hogar asociado.
- **Propuesta de menú**: borrador de planificación semanal. Atributos clave: semana, comidas propuestas, criterios considerados, estado de aprobación, timestamp de generación.
- **Comida planificada**: unidad de planificación dentro de un día. Atributos clave: día, momento de comida (desayuno/comida/cena/snack), preparación propuesta, variantes por miembro si aplica, estado (planificada/fuera de casa).
- **Criterio de planificación**: conjunto de restricciones, preferencias y objetivos usados para generar la propuesta. Atributos clave: tipo, peso relativo, miembro o hogar asociado.
- **Explicación de encaje**: resumen entendible del porqué de la propuesta. Atributos clave: criterios satisfechos, conflictos detectados, compromisos aplicados.
- **Configuración de complejidad**: preferencia global del hogar. Atributos clave: nivel por defecto (rápido/medio/elaborado), excepciones por tramo (entre semana/fin de semana).

## Criterios de éxito *(obligatorio)*

### Resultados medibles

- **SC-001**: La persona responsable obtiene una propuesta semanal usable en menos de 5 minutos desde que inicia la planificación.
- **SC-002**: El 95% de los menús aprobados respeta todas las restricciones obligatorias registradas.
- **SC-003**: Al menos el 70% de semanas aprobadas no requiere rehacer el plan completo desde cero (solo ajustes de platos individuales).
- **SC-004**: La persona responsable entiende por qué se ha propuesto el menú sin necesidad de soporte externo.

## Suposiciones

- Los perfiles familiares ya existen y están suficientemente configurados (spec 001 completada).
- La planificación principal es semanal, pero se permite flexibilidad en el tramo de días.
- La viabilidad doméstica se define mediante el filtro de complejidad de preparación configurado por el hogar (rápido/medio/elaborado) como proxy de esfuerzo.
- Queda FUERA de alcance en esta spec la generación de lista de la compra detallada (spec 003).
- La validación clínica profesional no forma parte del alcance inicial.
- El presupuesto semanal queda FUERA del MVP.
- El catálogo de recetas/alimentos (spec 005) debe existir con datos mínimos para que la generación funcione.
- Los momentos de comida a planificar dependen de la configuración del hogar (spec 001 FR-011, campo activeMealTypes).

## Fuera de alcance inicial

- Compra online automática.
- Seguimiento médico o terapéutico.
- Ajuste automático por stock doméstico salvo que se defina en otra spec.
- Cocina paso a paso o recetas extendidas (la app recomienda platos del catálogo, no guías de preparación detalladas).
- Presupuesto semanal como criterio de filtrado.
- Generación de múltiples propuestas completas para comparación.

## Preguntas abiertas (resueltas)

1. ~~¿Qué momentos de comida deben entrar desde MVP?~~ → **Desayuno, comida, cena y snacks.**
2. ~~¿El menú debe ser único para toda la familia o permitir variantes por miembro?~~ → **Permite variantes por miembro dentro de la misma comida.**
3. ~~¿Debe tenerse en cuenta tiempo de preparación, presupuesto o nivel de complejidad?~~ → **Sí, complejidad de preparación como filtro global del hogar (rápido/medio/elaborado, configurable por tramo). Presupuesto fuera de MVP.**
4. ~~¿Se quiere ofrecer una sola propuesta o varias alternativas por semana?~~ → **Una sola propuesta. El usuario modifica platos individuales si no le convence, con sugerencias compatibles.**
5. ~~¿La app debe cubrir solo una semana natural o también semanas parciales?~~ → **Se permite planificar tramos parciales.**
