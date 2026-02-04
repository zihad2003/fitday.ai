-- Enhanced User Profile Schema for Goal-Based Personalization
-- Migration: Add comprehensive user profile fields

-- Add new columns to users table for personalization
ALTER TABLE users ADD COLUMN fitness_goal TEXT CHECK (fitness_goal IN (
  'build_muscle', 
  'lose_weight', 
  'maintain_fitness', 
  'improve_endurance',
  'increase_strength',
  'improve_flexibility',
  'general_health'
));

ALTER TABLE users ADD COLUMN body_fat_percentage REAL CHECK (body_fat_percentage >= 0 AND body_fat_percentage <= 100);
ALTER TABLE users ADD COLUMN target_weight_kg REAL CHECK (target_weight_kg > 0);
ALTER TABLE users ADD COLUMN target_body_fat_percentage REAL CHECK (target_body_fat_percentage >= 0 AND target_body_fat_percentage <= 100);

-- Dietary preferences
ALTER TABLE users ADD COLUMN dietary_preference TEXT CHECK (dietary_preference IN (
  'none',
  'vegetarian',
  'vegan',
  'pescatarian',
  'keto',
  'paleo',
  'halal',
  'kosher',
  'gluten_free',
  'dairy_free'
));
ALTER TABLE users ADD COLUMN food_allergies TEXT; -- JSON array of allergies
ALTER TABLE users ADD COLUMN disliked_foods TEXT; -- JSON array of disliked foods

-- Workout preferences
ALTER TABLE users ADD COLUMN workout_days_per_week INTEGER CHECK (workout_days_per_week >= 1 AND workout_days_per_week <= 7);
ALTER TABLE users ADD COLUMN preferred_workout_time TEXT CHECK (preferred_workout_time IN ('morning', 'afternoon', 'evening', 'flexible'));
ALTER TABLE users ADD COLUMN available_equipment TEXT CHECK (available_equipment IN ('home', 'gym', 'bodyweight_only', 'minimal'));
ALTER TABLE users ADD COLUMN workout_duration_preference INTEGER CHECK (workout_duration_preference >= 15 AND workout_duration_preference <= 180); -- minutes

-- Schedule and lifestyle
ALTER TABLE users ADD COLUMN wake_up_time TEXT; -- HH:MM format
ALTER TABLE users ADD COLUMN sleep_time TEXT; -- HH:MM format
ALTER TABLE users ADD COLUMN daily_water_goal_ml INTEGER DEFAULT 2000 CHECK (daily_water_goal_ml >= 500 AND daily_water_goal_ml <= 10000);
ALTER TABLE users ADD COLUMN target_sleep_hours REAL DEFAULT 8 CHECK (target_sleep_hours >= 4 AND target_sleep_hours <= 12);

-- Goal timeline
ALTER TABLE users ADD COLUMN goal_deadline DATE;
ALTER TABLE users ADD COLUMN weekly_weight_change_goal REAL; -- kg per week (negative for loss, positive for gain)

-- Onboarding status
ALTER TABLE users ADD COLUMN onboarding_completed BOOLEAN DEFAULT 0;
ALTER TABLE users ADD COLUMN onboarding_step INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN profile_completeness INTEGER DEFAULT 0; -- percentage

-- Preferences
ALTER TABLE users ADD COLUMN notification_preferences TEXT; -- JSON object
ALTER TABLE users ADD COLUMN timezone TEXT DEFAULT 'Asia/Dhaka';
ALTER TABLE users ADD COLUMN language_preference TEXT DEFAULT 'en' CHECK (language_preference IN ('en', 'bn'));

-- Create user_goals table for tracking multiple goals
CREATE TABLE IF NOT EXISTS user_goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  goal_type TEXT NOT NULL CHECK (goal_type IN (
    'weight_loss',
    'muscle_gain',
    'strength_increase',
    'endurance_improvement',
    'flexibility_improvement',
    'habit_building',
    'custom'
  )),
  goal_name TEXT NOT NULL,
  target_value REAL,
  current_value REAL,
  unit TEXT, -- kg, lbs, reps, minutes, etc.
  start_date DATE NOT NULL,
  target_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'abandoned')),
  priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 5),
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create user_preferences table for detailed settings
CREATE TABLE IF NOT EXISTS user_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  
  -- Notification settings
  enable_workout_reminders BOOLEAN DEFAULT 1,
  enable_meal_reminders BOOLEAN DEFAULT 1,
  enable_water_reminders BOOLEAN DEFAULT 1,
  enable_sleep_reminders BOOLEAN DEFAULT 1,
  enable_progress_updates BOOLEAN DEFAULT 1,
  enable_motivational_messages BOOLEAN DEFAULT 1,
  
  -- Reminder times (JSON arrays of time strings)
  workout_reminder_times TEXT,
  meal_reminder_times TEXT,
  water_reminder_times TEXT,
  
  -- Display preferences
  use_metric_system BOOLEAN DEFAULT 1,
  show_calories BOOLEAN DEFAULT 1,
  show_macros BOOLEAN DEFAULT 1,
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'auto')),
  
  -- Privacy settings
  profile_visibility TEXT DEFAULT 'private' CHECK (profile_visibility IN ('public', 'friends', 'private')),
  share_progress BOOLEAN DEFAULT 0,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create personalized_plans table
CREATE TABLE IF NOT EXISTS personalized_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('nutrition', 'workout', 'combined')),
  plan_name TEXT NOT NULL,
  description TEXT,
  
  -- Plan parameters
  duration_weeks INTEGER NOT NULL CHECK (duration_weeks > 0),
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  
  -- Plan data (JSON)
  plan_data TEXT NOT NULL, -- Detailed plan structure
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  start_date DATE,
  end_date DATE,
  
  -- Tracking
  adherence_percentage REAL DEFAULT 0 CHECK (adherence_percentage >= 0 AND adherence_percentage <= 100),
  last_updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create daily_tracking table for comprehensive daily metrics
CREATE TABLE IF NOT EXISTS daily_tracking (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  date DATE NOT NULL,
  
  -- Weight and body metrics
  weight_kg REAL,
  body_fat_percentage REAL,
  muscle_mass_kg REAL,
  
  -- Activity tracking
  steps INTEGER DEFAULT 0,
  active_minutes INTEGER DEFAULT 0,
  calories_burned INTEGER DEFAULT 0,
  
  -- Nutrition tracking
  calories_consumed INTEGER DEFAULT 0,
  protein_g REAL DEFAULT 0,
  carbs_g REAL DEFAULT 0,
  fat_g REAL DEFAULT 0,
  water_ml INTEGER DEFAULT 0,
  
  -- Sleep tracking
  sleep_hours REAL,
  sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 5),
  
  -- Mood and energy
  mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 5),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 5),
  
  -- Workout completion
  workouts_completed INTEGER DEFAULT 0,
  workout_duration_minutes INTEGER DEFAULT 0,
  
  -- Notes
  daily_notes TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_goals_user_id ON user_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_status ON user_goals(status);
CREATE INDEX IF NOT EXISTS idx_personalized_plans_user_id ON personalized_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_personalized_plans_status ON personalized_plans(status);
CREATE INDEX IF NOT EXISTS idx_daily_tracking_user_date ON daily_tracking(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_tracking_date ON daily_tracking(date);

-- Success message
SELECT 'Enhanced user profile schema created successfully' as status;
