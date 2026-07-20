---
type: project-note
status: active
date: 2026-07-20
source: openclaw
tags: [project, sdd, spec, menufamiliareshealthy, vibeverano]
---
# VibeVerano-menuhealthy - spec 005 catálogo de recetas alimentos y valores nutricionales

## Fuente original
- Adaptación de `app-nutricion/spec.md` (historias de usuario de recetas, alimentos y valores nutricionales) al contexto familiar de MenuFamiliaresHealthy.

## Contexto y justificación

Las specs 002 (planificación semanal), 003 (lista de la compra) y 004 (ajustes y sustituciones) asumen la existencia de un catálogo de recetas y alimentos con información nutricional asociada. Sin embargo, ninguna spec define cómo se da de alta, gestiona y enriquece ese catálogo.

Esta spec formaliza el módulo de **recetas, ingredientes y valores nutricionales** como cimiento de datos para el resto del producto. Se adapta del trabajo previo en `app-nutricion` al contexto familiar, multi-miembro y orientado a objetivos de VibeVerano-menuhealthy.

## Contenido promovido

# Especificación de Feature: Catálogo de recetas, alimentos y valores nutricionales

**Rama**: `005-catalogo-recetas-alimentos-valores-nutricionales`
**Creada**: 2026-07-20
**Estado**: Borrador
**Input**: Historias de usuario de app-nutricion (alta de recetas, búsqueda, listado, consulta API valores nutricionales, notificación de cambios) adaptadas al modelo familiar de MenuFamiliaresHealthy.

## Escenarios de usuario y pruebas *(obligatorio)*

### Historia de Usuario 1 - Dar de alta recetas familiares (Prioridad: P1)

Como responsable de la alimentación del hogar, quiero dar de alta recetas especificando nombre, ingredientes con cantidades, tipo de comida, aporte nutricional y compatibilidad con restricciones familiares, para disponer de un catálogo propio con el que planificar menús semanales.

**Por qué esta prioridad**: sin recetas dadas de alta no hay material sobre el que construir la planificación semanal (spec 002). Es la base de datos del sistema.

**Test independiente**: crear una receta completa con ingredientes, tipo de comida, aporte nutricional y etiquetas de compatibilidad, y verificar que queda guardada y visible en el catálogo familiar.

**Escenarios de aceptación**:
1. **Dado** un hogar ya creado (spec 001), **Cuando** la persona responsable crea una nueva receta con nombre, ingredientes con cantidades, tipo de comida y aporte nutricional, **Entonces** la receta queda guardada dentro del catálogo familiar y aparece en el listado.
2. **Dado** un hogar con restricciones definidas, **Cuando** la persona responsable crea una receta, **Entonces** el sistema permite etiquetar la receta como compatible o incompatible con restricciones concretas de los miembros.
3. **Dado** un intento de guardar una receta sin nombre o sin al menos un ingrediente, **Cuando** se pulsa guardar, **Entonces** el sistema muestra un error indicando los campos obligatorios faltantes.
4. **Dado** una receta ya dada de alta, **Cuando** se editan sus ingredientes, aporte nutricional o etiquetas de compatibilidad, **Entonces** la receta se actualiza correctamente.

### Historia de Usuario 2 - Buscar recetas por nombre, ingrediente o compatibilidad (Prioridad: P1)

Como responsable del menú familiar que acumula muchas recetas, quiero buscar en el catálogo por nombre del plato, por ingrediente o por compatibilidad con restricciones de la familia, para encontrar rápidamente platos adecuados al planificar.

**Por qué esta prioridad**: a medida que crece el catálogo, la búsqueda es imprescindible para seleccionar recetas al planificar sin recorrer todo el listado.

**Test independiente**: con un catálogo de varias recetas, buscar por término de nombre, por ingrediente y filtrar por compatibilidad con una restricción concreta.

**Escenarios de aceptación**:
1. **Dado** un catálogo con varias recetas, **Cuando** se busca por nombre de plato, **Entonces** aparecen las recetas cuyo nombre contiene el término de búsqueda.
2. **Dado** un catálogo con recetas variadas, **Cuando** se busca por ingrediente, **Entonces** aparecen todas las recetas que contienen ese ingrediente.
3. **Dado** un catálogo con recetas etiquetadas, **Cuando** se filtra por compatibilidad con una restricción (p.ej. "sin gluten"), **Entonces** aparecen solo las recetas compatibles con esa restricción.
4. **Dado** una búsqueda sin coincidencias, **Cuando** el término no coincide con ninguna receta, **Entonces** el sistema indica que no se encontraron resultados.

### Historia de Usuario 3 - Ver listado de recetas organizado por tipo de comida (Prioridad: P1)

Como responsable del menú, quiero ver el catálogo de recetas organizado por tipo de comida (desayuno, aperitivos, entrantes, comidas, cenas, snacks), para navegar fácilmente y elegir platos según el momento del día al planificar.

**Por qué esta prioridad**: la organización por tipo de comida es clave para seleccionar platos según el slot del menú semanal que se quiera cubrir.

**Test independiente**: acceder al catálogo y verificar que las recetas aparecen agrupadas por categoría.

**Escenarios de aceptación**:
1. **Dado** recetas de distintos tipos dadas de alta, **Cuando** se accede al catálogo, **Entonces** las recetas se muestran agrupadas por tipo de comida.
2. **Dado** que no hay recetas de un tipo concreto, **Cuando** se accede al catálogo, **Entonces** esa categoría aparece vacía o no se muestra.
3. **Dado** que una receta tiene un tipo de comida principal, **Cuando** se visualiza en el catálogo, **Entonces** aparece en su categoría correspondiente pero puede ser asignable a otros slots durante la planificación (spec 002).

### Historia de Usuario 4 - Consultar valores nutricionales desde fuente externa (Prioridad: POST-MVP, opcional)

> **⚠️ FUERA DE MVP** — Esta funcionalidad no entra en la primera versión. Los valores nutricionales se introducirán siempre de forma manual en el MVP. La integración con API externa es una mejora opcional para iteraciones futuras.

Como persona que da de alta una receta, quiero consultar los valores nutricionales de un ingrediente desde una fuente externa fiable, para no tener que introducirlos manualmente y asegurar la calidad de los datos.

**Por qué post-MVP**: simplifica el alta de recetas y mejora la fiabilidad de los datos nutricionales, pero el sistema funciona completo con introducción manual. La integración con API añade complejidad técnica (gestión de errores, rate limiting, mapeo de alimentos) que no es necesaria para validar el valor del producto.

**Test independiente**: al dar de alta un ingrediente, consultar sus valores nutricionales y verificar que se devuelven y aplican correctamente.

**Escenarios de aceptación** (aplican cuando se implemente):
1. **Dado** un ingrediente en una receta, **Cuando** se consultan sus valores nutricionales mediante la fuente externa (API Food Data Central), **Entonces** el sistema muestra calorías, carbohidratos, grasas y proteínas del alimento.
2. **Dado** resultados de la consulta, **Cuando** el usuario selecciona el alimento correcto, **Entonces** los valores nutricionales se aplican automáticamente al ingrediente de la receta.
3. **Dado** que la fuente externa no encuentra resultados para un alimento, **Cuando** se intenta consultar, **Entonces** el sistema indica que no se encontraron datos y permite la introducción manual.
4. **Dado** que la fuente externa no está disponible o tarda en responder, **Cuando** se intenta consultar, **Entonces** el sistema muestra un aviso de error y permite introducir los valores manualmente como fallback.

### Historia de Usuario 5 - Calcular aporte nutricional total de una receta (Prioridad: P2)

Como responsable del menú, quiero que el sistema calcule automáticamente el aporte nutricional total de una receta a partir de sus ingredientes, para saber qué aporta cada plato sin hacer cálculos manuales.

**Por qué esta prioridad**: facilita la validación de que un menú cumple objetivos nutricionales (spec 001), pero puede hacerse en fases posteriores si el MVP solo requiere introducción manual del total.

**Test independiente**: crear una receta con varios ingredientes que tienen valores nutricionales y verificar que el sistema suma correctamente el aporte total.

**Escenarios de aceptación**:
1. **Dado** una receta con ingredientes cuyos valores nutricionales están definidos, **Cuando** se consulta el aporte total de la receta, **Entonces** el sistema muestra la suma de calorías, carbohidratos, grasas y proteínas de todos los ingredientes.
2. **Dado** una receta donde algún ingrediente no tiene valores nutricionales, **Cuando** se consulta el aporte total, **Entonces** el sistema indica que el cálculo es parcial y señala qué ingredientes faltan por completar.
3. **Dado** una receta con porciones definidas, **Cuando** se consulta el aporte nutricional, **Entonces** el sistema puede mostrar el aporte por porción además del total. [NECESITA ACLARACIÓN: si entra en MVP]

### Historia de Usuario 6 - Proteger recetas en uso en planificaciones activas (Prioridad: P1)

Como responsable del menú, quiero que el sistema impida eliminar recetas que están siendo usadas en un menú semanal activo, para no romper planificaciones vigentes.

**Por qué esta prioridad**: conecta directamente con spec 002 (planificación) y spec 004 (ajustes). Sin esta protección, la coherencia del sistema se pierde.

**Test independiente**: intentar eliminar una receta asignada a un menú vigente y verificar que el sistema lo impide.

**Escenarios de aceptación**:
1. **Dado** una receta asignada a un menú semanal aprobado, **Cuando** se intenta eliminar, **Entonces** el sistema NO permite la eliminación y muestra un aviso indicando la planificación afectada.
2. **Dado** una receta que no está en ningún menú activo, **Cuando** se solicita su eliminación, **Entonces** el sistema la elimina del catálogo tras confirmación.
3. **Dado** una receta en uso que se edita (ingredientes o aporte nutricional), **Cuando** se guardan los cambios, **Entonces** el sistema notifica que la receta está en una planificación activa y pregunta si se quieren aplicar los cambios a la planificación o mantener la versión anterior.

### Historia de Usuario 7 - Etiquetar recetas según objetivos nutricionales (Prioridad: P2)

Como responsable del menú familiar, quiero poder etiquetar recetas según su idoneidad para objetivos concretos (alta en proteína, baja en calorías, equilibrada, etc.), para que el sistema las priorice al planificar según los objetivos de cada miembro.

**Por qué esta prioridad**: conecta el catálogo con los objetivos definidos en spec 001 y facilita la generación inteligente del menú (spec 002), pero puede funcionar sin ello en un primer momento.

**Test independiente**: etiquetar varias recetas con objetivos y verificar que se puede filtrar por ellos.

**Escenarios de aceptación**:
1. **Dado** una receta dada de alta, **Cuando** la persona responsable le asigna etiquetas de objetivo (p.ej. "alta en proteína", "baja en calorías"), **Entonces** las etiquetas quedan asociadas a la receta.
2. **Dado** un catálogo con recetas etiquetadas, **Cuando** se filtra por objetivo, **Entonces** aparecen solo las recetas con esa etiqueta.
3. **Dado** que el sistema genera un menú semanal (spec 002) para un miembro con objetivo de perder peso, **Cuando** selecciona recetas, **Entonces** prioriza las etiquetadas como compatibles con ese objetivo.

### Casos límite

- Recetas con ingredientes cuyos valores nutricionales no se conocen (el usuario puede dejar el campo vacío o poner valores aproximados).
- Receta con restricciones incompatibles entre sí (p.ej. receta etiquetada como "sin gluten" pero con ingrediente que contiene gluten).
- Catálogo vacío al intentar planificar (enlace con spec 002: aviso de que no hay recetas).
- Edición masiva de recetas en uso que afectaría muchas planificaciones.
- Receta compartida por varios hogares o importada de otra fuente. [NECESITA ACLARACIÓN: si el sistema soportará compartir recetas entre hogares]
- Ingredientes con nombres similares pero distintos (normalización).

## Requisitos *(obligatorio)*

### Requisitos funcionales

- **FR-001**: El sistema DEBE permitir dar de alta una receta dentro del catálogo familiar especificando nombre, ingredientes con cantidades, tipo de comida y aporte nutricional.
- **FR-002**: El sistema DEBE validar que una receta tenga al menos nombre y un ingrediente antes de guardarla.
- **FR-003**: El sistema DEBE permitir editar los datos de una receta ya dada de alta (ingredientes, cantidades, aporte nutricional, etiquetas).
- **FR-004**: El sistema DEBE permitir eliminar una receta del catálogo, siempre que no esté en uso en una planificación activa; si está en uso, DEBE impedir la eliminación y mostrar un aviso.
- **FR-005**: El sistema DEBE notificar al usuario cuando se edita una receta que está en uso en una planificación activa, ofreciendo aplicar los cambios o mantener la versión anterior.
- **FR-006**: El sistema DEBE permitir buscar recetas por nombre del plato o por ingrediente contenido.
- **FR-007**: El sistema DEBE permitir filtrar recetas por compatibilidad con restricciones alimentarias del hogar.
- **FR-008**: El sistema DEBE mostrar las recetas organizadas por tipo de comida.
- **FR-009**: ~~El sistema DEBE permitir consultar los valores nutricionales de un alimento mediante integración con la API Food Data Central (FDA) para obtener calorías, carbohidratos, grasas y proteínas.~~ **[POST-MVP, OPCIONAL]** — Se implementará en iteraciones futuras. Ver sección "Mejoras opcionales post-MVP".
- **FR-010**: El sistema DEBE permitir la introducción manual de valores nutricionales de cada ingrediente y del aporte total de la receta. Esta es la única vía de entrada de datos nutricionales en el MVP.
- **FR-011**: El sistema DEBE almacenar el aporte nutricional de cada receta con los campos: calorías, carbohidratos, grasas y proteínas.
- **FR-012**: El sistema DEBE permitir etiquetar recetas según compatibilidad con restricciones (sin gluten, sin lactosa, vegana, etc.).
- **FR-013**: El sistema DEBE permitir etiquetar recetas según idoneidad para objetivos nutricionales (alta en proteína, baja en calorías, etc.).
- **FR-014**: El sistema DEBE calcular el aporte nutricional total de una receta a partir de los valores de sus ingredientes cuando estén disponibles. [NECESITA ACLARACIÓN: si entra en MVP o fase posterior]
- **FR-015**: El sistema DEBE asociar el catálogo de recetas a la unidad familiar, no a un usuario individual.

### Entidades clave *(incluir si la feature maneja datos)*

- **Catálogo familiar de recetas**: colección de recetas asociada a una unidad familiar. Atributos clave: hogar asociado, número de recetas, fecha de última actualización.
- **Receta**: plato de cocina dentro del catálogo. Atributos clave: nombre, tipo de comida (desayuno, aperitivos, entrantes, comidas, cenas, snacks), lista de ingredientes, aporte nutricional total, etiquetas de compatibilidad, etiquetas de objetivo, estado en planificaciones activas.
- **Ingrediente**: componente de una receta. Atributos clave: nombre, cantidad, unidad de medida, valores nutricionales (calorías, carbohidratos, grasas, proteínas), fuente del dato nutricional (manual en MVP; API en futuras iteraciones).
- **Aporte nutricional**: información asociada a una receta o ingrediente. Atributos clave: calorías, carbohidratos, grasas, proteínas. En el MVP se introduce manualmente; en iteraciones futuras podrá consultarse mediante API.
- **Etiqueta de compatibilidad**: marcador que indica si una receta es apta para una restricción concreta. Atributos clave: tipo de restricción, receta asociada, asignación manual o inferida.
- **Etiqueta de objetivo**: marcador que indica idoneidad de una receta para un objetivo nutricional. Atributos clave: tipo de objetivo, receta asociada.
- **Fuente de datos nutricionales** [POST-MVP]: servicio externo para consultar valores de alimentos. Atributos clave: proveedor (Food Data Central / FDA), estado de disponibilidad, última consulta. Solo aplica cuando se implemente la integración con API externa.

## Criterios de éxito *(obligatorio)*

### Resultados medibles

- **SC-001**: La persona responsable puede dar de alta una receta completa (con ingredientes y datos nutricionales) en menos de 3 minutos.
- **SC-002**: Al menos el 80% de las búsquedas de recetas devuelven resultados relevantes.
- **SC-003**: ~~La consulta de valores nutricionales mediante la API Food Data Central devuelve resultados en menos de 5 segundos.~~ **[POST-MVP]** — Aplica solo cuando se implemente la integración con API externa.
- **SC-004**: El 100% de los intentos de eliminación de recetas en uso en planificaciones activas son bloqueados por el sistema.
- **SC-005**: El catálogo permite clasificar y filtrar recetas por tipo de comida, restricciones y objetivos nutricionales de forma comprensible.

## Suposiciones

- Existe una unidad familiar ya creada (spec 001) a la que se asocia el catálogo.
- El catálogo es compartido por todos los miembros del hogar con permisos de edición.
- Queda FUERA de alcance compartir recetas entre hogares distintos en esta versión.
- **En el MVP, los valores nutricionales se introducen siempre de forma manual.** No hay integración con API externa en la primera versión.
- La fuente externa de datos nutricionales (API Food Data Central / FDA, documentada en `https://app.swaggerhub.com/apis/fdcnal/food-data_central_api/1.0.1#`) queda como mejora opcional para iteraciones posteriores.
- Los tipos de comida iniciales son: desayuno, aperitivos, entrantes, comidas, cenas, snacks (alineado con la pregunta abierta nº4 del documento de preguntas priorizadas).
- La edición de recetas en uso genera una notificación, no se bloquea la edición en sí.
- El aporte nutricional se almacena como: calorías (kcal), carbohidratos (g), grasas (g), proteínas (g).

## Fuera de alcance MVP

- **Integración con API externa de datos nutricionales (Food Data Central / FDA)** — opcional para iteraciones futuras.
- Compartir recetas entre hogares distintos.
- Importación masiva de recetas desde fuentes externas (webs, apps de cocina).
- Generación automática de recetas por IA.
- Foto de platos o reconocimiento visual de ingredientes.
- Recetas con pasos de preparación detallados (cocina paso a paso).
- Validación clínica o profesional de los datos nutricionales.

## Mejoras opcionales post-MVP

### Integración con API Food Data Central (FDA)

**Descripción**: Permitir consultar automáticamente los valores nutricionales de un ingrediente desde la API Food Data Central, en lugar de introducirlos manualmente.

**Valor añadido**: Reduce tiempo de alta de recetas, mejora fiabilidad de los datos nutricionales, y permite enriquecer el catálogo de forma más ágil.

**Requisitos asociados** (aplican solo cuando se implemente):
- FR-009 (consulta API)
- SC-003 (tiempo de respuesta <5s)
- Historia de Usuario 4

**Dependencias técnicas**:
- Integración con API REST de Food Data Central
- Gestión de errores y fallback a entrada manual
- Mapeo de alimentos de la API al formato interno del catálogo
- Documentación de referencia: `https://app.swaggerhub.com/apis/fdcnal/food-data_central_api/1.0.1#`

## Relación con otras specs

| Spec | Relación |
|------|----------|
| 001 - Perfiles y criterios familiares | Las restricciones y objetivos de los miembros se usan para etiquetar y filtrar recetas |
| 002 - Planificación semanal de menús | El catálogo alimenta la selección de platos para el menú semanal |
| 003 - Lista de la compra | Los ingredientes de las recetas planificadas generan la lista |
| 004 - Ajustes, sustituciones y seguimiento | Las sustituciones buscan alternativas compatibles en el catálogo |

## Preguntas abiertas

1. ¿El catálogo debe ser estrictamente familiar o puede haber un catálogo base compartido (recetas de referencia) además del catálogo propio del hogar?
2. ¿Se quiere soporte para porciones/raciones en la receta (p.ej. "esta receta es para 4 personas") desde MVP?
3. ¿Las etiquetas de compatibilidad deben inferirse automáticamente a partir de los ingredientes o siempre ser manuales?
4. ¿Debe existir un catálogo maestro de ingredientes normalizados o cada hogar puede usar nombres libres?
5. ¿El cálculo automático del aporte nutricional total de la receta (suma de ingredientes) entra en MVP o se deja para fase posterior?
6. ¿Se contempla importar recetas desde otras fuentes (webs, PDFs, apps) en fases futuras?
7. ¿Debe el sistema sugerir etiquetas de compatibilidad/objetivo en función del aporte nutricional calculado?
