-- db/setup.sql
-- Run this with: npx wrangler d1 execute fitday-ai-db --local --file=db/setup.sql

-- 1. Create Users Table (Correct Schema)
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, 
  name TEXT NOT NULL,
  gender TEXT NOT NULL,
  age INTEGER NOT NULL,
  height_cm REAL NOT NULL,
  weight_kg REAL NOT NULL,
  activity_level TEXT DEFAULT 'sedentary',
  goal TEXT NOT NULL,
  target_calories INTEGER,
  bmr REAL,
  tdee REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Insert a Default User (Password: password123)
-- Hash generated for "password123" with salt "static-salt"
INSERT INTO users (
  email, password, name, gender, age, height_cm, weight_kg, activity_level, goal, target_calories
) VALUES (
  'user@example.com', 
  'static-salt:6ddd35d65ca1f0d5f7a3254c4d21aa5441da8b5b9e6a054248b163bf46b736c4', 
  'Test User', 
  'male', 
  25, 
  175, 
  70, 
  'moderate', 
  'maintain', 
  2500
);

-- 3. Ensure other tables exist (Minimal)
CREATE TABLE IF NOT EXISTS food_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  bangla_name TEXT,
  serving_unit TEXT NOT NULL,
  calories REAL NOT NULL,
  protein REAL NOT NULL,
  carbs REAL NOT NULL,
  fat REAL NOT NULL,
  category TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS exercise_library (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  difficulty TEXT NOT NULL,
  muscle_group TEXT NOT NULL,
  equipment_needed TEXT NOT NULL,
  safety_instruction TEXT NOT NULL,
  gif_url TEXT NOT NULL
);
