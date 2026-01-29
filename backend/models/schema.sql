-- Optional
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

BEGIN;

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  firebase_uid TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('doctor','patient','admin')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- PATIENTS
CREATE TABLE IF NOT EXISTS patients (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  doctor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  age INTEGER CHECK (age >= 0),
  condition TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- FOOD ITEMS (per 100g baseline)
CREATE TABLE IF NOT EXISTS food_items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  unit TEXT NOT NULL DEFAULT 'per_100g',
  calories NUMERIC(10,2) NOT NULL DEFAULT 0,
  protein  NUMERIC(10,2) NOT NULL DEFAULT 0,
  carbs    NUMERIC(10,2) NOT NULL DEFAULT 0,
  fat      NUMERIC(10,2) NOT NULL DEFAULT 0,
  ayurvedic_properties TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- RECIPES (NOTE: uses 'title' to match controllers/AI)
CREATE TABLE IF NOT EXISTS recipes (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL UNIQUE,
  description TEXT,
  created_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- RECIPE INGREDIENTS
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id SERIAL PRIMARY KEY,
  recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  food_item_id INTEGER NOT NULL REFERENCES food_items(id) ON DELETE RESTRICT,
  quantity_g NUMERIC(10,2) NOT NULL CHECK (quantity_g > 0),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (recipe_id, food_item_id)
);

-- DIET CHARTS
CREATE TABLE IF NOT EXISTS diet_charts (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  notes TEXT,
  created_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- NUTRIENT ANALYSIS (optional cached totals)
CREATE TABLE IF NOT EXISTS nutrient_analysis (
  id SERIAL PRIMARY KEY,
  diet_chart_id INTEGER NOT NULL UNIQUE REFERENCES diet_charts(id) ON DELETE CASCADE,
  total_calories NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_protein  NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_carbs    NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_fat      NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_patients_doctor ON patients(doctor_id);
CREATE INDEX IF NOT EXISTS idx_diet_charts_patient ON diet_charts(patient_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id);

COMMIT;

-- Seed: foods (per 100g)
INSERT INTO food_items (name, calories, protein, carbs, fat, ayurvedic_properties) VALUES
('Oats', 389, 16.90, 66.30, 6.90, 'Vata balancing, grounding'),
('Quinoa', 368, 14.10, 64.20, 6.10, 'Tridoshic, light'),
('Lentils', 353, 25.80, 60.10, 1.10, 'Vata/Pitta balancing'),
('Rice (White)', 130, 2.70, 28.00, 0.30, 'Neutral, easy to digest'),
('Wheat Flour', 364, 10.00, 76.00, 1.00, 'Kapha aggravating in excess'),
('Chickpeas', 364, 19.00, 61.00, 6.00, 'Vata aggravating; soak well'),
('Spinach', 23, 2.90, 3.60, 0.40, 'Cooling, Pitta pacifying'),
('Tomato', 18, 0.90, 3.90, 0.20, 'Slightly heating'),
('Cucumber', 16, 0.70, 3.60, 0.10, 'Cooling, Pitta pacifying'),
('Banana', 89, 1.10, 23.00, 0.30, 'Sweet, heavy; Kapha increasing'),
('Apple', 52, 0.30, 14.00, 0.20, 'Light, Vata pacifying when cooked'),
('Milk (Cow)', 61, 3.20, 5.00, 3.30, 'Cooling, nourishing'),
('Yogurt (Curd)', 59, 10.00, 3.60, 0.40, 'Sour; Kapha/Pitta increasing'),
('Ghee', 900, 0.00, 0.00, 100.00, 'Ojas building, Vata pacifying'),
('Coconut Water', 19, 0.70, 3.70, 0.20, 'Cooling, Pitta pacifying'),
('Almonds', 579, 21.20, 21.70, 49.90, 'Warming, Vata balancing'),
('Turmeric', 354, 7.80, 64.90, 9.90, 'Anti-inflammatory, Tridoshic'),
('Ginger (Fresh)', 80, 1.80, 18.00, 0.80, 'Warming, Kapha reducing'),
('Honey', 304, 0.30, 82.40, 0.00, 'Heating, Kapha reducing'),
('Jaggery', 383, 0.40, 98.00, 0.10, 'Heating; iron rich')
ON CONFLICT (name) DO NOTHING;

-- Seed: minimal users (doctor/patient/admin)
INSERT INTO users (firebase_uid, name, email, role) VALUES
('doc-uid-1', 'Dr. Arya', 'doctor@example.com', 'doctor'),
('pat-uid-1', 'John Patient', 'patient@example.com', 'patient'),
('adm-uid-1', 'Admin One', 'admin@example.com', 'admin')
ON CONFLICT (firebase_uid) DO NOTHING;

-- Link patient to doctor
INSERT INTO patients (user_id, doctor_id, name, age, condition)
SELECT p.id, d.id, 'John Patient', 30, 'Acidity'
FROM users p, users d
WHERE p.firebase_uid = 'pat-uid-1' AND d.firebase_uid = 'doc-uid-1'
ON CONFLICT DO NOTHING;

-- Seed: recipes (title matches controllers/AI)
INSERT INTO recipes (title, description, created_by_user_id)
SELECT 'Moong Dal Khichdi', 'Light, easy to digest', u.id FROM users u WHERE u.firebase_uid = 'doc-uid-1'
ON CONFLICT (title) DO NOTHING;

INSERT INTO recipes (title, description, created_by_user_id)
SELECT 'Vegetable Stew', 'Warm and nourishing', u.id FROM users u WHERE u.firebase_uid = 'doc-uid-1'
ON CONFLICT (title) DO NOTHING;

-- Optionally attach ingredients if the foods exist
INSERT INTO recipe_ingredients (recipe_id, food_item_id, quantity_g)
SELECT r.id, f.id, 100
FROM recipes r, food_items f
WHERE r.title = 'Moong Dal Khichdi' AND f.name = 'Lentils'
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS recipes (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO recipes (title, description) VALUES 
('Moong Dal Khichdi', 'Light, easy to digest'),
('Vegetable Stew', 'Warm and nourishing'),
('Ginger Tea', 'Digestive and warming');