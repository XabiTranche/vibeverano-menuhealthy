---
version: alpha
name: MenuFamiliaresHealthy
description: "Un planificador semanal de comidas familiares que evoca la calidez de una cocina bien organizada con luz natural — estantes de madera clara, cerámica blanca, hierbas frescas en la ventana. La interfaz es una pizarra de menú doméstica digitalizada: cálida, legible, al alcance del pulgar."

colors:
  primary: "#2d7a4f"
  primary-pressed: "#236b42"
  primary-soft: "#e8f5ee"
  on-primary: "#ffffff"
  canvas: "#faf8f5"
  surface: "#ffffff"
  surface-warm: "#f5f0e8"
  ink: "#1a1a1a"
  body: "#3d3d3d"
  muted: "#7a7a72"
  muted-soft: "#a8a8a0"
  hairline: "#e8e4dc"
  hairline-soft: "#f0ece4"
  on-dark: "#ffffff"
  category-breakfast: "#f5a623"
  category-lunch: "#2d7a4f"
  category-dinner: "#5b4fa0"
  category-snack: "#d4763a"
  success: "#2a9d4e"
  warning: "#e6a817"
  error: "#c53030"

typography:
  display:
    fontFamily: Nunito
    fontSize: 28px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -0.3px
  heading-lg:
    fontFamily: Nunito
    fontSize: 22px
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: -0.2px
  heading-md:
    fontFamily: Nunito
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: 0
  heading-sm:
    fontFamily: Nunito
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: 0
  body-md:
    fontFamily: Nunito
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  body-sm:
    fontFamily: Nunito
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: 0
  label:
    fontFamily: Nunito
    fontSize: 12px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: 0.2px
  button:
    fontFamily: Nunito
    fontSize: 15px
    fontWeight: 700
    lineHeight: 1.0
    letterSpacing: 0
  caption:
    fontFamily: Nunito
    fontSize: 11px
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: 0.1px

rounded:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 20px
  full: 9999px

spacing:
  xxs: 2px
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  xxl: 32px
  section: 48px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 14px 24px
    height: 48px
  button-primary-pressed:
    backgroundColor: "{colors.primary-pressed}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 14px 24px
    height: 48px
  button-ghost:
    backgroundColor: transparent
    textColor: "{colors.primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 10px 16px
  button-danger:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.error}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 14px 24px
    height: 44px
  button-danger-disabled:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.error}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 14px 24px
    height: 44px
  meal-slot-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 12px 16px
  meal-slot-empty:
    backgroundColor: "{colors.surface-warm}"
    textColor: "{colors.muted}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.lg}"
    padding: 12px 16px
  day-header:
    backgroundColor: transparent
    textColor: "{colors.ink}"
    typography: "{typography.heading-md}"
    padding: 8px 0px
  recipe-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.heading-sm}"
    rounded: "{rounded.lg}"
    padding: 16px
  recipe-card-compact:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: 12px
  filter-chip:
    backgroundColor: "{colors.surface-warm}"
    textColor: "{colors.body}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: 8px 14px
  filter-chip-active:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: 8px 14px
  shopping-item:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: 14px 16px
    height: 52px
  shopping-item-checked:
    backgroundColor: "{colors.surface-warm}"
    textColor: "{colors.muted}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: 14px 16px
  category-header:
    backgroundColor: transparent
    textColor: "{colors.muted}"
    typography: "{typography.label}"
    padding: 12px 0px
  nutrient-badge:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.primary}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: 4px 10px
  time-badge:
    backgroundColor: "{colors.surface-warm}"
    textColor: "{colors.muted}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: 4px 10px
  tab-bar:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.muted}"
    typography: "{typography.caption}"
    height: 56px
  tab-bar-active:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    typography: "{typography.caption}"
  text-input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: 14px 16px
    height: 48px
  search-bar:
    backgroundColor: "{colors.surface-warm}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: 12px 20px
    height: 44px
  week-selector:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.heading-sm}"
    rounded: "{rounded.lg}"
    padding: 12px 16px
  week-status-badge:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.primary}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: 2px 10px
  week-status-badge-approved:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: 2px 10px
  week-status-badge-modified:
    backgroundColor: "{colors.warning}"
    textColor: "{colors.ink}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: 2px 10px
---

## Overview

Una pizarra de menú doméstica digitalizada para el bolsillo. La referencia visual no es una app de fitness ni un dashboard nutricional — es la cocina de alguien que cocina bien y tiene la semana organizada: un corcho con recetas fijadas, un calendario de nevera con los platos escritos a mano, un estante con tarros de cristal etiquetados.

El fondo es crema cálido ({colors.canvas} — papel de receta envejecido, nunca blanco frío). Las tarjetas de comida se elevan ligeramente sobre ese fondo como fichas de receta en cartulina blanca. El verde ({colors.primary}) aparece solo donde hay acción: el botón de aprobar menú, el "+" para añadir un plato, el check de la lista de la compra. Todo lo demás descansa en la calidez del crema y los grises cálidos.

La app se usa con una mano, en vertical, mientras se cocina o se compra. Cada zona de interacción vive en la mitad inferior de la pantalla. Las tarjetas son generosas al tacto (mínimo 48px de altura). El scroll es siempre vertical — no hay gestos horizontales complejos excepto el cambio de semana.

**Audiencia**: Persona responsable de la alimentación familiar (normalmente padre o madre), entre 30-50 años, que quiere comer bien sin perder una hora cada domingo decidiendo el menú.

**Sensación objetivo**: "Tengo la semana resuelta". Tranquilidad, no presión. Organización sin rigidez.

## Colors

Una paleta de un solo acento + neutros cálidos. El verde es el único color saturado del chrome — todo lo demás es crema, blanco y gris cálido. Los colores de categoría (desayuno, comida, cena, snack) son funcionales, no decorativos: aparecen solo como punto de color lateral o badge, nunca como fondo de superficie.

- **Primary** ({colors.primary} — #2d7a4f): Verde bosque cálido. El color de las hierbas frescas, no un verde neón de fitness. Aparece solo en CTAs, iconos activos y el tab seleccionado. Un uso por pantalla máximo como acción principal.
- **Primary Pressed** ({colors.primary-pressed} — #236b42): Estado presionado del verde.
- **Primary Soft** ({colors.primary-soft} — #e8f5ee): Tinte verdoso muy pálido para badges nutricionales y estados seleccionados sutiles.
- **On Primary** ({colors.on-primary} — #ffffff): Texto blanco sobre verde.
- **Canvas** ({colors.canvas} — #faf8f5): El fondo de toda la app. Crema papel — cálido, nunca frío. Evoca papel de receta envejecido al sol.
- **Surface** ({colors.surface} — #ffffff): Las tarjetas, la barra de tabs, los inputs. Blanco puro que se eleva visualmente sobre el crema.
- **Surface Warm** ({colors.surface-warm} — #f5f0e8): Superficie intermedia entre canvas y surface. Slots vacíos, search bar en reposo, filtros inactivos.
- **Ink** ({colors.ink} — #1a1a1a): Títulos y texto primario. Casi negro con calidez.
- **Body** ({colors.body} — #3d3d3d): Texto de cuerpo, descripciones.
- **Muted** ({colors.muted} — #7a7a72): Texto secundario, labels, placeholders.
- **Muted Soft** ({colors.muted-soft} — #a8a8a0): Texto terciario, texto deshabilitado.
- **Hairline** ({colors.hairline} — #e8e4dc): Separadores entre días, bordes de tarjeta cuando se necesitan.
- **Hairline Soft** ({colors.hairline-soft} — #f0ece4): Separadores más sutiles.

### Colores de categoría (funcionales)
- **Breakfast** ({colors.category-breakfast} — #f5a623): Naranja cálido — la energía del desayuno.
- **Lunch** ({colors.category-lunch} — #2d7a4f): Verde — se reutiliza el primary, la comida principal.
- **Dinner** ({colors.category-dinner} — #5b4fa0): Violeta suave — la calma de la cena.
- **Snack** ({colors.category-snack} — #d4763a): Terracota — algo entre horas.

Estos colores aparecen SOLO como indicadores laterales (una barra de 3px a la izquierda de la tarjeta) o como dot/badge. Nunca como fondo de tarjeta ni como texto.

### Semánticos
- **Success** ({colors.success}): Confirmaciones, menú aprobado.
- **Warning** ({colors.warning}): Lista desactualizada, datos incompletos.
- **Error** ({colors.error}): Restricción violada, eliminación.

## Typography

Una sola familia: **Nunito**. Su carácter redondeado refuerza la calidez orgánica de la marca sin perder legibilidad en tamaños pequeños en móvil. Los terminales redondeados de Nunito hacen que incluso los textos funcionales (labels, captions) se sientan amables.

La jerarquía se construye con 3 pesos: 400 (regular) para cuerpo, 600 (semibold) para subtítulos y énfasis, 700 (bold) para títulos y botones. No se usa nunca 300 ni 800 — la calidez está en el rango medio.

| Token | Tamaño | Peso | Uso principal |
|-------|--------|------|---------------|
| `{typography.display}` | 28px | 700 | Título de pantalla ("Mi semana") |
| `{typography.heading-lg}` | 22px | 700 | Secciones principales |
| `{typography.heading-md}` | 18px | 600 | Encabezado de día ("Lunes 4") |
| `{typography.heading-sm}` | 16px | 600 | Nombre de receta en tarjeta |
| `{typography.body-md}` | 15px | 400 | Texto de cuerpo, ingredientes |
| `{typography.body-sm}` | 13px | 400 | Descripción secundaria, metadata |
| `{typography.label}` | 12px | 600 | Etiquetas de categoría, headers de sección en lista |
| `{typography.button}` | 15px | 700 | Labels de botón |
| `{typography.caption}` | 11px | 500 | Datos nutricionales en badge, tab bar |

El tamaño base es 15px (no 16px) porque en móvil Nunito a 16px lee ligeramente grande para la densidad de información que necesita el planificador.

## Layout

### Sistema de espaciado
Base de 4px con escalas prácticas:

- `{spacing.xs}` (4px): separación mínima entre elementos inline.
- `{spacing.sm}` (8px): gap entre badges, entre icono y texto.
- `{spacing.md}` (12px): padding interno de tarjetas compactas.
- `{spacing.lg}` (16px): padding principal de tarjetas, gap entre tarjetas.
- `{spacing.xl}` (24px): gap entre secciones dentro de una pantalla.
- `{spacing.xxl}` (32px): margin horizontal de pantalla (safe area).
- `{spacing.section}` (48px): separación entre bloques mayores.

### Estructura de pantalla
- **Safe area horizontal**: 16px a cada lado (total 32px de contenido centrado).
- **Tab bar fija**: 56px de altura en la parte inferior, siempre visible.
- **Scroll vertical**: el único patrón de navegación de contenido.
- **Zona de acción primaria**: siempre en la mitad inferior de la pantalla, al alcance del pulgar.

### Grid del planificador semanal
El planificador es una lista vertical de días. Cada día es un bloque:
1. Header de día ({component.day-header}) con fecha
2. Slots de comida apilados verticalmente ({component.meal-slot-card} o {component.meal-slot-empty})
3. Separador hairline antes del siguiente día

No hay grid horizontal multi-columna — todo es single-column para uso con una mano.

### Touch targets
- Mínimo 48px de altura en toda zona interactiva (WCAG AAA).
- Botones primarios: 48px de alto.
- Tarjetas de slot: 52px mínimo.
- Items de lista de la compra: 52px.
- Tab bar icons: área de tap 44×44px dentro de la barra de 56px.

## Elevation & Depth

La profundidad es mínima y tonal, no basada en sombras pesadas.

| Nivel | Tratamiento | Uso |
|-------|------------|-----|
| 0 — Plano | Sin sombra, sin borde | Canvas, headers de día, separadores |
| 1 — Tarjeta | `box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)` | Tarjetas de meal-slot, recipe-cards, items de lista |
| 2 — Elevado | `box-shadow: 0 4px 12px rgba(0,0,0,0.06)` | Modals, bottom sheets, week-selector desplegado |
| 3 — Tab bar | `box-shadow: 0 -1px 0 {colors.hairline}` | Borde superior de la tab bar (sutil línea, no sombra) |

La profundidad viene del contraste entre el canvas crema y las tarjetas blancas. La sombra Nivel 1 es casi imperceptible — es el cambio de color (#faf8f5 → #ffffff) lo que crea la elevación percibida.

No hay sombras oscuras, no hay glassmorphism, no hay gradientes. El sistema es plano-plus-tono: las superficies se distinguen por su color de fondo, no por su sombra.

## Shapes

### Border Radius

| Token | Valor | Uso |
|-------|-------|-----|
| `{rounded.xs}` | 4px | Indicador lateral de categoría |
| `{rounded.sm}` | 8px | Inputs, tarjetas compactas de receta |
| `{rounded.md}` | 12px | Tarjetas de slot, items de lista |
| `{rounded.lg}` | 16px | Tarjetas principales, recipe cards, modals |
| `{rounded.xl}` | 20px | Bottom sheets |
| `{rounded.full}` | 9999px | Chips de filtro, search bar, badges nutricionales |

La geometría es **consistentemente suave**. No hay esquinas vivas en ningún elemento interactivo. Los botones primarios y secundarios usan {rounded.md} (12px) — rectangulares con esquinas suaves. Los chips de filtro y la search bar usan {rounded.full} (pill). Las tarjetas usan {rounded.lg} o {rounded.md}. El resultado es una app que se siente orgánica y amable — como objetos de cocina redondeados.

### Indicador lateral de categoría
Cada tarjeta de comida lleva una barra vertical de 3px de ancho y {rounded.xs} en su lado izquierdo, coloreada con el color de categoría correspondiente (breakfast/lunch/dinner/snack). Es el único punto de color fuerte en la tarjeta.

## Components

### Navegación

**`tab-bar`** — Barra inferior fija de 56px con 4 iconos outline: Planificador (calendario), Recetas (libro), Compra (carrito), Familia (personas). Fondo {colors.surface}, borde superior 1px {colors.hairline}. Iconos en {colors.ink} (outline, trazo 1.5px) con label en {typography.caption} y color {colors.muted}.

**`tab-bar-active`** — Tab seleccionado: icono **relleno** (filled) en {colors.primary} y label en {colors.primary}. El contraste entre outline (inactivo) y filled (activo) hace que el tab seleccionado destaque con claridad.

**`week-selector`** — Selector de semana en la parte superior del planificador. Muestra "Semana del 4 al 10 ago" con flechas izquierda/derecha. Tap en las flechas cambia de semana.

### Planificador semanal

**`day-header`** — Encabezado de cada día. Solo texto: "Lunes 4" en {typography.heading-md}. Sin fondo, sin tarjeta. El separador es el propio whitespace.

**`meal-slot-card`** — Tarjeta de una comida asignada. Fondo blanco, rounded {rounded.lg}, sombra Nivel 1. Contiene: barra lateral de categoría (3px color), nombre del plato en {typography.heading-sm}, indicador nutricional compacto en {component.nutrient-badge}. Mínimo 52px de alto. Tap abre detalle.

**`meal-slot-empty`** — Slot sin plato asignado. Fondo {colors.surface-warm}, rounded {rounded.lg}, sin sombra. Texto "Añadir desayuno" en {colors.muted}, icono "+" centrado. Tap abre catálogo filtrado por ese momento de comida.

### Catálogo de recetas

**`search-bar`** — Barra de búsqueda rectangular en la parte superior. Fondo {colors.surface-warm}, icono de lupa a la izquierda, esquinas {rounded.md}. Al enfocar cambia a {colors.surface} con borde 1px {colors.primary}.

**`filter-chip`** / **`filter-chip-active`** — Chips rectangulares ({rounded.md}) que muestran los filtros actualmente aplicados. Solo se ven los filtros activos (en verde con texto blanco). Un botón con icono de filtro (embudo) a la derecha permite abrir el panel de opciones para añadir o quitar filtros.

**`recipe-card`** — Tarjeta de receta en el catálogo. Fondo blanco, rounded {rounded.lg}, padding 16px. Contiene: foto del plato a la izquierda (miniatura cuadrada 64×64px con {rounded.md}), nombre del plato, etiquetas de tipo de comida y compatibilidad como badges, indicador nutricional y tiempo de preparación.

**`recipe-card-compact`** — Versión compacta para listas de resultados de búsqueda. Rounded {rounded.md}, padding 12px. Solo nombre + tipo + badge principal.

### Lista de la compra

**`shopping-item`** — Cada línea de la lista. Fondo blanco, rounded {rounded.md}, 52px de alto. Contiene: checkbox circular a la izquierda, nombre del ingrediente, cantidad a la derecha.

**`shopping-item-checked`** — Ítem tachado. Fondo {colors.surface-warm}, texto {colors.muted} con strikethrough.

**`category-header`** — Encabezado de sección en la lista ("Verduras", "Proteínas", "Lácteos"). Texto {colors.muted} en {typography.label}, uppercase. Sin fondo.

### Formularios

**`text-input`** — Input estándar. Fondo blanco, borde 1px {colors.hairline}, rounded {rounded.md}, 48px de alto. Focus: borde cambia a {colors.primary}.

### Badges y etiquetas

**`nutrient-badge`** — Badge pequeño pill con datos nutricionales compactos ("320 kcal", "25g prot"). Fondo {colors.primary-soft}, texto {colors.primary}.

**`time-badge`** — Badge pequeño pill con tiempo de preparación ("30 min", "1h 15"). Fondo {colors.surface-warm}, texto {colors.muted}. Siempre aparece junto a los nutrient-badges, en la misma fila. El fondo warm lo distingue visualmente de los badges nutricionales verdes.

**`filter-chip`** — Ya documentado arriba. Sirve también como etiqueta de compatibilidad dentro de recipe cards.

### Botones

**`button-primary`** — El CTA principal. Verde rectangular con esquinas {rounded.md} (12px), texto blanco bold, 48px alto. Siempre en zona inferior de pantalla. "Aprobar semana", "Añadir al plan", "+ Nueva receta", "Generar lista".

**`button-secondary`** — Alternativa al primary. Fondo blanco, texto y borde verde, rectangular {rounded.md}. "Regenerar", "Ver alternativas", "Editar receta".

**`button-ghost`** — Acción terciaria sin fondo ni borde visible. Solo texto verde. "Cancelar", "Saltar".

**`button-danger`** — Botón de acción destructiva. Fondo blanco, borde {colors.error} (rojo), texto {colors.error}, rectangular {rounded.md}. Se usa para "Eliminar". Cuando la acción no está disponible (ej: receta en uso), se muestra con opacidad reducida (40%) manteniendo el estilo rojo para que el usuario entienda qué hará el botón cuando se desbloquee.

## Do's and Don'ts

### Do
- **Do** mantener el verde solo para acciones. Si todo es verde, nada destaca. Un punto de verde por pantalla es suficiente como CTA.
- **Do** usar la barra lateral de color (3px) como único indicador cromático en tarjetas de comida. Es el "hilo de color" que da vida sin saturar.
- **Do** respetar el mínimo de 48px en toda zona de tap. La app se usa con el pulgar mientras se remueve la sopa.
- **Do** dejar que el canvas crema respire. No llenar toda la pantalla de tarjetas blancas — el crema entre tarjetas ES el ritmo visual.
- **Do** usar {typography.heading-md} para los encabezados de día en el planificador — lo suficientemente grande para escanear rápido la semana.
- **Do** confiar en la jerarquía tipográfica para comunicar importancia. No añadir colores extra ni iconos decorativos.

### Don't
- **Don't** usar el verde como fondo de superficie. El verde es acción, no ambiente.
- **Don't** usar los colores de categoría (breakfast, lunch, dinner, snack) como fondos de tarjeta. Solo aparecen en la barra lateral de 3px y en dots/badges mínimos.
- **Don't** usar sombras pesadas. La elevación viene del contraste canvas-crema vs tarjeta-blanca, no de drop-shadows.
- **Don't** poner acciones principales en la parte superior de la pantalla. El pulgar no llega. Las acciones viven abajo.
- **Don't** usar tipografía menor a 11px. Nunito pierde legibilidad por debajo de ese umbral en pantallas móviles.
- **Don't** añadir un segundo color de acento. El sistema es monocromático-cálido con un solo verde. Esa restricción ES el carácter.
- **Don't** hacer scroll horizontal en el planificador. Los días se apilan verticalmente, siempre.
- **Don't** usar bordes visibles en las tarjetas como estado por defecto. La elevación tonal (crema → blanco) es suficiente. Los bordes aparecen solo en focus/error.
