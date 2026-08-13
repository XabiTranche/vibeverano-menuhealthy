-- ============================================================
-- SPEC 001: Restricciones, Preferencias, Objetivos
-- ============================================================

-- Dietary Restrictions
CREATE TABLE dietary_restrictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('allergy', 'intolerance', 'ethical_religious', 'preference')),
  name TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('mandatory', 'desirable')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(member_id, name, category)
);

-- Food Preferences
CREATE TABLE food_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  food_item TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('liked', 'disliked')),
  intensity TEXT NOT NULL DEFAULT 'mild' CHECK (intensity IN ('mild', 'strong')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(member_id, food_item)
);

-- Nutritional Goals
CREATE TABLE nutritional_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('lose_weight', 'maintain', 'gain_muscle')),
  priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 10),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Spec 005
CREATE INDEX idx_family_recipes_family_meal ON family_recipes(family_id, meal_type);
CREATE INDEX idx_family_recipes_family_name ON family_recipes(family_id, name);
CREATE INDEX idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_ingredients_ingredient ON recipe_ingredients(ingredient_id);
CREATE INDEX idx_master_ingredients_name ON master_ingredients(canonical_name);
CREATE INDEX idx_master_ingredients_category ON master_ingredients(category);
CREATE INDEX idx_compatibility_tags_recipe ON compatibility_tags(recipe_id);
CREATE INDEX idx_compatibility_tags_type ON compatibility_tags(restriction_type);
CREATE INDEX idx_goal_tags_recipe ON goal_tags(recipe_id);
CREATE INDEX idx_goal_tags_type ON goal_tags(goal_type);

-- Spec 001
CREATE INDEX idx_family_members_family ON family_members(family_id, archived_at);
CREATE INDEX idx_dietary_restrictions_member ON dietary_restrictions(member_id, severity);
CREATE INDEX idx_food_preferences_member ON food_preferences(member_id, type);
CREATE INDEX idx_nutritional_goals_member ON nutritional_goals(member_id, is_active);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE dietary_restrictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutritional_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE compatibility_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE base_catalog_recipes ENABLE ROW LEVEL SECURITY;

-- Master data: readable by all authenticated users
CREATE POLICY "master_ingredients_read" ON master_ingredients
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "base_catalog_read" ON base_catalog_recipes
  FOR SELECT TO authenticated USING (true);

-- Family data: only accessible by family owner (simplified for MVP)
CREATE POLICY "families_owner" ON families
  FOR ALL TO authenticated USING (owner_id = auth.uid());

CREATE POLICY "family_members_access" ON family_members
  FOR ALL TO authenticated
  USING (family_id IN (SELECT id FROM families WHERE owner_id = auth.uid()));

CREATE POLICY "restrictions_access" ON dietary_restrictions
  FOR ALL TO authenticated
  USING (member_id IN (
    SELECT fm.id FROM family_members fm
    JOIN families f ON fm.family_id = f.id
    WHERE f.owner_id = auth.uid()
  ));

CREATE POLICY "preferences_access" ON food_preferences
  FOR ALL TO authenticated
  USING (member_id IN (
    SELECT fm.id FROM family_members fm
    JOIN families f ON fm.family_id = f.id
    WHERE f.owner_id = auth.uid()
  ));

CREATE POLICY "goals_access" ON nutritional_goals
  FOR ALL TO authenticated
  USING (member_id IN (
    SELECT fm.id FROM family_members fm
    JOIN families f ON fm.family_id = f.id
    WHERE f.owner_id = auth.uid()
  ));

CREATE POLICY "family_recipes_access" ON family_recipes
  FOR ALL TO authenticated
  USING (family_id IN (SELECT id FROM families WHERE owner_id = auth.uid()));

CREATE POLICY "recipe_ingredients_access" ON recipe_ingredients
  FOR ALL TO authenticated
  USING (recipe_id IN (
    SELECT fr.id FROM family_recipes fr
    JOIN families f ON fr.family_id = f.id
    WHERE f.owner_id = auth.uid()
  ));

CREATE POLICY "compatibility_tags_access" ON compatibility_tags
  FOR ALL TO authenticated
  USING (recipe_id IN (
    SELECT fr.id FROM family_recipes fr
    JOIN families f ON fr.family_id = f.id
    WHERE f.owner_id = auth.uid()
  ));

CREATE POLICY "goal_tags_access" ON goal_tags
  FOR ALL TO authenticated
  USING (recipe_id IN (
    SELECT fr.id FROM family_recipes fr
    JOIN families f ON fr.family_id = f.id
    WHERE f.owner_id = auth.uid()
  ));
