-- ======================================================
-- FINAL INTEGRATED SCHEMA FOR CLOUDFLARE D1
-- ======================================================

-- 1. USERS TABLE (COMBINED)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, 
  name TEXT NOT NULL,
  gender TEXT,
  age INTEGER,
  height_cm REAL,
  weight_kg REAL,
  activity_level TEXT DEFAULT 'sedentary',
  goal TEXT,
  target_calories INTEGER,
  bmr REAL,
  tdee REAL,
  fitness_goal TEXT,
  body_fat_percentage REAL,
  target_weight_kg REAL,
  target_body_fat_percentage REAL,
  dietary_preference TEXT DEFAULT 'none',
  food_allergies TEXT,
  disliked_foods TEXT,
  workout_days_per_week INTEGER DEFAULT 4,
  preferred_workout_time TEXT DEFAULT 'morning',
  available_equipment TEXT DEFAULT 'gym',
  workout_duration_preference INTEGER DEFAULT 60,
  wake_up_time TEXT,
  sleep_time TEXT,
  daily_water_goal_ml INTEGER DEFAULT 2500,
  target_sleep_hours REAL DEFAULT 8,
  onboarding_completed BOOLEAN DEFAULT 0,
  onboarding_step INTEGER DEFAULT 0,
  profile_completeness INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. FOOD ITEMS
CREATE TABLE IF NOT EXISTS food_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  bangla_name TEXT,
  serving_unit TEXT NOT NULL,
  calories REAL NOT NULL,
  protein REAL NOT NULL,
  carbs REAL NOT NULL,
  fat REAL NOT NULL,
  category TEXT NOT NULL,
  is_bangladeshi_staple BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. EXERCISE LIBRARY
CREATE TABLE IF NOT EXISTS exercise_library (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  difficulty TEXT NOT NULL,
  muscle_group TEXT NOT NULL,
  equipment_needed TEXT,
  safety_instruction TEXT,
  gif_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. MEALS
CREATE TABLE IF NOT EXISTS meals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  meal_type TEXT NOT NULL,
  food_id INTEGER,
  food_name TEXT,
  quantity REAL DEFAULT 1,
  calories REAL DEFAULT 0,
  protein REAL DEFAULT 0,
  carbs REAL DEFAULT 0,
  fat REAL DEFAULT 0,
  completed BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (food_id) REFERENCES food_items(id) ON DELETE SET NULL
);

-- 5. WORKOUTS
CREATE TABLE IF NOT EXISTS workouts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  exercise_id INTEGER NOT NULL,
  sets INTEGER DEFAULT 1,
  reps TEXT,
  weight REAL DEFAULT 0,
  duration INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT 0,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (exercise_id) REFERENCES exercise_library(id) ON DELETE RESTRICT
);

-- 6. DAILY TRACKING
CREATE TABLE IF NOT EXISTS daily_tracking (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  date DATE NOT NULL,
  weight_kg REAL,
  steps INTEGER DEFAULT 0,
  calories_consumed INTEGER DEFAULT 0,
  water_liters REAL DEFAULT 0,
  sleep_hours REAL,
  mood_rating INTEGER,
  energy_level INTEGER,
  pain_points TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, date)
);

-- 7. USER GOALS & PREFERENCES
CREATE TABLE IF NOT EXISTS user_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  enable_workout_reminders BOOLEAN DEFAULT 1,
  enable_meal_reminders BOOLEAN DEFAULT 1,
  theme TEXT DEFAULT 'dark',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS personalized_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  plan_type TEXT NOT NULL,
  plan_data TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 8. ANALYTICS
CREATE TABLE IF NOT EXISTS analytics_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  event_name TEXT NOT NULL,
  feature_name TEXT,
  event_metadata TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_meals_user_date ON meals(user_id, date);
CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON workouts(user_id, date);
CREATE INDEX IF NOT EXISTS idx_dt_user_date ON daily_tracking(user_id, date);

-- ======================================================
-- SEED DATA (SAMPLED FOR D1 PERFORMANCE)
-- ======================================================

-- 1. Sample User (Ahmed)
INSERT OR IGNORE INTO users (id, email, password, name, gender, age, height_cm, weight_kg, goal, target_calories, bmr, tdee, onboarding_completed)
VALUES (1, 'user@fitdayai.com', 'static-salt:6ddd35d65ca1f0d5f7a3254c4d21aa5441da8b5b9e6a054248b163bf46b736c4', 'Ahmed Rahman', 'male', 28, 178, 72, 'gain_muscle', 2800, 1750, 2400, 1);

-- 2. Food Items
INSERT OR IGNORE INTO food_items (name, bangla_name, serving_unit, calories, protein, carbs, fat, category) VALUES 
('Plain White Rice', 'সাদা ভাত', '1 cup (150g)', 205, 4, 44, 0.5, 'carb'),
('Brown Rice', 'লাল চালের ভাত', '1 cup (150g)', 215, 5, 45, 1.5, 'carb'),
('Chicken Curry', 'চিকেন কারি', '1 cup', 280, 25, 8, 16, 'protein'),
('Masoor Dal', 'মসুর ডাল', '1 cup', 110, 7, 18, 2, 'protein'),
('Alu Bhorta', 'আলু ভর্তা', '1 serving', 150, 2, 25, 5, 'vegetable'),
('Egg (Boiled)', 'ডিম (সেদ্ধ)', '1 large', 75, 6, 0.5, 5, 'protein'),
('Banana', 'কলা', '1 medium', 105, 1, 27, 0, 'fruit'),
('Milk Tea', 'দুধ চা', '1 cup', 80, 2, 10, 3, 'beverage');

-- 3. Exercises
INSERT OR IGNORE INTO exercise_library (name, difficulty, muscle_group, equipment_needed, safety_instruction, gif_url) VALUES
('Push-ups', 'beginner', 'chest', 'none', 'Keep back straight.', 'https://gymvisual.com/img/p/1/7/5/5/2/17552.gif'),
('Bodyweight Squats', 'beginner', 'legs', 'none', 'Keep chest up.', 'https://gymvisual.com/img/p/2/1/7/4/1/21741.gif'),
('Plank', 'beginner', 'core', 'none', 'Engage core.', 'https://gymvisual.com/img/p/1/0/5/2/6/10526.gif'),
('Lunges', 'beginner', 'legs', 'none', 'Step forward.', 'https://gymvisual.com/img/p/5/7/6/7/5767.gif');

-- 4. Sample Activity Logs
INSERT OR IGNORE INTO daily_tracking (user_id, date, weight_kg, water_liters, steps, calories_consumed)
VALUES (1, date('now'), 72.5, 3.2, 8500, 2450);
