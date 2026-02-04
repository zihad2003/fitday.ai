-- Features: Achievements and Streaks

-- 1. ACHIEVEMENTS LIBRARY
CREATE TABLE IF NOT EXISTS achievement_library (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('workout', 'nutrition', 'lifestyle', 'consistency')),
  icon_name TEXT NOT NULL,
  requirement_type TEXT NOT NULL, -- e.g., 'workout_count', 'streak_days', 'weight_lost'
  requirement_value REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. USER ACHIEVEMENTS
CREATE TABLE IF NOT EXISTS user_achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  achievement_id INTEGER NOT NULL,
  earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (achievement_id) REFERENCES achievement_library(id) ON DELETE CASCADE,
  UNIQUE(user_id, achievement_id)
);

-- 3. USER STREAKS
CREATE TABLE IF NOT EXISTS user_streaks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date TEXT, -- YYYY-MM-DD
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Seed Achievement Library
INSERT OR IGNORE INTO achievement_library (name, description, category, icon_name, requirement_type, requirement_value) VALUES
('First Sync', 'Complete your first daily data sync', 'consistency', 'Zap', 'sync_count', 1),
('Consistency King', 'Maintain a 7-day activity streak', 'consistency', 'Crown', 'streak_days', 7),
('Hydration Hero', 'Drink 2L+ water for 3 consecutive days', 'lifestyle', 'Droplet', 'water_streak', 3),
('Muscle Builder', 'Complete 10 strength workouts', 'workout', 'Dumbbell', 'workout_count', 10),
('Weight Warrior', 'Lose your first 2kg', 'nutrition', 'TrendingDown', 'weight_lost', 2),
('Early Bird', 'Complete a workout before 8 AM', 'workout', 'Sun', 'early_workout', 1);
