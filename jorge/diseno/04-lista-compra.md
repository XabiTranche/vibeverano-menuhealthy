# Pantalla 4: Lista de la Compra

## Objetivo

Checklist de ingredientes generada automáticamente a partir del menú semanal aprobado. Está diseñada para usarse con una mano en el supermercado: máxima legibilidad, gestos simples, sin distracciones.

## ¿Qué puede hacer el usuario aquí?

- Ver todos los ingredientes necesarios para la semana, agrupados por categoría
- Tachar ingredientes a medida que los va comprando (tap en el checkbox)
- Desmarcar un ingrediente si se tachó por error
- Ver de un vistazo cuántos items quedan por comprar (contador "3/14")
- Recibir aviso si la lista está desactualizada respecto al menú

## Explicación de cada parte del prototipo

### Título + referencia temporal
"Lista de la compra" como título principal, con la semana de referencia debajo ("Semana del 4 al 10 ago") y un contador de progreso ("3/14") en verde a la derecha.

### Headers de categoría
Etiquetas en uppercase y color muted que agrupan los ingredientes: VERDURAS, PROTEÍNAS, LÁCTEOS, etc. Sin fondo — solo texto para separar visualmente las secciones.

### Items pendientes
Tarjetas blancas de 52px de alto con:
- **Checkbox circular vacío** a la izquierda (borde gris suave)
- **Nombre del ingrediente** en texto principal (15px)
- **Cantidad** a la derecha en texto muted (1 kg, 4 uds, 300g...)

Al tocar cualquier parte del item, se tacha.

### Items comprados (tachados)
Misma estructura pero con:
- **Checkbox verde con ✓** blanco
- **Fondo crema cálido** (surface-warm) en vez de blanco
- **Texto tachado en muted** — baja la prioridad visual para que los pendientes destaquen

### Tab bar (menú inferior)
Navegación fija con 🛒 "Compra" activa en verde.

## Decisiones de diseño

- **Tipografía grande (15px)** — legible a distancia de brazo, bajo luces de supermercado
- **Zonas de tap de 52px** — se puede tachar sin mirar directamente la pantalla
- **Sin acciones complejas** — solo tap para tachar/destachar. No hay edición, no hay arrastre, no hay menús contextuales. La compra debe ser rápida.
- **Items tachados bajan visualmente** — el cambio de fondo (blanco → crema) + texto muted hace que lo pendiente siempre destaque sobre lo ya comprado
- **Agrupación por categoría de compra** — no por receta ni por día, sino por sección del supermercado (verduras, proteínas, lácteos) para optimizar el recorrido
