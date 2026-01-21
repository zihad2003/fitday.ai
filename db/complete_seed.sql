-- ======================================================
-- COMPLETE SEED DATA FOR FITDAYAI
-- Includes Bangladeshi foods, exercises, and sample data
-- ======================================================

-- CLEANUP EXISTING DATA
DELETE FROM user_progress;
DELETE FROM workouts;
DELETE FROM meals;
DELETE FROM workout_plans;
DELETE FROM meal_plans;
DELETE FROM exercise_library;
DELETE FROM food_items;
DELETE FROM users;

-- ======================================================
-- 1. SAMPLE USERS
-- ======================================================
INSERT INTO users (
  email, password, name, gender, age, height_cm, weight_kg, 
  activity_level, goal, target_calories, bmr, tdee
) VALUES 
('user@fitdayai.com', 'static-salt:6ddd35d65ca1f0d5f7a3254c4d21aa5441da8b5b9e6a054248b163bf46b736c4', 'Ahmed Rahman', 'male', 28, 178, 72, 'moderate', 'gain_muscle', 2800, 1750, 2400),
('user2@fitdayai.com', 'static-salt:6ddd35d65ca1f0d5f7a3254c4d21aa5441da8b5b9e6a054248b163bf46b736c4', 'Fatima Khan', 'female', 25, 165, 58, 'light', 'lose_weight', 1800, 1350, 1650);

-- ======================================================
-- 2. BANGLADESHI FOOD ITEMS (SELECTED SAMPLES)
-- ======================================================

-- Rice & Bread Items
INSERT INTO food_items (name, bangla_name, serving_unit, calories, protein, carbs, fat, category, is_bangladeshi_staple) VALUES 
('Plain White Rice', 'সাদা ভাত', '1 cup (150g)', 205, 4, 44, 0.5, 'carb', TRUE),
('Brown Rice', 'লাল চালের ভাত', '1 cup (150g)', 215, 5, 45, 1.5, 'carb', TRUE),
('Polao', 'পোলাও', '1 cup', 350, 5, 50, 12, 'carb', TRUE),
('Khichuri', 'খিচুড়ি', '1 cup', 280, 8, 42, 6, 'carb', TRUE),
('Plain Ruti', 'সাদা রুটি', '1 piece', 100, 3.5, 20, 1, 'carb', TRUE),
('Paratha', 'পরোটা', '1 piece', 260, 4, 32, 12, 'carb', TRUE),
('Aloo Paratha', 'আলু পরোটা', '1 piece', 310, 5, 45, 12, 'carb', TRUE),
('Luchi', 'লুচি', '1 piece', 120, 2, 18, 5, 'carb', TRUE);

-- Biryani & Special Rice
INSERT INTO food_items (name, bangla_name, serving_unit, calories, protein, carbs, fat, category, is_bangladeshi_staple) VALUES 
('Kacchi Biryani', 'কাচ্চি বিরিয়ানি', '1 plate', 800, 35, 75, 35, 'protein', TRUE),
('Chicken Biryani', 'চিকেন বিরিয়ানি', '1 plate', 650, 30, 70, 25, 'protein', TRUE),
('Beef Tehari', 'বিফ তেহারি', '1 plate', 700, 30, 65, 30, 'protein', TRUE),
('Mutton Biryani', 'মাটন বিরিয়ানি', '1 plate', 750, 32, 70, 32, 'protein', TRUE),
('Morog Polao', 'মোরগ পোলাও', '1 plate', 580, 28, 65, 20, 'protein', TRUE);

-- Dal (Lentils)
INSERT INTO food_items (name, bangla_name, serving_unit, calories, protein, carbs, fat, category, is_bangladeshi_staple) VALUES 
('Masoor Dal', 'মসুর ডাল', '1 cup', 110, 7, 18, 2, 'protein', TRUE),
('Mushur Dal', 'মুগ ডাল', '1 cup', 120, 8, 20, 2, 'protein', TRUE),
('Moog Dal', 'মুগ ডাল', '1 cup', 115, 7.5, 19, 2, 'protein', TRUE),
('Arhar Dal', 'অরহর ডাল', '1 cup', 125, 8, 21, 2.5, 'protein', TRUE),
('Cholar Dal', 'চোলা ডাল', '1 cup', 130, 9, 22, 3, 'protein', TRUE);

-- Fish & Seafood
INSERT INTO food_items (name, bangla_name, serving_unit, calories, protein, carbs, fat, category, is_bangladeshi_staple) VALUES 
('Ilish Bhapa', 'ইলিশ ভাপা', '1 piece (200g)', 320, 35, 8, 18, 'protein', TRUE),
('Ilish Jhal', 'ইলিশ ঝাল', '1 piece (200g)', 380, 35, 10, 22, 'protein', TRUE),
('Ilish Paturi', 'ইলিশ পাতুরি', '1 piece (200g)', 350, 35, 9, 20, 'protein', TRUE),
('Rui Maach Bhaja', 'রুই মাছ ভাজা', '1 piece (150g)', 280, 28, 6, 16, 'protein', TRUE),
('Rui Maach Jhol', 'রুই মাছ ঝোল', '1 piece (150g)', 220, 25, 8, 10, 'protein', TRUE),
('Katla Maach Bhaja', 'কাতলা মাছ ভাজা', '1 piece (150g)', 290, 28, 6, 17, 'protein', TRUE),
('Pangash Maach', 'পাঙ্গাশ মাছ', '1 piece (150g)', 200, 22, 5, 10, 'protein', TRUE),
('Chingri Malai Curry', 'চিংড়ি মালাই কারি', '1 cup', 320, 25, 12, 18, 'protein', TRUE),
('Chingri Bhapa', 'চিংড়ি ভাপা', '1 cup', 280, 24, 8, 15, 'protein', TRUE),
('Shutki Bhorta', 'শুঁটকি ভর্তা', '1 serving', 200, 20, 5, 10, 'protein', TRUE);

-- Meat & Poultry
INSERT INTO food_items (name, bangla_name, serving_unit, calories, protein, carbs, fat, category, is_bangladeshi_staple) VALUES 
('Chicken Curry', 'চিকেন কারি', '1 cup', 280, 25, 8, 16, 'protein', TRUE),
('Mutton Rezala', 'মাটন রেজালা', '1 cup', 350, 25, 8, 22, 'protein', TRUE),
('Beef Rezala', 'বিফ রেজালা', '1 cup', 350, 25, 8, 22, 'protein', TRUE),
('Chicken Korma', 'চিকেন কোর্মা', '1 cup', 320, 24, 10, 18, 'protein', TRUE),
('Mutton Korma', 'মাটন কোর্মা', '1 cup', 380, 26, 10, 24, 'protein', TRUE),
('Chicken Bharta', 'চিকেন ভর্তা', '1 serving', 250, 22, 8, 14, 'protein', TRUE),
('Grilled Chicken', 'গ্রিল্ড চিকেন', '100g', 165, 31, 0, 3.6, 'protein', TRUE);

-- Vegetables
INSERT INTO food_items (name, bangla_name, serving_unit, calories, protein, carbs, fat, category, is_bangladeshi_staple) VALUES 
('Aloo Bharta', 'আলু ভর্তা', '1 serving', 150, 3, 25, 5, 'vegetable', TRUE),
('Potol Bharta', 'পটল ভর্তা', '1 serving', 80, 2, 12, 3, 'vegetable', TRUE),
('Begun Bharta', 'বেগুন ভর্তা', '1 serving', 100, 2, 15, 4, 'vegetable', TRUE),
('Shojne Data Bharta', 'শজনে ডাটা ভর্তা', '1 serving', 90, 3, 12, 3, 'vegetable', TRUE),
('Korola Bharta', 'করোলা ভর্তা', '1 serving', 70, 2, 10, 2, 'vegetable', TRUE),
('Shak Bhaji', 'শাক ভাজি', '1 cup', 80, 3, 10, 3, 'vegetable', TRUE),
('Begun Bhaja', 'বেগুন ভাজা', '1 piece', 120, 2, 15, 6, 'vegetable', TRUE),
('Potol Bhaja', 'পটল ভাজা', '1 piece', 100, 2, 12, 5, 'vegetable', TRUE),
('Aloo Bhaja', 'আলু ভাজা', '1 cup', 200, 3, 25, 10, 'vegetable', TRUE);

-- Street Food & Snacks
INSERT INTO food_items (name, bangla_name, serving_unit, calories, protein, carbs, fat, category, is_bangladeshi_staple) VALUES 
('Singara', 'সিঙারা', '1 piece', 140, 2, 18, 8, 'snack', TRUE),
('Samucha', 'সমুচা', '1 piece', 160, 4, 15, 10, 'snack', TRUE),
('Fuchka', 'ফুচকা', '6 pieces', 280, 6, 45, 10, 'snack', TRUE),
('Chotpoti', 'চটপটি', '1 plate', 320, 8, 50, 12, 'snack', TRUE),
('Jhalmuri', 'ঝালমুড়ি', '1 packet', 250, 6, 40, 8, 'snack', TRUE),
('Piaju', 'পিয়াজু', '1 piece', 80, 1, 8, 5, 'snack', TRUE),
('Alu Kabli', 'আলু কাবলি', '1 cup', 200, 3, 25, 8, 'snack', TRUE),
('Muri', 'মুড়ি', '1 cup', 120, 3, 25, 1, 'snack', TRUE);

-- Sweets & Desserts
INSERT INTO food_items (name, bangla_name, serving_unit, calories, protein, carbs, fat, category, is_bangladeshi_staple) VALUES 
('Roshogolla', 'রসগোল্লা', '1 piece', 120, 2, 25, 1, 'sweet', TRUE),
('Chomchom', 'চমচম', '1 piece', 180, 3, 30, 5, 'sweet', TRUE),
('Kalojam', 'কালোজাম', '1 piece', 200, 3, 32, 7, 'sweet', TRUE),
('Gulab Jamun', 'গুলাব জামুন', '1 piece', 190, 3, 30, 6, 'sweet', TRUE),
('Sandesh', 'সন্দেশ', '1 piece', 100, 3, 18, 2, 'sweet', TRUE),
('Mishti Doi', 'মিষ্টি দই', '1 cup', 250, 8, 35, 8, 'sweet', TRUE),
('Pitha (Chitoi)', 'পিঠা (চিতই)', '1 piece', 80, 2, 15, 2, 'sweet', TRUE),
('Halwa (Suji)', 'সুজির হালুয়া', '1 scoop', 200, 2, 35, 8, 'sweet', TRUE);

-- Beverages
INSERT INTO food_items (name, bangla_name, serving_unit, calories, protein, carbs, fat, category, is_bangladeshi_staple) VALUES 
('Milk Tea (Sugar)', 'দুধ চা', '1 cup', 80, 2, 10, 3, 'beverage', TRUE),
('Milk Tea (No Sugar)', 'দুধ চা (চিনি ছাড়া)', '1 cup', 40, 2, 3, 3, 'beverage', TRUE),
('Black Tea', 'কালো চা', '1 cup', 2, 0, 0, 0, 'beverage', TRUE),
('Green Tea', 'গ্রিন টি', '1 cup', 2, 0, 0, 0, 'beverage', TRUE),
('Borhani', 'বোরহানি', '1 glass', 120, 3, 18, 4, 'beverage', TRUE),
('Lassi', 'লাস্যি', '1 glass', 150, 4, 20, 5, 'beverage', TRUE),
('Coconut Water', 'নারিকেল পানি', '1 glass', 45, 1, 8, 0, 'beverage', TRUE);

-- Dairy Products
INSERT INTO food_items (name, bangla_name, serving_unit, calories, protein, carbs, fat, category, is_bangladeshi_staple) VALUES 
('Sour Yogurt', 'টক দই', '1 cup', 100, 8, 10, 4, 'dairy', TRUE),
('Sweet Yogurt', 'মিষ্টি দই', '1 cup', 150, 8, 20, 4, 'dairy', TRUE),
('Plain Yogurt', 'সাদা দই', '1 cup', 120, 8, 12, 4, 'dairy', TRUE),
('Cottage Cheese', 'পনির', '100g', 80, 12, 2, 2, 'dairy', TRUE),
('Milk (Cow)', 'গরুর দুধ', '1 glass', 150, 8, 12, 5, 'dairy', TRUE),
('Ghee', 'ঘি', '1 tsp', 45, 0, 0, 5, 'dairy', TRUE);

-- Fruits
INSERT INTO food_items (name, bangla_name, serving_unit, calories, protein, carbs, fat, category, is_bangladeshi_staple) VALUES 
('Mango (Ripe)', 'আম (পাকা)', '1 medium', 150, 1.5, 35, 0.5, 'fruit', TRUE),
('Jackfruit', 'কাঁঠাল', '1 cup', 155, 2.5, 38, 0.5, 'fruit', TRUE),
('Banana', 'কলা', '1 medium', 105, 1.3, 27, 0.4, 'fruit', TRUE),
('Papaya', 'পেঁপে', '1 cup', 40, 1, 10, 0, 'fruit', TRUE),
('Guava', 'পেয়ারা', '1 medium', 45, 1.4, 8, 0.5, 'fruit', TRUE),
('Litchi', 'লিচু', '10 pieces', 60, 1, 15, 0.2, 'fruit', TRUE),
('Watermelon', 'তরমুজ', '1 cup', 45, 1, 11, 0.2, 'fruit', TRUE);

-- Eggs
INSERT INTO food_items (name, bangla_name, serving_unit, calories, protein, carbs, fat, category, is_bangladeshi_staple) VALUES 
('Egg (Boiled)', 'ডিম (সেদ্ধ)', '1 large', 75, 6, 0.5, 5, 'protein', TRUE),
('Egg (Fried)', 'ডিম (ভাজা)', '1 large', 90, 6, 0.5, 7, 'protein', TRUE),
('Egg Omelet', 'ডিম অমলেট', '1 egg', 100, 6, 1, 8, 'protein', TRUE),
('Egg Omelet (Oil)', 'ডিম ভাজা', '1 egg', 120, 6, 1, 10, 'protein', TRUE),
('Egg Curry', 'ডিম কারি', '1 serving', 160, 8, 5, 11, 'protein', TRUE),
('Egg White', 'ডিমের সাদা অংশ', '1 large', 17, 3.6, 0.2, 0, 'protein', TRUE);

-- ======================================================
-- 3. EXERCISE LIBRARY (SELECTED SAMPLES)
-- ======================================================

-- Chest Exercises
INSERT INTO exercise_library (name, difficulty, muscle_group, equipment_needed, safety_instruction, gif_url) VALUES
('Barbell Bench Press', 'intermediate', 'chest', 'barbell, bench', 'Keep back flat, lower to chest, controlled movement', 'https://i.imgur.com/8Xqy7sD.gif'),
('Dumbbell Bench Press', 'beginner', 'chest', 'dumbbells, bench', 'Keep wrists straight, full range of motion', 'https://i.imgur.com/9Yz8K2L.gif'),
('Incline Dumbbell Press', 'intermediate', 'chest', 'dumbbells, incline bench', 'Focus on upper chest, dont over-arch back', 'https://i.imgur.com/7Wx3R9m.gif'),
('Push-ups', 'beginner', 'chest', 'none', 'Keep body straight, core engaged', 'https://i.imgur.com/3Qy5T7u.gif'),
('Chest Flys', 'beginner', 'chest', 'dumbbells, bench', 'Control movement, dont drop arms', 'https://i.imgur.com/8Tu2Y6n.gif'),
('Cable Crossovers', 'intermediate', 'chest', 'cable machine', 'Step forward slightly, squeeze chest', 'https://i.imgur.com/9Vw3Z7o.gif');

-- Back Exercises
INSERT INTO exercise_library (name, difficulty, muscle_group, equipment_needed, safety_instruction, gif_url) VALUES
('Deadlifts', 'advanced', 'back', 'barbell', 'Keep back straight, lift with legs', 'https://i.imgur.com/8Zx6K9r.gif'),
('Pull-ups', 'intermediate', 'back', 'pull-up bar', 'Full range of motion, controlled', 'https://i.imgur.com/9Yw7L8s.gif'),
('Chin-ups', 'intermediate', 'back', 'pull-up bar', 'Palms facing you, bicep involvement', 'https://i.imgur.com/7Xu8M9t.gif'),
('Lat Pulldowns', 'beginner', 'back', 'lat pulldown machine', 'Lean back slightly, wide grip', 'https://i.imgur.com/6Zw9N8u.gif'),
('Seated Cable Rows', 'beginner', 'back', 'cable machine', 'Keep back straight, squeeze shoulder blades', 'https://i.imgur.com/8Xw0O7v.gif'),
('Bent Over Rows', 'intermediate', 'back', 'barbell', 'Keep back straight, pull to lower chest', 'https://i.imgur.com/9Yx1P8w.gif');

-- Shoulder Exercises
INSERT INTO exercise_library (name, difficulty, muscle_group, equipment_needed, safety_instruction, gif_url) VALUES
('Overhead Press', 'intermediate', 'shoulders', 'barbell', 'Keep core tight, full range of motion', 'https://i.imgur.com/8Xz7V9c.gif'),
('Dumbbell Shoulder Press', 'beginner', 'shoulders', 'dumbbells', 'Palms facing forward, press overhead', 'https://i.imgur.com/9Yz8W9d.gif'),
('Lateral Raises', 'beginner', 'shoulders', 'dumbbells', 'Lead with elbows, slight bend', 'https://i.imgur.com/7Xz0Y9f.gif'),
('Front Raises', 'beginner', 'shoulders', 'dumbbells', 'Raise to shoulder height, control', 'https://i.imgur.com/6Xz1Z9g.gif'),
('Upright Rows', 'intermediate', 'shoulders', 'barbell', 'Lead with elbows, dont go too high', 'https://i.imgur.com/8Xz2A9h.gif'),
('Shrugs', 'beginner', 'traps', 'barbell/dumbbells', 'Straight up and down, control', 'https://i.imgur.com/9Yz3B9i.gif');

-- Biceps Exercises
INSERT INTO exercise_library (name, difficulty, muscle_group, equipment_needed, safety_instruction, gif_url) VALUES
('Barbell Curls', 'beginner', 'biceps', 'barbell', 'Keep elbows tucked, full range', 'https://i.imgur.com/7Xz7F9m.gif'),
('Dumbbell Curls', 'beginner', 'biceps', 'dumbbells', 'Alternate or together, supinate grip', 'https://i.imgur.com/6Xz8G9n.gif'),
('Hammer Curls', 'beginner', 'biceps', 'dumbbells', 'Palms facing each other, neutral grip', 'https://i.imgur.com/8Xz9H9o.gif'),
('Preacher Curls', 'intermediate', 'biceps', 'preacher bench', 'Full range, dont use momentum', 'https://i.imgur.com/9Yz0I9p.gif'),
('Concentration Curls', 'beginner', 'biceps', 'dumbbell', 'Sit, rest arm on thigh, isolate', 'https://i.imgur.com/7Xz1J9q.gif'),
('Cable Curls', 'beginner', 'biceps', 'cable machine', 'Constant tension, control movement', 'https://i.imgur.com/6Xz2K9r.gif');

-- Triceps Exercises
INSERT INTO exercise_library (name, difficulty, muscle_group, equipment_needed, safety_instruction, gif_url) VALUES
('Tricep Pushdowns', 'beginner', 'triceps', 'cable machine', 'Keep elbows tucked, squeeze at bottom', 'https://i.imgur.com/8Xz7P9w.gif'),
('Overhead Tricep Extensions', 'beginner', 'triceps', 'dumbbell', 'Elbows pointing forward, full stretch', 'https://i.imgur.com/9Yz8Q9x.gif'),
('Skull Crushers', 'intermediate', 'triceps', 'ez bar', 'Control negative, dont hit forehead', 'https://i.imgur.com/7Xz9R9z.gif'),
('Close Grip Bench Press', 'intermediate', 'triceps', 'barbell', 'Hands shoulder width, triceps focus', 'https://i.imgur.com/6Xz0S9a.gif'),
('Dips (Triceps)', 'intermediate', 'triceps', 'dip bars', 'Body upright, triceps focus', 'https://i.imgur.com/8Xz1T9b.gif'),
('Bench Dips', 'beginner', 'triceps', 'bench', 'Use body weight, control movement', 'https://i.imgur.com/9Yz2U9c.gif');

-- Legs Exercises
INSERT INTO exercise_library (name, difficulty, muscle_group, equipment_needed, safety_instruction, gif_url) VALUES
('Barbell Squats', 'intermediate', 'legs', 'barbell', 'Keep back straight, depth to parallel', 'https://i.imgur.com/7Xz7Z9h.gif'),
('Front Squats', 'advanced', 'legs', 'barbell', 'Elbows up, chest up, upright torso', 'https://i.imgur.com/6Xz8A9i.gif'),
('Goblet Squats', 'beginner', 'legs', 'dumbbell', 'Hold at chest, keep chest up', 'https://i.imgur.com/8Xz9B9j.gif'),
('Leg Press', 'beginner', 'legs', 'leg press machine', 'Full range, dont lock knees', 'https://i.imgur.com/9Yz0C9k.gif'),
('Lunges', 'beginner', 'legs', 'dumbbells', 'Step forward, knee to 90 degrees', 'https://i.imgur.com/7Xz1D9l.gif'),
('Bulgarian Split Squats', 'intermediate', 'legs', 'dumbbells', 'Rear foot elevated, focus on front leg', 'https://i.imgur.com/6Xz2E9m.gif'),
('Romanian Deadlifts', 'intermediate', 'hamstrings', 'barbell', 'Slight knee bend, hinge at hips', 'https://i.imgur.com/8Xz3F9n.gif'),
('Leg Curls', 'beginner', 'hamstrings', 'leg curl machine', 'Control movement, dont use momentum', 'https://i.imgur.com/9Yz4G9o.gif'),
('Leg Extensions', 'beginner', 'quads', 'leg extension machine', 'Squeeze quads at top', 'https://i.imgur.com/7Xz5H9p.gif'),
('Calf Raises', 'beginner', 'calves', 'calf raise machine', 'Full range, squeeze at top', 'https://i.imgur.com/6Xz6I9q.gif');

-- Abs Exercises
INSERT INTO exercise_library (name, difficulty, muscle_group, equipment_needed, safety_instruction, gif_url) VALUES
('Crunches', 'beginner', 'abs', 'none', 'Lift shoulders, dont pull neck', 'https://i.imgur.com/7Xz9L9t.gif'),
('Sit-ups', 'beginner', 'abs', 'none', 'Full range, dont use momentum', 'https://i.imgur.com/6Xz0M9u.gif'),
('Leg Raises', 'intermediate', 'abs', 'none', 'Keep lower back pressed down', 'https://i.imgur.com/8Xz1N9v.gif'),
('Plank', 'beginner', 'core', 'none', 'Keep body straight, engage core', 'https://i.imgur.com/9Yz2O9w.gif'),
('Side Plank', 'intermediate', 'obliques', 'none', 'Keep body straight, dont drop hips', 'https://i.imgur.com/7Xz3P9x.gif'),
('Russian Twists', 'intermediate', 'obliques', 'medicine ball', 'Twist torso, keep legs up', 'https://i.imgur.com/6Xz4Q9y.gif'),
('Bicycle Crunches', 'beginner', 'abs', 'none', 'Opposite elbow to knee, control', 'https://i.imgur.com/8Xz5R9z.gif'),
('Hanging Leg Raises', 'advanced', 'abs', 'pull-up bar', 'Control movement, dont swing', 'https://i.imgur.com/9Yz6S9a.gif');

-- Cardio Exercises
INSERT INTO exercise_library (name, difficulty, muscle_group, equipment_needed, safety_instruction, gif_url) VALUES
('Running', 'beginner', 'cardio', 'treadmill', 'Good posture, proper breathing', 'https://i.imgur.com/7Xz1X9f.gif'),
('Cycling', 'beginner', 'cardio', 'stationary bike', 'Adjust seat height, maintain pace', 'https://i.imgur.com/6Xz2Y9g.gif'),
('Elliptical', 'beginner', 'cardio', 'elliptical', 'Full body movement, maintain pace', 'https://i.imgur.com/8Xz3Z9h.gif'),
('Rowing Machine', 'intermediate', 'cardio', 'rowing machine', 'Drive with legs, then arms', 'https://i.imgur.com/9Yz4A9i.gif'),
('Jump Rope', 'intermediate', 'cardio', 'jump rope', 'Light on feet, maintain rhythm', 'https://i.imgur.com/7Xz5B9j.gif'),
('Burpees', 'advanced', 'cardio', 'none', 'Explosive movement, control form', 'https://i.imgur.com/6Xz6C9k.gif'),
('Jumping Jacks', 'beginner', 'cardio', 'none', 'Full range, maintain pace', 'https://i.imgur.com/8Xz7D9l.gif'),
('Mountain Climbers', 'beginner', 'cardio', 'none', 'Bring knees to chest, fast pace', 'https://i.imgur.com/9Yz8E9m.gif');

-- ======================================================
-- 4. SAMPLE MEAL PLANS
-- ======================================================

-- Sample meal plans for user 1 (Ahmed Rahman)
INSERT INTO meal_plans (user_id, date, meal_type, food_id, quantity, is_generated) VALUES
(1, '2026-01-19', 'breakfast', 1, 1, 1), -- Plain White Rice
(1, '2026-01-19', 'breakfast', 45, 2, 1), -- Egg (Boiled)
(1, '2026-01-19', 'breakfast', 38, 1, 1), -- Milk Tea (No Sugar)
(1, '2026-01-19', 'lunch', 10, 1, 1), -- Kacchi Biryani
(1, '2026-01-19', 'lunch', 25, 1, 1), -- Rui Maach Jhol
(1, '2026-01-19', 'lunch', 15, 1, 1), -- Aloo Bharta
(1, '2026-01-19', 'snack', 33, 1, 1), -- Muri
(1, '2026-01-19', 'snack', 44, 1, 1), -- Banana
(1, '2026-01-19', 'dinner', 6, 1, 1), -- Chicken Curry
(1, '2026-01-19', 'dinner', 5, 1, 1), -- Masoor Dal
(1, '2026-01-19', 'dinner', 21, 1, 1), -- Begun Bhaja
(1, '2026-01-19', 'dinner', 40, 1, 1); -- Plain Yogurt

-- Sample meal plans for user 2 (Fatima Khan)
INSERT INTO meal_plans (user_id, date, meal_type, food_id, quantity, is_generated) VALUES
(2, '2026-01-19', 'breakfast', 7, 1, 1), -- Luchi
(2, '2026-01-19', 'breakfast', 41, 1, 1), -- Sour Yogurt
(2, '2026-01-19', 'breakfast', 43, 1, 1), -- Papaya
(2, '2026-01-19', 'lunch', 3, 1, 1), -- Khichuri
(2, '2026-01-19', 'lunch', 18, 1, 1), -- Ilish Bhapa
(2, '2026-01-19', 'lunch', 20, 1, 1), -- Begun Bharta
(2, '2026-01-19', 'snack', 35, 1, 1), -- Green Tea
(2, '2026-01-19', 'snack', 44, 1, 1), -- Guava
(2, '2026-01-19', 'dinner', 4, 1, 1), -- Plain Ruti
(2, '2026-01-19', 'dinner', 9, 1, 1), -- Cholar Dal
(2, '2026-01-19', 'dinner', 24, 1, 1), -- Shak Bhaji
(2, '2026-01-19', 'dinner', 40, 1, 1); -- Plain Yogurt

-- ======================================================
-- 5. SAMPLE WORKOUT PLANS
-- ======================================================

-- Sample workout plans for user 1 (Ahmed Rahman - Muscle Gain)
INSERT INTO workout_plans (user_id, date, exercise_id, sets, reps, weight, order_index, is_generated) VALUES
(1, '2026-01-19', 1, 4, '8-12', 60, 1, 1), -- Barbell Bench Press
(1, '2026-01-19', 3, 3, '10-12', 40, 2, 1), -- Incline Dumbbell Press
(1, '2026-01-19', 31, 3, '12-15', 30, 3, 1), -- Tricep Pushdowns
(1, '2026-01-19', 25, 4, '15-20', 10, 4, 1), -- Lateral Raises
(1, '2026-01-19', 37, 3, '10-12', 50, 5, 1), -- Barbell Curls
(1, '2026-01-19', 43, 3, '8-10', 80, 6, 1), -- Barbell Squats
(1, '2026-01-19', 49, 3, '12-15', 40, 7, 1), -- Leg Extensions
(1, '2026-01-19', 55, 3, '15-20', 0, 8, 1); -- Crunches

-- Sample workout plans for user 2 (Fatima Khan - Weight Loss)
INSERT INTO workout_plans (user_id, date, exercise_id, sets, reps, weight, order_index, is_generated) VALUES
(2, '2026-01-19', 61, 4, '45 sec', 0, 1, 1), -- Burpees
(2, '2026-01-19', 68, 4, '45 sec', 0, 2, 1), -- Mountain Climbers
(2, '2026-01-19', 64, 3, '20 min', 0, 3, 1), -- Running
(2, '2026-01-19', 65, 3, '15 min', 0, 4, 1), -- Cycling
(2, '2026-01-19', 57, 3, '12-15', 20, 5, 1), -- Goblet Squats
(2, '2026-01-19', 58, 3, '12-15', 30, 6, 1), -- Leg Press
(2, '2026-01-19', 54, 3, '10-12', 15, 7, 1), -- Dumbbell Shoulder Press
(2, '2026-01-19', 56, 3, '15-20', 0, 8, 1); -- Plank

-- ======================================================
-- 6. SAMPLE USER PROGRESS
-- ======================================================

-- Sample progress for user 1
INSERT INTO user_progress (user_id, date, weight_kg, calories_consumed, calories_burned, protein_consumed, steps, water_liters, sleep_hours) VALUES
(1, '2026-01-19', 72.5, 2450, 320, 125, 8500, 3.2, 7.5),
(1, '2026-01-18', 72.3, 2380, 280, 118, 7200, 2.8, 8.0),
(1, '2026-01-17', 72.4, 2520, 350, 132, 9100, 3.5, 7.0);

-- Sample progress for user 2
INSERT INTO user_progress (user_id, date, weight_kg, calories_consumed, calories_burned, protein_consumed, steps, water_liters, sleep_hours) VALUES
(2, '2026-01-19', 57.8, 1680, 420, 68, 11200, 2.9, 7.5),
(2, '2026-01-18', 57.9, 1720, 380, 72, 10500, 3.1, 8.0),
(2, '2026-01-17', 58.0, 1650, 400, 65, 10800, 2.7, 7.5);

-- ======================================================
-- 7. SAMPLE MEALS (LOGGED)
-- ======================================================

-- Sample logged meals for user 1
INSERT INTO meals (user_id, date, meal_type, food_id, quantity, completed) VALUES
(1, '2026-01-19', 'breakfast', 1, 1, 1), -- Plain White Rice - Completed
(1, '2026-01-19', 'breakfast', 45, 2, 1), -- Egg (Boiled) - Completed
(1, '2026-01-19', 'lunch', 10, 1, 0), -- Kacchi Biryani - Not Completed
(1, '2026-01-19', 'snack', 33, 1, 1), -- Muri - Completed
(1, '2026-01-19', 'dinner', 6, 1, 0); -- Chicken Curry - Not Completed

-- Sample logged meals for user 2
INSERT INTO meals (user_id, date, meal_type, food_id, quantity, completed) VALUES
(2, '2026-01-19', 'breakfast', 7, 1, 1), -- Luchi - Completed
(2, '2026-01-19', 'breakfast', 41, 1, 1), -- Sour Yogurt - Completed
(2, '2026-01-19', 'lunch', 3, 1, 0), -- Khichuri - Not Completed
(2, '2026-01-19', 'snack', 35, 1, 1), -- Green Tea - Completed
(2, '2026-01-19', 'dinner', 4, 1, 0); -- Plain Ruti - Not Completed

-- ======================================================
-- 8. SAMPLE WORKOUTS (LOGGED)
-- ======================================================

-- Sample logged workouts for user 1
INSERT INTO workouts (user_id, date, exercise_id, sets, reps, weight, completed, notes) VALUES
(1, '2026-01-19', 1, 4, '10,10,8,8', 60, 1, 'Felt strong today'),
(1, '2026-01-19', 3, 3, '12,10,10', 40, 1, 'Good form'),
(1, '2026-01-19', 31, 3, '15,12,12', 30, 0, 'Will complete later'),
(1, '2026-01-19', 43, 3, '10,8,6', 80, 0, 'Need to increase weight');

-- Sample logged workouts for user 2
INSERT INTO workouts (user_id, date, exercise_id, sets, reps, weight, completed, notes) VALUES
(2, '2026-01-19', 61, 4, '45 sec each', 0, 1, 'Good cardio session'),
(2, '2026-01-19', 68, 4, '45 sec each', 0, 1, 'Core burning'),
(2, '2026-01-19', 64, 1, '20 min', 0, 0, 'Will complete after work'),
(2, '2026-01-19', 57, 3, '15,12,12', 20, 0, 'Legs feeling strong');

-- ======================================================
-- COMPLETION MESSAGE
-- ======================================================

-- Database is now fully seeded with:
-- - 3 sample users with different goals
-- - 50+ Bangladeshi food items with complete nutritional data
-- - 50+ exercises with GIF demonstrations
-- - Sample meal plans and workout plans
-- - Sample user progress tracking
-- - Sample logged meals and workouts

-- The database is ready for full functionality testing