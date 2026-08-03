# Pantalla 2: Catálogo de Recetas

## Objetivo

Es el almacén de platos del hogar. Permite explorar, buscar y filtrar todas las recetas disponibles para encontrar rápidamente qué cocinar y asignarlo al plan semanal.

## ¿Qué puede hacer el usuario aquí?

- Buscar recetas por nombre de plato o ingrediente
- Filtrar por tipo de comida, compatibilidad u objetivo nutricional
- Ver información resumida de cada receta (foto, nutrición, tiempo)
- Acceder al detalle de una receta tocando su tarjeta
- Dar de alta una nueva receta

## Explicación de cada parte del prototipo

### Barra de búsqueda (arriba)
Campo rectangular ({rounded.md}) con fondo crema. Permite buscar por texto libre — nombre del plato o ingrediente. Los resultados se filtran en tiempo real.

### Filtros aplicados + botón de filtro
Debajo de la búsqueda se muestran **solo los filtros actualmente aplicados** como chips rectangulares verdes (ej: "Comida", "Sin gluten"). A la derecha hay un **botón con icono de embudo** (filtro) que abre un panel para seleccionar/deseleccionar filtros disponibles. Este patrón:
- Mantiene la zona limpia (no muestra filtros no usados)
- Indica de un vistazo qué filtros están activos
- Permite acceder fácilmente a más opciones con un tap

### Tarjetas de receta (listado)
Cada receta se muestra como una tarjeta blanca con:
- **Foto del plato** a la izquierda (miniatura cuadrada 64×64px con {rounded.md} y fondo de color cálido)
- **Barra lateral de color** (3px): indica el tipo de comida principal
- **Nombre del plato**: texto destacado
- **Badges de categoría**: tipo de comida + compatibilidad (Vegana, Sin gluten, etc.) — siempre en femenino
- **Badges nutricionales + tiempo**: kcal, proteínas (verde suave) y tiempo de preparación (fondo crema)
- **Dot verde** (esquina superior derecha): indica que esa receta está actualmente en uso en el menú vigente

### Botón "Nueva receta" (zona inferior)
Botón rectangular verde para dar de alta una receta nueva en el catálogo familiar.

### Tab bar (menú inferior)
Navegación fija con 🛒 "Compra" y "Recetas" activa en verde.

## Decisiones de diseño

- **Fotos de platos visibles** — Una miniatura por receta permite identificar visualmente el plato sin leer el nombre. Usa fondo de color cálido como placeholder hasta que el usuario suba una foto real.
- **Filtros solo los activos** — No se muestran todos los filtros posibles a la vez. Solo los aplicados aparecen como chips. El botón de embudo da acceso al resto. Esto reduce ruido visual.
- **Acceso contextual**: cuando el usuario llega desde el planificador (tocando un slot vacío de "comida"), el filtro "Comida" aparece pre-aplicado.
- **Etiquetas en femenino**: todas las compatibilidades usan la forma femenina (Vegana, Vegetariana) concordando con "receta".
- **Tiempo de preparación visible**: ayuda a decidir rápidamente si un plato es viable para un día con poco tiempo.
- **Search bar rectangular** ({rounded.md}): coherente con los botones del sistema. Los pills se reservan para badges nutricionales.
