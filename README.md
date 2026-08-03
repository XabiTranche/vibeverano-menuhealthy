# MenuFamiliaresHealthy — Diseño

## Descripción del proyecto

**MenuFamiliaresHealthy** es una aplicación móvil para planificar menús semanales familiares saludables. La app tiene en cuenta restricciones alimentarias (alergias, intolerancias), preferencias, objetivos nutricionales (perder peso, ganar masa muscular, mantenimiento) y genera automáticamente la lista de la compra a partir del menú aprobado.

## Estructura del proyecto

```
vibeverano-menuhealthy/
├── DESIGN.md                          ← Sistema de diseño (tokens + prosa)
├── README.md                          ← Este fichero
├── wireframes/                        ← SVG + explicación de cada pantalla
│   ├── README.md
│   ├── 01-planificador-semanal.svg + .md
│   ├── 02-catalogo-recetas.svg + .md
│   ├── 03-detalle-receta.svg + .md
│   ├── 04-lista-compra.svg + .md
│   └── 05-familia-configuracion.svg + .md
├── disenyo-pantallas/                 ← HTML + PDF entregables por pantalla
│   ├── 01-planificador-semanal.html + .pdf
│   ├── 02-catalogo-recetas.html + .pdf
│   ├── 03-detalle-receta.html + .pdf
│   ├── 04-lista-compra.html + .pdf
│   └── 05-familia-configuracion.html
├── prototipo-html/                    ← Prototipo interactivo HTML puro
│   └── index.html
├── prototipo-react/                   ← Prototipo interactivo React + Vite
│   ├── README.md
│   ├── package.json
│   └── src/
└── specs/                             ← Especificaciones funcionales
    ├── VibeVerano-menuhealthy.md
    ├── spec 001 - perfiles y criterios familiares.md
    ├── spec 002 - planificación semanal de menús.md
    ├── spec 003 - lista de la compra.md
    ├── spec 004 - ajustes sustituciones y seguimiento.md
    └── spec 005 - catálogo de recetas.md
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

- **SVG** (en `wireframes/`): Abrir en el navegador. Para PDF: Ctrl+P → "Guardar como PDF".
- **HTML entregable** (en `disenyo-pantallas/`): Abrir en navegador. SVG + explicación integrados.
- **Prototipo HTML interactivo** (en `prototipo-html/`): Abrir `index.html`. Navegación funcional entre las 5 pantallas.
- **Prototipo React** (en `prototipo-react/`): `npm install && npm run dev`. Navegación completa con React Router.

## Principios de diseño

1. **Mobile-first, una mano** — Uso vertical con el pulgar. Acciones siempre en la mitad inferior.
2. **Cálida y natural** — Fondo crema, tarjetas blancas, un solo verde como acento.
3. **Funcional, no decorativa** — La información guía la decisión.
4. **Touch targets generosos** — Mínimo 48-52px en toda zona interactiva.
5. **Estado siempre visible** — Badge de estado en el planificador (borrador/aprobada/modificada).

## Sistema de diseño

El sistema visual completo está en `DESIGN.md`, siguiendo el estándar [design.md de Google](https://github.com/nichochar/design.md).
