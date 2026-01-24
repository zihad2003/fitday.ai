export interface FoodItem {
    name: string;
    bnName: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    serving: string;
    category: 'Rice' | 'Protein' | 'Snacks' | 'Vegetables' | 'Dessert' | 'Street Food';
}

export const bangladeshiFoods: FoodItem[] = [
    // Rice & Grains
    { name: 'Plain Rice (Sada Bhat)', bnName: 'সাদা ভাত', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, serving: '100g', category: 'Rice' },
    { name: 'Kacchi Biryani', bnName: 'কাচ্চি বিরিয়ানি', calories: 450, protein: 25, carbs: 45, fat: 18, serving: '1 plate', category: 'Rice' },
    { name: 'Chicken Biryani', bnName: 'চিকেন বিরিয়ানি', calories: 400, protein: 22, carbs: 42, fat: 15, serving: '1 plate', category: 'Rice' },
    { name: 'Tehari (Beef)', bnName: 'গরুর তেহারি', calories: 420, protein: 20, carbs: 40, fat: 20, serving: '1 plate', category: 'Rice' },
    { name: 'Khichuri (Bhuna)', bnName: 'ভুনা খিচুড়ি', calories: 350, protein: 12, carbs: 45, fat: 12, serving: '1 plate', category: 'Rice' },
    { name: 'Panta Bhat', bnName: 'পান্তা ভাত', calories: 120, protein: 2.5, carbs: 26, fat: 0.2, serving: '100g', category: 'Rice' },
    { name: 'Polao', bnName: 'পোলাও', calories: 180, protein: 3, carbs: 32, fat: 5, serving: '100g', category: 'Rice' },

    // Protein (Fish & Meat)
    { name: 'Rui Fish Curry', bnName: 'রুই মাছের ঝোল', calories: 180, protein: 20, carbs: 2, fat: 10, serving: '1 piece', category: 'Protein' },
    { name: 'Ilish Bhaapa', bnName: 'সরিষা ইলিশ', calories: 280, protein: 22, carbs: 1, fat: 20, serving: '1 piece', category: 'Protein' },
    { name: 'Beef Bhuna', bnName: 'গরু ভুনা', calories: 320, protein: 28, carbs: 3, fat: 22, serving: '100g', category: 'Protein' },
    { name: 'Chicken Curry', bnName: 'মুরগির ঝোল', calories: 220, protein: 25, carbs: 4, fat: 12, serving: '100g', category: 'Protein' },
    { name: 'Mutton Curry', bnName: 'খাসির মাংস', calories: 350, protein: 24, carbs: 3, fat: 26, serving: '100g', category: 'Protein' },
    { name: 'Prawn Malaikari', bnName: 'চিংড়ি মালাইকারি', calories: 250, protein: 18, carbs: 5, fat: 18, serving: '2 pieces', category: 'Protein' },
    { name: 'Telapia Fry', bnName: 'তেলাপিয়া মাছ ভাজা', calories: 150, protein: 18, carbs: 0, fat: 8, serving: '1 piece', category: 'Protein' },
    { name: 'Boal Fish Curry', bnName: 'বোয়াল মাছ', calories: 190, protein: 19, carbs: 2, fat: 11, serving: '1 piece', category: 'Protein' },
    { name: 'Egg Bhuna', bnName: 'ডিম ভুনা', calories: 140, protein: 12, carbs: 2, fat: 9, serving: '2 eggs', category: 'Protein' },
    { name: 'Duck Currey', bnName: 'হাঁসের মাংস', calories: 330, protein: 20, carbs: 2, fat: 28, serving: '100g', category: 'Protein' },

    // Snacks & Street Food
    { name: 'Singara', bnName: 'সিংাড়া', calories: 120, protein: 2, carbs: 15, fat: 6, serving: '1 piece', category: 'Snacks' },
    { name: 'Samosa', bnName: 'সমুচা', calories: 100, protein: 2, carbs: 12, fat: 5, serving: '1 piece', category: 'Snacks' },
    { name: 'Fuchka', bnName: 'ফুচকা', calories: 250, protein: 5, carbs: 35, fat: 10, serving: '1 plate (6 pcs)', category: 'Street Food' },
    { name: 'Chotpoti', bnName: 'চটপটি', calories: 220, protein: 8, carbs: 30, fat: 6, serving: '1 plate', category: 'Street Food' },
    { name: 'Beguni', bnName: 'বেগুনি', calories: 80, protein: 1, carbs: 8, fat: 5, serving: '1 piece', category: 'Snacks' },
    { name: 'Peyaju', bnName: 'পিয়াজু', calories: 70, protein: 2, carbs: 6, fat: 4, serving: '1 piece', category: 'Snacks' },
    { name: 'Mughlai Paratha', bnName: 'মোগলাই পরোটা', calories: 450, protein: 15, carbs: 40, fat: 25, serving: '1 piece', category: 'Snacks' },
    { name: 'Jhal Muri', bnName: 'ঝাল মুড়ি', calories: 150, protein: 3, carbs: 25, fat: 5, serving: '1 cup', category: 'Street Food' },
    { name: 'Alu Chop', bnName: 'আলু চপ', calories: 110, protein: 2, carbs: 14, fat: 6, serving: '1 piece', category: 'Snacks' },

    // Vegetables & Bhorta
    { name: 'Alu Bhorta', bnName: 'আলু ভর্তা', calories: 90, protein: 2, carbs: 18, fat: 2, serving: '100g', category: 'Vegetables' },
    { name: 'Begun Bhorta', bnName: 'বেগুন ভর্তা', calories: 70, protein: 2, carbs: 8, fat: 4, serving: '100g', category: 'Vegetables' },
    { name: 'Dal (Masoor)', bnName: 'ডাল', calories: 110, protein: 8, carbs: 18, fat: 1, serving: '1 cup', category: 'Vegetables' },
    { name: 'Mix Vegetable Bhaji', bnName: 'সবজি ভাজি', calories: 80, protein: 2, carbs: 10, fat: 4, serving: '100g', category: 'Vegetables' },
    { name: 'Lau Ghonto', bnName: 'লাউ ঘন্ট', calories: 60, protein: 1, carbs: 8, fat: 3, serving: '100g', category: 'Vegetables' },
    { name: 'Korola Bhaji', bnName: 'করোলা ভাজি', calories: 75, protein: 2, carbs: 9, fat: 4, serving: '100g', category: 'Vegetables' },

    // Desserts
    { name: 'Rasgulla', bnName: 'রসগোল্লা', calories: 180, protein: 4, carbs: 38, fat: 2, serving: '2 pieces', category: 'Dessert' },
    { name: 'Gulab Jamun', bnName: 'কালোজাম', calories: 250, protein: 3, carbs: 45, fat: 8, serving: '2 pieces', category: 'Dessert' },
    { name: 'Mishti Doi', bnName: 'মিষ্টি দই', calories: 150, protein: 5, carbs: 20, fat: 6, serving: '100g', category: 'Dessert' },
    { name: 'Payesh', bnName: 'পায়েস', calories: 200, protein: 6, carbs: 35, fat: 5, serving: '1 cup', category: 'Dessert' },
    { name: 'Semai', bnName: 'সেমাই', calories: 220, protein: 5, carbs: 40, fat: 7, serving: '1 cup', category: 'Dessert' },

    // More Additions to reach 100+ (Adding more fish, snacks, etc.)
    { name: 'Pangash Fish Curry', bnName: 'পাঙ্গাশ মাছ', calories: 220, protein: 17, carbs: 1, fat: 16, serving: '1 piece', category: 'Protein' },
    { name: 'Kachki Fish Bhuna', bnName: 'কাচকি মাছ', calories: 110, protein: 18, carbs: 0, fat: 4, serving: '50g', category: 'Protein' },
    { name: 'Hilsha Fried', bnName: 'ইলিশ ভাজা', calories: 310, protein: 20, carbs: 0, fat: 25, serving: '1 piece', category: 'Protein' },
    { name: 'Loitta Fish Fry', bnName: 'লইট্টা ফ্রাই', calories: 180, protein: 15, carbs: 5, fat: 12, serving: '2 pieces', category: 'Protein' },
    { name: 'Beef Kabab', bnName: 'শিক কাবাব', calories: 220, protein: 25, carbs: 2, fat: 12, serving: '1 skewer', category: 'Protein' },
    { name: 'Chicken Roast', bnName: 'চিকেন রোস্ট', calories: 350, protein: 30, carbs: 5, fat: 22, serving: '1 piece', category: 'Protein' },
    { name: 'Bhuna Khichuri With Beef', bnName: 'ভুনা খিচুড়ি ও গরুর মাংস', calories: 550, protein: 35, carbs: 50, fat: 25, serving: '1 plate', category: 'Rice' },
    { name: 'Ghee Rice', bnName: 'ঘি ভাত', calories: 210, protein: 3, carbs: 32, fat: 8, serving: '100g', category: 'Rice' },
    { name: 'Ruti (Handmade)', bnName: 'হাতে বানানো রুটি', calories: 120, protein: 4, carbs: 25, fat: 1, serving: '1 piece', category: 'Rice' },
    { name: 'Paratha', bnName: 'পরোটা', calories: 250, protein: 4, carbs: 35, fat: 12, serving: '1 piece', category: 'Rice' },
    { name: 'Nan Ruti', bnName: 'নান রুটি', calories: 280, protein: 8, carbs: 45, fat: 6, serving: '1 piece', category: 'Rice' },
    { name: 'Beef Nehari', bnName: 'নেহারি', calories: 380, protein: 35, carbs: 5, fat: 25, serving: '1 bowl', category: 'Protein' },
    { name: 'Paya', bnName: 'পায়া', calories: 350, protein: 30, carbs: 4, fat: 24, serving: '1 bowl', category: 'Protein' },
    { name: 'Shutki Bhuna (Loitta)', bnName: 'লইট্টা শুটকি', calories: 250, protein: 45, carbs: 2, fat: 8, serving: '50g', category: 'Protein' },
    { name: 'Moong Dal', bnName: 'মুগ ডাল', calories: 130, protein: 9, carbs: 20, fat: 2, serving: '1 cup', category: 'Vegetables' },
    { name: 'Chana Dal', bnName: 'ছোলার ডাল', calories: 150, protein: 10, carbs: 25, fat: 3, serving: '1 cup', category: 'Vegetables' },
    { name: 'Pitha (Chitoi)', bnName: 'চিতই পিঠা', calories: 110, protein: 2, carbs: 24, fat: 1, serving: '1 piece', category: 'Snacks' },
    { name: 'Pitha (Bhapa)', bnName: 'ভাপা পিঠা', calories: 180, protein: 3, carbs: 35, fat: 4, serving: '1 piece', category: 'Snacks' },
    { name: 'Pitha (Patishapta)', bnName: 'পাটিসাপটা পিঠা', calories: 220, protein: 4, carbs: 40, fat: 6, serving: '1 piece', category: 'Snacks' },
    { name: 'Halim', bnName: 'হালিম', calories: 350, protein: 20, carbs: 40, fat: 15, serving: '1 bowl', category: 'Street Food' },
    { name: 'Shami Kabab', bnName: 'শামি কাবাব', calories: 150, protein: 12, carbs: 5, fat: 10, serving: '1 piece', category: 'Protein' },
    { name: 'Reshmi Kabab', bnName: 'রেশমি কাবাব', calories: 180, protein: 20, carbs: 3, fat: 12, serving: '4 pieces', category: 'Protein' },
    { name: 'Maghaz (Brain) Bhuna', bnName: 'মগজ ভুনা', calories: 350, protein: 15, carbs: 2, fat: 32, serving: '100g', category: 'Protein' },
    { name: 'Kalamora (Banana Stem)', bnName: 'থোড় ভাজি', calories: 50, protein: 1, carbs: 10, fat: 1, serving: '100g', category: 'Vegetables' },
    { name: 'Shorshe Ilish (Full)', bnName: 'সরিষা ইলিশ মাছ', calories: 350, protein: 25, carbs: 2, fat: 28, serving: '1 piece large', category: 'Protein' },
    { name: 'Koral Fish Curry', bnName: 'কোরাল মাছ', calories: 170, protein: 20, carbs: 1, fat: 9, serving: '1 piece', category: 'Protein' },
    { name: 'Bhetki Fry', bnName: 'ভেটকি মাছ ভাজা', calories: 140, protein: 18, carbs: 4, fat: 6, serving: '1 piece', category: 'Protein' },
    { name: 'Mola Fish Bhorta', bnName: 'মলা মাছের ভর্তা', calories: 120, protein: 15, carbs: 2, fat: 6, serving: '50g', category: 'Vegetables' },
    { name: 'Chingri Bhuna', bnName: 'চিংড়ি ভুনা', calories: 210, protein: 22, carbs: 4, fat: 12, serving: '100g', category: 'Protein' },
    { name: 'Mixed Fruit Salad', bnName: 'ফ্রুট সালাদ', calories: 90, protein: 1, carbs: 22, fat: 0, serving: '1 cup', category: 'Snacks' },
    { name: 'Guava (Peyara)', bnName: 'পেয়ারা', calories: 68, protein: 2.5, carbs: 14, fat: 0.9, serving: '1 medium', category: 'Snacks' },
    { name: 'Mango (Fazli)', bnName: 'আম (ফজলি)', calories: 150, protein: 1.2, carbs: 38, fat: 0.6, serving: '1 large', category: 'Snacks' },
    { name: 'Jackfruit (Kathal)', bnName: 'কাঁঠাল', calories: 95, protein: 1.7, carbs: 23, fat: 0.6, serving: '100g', category: 'Snacks' },
    { name: 'Lychee', bnName: 'লিচু', calories: 66, protein: 0.8, carbs: 16, fat: 0.4, serving: '10 pieces', category: 'Snacks' },
    { name: 'Wood Apple (Bel)', bnName: 'বেল', calories: 137, protein: 1.8, carbs: 31, fat: 0.3, serving: '100g', category: 'Snacks' },
    { name: 'Tamarind (Tetul)', bnName: 'তেঁতুল', calories: 239, protein: 2.8, carbs: 62, fat: 0.6, serving: '100g', category: 'Snacks' },
    { name: 'Banana (Sagor)', bnName: 'সাগর কলা', calories: 105, protein: 1.3, carbs: 27, fat: 0.4, serving: '1 piece', category: 'Snacks' },
    { name: 'Papaya (Ripe)', bnName: 'পাকা পেঁপে', calories: 43, protein: 0.5, carbs: 11, fat: 0.3, serving: '100g', category: 'Snacks' },
    { name: 'Tea (Milk & Sugar)', bnName: 'দুধ চা', calories: 75, protein: 2, carbs: 12, fat: 3, serving: '1 cup', category: 'Snacks' },
    { name: 'Tea (Raw/Lal Cha)', bnName: 'লাল চা', calories: 5, protein: 0, carbs: 1, fat: 0, serving: '1 cup', category: 'Snacks' },
    { name: 'Lassi', bnName: 'লাচ্ছি', calories: 180, protein: 5, carbs: 25, fat: 6, serving: '1 glass', category: 'Snacks' },
    { name: 'Borhani', bnName: 'বোরহানি', calories: 90, protein: 3, carbs: 8, fat: 5, serving: '1 glass', category: 'Snacks' },
    { name: 'Sugarcane Juice', bnName: 'আখের রস', calories: 120, protein: 0, carbs: 30, fat: 0, serving: '1 glass', category: 'Street Food' },
    { name: 'Nimki', bnName: 'নিমকি', calories: 110, protein: 2, carbs: 14, fat: 6, serving: '1 piece large', category: 'Snacks' },
    { name: 'Chanachur', bnName: 'চানাচুর', calories: 160, protein: 5, carbs: 18, fat: 9, serving: '30g', category: 'Snacks' },
    { name: 'Murir Moa', bnName: 'মুড়ির মোয়া', calories: 90, protein: 1, carbs: 20, fat: 1, serving: '1 piece', category: 'Snacks' },
    { name: 'Chira Bhaja', bnName: 'চিড়া ভাজা', calories: 140, protein: 3, carbs: 22, fat: 5, serving: '1 cup', category: 'Snacks' },
    { name: 'Peanut (Badam) Bhaja', bnName: 'বাদাম ভাজা', calories: 170, protein: 7, carbs: 6, fat: 14, serving: '30g', category: 'Snacks' },
    { name: 'Boot Bhuna', bnName: 'বুট ভুনা', calories: 180, protein: 9, carbs: 25, fat: 6, serving: '1 cup', category: 'Snacks' },
    { name: 'Popcorn', bnName: 'পপকর্ন', calories: 110, protein: 3, carbs: 20, fat: 2, serving: '1 bowl', category: 'Snacks' },
    { name: 'Chicken Fry (Local)', bnName: 'মুরগি ভাজা', calories: 250, protein: 22, carbs: 8, fat: 15, serving: '1 piece', category: 'Street Food' },
    { name: 'Beef Tikka Kabab', bnName: 'টিক্কা কাবাব', calories: 160, protein: 18, carbs: 4, fat: 10, serving: '1 piece', category: 'Protein' },
    { name: 'Koi Fish Pepper Fry', bnName: 'কৈ মাছ ভাজা', calories: 160, protein: 18, carbs: 1, fat: 9, serving: '1 piece', category: 'Protein' },
    { name: 'Shol Fish Bhuna', bnName: 'শোল মাছ', calories: 180, protein: 20, carbs: 2, fat: 10, serving: '1 piece', category: 'Protein' },
    { name: 'Tangra Fish Curry', bnName: 'ট্যাংরা মাছ', calories: 140, protein: 16, carbs: 1, fat: 8, serving: '4 pieces', category: 'Protein' },
    { name: 'Kakrol Pur', bnName: 'কাঁকরোল পুর', calories: 120, protein: 4, carbs: 10, fat: 7, serving: '1 piece', category: 'Vegetables' },
    { name: 'Potol Bhaji', bnName: 'পটল ভাজি', calories: 70, protein: 1, carbs: 8, fat: 4, serving: '4 pieces', category: 'Vegetables' },
    { name: 'Chalkumra Ghonto', bnName: 'চালকুমড়া ঘন্ট', calories: 55, protein: 1, carbs: 8, fat: 3, serving: '100g', category: 'Vegetables' },
    { name: 'Pui Shak', bnName: 'পুঁই শাক', calories: 45, protein: 2, carbs: 6, fat: 1, serving: '100g', category: 'Vegetables' },
    { name: 'Lal Shak', bnName: 'লাল শাক', calories: 40, protein: 2, carbs: 5, fat: 1, serving: '100g', category: 'Vegetables' },
    { name: 'Palong Shak', bnName: 'পালং শাক', calories: 35, protein: 3, carbs: 4, fat: 1, serving: '100g', category: 'Vegetables' },
    { name: 'Data Shak', bnName: 'ডাঁটা শাক', calories: 42, protein: 2, carbs: 6, fat: 1, serving: '100g', category: 'Vegetables' },
    { name: 'Thankuni Pata Bhorta', bnName: 'থানকুনি পাতা ভর্তা', calories: 50, protein: 2, carbs: 8, fat: 2, serving: '50g', category: 'Vegetables' },
    { name: 'Shim Bhaji', bnName: 'শিম ভাজি', calories: 85, protein: 4, carbs: 12, fat: 3, serving: '100g', category: 'Vegetables' },
    { name: 'Barboti Bhaji', bnName: 'বরবটি ভাজি', calories: 90, protein: 3, carbs: 12, fat: 4, serving: '100g', category: 'Vegetables' },
    { name: 'Kacha Kola Bhorta', bnName: 'কাঁচা কলা ভর্তা', calories: 95, protein: 1.5, carbs: 22, fat: 0.5, serving: '100g', category: 'Vegetables' },
    { name: 'Kumro Phool Bhaja', bnName: 'কুমড়ো ফুল ভাজা', calories: 60, protein: 1, carbs: 6, fat: 4, serving: '2 pieces', category: 'Snacks' },
    { name: 'Dry Fish (Shutki) Chutney', bnName: 'শুটকি চাটনি', calories: 150, protein: 20, carbs: 5, fat: 6, serving: '50g', category: 'Protein' },
    { name: 'Achar (Mango)', bnName: 'আচার', calories: 50, protein: 0, carbs: 10, fat: 1, serving: '1 tbsp', category: 'Snacks' },
    { name: 'Papad', bnName: 'পাপড়', calories: 45, protein: 2, carbs: 8, fat: 1, serving: '1 piece', category: 'Snacks' },
    { name: 'Shemai (Dudh/Milk)', bnName: 'দুধ সেমাই', calories: 250, protein: 6, carbs: 35, fat: 10, serving: '1 cup', category: 'Dessert' }
];

export const getFoodByName = (name: string) => {
    return bangladeshiFoods.find(f => f.name.toLowerCase().includes(name.toLowerCase()) || f.bnName.includes(name));
};

export const t = (key: string, isEnglish: boolean = true) => {
    const translations: Record<string, { en: string, bn: string }> = {
        'dashboard.calories': { en: 'Calories', bn: 'ক্যালোরি' },
        'dashboard.protein': { en: 'Protein', bn: 'প্রোটিন' },
        'dashboard.carbs': { en: 'Carbs', bn: 'কার্বোহাইড্রেট' },
        'dashboard.fat': { en: 'Fat', bn: 'ফ্যাট' },
        'dashboard.target': { en: 'Target', bn: 'লক্ষ্যমাত্রা' },
        'dashboard.consumed': { en: 'Consumed', bn: 'গৃহীত' },
        'dashboard.left': { en: 'Left', bn: 'বাকি' },
        'coach.ask': { en: 'Ask FitDay AI Coach...', bn: 'FitDay AI কোচকে জিজ্ঞেস করুন...' },
        'coach.send': { en: 'Send', bn: 'পাঠান' },
        'vision.scan': { en: 'Scan Food', bn: 'খাবার স্ক্যান করুন' },
        'vision.processing': { en: 'Processing...', bn: 'প্রক্রিয়াকরণ চলছে...' },
    };
    return translations[key]?.[isEnglish ? 'en' : 'bn'] || key;
};
