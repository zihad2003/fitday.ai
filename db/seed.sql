-- db/seed.sql

-- Insert Common Bangladeshi Foods
INSERT INTO food_items (name, bangla_name, serving_unit, calories, protein, carbs, fat, category) VALUES 
('Cooked Rice', 'ভাত', '1 cup (150g)', 205, 4.3, 44, 0.4, 'carb'),
('Ruti (Whole Wheat)', 'আটার রুটি', '1 piece', 104, 3.8, 18.5, 1.2, 'carb'),
('Masoor Dal (Thick)', 'মসুর ডাল (ঘন)', '1 cup', 160, 10, 25, 3, 'protein'),
('Chicken Curry', 'মুরগির মাংস', '100g', 180, 19, 6, 9, 'protein'),
('Rui Fish Curry', 'রুই মাছ', '1 piece', 140, 18, 4, 6, 'protein'),
('Egg (Boiled)', 'সেদ্ধ ডিম', '1 large', 72, 6, 0.6, 5, 'protein'),
('Egg Omelet', 'ডিম ভাজা', '1 large', 100, 6.5, 1, 8, 'protein'),
('Vegetable Curry (Mixed)', 'সবজি', '1 cup', 120, 3, 14, 6, 'vegetable'),
('Banana', 'কলা', '1 medium', 105, 1.3, 27, 0.3, 'fruit'),
('Sweet Yogurt (Mishti Doi)', 'মিষ্টি দই', '1 cup', 240, 8, 30, 9, 'dairy');

-- Insert Home-Friendly Exercises
INSERT INTO exercise_library (name, difficulty, muscle_group, equipment_needed, safety_instruction) VALUES
('Push-ups', 'beginner', 'chest', 'none', 'Keep your back straight. Do not let your hips sag.'),
('Bodyweight Squats', 'beginner', 'legs', 'none', 'Keep knees behind toes. Chest up.'),
('Plank', 'beginner', 'core', 'none', 'Engage core, keep body in a straight line. Breathe normally.'),
('Lunges', 'intermediate', 'legs', 'none', 'Step forward, lower hips until both knees are bent at 90 degrees.'),
('Burpees', 'advanced', 'full_body', 'none', 'Land softly to protect joints. Modify if needed.');
