-- ============================================================
-- SEED DATA: Ingredientes maestros + Recetas base
-- Ejecutar en Supabase SQL Editor DESPUÉS de las migraciones
-- ============================================================

-- ============================================================
-- MASTER INGREDIENTS (~50 ingredientes iniciales)
-- ============================================================

INSERT INTO master_ingredients (id, canonical_name, synonyms, category, nutritional_per_100g, allergen_flags) VALUES
-- FRUTAS Y VERDURAS
('a0000001-0001-4000-8000-000000000001', 'tomate', '["jitomate"]', 'fruits_vegetables', '{"kcal":18,"carbs":3.9,"fat":0.2,"protein":0.9}', '[]'),
('a0000001-0001-4000-8000-000000000002', 'lechuga', '["lechuga romana","lechuga iceberg"]', 'fruits_vegetables', '{"kcal":15,"carbs":2.9,"fat":0.2,"protein":1.4}', '[]'),
('a0000001-0001-4000-8000-000000000003', 'cebolla', '[]', 'fruits_vegetables', '{"kcal":40,"carbs":9.3,"fat":0.1,"protein":1.1}', '[]'),
('a0000001-0001-4000-8000-000000000004', 'ajo', '[]', 'fruits_vegetables', '{"kcal":149,"carbs":33.1,"fat":0.5,"protein":6.4}', '[]'),
('a0000001-0001-4000-8000-000000000005', 'zanahoria', '[]', 'fruits_vegetables', '{"kcal":41,"carbs":9.6,"fat":0.2,"protein":0.9}', '[]'),
('a0000001-0001-4000-8000-000000000006', 'espinacas', '[]', 'fruits_vegetables', '{"kcal":23,"carbs":3.6,"fat":0.4,"protein":2.9}', '[]'),
('a0000001-0001-4000-8000-000000000007', 'calabacín', '["zapallito"]', 'fruits_vegetables', '{"kcal":17,"carbs":3.1,"fat":0.3,"protein":1.2}', '[]'),
('a0000001-0001-4000-8000-000000000008', 'pimiento rojo', '["morrón rojo"]', 'fruits_vegetables', '{"kcal":31,"carbs":6.0,"fat":0.3,"protein":1.0}', '[]'),
('a0000001-0001-4000-8000-000000000009', 'patata', '["papa"]', 'fruits_vegetables', '{"kcal":77,"carbs":17.5,"fat":0.1,"protein":2.0}', '[]'),
('a0000001-0001-4000-8000-000000000010', 'plátano', '["banana"]', 'fruits_vegetables', '{"kcal":89,"carbs":22.8,"fat":0.3,"protein":1.1}', '[]'),
('a0000001-0001-4000-8000-000000000011', 'manzana', '[]', 'fruits_vegetables', '{"kcal":52,"carbs":13.8,"fat":0.2,"protein":0.3}', '[]'),
('a0000001-0001-4000-8000-000000000012', 'limón', '[]', 'fruits_vegetables', '{"kcal":29,"carbs":9.3,"fat":0.3,"protein":1.1}', '[]'),
('a0000001-0001-4000-8000-000000000013', 'aguacate', '["palta"]', 'fruits_vegetables', '{"kcal":160,"carbs":8.5,"fat":14.7,"protein":2.0}', '[]'),
('a0000001-0001-4000-8000-000000000014', 'brócoli', '["brécol"]', 'fruits_vegetables', '{"kcal":34,"carbs":6.6,"fat":0.4,"protein":2.8}', '[]'),
-- CARNES Y PESCADOS
('a0000001-0001-4000-8000-000000000015', 'pechuga de pollo', '["pollo","pechuga"]', 'meats', '{"kcal":165,"carbs":0,"fat":3.6,"protein":31.0}', '[]'),
('a0000001-0001-4000-8000-000000000016', 'salmón', '[]', 'meats', '{"kcal":208,"carbs":0,"fat":13.4,"protein":20.4}', '["pescado"]'),
('a0000001-0001-4000-8000-000000000017', 'huevo', '["huevos"]', 'meats', '{"kcal":155,"carbs":1.1,"fat":11.0,"protein":12.6}', '["huevo"]'),
('a0000001-0001-4000-8000-000000000018', 'atún', '["atún en lata"]', 'meats', '{"kcal":132,"carbs":0,"fat":6.0,"protein":19.0}', '["pescado"]'),
('a0000001-0001-4000-8000-000000000019', 'ternera', '["carne de res"]', 'meats', '{"kcal":250,"carbs":0,"fat":17.0,"protein":26.0}', '[]'),
('a0000001-0001-4000-8000-000000000020', 'gambas', '["camarones","langostinos"]', 'meats', '{"kcal":99,"carbs":0.2,"fat":0.3,"protein":24.0}', '["marisco"]'),
('a0000001-0001-4000-8000-000000000021', 'cerdo (lomo)', '["lomo de cerdo"]', 'meats', '{"kcal":143,"carbs":0,"fat":3.5,"protein":27.3}', '[]'),
-- LÁCTEOS
('a0000001-0001-4000-8000-000000000022', 'leche', '["leche entera"]', 'dairy', '{"kcal":61,"carbs":4.8,"fat":3.3,"protein":3.2}', '["lactosa"]'),
('a0000001-0001-4000-8000-000000000023', 'yogur natural', '["yogur"]', 'dairy', '{"kcal":59,"carbs":3.6,"fat":3.3,"protein":3.5}', '["lactosa"]'),
('a0000001-0001-4000-8000-000000000024', 'queso parmesano', '["parmesano"]', 'dairy', '{"kcal":431,"carbs":3.2,"fat":29.0,"protein":38.5}', '["lactosa"]'),
('a0000001-0001-4000-8000-000000000025', 'queso fresco', '["queso de Burgos"]', 'dairy', '{"kcal":174,"carbs":3.0,"fat":12.0,"protein":12.5}', '["lactosa"]'),
('a0000001-0001-4000-8000-000000000026', 'mantequilla', '[]', 'dairy', '{"kcal":717,"carbs":0.1,"fat":81.0,"protein":0.9}', '["lactosa"]'),
('a0000001-0001-4000-8000-000000000027', 'nata', '["crema de leche"]', 'dairy', '{"kcal":340,"carbs":2.8,"fat":36.0,"protein":2.0}', '["lactosa"]'),
-- CEREALES Y LEGUMBRES
('a0000001-0001-4000-8000-000000000028', 'arroz', '["arroz blanco","arroz basmati"]', 'cereals', '{"kcal":130,"carbs":28.2,"fat":0.3,"protein":2.7}', '[]'),
('a0000001-0001-4000-8000-000000000029', 'pasta', '["espaguetis","macarrones"]', 'cereals', '{"kcal":131,"carbs":25.0,"fat":1.1,"protein":5.0}', '["gluten"]'),
('a0000001-0001-4000-8000-000000000030', 'pan', '["pan de molde","pan integral"]', 'cereals', '{"kcal":265,"carbs":49.0,"fat":3.2,"protein":9.0}', '["gluten"]'),
('a0000001-0001-4000-8000-000000000031', 'lentejas', '[]', 'cereals', '{"kcal":116,"carbs":20.1,"fat":0.4,"protein":9.0}', '[]'),
('a0000001-0001-4000-8000-000000000032', 'garbanzos', '[]', 'cereals', '{"kcal":164,"carbs":27.4,"fat":2.6,"protein":8.9}', '[]'),
('a0000001-0001-4000-8000-000000000033', 'quinoa', '["quinua"]', 'cereals', '{"kcal":120,"carbs":21.3,"fat":1.9,"protein":4.4}', '[]'),
('a0000001-0001-4000-8000-000000000034', 'avena', '["copos de avena"]', 'cereals', '{"kcal":389,"carbs":66.3,"fat":6.9,"protein":16.9}', '["gluten"]'),
('a0000001-0001-4000-8000-000000000035', 'harina de trigo', '["harina"]', 'cereals', '{"kcal":364,"carbs":76.3,"fat":1.0,"protein":10.3}', '["gluten"]'),
-- OTROS
('a0000001-0001-4000-8000-000000000036', 'aceite de oliva', '["AOVE","aceite de oliva virgen extra"]', 'other', '{"kcal":884,"carbs":0,"fat":100,"protein":0}', '[]'),
('a0000001-0001-4000-8000-000000000037', 'sal', '[]', 'other', '{"kcal":0,"carbs":0,"fat":0,"protein":0}', '[]'),
('a0000001-0001-4000-8000-000000000038', 'pimienta negra', '["pimienta"]', 'other', '{"kcal":251,"carbs":63.9,"fat":3.3,"protein":10.4}', '[]'),
('a0000001-0001-4000-8000-000000000039', 'azúcar', '[]', 'other', '{"kcal":387,"carbs":100,"fat":0,"protein":0}', '[]'),
('a0000001-0001-4000-8000-000000000040', 'miel', '[]', 'other', '{"kcal":304,"carbs":82.4,"fat":0,"protein":0.3}', '[]'),
('a0000001-0001-4000-8000-000000000041', 'caldo de pollo', '["caldo"]', 'other', '{"kcal":7,"carbs":0.3,"fat":0.2,"protein":1.0}', '[]'),
('a0000001-0001-4000-8000-000000000042', 'tomate frito', '["salsa de tomate"]', 'other', '{"kcal":51,"carbs":8.7,"fat":1.5,"protein":1.3}', '[]'),
('a0000001-0001-4000-8000-000000000043', 'frutos secos', '["nueces","almendras"]', 'other', '{"kcal":607,"carbs":16.1,"fat":54.2,"protein":20.2}', '["frutos_secos"]'),
('a0000001-0001-4000-8000-000000000044', 'chocolate negro', '[]', 'other', '{"kcal":546,"carbs":45.9,"fat":31.3,"protein":7.8}', '["lactosa"]'),
('a0000001-0001-4000-8000-000000000045', 'granola', '[]', 'cereals', '{"kcal":471,"carbs":64.0,"fat":18.0,"protein":10.0}', '["gluten"]'),
('a0000001-0001-4000-8000-000000000046', 'frutos rojos', '["arándanos","frambuesas","fresas"]', 'fruits_vegetables', '{"kcal":43,"carbs":9.6,"fat":0.3,"protein":0.7}', '[]'),
('a0000001-0001-4000-8000-000000000047', 'pepino', '[]', 'fruits_vegetables', '{"kcal":15,"carbs":3.6,"fat":0.1,"protein":0.7}', '[]'),
('a0000001-0001-4000-8000-000000000048', 'aceitunas', '["olivas"]', 'other', '{"kcal":115,"carbs":6.0,"fat":11.0,"protein":0.8}', '[]'),
('a0000001-0001-4000-8000-000000000049', 'tahini', '["pasta de sésamo"]', 'other', '{"kcal":595,"carbs":21.2,"fat":53.8,"protein":17.0}', '["sesamo"]'),
('a0000001-0001-4000-8000-000000000050', 'orégano', '[]', 'other', '{"kcal":265,"carbs":68.9,"fat":4.3,"protein":9.0}', '[]');


-- ============================================================
-- BASE CATALOG RECIPES (10 recetas iniciales)
-- ============================================================

INSERT INTO base_catalog_recipes (id, name, meal_type, ingredients, servings, nutritional_total, compatibility_tags, goal_tags, version) VALUES
('b0000001-0001-4000-8000-000000000001', 'Tostadas con aguacate y huevo', 'breakfast',
  '[{"ingredient_id":"a0000001-0001-4000-8000-000000000030","quantity":80,"unit":"g"},{"ingredient_id":"a0000001-0001-4000-8000-000000000013","quantity":100,"unit":"g"},{"ingredient_id":"a0000001-0001-4000-8000-000000000017","quantity":2,"unit":"uds"},{"ingredient_id":"a0000001-0001-4000-8000-000000000037","quantity":1,"unit":"pizca"}]',
  2, '{"kcal":320,"carbs":28,"fat":18,"protein":14}',
  '["sin_frutos_secos"]', '[]', 1),

('b0000001-0001-4000-8000-000000000002', 'Yogur con granola y frutos rojos', 'breakfast',
  '[{"ingredient_id":"a0000001-0001-4000-8000-000000000023","quantity":200,"unit":"g"},{"ingredient_id":"a0000001-0001-4000-8000-000000000045","quantity":40,"unit":"g"},{"ingredient_id":"a0000001-0001-4000-8000-000000000046","quantity":80,"unit":"g"},{"ingredient_id":"a0000001-0001-4000-8000-000000000040","quantity":10,"unit":"g"}]',
  1, '{"kcal":280,"carbs":42,"fat":8,"protein":12}',
  '["sin_frutos_secos","vegetariano"]', '[]', 1),

('b0000001-0001-4000-8000-000000000003', 'Smoothie de espinacas y plátano', 'breakfast',
  '[{"ingredient_id":"a0000001-0001-4000-8000-000000000006","quantity":80,"unit":"g"},{"ingredient_id":"a0000001-0001-4000-8000-000000000010","quantity":120,"unit":"g"},{"ingredient_id":"a0000001-0001-4000-8000-000000000022","quantity":200,"unit":"ml"}]',
  1, '{"kcal":185,"carbs":35,"fat":3,"protein":7}',
  '["sin_gluten","sin_frutos_secos","vegetariano"]', '["baja_en_calorias"]', 1),

('b0000001-0001-4000-8000-000000000004', 'Pollo al limón con arroz', 'lunch',
  '[{"ingredient_id":"a0000001-0001-4000-8000-000000000015","quantity":200,"unit":"g"},{"ingredient_id":"a0000001-0001-4000-8000-000000000028","quantity":150,"unit":"g"},{"ingredient_id":"a0000001-0001-4000-8000-000000000012","quantity":2,"unit":"uds"},{"ingredient_id":"a0000001-0001-4000-8000-000000000036","quantity":15,"unit":"ml"},{"ingredient_id":"a0000001-0001-4000-8000-000000000004","quantity":3,"unit":"dientes"},{"ingredient_id":"a0000001-0001-4000-8000-000000000041","quantity":100,"unit":"ml"}]',
  2, '{"kcal":485,"carbs":52,"fat":12,"protein":38}',
  '["sin_gluten","sin_lactosa","sin_frutos_secos"]', '["alta_en_proteina"]', 1),

('b0000001-0001-4000-8000-000000000005', 'Ensalada mediterránea con queso fresco', 'lunch',
  '[{"ingredient_id":"a0000001-0001-4000-8000-000000000001","quantity":200,"unit":"g"},{"ingredient_id":"a0000001-0001-4000-8000-000000000047","quantity":150,"unit":"g"},{"ingredient_id":"a0000001-0001-4000-8000-000000000048","quantity":50,"unit":"g"},{"ingredient_id":"a0000001-0001-4000-8000-000000000025","quantity":80,"unit":"g"},{"ingredient_id":"a0000001-0001-4000-8000-000000000036","quantity":20,"unit":"ml"},{"ingredient_id":"a0000001-0001-4000-8000-000000000050","quantity":2,"unit":"g"}]',
  2, '{"kcal":310,"carbs":14,"fat":22,"protein":16}',
  '["sin_gluten","sin_frutos_secos","vegetariano"]', '["baja_en_calorias"]', 1),

('b0000001-0001-4000-8000-000000000006', 'Lentejas con verduras', 'lunch',
  '[{"ingredient_id":"a0000001-0001-4000-8000-000000000031","quantity":200,"unit":"g"},{"ingredient_id":"a0000001-0001-4000-8000-000000000005","quantity":100,"unit":"g"},{"ingredient_id":"a0000001-0001-4000-8000-000000000009","quantity":150,"unit":"g"},{"ingredient_id":"a0000001-0001-4000-8000-000000000003","quantity":80,"unit":"g"},{"ingredient_id":"a0000001-0001-4000-8000-000000000001","quantity":100,"unit":"g"},{"ingredient_id":"a0000001-0001-4000-8000-000000000036","quantity":15,"unit":"ml"}]',
  4, '{"kcal":380,"carbs":55,"fat":6,"protein":22}',
  '["sin_gluten","sin_lactosa","sin_frutos_secos","vegano"]', '["alta_en_proteina"]', 1),

('b0000001-0001-4000-8000-000000000007', 'Salmón a la plancha con brócoli', 'dinner',
  '[{"ingredient_id":"a0000001-0001-4000-8000-000000000016","quantity":200,"unit":"g"},{"ingredient_id":"a0000001-0001-4000-8000-000000000014","quantity":200,"unit":"g"},{"ingredient_id":"a0000001-0001-4000-8000-000000000036","quantity":10,"unit":"ml"},{"ingredient_id":"a0000001-0001-4000-8000-000000000012","quantity":1,"unit":"ud"},{"ingredient_id":"a0000001-0001-4000-8000-000000000037","quantity":1,"unit":"pizca"}]',
  2, '{"kcal":350,"carbs":8,"fat":18,"protein":38}',
  '["sin_gluten","sin_lactosa","sin_frutos_secos"]', '["alta_en_proteina","baja_en_calorias"]', 1),

('b0000001-0001-4000-8000-000000000008', 'Tortilla de espinacas', 'dinner',
  '[{"ingredient_id":"a0000001-0001-4000-8000-000000000017","quantity":4,"unit":"uds"},{"ingredient_id":"a0000001-0001-4000-8000-000000000006","quantity":150,"unit":"g"},{"ingredient_id":"a0000001-0001-4000-8000-000000000003","quantity":50,"unit":"g"},{"ingredient_id":"a0000001-0001-4000-8000-000000000036","quantity":10,"unit":"ml"},{"ingredient_id":"a0000001-0001-4000-8000-000000000037","quantity":1,"unit":"pizca"}]',
  2, '{"kcal":280,"carbs":4,"fat":18,"protein":24}',
  '["sin_gluten","sin_lactosa","sin_frutos_secos","vegetariano"]', '["alta_en_proteina","baja_en_calorias"]', 1),

('b0000001-0001-4000-8000-000000000009', 'Hummus con palitos de zanahoria', 'snack',
  '[{"ingredient_id":"a0000001-0001-4000-8000-000000000032","quantity":200,"unit":"g"},{"ingredient_id":"a0000001-0001-4000-8000-000000000049","quantity":30,"unit":"g"},{"ingredient_id":"a0000001-0001-4000-8000-000000000012","quantity":1,"unit":"ud"},{"ingredient_id":"a0000001-0001-4000-8000-000000000005","quantity":150,"unit":"g"},{"ingredient_id":"a0000001-0001-4000-8000-000000000036","quantity":15,"unit":"ml"}]',
  3, '{"kcal":180,"carbs":20,"fat":8,"protein":8}',
  '["sin_gluten","sin_lactosa","sin_frutos_secos","vegano"]', '["baja_en_calorias"]', 1),

('b0000001-0001-4000-8000-000000000010', 'Manzana con mantequilla de almendras', 'snack',
  '[{"ingredient_id":"a0000001-0001-4000-8000-000000000011","quantity":150,"unit":"g"},{"ingredient_id":"a0000001-0001-4000-8000-000000000043","quantity":20,"unit":"g"}]',
  1, '{"kcal":195,"carbs":25,"fat":10,"protein":4}',
  '["sin_gluten","sin_lactosa","vegetariano"]', '["baja_en_calorias"]', 1);
