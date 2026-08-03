# Pantalla 2: Catálogo de Recetas

## Objetivo

Es el almacén de platos del hogar. Permite explorar, buscar y filtrar todas las recetas disponibles para encontrar rápidamente qué cocinar y asignarlo al plan semanal.

## ¿Qué puede hacer el usuario aquí?

- Buscar recetas por nombre de plato o ingrediente
- Filtrar por tipo de comida (desayuno, comida, cena, snack)
- Filtrar por compatibilidad (sin gluten, vegana, etc.)
- Ver información resumida de cada receta (nutrición + tiempo)
- Acceder al detalle de una receta tocando su tarjeta
- Dar de alta una nueva receta

## Explicación de cada parte del prototipo

### Barra de búsqueda (arriba)
Campo con forma pill y fondo crema. Permite buscar por texto libre — nombre del plato o ingrediente. Los resultados se filtran en tiempo real.

### Chips de filtro (debajo de la búsqueda)
Fila horizontal scrollable con filtros rápidos: "Todos", "Desayuno", "Comida", "Cena", "Sin gluten", etc. El filtro activo se muestra en verde con texto blanco; los inactivos en fondo crema. Se pueden combinar varios filtros.

### Tarjetas de receta (listado)
Cada receta se muestra como una tarjeta blanca con:
- **Barra lateral de color** (3px): indica el tipo de comida principal
- **Nombre del plato**: texto destacado
- **Badges de categoría**: tipo de comida + compatibilidad (Vegana, Sin gluten, etc.) — siempre en femenino
- **Badges nutricionales + tiempo**: kcal, proteínas (verde suave) y tiempo de preparación (fondo crema)
- **Dot verde** (esquina superior derecha): indica que esa receta está actualmente en uso en el menú vigente

### Botón "Nueva receta" (zona inferior)
Botón rectangular verde para dar de alta una receta nueva en el catálogo familiar.

### Tab bar (menú inferior)
Navegación fija con "Recetas" activa en verde.

## Decisiones de diseño

- **Sin fotos en el MVP** — la información funcional (nombre, nutrición, tiempo, compatibilidad) es suficiente para decidir. Las fotos se añadirán en fases posteriores.
- **Acceso contextual**: cuando el usuario llega desde el planificador (tocando un slot vacío de "comida"), el chip "Comida" aparece pre-seleccionado para ahorrar tiempo.
- **Etiquetas en femenino**: todas las compatibilidades usan la forma femenina (Vegana, Vegetariana) concordando con "receta".
- **Tiempo de preparación visible**: ayuda a decidir rápidamente si un plato es viable para un día con poco tiempo.
