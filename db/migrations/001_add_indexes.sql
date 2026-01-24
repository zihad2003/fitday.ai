-- Database Performance Optimization: Add Missing Indexes
-- These indexes will significantly improve query performance for common operations

-- 1. Meals table indexes
CREATE INDEX IF NOT EXISTS idx_meals_user_date ON meals(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_meals_type ON meals(meal_type);
CREATE INDEX IF NOT EXISTS idx_meals_completed ON meals(completed);

-- 2. Workouts table indexes  
CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON workouts(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_workouts_completed ON workouts(completed);

-- 3. Food items table indexes (for search)
CREATE INDEX IF NOT EXISTS idx_food_name ON food_items(name);
CREATE INDEX IF NOT EXISTS idx_food_category ON food_items(category);

-- 4. Exercises table indexes (for filtering)
CREATE INDEX IF NOT EXISTS idx_exercises_muscle ON exercises(muscle_group);
CREATE INDEX IF NOT EXISTS idx_exercises_difficulty ON exercises(difficulty);
CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises(category);

-- 5. Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_goal ON users(goal);

-- Verify indexes were created
SELECT name, tbl_name, sql FROM sqlite_master WHERE type = 'index' AND tbl_name IN ('users', 'meals', 'workouts', 'food_items', 'exercises');
