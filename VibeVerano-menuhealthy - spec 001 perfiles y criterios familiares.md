---
type: project-note
status: active
date: 2026-07-17
source: openclaw
tags: [project, sdd, spec, menufamiliareshealthy, vibeverano]
---
# VibeVerano-menuhealthy - spec 001 perfiles y criterios familiares

## Fuente original
- `shared/output/spec-sdd/menufamiliareshealthy/001-perfiles-y-criterios-familiares/spec.md`

## Contenido promovido

# Especificación de Feature: Perfiles familiares y criterios alimentarios

**Rama**: `001-perfiles-y-criterios-familiares`
**Creada**: 2026-07-17
**Estado**: Borrador
**Input**: Descripción del usuario: "una aplicación que ayudara a planificar los menús familiares teniendo en cuenta distintos criterios: necesidades nutricionales, preferencias alimentarias, restricciones, objetivos (perder peso, ganar masa muscular, etc.) e incluso que generase automáticamente la lista de la compra a partir del menú semanal."

## Escenarios de usuario y pruebas *(obligatorio)*

### Historia de Usuario 1 - Registrar miembros de la familia (Prioridad: P1)

Como persona responsable de organizar la alimentación en casa, quiero registrar a cada miembro de la familia con su información relevante, para que el sistema planifique menús realistas para todos.

**Por qué esta prioridad**: sin miembros ni contexto familiar, el sistema no puede personalizar nada con sentido.

**Test independiente**: crear una unidad familiar con varios miembros y comprobar que cada uno queda identificado y disponible para planificación posterior.

**Escenarios de aceptación**:
1. **Dado** una familia que empieza a usar la aplicación, **Cuando** la persona responsable añade a cada miembro con su nombre o rol dentro del hogar, **Entonces** el sistema guarda a todos los miembros dentro de la misma unidad familiar.
2. **Dado** un miembro ya creado, **Cuando** la persona responsable edita su información básica, **Entonces** el sistema actualiza el perfil sin afectar al resto de miembros.
3. **Dado** un miembro que ya no forma parte del hogar o no debe incluirse en la planificación, **Cuando** la persona responsable lo desactiva o elimina, **Entonces** el sistema deja de tenerlo en cuenta en planes futuros. [NECESITA ACLARACIÓN: si se permite borrado total o solo archivado]

### Historia de Usuario 2 - Definir restricciones, preferencias y aversiones (Prioridad: P1)

Como responsable del menú familiar, quiero indicar restricciones, alimentos preferidos y alimentos rechazados de cada miembro, para evitar propuestas inviables o conflictivas.

**Por qué esta prioridad**: una propuesta nutricionalmente correcta pero que choque con alergias o rechazo familiar fracasa en la práctica.

**Test independiente**: configurar alergias, intolerancias, preferencias y alimentos rechazados y comprobar que quedan diferenciados por miembro.

**Escenarios de aceptación**:
1. **Dado** un miembro con alergia o intolerancia, **Cuando** la persona responsable registra esa restricción, **Entonces** el sistema la marca como obligatoria para futuras propuestas.
2. **Dado** un miembro con preferencias alimentarias concretas, **Cuando** se guardan sus gustos y rechazos, **Entonces** el sistema los conserva como criterio de personalización.
3. **Dado** una preferencia que entra en conflicto con una restricción, **Cuando** se intenta guardar, **Entonces** el sistema prioriza la restricción y advierte de la incoherencia.

### Historia de Usuario 3 - Definir objetivos nutricionales o de composición corporal (Prioridad: P1)

Como responsable del menú, quiero indicar objetivos como perder peso, mantenerlo o ganar masa muscular para miembros concretos o para el hogar, para que el plan semanal no sea solo cómodo sino alineado con lo que queremos conseguir.

**Por qué esta prioridad**: los objetivos cambian el tipo de propuesta y son parte central del valor prometido.

**Test independiente**: asignar objetivos distintos a varios miembros y comprobar que el sistema los refleja como criterios activos.

**Escenarios de aceptación**:
1. **Dado** un miembro con objetivo de perder peso, **Cuando** se guarda su objetivo, **Entonces** el sistema lo incorpora como criterio de planificación.
2. **Dado** un miembro con objetivo de ganar masa muscular, **Cuando** se guarda su objetivo, **Entonces** el sistema lo trata como distinto de un objetivo de mantenimiento o pérdida de peso.
3. **Dado** objetivos distintos dentro de una misma familia, **Cuando** se completa la configuración, **Entonces** el sistema conserva los objetivos por miembro y no obliga a un único objetivo común.
4. **Dado** que el sistema necesita más precisión para interpretar un objetivo, **Cuando** falta información mínima, **Entonces** solicita o marca como pendiente la información necesaria. [NECESITA ACLARACIÓN: qué nivel de detalle inicial se exigirá]

### Historia de Usuario 4 - Revisar si la familia está lista para planificar (Prioridad: P2)

Como responsable del hogar, quiero saber si ya he completado los datos mínimos para generar un menú fiable, para no recibir propuestas basadas en información incompleta.

**Por qué esta prioridad**: evita planes defectuosos por falta de contexto y reduce frustración temprana.

**Test independiente**: dejar perfiles incompletos y comprobar que el sistema distingue entre configuración suficiente e insuficiente.

**Escenarios de aceptación**:
1. **Dado** una familia con miembros creados pero sin restricciones ni objetivos completos, **Cuando** la persona responsable revisa el estado de configuración, **Entonces** el sistema muestra qué datos faltan para planificar con seguridad.
2. **Dado** una familia con todos los criterios mínimos cubiertos, **Cuando** revisa el estado, **Entonces** el sistema la marca como lista para pasar a planificación semanal.

### Casos límite

- Miembros con varias restricciones simultáneas.
- Restricciones incompatibles entre sí dentro de la misma familia.
- Preferencias muy diferentes entre adultos y niños.
- Objetivos opuestos entre miembros del hogar.
- Un miembro sin datos suficientes para estimar necesidades. [NECESITA ACLARACIÓN: qué datos son obligatorios en MVP]
- Familias monoparentales, hogares de una sola persona o custodias alternas. [NECESITA ACLARACIÓN: si entran desde MVP]

## Requisitos *(obligatorio)*

### Requisitos funcionales

- **FR-001**: El sistema DEBE permitir crear una unidad familiar con uno o más miembros.
- **FR-002**: El sistema DEBE permitir registrar y editar un perfil individual por miembro del hogar.
- **FR-003**: El sistema DEBE permitir asociar restricciones alimentarias obligatorias a cada miembro.
- **FR-004**: El sistema DEBE permitir asociar preferencias alimentarias y alimentos rechazados a cada miembro.
- **FR-005**: El sistema DEBE diferenciar entre criterios obligatorios y criterios deseables.
- **FR-006**: El sistema DEBE permitir definir uno o varios objetivos alimentarios o corporales por miembro o perfil familiar. [NECESITA ACLARACIÓN: si también habrá objetivos a nivel familiar]
- **FR-007**: El sistema DEBE detectar incoherencias básicas entre criterios guardados.
- **FR-008**: El sistema DEBE mostrar qué información mínima falta antes de permitir una planificación fiable.
- **FR-009**: El sistema DEBE permitir dejar información opcional incompleta sin bloquear el alta del hogar.
- **FR-010**: El sistema DEBE conservar el historial vigente de criterios para usarlos en futuras planificaciones. [NECESITA ACLARACIÓN: si hace falta versionado histórico real]

### Entidades clave *(incluir si la feature maneja datos)*

- **Unidad familiar**: grupo de convivencia para el que se planifica. Atributos clave: nombre o identificador del hogar, responsable principal, miembros activos.
- **Miembro familiar**: persona incluida en la planificación. Atributos clave: nombre o rol, tramo de edad [NECESITA ACLARACIÓN: si se recogerá], criterios activos, estado dentro del hogar.
- **Restricción alimentaria**: condición obligatoria que excluye ciertos alimentos o preparaciones. Atributos clave: tipo de restricción, severidad [NECESITA ACLARACIÓN: si se recogerá], miembro asociado.
- **Preferencia alimentaria**: gusto, rechazo o patrón deseado no obligatorio. Atributos clave: alimento o categoría, nivel de preferencia, miembro asociado.
- **Objetivo nutricional**: resultado deseado para una persona o familia. Atributos clave: tipo de objetivo, prioridad, horizonte temporal [NECESITA ACLARACIÓN: si se recogerá], ámbito de aplicación.
- **Estado de preparación para planificar**: validación de si el hogar tiene datos suficientes para generar menús. Atributos clave: completo/incompleto, faltantes detectados.

## Criterios de éxito *(obligatorio)*

### Resultados medibles

- **SC-001**: La persona responsable puede dejar configurada una unidad familiar básica en menos de 15 minutos.
- **SC-002**: El 90% de las planificaciones posteriores se genera con perfiles familiares completos según los mínimos definidos.
- **SC-003**: Las restricciones obligatorias quedan reflejadas sin ambigüedad para todos los miembros activos del hogar.
- **SC-004**: La persona responsable entiende claramente qué datos faltan antes de pedir su primer menú.

## Suposiciones

- Existe una persona responsable que configura inicialmente el hogar.
- Un mismo hogar puede tener miembros con necesidades diferentes.
- No todas las preferencias tienen el mismo peso que una alergia o intolerancia.
- Queda FUERA de alcance en esta spec la generación del menú y la lista de la compra.
- La interpretación nutricional detallada se resolverá en specs posteriores.

## Fuera de alcance inicial

- Generar el menú semanal.
- Calcular lista de la compra.
- Gestionar compras, presupuesto o supermercados.
- Seguimiento clínico o sanitario profesional.

## Preguntas abiertas

1. ¿Qué datos mínimos debe tener cada miembro desde el primer día: edad, sexo, peso, altura, actividad, solo objetivo u otro set?
2. ¿Se quiere distinguir entre alergias, intolerancias, restricciones éticas/religiosas y simples preferencias?
3. ¿Los objetivos se definirán solo por etiquetas simples o también con metas cuantificadas?
4. ¿Debe existir perfil específico para niños con reglas distintas?
5. ¿Hace falta contemplar custodias alternas o semanas con miembros no presentes?
