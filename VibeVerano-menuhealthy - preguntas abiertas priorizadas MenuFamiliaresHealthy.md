---
type: project-note
status: active
date: 2026-07-17
source: openclaw
tags: [project, sdd, spec, menufamiliareshealthy, vibeverano]
---
# VibeVerano-menuhealthy - preguntas abiertas priorizadas MenuFamiliaresHealthy

## Fuente original
- `shared/output/spec-sdd/menufamiliareshealthy/preguntas-abiertas-priorizadas-2026-07-17.md`

## Contenido promovido

# MenuFamiliaresHealthy — preguntas abiertas priorizadas

Fecha: 2026-07-17
Estado: borrador para compartir

## Objetivo

Este documento reúne y prioriza las preguntas abiertas detectadas en las specs de `MenuFamiliaresHealthy`.

La idea es cerrar primero las decisiones que afectan al alcance del MVP, al modelo de datos funcional y a la viabilidad real del planificador.

---

## Decisiones ya tomadas

| # | Decisión | Resolución | Fecha | Spec afectada |
|---|----------|-----------|-------|---------------|
| D1 | Integración con API externa de valores nutricionales (Food Data Central) | **FUERA DE MVP**. Los valores nutricionales se introducen siempre de forma manual en el MVP. La integración con API es opcional para iteraciones futuras. | 2026-07-20 | spec 005 |

---

## Prioridad 1 — imprescindibles para cerrar el MVP

Estas preguntas bloquean decisiones estructurales del producto. Sin responderlas, las specs siguen demasiado abiertas.

### 1. ¿Qué datos mínimos debe tener cada miembro de la familia desde el primer día?
**Por qué importa:** define el onboarding, la personalización real y qué tan fiable puede ser la planificación.

**Opciones a decidir:**
- solo nombre/rol + objetivo + restricciones
- añadir edad/tramo de edad
- añadir sexo
- añadir peso/altura
- añadir nivel de actividad
- otro set mínimo

### 2. ¿Qué tipos de criterios deben distinguirse desde MVP?
**Por qué importa:** cambia la lógica de decisión del sistema y el peso de cada regla.

**Puntos a cerrar:**
- alergias
- intolerancias
- restricciones éticas o religiosas
- preferencias
- aversiones/rechazos

### 3. ¿Cómo se definen los objetivos nutricionales o corporales?
**Por qué importa:** condiciona el grado de precisión del planificador.

**Opciones a decidir:**
- etiquetas simples (`perder peso`, `mantener`, `ganar masa muscular`)
- metas más detalladas
- objetivos solo por miembro
- también objetivos a nivel familiar

### 4. ¿Qué momentos de comida entran en el MVP?
**Por qué importa:** fija el alcance real del menú semanal y de la lista de la compra.

**Opciones a decidir:**
- desayuno
- comida
- cena
- snacks/media mañana/merienda
- otros

### 5. ¿El menú debe ser único para toda la familia o permitir variantes por miembro?
**Por qué importa:** es una decisión de producto muy fuerte. Cambia complejidad, usabilidad y realismo del sistema.

**Opciones a decidir:**
- un menú común para todos
- menú común con pequeñas variantes
- menú parcialmente individualizado por miembro

### 6. ¿Debe tenerse en cuenta tiempo de preparación, presupuesto o complejidad doméstica?
**Por qué importa:** un menú nutricionalmente correcto puede fracasar si no es viable en la vida real.

**Puntos a cerrar:**
- tiempo de cocina
- dificultad
- presupuesto semanal
- número de ingredientes
- esfuerzo doméstico percibido

### 7. ¿La lista de la compra debe trabajar con cantidades exactas, aproximadas o solo ingredientes presentes?
**Por qué importa:** define el nivel de ambición y la utilidad real de la salida.

**Opciones a decidir:**
- presencia de ingrediente
- cantidad aproximada
- cantidad exacta

### 8. ¿La lista debe trabajar a nivel de ingrediente genérico o de producto comercial?
**Por qué importa:** cambia mucho la precisión y el esfuerzo posterior de modelado.

**Opciones a decidir:**
- ingrediente genérico (`pollo`, `arroz`, `brócoli`)
- producto más concreto
- modelo híbrido

### 9. ¿El MVP incluye sustituciones automáticas compatibles o solo edición manual del menú?
**Por qué importa:** afecta mucho la experiencia post-planificación y la complejidad funcional.

**Opciones a decidir:**
- solo cambio manual
- propuestas automáticas de sustitución
- ambos

### 10. ¿Qué entra realmente dentro del MVP y qué se va a fase 2?
**Por qué importa:** hay varias capacidades valiosas, pero no todas deberían entrar a la vez.

**Bloques a decidir:**
- varias propuestas semanales o solo una
- inventario/despensa doméstica
- aprendizaje de preferencias
- seguimiento del cumplimiento semanal
- semanas parciales o planificación flexible
- exportación / impresión / checklist móvil

**Decisión parcial ya tomada:** la integración con API de valores nutricionales queda fuera del MVP (ver sección "Decisiones ya tomadas").

### 11. ¿El catálogo de recetas debe ser estrictamente familiar o puede haber un catálogo base compartido (recetas de referencia) además del catálogo propio del hogar?
**Por qué importa:** define si el sistema arranca vacío o con contenido de referencia, y si los hogares pueden beneficiarse de una base común.

**Opciones a decidir:**
- solo catálogo propio del hogar (empieza vacío)
- catálogo base de referencia + catálogo propio
- recetas compartidas entre hogares

**Fuente:** spec 005

### 12. ¿Se quiere soporte para porciones/raciones en la receta desde MVP?
**Por qué importa:** impacta en el cálculo de la lista de la compra (si una receta es "para 4 personas" y la familia tiene 6, las cantidades deben ajustarse) y en el aporte nutricional por persona.

**Opciones a decidir:**
- sin porciones en MVP (receta sin referencia a comensales)
- porciones opcionales
- porciones obligatorias al dar de alta la receta

**Fuente:** spec 005

### 13. ¿Debe existir un catálogo maestro de ingredientes normalizados o cada hogar puede usar nombres libres?
**Por qué importa:** afecta directamente a la consolidación de ingredientes en la lista de la compra (spec 003). Con nombres libres, "tomate" y "tomates" podrían no consolidarse.

**Opciones a decidir:**
- nombres libres (más ágil, peor consolidación)
- catálogo normalizado (más preciso, requiere mantenimiento)
- modelo híbrido (sugerencias de normalización sin obligar)

**Fuente:** spec 005

### 14. ¿El cálculo automático del aporte nutricional total de la receta (suma de ingredientes) entra en MVP o se deja para fase posterior?
**Por qué importa:** si entra, el usuario solo necesita introducir valores por ingrediente y el sistema calcula el total. Si no entra, el usuario introduce tanto valores por ingrediente como el total de la receta manualmente.

**Opciones a decidir:**
- solo total manual de la receta
- cálculo automático desde ingredientes
- ambos (manual como override del calculado)

**Fuente:** spec 005

---

## Prioridad 2 — importantes para afinar experiencia y reglas

No bloquean la idea base, pero sí el diseño funcional fino y la calidad del resultado.

### 15. ¿Debe existir un perfil específico para niños con reglas distintas?
**Por qué importa:** puede cambiar recomendaciones, restricciones y lenguaje de configuración.

### 16. ¿Hace falta contemplar custodias alternas, hogares de una sola persona o semanas con miembros no presentes?
**Por qué importa:** define si el modelo familiar debe soportar composiciones variables en el tiempo.

### 17. ¿Cómo se configurará el patrón semanal de comidas?
**Por qué importa:** algunas familias no hacen el mismo número de comidas todos los días.

### 18. ¿Debe la app ofrecer una sola propuesta semanal o varias alternativas comparables?
**Por qué importa:** impacta en UX y en la percepción de utilidad/elección.

### 19. ¿Qué pasa cuando no existe una propuesta plenamente compatible?
**Por qué importa:** hay que decidir si el sistema:
- bloquea
- propone compromisos
- propone alternativas parciales
- deja elegir manualmente

### 20. ¿Se quiere medir y limitar la repetición de platos o ingredientes?
**Por qué importa:** afecta a la calidad percibida del menú.

### 21. ¿La app debe recomendar recetas completas o solo platos/comidas planificadas?
**Por qué importa:** cambia mucho el nivel de detalle del producto.

### 22. ¿La lista de la compra debe incluir categorías de compra desde MVP?
**Por qué importa:** mejora la experiencia, pero puede posponerse si hace falta simplificar.

### 23. ¿Habrá modo borrador para generar lista antes de aprobar el menú?
**Por qué importa:** afecta al flujo entre planificación y ejecución.

### 24. ¿Se quiere marcado de despensa simple o también cantidades parciales en casa?
**Por qué importa:** cambia el esfuerzo de uso y la precisión del ajuste de compra.

### 25. ¿La lista será colaborativa o compartible entre varios miembros del hogar?
**Por qué importa:** puede ser clave para uso real, pero también añade complejidad de coordinación.

### 26. ¿Hay que mostrar diff explícito en la lista cuando cambia el menú?
**Por qué importa:** mejora claridad operativa tras ajustes de última hora.

### 27. ¿Hay que recoger el motivo de cada cambio o sustitución?
**Por qué importa:** influye en aprendizaje futuro y en el análisis de problemas reales de uso.

### 28. ¿Las etiquetas de compatibilidad de recetas deben inferirse automáticamente a partir de los ingredientes o siempre ser manuales?
**Por qué importa:** la inferencia automática reduce trabajo del usuario pero requiere un catálogo de ingredientes con restricciones asociadas. Si es manual, es más simple pero propenso a errores humanos.

**Opciones a decidir:**
- siempre manuales
- inferencia automática con confirmación del usuario
- inferencia automática sin confirmación

**Fuente:** spec 005

### 29. ¿Debe el sistema sugerir etiquetas de objetivo (alta en proteína, baja en calorías, etc.) en función del aporte nutricional calculado?
**Por qué importa:** reduce esfuerzo de clasificación manual pero depende de que exista un cálculo nutricional fiable.

**Fuente:** spec 005

---

## Prioridad 3 — decisiones de madurez, histórico y mejora continua

Útiles, pero no deberían frenar el primer recorte del producto.

### 30. ¿Hace falta histórico real y versionado de perfiles, menús y criterios?
**Por qué importa:** útil para trazabilidad, pero no imprescindible para validar el valor inicial.

### 31. ¿El sistema debe aprender activamente de cambios y rechazos desde MVP o solo registrar señales?
**Por qué importa:** separa un MVP más simple de una versión más inteligente.

### 32. ¿Debe existir seguimiento semanal del cumplimiento del menú?
**Por qué importa:** es valioso para mejora continua, pero no es imprescindible para planificar y comprar.

### 33. ¿Ese seguimiento debe ser simple o detallado por miembro y comida?
**Por qué importa:** define el peso operativo del feedback semanal.

### 34. ¿Deben mantenerse menús originales y menús ajustados con histórico completo?
**Por qué importa:** útil para análisis posterior, pero no es una necesidad de primer uso.

### 35. ¿Cómo se medirán algunos criterios de éxito del producto?
**Por qué importa:** conviene definir desde el principio qué significa “funciona bien”.

**Ejemplos a concretar:**
- porcentaje de listas que requieren pocos cambios
- porcentaje de semanas que no se rehacen desde cero
- reducción de olvidos o compras repetidas
- mejora en aceptación del menú

### 36. ¿Se contempla importar recetas desde otras fuentes (webs, PDFs, apps) en fases futuras?
**Por qué importa:** puede ser un acelerador de adopción, pero añade complejidad de parsing y normalización.

**Fuente:** spec 005

---

## Recomendación práctica de resolución

Para avanzar rápido, conviene cerrar primero este paquete mínimo de decisiones:

1. **datos mínimos por miembro**
2. **tipos de restricciones/preferencias**
3. **definición de objetivos**
4. **momentos de comida del MVP**
5. **menú único vs variantes por miembro**
6. **si entra tiempo/presupuesto/complejidad**
7. **nivel de precisión de la lista de la compra**
8. **ingrediente genérico vs producto comercial**
9. **sustituciones manuales vs automáticas**
10. **qué queda fuera del MVP**
11. **catálogo familiar vs catálogo base compartido** *(nuevo — spec 005)*
12. **porciones/raciones en recetas** *(nuevo — spec 005)*
13. **ingredientes normalizados vs nombres libres** *(nuevo — spec 005)*
14. **cálculo automático de aporte nutricional total** *(nuevo — spec 005)*

---

## Propuesta de dinámica para resolverlas

### Sesión 1 — alcance y modelo base
Responder preguntas 1 a 6.

### Sesión 2 — catálogo de recetas, lista de la compra y flujo operativo
Responder preguntas 7 a 14 y 22 a 27.

### Sesión 3 — mejora continua y fases posteriores
Responder preguntas 28 a 36.

---

## Documento fuente relacionado

Estas preguntas salen de:
- `001-perfiles-y-criterios-familiares/spec.md`
- `002-planificacion-semanal-de-menus/spec.md`
- `003-lista-de-la-compra/spec.md`
- `004-ajustes-sustituciones-y-seguimiento/spec.md`
- `005-catalogo-recetas-alimentos-valores-nutricionales/spec.md`
