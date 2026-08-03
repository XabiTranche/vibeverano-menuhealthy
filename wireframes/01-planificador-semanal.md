# ⭐ Pantalla Principal: Planificador Semanal

## Objetivo

Es la pantalla CORE de la aplicación. Permite al usuario ver de un vistazo toda su semana de comidas organizada por días y momentos (desayuno, comida, cena, snack), aprobar el menú como definitivo y hacer sustituciones rápidas.

## ¿Qué puede hacer el usuario aquí?

- Ver los 7 días de la semana con los platos asignados a cada momento del día
- Añadir un plato a un hueco vacío tocando el slot "+"
- Sustituir un plato ya asignado tocando el icono ⇄
- Aprobar la semana como menú vigente (lo que permite generar la lista de la compra)
- Cambiar de semana con las flechas del selector superior

## Explicación de cada parte del prototipo

### Selector de semana (arriba)
Muestra qué semana estamos viendo ("Semana del 4 al 10 ago") con flechas para navegar entre semanas. Debajo aparece un **badge de estado**:
- "● En borrador" → la semana tiene platos pero no se ha confirmado
- "✓ Aprobada" → la semana está confirmada
- "⚠ Modificada" → se han hecho cambios desde la última aprobación

### Tarjetas de comida (cuerpo)
Cada plato asignado aparece como una tarjeta blanca con:
- **Barra lateral de color** (3px): indica el tipo de comida — naranja para desayuno, verde para comida, violeta para cena, terracota para snack
- **Nombre del plato**: texto principal
- **Badges nutricionales**: kcal y proteínas en verde suave
- **Icono ⇄**: botón para sustituir ese plato por otro del catálogo

### Slots vacíos
Los momentos del día sin plato asignado se muestran con fondo crema cálido y el texto "+ Añadir cena" (o el momento correspondiente). Al tocarlos se abre el catálogo de recetas filtrado.

### Botón "Aprobar semana" (zona inferior)
Botón rectangular verde en la parte baja de la pantalla, accesible al pulgar. Confirma el menú como definitivo para esa semana.

### Tab bar (menú inferior)
Navegación fija con 4 opciones: Plan (activa en verde), Recetas, Compra (🛒) y Familia.

## Decisiones de diseño

- **Scroll vertical** por días — sin scroll horizontal ni grids complejos, pensado para uso con una mano
- **Zona de acción en la parte inferior** — el pulgar llega sin estirar la mano
- **Un solo color de acento** (verde) — solo aparece en acciones, nunca como decoración
- **Touch targets de 52px mínimo** — cómodo de usar mientras se cocina
