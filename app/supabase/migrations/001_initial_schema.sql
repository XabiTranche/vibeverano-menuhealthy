-- ============================================================
-- MenuFamiliaresHealthy — Initial Schema
-- Specs: 001 (Perfiles) + 005 (Catálogo)
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- SPEC 005: Catálogo de recetas
-- ============================================================

-- Master Ingredient Catalog (~500 ingredients, seeded)
CREATE TABLE master_ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  canonical_name TEXT NOT NULL UNIQUE,
  synonyms JSONB DEFAULT '[]'::jsonb,
  category TEXT NOT NULL CHECK (category IN ('fruits_vegetables', 'meats', 'dairy', 'cereals', 'other')),
  nutritional_per_100g JSONB,
  allergen_flags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Base Catalog Recipes (~50 recipes, seeded, read-only)
CREATE TABLE base_catalog_recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
  servings INTEGER NOT NULL CHECK (servings >= 1),
  nutritional_total JSONB,
  compatibility_tags JSONB DEFAULT '[]'::jsonb,
  goal_tags JSONB DEFAULT '[]'::jsonb,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Family Recipes (user-created, per household)
CREATE TABLE family_recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL,
  name TEXT NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  servings INTEGER NOT NULL CHECK (servings >= 1),
  nutritional_total JSONB,
  source_type TEXT NOT NULL CHECK (source_type IN ('own', 'copied_from_base')),
  base_recipe_id UUID REFERENCES base_catalog_recipes(id),
  image_url TEXT,
  prep_time_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recipe Ingredients (join table)
CREATE TABLE recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID NOT NULL REFERENCES family_recipes(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES master_ingredients(id),
  quantity NUMERIC NOT NULL CHECK (quantity > 0),
  unit TEXT NOT NULL,
  nutritional_for_quantity JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(recipe_id, ingredient_id)
);

-- Compatibility Tags
CREATE TABLE compatibility_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID NOT NULL REFERENCES family_recipes(id) ON DELETE CASCADE,
  restriction_type TEXT NOT NULL,
  origin TEXT NOT NULL CHECK (origin IN ('inferred', 'manual')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(recipe_id, restriction_type)
);

-- Goal Tags
CREATE TABLE goal_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID NOT NULL REFERENCES family_recipes(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL,
  origin TEXT NOT NULL CHECK (origin IN ('suggested', 'manual')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(recipe_id, goal_type)
);

-- ============================================================
-- SPEC 001: Perfiles familiares
-- ============================================================

-- Families
CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL,
  active_meal_types JSONB DEFAULT '["breakfast","lunch","dinner","snack"]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Family Members
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 0 AND age <= 120),
  sex TEXT NOT NULL CHECK (sex IN ('male', 'female', 'other')),
  archived_at TIMESTAMPTZ,
  restrictions_reviewed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
