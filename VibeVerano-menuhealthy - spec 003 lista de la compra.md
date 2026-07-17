---
type: project-note
status: active
date: 2026-07-17
source: openclaw
tags: [project, sdd, spec, menufamiliareshealthy, vibeverano]
---
# VibeVerano-menuhealthy - spec 003 lista de la compra

## Fuente original
- `shared/output/spec-sdd/menufamiliareshealthy/003-lista-de-la-compra/spec.md`

## Contenido promovido

# Especificación de Feature: Lista de la compra automática desde el menú semanal

**Rama**: `003-lista-de-la-compra`
**Creada**: 2026-07-17
**Estado**: Borrador
**Input**: Descripción del usuario: "una aplicación que ayudara a planificar los menús familiares teniendo en cuenta distintos criterios: necesidades nutricionales, preferencias alimentarias, restricciones, objetivos (perder peso, ganar masa muscular, etc.) e incluso que generase automáticamente la lista de la compra a partir del menú semanal."

## Escenarios de usuario y pruebas *(obligatorio)*

### Historia de Usuario 1 - Generar automáticamente la lista desde el menú aprobado (Prioridad: P1)

Como responsable de la compra familiar, quiero que la aplicación convierta el menú semanal aprobado en una lista de la compra, para ahorrar tiempo y evitar olvidos.

**Por qué esta prioridad**: es uno de los valores explícitos del proyecto y conecta planificación con acción.

**Test independiente**: aprobar un menú semanal y comprobar que se genera una lista de compra asociada a esa semana.

**Escenarios de aceptación**:
1. **Dado** un menú semanal aprobado, **Cuando** la persona responsable solicita la lista de la compra, **Entonces** el sistema genera automáticamente una lista basada en ese menú.
2. **Dado** que el menú aún no ha sido aprobado, **Cuando** se intenta generar la lista final, **Entonces** el sistema avisa de que la lista debe basarse en el menú vigente o aprobado.
3. **Dado** que cambia el menú aprobado, **Cuando** se regenera la lista, **Entonces** el sistema actualiza la lista para reflejar el nuevo plan.

### Historia de Usuario 2 - Agrupar y consolidar ingredientes repetidos (Prioridad: P1)

Como persona que hace la compra, quiero que los ingredientes repetidos aparezcan consolidados, para no llevar una lista duplicada y confusa.

**Por qué esta prioridad**: sin consolidación, la lista pierde utilidad práctica.

**Test independiente**: crear un menú con ingredientes repetidos en varios días y comprobar que la lista resultante los agrupa correctamente.

**Escenarios de aceptación**:
1. **Dado** un menú con varios platos que usan el mismo ingrediente, **Cuando** se genera la lista, **Entonces** el sistema consolida ese ingrediente en una única línea de compra.
2. **Dado** ingredientes equivalentes o muy similares dentro del plan, **Cuando** se genera la lista, **Entonces** el sistema evita duplicidades evidentes y señala posibles consolidaciones. [NECESITA ACLARACIÓN: qué nivel de normalización se espera]

### Historia de Usuario 3 - Organizar la lista de forma comprensible para comprar (Prioridad: P2)

Como persona encargada de comprar, quiero que la lista esté ordenada por categorías útiles, para hacer la compra de forma más rápida y con menos fricción.

**Por qué esta prioridad**: mejora mucho la experiencia, aunque depende de que la lista básica exista primero.

**Test independiente**: generar una lista y comprobar que puede revisarse por secciones comprensibles.

**Escenarios de aceptación**:
1. **Dado** una lista de compra generada, **Cuando** la persona responsable la revisa, **Entonces** el sistema presenta los productos agrupados por categorías de compra.
2. **Dado** que un ingrediente no encaja claramente en una categoría, **Cuando** aparece en la lista, **Entonces** el sistema lo muestra igualmente en una categoría genérica o pendiente.

### Historia de Usuario 4 - Marcar qué ya hay en casa antes de cerrar la lista (Prioridad: P2)

Como responsable del hogar, quiero poder indicar ingredientes que ya tengo, para que la lista final refleje solo lo que realmente necesito comprar.

**Por qué esta prioridad**: reduce gasto y hace la lista más realista, pero puede vivir sobre la generación básica ya resuelta.

**Test independiente**: generar una lista, marcar ciertos ingredientes como disponibles en casa y comprobar que la lista final se ajusta.

**Escenarios de aceptación**:
1. **Dado** una lista generada, **Cuando** la persona responsable marca ingredientes como ya disponibles en casa, **Entonces** el sistema los elimina de la compra final o los marca como cubiertos. [NECESITA ACLARACIÓN: qué comportamiento se prefiere]
2. **Dado** un ingrediente parcialmente disponible, **Cuando** se revisa la lista, **Entonces** el sistema permite ajustar la necesidad restante. [NECESITA ACLARACIÓN: si el MVP soporta cantidades parciales]

### Casos límite

- Ingredientes repetidos con nombres parecidos pero no idénticos.
- Cambios de menú de última hora tras haber generado la lista.
- Productos opcionales o alternativos.
- Ingredientes ya disponibles en casa en cantidad parcial.
- Menús con recetas complejas que comparten bases o preparaciones.
- Un ingrediente necesario en varias categorías de compra según el formato comercial. [NECESITA ACLARACIÓN: si importa esa precisión]

## Requisitos *(obligatorio)*

### Requisitos funcionales

- **FR-001**: El sistema DEBE generar una lista de la compra a partir del menú semanal aprobado.
- **FR-002**: El sistema DEBE vincular cada lista con la semana y el menú de origen.
- **FR-003**: El sistema DEBE consolidar ingredientes repetidos dentro de la misma lista.
- **FR-004**: El sistema DEBE actualizar o regenerar la lista cuando cambie el menú vigente.
- **FR-005**: El sistema DEBE presentar la lista de forma comprensible para uso doméstico.
- **FR-006**: El sistema DEBE permitir revisar la lista antes de considerarla final.
- **FR-007**: El sistema DEBE permitir marcar ingredientes ya disponibles en casa. [NECESITA ACLARACIÓN: si entra en MVP obligatorio]
- **FR-008**: El sistema DEBE diferenciar entre lista generada automáticamente y lista ajustada por la persona responsable.
- **FR-009**: El sistema DEBE agrupar productos por categorías útiles de compra. [NECESITA ACLARACIÓN: si entra en MVP o fase posterior]
- **FR-010**: El sistema DEBE evitar generar lista final desde menús no aprobados, salvo modo borrador. [NECESITA ACLARACIÓN: si existirá modo borrador]

### Entidades clave *(incluir si la feature maneja datos)*

- **Lista de la compra**: conjunto de productos o ingredientes necesarios para una semana concreta. Atributos clave: semana, menú origen, estado, fecha de generación.
- **Línea de compra**: necesidad concreta dentro de la lista. Atributos clave: ingrediente o producto, cantidad estimada [NECESITA ACLARACIÓN: nivel de precisión], categoría, estado de compra.
- **Consolidación de ingrediente**: agrupación de varias necesidades equivalentes en una sola línea. Atributos clave: ingredientes origen, resultado consolidado, reglas aplicadas.
- **Disponibilidad doméstica**: indicación de si un ingrediente ya existe en casa. Atributos clave: ingrediente, estado disponible/no disponible/parcial [NECESITA ACLARACIÓN: si habrá estado parcial], semana asociada.

## Criterios de éxito *(obligatorio)*

### Resultados medibles

- **SC-001**: La persona responsable obtiene una lista de compra completa en menos de 1 minuto desde la aprobación del menú.
- **SC-002**: La lista final reduce olvidos o compras repetidas frente a una preparación manual. [NECESITA ACLARACIÓN: cómo se medirá]
- **SC-003**: La mayoría de listas semanales requiere solo ajustes menores antes de usarse. [NECESITA ACLARACIÓN: umbral objetivo]
- **SC-004**: Los ingredientes repetidos quedan consolidados sin duplicidades evidentes en el resultado final.

## Suposiciones

- Existe ya un menú semanal aprobado como fuente de verdad.
- La lista de la compra se genera para uso doméstico, no para pedidos profesionales.
- El sistema puede trabajar inicialmente con una interpretación razonable de ingredientes sin necesidad de catálogo de supermercado.
- Queda FUERA de alcance en esta spec la compra online automática.

## Fuera de alcance inicial

- Integración directa con supermercados.
- Comparación de precios entre tiendas.
- Optimización por presupuesto o promociones.
- Gestión logística de entregas o pedidos.

## Preguntas abiertas

1. ¿La lista debe mostrar cantidades exactas, aproximadas o solo presencia del ingrediente?
2. ¿Debe trabajar a nivel de ingrediente genérico o de producto comercial concreto?
3. ¿Se quiere despensa/inventario doméstico desde MVP o solo marcado manual de “ya lo tengo”?
4. ¿La lista será compartible o colaborativa entre varios miembros del hogar?
5. ¿Hace falta exportarla, imprimirla o usarla en móvil en modo checklist desde el primer día?
