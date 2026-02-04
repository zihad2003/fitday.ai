-- ============================================
-- DATABASE CLEANUP
-- ============================================
DROP TABLE IF EXISTS streaks;
DROP TABLE IF EXISTS progress_logs;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS water_logs;
DROP TABLE IF EXISTS meal_plans;
DROP TABLE IF EXISTS meals;
DROP TABLE IF EXISTS exercise_logs;
DROP TABLE IF EXISTS workout_logs;
DROP TABLE IF EXISTS workout_exercises;
DROP TABLE IF EXISTS exercises;
DROP TABLE IF EXISTS daily_workouts;
DROP TABLE IF EXISTS workout_plans;
DROP TABLE IF EXISTS users;

-- ============================================
-- USERS TABLE (Authentication & Profile)
-- ============================================
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Fitness Profile
  age INTEGER,
  gender TEXT CHECK(gender IN ('male', 'female', 'other')),
  weight REAL,
  height REAL,
  target_weight REAL,
  
  -- Goals & Preferences
  primary_goal TEXT CHECK(primary_goal IN ('muscle_building', 'fat_loss', 'maintenance', 'endurance', 'strength')),
  activity_level TEXT CHECK(activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  workout_days_per_week INTEGER DEFAULT 3,
  preferred_workout_time TEXT CHECK(preferred_workout_time IN ('morning', 'afternoon', 'evening')),
  
  -- Nutrition
  dietary_preference TEXT, -- vegan, vegetarian, keto, halal, etc.
  allergies TEXT, -- JSON array stored as text
  daily_calorie_goal INTEGER,
  daily_protein_goal INTEGER,
  daily_carbs_goal INTEGER,
  daily_fats_goal INTEGER,
  daily_water_goal INTEGER DEFAULT 8, -- glasses of water
  
  -- Schedule
  wake_time TEXT, -- HH:MM format
  sleep_time TEXT, -- HH:MM format
  
  -- Settings
  notification_enabled INTEGER DEFAULT 1, -- 1 for true, 0 for false
  metric_system INTEGER DEFAULT 1 -- 1 for metric, 0 for imperial
);

-- ============================================
-- WORKOUT PLANS TABLE
-- ============================================
CREATE TABLE workout_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  plan_name TEXT NOT NULL,
  goal TEXT NOT NULL,
  days_per_week INTEGER NOT NULL,
  duration_weeks INTEGER DEFAULT 12,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- DAILY WORKOUTS TABLE
-- ============================================
CREATE TABLE daily_workouts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workout_plan_id INTEGER NOT NULL,
  day_of_week INTEGER NOT NULL, -- 0=Sunday, 1=Monday, etc.
  workout_type TEXT NOT NULL, -- 'Push', 'Pull', 'Legs', 'Upper', 'Lower', 'Full Body', 'Rest'
  focus_area TEXT, -- 'Chest & Triceps', 'Back & Biceps', etc.
  estimated_duration INTEGER DEFAULT 60, -- minutes
  FOREIGN KEY (workout_plan_id) REFERENCES workout_plans(id) ON DELETE CASCADE
);

-- ============================================
-- EXERCISES TABLE (Exercise Library)
-- ============================================
CREATE TABLE exercises (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  muscle_group TEXT NOT NULL, -- chest, back, legs, shoulders, arms, core, cardio
  equipment TEXT, -- barbell, dumbbell, machine, bodyweight, cables
  difficulty TEXT CHECK(difficulty IN ('beginner', 'intermediate', 'advanced')),
  exercise_type TEXT CHECK(exercise_type IN ('compound', 'isolation', 'cardio')),
  gif_url TEXT, -- URL to exercise demonstration GIF
  instructions TEXT, -- How to perform the exercise
  form_tips TEXT -- Common mistakes and form cues
);

-- ============================================
-- WORKOUT EXERCISES TABLE (Exercises in a workout)
-- ============================================
CREATE TABLE workout_exercises (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  daily_workout_id INTEGER NOT NULL,
  exercise_id INTEGER NOT NULL,
  sets INTEGER DEFAULT 3,
  reps INTEGER DEFAULT 10,
  rest_seconds INTEGER DEFAULT 60,
  order_index INTEGER DEFAULT 0, -- Order of exercise in workout
  notes TEXT,
  FOREIGN KEY (daily_workout_id) REFERENCES daily_workouts(id) ON DELETE CASCADE,
  FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
);

-- ============================================
-- WORKOUT LOGS TABLE (User's workout history)
-- ============================================
CREATE TABLE workout_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  daily_workout_id INTEGER,
  completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  duration_minutes INTEGER,
  notes TEXT,
  feeling TEXT CHECK(feeling IN ('great', 'good', 'okay', 'tired', 'exhausted')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (daily_workout_id) REFERENCES daily_workouts(id) ON DELETE SET NULL
);

-- ============================================
-- EXERCISE LOGS TABLE (Individual exercise performance)
-- ============================================
CREATE TABLE exercise_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workout_log_id INTEGER NOT NULL,
  exercise_id INTEGER NOT NULL,
  set_number INTEGER NOT NULL,
  reps_completed INTEGER,
  weight_used REAL, -- in kg or lbs
  completed INTEGER DEFAULT 1,
  FOREIGN KEY (workout_log_id) REFERENCES workout_logs(id) ON DELETE CASCADE,
  FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
);

-- ============================================
-- MEALS TABLE (Meal suggestions/plans)
-- ============================================
CREATE TABLE meals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  meal_type TEXT CHECK(meal_type IN ('breakfast', 'snack', 'lunch', 'pre_workout', 'post_workout', 'dinner')),
  calories INTEGER,
  protein REAL,
  carbs REAL,
  fats REAL,
  ingredients TEXT, -- JSON array stored as text
  recipe TEXT,
  prep_time INTEGER, -- minutes
  dietary_tags TEXT, -- vegan, vegetarian, keto, halal (JSON array)
  is_custom INTEGER DEFAULT 0 -- User-created meal
);

-- ============================================
-- MEAL PLANS TABLE (Daily meal schedule)
-- ============================================
CREATE TABLE meal_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  date DATE NOT NULL,
  meal_id INTEGER NOT NULL,
  meal_time TEXT, -- HH:MM format
  serving_size REAL DEFAULT 1,
  consumed INTEGER DEFAULT 0,
  consumed_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (meal_id) REFERENCES meals(id) ON DELETE CASCADE
);

-- ============================================
-- WATER LOGS TABLE
-- ============================================
CREATE TABLE water_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  date DATE NOT NULL,
  amount_ml INTEGER NOT NULL,
  logged_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- NOTIFICATIONS TABLE (Scheduled reminders)
-- ============================================
CREATE TABLE notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  notification_type TEXT CHECK(notification_type IN ('meal', 'water', 'workout', 'sleep', 'progress')),
  scheduled_time TEXT, -- HH:MM format
  message TEXT,
  is_active INTEGER DEFAULT 1,
  days_of_week TEXT, -- JSON array: [1,2,3,4,5] for Mon-Fri
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- PROGRESS TRACKING TABLE
-- ============================================
CREATE TABLE progress_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  log_date DATE NOT NULL,
  weight REAL,
  body_fat_percentage REAL,
  muscle_mass REAL,
  chest REAL, -- measurements in cm or inches
  waist REAL,
  hips REAL,
  biceps REAL,
  thighs REAL,
  photo_url TEXT,
  notes TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- STREAKS TABLE (Motivation tracking)
-- ============================================
CREATE TABLE streaks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  streak_type TEXT CHECK(streak_type IN ('workout', 'nutrition', 'water', 'overall')),
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- INDEXES for Performance
-- ============================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_workout_plans_user ON workout_plans(user_id);
CREATE INDEX idx_workout_logs_user ON workout_logs(user_id);
CREATE INDEX idx_meal_plans_user_date ON meal_plans(user_id, date);
CREATE INDEX idx_water_logs_user_date ON water_logs(user_id, date);
CREATE INDEX idx_progress_logs_user ON progress_logs(user_id);
CREATE INDEX idx_exercise_logs_workout ON exercise_logs(workout_log_id);
