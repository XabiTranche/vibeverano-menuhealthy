-- ============================================================
-- SPEC 002: Planificación semanal
-- Ejecutar en Supabase SQL Editor
-- ============================================================

CREATE TABLE planned_weeks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'incompatible', 'replaced')),
  approved_at TIMESTAMPTZ,
  replaced_by UUID REFERENCES planned_weeks(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (end_date >= start_date)
);

CREATE TABLE menu_proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  week_id UUID NOT NULL REFERENCES planned_weeks(id) ON DELETE CASCADE,
  criteria_snapshot JSONB,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  generation_source TEXT NOT NULL DEFAULT 'backend' CHECK (generation_source IN ('backend', 'offline')),
  complexity_applied JSONB
);

CREATE TABLE planned_meals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID NOT NULL REFERENCES menu_proposals(id) ON DELETE CASCADE,
  day DATE NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  recipe_id UUID REFERENCES family_recipes(id),
  base_recipe_id UUID REFERENCES base_catalog_recipes(id),
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'out_of_house')),
  variants JSONB DEFAULT '[]'::jsonb
);

CREATE TABLE complexity_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL UNIQUE,
  weekday_level TEXT NOT NULL DEFAULT 'quick' CHECK (weekday_level IN ('quick', 'medium', 'elaborate')),
  weekend_level TEXT NOT NULL DEFAULT 'medium' CHECK (weekend_level IN ('quick', 'medium', 'elaborate'))
);

-- Indexes
CREATE INDEX idx_week_family_status ON planned_weeks(family_id, status);
CREATE INDEX idx_week_family_dates ON planned_weeks(family_id, start_date);
CREATE INDEX idx_meal_proposal_day ON planned_meals(proposal_id, day, meal_type);
CREATE INDEX idx_proposal_week ON menu_proposals(week_id);

-- Permissions for development (anon access)
ALTER TABLE planned_weeks DISABLE ROW LEVEL SECURITY;
ALTER TABLE menu_proposals DISABLE ROW LEVEL SECURITY;
ALTER TABLE planned_meals DISABLE ROW LEVEL SECURITY;
ALTER TABLE complexity_configs DISABLE ROW LEVEL SECURITY;

GRANT ALL ON public.planned_weeks TO anon;
GRANT ALL ON public.menu_proposals TO anon;
GRANT ALL ON public.planned_meals TO anon;
GRANT ALL ON public.complexity_configs TO anon;
