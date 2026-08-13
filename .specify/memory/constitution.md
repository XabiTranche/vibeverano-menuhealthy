<!--
Sync Impact Report
- Version change: 1.1.0 → 1.2.0
- Added principles: none
- Added sections: Estándares de Calidad y Cumplimiento (CWE Top 25, OWASP, ISO/IEC 5055, CISQ, RGPD)
- Removed sections: none
- Deferred TODOs: none
-->

# MenuFamiliaresHealthy Constitution

## Core Principles

### I. Mobile-First
La aplicación es exclusivamente móvil (React Native). Toda decisión de arquitectura, rendimiento y UX se toma pensando en dispositivos móviles como entorno principal y único. No existe versión web ni desktop como target de producción.

### II. TypeScript Estricto
Todo el código DEBE estar escrito en TypeScript con `strict: true`. No se permiten `any` explícitos salvo justificación documentada en comentario inline. Los tipos son la primera línea de defensa contra errores.

### III. Test-Driven Development (NON-NEGOTIABLE)
El ciclo de desarrollo es TDD obligatorio:
1. Escribir el test que falla (red)
2. Implementar el mínimo código para pasar (green)
3. Refactorizar manteniendo los tests verdes (refactor)

No se acepta código de producción sin test previo. Los tests definen el contrato antes de la implementación.

### IV. Offline-First
La app DEBE funcionar sin conexión a internet. Los datos se almacenan localmente en el dispositivo y se sincronizan con el backend (Firebase/Supabase) cuando hay conectividad. La experiencia offline es equivalente a la online para operaciones de lectura y escritura local.

### V. Colaborativo
Varios miembros del hogar pueden editar datos (perfiles, recetas, planificación) simultáneamente. El sistema DEBE gestionar conflictos de sincronización de forma predecible y sin pérdida de datos. La resolución de conflictos DEBE ser transparente para el usuario.

### VI. i18n-Ready
El idioma inicial es español. Sin embargo, toda cadena de texto visible al usuario DEBE estar externalizada en ficheros de traducción desde el primer día. No se permiten strings hardcodeados en componentes. La estructura DEBE permitir añadir idiomas sin refactoring.

## Stack Tecnológico

- **Runtime**: React Native (Expo o bare workflow — a decidir en implementación)
- **Lenguaje**: TypeScript strict
- **Backend**: Firebase o Supabase (BaaS) — persistencia, auth, sync
- **Almacenamiento local**: SQLite o AsyncStorage según complejidad de queries
- **Testing**: Jest + React Native Testing Library (unit + integration)
- **Internacionalización**: react-i18next o equivalente

## Branching Strategy (GitFlow)

El proyecto sigue el modelo GitFlow:

- **`main`**: Código en producción. Solo recibe merges de `release/*` y `hotfix/*`. Cada merge se etiqueta con versión semántica.
- **`develop`**: Rama de integración. Toda feature terminada se mergea aquí. Representa el estado del próximo release.
- **`feature/*`**: Una rama por feature/spec (ej: `feature/001-perfiles-familiares`). Se crea desde `develop`, se mergea de vuelta a `develop`.
- **`release/*`**: Preparación de release (ej: `release/1.0.0`). Se crea desde `develop`, se mergea a `main` y `develop`.
- **`hotfix/*`**: Correcciones urgentes en producción. Se crea desde `main`, se mergea a `main` y `develop`.

Reglas:
- No se hacen commits directos a `main` ni a `develop`.
- Toda rama `feature/*` DEBE tener spec asociada antes de empezar implementación.
- Los PRs a `develop` requieren tests pasando + review.

## Governance

- Esta constitución es el documento rector del proyecto. Cualquier decisión técnica o de producto que contradiga un principio requiere una enmienda formal.
- Las enmiendas requieren: justificación documentada, aprobación del responsable del proyecto, y actualización del versionado.
- Versionado semántico: MAJOR (principio eliminado/redefinido), MINOR (principio añadido/expandido), PATCH (clarificación/typo).
- Todo PR/review DEBE verificar cumplimiento de los principios antes de merge.

## Estándares de Calidad y Cumplimiento

### Seguridad

- **CWE Top 25**: El código DEBE evitar las 25 debilidades de software más peligrosas según MITRE CWE. Toda vulnerabilidad de esta lista detectada en review o análisis estático DEBE resolverse antes de merge.
- **OWASP Top 10 Mobile**: Al ser una app móvil, se aplican las 10 principales amenazas de OWASP Mobile. En particular: almacenamiento inseguro de datos, comunicación insegura, autenticación/autorización insuficiente, y manipulación de código.

### Calidad de código

- **ISO/IEC 5055**: El código DEBE cumplir las métricas de calidad estructural definidas en esta norma internacional: fiabilidad, seguridad, eficiencia de rendimiento y mantenibilidad. Se usarán herramientas de análisis estático para medir estas dimensiones.
- **CISQ Standards (Consortium for Information & Software Quality)**: Se adoptan las medidas CISQ como referencia para calidad automatizable. Las métricas clave son: complejidad ciclomática controlada, ausencia de dead code, y coupling bajo entre módulos.

### Protección de datos

- **RGPD (Reglamento General de Protección de Datos)**: La app gestiona datos personales sensibles (perfiles de salud, restricciones alimentarias, objetivos corporales). Se DEBE cumplir:
  - **Minimización de datos**: Solo recoger datos estrictamente necesarios para la funcionalidad.
  - **Consentimiento explícito**: Informar al usuario de qué datos se recogen y para qué, obteniendo consentimiento antes de procesarlos.
  - **Derecho de acceso y eliminación**: El usuario DEBE poder exportar y eliminar todos sus datos en cualquier momento.
  - **Cifrado**: Los datos personales DEBEN almacenarse cifrados tanto en reposo (dispositivo) como en tránsito (comunicación con backend).
  - **Privacidad por diseño**: Las decisiones de arquitectura DEBEN considerar la privacidad desde el inicio, no como un añadido posterior.

**Version**: 1.2.0 | **Ratified**: 2026-08-09 | **Last Amended**: 2026-08-10
