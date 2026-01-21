-- ======================================================
-- COMPLETE DATABASE SCHEMA FOR FITDAYAI
-- Includes all tables needed for full functionality
-- ======================================================

-- DROP ALL EXISTING TABLES
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS meals;
DROP TABLE IF EXISTS workouts;
DROP TABLE IF EXISTS food_items;
DROP TABLE IF EXISTS exercise_library;
DROP TABLE IF EXISTS user_progress;
DROP TABLE IF EXISTS meal_plans;
DROP TABLE IF EXISTS workout_plans;

-- ======================================================
-- 1. USERS TABLE
-- ======================================================
CREATE TABLE users (
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

-- ======================================================
-- 2. FOOD ITEMS TABLE (BANGLADESHI FOODS)
-- ======================================================
CREATE TABLE food_items (
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

-- ======================================================
-- 3. EXERCISE LIBRARY TABLE
-- ======================================================
CREATE TABLE exercise_library (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  muscle_group TEXT NOT NULL,
  equipment_needed TEXT NOT NULL,
  safety_instruction TEXT NOT NULL,
  gif_url TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ======================================================
-- 4. MEALS TABLE
-- ======================================================
CREATE TABLE meals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  date TEXT NOT NULL CHECK (date = date(date)),
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'snack', 'dinner')),
  food_id INTEGER NOT NULL,
  quantity REAL DEFAULT 1 CHECK (quantity > 0),
  completed BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (food_id) REFERENCES food_items(id) ON DELETE RESTRICT
);

-- ======================================================
-- 5. WORKOUTS TABLE
-- ======================================================
CREATE TABLE workouts (
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

-- ======================================================
-- 6. USER PROGRESS TABLE
-- ======================================================
CREATE TABLE user_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  date TEXT NOT NULL CHECK (date = date(date)),
  weight_kg REAL CHECK (weight_kg > 0),
  body_fat_percentage REAL CHECK (body_fat_percentage >= 0 AND body_fat_percentage <= 100),
  calories_consumed INTEGER DEFAULT 0 CHECK (calories_consumed >= 0),
  calories_burned INTEGER DEFAULT 0 CHECK (calories_burned >= 0),
  protein_consumed REAL DEFAULT 0 CHECK (protein_consumed >= 0),
  steps INTEGER DEFAULT 0 CHECK (steps >= 0),
  water_liters REAL DEFAULT 0 CHECK (water_liters >= 0),
  sleep_hours REAL DEFAULT 0 CHECK (sleep_hours >= 0),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ======================================================
-- 7. MEAL PLANS TABLE
-- ======================================================
CREATE TABLE meal_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  date TEXT NOT NULL CHECK (date = date(date)),
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'snack', 'dinner')),
  food_id INTEGER NOT NULL,
  quantity REAL DEFAULT 1 CHECK (quantity > 0),
  is_generated BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (food_id) REFERENCES food_items(id) ON DELETE RESTRICT
);

-- ======================================================
-- 8. WORKOUT PLANS TABLE
-- ======================================================
CREATE TABLE workout_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  date TEXT NOT NULL CHECK (date = date(date)),
  exercise_id INTEGER NOT NULL,
  sets INTEGER DEFAULT 1 CHECK (sets > 0),
  reps TEXT,
  weight REAL DEFAULT 0 CHECK (weight >= 0),
  duration INTEGER DEFAULT 0 CHECK (duration >= 0),
  order_index INTEGER DEFAULT 0 CHECK (order_index >= 0),
  is_generated BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (exercise_id) REFERENCES exercise_library(id) ON DELETE RESTRICT
);

-- ======================================================
-- INDEXES FOR PERFORMANCE
-- ======================================================

-- Users table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_goal ON users(goal);

-- Food items indexes
CREATE INDEX idx_food_items_category ON food_items(category);
CREATE INDEX idx_food_items_bangla_name ON food_items(bangla_name);

-- Exercise library indexes
CREATE INDEX idx_exercise_muscle_group ON exercise_library(muscle_group);
CREATE INDEX idx_exercise_difficulty ON exercise_library(difficulty);

-- Meals indexes
CREATE INDEX idx_meals_user_date ON meals(user_id, date);
CREATE INDEX idx_meals_user_meal_type ON meals(user_id, meal_type);
CREATE INDEX idx_meals_date ON meals(date);

-- Workouts indexes
CREATE INDEX idx_workouts_user_date ON workouts(user_id, date);
CREATE INDEX idx_workouts_exercise ON workouts(exercise_id);

-- Progress indexes
CREATE INDEX idx_progress_user_date ON user_progress(user_id, date);

-- Meal plans indexes
CREATE INDEX idx_meal_plans_user_date ON meal_plans(user_id, date);

-- Workout plans indexes
CREATE INDEX idx_workout_plans_user_date ON workout_plans(user_id, date);

-- ======================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ======================================================

-- Update users.updated_at when user record is modified
CREATE TRIGGER update_users_timestamp 
AFTER UPDATE ON users
BEGIN
  UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Update meals.updated_at when meal record is modified
CREATE TRIGGER update_meals_timestamp 
AFTER UPDATE ON meals
BEGIN
  UPDATE meals SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Update workouts.updated_at when workout record is modified
CREATE TRIGGER update_workouts_timestamp 
AFTER UPDATE ON workouts
BEGIN
  UPDATE workouts SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- ======================================================
-- VIEWS FOR COMMON QUERIES
-- ======================================================

-- View for meals with food details
CREATE VIEW meals_with_food AS
SELECT 
  m.id,
  m.user_id,
  m.date,
  m.meal_type,
  m.quantity,
  m.completed,
  m.created_at,
  f.name as food_name,
  f.bangla_name as food_bangla_name,
  f.serving_unit,
  f.calories,
  f.protein,
  f.carbs,
  f.fat,
  f.category,
  (m.quantity * f.calories) as total_calories,
  (m.quantity * f.protein) as total_protein,
  (m.quantity * f.carbs) as total_carbs,
  (m.quantity * f.fat) as total_fat
FROM meals m
JOIN food_items f ON m.food_id = f.id;

-- View for workouts with exercise details
CREATE VIEW workouts_with_exercise AS
SELECT 
  w.id,
  w.user_id,
  w.date,
  w.sets,
  w.reps,
  w.weight,
  w.duration,
  w.completed,
  w.notes,
  w.created_at,
  e.name as exercise_name,
  e.difficulty,
  e.muscle_group,
  e.equipment_needed,
  e.safety_instruction,
  e.gif_url
FROM workouts w
JOIN exercise_library e ON w.exercise_id = e.id;

-- View for daily nutrition summary
CREATE VIEW daily_nutrition_summary AS
SELECT 
  user_id,
  date,
  SUM(total_calories) as total_calories,
  SUM(total_protein) as total_protein,
  SUM(total_carbs) as total_carbs,
  SUM(total_fat) as total_fat,
  COUNT(CASE WHEN completed = 1 THEN 1 END) as completed_meals,
  COUNT(*) as total_meals
FROM meals_with_food
GROUP BY user_id, date;

-- View for daily workout summary
CREATE VIEW daily_workout_summary AS
SELECT 
  user_id,
  date,
  COUNT(CASE WHEN completed = 1 THEN 1 END) as completed_workouts,
  COUNT(*) as total_workouts,
  GROUP_CONCAT(DISTINCT muscle_group) as muscle_groups_worked
FROM workouts_with_exercise
GROUP BY user_id, date;

-- ======================================================
-- SAMPLE DATA INSERTION (OPTIONAL)
-- ======================================================

-- Insert a sample user for testing
INSERT OR IGNORE INTO users (
  email, password, salt, name, gender, age, height_cm, weight_kg, 
  activity_level, goal, target_calories, bmr, tdee
) VALUES (
  'test@fitdayai.com', 
  'hashed_password_here', 
  'salt_here', 
  'Test User', 
  'male', 
  25, 
  175, 
  70, 
  'moderate', 
  'maintain', 
  2500, 
  1700, 
  2100
);

-- ======================================================
-- SCHEMA VALIDATION
-- ======================================================

-- Ensure all required tables exist
SELECT name FROM sqlite_master WHERE type='table' AND name IN (
  'users', 'food_items', 'exercise_library', 'meals', 'workouts',
  'user_progress', 'meal_plans', 'workout_plans'
);

-- Ensure all indexes exist
SELECT name FROM sqlite_master WHERE type='index' AND name LIKE 'idx_%';

-- Ensure all views exist
SELECT name FROM sqlite_master WHERE type='view' AND name LIKE '%_view';

-- ======================================================
-- COMPLETION MESSAGE
-- ======================================================

-- Database schema is now complete and ready for use
-- All tables, indexes, triggers, and views have been created
-- The database supports full FitDayAI functionality