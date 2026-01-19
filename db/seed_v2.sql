-- CLEANUP
DELETE FROM food_items;
DELETE FROM exercise_library;

-- ======================================================
-- IMPORT COMPREHENSIVE BANGLADESHI FOOD DATABASE
-- ======================================================
.read bangladeshi_foods.sql

-- ======================================================
-- IMPORT COMPREHENSIVE EXERCISE LIBRARY
-- ======================================================
.read exercise_library.sql

-- ======================================================
-- 1. MEDICAL / HEALTHY STAPLES (For AI Recommendations)
-- ======================================================

-- Complex Carbs
INSERT INTO food_items (name, bangla_name, serving_unit, calories, protein, carbs, fat, category) VALUES 
('Brown Rice', 'লাল চালের ভাত', '1 cup (150g)', 215, 5, 45, 1.5, 'carb'),
('Ruti (No Oil)', 'আটার রুটি (তেল ছাড়া)', '1 piece', 100, 3.5, 20, 1, 'carb'),
('Oats (Water)', 'ওটস', '1 cup', 150, 5, 27, 2.5, 'carb'),
('Steam Rice', 'সাদা ভাত', '1 cup', 205, 4, 44, 0.5, 'carb');

-- Lean Proteins
INSERT INTO food_items (name, bangla_name, serving_unit, calories, protein, carbs, fat, category) VALUES 
('Grilled Chicken', 'গ্রিল্ড চিকেন', '100g', 165, 31, 0, 3.6, 'protein'),
('Fish Curry (Light)', 'মাছের ঝোল (পাতলা)', '1 piece', 140, 18, 3, 5, 'protein'),
('Small Fish', 'মলা মাছ', '1 cup', 180, 18, 5, 8, 'protein'),
('Egg White', 'ডিমের সাদা অংশ', '1 large', 17, 3.6, 0.2, 0, 'protein'),
('Masoor Dal (Thin)', 'পাতলা ডাল', '1 cup', 110, 7, 18, 2, 'protein');

-- Recovery & Gut Health
INSERT INTO food_items (name, bangla_name, serving_unit, calories, protein, carbs, fat, category) VALUES 
('Sour Yogurt', 'টক দই', '1 cup', 100, 8, 10, 4, 'dairy'),
('Papaya', 'পেঁপে', '1 cup', 40, 1, 10, 0, 'vegetable'),
('Green Tea', 'গ্রিন টি', '1 cup', 2, 0, 0, 0, 'beverage');

-- ======================================================
-- 2. TRADITIONAL & RICH FOODS (For Logging/Tracking)
-- *Included from seed_v2.sql*
-- ======================================================

-- Rich Lunch/Dinner
INSERT INTO food_items (name, bangla_name, serving_unit, calories, protein, carbs, fat, category) VALUES 
('Kacchi Biryani', 'কাচ্চি বিরিয়ানি', '1 plate', 800, 35, 75, 35, 'protein'),
('Chicken Biryani', 'চিকেন বিরিয়ানি', '1 plate', 650, 30, 70, 25, 'protein'),
('Beef Tehari', 'বিফ তেহারি', '1 plate', 700, 30, 65, 30, 'protein'),
('Polao (Plain)', 'সাদা পোলাও', '1 cup', 350, 5, 50, 12, 'carb'),
('Beef Rezala', 'বিফ রেজালা', '1 cup', 350, 25, 8, 22, 'protein'),
('Khichuri (Rich)', 'ভুনা খিচুড়ি', '1 cup', 450, 12, 50, 15, 'carb');

-- Breakfast Favorites
INSERT INTO food_items (name, bangla_name, serving_unit, calories, protein, carbs, fat, category) VALUES 
('Paratha (Oil)', 'পরোটা', '1 piece', 260, 4, 32, 12, 'carb'),
('Aloo Paratha', 'আলু পরোটা', '1 piece', 310, 5, 45, 12, 'carb'),
('Halwa (Suji)', 'সুজির হালুয়া', '1 scoop', 200, 2, 35, 8, 'snack'),
('Egg Omelet (Oil)', 'ডিম ভাজা', '1 egg', 120, 6, 1, 10, 'protein');

-- Street Food & Snacks
INSERT INTO food_items (name, bangla_name, serving_unit, calories, protein, carbs, fat, category) VALUES 
('Singara', 'সিঙারা', '1 piece', 140, 2, 18, 8, 'snack'),
('Samucha', 'সমুচা', '1 piece', 160, 4, 15, 10, 'snack'),
('Fuchka', 'ফুচকা', '6 pieces', 280, 6, 45, 10, 'snack'),
('Milk Tea (Sugar)', 'দুধ চা', '1 cup', 80, 2, 10, 3, 'beverage');


-- ======================================================
-- 3. EXERCISE LIBRARY (Mixed Difficulty)
-- ======================================================
INSERT INTO exercise_library (name, difficulty, muscle_group, equipment_needed, safety_instruction) VALUES
('Brisk Walking', 'beginner', 'cardio', 'none', 'Maintain steady pace.'),
('Push-ups', 'beginner', 'chest', 'none', 'Keep back straight.'),
('Burpees', 'advanced', 'full_body', 'none', 'Explosive movement.'),
('Squats', 'beginner', 'legs', 'none', 'Keep heels on ground.'),
('Plank', 'intermediate', 'core', 'none', 'Keep body straight.'),
('Surya Namaskar', 'beginner', 'full_body', 'mat', 'Flow with breath.');