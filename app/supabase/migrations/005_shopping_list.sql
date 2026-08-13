-- ============================================================
-- SPEC 003: Lista de la compra
-- Ejecutar en Supabase SQL Editor
-- ============================================================

CREATE TABLE shopping_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL,
  week_id UUID NOT NULL REFERENCES planned_weeks(id),
  menu_id UUID NOT NULL REFERENCES menu_proposals(id),
  status TEXT NOT NULL DEFAULT 'generated' CHECK (status IN ('generated', 'adjusted', 'in_use', 'completed')),
  unmapped_recipes JSONB DEFAULT '[]'::jsonb,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(family_id, week_id)
);

CREATE TABLE shopping_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  list_id UUID NOT NULL REFERENCES shopping_lists(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES master_ingredients(id),
  ingredient_name TEXT NOT NULL,
  approximate_quantity NUMERIC,
  unit TEXT,
  category TEXT NOT NULL CHECK (category IN ('fruits_vegetables', 'meats', 'dairy', 'cereals', 'other')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'bought', 'available_at_home')),
  last_modified_by UUID,
  last_modified_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_shopping_list_family_week ON shopping_lists(family_id, week_id);
CREATE INDEX idx_shopping_items_list_category ON shopping_items(list_id, category);
CREATE INDEX idx_shopping_items_list_status ON shopping_items(list_id, status);

-- Dev permissions (no RLS for now)
ALTER TABLE shopping_lists DISABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_items DISABLE ROW LEVEL SECURITY;
GRANT ALL ON public.shopping_lists TO anon;
GRANT ALL ON public.shopping_items TO anon;
