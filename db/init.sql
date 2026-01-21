-- Database initialization for Cloudflare D1
-- This file ensures all tables exist and are properly structured

-- Check if database is accessible
SELECT 1 as test_connection;

-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, 
  name TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  age INTEGER NOT NULL CHECK (age > 0),
  height_cm REAL NOT NULL CHECK (height_cm > 0),
  weight_kg REAL NOT NULL CHECK (weight_kg > 0),
  activity_level TEXT DEFAULT 'sedentary' CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  goal TEXT NOT NULL CHECK (goal IN ('lose_weight', 'gain_muscle', 'maintain')),
  target_calories INTEGER,
  bmr REAL,
  tdee REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS food_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  bangla_name TEXT,
  serving_unit TEXT NOT NULL,
  calories REAL NOT NULL CHECK (calories >= 0),
  protein REAL NOT NULL CHECK (protein >= 0),
  carbs REAL NOT NULL CHECK (carbs >= 0),
  fat REAL NOT NULL CHECK (fat >= 0),
  category TEXT NOT NULL,
  is_bangladeshi_staple BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS exercise_library (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  muscle_group TEXT NOT NULL,
  equipment_needed TEXT NOT NULL,
  safety_instruction TEXT NOT NULL,
  gif_url TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS meals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  date TEXT NOT NULL CHECK (date = date(date)),
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'snack', 'dinner')),
  food_id INTEGER NOT NULL,
  quantity REAL DEFAULT 1 CHECK (quantity > 0),
  calories INTEGER DEFAULT 0,
  protein REAL DEFAULT 0,
  carbs REAL DEFAULT 0,
  fat REAL DEFAULT 0,
  completed BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (food_id) REFERENCES food_items(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS workouts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  date TEXT NOT NULL CHECK (date = date(date)),
  exercise_id INTEGER NOT NULL,
  sets INTEGER DEFAULT 1 CHECK (sets > 0),
  reps TEXT,
  weight REAL DEFAULT 0 CHECK (weight >= 0),
  duration INTEGER DEFAULT 0 CHECK (duration >= 0),
  completed BOOLEAN DEFAULT 0,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (exercise_id) REFERENCES exercise_library(id) ON DELETE RESTRICT
);

-- Success message
SELECT 'Database tables initialized successfully' as status;