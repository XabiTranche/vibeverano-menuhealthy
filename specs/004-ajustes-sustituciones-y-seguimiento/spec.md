# Especificación de Feature: Ajustes, sustituciones y seguimiento del menú

**Feature Branch**: `004-ajustes-sustituciones-y-seguimiento`
**Creada**: 2026-07-17
**Estado**: Convergido
**Última revisión**: 2026-08-10
**Input**: Descripción del usuario: "una aplicación que ayudara a planificar los menús familiares teniendo en cuenta distintos criterios: necesidades nutricionales, preferencias alimentarias, restricciones, objetivos (perder peso, ganar masa muscular, etc.) e incluso que generase automáticamente la lista de la compra a partir del menú semanal."

**Nota**: Esta spec absorbe la funcionalidad de sustitución de platos individuales (tanto pre como post-aprobación) que originalmente estaba en spec 002 HU5. Spec 002 delega a esta spec toda la lógica de modificación de platos.

## Escenarios de usuario y pruebas *(obligatorio)*

### Historia de Usuario 1 - Sustituir una comida sin romper los criterios del hogar (Prioridad: P1)

Como responsable del menú familiar, quiero poder cambiar una comida concreta por otra alternativa, para adaptar la semana cuando algo no encaja o surge un imprevisto.

**Por qué esta prioridad**: ningún menú sobrevive intacto toda la semana; sin capacidad de ajuste, la planificación pierde utilidad real. Aplica tanto a propuestas en revisión (pre-aprobación) como a menús vigentes (post-aprobación).

**Test independiente**: partir de un menú (aprobado o en revisión), sustituir una comida concreta y comprobar que el sistema valida restricciones obligatorias.

**Escenarios de aceptación**:
1. **Dado** un menú semanal (en revisión o aprobado), **Cuando** la persona responsable decide cambiar una comida concreta, **Entonces** el sistema permite elegir libremente una alternativa y valida que no viole restricciones obligatorias.
2. **Dado** una sustitución que viola una restricción obligatoria, **Cuando** se intenta aplicar, **Entonces** el sistema bloquea el cambio e indica qué restricción se incumple.
3. **Dado** una sustitución válida, **Cuando** se confirma el cambio, **Entonces** el sistema actualiza el menú para esa comida sin afectar al resto.
4. **Dado** que el usuario ha realizado 5 o más sustituciones en la misma semana, **Cuando** intenta un nuevo cambio, **Entonces** el sistema sugiere regenerar el menú completo (sin bloquear el cambio puntual).

### Historia de Usuario 2 - Reflejar el cambio en la lista de la compra (Prioridad: P1)

Como persona que hace la compra, quiero que los cambios de menú actualicen la lista asociada, para no comprar cosas innecesarias ni olvidar nuevas necesidades.

**Por qué esta prioridad**: conecta el ajuste del menú con su impacto operativo inmediato.

**Test independiente**: modificar una comida del menú aprobado y comprobar que la lista de la compra se actualiza en la parte pendiente.

**Escenarios de aceptación**:
1. **Dado** una lista ya generada desde un menú aprobado, **Cuando** cambia una comida del plan, **Entonces** el sistema actualiza solo la parte no tachada (pendiente) de la lista de compra.
2. **Dado** que algunos items de la lista ya fueron tachados (comprados), **Cuando** se aplica una sustitución que afecta a ingredientes ya comprados, **Entonces** el sistema avisa de posibles inconsistencias con lo ya comprado sin eliminar los tachados.
3. **Dado** un cambio confirmado en el menú, **Cuando** la persona responsable revisa la lista, **Entonces** puede identificar qué elementos se añadieron o eliminaron respecto al estado anterior.

### Historia de Usuario 3 - Registrar señales de ajustes para uso futuro (Prioridad: P2)

Como responsable del hogar, quiero que el sistema registre los cambios y rechazos que hago, para que en el futuro pueda usarlos para generar mejores propuestas.

**Por qué esta prioridad**: prepara la base de datos de preferencias reales sin exigir aplicación automática en MVP.

**Test independiente**: sustituir o rechazar varios platos a lo largo de varias semanas y comprobar que las señales quedan registradas.

**Escenarios de aceptación**:
1. **Dado** que la persona responsable sustituye una comida, **Cuando** se confirma el cambio, **Entonces** el sistema registra la señal (plato original, plato nuevo, motivo si se indicó) para uso futuro.
2. **Dado** que opcionalmente el usuario indica un motivo del cambio (gusto, falta de ingredientes, tiempo, rechazo infantil, otro), **Cuando** se guarda el cambio, **Entonces** el motivo queda asociado a la señal registrada.
3. **Dado** señales acumuladas, **Cuando** se consultan, **Entonces** están disponibles como datos para futuras mejoras del motor de recomendación (fuera de MVP).

### Historia de Usuario 4 - Conservar histórico de menú original vs. ajustado (Prioridad: P2)

Como responsable del menú, quiero poder ver qué menú se generó originalmente y qué cambios se hicieron, para entender cómo evoluciona la planificación.

**Por qué esta prioridad**: aporta transparencia y permite analizar patrones de ajuste.

**Test independiente**: generar un menú, hacer varios ajustes y comprobar que se conserva tanto la versión original como la versión final.

**Escenarios de aceptación**:
1. **Dado** un menú que ha sido ajustado, **Cuando** la persona responsable revisa el historial de esa semana, **Entonces** puede ver el menú original generado y el menú final vigente con los cambios aplicados.
2. **Dado** varias semanas con ajustes, **Cuando** se revisa el histórico, **Entonces** cada semana conserva su versión original y su versión final independientemente.

### Casos límite

- Cambio de comida cuando ya se hizo la compra → se actualiza solo lo pendiente y se avisa de inconsistencias.
- Sustituciones que mejoran gusto pero empeoran el objetivo nutricional → el sistema valida restricciones obligatorias pero permite cambios que afecten objetivos no obligatorios (con aviso informativo).
- Varias sustituciones encadenadas en la misma semana → a partir de 5, se sugiere regenerar el menú completo.
- Cambio de un plato compartido por toda la familia → se aplica a la comida planificada; si hay variantes por miembro (spec 002 FR-014), solo se afecta la variante correspondiente.
- Lista de compra parcialmente usada antes del cambio → se actualiza la parte pendiente, no se tocan los items ya tachados.
- Motivo del cambio no indicado → se registra la señal sin motivo; es información opcional.
- Sustitución en un menú aún no aprobado (pre-aprobación) → funciona igual, se aplica sobre la propuesta en revisión.

## Requisitos *(obligatorio)*

### Requisitos funcionales

- **FR-001**: El sistema DEBE permitir modificar una comida concreta dentro de un menú semanal (tanto en revisión como vigente).
- **FR-002**: El sistema DEBE validar que cualquier sustitución no viole restricciones obligatorias. Si viola una restricción obligatoria, DEBE bloquear el cambio.
- **FR-003**: El sistema DEBE permitir al usuario elegir libremente la alternativa (no se limita a sugerencias del sistema). La validación es posterior a la elección.
- **FR-004**: El sistema DEBE reflejar los cambios confirmados dentro del menú activo sin afectar al resto de comidas.
- **FR-005**: El sistema DEBE actualizar la parte pendiente (no tachada) de la lista de la compra cuando un cambio de menú la afecte.
- **FR-006**: El sistema DEBE avisar de posibles inconsistencias cuando un cambio afecte a ingredientes de items ya tachados (comprados) en la lista.
- **FR-007**: El sistema DEBE mostrar qué elementos se añadieron o eliminaron de la lista tras un cambio de menú.
- **FR-008**: El sistema DEBE distinguir entre menú original generado y menú ajustado, conservando ambas versiones (histórico).
- **FR-009**: El sistema DEBE registrar cada sustitución como señal (plato original, plato nuevo, motivo opcional, fecha, miembro afectado) para uso futuro.
- **FR-010**: El sistema DEBE permitir al usuario indicar opcionalmente un motivo del cambio (gusto, falta de ingredientes, tiempo, rechazo infantil, otro).
- **FR-011**: El sistema DEBE sugerir regenerar el menú completo cuando se acumulen 5 o más sustituciones en la misma semana, sin bloquear cambios puntuales adicionales.
- **FR-012**: El sistema DEBE informar al usuario cuando una sustitución afecte negativamente a objetivos nutricionales no obligatorios (aviso informativo, no bloqueo).

### Requisitos no funcionales

- **NFR-001 (Offline-first)**: Las sustituciones DEBEN poder realizarse sin conexión a internet. Los cambios se sincronizan cuando se recupere conectividad.
- **NFR-002 (Offline-first)**: La validación de restricciones obligatorias DEBE funcionar offline usando los datos del perfil familiar cacheados localmente.
- **NFR-003 (Colaborativo)**: Cuando varios miembros ajustan platos distintos del mismo menú simultáneamente, el sistema DEBE aplicar merge automático sin conflicto.
- **NFR-004 (Colaborativo)**: Si dos miembros intentan sustituir el mismo plato a la vez, el sistema DEBE aplicar last-write-wins y notificar al otro usuario del cambio.
- **NFR-005 (RGPD)**: Las señales de ajuste (que pueden revelar datos de salud indirectamente) DEBEN almacenarse cifradas en reposo y en tránsito.
- **NFR-006 (Rendimiento)**: La validación de una sustitución y actualización del menú DEBE completarse en menos de 3 segundos.

### Entidades clave *(incluir si la feature maneja datos)*

- **Ajuste de menú**: modificación realizada sobre una comida planificada. Atributos clave: semana, comida afectada, plato original, plato nuevo, motivo (opcional: gusto/falta de ingredientes/tiempo/rechazo infantil/otro), fecha del cambio, usuario que realizó el cambio, miembro afectado.
- **Histórico de menú**: registro de versiones del menú semanal. Atributos clave: semana, versión original (generada), versión final (con ajustes), lista de ajustes aplicados.
- **Señal de aprendizaje**: dato derivado de sustituciones y rechazos acumulados. Atributos clave: tipo de señal (sustitución/rechazo), plato original, plato elegido, motivo si existe, frecuencia, contexto familiar. No se aplica automáticamente en MVP; solo se almacena.
- **Umbral de sustituciones**: contador de cambios por semana. Atributos clave: semana, número de sustituciones acumuladas, sugerencia de regeneración emitida (sí/no).

## Criterios de éxito *(obligatorio)*

### Resultados medibles

- **SC-001**: La persona responsable puede ajustar una comida concreta en menos de 2 minutos.
- **SC-002**: Los cambios de menú mantienen la coherencia con restricciones obligatorias en el 100% de los casos confirmados (el sistema nunca permite una sustitución que viole una restricción obligatoria).
- **SC-003**: El 100% de las sustituciones confirmadas se refleja correctamente en la lista de compra (parte pendiente actualizada).
- **SC-004**: El histórico de menú original vs. ajustado se conserva para el 100% de las semanas con cambios.

## Suposiciones

- El menú semanal ya existe (puede estar en revisión o aprobado, según spec 002).
- Los cambios son parte normal del uso real del producto.
- Esta spec absorbe toda la funcionalidad de sustitución de platos (pre y post-aprobación) que spec 002 delega aquí.
- En MVP solo se registran señales de aprendizaje; no se aplican automáticamente para mejorar futuras propuestas.
- El motivo del cambio es opcional; el usuario puede o no indicarlo.
- El registro de cumplimiento semanal (seguir o no el menú) queda FUERA del MVP. Cuando entre, será con detalle por miembro.
- El catálogo de recetas/alimentos (spec 005) es necesario para validar restricciones.

## Fuera de alcance inicial

- Aplicación automática de señales de aprendizaje para mejorar propuestas (solo registro en MVP).
- Seguimiento/cumplimiento semanal (marcar si se realizó cada comida) — fase posterior con detalle por miembro.
- Seguimiento nutricional clínico detallado.
- Integración con wearables o apps de actividad.
- Recomendaciones terapéuticas personalizadas.
- Automatización total sin validación humana de cada cambio.
- Sugerencias automáticas de alternativas (el usuario elige libremente; el sistema solo valida).

## Preguntas abiertas (resueltas)

1. ~~¿Las sustituciones deben ofrecerse automáticamente o basta con cambios manuales compatibles?~~ → **El usuario elige libremente; el sistema solo valida restricciones obligatorias.**
2. ~~¿Hay que recoger el motivo del cambio?~~ → **Opcional. Motivos predefinidos: gusto, falta de ingredientes, tiempo, rechazo infantil, otro.**
3. ~~¿El aprendizaje de preferencias entra en MVP?~~ → **No. En MVP solo se registran señales para uso futuro.**
4. ~~¿Debe mantenerse histórico de menús originales y ajustados?~~ → **Sí. Se conservan ambas versiones por semana.**
5. ~~¿El seguimiento semanal debe ser simple o detallado?~~ → **Detallado por miembro, pero queda fuera de MVP.**
