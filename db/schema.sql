-- db/schema.sql - Optimized for Logic & Performance
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS meals;
DROP TABLE IF EXISTS workouts;
DROP TABLE IF EXISTS food_items;

-- 1. Users (Added salt for security)
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, 
  salt TEXT NOT NULL, -- SECURITY FIX: Store salt for hashing
  name TEXT NOT NULL,
  gender TEXT NOT NULL,
  age INTEGER NOT NULL,
  height_cm REAL NOT NULL, 
  weight_kg REAL NOT NULL, 
  activity_level TEXT DEFAULT 'sedentary',
  goal TEXT NOT NULL,
  target_calories INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Meals (LOGIC FIX: Added macro columns)
CREATE TABLE meals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  date TEXT NOT NULL, 
  meal_type TEXT NOT NULL, 
  food TEXT NOT NULL,
  calories INTEGER NOT NULL,
  protein REAL DEFAULT 0, -- Store actual protein
  carbs REAL DEFAULT 0,   -- Store actual carbs
  fat REAL DEFAULT 0,     -- Store actual fat
  completed BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Workouts (No changes needed)
CREATE TABLE workouts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  type TEXT NOT NULL,
  completed BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Food Items (Static Data)
CREATE TABLE food_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  bangla_name TEXT,
  serving_unit TEXT NOT NULL,
  calories REAL NOT NULL,
  protein REAL NOT NULL,
  carbs REAL NOT NULL,
  fat REAL NOT NULL,
  category TEXT,
  is_bangladeshi_staple BOOLEAN DEFAULT TRUE
);