# Especificación de Feature: Perfiles familiares y criterios alimentarios

**Feature Branch**: `001-perfiles-y-criterios-familiares`
**Creada**: 2026-07-17
**Estado**: Convergido
**Última revisión**: 2026-08-10
**Input**: Descripción del usuario: "una aplicación que ayudara a planificar los menús familiares teniendo en cuenta distintos criterios: necesidades nutricionales, preferencias alimentarias, restricciones, objetivos (perder peso, ganar masa muscular, etc.) e incluso que generase automáticamente la lista de la compra a partir del menú semanal."

## Escenarios de usuario y pruebas *(obligatorio)*

### Historia de Usuario 1 - Registrar miembros de la familia (Prioridad: P1)

Como persona responsable de organizar la alimentación en casa, quiero registrar a cada miembro de la familia con su información relevante, para que el sistema planifique menús realistas para todos.

**Por qué esta prioridad**: sin miembros ni contexto familiar, el sistema no puede personalizar nada con sentido.

**Test independiente**: crear una unidad familiar con varios miembros y comprobar que cada uno queda identificado y disponible para planificación posterior.

**Escenarios de aceptación**:
1. **Dado** una familia que empieza a usar la aplicación, **Cuando** la persona responsable añade a cada miembro con su nombre o rol dentro del hogar, **Entonces** el sistema guarda a todos los miembros dentro de la misma unidad familiar.
2. **Dado** un miembro ya creado, **Cuando** la persona responsable edita su información básica, **Entonces** el sistema actualiza el perfil sin afectar al resto de miembros.
3. **Dado** un miembro que ya no forma parte del hogar o no debe incluirse en la planificación, **Cuando** la persona responsable lo desactiva, **Entonces** el sistema lo archiva (no se permite borrado total) y deja de tenerlo en cuenta en planes futuros, conservando su historial.

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
4. **Dado** que el sistema necesita más precisión para interpretar un objetivo, **Cuando** falta información mínima (nombre + edad + sexo + restricciones obligatorias), **Entonces** solicita o marca como pendiente la información necesaria.

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
- Un miembro sin datos suficientes para estimar necesidades (datos mínimos obligatorios: nombre, edad, sexo, restricciones).
- Familias monoparentales, hogares de una sola persona (soportados desde MVP). Custodias alternas quedan fuera de MVP.

## Requisitos *(obligatorio)*

### Requisitos funcionales

- **FR-001**: El sistema DEBE permitir crear una unidad familiar con uno o más miembros.
- **FR-002**: El sistema DEBE permitir registrar y editar un perfil individual por miembro del hogar.
- **FR-003**: El sistema DEBE permitir asociar restricciones alimentarias obligatorias a cada miembro.
- **FR-004**: El sistema DEBE permitir asociar preferencias alimentarias y alimentos rechazados a cada miembro.
- **FR-005**: El sistema DEBE diferenciar entre criterios obligatorios y criterios deseables.
- **FR-006**: El sistema DEBE permitir definir uno o varios objetivos alimentarios o corporales por miembro. Los objetivos son etiquetas simples (perder peso, mantener, ganar masa muscular) sin metas cuantificadas.
- **FR-007**: El sistema DEBE detectar incoherencias básicas entre criterios guardados.
- **FR-008**: El sistema DEBE mostrar qué información mínima falta antes de permitir una planificación fiable.
- **FR-009**: El sistema DEBE permitir dejar información opcional incompleta sin bloquear el alta del hogar.
- **FR-010**: El sistema DEBE conservar el historial vigente de criterios para usarlos en futuras planificaciones. No se requiere versionado histórico en MVP; se conserva solo el estado actual.
- **FR-011**: El sistema DEBE permitir configurar qué momentos de comida se planifican en el hogar (desayuno, comida, cena, snack) como preferencia global de la unidad familiar. Por defecto todos activos.

### Entidades clave

- **Unidad familiar**: grupo de convivencia para el que se planifica. Atributos clave: nombre o identificador del hogar, responsable principal, miembros activos, momentos de comida activos (configuración de qué slots se planifican).
- **Miembro familiar**: persona incluida en la planificación. Atributos clave: nombre o rol, edad, sexo, criterios activos, estado dentro del hogar (activo/archivado).
- **Restricción alimentaria**: condición obligatoria que excluye ciertos alimentos o preparaciones. Atributos clave: tipo de restricción (alergia, intolerancia, ética/religiosa, preferencia), categoría, miembro asociado.
- **Preferencia alimentaria**: gusto, rechazo o patrón deseado no obligatorio. Atributos clave: alimento o categoría, nivel de preferencia, miembro asociado.
- **Objetivo nutricional**: resultado deseado para una persona. Atributos clave: tipo de objetivo (etiqueta simple: perder peso, mantener, ganar músculo), prioridad, ámbito de aplicación (siempre por miembro, no por hogar).
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
- Las restricciones se categorizan en: alergia, intolerancia, ética/religiosa y preferencia.
- Los objetivos son etiquetas simples (no cuantificadas) por miembro.
- Los datos mínimos obligatorios por miembro son: nombre, edad, sexo y restricciones obligatorias.
- La gestión de miembros es solo archivado (no borrado total).
- Las custodias alternas y semanas con miembros no presentes quedan FUERA del MVP.
- Queda FUERA de alcance en esta spec la generación del menú y la lista de la compra.
- La interpretación nutricional detallada se resolverá en specs posteriores.

## Fuera de alcance inicial

- Generar el menú semanal.
- Calcular lista de la compra.
- Gestionar compras, presupuesto o supermercados.
- Seguimiento clínico o sanitario profesional.

## Preguntas abiertas (resueltas)

1. ~~¿Qué datos mínimos debe tener cada miembro?~~ → **Nombre, edad, sexo, restricciones obligatorias.**
2. ~~¿Se quiere distinguir entre tipos de restricciones?~~ → **Sí: alergia, intolerancia, ética/religiosa, preferencia.**
3. ~~¿Los objetivos se definen con metas cuantificadas?~~ → **No. Solo etiquetas simples.**
4. ~~¿Perfil específico para niños?~~ → **No. Mismo perfil para todos, la edad es un dato más.**
5. ~~¿Custodias alternas?~~ → **Fuera de MVP.**
