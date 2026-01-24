-- D1 Schema for Food Logs and User Stats
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  daily_calorie_goal INTEGER DEFAULT 2000,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS food_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  food_name TEXT,
  bn_name TEXT,
  calories REAL,
  protein REAL,
  carbs REAL,
  fats REAL,
  logged_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS exercises (
  id TEXT PRIMARY KEY,
  name TEXT,
  bn_name TEXT,
  category TEXT,
  calories_per_minute REAL,
  gif_url TEXT
);
