---
type: project-note
status: active
date: 2026-07-17
source: openclaw
tags: [project, sdd, spec, menufamiliareshealthy, vibeverano]
---
# VibeVerano-menuhealthy - spec 004 ajustes sustituciones y seguimiento

## Fuente original
- `shared/output/spec-sdd/menufamiliareshealthy/004-ajustes-sustituciones-y-seguimiento/spec.md`

## Contenido promovido

# Especificación de Feature: Ajustes, sustituciones y seguimiento del menú

**Rama**: `004-ajustes-sustituciones-y-seguimiento`
**Creada**: 2026-07-17
**Estado**: Borrador
**Input**: Descripción del usuario: "una aplicación que ayudara a planificar los menús familiares teniendo en cuenta distintos criterios: necesidades nutricionales, preferencias alimentarias, restricciones, objetivos (perder peso, ganar masa muscular, etc.) e incluso que generase automáticamente la lista de la compra a partir del menú semanal."

## Escenarios de usuario y pruebas *(obligatorio)*

### Historia de Usuario 1 - Sustituir una comida sin romper los criterios del hogar (Prioridad: P1)

Como responsable del menú familiar, quiero poder cambiar una comida concreta por otra alternativa compatible, para adaptar la semana cuando algo no encaja o surge un imprevisto.

**Por qué esta prioridad**: ningún menú sobrevive intacto toda la semana; sin capacidad de ajuste, la planificación pierde utilidad real.

**Test independiente**: partir de un menú aprobado, sustituir una comida concreta y comprobar que el plan sigue respetando restricciones principales.

**Escenarios de aceptación**:
1. **Dado** un menú semanal aprobado, **Cuando** la persona responsable decide cambiar una comida concreta, **Entonces** el sistema propone o permite registrar una alternativa compatible con los criterios activos.
2. **Dado** una sustitución propuesta que viola una restricción obligatoria, **Cuando** se intenta aplicar, **Entonces** el sistema la bloquea o advierte claramente del conflicto.
3. **Dado** una sustitución válida, **Cuando** se confirma el cambio, **Entonces** el sistema actualiza el menú vigente para esa semana.

### Historia de Usuario 2 - Reflejar el cambio en la lista de la compra (Prioridad: P1)

Como persona que hace la compra, quiero que los cambios de menú actualicen la lista asociada, para no comprar cosas innecesarias ni olvidar nuevas necesidades.

**Por qué esta prioridad**: conecta el ajuste del menú con su impacto operativo inmediato.

**Test independiente**: modificar una comida del menú y comprobar que la lista de la compra cambia en consecuencia.

**Escenarios de aceptación**:
1. **Dado** una lista ya generada desde un menú aprobado, **Cuando** cambia una comida del plan, **Entonces** el sistema actualiza o marca como desactualizada la lista de compra asociada.
2. **Dado** un cambio confirmado en el menú, **Cuando** la persona responsable revisa la lista, **Entonces** puede identificar qué elementos se añaden, eliminan o cambian. [NECESITA ACLARACIÓN: si se requiere diff explícito en MVP]

### Historia de Usuario 3 - Aprender de ajustes y rechazos frecuentes (Prioridad: P2)

Como responsable del hogar, quiero que el sistema tenga en cuenta los cambios y rechazos repetidos, para que las siguientes propuestas salgan mejor afinadas.

**Por qué esta prioridad**: convierte la herramienta en algo más útil con el tiempo y reduce fricción recurrente.

**Test independiente**: rechazar o sustituir repetidamente cierto tipo de propuesta y comprobar que el sistema lo refleja como señal futura.

**Escenarios de aceptación**:
1. **Dado** que una comida o patrón se sustituye repetidamente, **Cuando** el sistema genera futuras propuestas, **Entonces** reduce su prioridad o lo trata como señal de rechazo.
2. **Dado** que ciertas alternativas se aceptan con frecuencia, **Cuando** el sistema genera nuevas propuestas, **Entonces** puede priorizarlas más. [NECESITA ACLARACIÓN: si este aprendizaje entra en MVP]

### Historia de Usuario 4 - Registrar cumplimiento básico de la semana (Prioridad: P3)

Como responsable del menú, quiero indicar si el plan realmente se siguió o no, para saber si el sistema ayuda de verdad o si propone cosas poco realistas.

**Por qué esta prioridad**: aporta mejora continua, pero no es imprescindible para el primer valor operativo.

**Test independiente**: cerrar una semana y marcar qué comidas se realizaron o no.

**Escenarios de aceptación**:
1. **Dado** una semana en curso o finalizada, **Cuando** la persona responsable registra qué comidas se han seguido, **Entonces** el sistema conserva esa señal para revisión posterior.
2. **Dado** varias semanas con bajo cumplimiento, **Cuando** se revisa el histórico, **Entonces** el sistema permite detectar que el plan no estaba siendo realista. [NECESITA ACLARACIÓN: si habrá revisión histórica en MVP]

### Casos límite

- Cambio de comida cuando ya se hizo la compra.
- Sustituciones que mejoran gusto pero empeoran el objetivo nutricional.
- Varias sustituciones encadenadas en la misma semana.
- Cambio de un plato compartido por toda la familia frente a cambio solo para un miembro.
- Lista de compra parcialmente usada antes del cambio.
- Rechazos repetidos por motivos no registrados inicialmente.

## Requisitos *(obligatorio)*

### Requisitos funcionales

- **FR-001**: El sistema DEBE permitir modificar una comida concreta dentro de un menú semanal vigente.
- **FR-002**: El sistema DEBE validar que cualquier sustitución siga respetando restricciones obligatorias.
- **FR-003**: El sistema DEBE reflejar los cambios confirmados dentro del menú activo.
- **FR-004**: El sistema DEBE actualizar o invalidar la lista de la compra cuando un cambio de menú la afecte.
- **FR-005**: El sistema DEBE distinguir entre menú original y menú ajustado.
- **FR-006**: El sistema DEBE registrar cambios, rechazos o sustituciones realizados por la persona responsable.
- **FR-007**: El sistema DEBE poder usar esos cambios como señal para futuras recomendaciones. [NECESITA ACLARACIÓN: si en MVP solo se registra o también se aplica]
- **FR-008**: El sistema DEBE permitir registrar de forma básica si una comida planificada se llegó a realizar o no. [NECESITA ACLARACIÓN: si entra en MVP]
- **FR-009**: El sistema DEBE mostrar claramente cuándo una lista de compra ya no está alineada con el menú vigente.

### Entidades clave *(incluir si la feature maneja datos)*

- **Ajuste de menú**: modificación realizada sobre una comida planificada. Atributos clave: semana, comida afectada, motivo [NECESITA ACLARACIÓN: si se recogerá], fecha del cambio.
- **Sustitución**: reemplazo de una opción planificada por otra. Atributos clave: opción original, opción nueva, compatibilidad validada.
- **Señal de aprendizaje**: patrón derivado de aceptaciones, rechazos o cambios repetidos. Atributos clave: tipo de señal, frecuencia, contexto familiar.
- **Cumplimiento semanal**: registro de si una comida o plan se siguió en la práctica. Atributos clave: comida, estado realizado/no realizado, observación opcional.

## Criterios de éxito *(obligatorio)*

### Resultados medibles

- **SC-001**: La persona responsable puede ajustar una comida concreta en menos de 2 minutos.
- **SC-002**: Los cambios de menú mantienen la coherencia con restricciones obligatorias en el 100% de los casos confirmados.
- **SC-003**: La lista de compra refleja correctamente los cambios de menú sin necesidad de rehacerla manualmente desde cero. [NECESITA ACLARACIÓN: umbral de calidad esperado]
- **SC-004**: Las semanas sucesivas requieren menos sustituciones repetitivas si el sistema aprende de las señales registradas. [NECESITA ACLARACIÓN: si este resultado debe exigirse desde fase inicial]

## Suposiciones

- El menú semanal ya existe y puede haber sido aprobado previamente.
- Los cambios son parte normal del uso real del producto.
- No toda mejora debe ser automática; el sistema puede empezar registrando señales antes de aprender activamente.
- Queda FUERA de alcance en esta spec la analítica clínica o médica del cumplimiento.

## Fuera de alcance inicial

- Seguimiento nutricional clínico detallado.
- Integración con wearables o apps de actividad.
- Recomendaciones terapéuticas personalizadas.
- Automatización total sin validación humana de cada cambio.

## Preguntas abiertas

1. ¿Las sustituciones deben ofrecerse automáticamente o basta con permitir cambios manuales compatibles?
2. ¿Hay que recoger el motivo del cambio: gusto, falta de ingredientes, tiempo, presupuesto, rechazo infantil, otro?
3. ¿El aprendizaje de preferencias debe entrar desde MVP o puede dejarse solo como registro de señales?
4. ¿Debe mantenerse histórico completo de menús originales y ajustados por semana?
5. ¿El seguimiento semanal debe ser muy simple o más detallado por miembro y comida?
