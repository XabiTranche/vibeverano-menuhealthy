# Especificación de Feature: Catálogo de recetas, alimentos y valores nutricionales

**Feature Branch**: `005-catalogo-recetas-alimentos-valores-nutricionales`
**Creada**: 2026-07-20
**Estado**: Convergido
**Última revisión**: 2026-08-10
**Input**: Historias de usuario de app-nutricion (alta de recetas, búsqueda, listado, consulta API valores nutricionales, notificación de cambios) adaptadas al modelo familiar de MenuFamiliaresHealthy.

## Escenarios de usuario y pruebas *(obligatorio)*

### Historia de Usuario 1 - Dar de alta recetas familiares (Prioridad: P1)

Como responsable de la alimentación del hogar, quiero dar de alta recetas especificando nombre, ingredientes con cantidades, número de raciones, tipo de comida, aporte nutricional y compatibilidad con restricciones familiares, para disponer de un catálogo propio con el que planificar menús semanales.

**Por qué esta prioridad**: sin recetas dadas de alta no hay material sobre el que construir la planificación semanal (spec 002). Es la base de datos del sistema.

**Test independiente**: crear una receta completa con ingredientes, raciones, tipo de comida, aporte nutricional y etiquetas de compatibilidad, y verificar que queda guardada y visible en el catálogo familiar.

**Escenarios de aceptación**:
1. **Dado** un hogar ya creado (spec 001), **Cuando** la persona responsable crea una nueva receta con nombre, ingredientes (del catálogo maestro) con cantidades, número de raciones, tipo de comida y aporte nutricional, **Entonces** la receta queda guardada dentro del catálogo familiar y aparece en el listado.
2. **Dado** un hogar con restricciones definidas, **Cuando** la persona responsable crea una receta, **Entonces** el sistema infiere automáticamente etiquetas de compatibilidad a partir de los ingredientes Y permite al usuario ajustarlas manualmente.
3. **Dado** un intento de guardar una receta sin nombre o sin al menos un ingrediente, **Cuando** se pulsa guardar, **Entonces** el sistema muestra un error indicando los campos obligatorios faltantes.
4. **Dado** una receta ya dada de alta, **Cuando** se editan sus ingredientes, aporte nutricional o etiquetas, **Entonces** la receta se actualiza correctamente.

### Historia de Usuario 2 - Buscar recetas por nombre, ingrediente o compatibilidad (Prioridad: P1)

Como responsable del menú familiar que acumula muchas recetas, quiero buscar en el catálogo por nombre del plato, por ingrediente o por compatibilidad con restricciones de la familia, para encontrar rápidamente platos adecuados al planificar.

**Por qué esta prioridad**: a medida que crece el catálogo, la búsqueda es imprescindible para seleccionar recetas al planificar sin recorrer todo el listado.

**Test independiente**: con un catálogo de varias recetas, buscar por término de nombre, por ingrediente y filtrar por compatibilidad con una restricción concreta.

**Escenarios de aceptación**:
1. **Dado** un catálogo con varias recetas, **Cuando** se busca por nombre de plato, **Entonces** aparecen las recetas cuyo nombre contiene el término de búsqueda en menos de 3 segundos.
2. **Dado** un catálogo con recetas variadas, **Cuando** se busca por ingrediente (del catálogo maestro), **Entonces** aparecen todas las recetas que contienen ese ingrediente.
3. **Dado** un catálogo con recetas etiquetadas, **Cuando** se filtra por compatibilidad con una restricción (p.ej. "sin gluten"), **Entonces** aparecen solo las recetas compatibles con esa restricción.
4. **Dado** una búsqueda sin coincidencias, **Cuando** el término no coincide con ninguna receta, **Entonces** el sistema indica que no se encontraron resultados.

### Historia de Usuario 3 - Ver listado de recetas organizado por tipo de comida (Prioridad: P1)

Como responsable del menú, quiero ver el catálogo de recetas organizado por tipo de comida (desayuno, comida, cena, snack), para navegar fácilmente y elegir platos según el momento del día al planificar.

**Por qué esta prioridad**: la organización por tipo de comida es clave para seleccionar platos según el slot del menú semanal que se quiera cubrir.

**Test independiente**: acceder al catálogo y verificar que las recetas aparecen agrupadas por los 4 tipos de comida.

**Escenarios de aceptación**:
1. **Dado** recetas de distintos tipos dadas de alta, **Cuando** se accede al catálogo, **Entonces** las recetas se muestran agrupadas por tipo de comida (desayuno, comida, cena, snack).
2. **Dado** que no hay recetas de un tipo concreto, **Cuando** se accede al catálogo, **Entonces** esa categoría aparece vacía o no se muestra.

### Historia de Usuario 4 - Usar recetas del catálogo base precargado (Prioridad: P1)

Como nuevo usuario de la app, quiero disponer de un catálogo base con recetas precargadas, para poder empezar a planificar menús sin tener que dar de alta todas las recetas desde cero.

**Por qué esta prioridad**: reduce la barrera de entrada y permite probar el valor del producto inmediatamente.

**Test independiente**: acceder al catálogo de un hogar recién creado y verificar que hay ~50 recetas base disponibles.

**Escenarios de aceptación**:
1. **Dado** un hogar recién creado, **Cuando** se accede al catálogo, **Entonces** el sistema muestra ~50 recetas precargadas (catálogo base) disponibles para usar en planificación.
2. **Dado** una receta del catálogo base, **Cuando** el usuario la selecciona, **Entonces** puede usarla directamente o copiarla al catálogo familiar para personalizarla.
3. **Dado** una receta del catálogo base copiada al catálogo familiar, **Cuando** se edita, **Entonces** los cambios solo afectan a la copia del hogar, no al catálogo base.

### Historia de Usuario 5 - Proteger recetas en uso en planificaciones activas (Prioridad: P1)

Como responsable del menú, quiero que el sistema impida eliminar recetas que están siendo usadas en un menú semanal activo, para no romper planificaciones vigentes.

**Por qué esta prioridad**: conecta directamente con spec 002 (planificación) y spec 004 (ajustes). Sin esta protección, la coherencia del sistema se pierde.

**Test independiente**: intentar eliminar una receta asignada a un menú vigente y verificar que el sistema lo impide.

**Escenarios de aceptación**:
1. **Dado** una receta asignada a un menú semanal aprobado, **Cuando** se intenta eliminar, **Entonces** el sistema NO permite la eliminación y muestra un aviso indicando la planificación afectada.
2. **Dado** una receta que no está en ningún menú activo, **Cuando** se solicita su eliminación, **Entonces** el sistema la elimina del catálogo tras confirmación.
3. **Dado** una receta en uso que se edita (ingredientes o aporte nutricional), **Cuando** se guardan los cambios, **Entonces** el sistema notifica que la receta está en una planificación activa y pregunta si se quieren aplicar los cambios a la planificación o mantener la versión anterior.

### Historia de Usuario 6 - Etiquetar recetas según objetivos nutricionales (Prioridad: P2)

Como responsable del menú familiar, quiero que el sistema sugiera etiquetas de objetivo según el aporte nutricional y poder ajustarlas manualmente, para que el sistema las priorice al planificar según los objetivos de cada miembro.

**Por qué esta prioridad**: conecta el catálogo con los objetivos definidos en spec 001 y facilita la generación inteligente del menú (spec 002).

**Test independiente**: crear una receta con alto contenido proteico y verificar que el sistema sugiere "alta en proteína".

**Escenarios de aceptación**:
1. **Dado** una receta con aporte nutricional definido, **Cuando** se guarda, **Entonces** el sistema sugiere etiquetas de objetivo basándose en los valores nutricionales (ej: >30g proteína → "alta en proteína", <300 kcal → "baja en calorías").
2. **Dado** etiquetas sugeridas por el sistema, **Cuando** el usuario las revisa, **Entonces** puede aceptarlas, rechazarlas o añadir manualmente las que considere.
3. **Dado** un catálogo con recetas etiquetadas, **Cuando** se filtra por objetivo, **Entonces** aparecen solo las recetas con esa etiqueta.

### Historia de Usuario 7 - Consultar valores nutricionales desde fuente externa (Prioridad: POST-MVP, opcional)

> **⚠️ FUERA DE MVP** — Los valores nutricionales se introducen de forma manual en el MVP. La integración con API externa es mejora post-MVP.

Como persona que da de alta una receta, quiero consultar los valores nutricionales de un ingrediente desde una fuente externa fiable, para no tener que introducirlos manualmente.

**Por qué post-MVP**: el sistema funciona completo con introducción manual. La integración con API añade complejidad técnica que no es necesaria para validar el valor del producto.

**Escenarios de aceptación** (aplican cuando se implemente):
1. **Dado** un ingrediente en una receta, **Cuando** se consultan sus valores nutricionales mediante API (Food Data Central), **Entonces** el sistema muestra calorías, carbohidratos, grasas y proteínas.
2. **Dado** que la fuente externa no está disponible, **Cuando** se intenta consultar, **Entonces** el sistema permite introducción manual como fallback.

### Casos límite

- Recetas con ingredientes cuyos valores nutricionales no se conocen → el usuario puede dejar el campo vacío o poner valores aproximados.
- Receta con etiquetas de compatibilidad inconsistentes con sus ingredientes (ej: etiquetada "sin gluten" pero contiene trigo) → el sistema detecta la inconsistencia al inferir y avisa.
- Catálogo vacío al intentar planificar → enlace con spec 002: aviso de que no hay recetas suficientes.
- Edición de receta en uso que afectaría planificaciones activas → notificación + opción de mantener versión anterior.
- Ingredientes con nombres similares → se resuelve por catálogo maestro de ingredientes normalizados.
- Familia con un solo miembro → catálogo funciona igual.
- Recetas del catálogo base que se actualizan por la app → no afectan a copias ya personalizadas en hogares.
- Receta sin imagen: se muestra placeholder de color cálido (según wireframe).

## Requisitos *(obligatorio)*

### Requisitos funcionales

- **FR-001**: El sistema DEBE permitir dar de alta una receta dentro del catálogo familiar especificando nombre, ingredientes (del catálogo maestro) con cantidades, número de raciones, tipo de comida y aporte nutricional.
- **FR-002**: El sistema DEBE validar que una receta tenga al menos nombre y un ingrediente antes de guardarla.
- **FR-003**: El sistema DEBE permitir editar los datos de una receta ya dada de alta.
- **FR-004**: El sistema DEBE permitir eliminar una receta del catálogo siempre que no esté en uso en una planificación activa; si está en uso, DEBE impedir la eliminación.
- **FR-005**: El sistema DEBE notificar al usuario cuando se edita una receta en uso en una planificación activa, ofreciendo aplicar los cambios o mantener la versión anterior.
- **FR-006**: El sistema DEBE permitir buscar recetas por nombre del plato o por ingrediente del catálogo maestro.
- **FR-007**: El sistema DEBE permitir filtrar recetas por compatibilidad con restricciones alimentarias del hogar.
- **FR-008**: El sistema DEBE mostrar las recetas organizadas por tipo de comida (desayuno, comida, cena, snack — alineado con spec 002).
- **FR-009**: El sistema DEBE permitir la introducción manual de valores nutricionales de cada ingrediente y del aporte total de la receta. Esta es la única vía de entrada en MVP.
- **FR-010**: El sistema DEBE almacenar el aporte nutricional con los campos: calorías (kcal), carbohidratos (g), grasas (g) y proteínas (g).
- **FR-011**: El sistema DEBE inferir automáticamente etiquetas de compatibilidad con restricciones a partir de los ingredientes de la receta (ej: contiene gluten → incompatible con "sin gluten").
- **FR-012**: El sistema DEBE permitir al usuario ajustar manualmente las etiquetas de compatibilidad inferidas.
- **FR-013**: El sistema DEBE sugerir etiquetas de objetivo nutricional basándose en el aporte nutricional de la receta (ej: alta en proteína, baja en calorías).
- **FR-014**: El sistema DEBE permitir al usuario aceptar, rechazar o añadir manualmente etiquetas de objetivo.
- **FR-015**: El sistema DEBE asociar el catálogo de recetas a la unidad familiar, no a un usuario individual.
- **FR-016**: El sistema DEBE proporcionar un catálogo base precargado de ~50 recetas disponible para todos los hogares desde el primer uso.
- **FR-017**: El sistema DEBE permitir copiar una receta del catálogo base al catálogo familiar para personalizarla. Los cambios en la copia no afectan al catálogo base.
- **FR-018**: El sistema DEBE mantener un catálogo maestro de ingredientes normalizados (nombres canónicos, categorías) que sirve como base para la selección de ingredientes en recetas y para la normalización en la lista de compra (spec 003).
- **FR-019**: El sistema DEBE permitir especificar el número de raciones de cada receta.
- **FR-020**: El sistema DEBE permitir filtrar recetas por etiqueta de objetivo nutricional.
- **FR-021**: El sistema DEBE permitir asociar una imagen opcional a cada receta (foto del plato).
- **FR-022**: El sistema DEBE permitir indicar el tiempo de preparación aproximado en minutos por receta. Este campo se usa como base para el filtro de complejidad (spec 002): quick (<30 min), medium (30-60 min), elaborate (>60 min).

### Requisitos no funcionales

- **NFR-001 (Offline-first)**: El catálogo de recetas DEBE estar cacheado en el dispositivo. Las operaciones de lectura (búsqueda, navegación, consulta) DEBEN funcionar offline. Las escrituras (alta, edición) se realizan localmente y se sincronizan con el backend cuando haya conexión.
- **NFR-002 (Offline-first)**: El catálogo maestro de ingredientes DEBE estar disponible offline (descargado al dispositivo).
- **NFR-003 (Colaborativo)**: Cuando varios miembros del hogar editen recetas distintas simultáneamente, el sistema DEBE sincronizar sin conflicto.
- **NFR-004 (Colaborativo)**: Cuando dos miembros editen la misma receta simultáneamente, el sistema DEBE aplicar merge automático si los cambios no solapan (ej: uno edita ingredientes, otro edita etiquetas). Si solapan, last-write-wins con notificación.
- **NFR-005 (RGPD)**: Los datos del catálogo DEBEN almacenarse cifrados en reposo y en tránsito, dado que la combinación de recetas con restricciones puede revelar datos de salud indirectamente.
- **NFR-006 (Rendimiento)**: La búsqueda en el catálogo DEBE devolver resultados en menos de 3 segundos.
- **NFR-007 (Almacenamiento)**: No hay límite fijo de recetas por hogar. El sistema DEBE soportar un volumen razonable sin degradación (referencia: hasta 500 recetas por hogar).

### Entidades clave *(incluir si la feature maneja datos)*

- **Catálogo base**: colección precargada de ~50 recetas de referencia mantenida por la app. Atributos clave: versión, recetas incluidas, fecha de actualización.
- **Catálogo familiar de recetas**: colección de recetas asociada a una unidad familiar (incluye copias del catálogo base + recetas propias). Atributos clave: hogar asociado, número de recetas, fecha de última actualización.
- **Receta**: plato de cocina dentro del catálogo. Atributos clave: nombre, tipo de comida (desayuno/comida/cena/snack), lista de ingredientes (del catálogo maestro), número de raciones, aporte nutricional total, etiquetas de compatibilidad (inferidas + manuales), etiquetas de objetivo (sugeridas + manuales), origen (base/propia), estado en planificaciones activas, imageUrl (opcional), tiempo de preparación en minutos (opcional).
- **Catálogo maestro de ingredientes**: lista normalizada de ingredientes con nombres canónicos. Atributos clave: nombre canónico, sinónimos, categoría (frutas/verduras, carnes, lácteos, cereales, otros — alineado con spec 003), valores nutricionales por 100g (cuando disponibles).
- **Ingrediente en receta**: componente de una receta referenciado del catálogo maestro. Atributos clave: referencia al ingrediente maestro, cantidad, unidad de medida, valores nutricionales para esa cantidad.
- **Aporte nutricional**: información asociada a una receta o ingrediente. Atributos clave: calorías (kcal), carbohidratos (g), grasas (g), proteínas (g). Introducción manual en MVP.
- **Etiqueta de compatibilidad**: marcador que indica si una receta es apta para una restricción. Atributos clave: tipo de restricción, receta asociada, origen (inferida automáticamente / manual).
- **Etiqueta de objetivo**: marcador de idoneidad para un objetivo nutricional. Atributos clave: tipo de objetivo, receta asociada, origen (sugerida / manual).

## Criterios de éxito *(obligatorio)*

### Resultados medibles

- **SC-001**: La persona responsable puede dar de alta una receta completa (con ingredientes y datos nutricionales) en menos de 3 minutos.
- **SC-002**: La búsqueda en el catálogo devuelve resultados en menos de 3 segundos.
- **SC-003**: El 100% de los intentos de eliminación de recetas en uso en planificaciones activas son bloqueados por el sistema.
- **SC-004**: El catálogo permite clasificar y filtrar recetas por tipo de comida, restricciones y objetivos nutricionales.
- **SC-005**: Un hogar nuevo puede empezar a planificar sin dar de alta recetas propias gracias al catálogo base precargado.

## Suposiciones

- Existe una unidad familiar ya creada (spec 001) a la que se asocia el catálogo.
- El catálogo es compartido por todos los miembros del hogar con permisos de edición.
- Queda FUERA de alcance compartir recetas entre hogares distintos en esta versión.
- En el MVP, los valores nutricionales se introducen siempre de forma manual. No hay integración con API externa.
- Los tipos de comida son 4: desayuno, comida, cena, snack (unificado con spec 002).
- La edición de recetas en uso genera una notificación, no se bloquea la edición en sí.
- El aporte nutricional se almacena como: calorías (kcal), carbohidratos (g), grasas (g), proteínas (g).
- El catálogo maestro de ingredientes es el mismo que usa spec 003 para normalización de la lista de compra.
- El cálculo automático del aporte nutricional total (suma de ingredientes) queda FUERA del MVP.
- No hay límite fijo de recetas por hogar; se soporta un volumen razonable (hasta ~500).

## Fuera de alcance MVP

- Integración con API externa de datos nutricionales (Food Data Central / FDA).
- Cálculo automático del aporte nutricional total de una receta (suma de ingredientes).
- Compartir recetas entre hogares distintos.
- Importación de recetas desde fuentes externas (webs, PDFs, apps de cocina).
- Generación automática de recetas por IA.
- Foto de platos o reconocimiento visual de ingredientes.
- Recetas con pasos de preparación detallados (cocina paso a paso).
- Validación clínica o profesional de los datos nutricionales.
- Aporte nutricional por porción calculado automáticamente.

## Mejoras opcionales post-MVP

### Integración con API Food Data Central (FDA)

**Descripción**: Permitir consultar automáticamente los valores nutricionales de un ingrediente desde la API Food Data Central.

**Valor añadido**: Reduce tiempo de alta, mejora fiabilidad de datos nutricionales.

**Dependencias técnicas**:
- Integración con API REST de Food Data Central
- Gestión de errores y fallback a entrada manual
- Mapeo de alimentos de la API al catálogo maestro
- Documentación: `https://app.swaggerhub.com/apis/fdcnal/food-data_central_api/1.0.1#`

### Cálculo automático de aporte nutricional

**Descripción**: Sumar automáticamente los valores nutricionales de todos los ingredientes de una receta para obtener el aporte total y por porción.

**Valor añadido**: Elimina cálculos manuales y mejora precisión.

### Importación de recetas

**Descripción**: Permitir importar recetas desde webs, PDFs u otras apps de cocina.

**Valor añadido**: Acelera la construcción del catálogo familiar.

## Relación con otras specs

| Spec | Relación |
|------|----------|
| 001 - Perfiles y criterios familiares | Las restricciones y objetivos de los miembros se usan para inferir/filtrar etiquetas de recetas |
| 002 - Planificación semanal de menús | El catálogo alimenta la selección de platos para el menú semanal. Tipos de comida unificados (4). |
| 003 - Lista de la compra | Los ingredientes (del catálogo maestro) de las recetas planificadas generan la lista. El catálogo maestro sirve para normalización. |
| 004 - Ajustes, sustituciones y seguimiento | Las sustituciones validan restricciones contra el catálogo de recetas |

## Preguntas abiertas (resueltas)

1. ~~¿Catálogo base compartido además del familiar?~~ → **Sí. ~50 recetas precargadas por la app, copiables al catálogo familiar.**
2. ~~¿Porciones/raciones desde MVP?~~ → **Sí. Se especifica para cuántas personas es la receta.**
3. ~~¿Etiquetas de compatibilidad inferidas o manuales?~~ → **Ambas. Inferencia automática + ajuste manual.**
4. ~~¿Catálogo maestro de ingredientes normalizados?~~ → **Sí. Lista predefinida con nombres canónicos.**
5. ~~¿Cálculo automático de aporte nutricional en MVP?~~ → **No. Fase posterior.**
6. ~~¿Importación de recetas en fases futuras?~~ → **Sí, documentado como mejora post-MVP.**
7. ~~¿Sugerir etiquetas de objetivo automáticamente?~~ → **Sí. El sistema sugiere basándose en aporte nutricional.**
