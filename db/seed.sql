-- 1. CLEANUP (Optional: Clears old data to prevent duplicates)
DELETE FROM food_items;
DELETE FROM exercise_library;

-- 2. INSERT FOODS (Doctor Recommended & Bangladeshi Staples)
INSERT INTO food_items (name, bangla_name, serving_unit, calories, protein, carbs, fat, category) VALUES 

-- === RICE & CARBS (Bangladeshi Staples) ===
('Plain Rice (Miniket/Nazir)', 'সাদা ভাত', '1 cup (150g)', 205, 4, 44, 0.5, 'carb'),
('Brown Rice (Lal Chal)', 'লাল চালের ভাত', '1 cup (150g)', 215, 5, 45, 1.5, 'carb'),
('Khichuri (Plain)', 'খিচুড়ি', '1 cup', 250, 8, 40, 6, 'carb'),
('Khichuri (Chicken/Beverage)', 'চিকেন খিচুড়ি', '1 cup', 350, 18, 40, 12, 'carb'),
('Polao (Plain)', 'পোলাও', '1 cup', 300, 5, 45, 10, 'carb'),
('Biryani (Chicken)', 'চিকেন বিরিয়ানি', '1 plate (300g)', 550, 25, 60, 20, 'carb'),
('Tehari (Beef)', 'বিফ তেহারি', '1 plate', 600, 28, 55, 25, 'carb'),
('Ruti (Atta)', 'আটার রুটি', '1 piece', 100, 3, 20, 1, 'carb'),
('Paratha (Plain)', 'পরোটা', '1 piece', 250, 4, 30, 12, 'carb'),
('Naan Ruti', 'নান রুটি', '1 piece', 280, 8, 45, 6, 'carb'),
('Luchi', 'লুচি', '1 piece', 150, 2, 18, 8, 'carb'),
('Muri (Puffed Rice)', 'মুড়ি', '1 cup', 50, 1, 12, 0, 'snack'),
('Chira (Flattened Rice)', 'চিড়া', '1 cup', 180, 4, 40, 1, 'carb'),

-- === FISH (Maach) ===
('Ilish Fish Fry', 'ইলিশ মাছ ভাজা', '1 piece', 250, 18, 0, 20, 'protein'),
('Ilish Fish Curry (Sorshe)', 'সর্ষে ইলিশ', '1 piece', 300, 20, 5, 22, 'protein'),
('Rui Fish Curry', 'রুই মাছের ঝোল', '1 piece', 160, 20, 4, 7, 'protein'),
('Katla Fish Curry', 'কাতলা মাছ', '1 piece', 170, 19, 3, 8, 'protein'),
('Pangas Fish Curry', 'পাঙ্গাস মাছ', '1 piece', 220, 16, 2, 16, 'protein'),
('Tangra Fish (Chorchori)', 'ট্যাংরা মাছ', '1 cup', 150, 18, 4, 6, 'protein'),
('Shrimp Curry (Chingri)', 'চিংড়ি মাছ ভুনা', '1 cup', 200, 22, 6, 10, 'protein'),
('Shutki Bhorta (Loitta)', 'লইট্টা শুঁটকি ভর্তা', '1 serving (50g)', 120, 15, 3, 5, 'protein'),
('Tilapia Fish Fry', 'তেলাপিয়া ভাজা', '1 piece', 180, 20, 0, 10, 'protein'),

-- === MEAT (Mangsho) ===
('Chicken Curry (Deshi)', 'দেশি মুরগির ঝোল', '1 cup', 220, 25, 5, 10, 'protein'),
('Chicken Korma', 'চিকেন কোরমা', '1 cup', 350, 22, 12, 22, 'protein'),
('Beef Bhuna', 'গরুর মাংস ভুনা', '1 cup (150g)', 380, 35, 6, 22, 'protein'),
('Beef Rezala', 'বিফ রেজাল', '1 cup', 450, 32, 8, 30, 'protein'),
('Mutton Curry', 'খাসির মাংস', '1 cup', 400, 28, 5, 28, 'protein'),
('Egg Omelette', 'ডিম ভাজা', '1 egg', 120, 7, 1, 10, 'protein'),
('Egg Curry', 'ডিম ভুনা', '1 egg serv', 180, 8, 4, 14, 'protein'),

-- === DAL (Lentils) ===
('Masoor Dal (Thin)', 'পাতলা ডাল', '1 cup', 100, 6, 15, 2, 'protein'),
('Masoor Dal (Thick)', 'ঘন ডাল', '1 cup', 160, 10, 25, 3, 'protein'),
('Mug Dal (Bhuna)', 'মুগ ডাল', '1 cup', 180, 11, 28, 4, 'protein'),
('Cholar Dal', 'ছোলার ডাল', '1 cup', 220, 12, 33, 5, 'protein'),

-- === BHORTA & VEGETABLES ===
('Alu Bhorta', 'আলু ভর্তা', '1 serving', 150, 2, 25, 5, 'vegetable'),
('Begun Bhorta', 'বেগুন ভর্তা', '1 serving', 90, 2, 8, 6, 'vegetable'),
('Shim Bhorta', 'শিম ভর্তা', '1 serving', 80, 4, 10, 3, 'vegetable'),
('Mixed Vegetable Labra', 'লাবড়া সবজি', '1 cup', 120, 4, 15, 5, 'vegetable'),
('Palong Shak (Spinach)', 'পালং শাক', '1 cup', 60, 4, 6, 3, 'vegetable'),
('Lal Shak', 'লাল শাক', '1 cup', 50, 3, 5, 3, 'vegetable'),
('Pui Shak (with Chingri)', 'পুঁশাক চিংড়ি', '1 cup', 120, 8, 8, 6, 'vegetable'),
('Korola Bhaji (Fried Bitter Gourd)', 'করলা ভাজি', '1 cup', 100, 3, 12, 6, 'vegetable'),

-- === SNACKS & STREET FOOD ===
('Singara', 'সিঙারা', '1 piece', 180, 3, 22, 10, 'snack'),
('Samosa', 'সমুচা', '1 piece', 150, 4, 18, 8, 'snack'),
('Fuchka', 'ফুচকা', '6 pieces', 250, 6, 40, 8, 'snack'),
('Chotpoti', 'চটপটি', '1 bowl', 200, 8, 35, 5, 'snack'),
('Jhal Muri', 'ঝাল মুড়ি', '1 cup', 150, 4, 25, 4, 'snack'),
('Muglai Paratha', 'মোগলাই পরোটা', '1 piece', 450, 18, 40, 25, 'snack'),
('Puri (Dal)', 'ডাল পুরি', '1 piece', 150, 3, 20, 7, 'snack'),
('Beguni', 'বেগুনি', '1 piece', 120, 2, 15, 7, 'snack'),
('Peyaju', 'পিঁয়াজু', '1 piece', 80, 3, 8, 5, 'snack'),

-- === SWEETS & DESSERTS (Mishti) ===
('Rosogolla', 'রসগোল্লা', '1 piece', 150, 3, 30, 2, 'sweet'),
('Mishti Doi', 'মিষ্টি দই', '1 cup', 220, 8, 30, 8, 'sweet'),
('Kalojam', 'কালোজাম', '1 piece', 250, 4, 35, 12, 'sweet'),
('Sandesh', 'সন্দেশ', '1 piece', 120, 4, 18, 5, 'sweet'),
('Shemai (Milk)', 'দুধ সেমাই', '1 cup', 300, 6, 40, 12, 'sweet'),
('Payesh/Kheer', 'পায়েস', '1 cup', 350, 8, 50, 10, 'sweet'),

-- === FRUITS (Local) ===
('Mango (Fazli/Langra)', 'আম', '1 medium', 150, 2, 38, 1, 'fruit'),
('Jackfruit (Kathal)', 'কাঁঠাল', '1 cup', 155, 3, 40, 1, 'fruit'),
('Litchi', 'লিচু', '5 pieces', 60, 1, 15, 0, 'fruit'),
('Guava (Peyara)', 'পেয়ারা', '1 medium', 70, 2.5, 14, 0.5, 'fruit'),
('Green Coconut Water', 'ডাবের পানি', '1 glass', 40, 0, 10, 0, 'beverage'),
('Papaya (Ripe)', 'পাকা পেঁপে', '1 cup', 60, 1, 15, 0, 'fruit'),
('Banana (Sagor)', 'কলা', '1 medium', 105, 1, 27, 0, 'fruit'),

-- === BEVERAGES ===
('Borhani', 'বোরহানি', '1 glass', 120, 4, 15, 5, 'beverage'),
('Milk Tea/Cha', 'দুধ চা', '1 cup', 70, 2, 10, 2, 'beverage'),
('Raw Tea (Lal Cha)', 'লাল চা', '1 cup', 10, 0, 2, 0, 'beverage');


-- 3. INSERT EXERCISES (Rehab & Beginner Friendly & GymVisual GIFs)
INSERT INTO exercise_library (name, difficulty, muscle_group, equipment_needed, safety_instruction, gif_url) VALUES
-- Basics
('Push-ups', 'beginner', 'chest', 'none', 'Keep back straight. Modify on knees if needed.', 'https://gymvisual.com/img/p/1/7/5/5/2/17552.gif'),
('Bodyweight Squats', 'beginner', 'legs', 'none', 'Keep chest up, do not let knees cave in.', 'https://gymvisual.com/img/p/2/1/7/4/1/21741.gif'),
('Plank', 'beginner', 'core', 'none', 'Engage core, keep hips level.', 'https://gymvisual.com/img/p/1/0/5/2/6/10526.gif'),

-- Doctor Recommended (Mobility & Low Impact)
('Brisk Walking', 'beginner', 'cardio', 'none', 'Maintain a steady pace where breathing is slightly elevated.', 'https://gymvisual.com/img/p/1/2/3/4/5/12345.gif'), 
('Glute Bridges', 'beginner', 'legs', 'none', 'Great for back pain. Squeeze glutes at the top.', 'https://gymvisual.com/img/p/1/0/6/1/8/10618.gif'),
('Wall Sit', 'beginner', 'legs', 'wall', 'Hold position with knees at 90 degrees. Good for knee stability.', 'https://gymvisual.com/img/p/2/4/5/7/6/24576.gif'),
('Cobra Stretch', 'beginner', 'back', 'none', 'Gently lift chest off floor. Do not force lower back.', 'https://gymvisual.com/img/p/5/4/8/2/5482.gif'),
('High Knees', 'intermediate', 'cardio', 'none', 'Run in place bringing knees to waist height.', 'https://gymvisual.com/img/p/2/1/6/7/0/21670.gif'),
('Lunges', 'intermediate', 'legs', 'none', 'Step forward, keeping torso upright.', 'https://gymvisual.com/img/p/5/7/6/7/5767.gif');