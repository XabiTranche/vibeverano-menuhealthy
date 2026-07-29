# design.md

## Proyecto
VibeVerano MenuHealthy

## Objetivo del documento
Definir la dirección visual, de interacción y de sistema UI para la app móvil de VibeVerano MenuHealthy, basándose en las specs reales del repositorio.

Este documento traduce producto a diseño para una app que debe cubrir 5 bloques funcionales:

1. perfiles familiares y criterios alimentarios;
2. planificación semanal de menús;
3. lista de la compra;
4. ajustes y sustituciones;
5. catálogo de recetas, ingredientes y valores nutricionales.

---

## Lectura del producto
VibeVerano MenuHealthy no es una app de recetas al uso ni una app de fitness.

Su territorio es este:

**organizar la alimentación real de un hogar con menos carga mental, menos fricción y mejor criterio.**

Debe equilibrar:
- claridad operativa;
- calidez doméstica;
- credibilidad nutricional;
- velocidad de uso móvil.

La app debe sentirse útil tanto en casa como en el supermercado.

---

## North star de diseño
**"Resolver la semana alimentaria del hogar de forma clara, tranquila y accionable."**

La sensación final debe ser:
- ordenada;
- fiable;
- humana;
- ligera;
- nada clínica;
- nada caótica.

---

## Usuario principal
### Primary persona
Persona adulta responsable de decidir, revisar o ejecutar la alimentación del hogar.

### Contextos de uso
- ratos cortos;
- móvil en vertical;
- cocina;
- sofá;
- supermercado;
- pausas del trabajo;
- momentos de revisión semanal.

### Necesidades UX derivadas
- entender rápido el estado del plan;
- ver qué falta para poder planificar;
- aprobar una semana sin dudas;
- consultar o editar recetas sin perder contexto;
- usar la lista de la compra como herramienta táctica real.

---

## Posicionamiento visual
### Fórmula recomendada
**producto operativo + bienestar cálido + frescura mediterránea contenida**

### Sí debe transmitir
- confianza;
- limpieza;
- calma;
- comida real;
- control del hogar;
- inteligencia práctica.

### No debe transmitir
- dieta rígida;
- app clínica;
- blog de recetas decorativo;
- app infantil o juguetona;
- panel analítico frío.

---

## Principios de diseño
1. **La semana es el objeto central.**
2. **La receta es un activo operativo, no un adorno.**
3. **Borrador, aprobado y desactualizado deben distinguirse al instante.**
4. **Las restricciones obligatorias nunca pueden quedar ambiguas.**
5. **La app debe ayudar a decidir, no solo mostrar datos.**
6. **La lista de la compra es una herramienta de acción, no una vista secundaria.**
7. **El diseño debe soportar complejidad sin parecer complejo.**
8. **Catálogo, planificación y compra deben sentirse conectados.**
9. **Una pantalla, una acción principal, un estado prioritario.**

---

## Estilo visual recomendado
### Estilo base
**Flat funcional con profundidad sutil**

### Motivo
El producto mezcla:
- formularios estructurados;
- listas;
- catálogo consultable;
- estados semánticos;
- tareas recurrentes de planificación.

Conviene una base sobria con relieve mínimo, no una mezcla ambigua de estilos ni una capa decorativa pesada.

### Características visuales
- fondos claros y respirados;
- cards limpias;
- jerarquía fuerte por bloques;
- iconografía outline consistente;
- color con intención, no como decoración;
- sombras cortas y suaves;
- badges solo cuando aporten de verdad.

---

## Paleta de color
### Core palette
- **Primary / Sage Green:** `#059669`
- **Primary Pressed:** `#047857`
- **Secondary / Fresh Green:** `#10B981`
- **Accent / Terracotta:** `#EA580C`
- **Accent Soft / Apricot:** `#FDBA74`
- **Info / Trust Blue:** `#2563EB`
- **Background / Mint Mist:** `#ECFDF5`
- **Surface / Card:** `#FFFFFF`
- **Surface Alt:** `#F0F8F6`
- **Text Primary:** `#0F172A`
- **Text Secondary:** `#64748B`
- **Border:** `#E1F2ED`
- **Success:** `#16A34A`
- **Warning:** `#D97706`
- **Error:** `#DC2626`

### Lógica cromática
- verde = salud, progreso, confirmación, compatibilidad;
- terracota = comida real, calidez, acento de acción;
- azul = explicación y soporte informativo;
- rojo = bloqueo o conflicto obligatorio.

### Regla de uso
Reservar el color fuerte para estados críticos y CTA principal. No crear capas semánticas paralelas con demasiado color.

---

## Dark mode
Soportado, pero secundario.

### Base dark
- Background: `#0B1220`
- Surface: `#111827`
- Surface Alt: `#172033`
- Text Primary: `#F8FAFC`
- Text Secondary: `#94A3B8`
- Border: `#233047`
- Primary: `#34D399`
- Accent: `#FB923C`

### Regla
Mantener la sensación cálida y legible. No invertir colores sin criterio.

---

## Tipografía
### Recomendación principal
- **UI base:** Inter
- **Acento editorial opcional:** solo para onboarding o piezas de marca, nunca para pantallas núcleo.

### Uso
- Inter: navegación, inputs, listas, cards, estados, checklist, catálogo, compra y copy operativo.
- El acento editorial, si existe, debe quedarse fuera del núcleo funcional.

### Razón
La app tiene bastante densidad funcional. Conviene priorizar neutralidad, legibilidad y consistencia.

### Escala sugerida
- Display: 32/36
- Screen title: 28/32
- Section title: 22/28
- Card title: 18/24
- Body: 16/24
- Small body: 14/20
- Label: 12/16
- Badge: 11/14

### Regla
La tipografía debe bajar carga cognitiva, no añadir carácter innecesario.

---

## Grid, spacing y forma
### Sistema
- unidad base: 4
- ritmo principal: 8 / 12 / 16 / 24 / 32
- touch target mínimo: 44x44
- radio pequeño: 12
- radio estándar: 16
- radio de card principal: 20
- radio de bottom sheet: 24 superior

### Sombra
- y: 6
- blur: 18
- opacity: 0.08–0.12

Nada de neumorphism profundo ni blur decorativo fuerte.

---

## Iconografía
### Estilo
- outline consistente;
- stroke 1.75–2;
- tamaño base 20–24;
- familia tipo Lucide o equivalente.

### Regla
Nada de emojis como iconografía de producto.

---

## Ilustración y fotografía
### Ilustración
Usar solo en:
- onboarding;
- empty states;
- estados positivos ligeros.

Estilo:
- formas orgánicas simples;
- cocina, vegetales, utensilios, hogar;
- color plano con acentos suaves;
- sin sobrecarga.

### Fotografía
Solo como apoyo puntual en recetas.
No basar la identidad en fotografía food-delivery o stock culinario.

---

## Arquitectura de información principal
Las specs reales definen 5 dominios funcionales, pero **no deben traducirse a 5 tabs top-level**.

### Navegación principal recomendada
**Bottom navigation de 4 items**

1. **Plan**
2. **Recetas**
3. **Compra**
4. **Familia**

### Decisión fuerte
La vista **Hoy** no debe ser un tab independiente. Debe integrarse como:
- landing por defecto dentro de **Plan**;
- bloque superior resumido de estado actual;
- acceso rápido a próxima comida, ajustes y compra.

### Motivo
Reduce sobrecarga de navegación y evita inflar el top-level con una vista resumen que puede vivir mejor dentro del flujo semanal.

### Función de cada área
#### Plan
- resumen de hoy;
- semana actual y próximas;
- generar, regenerar, aprobar;
- ver por qué encaja;
- editar comidas.

#### Recetas
- catálogo;
- búsqueda;
- filtros por tipo de comida, compatibilidad y objetivos;
- alta/edición;
- bloque nutricional manual.

#### Compra
- lista consolidada;
- checklist;
- categorías;
- estado vigente/desactualizada;
- cambios tras ajustes.

#### Familia
- miembros;
- restricciones;
- preferencias;
- objetivos;
- estado de completitud;
- ajustes generales.

---

## Flujos principales
### 1. Alta del hogar
Objetivo: empezar sin fatiga.

#### UX
- flujo por pasos cortos;
- 1 pregunta principal por pantalla;
- barra de progreso;
- guardar y seguir luego;
- feedback claro de completitud.

#### Visual
- cards;
- chips para restricciones/preferencias cuando ayuden;
- CTA fijo inferior;
- copy sereno y claro.

### 2. Configuración de miembros
Debe evitar parecer un CRM o una hoja clínica.

#### Pattern
- cards por miembro;
- avatar simple o inicial;
- sin color coding por miembro;
- criterios resumidos por texto + icono + estructura;
- bloques expandibles.

### 3. Estado “listo para planificar”
Debe responder sin dudas si ya se puede generar menú.

#### Pattern
- checklist de mínimos;
- diferencia clara entre obligatorio y recomendado;
- copy de acción: qué falta exactamente.

### 4. Generación y revisión del plan semanal
Pantalla núcleo del producto.

#### Estructura
- selector de semana arriba;
- estado visible: sin generar / borrador / aprobado / ajustado;
- resumen global;
- lista de días;
- cada día con bloques de comidas;
- CTA principal según estado.

#### Decisiones UX
- no usar calendario complejo como vista principal;
- no usar drag & drop en MVP;
- no usar swipe oculto como acción nuclear;
- abrir detalle o sustitución por tap claro.

### 5. Catálogo de recetas
Debe sentirse como una librería operativa.

#### Necesidades que vienen del repo
- alta de receta;
- edición de ingredientes y cantidades;
- tipo de comida;
- compatibilidad con restricciones;
- etiquetas por objetivo;
- valores nutricionales manuales;
- búsqueda por nombre o ingrediente;
- bloqueo de borrado si la receta está en uso.

#### UI pattern recomendado
- header con buscador prominente;
- filtros simples visibles;
- cards/list items compactos;
- compatibilidades y objetivos solo cuando aporten decisión;
- indicador claro de receta en uso;
- CTA “Nueva receta” visible.

#### Vista de receta
- nombre;
- tipo de comida;
- ingredientes y cantidades;
- bloque nutricional;
- compatibilidades y objetivos;
- estado de uso en planificaciones;
- editar / duplicar / borrar si aplica.

### 6. Lista de la compra
Debe ser la pantalla más táctica de toda la app.

#### Pattern
- agrupación por categorías;
- líneas consolidadas;
- checkbox grande;
- opción “ya lo tengo” clara;
- indicador de lista desactualizada si cambia el menú;
- posibilidad de ver diff de cambios.

#### Visual
- más densa que otras vistas;
- menos decorativa;
- sticky resumen opcional;
- foco absoluto en acción rápida.

### 7. Ajustes y sustituciones
#### Pattern
- bottom sheet para sustitución rápida;
- explicación de compatibilidad;
- warning si rompe restricciones;
- confirmación clara si afecta a compra o menú.

### 8. Seguimiento básico
No debe parecer analítica pesada.

#### Pattern
- estados rápidos: hecho / no hecho / cambiado;
- tarjetas sencillas;
- sin tono moralizante.

---

## Componentes clave
### Buttons
- primary: verde lleno, blanco;
- secondary: surface + borde;
- tertiary: texto + icono;
- destructive: rojo solo para acciones realmente peligrosas.

### Chips y badges
Usarlos con contención.

Tipos prioritarios:
- conflicto;
- aprobado / borrador / desactualizado;
- en uso;
- pendiente.

No badgear cada detalle si puede resolverse mejor con texto y jerarquía.

### Cards
La card es la pieza base del sistema.

Debe soportar:
- título;
- subtítulo;
- metadata;
- estado;
- acción contextual;
- alerta o bloqueo.

### Inputs
- labels visibles siempre;
- helper text cuando el dato pueda generar dudas;
- validación on blur;
- campos nutricionales agrupados por bloque;
- cantidades y unidades juntas.

### Search + filters
Críticos en Recetas.

Patrón recomendado:
- búsqueda sticky;
- filtros simples visibles;
- filtros avanzados en bottom sheet solo si hacen falta.

### Bottom sheets
Reducirlos a 2 usos principales:
- filtros;
- acciones rápidas de sustitución.

Confirmaciones con impacto y cambios serios, mejor en modal claro o pantalla dedicada.

---

## Sistema de estados
### Estado de configuración familiar
- incompleto;
- suficiente para planificar;
- requiere revisión.

### Estado de menú
- sin generar;
- borrador;
- aprobado;
- ajustado tras aprobación.

### Estado de lista de compra
- no generada;
- generada;
- ajustada;
- desactualizada.

### Estado de receta
- normal;
- en uso;
- bloqueada para borrado;
- incompleta nutricionalmente.

### Estados de error y recuperación
- sin conexión;
- guardado fallido;
- conflicto al regenerar menú;
- lista desactualizada por cambio de menú;
- receta con datos parciales;
- sin resultados;
- catálogo vacío.

### Regla
El color se reserva para estados críticos. El resto debe apoyarse sobre todo en jerarquía, texto e icono.

---

## Jerarquía de información por módulo
### Familia
1. miembros
2. restricciones obligatorias
3. objetivos
4. preferencias y rechazos
5. faltantes para planificar

### Plan
1. estado de la semana
2. siguiente acción
3. comidas por día
4. explicación del encaje
5. ajustes y sustituciones

### Recetas
1. nombre y tipo
2. compatibilidades relevantes
3. ingredientes
4. bloque nutricional
5. estado de uso
6. acciones

### Compra
1. qué falta comprar
2. agrupación por categorías
3. cambios respecto al menú anterior
4. check de completado o ya disponible

---

## Diseño específico del catálogo de recetas
El repo deja claro que las recetas no solo se consultan: se **gestionan como base de datos funcional del sistema**.

### Consecuencias de diseño
- la búsqueda debe ser excelente;
- la edición debe ser rápida;
- los datos nutricionales manuales deben verse serios pero simples;
- el usuario debe entender si una receta es segura para ciertos perfiles;
- borrar una receta en uso debe comunicar impacto real.

### Estructura recomendada de la ficha de receta
1. cabecera con nombre + tipo de comida;
2. compatibilidades y objetivos cuando sean decisivos;
3. ingredientes con cantidad y unidad;
4. bloque nutricional manual;
5. uso actual en planes;
6. acciones.

### Edición de receta
Usar layout por secciones, no formulario largo plano:
- datos básicos;
- ingredientes;
- nutrición;
- compatibilidad;
- objetivos.

---

## Motion
### Principio
La animación orienta y confirma. No decora.

### Timing
- microinteracciones: 180–220ms
- sheets/modales: 240–300ms
- feedback success: 160–200ms

### Efectos válidos
- fade;
- translate corto;
- expansión suave;
- press scale 0.98;
- skeleton discreto.

### Evitar
- bounce grande;
- largos delays;
- carrusel vistoso;
- animaciones que oculten latencia real.

### Haptics
Sí, pero con criterio en:
- aprobar menú;
- confirmar sustitución;
- completar acciones de compra;
- guardar receta importante.

---

## Copy UI
### Tono
- claro;
- sereno;
- nada culpabilizador;
- útil;
- sin jerga clínica salvo necesidad.

### Buenos ejemplos
- “Ya puedes generar la semana”
- “Faltan 2 datos obligatorios para planificar con seguridad”
- “Esta receta sigue siendo compatible con el perfil sin gluten”
- “La lista cambió tras ajustar la cena del jueves”
- “No puedes borrar esta receta porque está en un menú activo”

### Evitar
- lenguaje fitness agresivo;
- copy moralista;
- celebraciones exageradas;
- tecnicismos nutricionales innecesarios.

---

## Accesibilidad
Obligatoria desde la base.

### Reglas mínimas
- contraste AA;
- body mínimo 16px;
- targets 44x44 mínimo;
- no depender solo del color;
- labels visibles;
- soporte Dynamic Type;
- reduced motion;
- orden de foco lógico;
- icon-only buttons con label accesible.

### Especialmente importante aquí
- estados como borrador/aprobado/desactualizado;
- compatibilidad de receta;
- conflicto de restricción;
- checklist de compra.

---

## React Native / implementación visual
### Recomendación
- React Navigation;
- bottom tabs para top-level;
- safe areas bien resueltas;
- bottom sheets consistentes;
- listas optimizadas;
- design tokens desde el principio.

### Reglas con impacto de producto
- no hardcodear colores por pantalla;
- tipar navegación;
- preservar estado al volver atrás;
- soporte deep linking futuro para semana, receta y compra;
- reservar espacio correcto para barra inferior y home indicator.

---

## Inspiración “freelitics”
No he podido inspeccionar el sitio desde este entorno por error de conexión, así que no conviene fijar rasgos visuales literales a ciegas.

La inspiración útil que sí mantendría es conceptual:
- jerarquía limpia;
- sensación de producto serio;
- claridad estructural;
- decisión visual sobria.

Para VibeVerano hay que mezclar eso con más calidez, más señal de hogar y más humanidad alimentaria.

---

## Anti-patrones a evitar
- esconder Recetas como submódulo secundario;
- convertir “Hoy” en tab independiente si sobrecarga navegación;
- visual de app clínica;
- saturar con fotos de comida;
- usar demasiados colores semánticos a la vez;
- esconder conflictos en modales tardíos;
- no diferenciar visualmente receta en uso vs receta borrable;
- convertir compra en una lista plana sin jerarquía;
- hacer formularios de receta demasiado largos y cansinos.

---

## Prioridades visuales del MVP
1. onboarding y setup claros;
2. estado de completitud familiar;
3. semana utilizable;
4. catálogo de recetas navegable y editable;
5. lista de compra impecable;
6. sustituciones comprensibles;
7. estados críticos muy visibles;
8. errores y recuperación bien resueltos.

### Puede esperar
- ilustración compleja;
- analítica avanzada;
- motion sofisticado;
- personalización cosmética extensa;
- integraciones post-MVP tipo API nutricional externa.

---

## Decisiones fuertes recomendadas
1. **Bottom nav de 4 tabs** con “Hoy” absorbido dentro de Plan.
2. **Recetas como área principal**, no escondida.
3. **Card system como lenguaje base** en casi toda la app.
4. **Color cálido contenido**, no exceso de verdes ni semánticas duplicadas.
5. **Estados críticos muy visibles**, pero sin badgear todo.
6. **Lista de compra orientada a acción**, no a lectura.
7. **Fichas de receta estructuradas por secciones**, no por form largo único.
8. **Una sola acción principal por pantalla** siempre que sea posible.

---

## Resumen ejecutivo
VibeVerano MenuHealthy debe verse como una **herramienta doméstica premium, clara y fiable**, con sensibilidad de bienestar y una capa cálida alimentaria, pero sin caer en lo clínico ni en lo decorativo.

La combinación recomendada es:
- **flat funcional con profundidad sutil** como base;
- **verde saludable + terracota** como sistema cromático;
- **Inter como tipografía principal**;
- **bottom nav de 4 áreas**;
- **cards, estados e iconografía clara** como gramática principal;
- **Recetas como módulo central real**, porque el repo confirma que es infraestructura funcional del producto.
