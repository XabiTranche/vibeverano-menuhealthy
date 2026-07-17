---
type: project-note
status: active
date: 2026-07-17
source: openclaw
tags: [project, sdd, spec, menufamiliareshealthy, vibeverano]
---
# VibeVerano-menuhealthy - spec 002 planificación semanal de menús

## Fuente original
- `shared/output/spec-sdd/menufamiliareshealthy/002-planificacion-semanal-de-menus/spec.md`

## Contenido promovido

# Especificación de Feature: Planificación semanal de menús familiares

**Rama**: `002-planificacion-semanal-de-menus`
**Creada**: 2026-07-17
**Estado**: Borrador
**Input**: Descripción del usuario: "una aplicación que ayudara a planificar los menús familiares teniendo en cuenta distintos criterios: necesidades nutricionales, preferencias alimentarias, restricciones, objetivos (perder peso, ganar masa muscular, etc.) e incluso que generase automáticamente la lista de la compra a partir del menú semanal."

## Escenarios de usuario y pruebas *(obligatorio)*

### Historia de Usuario 1 - Generar un menú semanal compatible con la familia (Prioridad: P1)

Como responsable de la alimentación del hogar, quiero obtener un menú semanal que respete las restricciones, preferencias y objetivos de la familia, para dejar resuelta la semana con una propuesta usable.

**Por qué esta prioridad**: es el núcleo del producto; sin menú semanal no existe el valor principal.

**Test independiente**: partir de una familia ya configurada, generar un menú de siete días y comprobar que la propuesta cubre las comidas previstas sin violar restricciones obligatorias.

**Escenarios de aceptación**:
1. **Dado** una familia con criterios completos, **Cuando** la persona responsable solicita un menú semanal, **Entonces** el sistema genera una propuesta para toda la semana respetando restricciones y objetivos activos.
2. **Dado** una familia con criterios insuficientes para una planificación segura, **Cuando** solicita un menú semanal, **Entonces** el sistema no genera la propuesta final y señala qué información falta.
3. **Dado** criterios familiares muy limitantes, **Cuando** el sistema no encuentra una propuesta plenamente compatible, **Entonces** informa del conflicto y presenta alternativas o compromisos explícitos. [NECESITA ACLARACIÓN: si debe proponer compromisos automáticos]

### Historia de Usuario 2 - Distribuir comidas a lo largo de la semana (Prioridad: P1)

Como responsable del menú, quiero ver el plan organizado por días y momentos de comida, para entender de un vistazo qué toca preparar cada día.

**Por qué esta prioridad**: un menú sin estructura diaria no sirve para la operativa real del hogar.

**Test independiente**: generar una semana y comprobar que cada día tiene las comidas esperadas y que pueden revisarse una a una.

**Escenarios de aceptación**:
1. **Dado** una propuesta semanal generada, **Cuando** la persona responsable la visualiza, **Entonces** el sistema muestra las comidas organizadas por día y por momento de consumo.
2. **Dado** que el hogar no realiza el mismo número de comidas todos los días, **Cuando** se define la planificación, **Entonces** el sistema adapta la estructura semanal al patrón esperado. [NECESITA ACLARACIÓN: cómo se configurará el patrón de comidas]
3. **Dado** una semana parcial o atípica, **Cuando** se solicita la planificación, **Entonces** el sistema permite planificar solo el tramo temporal deseado. [NECESITA ACLARACIÓN: si entra en MVP]

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
2. **Dado** varias propuestas generadas para la misma semana, **Cuando** se aprueba una, **Entonces** el sistema identifica claramente cuál es la vigente.
3. **Dado** una propuesta ya aprobada, **Cuando** se sustituye por otra, **Entonces** el sistema actualiza el menú vigente y deja claro que el anterior ya no es el activo.

### Casos límite

- Restricciones que dejan muy pocas combinaciones viables.
- Familias con objetivos incompatibles entre sí.
- Miembros que comparten comida principal pero requieren variantes.
- Semanas con días fuera de casa o comidas no realizadas en el hogar. [NECESITA ACLARACIÓN: si se contemplan]
- Repetición excesiva de platos o ingredientes. [NECESITA ACLARACIÓN: umbral aceptable]
- Propuestas nutricionalmente correctas pero poco realistas en esfuerzo doméstico. [NECESITA ACLARACIÓN: si se medirá complejidad de preparación]

## Requisitos *(obligatorio)*

### Requisitos funcionales

- **FR-001**: El sistema DEBE generar una propuesta de menú semanal basada en los criterios activos del hogar.
- **FR-002**: El sistema DEBE excluir de las propuestas cualquier comida incompatible con restricciones obligatorias.
- **FR-003**: El sistema DEBE tener en cuenta preferencias y rechazos como criterio de priorización, aunque no sean obligatorios.
- **FR-004**: El sistema DEBE considerar objetivos nutricionales o corporales activos al construir la propuesta semanal.
- **FR-005**: El sistema DEBE estructurar la propuesta por días y momentos de comida.
- **FR-006**: El sistema DEBE indicar cuándo no puede generar una propuesta plenamente compatible y explicar el motivo.
- **FR-007**: El sistema DEBE permitir revisar una propuesta antes de aprobarla.
- **FR-008**: El sistema DEBE permitir aprobar una propuesta semanal como menú vigente.
- **FR-009**: El sistema DEBE permitir sustituir una propuesta aprobada por otra nueva para la misma semana.
- **FR-010**: El sistema DEBE mostrar una explicación legible de por qué una propuesta encaja con los criterios principales.
- **FR-011**: El sistema DEBE permitir generar más de una propuesta para comparación. [NECESITA ACLARACIÓN: si entra en MVP]
- **FR-012**: El sistema DEBE conservar la relación entre semana planificada y menú aprobado.

### Entidades clave *(incluir si la feature maneja datos)*

- **Semana planificada**: periodo temporal sobre el que se construye el menú. Atributos clave: fechas, estado, hogar asociado.
- **Propuesta de menú**: borrador de planificación semanal. Atributos clave: semana, comidas propuestas, criterios considerados, estado de aprobación.
- **Comida planificada**: unidad de planificación dentro de un día. Atributos clave: día, momento de comida, preparación propuesta, miembros afectados.
- **Criterio de planificación**: conjunto de restricciones, preferencias y objetivos usados para generar la propuesta. Atributos clave: tipo, peso relativo, miembro o hogar asociado.
- **Explicación de encaje**: resumen entendible del porqué de la propuesta. Atributos clave: criterios satisfechos, conflictos detectados, compromisos aplicados.

## Criterios de éxito *(obligatorio)*

### Resultados medibles

- **SC-001**: La persona responsable obtiene una propuesta semanal usable en menos de 5 minutos desde que inicia la planificación.
- **SC-002**: El 95% de los menús aprobados respeta todas las restricciones obligatorias registradas.
- **SC-003**: La mayoría de semanas aprobadas no requiere rehacer el plan completo desde cero. [NECESITA ACLARACIÓN: umbral objetivo]
- **SC-004**: La persona responsable entiende por qué se ha propuesto el menú sin necesidad de soporte externo.

## Suposiciones

- Los perfiles familiares ya existen y están suficientemente configurados.
- La planificación principal es semanal.
- La propuesta debe priorizar viabilidad doméstica además de alineación nutricional. [NECESITA ACLARACIÓN: cómo se definirá viabilidad]
- Queda FUERA de alcance en esta spec la generación de lista de la compra detallada.
- La validación clínica profesional no forma parte del alcance inicial.

## Fuera de alcance inicial

- Compra online automática.
- Seguimiento médico o terapéutico.
- Ajuste automático por stock doméstico salvo que se defina en otra spec.
- Cocina paso a paso o recetas extendidas. [NECESITA ACLARACIÓN: si la app también recomendará recetas completas]

## Preguntas abiertas

1. ¿Qué momentos de comida deben entrar desde MVP: desayuno, comida, cena, snacks u otros?
2. ¿El menú debe ser único para toda la familia o permitir variantes por miembro dentro de la misma comida?
3. ¿Debe tenerse en cuenta tiempo de preparación, presupuesto o nivel de complejidad?
4. ¿Se quiere ofrecer una sola propuesta o varias alternativas por semana?
5. ¿La app debe cubrir solo una semana natural o también semanas parciales y planificación flexible?
