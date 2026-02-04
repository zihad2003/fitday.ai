-- ============================================
-- SEED DATA for NEW SCHEMA (FIXED)
-- ============================================

-- 1. SEED EXERCISES
INSERT INTO exercises (name, muscle_group, equipment, difficulty, exercise_type, gif_url, instructions, form_tips) VALUES
('Push-ups', 'chest', 'bodyweight', 'beginner', 'compound', 'https://gymvisual.com/img/p/1/7/5/5/2/17552.gif', 'Keep back straight, lower chest to floor.', 'Dont flare elbows out.'),
('Bodyweight Squats', 'legs', 'bodyweight', 'beginner', 'compound', 'https://gymvisual.com/img/p/2/1/7/4/1/21741.gif', 'Sit back on heels, keep chest up.', 'Drive through your heels.'),
('Plank', 'core', 'bodyweight', 'beginner', 'isolation', 'https://gymvisual.com/img/p/1/0/5/2/6/10526.gif', 'Hold a straight line from head to heels.', 'Dont let your legacy sag.'),
('Barbell Bench Press', 'chest', 'barbell', 'intermediate', 'compound', 'https://i.imgur.com/8Xqy7sD.gif', 'Lower bar to mid-chest, press up.', 'Keep your feet planted.'),
('Deadlifts', 'back', 'barbell', 'advanced', 'compound', 'https://i.imgur.com/8Zx6K9r.gif', 'Hinge at hips, keep back straight.', 'Pull the slack out of the bar.'),
('Lat Pulldowns', 'back', 'machine', 'beginner', 'isolation', 'https://i.imgur.com/6Zw9N8u.gif', 'Pull bar to upper chest.', 'Focus on pulling with your elbows.'),
('Lateral Raises', 'shoulders', 'dumbbell', 'beginner', 'isolation', 'https://i.imgur.com/7Xz0Y9f.gif', 'Raise arms to sides till parallel to floor.', 'Slight bend in elbows.'),
('Hammer Curls', 'arms', 'dumbbell', 'beginner', 'isolation', 'https://i.imgur.com/8Xz9H9o.gif', 'Palm inward, curl weight.', 'Keep elbows pinned to sides.');

-- 2. SEED MEALS (Bangladeshi Staples)
INSERT INTO meals (name, meal_type, calories, protein, carbs, fats, ingredients, recipe, prep_time, dietary_tags) VALUES
('Plain White Rice', 'lunch', 205, 4, 44, 0.5, '["Rice", "Water"]', 'Boil rice in water until soft.', 20, '["halal", "vegetarian"]'),
('Chicken Curry', 'dinner', 280, 25, 8, 16, '["Chicken", "Onions", "Spices", "Oil"]', 'Saute onions and spices, add chicken and cook.', 40, '["halal", "high-protein"]'),
('Masoor Dal', 'lunch', 110, 7, 18, 2, '["Lentils", "Water", "Garlic", "Spices"]', 'Boil lentils until thick, temper with garlic.', 30, '["halal", "vegan"]'),
('Egg (Boiled)', 'breakfast', 75, 6, 0.5, 5, '["Egg"]', 'Boil egg for 8-10 minutes.', 10, '["halal", "vegetarian"]'),
('Khichuri', 'lunch', 280, 8, 42, 6, '["Rice", "Lentils", "Spices"]', 'Cook rice and lentils together with spices.', 45, '["halal", "vegetarian"]'),
('Beef Rezala', 'dinner', 350, 25, 8, 22, '["Beef", "Yogurt", "Spices"]', 'Slow cook beef with yogurt and aromatic spices.', 90, '["halal"]'),
('Milk Tea', 'snack', 80, 2, 10, 3, '["Tea", "Milk", "Sugar"]', 'Brew tea, add milk and sugar.', 5, '["vegetarian"]');

-- 3. SAMPLE USER (Ahmed)
INSERT INTO users (email, password_hash, name, age, gender, weight, height, primary_goal, activity_level, daily_calorie_goal) VALUES
('user@fitdayai.com', 'static-salt:6ddd35d65ca1f0d5f7a3254c4d21aa5441da8b5b9e6a054248b163bf46b736c4', 'Ahmed Rahman', 28, 'male', 72, 178, 'muscle_building', 'moderate', 2800);

-- 4. SAMPLE WORKOUT PLAN
INSERT INTO workout_plans (user_id, plan_name, goal, days_per_week) VALUES
(1, 'Initial Hypertrophy Protocol', 'muscle_building', 4);

-- 5. DAILY WORKOUTS (Day 1: Upper Body)
INSERT INTO daily_workouts (workout_plan_id, day_of_week, workout_type, focus_area) VALUES
(1, 1, 'Upper', 'Chest & Back');

-- 6. WORKOUT EXERCISES
INSERT INTO workout_exercises (daily_workout_id, exercise_id, sets, reps, order_index) VALUES
(1, 1, 3, 15, 1), -- Push-ups
(1, 4, 4, 10, 2), -- Bench Press
(1, 6, 3, 12, 3); -- Lat Pulldowns
