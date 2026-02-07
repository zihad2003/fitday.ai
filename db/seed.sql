-- ============================================
-- SEED DATA for COMPLETE SCHEMA (FIXED)
-- Matches complete_schema.sql structure
-- ============================================

-- 1. SEED EXERCISE LIBRARY
INSERT INTO exercise_library (name, muscle_group, equipment_needed, difficulty, safety_instruction, gif_url) VALUES
('Push-ups', 'chest', 'bodyweight', 'beginner', 'Keep back straight, lower chest to floor. Dont flare elbows out.', 'https://gymvisual.com/img/p/1/7/5/5/2/17552.gif'),
('Bodyweight Squats', 'legs', 'bodyweight', 'beginner', 'Sit back on heels, keep chest up. Drive through your heels.', 'https://gymvisual.com/img/p/2/1/7/4/1/21741.gif'),
('Plank', 'core', 'bodyweight', 'beginner', 'Hold a straight line from head to heels. Dont let your hips sag.', 'https://gymvisual.com/img/p/1/0/5/2/6/10526.gif'),
('Barbell Bench Press', 'chest', 'barbell', 'intermediate', 'Lower bar to mid-chest, press up. Keep your feet planted.', 'https://i.imgur.com/8Xqy7sD.gif'),
('Deadlifts', 'back', 'barbell', 'advanced', 'Hinge at hips, keep back straight. Pull the slack out of the bar.', 'https://i.imgur.com/8Zx6K9r.gif'),
('Lat Pulldowns', 'back', 'machine', 'beginner', 'Pull bar to upper chest. Focus on pulling with your elbows.', 'https://i.imgur.com/6Zw9N8u.gif'),
('Lateral Raises', 'shoulders', 'dumbbell', 'beginner', 'Raise arms to sides till parallel to floor. Slight bend in elbows.', 'https://i.imgur.com/7Xz0Y9f.gif'),
('Hammer Curls', 'arms', 'dumbbell', 'beginner', 'Palm inward, curl weight. Keep elbows pinned to sides.', 'https://i.imgur.com/8Xz9H9o.gif');

-- 2. SEED FOOD ITEMS (Bangladeshi Staples)
INSERT INTO food_items (name, category, calories, protein, carbs, fat, serving_unit, is_bangladeshi_staple) VALUES
('Plain White Rice', 'Lunch', 205, 4, 44, 0.5, '1 cup', 1),
('Chicken Curry', 'Dinner', 280, 25, 8, 16, '150g', 1),
('Masoor Dal', 'Lunch', 110, 7, 18, 2, '1 cup', 1),
('Egg (Boiled)', 'Breakfast', 75, 6, 0.5, 5, '1 large', 1),
('Khichuri', 'Lunch', 280, 8, 42, 6, '1 cup', 1),
('Beef Rezala', 'Dinner', 350, 25, 8, 22, '150g', 1),
('Milk Tea', 'Snack', 80, 2, 10, 3, '1 cup', 1);

-- 3. SAMPLE USER (Ahmed)
INSERT INTO users (email, password, name, age, gender, weight_kg, height_cm, goal, activity_level, target_calories) VALUES
('user@fitdayai.com', 'hashed_password_placeholder', 'Ahmed Rahman', 28, 'male', 72, 178, 'gain_muscle', 'moderate', 2800);

-- 4. SAMPLE WORKOUT PLAN (Calendar Based - Next 3 Days)
-- User ID 1, Date (Today + 0, 1, 2)
INSERT INTO workout_plans (user_id, date, exercise_id, sets, reps, is_generated, order_index) VALUES
-- Day 1: Upper (Push-ups, Bench Press, Lat Pulldowns)
(1, date('now'), 1, 3, '15', 1, 1),
(1, date('now'), 4, 4, '10', 1, 2),
(1, date('now'), 6, 3, '12', 1, 3),

-- Day 2: Lower (Squats)
(1, date('now', '+1 day'), 2, 4, '15', 1, 1),
(1, date('now', '+1 day'), 3, 3, '60s', 1, 2);
