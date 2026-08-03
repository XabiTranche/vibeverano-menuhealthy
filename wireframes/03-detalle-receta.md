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

### Imagen del plato
Foto grande del plato a ancho completo (358×180px con {rounded.lg}) **debajo de los badges** de tipo/compatibilidad/tiempo. Ocupa un espacio visual prominente. Usa fondo de color cálido como placeholder hasta que el usuario suba una foto real.

### Título de la receta
Nombre del plato en tamaño display (28px bold) justo debajo del "← Volver", antes de la imagen.

### Badges de tipo, compatibilidad y tiempo
Chips estáticos rectangulares ({rounded.md}) entre el título y la imagen: tipo de comida (Comida), compatibilidad (Sin gluten, Alta en proteína) y **tiempo de preparación** (⏱ 30 min) en fondo crema. El tiempo aparece aquí — NO en la sección de valores nutricionales.

### Valores nutricionales
Cuatro recuadros grandes (82×52px) con **fondo blanco** y borde hairline. Cada uno muestra el valor en grande (18px bold) y la etiqueta debajo en muted (kcal, carbos, grasas, proteína). Destacan visualmente como fichas informativas.

### Lista de ingredientes
Lista vertical con bullet points. Cada ingrediente muestra nombre y cantidad. Tipografía de cuerpo (15px) para buena legibilidad.

### Compatibilidad familiar
Sección que valida automáticamente si la receta es apta para todos los miembros del hogar. Cada item es un recuadro con **fondo blanco** y borde hairline sutil:
- **Tick verde** (✓) a la izquierda en {colors.primary}
- **Texto en negro** ({colors.ink}) describiendo la compatibilidad

Ejemplo:
- ✓ Apto para toda la familia
- ✓ Sin alérgenos registrados
- ✓ Compatible con objetivo de Carlos (perder peso)

Si hay algún conflicto, el tick se sustituye por un icono ⚠ en {colors.warning} con la explicación (ej: "Contiene lactosa — restricción de Carlos").

### Porciones
Indica para cuántas personas está pensada la receta.

### Indicador "En uso"
Justo antes de los botones, un banner verde suave muestra en qué días/momentos del plan semanal está siendo usada esta receta (ej: "📅 En uso: Lunes 4 (comida), Jueves 7 (comida)"). Esto:
- Informa al usuario de que la receta está activa en el plan
- Explica por qué el botón "Eliminar" está deshabilitado (no se puede eliminar una receta en uso)

### Botón "Añadir al plan" (primary)
Rectangular verde, ancho completo. Al tocarlo se abre un selector (bottom sheet) donde se elige día + momento de comida.

### Botones "Editar" y "Eliminar" (secondary row)
Debajo del botón principal, dos botones en fila:
- **Editar** — rectangular con borde verde, fondo blanco. Abre el formulario de edición.
- **Eliminar** — botón danger ({component.button-danger}): rectangular con borde rojo ({colors.error}), fondo blanco, texto rojo. Solicita confirmación. **Si la receta está en uso**, el botón se muestra con opacidad reducida (40%) pero mantiene su estilo rojo — así el usuario sabe qué hará cuando se desbloquee.

## Decisiones de diseño

- **No tiene tab bar** — es una pantalla de navegación interna (push), no un destino directo del menú. Se vuelve atrás con "← Volver".
- **Compatibilidad familiar proactiva** — el sistema comprueba automáticamente si la receta choca con alguna restricción, sin que el usuario tenga que recordar quién tiene qué.
- **Botones en zona inferior** — al alcance del pulgar, siguiendo el patrón de toda la app.
