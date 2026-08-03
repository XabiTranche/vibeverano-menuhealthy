# Diseño — MenuFamiliaresHealthy

## Descripción del proyecto

**MenuFamiliaresHealthy** es una aplicación móvil para planificar menús semanales familiares saludables. La app tiene en cuenta restricciones alimentarias (alergias, intolerancias), preferencias, objetivos nutricionales (perder peso, ganar masa muscular, mantenimiento) y genera automáticamente la lista de la compra a partir del menú aprobado.

## Contenido de esta carpeta

```
diseno/
├── DESIGN.md                          ← Sistema de diseño (tokens + prosa)
├── README.md                          ← Este fichero
├── 01-planificador-semanal.svg        ← ⭐ Prototipo visual pantalla core
├── 01-planificador-semanal.md         ← Explicación pantalla core
├── 02-catalogo-recetas.svg            ← Prototipo visual catálogo
├── 02-catalogo-recetas.md             ← Explicación catálogo
├── 03-detalle-receta.svg              ← Prototipo visual detalle
├── 03-detalle-receta.md               ← Explicación detalle
├── 04-lista-compra.svg                ← Prototipo visual lista
├── 04-lista-compra.md                 ← Explicación lista
├── 05-familia-configuracion.svg       ← Prototipo visual familia
├── 05-familia-configuracion.md        ← Explicación familia
└── prototipo-html/
    └── index.html                     ← Prototipo interactivo (5 pantallas con navegación)
```

## Pantallas

| # | Pantalla | Descripción |
|---|----------|-------------|
| ⭐ | **Planificador Semanal** | Vista principal: ver y gestionar la semana de comidas |
| 2 | **Catálogo de Recetas** | Explorar, buscar y filtrar platos disponibles |
| 3 | **Detalle de Receta** | Info completa de un plato y asignarlo al plan |
| 4 | **Lista de la Compra** | Checklist de ingredientes para el supermercado |
| 5 | **Familia y Configuración** | Miembros, restricciones y objetivos del hogar |

## Navegación

Tab bar inferior con 4 destinos:
- 📅 **Plan** — Planificador Semanal (pantalla core)
- 📖 **Recetas** — Catálogo
- 🛒 **Compra** — Lista de la compra
- 👥 **Familia** — Configuración del hogar

## Cómo ver los prototipos

- **SVG**: Abrir en el navegador (doble click o arrastrar). Se ven a tamaño real de móvil. Para PDF: Ctrl+P → "Guardar como PDF".
- **Prototipo HTML interactivo**: Abrir `prototipo-html/index.html` en el navegador. Incluye navegación funcional entre las 5 pantallas y lista de la compra interactiva.

## Principios de diseño

1. **Mobile-first, una mano** — Uso vertical con el pulgar. Acciones siempre en la mitad inferior.
2. **Cálida y natural** — Fondo crema, tarjetas blancas, un solo verde como acento.
3. **Funcional, no decorativa** — Sin fotos en MVP. La información guía la decisión.
4. **Touch targets generosos** — Mínimo 48-52px en toda zona interactiva.
5. **Estado siempre visible** — Badge de estado en el planificador (borrador/aprobada/modificada).

## Sistema de diseño

El sistema visual completo está en `DESIGN.md`, siguiendo el estándar [design.md de Google](https://github.com/nichochar/design.md).
