# Pantalla 3: Detalle de Receta

## Objetivo

Muestra toda la información de un plato concreto: ingredientes, valores nutricionales, tiempo de preparación y compatibilidad con la familia. Desde aquí se puede asignar la receta al plan semanal o editarla.

## ¿Qué puede hacer el usuario aquí?

- Ver el nombre completo y tipo de comida de la receta
- Consultar los valores nutricionales detallados (kcal, carbohidratos, grasas, proteínas)
- Ver el tiempo de preparación aproximado
- Revisar la lista completa de ingredientes con cantidades
- Comprobar si la receta es compatible con las restricciones de toda la familia
- Añadir la receta a un día/momento concreto del plan semanal
- Editar la receta (ingredientes, nutrición, etiquetas)

## Explicación de cada parte del prototipo

### Botón "← Volver" (arriba izquierda)
Vuelve a la pantalla anterior (catálogo o planificador). Texto verde sin fondo.

### Título de la receta
Nombre del plato en tamaño display (28px bold). Es el elemento visual más destacado de la pantalla.

### Badges de tipo y compatibilidad
Chips estáticos que muestran: tipo de comida (Comida, Cena, etc.) y etiquetas de compatibilidad/objetivo (Sin gluten, Alta en proteína). Fondo crema, sin acción.

### Valores nutricionales + tiempo
Fila de 5 badges pill:
- **4 verdes** (kcal, carbohidratos, grasas, proteínas): datos nutricionales por porción
- **1 crema** (tiempo): duración aproximada de preparación

### Lista de ingredientes
Lista vertical con bullet points. Cada ingrediente muestra nombre y cantidad. Tipografía de cuerpo (15px) para buena legibilidad.

### Compatibilidad familiar
Sección que valida automáticamente si la receta es apta para todos los miembros del hogar:
- ✓ Apto para toda la familia
- ✓ Sin alérgenos registrados
- ✓ Compatible con objetivos de cada miembro

Si hay algún conflicto, aparece un icono ⚠ con la explicación (ej: "Contiene lactosa — restricción de Carlos").

### Porciones
Indica para cuántas personas está pensada la receta.

### Botón "Añadir al plan" (primary)
Rectangular verde. Al tocarlo se abre un selector (bottom sheet) donde se elige día + momento de comida.

### Botón "Editar receta" (secondary)
Rectangular con borde verde, fondo blanco. Abre el formulario de edición de la receta.

## Decisiones de diseño

- **No tiene tab bar** — es una pantalla de navegación interna (push), no un destino directo del menú. Se vuelve atrás con "← Volver".
- **Compatibilidad familiar proactiva** — el sistema comprueba automáticamente si la receta choca con alguna restricción, sin que el usuario tenga que recordar quién tiene qué.
- **Botones en zona inferior** — al alcance del pulgar, siguiendo el patrón de toda la app.
