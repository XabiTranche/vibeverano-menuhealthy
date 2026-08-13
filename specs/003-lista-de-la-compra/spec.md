# Especificación de Feature: Lista de la compra automática desde el menú semanal

**Feature Branch**: `003-lista-de-la-compra`
**Creada**: 2026-07-17
**Estado**: Convergido
**Última revisión**: 2026-08-10
**Input**: Descripción del usuario: "una aplicación que ayudara a planificar los menús familiares teniendo en cuenta distintos criterios: necesidades nutricionales, preferencias alimentarias, restricciones, objetivos (perder peso, ganar masa muscular, etc.) e incluso que generase automáticamente la lista de la compra a partir del menú semanal."

## Escenarios de usuario y pruebas *(obligatorio)*

### Historia de Usuario 1 - Generar automáticamente la lista desde el menú aprobado (Prioridad: P1)

Como responsable de la compra familiar, quiero que la aplicación convierta el menú semanal aprobado en una lista de la compra, para ahorrar tiempo y evitar olvidos.

**Por qué esta prioridad**: es uno de los valores explícitos del proyecto y conecta planificación con acción.

**Test independiente**: aprobar un menú semanal y comprobar que se genera una lista de compra asociada a esa semana.

**Escenarios de aceptación**:
1. **Dado** un menú semanal aprobado, **Cuando** la persona responsable solicita la lista de la compra, **Entonces** el sistema genera automáticamente una lista basada en ese menú con cantidades aproximadas por ingrediente genérico.
2. **Dado** que el menú aún no ha sido aprobado, **Cuando** se intenta generar la lista, **Entonces** el sistema avisa de que la lista solo se genera desde un menú aprobado.
3. **Dado** que cambia el menú aprobado (sustitución), **Cuando** se regenera la lista, **Entonces** el sistema actualiza la lista para reflejar el nuevo plan.
4. **Dado** un plato del menú que no tiene ingredientes mapeados en el catálogo, **Cuando** se genera la lista, **Entonces** el sistema omite ese plato de la lista y avisa al usuario de qué platos no pudieron incluirse.

### Historia de Usuario 2 - Agrupar y consolidar ingredientes repetidos (Prioridad: P1)

Como persona que hace la compra, quiero que los ingredientes repetidos aparezcan consolidados, para no llevar una lista duplicada y confusa.

**Por qué esta prioridad**: sin consolidación, la lista pierde utilidad práctica.

**Test independiente**: crear un menú con ingredientes repetidos en varios días y comprobar que la lista resultante los agrupa correctamente.

**Escenarios de aceptación**:
1. **Dado** un menú con varios platos que usan el mismo ingrediente, **Cuando** se genera la lista, **Entonces** el sistema consolida ese ingrediente en una única línea de compra con la cantidad aproximada total.
2. **Dado** ingredientes equivalentes con nombres no idénticos (ej: "tomate" y "tomate maduro"), **Cuando** se genera la lista, **Entonces** el sistema aplica normalización básica por nombre de ingrediente genérico del catálogo para evitar duplicidades evidentes.

### Historia de Usuario 3 - Organizar la lista por categorías de compra (Prioridad: P1)

Como persona encargada de comprar, quiero que la lista esté ordenada por categorías útiles, para hacer la compra de forma más rápida y con menos fricción.

**Por qué esta prioridad**: mejora la experiencia de uso real en el supermercado. Entra en MVP.

**Test independiente**: generar una lista y comprobar que los productos aparecen agrupados por categorías comprensibles.

**Escenarios de aceptación**:
1. **Dado** una lista de compra generada, **Cuando** la persona responsable la revisa, **Entonces** el sistema presenta los productos agrupados por categorías de compra (ej: frutas y verduras, carnes, lácteos, cereales, otros).
2. **Dado** que un ingrediente no encaja claramente en una categoría, **Cuando** aparece en la lista, **Entonces** el sistema lo muestra en una categoría genérica ("Otros").

### Historia de Usuario 4 - Marcar ingredientes que ya tengo en casa (Prioridad: P1)

Como responsable del hogar, quiero poder indicar ingredientes que ya tengo, para que la lista final refleje solo lo que realmente necesito comprar.

**Por qué esta prioridad**: reduce gasto y hace la lista más realista. Entra en MVP como marcado manual binario.

**Test independiente**: generar una lista, marcar ciertos ingredientes como disponibles en casa y comprobar que la lista final se ajusta.

**Escenarios de aceptación**:
1. **Dado** una lista generada, **Cuando** la persona responsable desliza un ingrediente a la izquierda (swipe), **Entonces** el sistema lo marca como disponible en casa y lo mueve a la sección "Cubierto" de la lista.
2. **Dado** un ingrediente marcado como disponible, **Cuando** se revisa la lista, **Entonces** queda visible como "cubierto" pero puede desmarcarse si cambia la situación.

### Historia de Usuario 5 - Usar la lista como checklist interactivo mientras compro (Prioridad: P1)

Como persona que está en el supermercado, quiero ir tachando productos de la lista en mi móvil a medida que los meto en el carro, para no perderme nada.

**Por qué esta prioridad**: es el uso final real de la lista; sin checklist interactivo, la generación pierde utilidad operativa.

**Test independiente**: abrir la lista en el móvil y comprobar que puedo tachar productos individualmente, con estado persistente.

**Escenarios de aceptación**:
1. **Dado** una lista de compra finalizada, **Cuando** el usuario toca (tap) un producto en la lista, **Entonces** el sistema lo marca como comprado (tachado). El gesto de "ya lo tengo" (swipe izquierda) es diferente del de "comprado" (tap).
2. **Dado** que el usuario tacha un producto, **Cuando** cierra y reabre la lista, **Entonces** el estado de tachado persiste.
3. **Dado** que dos miembros del hogar usan la lista a la vez (se reparten pasillos), **Cuando** cada uno tacha productos distintos, **Entonces** el sistema sincroniza automáticamente (merge sin conflicto).

### Historia de Usuario 6 - Colaborar en la lista entre miembros del hogar (Prioridad: P1)

Como miembro del hogar, quiero que la lista sea compartida y se actualice en tiempo real, para repartirnos la compra sin duplicar esfuerzos.

**Por qué esta prioridad**: alineado con principio colaborativo de la Constitution. Entra en MVP.

**Test independiente**: dos miembros abren la misma lista simultáneamente, tachan productos diferentes y comprobar que ambos ven el estado actualizado.

**Escenarios de aceptación**:
1. **Dado** una lista de compra activa, **Cuando** varios miembros del hogar la abren simultáneamente, **Entonces** todos ven el mismo estado actualizado de la lista.
2. **Dado** que dos miembros tachan productos distintos a la vez, **Cuando** se sincronizan, **Entonces** el sistema aplica merge automático sin conflictos.
3. **Dado** que un miembro marca un ingrediente como "ya lo tengo" y otro lo desmarca, **Cuando** se sincronizan, **Entonces** prevalece la última acción (last-write-wins a nivel de línea individual).

### Casos límite

- Ingredientes repetidos con nombres parecidos pero no idénticos → normalización por catálogo de ingredientes genéricos.
- Cambios de menú de última hora tras haber generado la lista → regeneración asociada al nuevo menú.
- Ingredientes ya disponibles en casa → marcado binario manual (lo tengo/no lo tengo).
- Menús con recetas complejas que comparten bases o preparaciones → se consolidan ingredientes comunes.
- Plato sin ingredientes mapeados en el catálogo → se omite y se avisa al usuario.
- Familia con un solo miembro usando la lista → funciona igual, sin componente colaborativo activo.
- Ingredientes estacionales o difíciles de encontrar → no se contempla en MVP; el sistema genera la lista con lo que el catálogo tenga.
- Menú vigente marcado como "posiblemente incompatible" (spec 002 FR-019) → la lista se mantiene intacta; el aviso es solo sobre el menú.
- Diferenciación de gestos: tap = comprado en la tienda; swipe izquierda = ya lo tengo en casa. Ambos retiran el item de la lista pendiente pero con semánticas diferentes.

## Requisitos *(obligatorio)*

### Requisitos funcionales

- **FR-001**: El sistema DEBE generar una lista de la compra a partir del menú semanal aprobado.
- **FR-002**: El sistema DEBE vincular cada lista con la semana y el menú de origen.
- **FR-003**: El sistema DEBE consolidar ingredientes repetidos en una única línea con cantidad aproximada total.
- **FR-004**: El sistema DEBE actualizar o regenerar la lista cuando se sustituya el menú vigente.
- **FR-005**: El sistema DEBE presentar cantidades aproximadas a nivel de ingrediente genérico (no producto comercial concreto).
- **FR-006**: El sistema DEBE agrupar los productos por categorías útiles de compra (frutas/verduras, carnes, lácteos, cereales, otros).
- **FR-007**: El sistema DEBE permitir marcar ingredientes como ya disponibles en casa (marcado binario: lo tengo / no lo tengo). Los marcados se eliminan de la lista de compra pendiente.
- **FR-008**: El sistema DEBE diferenciar entre lista generada automáticamente y lista ajustada por el usuario.
- **FR-009**: El sistema DEBE funcionar como checklist interactivo en el móvil, permitiendo tachar productos individualmente con estado persistente.
- **FR-010**: El sistema DEBE generar lista SOLO desde menús aprobados. No existe modo borrador.
- **FR-011**: El sistema DEBE aplicar normalización básica de ingredientes usando el catálogo de ingredientes genéricos (spec 005) para evitar duplicidades por variantes de nombre.
- **FR-012**: El sistema DEBE omitir platos sin ingredientes mapeados en el catálogo e informar al usuario de qué platos no pudieron incluirse en la lista.
- **FR-013**: El sistema DEBE permitir que varios miembros del hogar accedan y editen la misma lista simultáneamente.
- **FR-014**: El sistema DEBE sincronizar cambios entre miembros mediante merge automático (sin conflictos, last-write-wins a nivel de línea individual).

### Requisitos no funcionales

- **NFR-001 (Offline-first)**: La generación de la lista DEBE intentar primero la llamada al backend. Si no hay conexión, el sistema DEBE utilizar los datos locales del menú aprobado y el catálogo cacheado para generar la lista offline.
- **NFR-002 (Offline-first)**: La visualización, tachado, y marcado de "ya lo tengo" DEBE funcionar sin conexión, sincronizando cuando se recupere conectividad.
- **NFR-003 (Colaborativo)**: Los cambios realizados por distintos miembros en la misma lista DEBEN sincronizarse automáticamente con merge sin conflicto cuando haya conexión.
- **NFR-004 (RGPD)**: La lista de la compra DEBE almacenarse cifrada en reposo (dispositivo) y en tránsito (backend), dado que puede revelar datos de salud indirectamente (ej: "leche sin lactosa" indica intolerancia).
- **NFR-005 (Rendimiento)**: La generación de la lista con conexión al backend DEBE completarse en menos de 5 segundos para un menú semanal estándar (≤6 miembros, semana completa).

### Entidades clave *(incluir si la feature maneja datos)*

- **Lista de la compra**: conjunto de ingredientes necesarios para una semana concreta. Atributos clave: semana, menú origen, estado (generada/ajustada/en uso/completada), fecha de generación, hogar asociado.
- **Línea de compra**: necesidad concreta dentro de la lista. Atributos clave: ingrediente genérico (del catálogo), cantidad aproximada, unidad, categoría de compra, estado (pendiente/comprado/disponible en casa), timestamp última modificación, usuario que modificó.
- **Consolidación de ingrediente**: agrupación de varias necesidades equivalentes en una sola línea. Atributos clave: ingredientes origen (de distintos platos), resultado consolidado (nombre normalizado + cantidad sumada), regla de normalización aplicada.
- **Categoría de compra**: agrupación para organización en supermercado. Atributos clave: nombre (frutas/verduras, carnes, lácteos, cereales, otros), orden de presentación.

## Criterios de éxito *(obligatorio)*

### Resultados medibles

- **SC-001**: La persona responsable obtiene una lista de compra completa en menos de 1 minuto desde la solicitud (con menú ya aprobado).
- **SC-002**: Al menos el 70% de las listas semanales generadas requieren solo ajustes menores (marcar "ya lo tengo") antes de usarse, sin necesidad de añadir ingredientes olvidados manualmente.
- **SC-003**: Los ingredientes repetidos quedan consolidados sin duplicidades evidentes en el resultado final.
- **SC-004**: La lista es usable como checklist en el supermercado sin necesidad de herramientas externas.

## Suposiciones

- Existe ya un menú semanal aprobado como fuente de verdad (spec 002 completada).
- El catálogo de ingredientes genéricos (spec 005) proporciona la base de normalización.
- La lista de la compra se genera para uso doméstico, no para pedidos profesionales.
- Las cantidades son aproximadas (orientativas) a nivel de ingrediente genérico; no se trabaja con producto comercial concreto.
- El marcado de disponibilidad en casa es manual y binario (no hay inventario/despensa persistente en MVP).
- El presupuesto queda fuera de alcance (coherente con spec 002).
- No existe modo borrador de lista; solo se genera desde menú aprobado.
- La lista asociada a un menú marcado como "posiblemente incompatible" (spec 002) se mantiene intacta.

## Fuera de alcance inicial

- Integración directa con supermercados.
- Comparación de precios entre tiendas.
- Optimización por presupuesto o promociones.
- Gestión logística de entregas o pedidos.
- Cantidades parciales ("tengo 200g de los 500g necesarios").
- Inventario/despensa doméstica persistente.
- Producto comercial concreto (marcas, formatos específicos).
- Exportar o imprimir la lista (solo checklist interactivo en móvil).
- Modo borrador de lista desde menú no aprobado.

## Preguntas abiertas (resueltas)

1. ~~¿La lista debe mostrar cantidades exactas, aproximadas o solo presencia?~~ → **Cantidades aproximadas.**
2. ~~¿Nivel de ingrediente genérico o producto comercial concreto?~~ → **Ingrediente genérico.**
3. ~~¿Despensa/inventario doméstico desde MVP o solo marcado manual?~~ → **Solo marcado manual binario ("ya lo tengo" / "no lo tengo").**
4. ~~¿La lista será compartible/colaborativa?~~ → **Sí, colaborativa en tiempo real con merge automático.**
5. ~~¿Checklist en móvil, exportable, imprimible?~~ → **Solo checklist interactivo en móvil. Sin exportar ni imprimir en MVP.**
