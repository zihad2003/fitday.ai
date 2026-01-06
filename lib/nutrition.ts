// lib/nutrition.ts

// 1. BMR ক্যালকুলেশন (শরীর সচল রাখতে কত ক্যালোরি লাগে)
export function calculateBMR(
  gender: 'male' | 'female' | 'other',
  weightKg: number,
  heightCm: number,
  age: number
): number {
  // Mifflin-St Jeor Formula
  let bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age);

  if (gender === 'male') {
    bmr += 5;
  } else {
    // মহিলাদের জন্য (এবং অন্যদের জন্য সেফ ডিফল্ট)
    bmr -= 161;
  }
  return Math.round(bmr);
}

// 2. TDEE ক্যালকুলেশন (কাজের ধরন অনুযায়ী মোট ক্যালোরি)
export function calculateTDEE(bmr: number, activityLevel: string): number {
  const multipliers: Record<string, number> = {
    sedentary: 1.2,      // নড়াচড়া কম (অফিস জব)
    light: 1.375,        // সপ্তাহে ১-৩ দিন ব্যায়াম
    moderate: 1.55,      // সপ্তাহে ৩-৫ দিন ব্যায়াম
    active: 1.725,       // সপ্তাহে ৬-৭ দিন ব্যায়াম
    very_active: 1.9     // কায়িক শ্রম বা অ্যাথলেট
  };
  
  // যদি activityLevel ম্যাচ না করে, ডিফল্ট 1.2 ধরা হবে
  return Math.round(bmr * (multipliers[activityLevel] || 1.2));
}

// 3. ম্যাক্রো নিউট্রিয়েন্ট ভাগ (প্রোটিন, ফ্যাট, কার্বোহাইড্রেট)
export function calculateMacros(tdee: number, goal: string) {
  let proteinRatio, fatRatio, carbRatio;
  let adjustedCalories = tdee;

  switch (goal) {
    case 'lose_weight':
      // ওজন কমাতে ৫০০ ক্যালোরি কম খাবে
      adjustedCalories = tdee - 500;
      // পেশি বাঁচাতে প্রোটিন বেশি
      proteinRatio = 0.40; // 40% Protein
      fatRatio = 0.30;     // 30% Fat
      carbRatio = 0.30;    // 30% Carbs
      break;
    
    case 'gain_muscle':
      // পেশি বাড়াতে ৩০০ ক্যালোরি বেশি
      adjustedCalories = tdee + 300;
      proteinRatio = 0.30;
      fatRatio = 0.20;
      carbRatio = 0.50; // এনার্জির জন্য কার্বস বেশি
      break;
      
    case 'maintain':
    default:
      adjustedCalories = tdee;
      // ব্যালেন্সড ডায়েট
      proteinRatio = 0.30;
      fatRatio = 0.30;
      carbRatio = 0.40;
      break;
  }

  // সেফটি রুল: ১২০০ ক্যালোরির নিচে কাউকে খেতে বলা যাবে না
  if (adjustedCalories < 1200) adjustedCalories = 1200;

  return {
    targetCalories: Math.round(adjustedCalories),
    proteinGrams: Math.round((adjustedCalories * proteinRatio) / 4), // 1g Protein = 4 cal
    fatGrams: Math.round((adjustedCalories * fatRatio) / 9),     // 1g Fat = 9 cal
    carbGrams: Math.round((adjustedCalories * carbRatio) / 4)    // 1g Carb = 4 cal
  };
}