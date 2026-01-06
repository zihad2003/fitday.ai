-- db/seed_v2.sql - Expanded Bangladeshi Menu

INSERT INTO food_items (name, bangla_name, serving_unit, calories, protein, carbs, fat, category) VALUES 
-- Breakfast Items
('Paratha (Oil)', 'পরোটা (তেল দিয়ে)', '1 piece', 260, 4, 32, 12, 'carb'),
('Ruti (No Oil)', 'সাদাসিধে রুটি', '1 piece', 100, 3, 20, 1, 'carb'),
('Vegetable Bhaji', 'সবজি ভাজি', '1 cup', 150, 4, 12, 8, 'vegetable'),
('Aloo Paratha', 'আলু পরোটা', '1 piece', 310, 5, 45, 12, 'carb'),
('Khichuri (Plain)', 'পাতলা খিচুড়ি', '1 cup', 250, 8, 40, 6, 'carb'),
('Chira (Flattened Rice)', 'চিড়া', '1 cup', 180, 4, 40, 0.5, 'carb'),
('Muri (Puffed Rice)', 'মুড়ি', '1 cup', 50, 1, 12, 0, 'snack'),

-- Lunch/Dinner Staples
('Steamed Rice', 'সাদা ভাত', '1 plate (200g)', 270, 5, 58, 0.5, 'carb'),
('Brown Rice', 'লাল চালের ভাত', '1 cup', 215, 5, 45, 1.5, 'carb'),
('Polao (Plain)', 'সাদা পোলাও', '1 cup', 350, 5, 50, 12, 'carb'),
('Chicken Biryani', 'চিকেন বিরিয়ানি', '1 plate', 650, 30, 70, 25, 'protein'),
('Kacchi Biryani', 'কাচ্চি বিরিয়ানি', '1 plate', 800, 35, 75, 35, 'protein'),
('Tehari (Beef)', 'বিফ তেহারি', '1 plate', 700, 30, 65, 30, 'protein'),

-- Fish (Bangladeshi Favorites)
('Ilish Fish Curry', 'ইলিশ মাছ ভুনা', '1 piece', 280, 20, 2, 22, 'protein'),
('Rui Fish Curry', 'রুই মাছের ঝোল', '1 piece', 160, 22, 4, 7, 'protein'),
('Shrimp Curry', 'চিংড়ি ভুনা', '100g', 200, 20, 5, 10, 'protein'),
('Small Fish (Mola)', 'মলা মাছ চচ্চড়ি', '1 cup', 180, 18, 5, 9, 'protein'),
('Pangash Fish', 'পাঙ্গাস মাছ', '1 piece', 220, 18, 0, 15, 'protein'),

-- Meat & Poultry
('Beef Curry', 'গরুর মাংস ভুনা', '100g', 260, 26, 0, 17, 'protein'),
('Beef Rezala', 'বিফ রেজালা', '1 cup', 350, 25, 8, 22, 'protein'),
('Chicken Korma', 'চিকেন কোরমা', '1 piece', 250, 20, 10, 15, 'protein'),
('Chicken Fry', 'চিকেন ফ্রাই', '1 piece', 300, 18, 8, 20, 'protein'),

-- Dal & Lentils
('Masoor Dal (Thin)', 'পাতলা মসুর ডাল', '1 cup', 110, 7, 18, 2, 'protein'),
('Masoor Dal (Thick)', 'ঘন মসুর ডাল', '1 cup', 180, 12, 28, 4, 'protein'),
('Moong Dal', 'মুগ ডাল', '1 cup', 150, 9, 25, 3, 'protein'),

-- Vegetables & Bhorta
('Aloo Bhorta', 'আলু ভর্তা', '1 scoop', 120, 2, 22, 4, 'vegetable'),
('Begun Bhorta', 'বেগুন ভর্তা', '1 scoop', 90, 2, 12, 5, 'vegetable'),
('Lau Shak', 'লাউ শাক', '1 cup', 45, 4, 6, 0.5, 'vegetable'),
('Palong Shak', 'পালং শাক', '1 cup', 50, 5, 7, 0.5, 'vegetable'),
('Lau Chingri', 'লাউ চিংড়ি', '1 cup', 130, 10, 12, 5, 'protein'),

-- Snacks & Misc
('Singara', 'সিঙারা', '1 piece', 140, 2, 18, 8, 'snack'),
('Samucha', 'সমুচা', '1 piece', 160, 4, 15, 10, 'snack'),
('Chotpoti', 'চটপটি', '1 bowl', 250, 8, 40, 6, 'snack'),
('Fuchka', 'ফুচকা', '6 pieces', 280, 6, 45, 10, 'snack'),
('Tea (Milk & Sugar)', 'দুধ চা', '1 cup', 80, 2, 10, 3, 'snack'),
('Green Tea', 'গ্রিন টি', '1 cup', 2, 0, 0, 0, 'snack');