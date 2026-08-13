# MenuFamiliaresHealthy

Aplicación móvil para planificar menús semanales familiares teniendo en cuenta restricciones alimentarias, preferencias, objetivos nutricionales y generación automática de lista de la compra.

## Estructura del proyecto

```
vibeverano-menuhealthy/
├── app/                          ← Código fuente del MVP (React Native + Expo)
├── specs/                        ← Especificaciones formales (spec-kit)
│   ├── 001-perfiles-y-criterios-familiares/
│   ├── 002-planificacion-semanal-de-menus/
│   ├── 003-lista-de-la-compra/
│   ├── 004-ajustes-sustituciones-y-seguimiento/
│   └── 005-catalogo-recetas-alimentos-valores-nutricionales/
├── wireframes/                   ← Diseño de pantallas (md + svg)
├── prototipo-react/              ← Prototipo visual HTML (referencia, no producción)
├── checklists/                   ← Validaciones de specs contra constitution
└── .specify/                     ← Configuración spec-kit
```

## Stack tecnológico

- **Frontend**: React Native (Expo) + TypeScript strict
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Testing**: Jest + React Native Testing Library
- **i18n**: react-i18next (español por defecto)
- **Navegación**: Expo Router (file-based routing)

## Cómo levantar el MVP

### Prerrequisitos

- Node.js 18+
- Cuenta en [Supabase](https://supabase.com) con proyecto creado

### 1. Instalar dependencias

```bash
cd app
npm install
```

### 2. Configurar Supabase

Copia el fichero de entorno:

```bash
cp .env.example .env
```

Edita `.env` con tu URL y Anon Key de Supabase (Settings → API en el dashboard).

### 3. Crear tablas en Supabase

Ejecuta los siguientes ficheros SQL en el **SQL Editor** del dashboard de Supabase, en este orden:

1. `app/supabase/migrations/001_initial_schema.sql`
2. `app/supabase/migrations/002_profiles_criteria.sql`
3. `app/supabase/migrations/004_planning_tables.sql`
4. `app/supabase/migrations/005_shopping_list.sql`
5. `app/supabase/seeds/003_seed_ingredients_recipes.sql`

Después ejecuta los permisos:

```sql
-- Permisos para desarrollo
ALTER TABLE families DISABLE ROW LEVEL SECURITY;
ALTER TABLE family_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE dietary_restrictions DISABLE ROW LEVEL SECURITY;
ALTER TABLE food_preferences DISABLE ROW LEVEL SECURITY;
ALTER TABLE nutritional_goals DISABLE ROW LEVEL SECURITY;
ALTER TABLE family_recipes DISABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients DISABLE ROW LEVEL SECURITY;
ALTER TABLE compatibility_tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE goal_tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE planned_weeks DISABLE ROW LEVEL SECURITY;
ALTER TABLE menu_proposals DISABLE ROW LEVEL SECURITY;
ALTER TABLE planned_meals DISABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_lists DISABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE master_ingredients DISABLE ROW LEVEL SECURITY;
ALTER TABLE base_catalog_recipes DISABLE ROW LEVEL SECURITY;

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
```

### 4. Iniciar la app

```bash
npx expo start
```

- **Web**: abre http://localhost:8081
- **Móvil**: instala Expo Go y escanea el QR (requiere misma red WiFi)

### 5. Usar la app

1. **Regístrate** con email y contraseña
2. Ve a **Familia** → añade miembros con restricciones (ej: "lactosa" como Intolerancia)
3. Ve a **Plan** → pulsa "Generar menú" → el sistema excluye recetas incompatibles
4. **Aprueba** la semana
5. Ve a **Compra** → "Generar lista" → checklist interactivo para el supermercado
6. Usa **⇄** en cualquier plato para sustituirlo por otro compatible

## Funcionalidades del MVP

| Feature | Descripción |
|---------|-------------|
| Auth | Login/registro con Supabase Auth |
| Planificador semanal | Genera menú 7 días × 4 comidas respetando restricciones |
| Aprobación | Marca menú como vigente para generar compra |
| Sustitución | Cambiar platos con validación de restricciones |
| Lista de la compra | Generada automáticamente, checklist interactivo |
| Familia | Miembros, restricciones, objetivos, config comidas |
| Catálogo | 50 ingredientes + 10 recetas base con búsqueda/filtros |

## Documentación de specs

Cada spec tiene la estructura completa spec-kit:

```
specs/NNN-feature/
├── spec.md          ← Requisitos y escenarios
├── plan.md          ← Plan de implementación
├── research.md      ← Decisiones técnicas
├── data-model.md    ← Modelo de datos
├── quickstart.md    ← Escenarios de validación
├── contracts/       ← Interfaces de servicios
├── tasks.md         ← Tasks de implementación
└── checklists/      ← Quality checks
```
