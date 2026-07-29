# VibeVerano MenuHealthy · Prototype React

Prototipo navegable en React web, basado en `design.md` y los wireframes de `wireframes/`.

## Stack

- Vite
- React
- React Router
- Lucide React

## Pantallas incluidas

- `/alta-hogar`
- `/plan`
- `/plan/:daySlug`
- `/recetas`
- `/recetas/:recipeId`
- `/compra`
- `/familia`
- `/sustitucion-rapida`

## Arranque local

```bash
cd prototype-react
npm install
npm run dev
```

Abrir la URL que muestre Vite.

## Build

```bash
cd prototype-react
npm run build
```

## Notas

- Entra por `/` y redirige a `/alta-hogar`.
- Está optimizada para móvil, pero se puede recorrer bien en desktop simulando un viewport móvil.
- Usa datos mock coherentes para enseñar el flujo completo entre planificación, recetas, compra y familia.
