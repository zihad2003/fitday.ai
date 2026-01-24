-- ======================================================
-- UNIFIED D1 SCHEMA FOR FITDAY AI (LOCAL & PRODUCTION)
-- ======================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, -- Stores "salt:hash"
  name TEXT NOT NULL,
  gender TEXT NOT NULL,
  age INTEGER NOT NULL,
  height_cm REAL NOT NULL,
  weight_kg REAL NOT NULL,
  activity_level TEXT DEFAULT 'sedentary',
  experience_level TEXT DEFAULT 'beginner', -- beginner, intermediate, pro
  goal TEXT NOT NULL,
  target_calories INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. FOOD ITEMS TABLE (DATABASE OF FOODS)
CREATE TABLE IF NOT EXISTS food_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  bangla_name TEXT,
  serving_unit TEXT DEFAULT '100g',
  calories REAL NOT NULL,
  protein REAL,
  carbs REAL,
  fat REAL,
  category TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. MEALS TABLE (USER LOGS)
CREATE TABLE IF NOT EXISTS meals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  date TEXT NOT NULL, -- YYYY-MM-DD
  meal_type TEXT NOT NULL, -- breakfast, lunch, snack, dinner
  food_name TEXT,
  calories REAL,
  protein REAL,
  carbs REAL,
  fat REAL,
  completed BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. EXERCISE LIBRARY
CREATE TABLE IF NOT EXISTS exercises (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  bn_name TEXT,
  category TEXT, -- Home, Gym, Cardio
  muscle_group TEXT, -- Chest, Back, Legs, etc.
  difficulty TEXT, -- Beginner, Intermediate, Advanced
  equipment_needed TEXT,
  safety_instruction TEXT,
  calories_per_minute REAL,
  gif_url TEXT,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. WORKOUT LOGS
CREATE TABLE IF NOT EXISTS workouts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  exercise_name TEXT,
  sets INTEGER,
  reps TEXT,
  weight REAL,
  completed BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
