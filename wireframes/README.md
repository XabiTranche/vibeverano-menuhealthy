# Wireframes — MenuFamiliaresHealthy

Wireframes visuales de alta fidelidad basados en `../DESIGN.md`.

## Criterios aplicados

- Semana como objeto central
- Bottom navigation de 4 áreas: Plan, Recetas, Compra, Familia
- Una acción principal por pantalla
- Estados visibles: borrador, aprobado, modificado
- Lista de compra como herramienta táctica real
- Catálogo de recetas con foto, filtros activos + botón embudo
- Perfiles familiares claros, no clínicos
- Sustitución rápida con icono ⇄

## Pantallas incluidas

| # | Ficheros | Descripción |
|---|----------|-------------|
| ⭐ | `01-planificador-semanal.svg` + `.md` | Vista core de semana con slots por día |
| 2 | `02-catalogo-recetas.svg` + `.md` | Catálogo con búsqueda, filtros y fotos |
| 3 | `03-detalle-receta.svg` + `.md` | Ficha completa con nutrición y compatibilidad |
| 4 | `04-lista-compra.svg` + `.md` | Lista agrupada por categoría con checkboxes |
| 5 | `05-familia-configuracion.svg` + `.md` | Miembros, restricciones y comidas del día |

## Uso

- Abrir los `.svg` en el navegador para verlos a tamaño real de móvil (390px)
- Los `.md` contienen la explicación detallada de cada pantalla
- Para PDF: abrir SVG en navegador → Ctrl+P → "Guardar como PDF"
- Los HTML integrados (SVG + explicación) están en `../disenyo-pantallas/`

## Relación con otros artefactos

- **DESIGN.md** (`../DESIGN.md`): Sistema de diseño con tokens y reglas
- **Prototipo HTML** (`../prototipo-html/index.html`): Versión interactiva navegable
- **Prototipo React** (`../prototipo-react/`): Versión React con navegación completa
