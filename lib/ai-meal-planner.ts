/**
 * AI Meal Planning Service
 * Generates personalized meal plans based on user goals, preferences, and dietary restrictions
 */

interface UserProfile {
    goal: 'lose_weight' | 'gain_muscle' | 'maintain'
    weight: number
    height: number
    age: number
    gender: 'male' | 'female'
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
    dietaryRestrictions?: string[]
    preferences?: string[]
}

interface MealPlan {
    totalCalories: number
    macros: {
        protein: number
        carbs: number
        fat: number
    }
    meals: Meal[]
    tips: string[]
}

interface Meal {
    id: string
    type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
    name: string
    calories: number
    protein: number
    carbs: number
    fat: number
    ingredients: string[]
    instructions: string[]
    prepTime: number
    culturalContext?: string
}

/**
 * Calculate daily calorie needs using Mifflin-St Jeor Equation
 */
export function calculateCalorieNeeds(profile: UserProfile): number {
    // BMR calculation
    let bmr: number
    if (profile.gender === 'male') {
        bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5
    } else {
        bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161
    }

    // Activity multiplier
    const activityMultipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        very_active: 1.9,
    }

    const tdee = bmr * activityMultipliers[profile.activityLevel]

    // Adjust for goal
    const goalAdjustments = {
        lose_weight: -500, // 500 calorie deficit
        maintain: 0,
        gain_muscle: 300, // 300 calorie surplus
    }

    return Math.round(tdee + goalAdjustments[profile.goal])
}

/**
 * Calculate optimal macronutrient distribution
 */
export function calculateMacros(calories: number, goal: string): { protein: number; carbs: number; fat: number } {
    const macroRatios = {
        lose_weight: { protein: 0.35, carbs: 0.35, fat: 0.30 },
        maintain: { protein: 0.30, carbs: 0.40, fat: 0.30 },
        gain_muscle: { protein: 0.30, carbs: 0.45, fat: 0.25 },
    }

    const ratios = macroRatios[goal as keyof typeof macroRatios] || macroRatios.maintain

    return {
        protein: Math.round((calories * ratios.protein) / 4), // 4 cal/g
        carbs: Math.round((calories * ratios.carbs) / 4), // 4 cal/g
        fat: Math.round((calories * ratios.fat) / 9), // 9 cal/g
    }
}

/**
 * South Asian meal database
 */
const southAsianMeals: Meal[] = [
    // Breakfast
    {
        id: 'breakfast-1',
        type: 'breakfast',
        name: 'Vegetable Paratha with Yogurt',
        calories: 350,
        protein: 12,
        carbs: 45,
        fat: 14,
        ingredients: ['Whole wheat flour', 'Mixed vegetables', 'Yogurt', 'Spices'],
        instructions: [
            'Knead whole wheat dough with grated vegetables',
            'Roll into parathas and cook on tawa',
            'Serve hot with fresh yogurt',
        ],
        prepTime: 20,
        culturalContext: 'Popular North Indian breakfast',
    },
    {
        id: 'breakfast-2',
        name: 'Masala Oats with Fruits',
        type: 'breakfast',
        calories: 280,
        protein: 10,
        carbs: 42,
        fat: 8,
        ingredients: ['Oats', 'Mixed vegetables', 'Spices', 'Seasonal fruits'],
        instructions: [
            'Cook oats with vegetables and spices',
            'Top with fresh fruits',
            'Serve warm',
        ],
        prepTime: 15,
        culturalContext: 'Modern healthy South Asian breakfast',
    },
    {
        id: 'breakfast-3',
        name: 'Poha (Flattened Rice)',
        type: 'breakfast',
        calories: 250,
        protein: 6,
        carbs: 40,
        fat: 7,
        ingredients: ['Poha', 'Peanuts', 'Curry leaves', 'Turmeric', 'Lemon'],
        instructions: [
            'Rinse and soak poha',
            'Temper with mustard seeds, curry leaves',
            'Add turmeric, peanuts, and lemon',
        ],
        prepTime: 15,
        culturalContext: 'Traditional Maharashtrian breakfast',
    },

    // Lunch
    {
        id: 'lunch-1',
        name: 'Dal Tadka with Brown Rice',
        type: 'lunch',
        calories: 420,
        protein: 18,
        carbs: 65,
        fat: 10,
        ingredients: ['Lentils', 'Brown rice', 'Tomatoes', 'Spices', 'Ghee'],
        instructions: [
            'Cook lentils with turmeric',
            'Prepare tadka with cumin, garlic, tomatoes',
            'Serve with steamed brown rice',
        ],
        prepTime: 30,
        culturalContext: 'Classic Indian comfort food',
    },
    {
        id: 'lunch-2',
        name: 'Chicken Curry with Roti',
        type: 'lunch',
        calories: 480,
        protein: 35,
        carbs: 45,
        fat: 16,
        ingredients: ['Chicken breast', 'Whole wheat roti', 'Onions', 'Tomatoes', 'Spices'],
        instructions: [
            'Marinate chicken with yogurt and spices',
            'Cook curry with onion-tomato base',
            'Serve with fresh whole wheat roti',
        ],
        prepTime: 40,
        culturalContext: 'Popular protein-rich meal',
    },
    {
        id: 'lunch-3',
        name: 'Vegetable Biryani',
        type: 'lunch',
        calories: 400,
        protein: 12,
        carbs: 70,
        fat: 8,
        ingredients: ['Basmati rice', 'Mixed vegetables', 'Biryani spices', 'Raita'],
        instructions: [
            'Layer rice and vegetables with spices',
            'Cook on dum (slow steam)',
            'Serve with cucumber raita',
        ],
        prepTime: 45,
        culturalContext: 'Festive South Asian dish',
    },

    // Dinner
    {
        id: 'dinner-1',
        name: 'Grilled Fish with Salad',
        type: 'dinner',
        calories: 320,
        protein: 30,
        carbs: 15,
        fat: 14,
        ingredients: ['Fish fillet', 'Mixed greens', 'Lemon', 'Spices'],
        instructions: [
            'Marinate fish with lemon and spices',
            'Grill until cooked through',
            'Serve with fresh salad',
        ],
        prepTime: 25,
        culturalContext: 'Light, protein-rich dinner',
    },
    {
        id: 'dinner-2',
        name: 'Palak Paneer with Quinoa',
        type: 'dinner',
        calories: 380,
        protein: 20,
        carbs: 35,
        fat: 16,
        ingredients: ['Spinach', 'Paneer', 'Quinoa', 'Spices', 'Cream'],
        instructions: [
            'Blanch and puree spinach',
            'Cook paneer in spinach gravy',
            'Serve with cooked quinoa',
        ],
        prepTime: 30,
        culturalContext: 'Nutritious vegetarian option',
    },
    {
        id: 'dinner-3',
        name: 'Egg Bhurji with Roti',
        type: 'dinner',
        calories: 300,
        protein: 22,
        carbs: 28,
        fat: 12,
        ingredients: ['Eggs', 'Onions', 'Tomatoes', 'Whole wheat roti', 'Spices'],
        instructions: [
            'Scramble eggs with onions and tomatoes',
            'Add spices and cook',
            'Serve with warm roti',
        ],
        prepTime: 15,
        culturalContext: 'Quick, protein-packed dinner',
    },

    // Snacks
    {
        id: 'snack-1',
        name: 'Roasted Chickpeas',
        type: 'snack',
        calories: 150,
        protein: 8,
        carbs: 22,
        fat: 3,
        ingredients: ['Chickpeas', 'Spices', 'Lemon'],
        instructions: [
            'Toss chickpeas with spices',
            'Roast until crispy',
            'Sprinkle with lemon juice',
        ],
        prepTime: 30,
        culturalContext: 'Healthy Indian snack',
    },
    {
        id: 'snack-2',
        name: 'Fruit Chaat',
        type: 'snack',
        calories: 120,
        protein: 2,
        carbs: 28,
        fat: 1,
        ingredients: ['Mixed fruits', 'Chaat masala', 'Lemon', 'Black salt'],
        instructions: [
            'Chop seasonal fruits',
            'Mix with chaat masala and lemon',
            'Serve fresh',
        ],
        prepTime: 10,
        culturalContext: 'Refreshing Indian fruit salad',
    },
]

/**
 * Generate personalized meal plan
 */
export function generateMealPlan(profile: UserProfile): MealPlan {
    const totalCalories = calculateCalorieNeeds(profile)
    const macros = calculateMacros(totalCalories, profile.goal)

    // Distribute calories across meals
    const mealDistribution = {
        breakfast: 0.25,
        lunch: 0.35,
        dinner: 0.30,
        snack: 0.10,
    }

    const targetCalories = {
        breakfast: totalCalories * mealDistribution.breakfast,
        lunch: totalCalories * mealDistribution.lunch,
        dinner: totalCalories * mealDistribution.dinner,
        snack: totalCalories * mealDistribution.snack,
    }

    // Select meals close to target calories
    const selectedMeals: Meal[] = []

    for (const [mealType, target] of Object.entries(targetCalories)) {
        const availableMeals = southAsianMeals.filter(m => m.type === mealType)
        const closest = availableMeals.reduce((prev, curr) =>
            Math.abs(curr.calories - target) < Math.abs(prev.calories - target) ? curr : prev
        )
        selectedMeals.push(closest)
    }

    // Generate tips based on goal
    const tips = generateTips(profile.goal, macros)

    return {
        totalCalories,
        macros,
        meals: selectedMeals,
        tips,
    }
}

/**
 * Generate personalized tips
 */
function generateTips(goal: string, macros: { protein: number; carbs: number; fat: number }): string[] {
    const baseTips = [
        'Stay hydrated - drink at least 2-3 liters of water daily',
        'Eat mindfully and chew your food thoroughly',
        'Include variety in your meals for balanced nutrition',
    ]

    const goalSpecificTips = {
        lose_weight: [
            'Focus on high-protein, high-fiber foods to stay full longer',
            'Avoid sugary drinks and processed foods',
            'Practice portion control and eat slowly',
        ],
        maintain: [
            'Maintain consistent meal timing',
            'Balance your macronutrients in each meal',
            'Listen to your hunger cues',
        ],
        gain_muscle: [
            `Aim for ${macros.protein}g protein daily for muscle growth`,
            'Eat protein within 2 hours post-workout',
            'Include complex carbs for energy and recovery',
        ],
    }

    return [...baseTips, ...(goalSpecificTips[goal as keyof typeof goalSpecificTips] || [])]
}

/**
 * Get meal suggestions based on time of day and preferences
 */
export function getMealSuggestions(
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
    calorieTarget: number,
    preferences?: string[]
): Meal[] {
    let meals = southAsianMeals.filter(m => m.type === mealType)

    // Filter by preferences if provided
    if (preferences && preferences.length > 0) {
        meals = meals.filter(meal =>
            preferences.some(pref =>
                meal.name.toLowerCase().includes(pref.toLowerCase()) ||
                meal.ingredients.some(ing => ing.toLowerCase().includes(pref.toLowerCase()))
            )
        )
    }

    // Sort by how close to target calories
    return meals
        .sort((a, b) => Math.abs(a.calories - calorieTarget) - Math.abs(b.calories - calorieTarget))
        .slice(0, 3)
}
