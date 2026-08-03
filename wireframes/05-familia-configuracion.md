# Pantalla 5: Familia y Configuración

## Objetivo

Gestionar los miembros del hogar con sus restricciones alimentarias, preferencias y objetivos nutricionales. Es la "base de datos" que alimenta la inteligencia del planificador — sin esta información, el sistema no puede generar menús personalizados.

## ¿Qué puede hacer el usuario aquí?

- Ver la lista de todos los miembros de la familia
- Consultar de un vistazo las restricciones y objetivos de cada persona
- Acceder al detalle de un miembro para editarlo
- Añadir nuevos miembros al hogar
- Configurar qué momentos de comida se planifican (desayuno, comida, cena, snack)
- Ver un resumen consolidado de todas las restricciones del hogar
- Comprobar si la familia tiene datos suficientes para planificar

## Explicación de cada parte del prototipo

### Banner de estado (arriba)
Indica si la familia está lista para generar menús:
- "✓ Lista para planificar" (fondo verde suave) — todos los miembros tienen datos mínimos
- "⚠ Faltan datos de [nombre]" (fondo amarillo) — hay información pendiente

### Tarjetas de miembro
Cada persona aparece como una tarjeta blanca con:
- **Avatar circular** con la inicial del nombre (fondo verde para el usuario principal, crema para los demás)
- **Nombre** y edad si es un niño
- **Objetivo** nutricional (Perder peso, Mantenimiento, etc.)
- **Badge de restricción** (🚫 Intolerancia lactosa, 🚫 Alergia frutos secos)
- **Flecha ›** a la derecha para acceder al detalle/edición

### Sección "Comidas del día"
Chips toggle rectangulares ({rounded.md}) que definen qué slots aparecerán en el planificador semanal:
- **Activos (verde)**: Desayuno, Comida, Cena — se incluyen en la planificación
- **Inactivos (crema)**: Snack — no se planifica (se puede activar tocándolo)

Esto permite adaptar la app a la operativa real de cada hogar.

### Resumen de restricciones del hogar
Lista consolidada de todas las restricciones activas de la familia con el nombre del miembro entre paréntesis. Así el usuario ve de un vistazo qué debe evitar el sistema al generar menús.

### Botón "Añadir miembro" (zona inferior)
Rectangular verde para dar de alta un nuevo miembro del hogar.

### Tab bar (menú inferior)
Navegación fija con 👥 "Familia" activa en verde.

## Decisiones de diseño

- **Se visita poco pero es esencial** — la pantalla se configura al principio y se toca ocasionalmente cuando hay cambios. Por eso está en la 4ª posición del tab bar.
- **Resumen de restricciones consolidado** — el usuario no debería tener que recordar quién tiene qué. El sistema lo muestra junto para generar tranquilidad.
- **Chips de comidas del día editables** — no todos los hogares cenan o toman snack. La flexibilidad reduce slots innecesarios en el planificador.
- **Avatar con inicial** — simple, sin necesidad de fotos ni configuración compleja en el MVP.
