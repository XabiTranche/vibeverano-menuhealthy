# MenuFamiliaresHealthy · Prototipo React

Prototipo navegable en React web, basado en `../DESIGN.md` y los wireframes de `../wireframes/`.

## Stack

- Vite
- React
- React Router
- Lucide React

## Pantallas incluidas

- `/plan` — ⭐ Planificador semanal (CORE)
- `/recetas` — Catálogo de recetas
- `/recetas/:recipeId` — Detalle de receta
- `/compra` — Lista de la compra
- `/familia` — Familia y configuración

## Diseño aplicado

- Tipografía: Nunito (400/600/700)
- Canvas: crema cálido #faf8f5
- Acento: verde bosque #2d7a4f (solo acciones)
- Botones: rectangulares con rounded 12px
- Tab bar: iconos outline negro → filled verde activo
- Filtros: solo activos visibles + botón embudo
- Recetas: con miniatura de foto
- Valores nutricionales: recuadros blancos grandes

## Arranque local

```bash
cd prototipo-react
npm install
npm run dev
```

Abrir la URL que muestre Vite (normalmente http://localhost:5173).

## Build

```bash
npm run build
```

## Notas

- Entra por `/` y redirige a `/plan`.
- Optimizada para móvil (390px), pero se puede ver en desktop con viewport móvil (F12 → responsive).
- Usa datos mock coherentes con las specs del proyecto.
- Tab bar con iconos SVG inline (outline inactivo / filled activo).
- Lista de la compra interactiva (tap para tachar).
- El detalle de receta NO muestra tab bar (es pantalla push).
