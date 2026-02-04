/**
 * Smart Food Suggester
 * Provides intelligent food suggestions based on meal type, macros, and preferences
 */

interface FoodOption {
    name: string
    bengali_name?: string
    portion_size: string
    calories: number
    protein: number
    carbs: number
    fats: number
    preparation_time: number // minutes
    complexity: 'quick' | 'moderate' | 'complex'
    meal_types: string[]
    tags: string[]
    availability: 'common' | 'seasonal' | 'specialty'
}

interface MealSuggestion {
    meal_name: string
    total_calories: number
    total_protein: number
    total_carbs: number
    total_fats: number
    foods: FoodOption[]
    preparation_time: number
    complexity: 'quick' | 'moderate' | 'complex'
    alternatives: MealSuggestion[]
}

// Comprehensive Bangladeshi food database
const FOOD_DATABASE: FoodOption[] = [
    // Breakfast Options
    {
        name: 'Paratha with Egg Omelette',
        bengali_name: 'পরোটা ও ডিমের অমলেট',
        portion_size: '2 parathas + 2 eggs',
        calories: 520,
        protein: 24,
        carbs: 48,
        fats: 24,
        preparation_time: 15,
        complexity: 'moderate',
        meal_types: ['breakfast'],
        tags: ['traditional', 'protein-rich', 'filling'],
        availability: 'common',
    },
    {
        name: 'Oats with Banana and Nuts',
        bengali_name: 'ওটস, কলা ও বাদাম',
        portion_size: '1 cup oats + 1 banana + 30g nuts',
        calories: 450,
        protein: 15,
        carbs: 65,
        fats: 15,
        preparation_time: 5,
        complexity: 'quick',
        meal_types: ['breakfast', 'mid_morning_snack'],
        tags: ['healthy', 'quick', 'fiber-rich'],
        availability: 'common',
    },
    {
        name: 'Roti with Vegetable Curry',
        bengali_name: 'রুটি ও সবজির তরকারি',
        portion_size: '3 rotis + 1 cup curry',
        calories: 380,
        protein: 12,
        carbs: 68,
        fats: 8,
        preparation_time: 20,
        complexity: 'moderate',
        meal_types: ['breakfast', 'lunch', 'dinner'],
        tags: ['traditional', 'vegetarian', 'fiber-rich'],
        availability: 'common',
    },

    // Protein Sources
    {
        name: 'Grilled Chicken Breast',
        bengali_name: 'গ্রিল করা মুরগির বুক',
        portion_size: '150g',
        calories: 240,
        protein: 45,
        carbs: 0,
        fats: 5,
        preparation_time: 20,
        complexity: 'moderate',
        meal_types: ['lunch', 'dinner', 'post_workout'],
        tags: ['high-protein', 'lean', 'muscle-building'],
        availability: 'common',
    },
    {
        name: 'Hilsa Fish Curry',
        bengali_name: 'ইলিশ মাছের ঝোল',
        portion_size: '150g fish',
        calories: 310,
        protein: 35,
        carbs: 2,
        fats: 18,
        preparation_time: 30,
        complexity: 'moderate',
        meal_types: ['lunch', 'dinner'],
        tags: ['traditional', 'omega-3', 'protein-rich'],
        availability: 'seasonal',
    },
    {
        name: 'Boiled Eggs',
        bengali_name: 'সিদ্ধ ডিম',
        portion_size: '3 eggs',
        calories: 210,
        protein: 18,
        carbs: 3,
        fats: 15,
        preparation_time: 10,
        complexity: 'quick',
        meal_types: ['breakfast', 'mid_morning_snack', 'post_workout'],
        tags: ['quick', 'protein-rich', 'convenient'],
        availability: 'common',
    },
    {
        name: 'Lentil Dal',
        bengali_name: 'ডাল',
        portion_size: '1 cup',
        calories: 230,
        protein: 18,
        carbs: 40,
        fats: 1,
        preparation_time: 25,
        complexity: 'moderate',
        meal_types: ['lunch', 'dinner'],
        tags: ['vegetarian', 'protein-rich', 'traditional'],
        availability: 'common',
    },
    {
        name: 'Paneer Curry',
        bengali_name: 'পনির তরকারি',
        portion_size: '150g paneer',
        calories: 320,
        protein: 25,
        carbs: 8,
        fats: 22,
        preparation_time: 20,
        complexity: 'moderate',
        meal_types: ['lunch', 'dinner'],
        tags: ['vegetarian', 'protein-rich', 'filling'],
        availability: 'common',
    },

    // Carb Sources
    {
        name: 'White Rice',
        bengali_name: 'সাদা ভাত',
        portion_size: '1 cup cooked',
        calories: 200,
        protein: 4,
        carbs: 45,
        fats: 0,
        preparation_time: 20,
        complexity: 'quick',
        meal_types: ['lunch', 'dinner', 'post_workout'],
        tags: ['traditional', 'staple', 'energy'],
        availability: 'common',
    },
    {
        name: 'Brown Rice',
        bengali_name: 'বাদামী ভাত',
        portion_size: '1 cup cooked',
        calories: 215,
        protein: 5,
        carbs: 45,
        fats: 2,
        preparation_time: 35,
        complexity: 'moderate',
        meal_types: ['lunch', 'dinner'],
        tags: ['healthy', 'fiber-rich', 'slow-digesting'],
        availability: 'common',
    },
    {
        name: 'Sweet Potato',
        bengali_name: 'মিষ্টি আলু',
        portion_size: '200g',
        calories: 180,
        protein: 4,
        carbs: 42,
        fats: 0,
        preparation_time: 25,
        complexity: 'quick',
        meal_types: ['lunch', 'dinner', 'pre_workout'],
        tags: ['healthy', 'nutrient-dense', 'slow-digesting'],
        availability: 'common',
    },
    {
        name: 'Whole Wheat Bread',
        bengali_name: 'আটার রুটি',
        portion_size: '2 slices',
        calories: 160,
        protein: 6,
        carbs: 30,
        fats: 2,
        preparation_time: 2,
        complexity: 'quick',
        meal_types: ['breakfast', 'mid_morning_snack'],
        tags: ['quick', 'convenient', 'fiber-rich'],
        availability: 'common',
    },

    // Snacks
    {
        name: 'Chickpeas Salad',
        bengali_name: 'ছোলার সালাদ',
        portion_size: '1 cup',
        calories: 220,
        protein: 12,
        carbs: 35,
        fats: 4,
        preparation_time: 10,
        complexity: 'quick',
        meal_types: ['mid_morning_snack', 'evening_snack'],
        tags: ['healthy', 'protein-rich', 'fiber-rich'],
        availability: 'common',
    },
    {
        name: 'Mixed Nuts',
        bengali_name: 'মিশ্র বাদাম',
        portion_size: '30g',
        calories: 170,
        protein: 6,
        carbs: 6,
        fats: 15,
        preparation_time: 0,
        complexity: 'quick',
        meal_types: ['mid_morning_snack', 'evening_snack'],
        tags: ['quick', 'healthy-fats', 'convenient'],
        availability: 'common',
    },
    {
        name: 'Banana with Peanut Butter',
        bengali_name: 'কলা ও পিনাট বাটার',
        portion_size: '1 banana + 2 tbsp PB',
        calories: 290,
        protein: 8,
        carbs: 35,
        fats: 16,
        preparation_time: 2,
        complexity: 'quick',
        meal_types: ['mid_morning_snack', 'pre_workout'],
        tags: ['quick', 'energy', 'convenient'],
        availability: 'common',
    },
    {
        name: 'Yogurt with Fruits',
        bengali_name: 'দই ও ফল',
        portion_size: '1 cup yogurt + fruits',
        calories: 200,
        protein: 12,
        carbs: 30,
        fats: 4,
        preparation_time: 5,
        complexity: 'quick',
        meal_types: ['breakfast', 'mid_morning_snack', 'evening_snack'],
        tags: ['healthy', 'probiotic', 'refreshing'],
        availability: 'common',
    },

    // Vegetables
    {
        name: 'Mixed Vegetable Curry',
        bengali_name: 'মিশ্র সবজির তরকারি',
        portion_size: '1.5 cups',
        calories: 150,
        protein: 5,
        carbs: 25,
        fats: 4,
        preparation_time: 20,
        complexity: 'moderate',
        meal_types: ['lunch', 'dinner'],
        tags: ['vegetarian', 'fiber-rich', 'nutrient-dense'],
        availability: 'common',
    },
    {
        name: 'Spinach Bhaji',
        bengali_name: 'পালং শাকের ভাজি',
        portion_size: '1 cup',
        calories: 80,
        protein: 4,
        carbs: 10,
        fats: 3,
        preparation_time: 15,
        complexity: 'quick',
        meal_types: ['lunch', 'dinner'],
        tags: ['vegetarian', 'iron-rich', 'low-calorie'],
        availability: 'common',
    },

    // Post-Workout Specific
    {
        name: 'Protein Shake with Banana',
        bengali_name: 'প্রোটিন শেক ও কলা',
        portion_size: '1 scoop + 1 banana',
        calories: 280,
        protein: 30,
        carbs: 35,
        fats: 3,
        preparation_time: 3,
        complexity: 'quick',
        meal_types: ['post_workout'],
        tags: ['quick', 'high-protein', 'fast-absorbing'],
        availability: 'common',
    },
    {
        name: 'Chicken Rice Bowl',
        bengali_name: 'চিকেন রাইস বোল',
        portion_size: '150g chicken + 1 cup rice',
        calories: 440,
        protein: 49,
        carbs: 45,
        fats: 5,
        preparation_time: 25,
        complexity: 'moderate',
        meal_types: ['lunch', 'post_workout'],
        tags: ['high-protein', 'balanced', 'muscle-building'],
        availability: 'common',
    },
];

export class SmartFoodSuggester {
    private foodDatabase: FoodOption[]
    private dietaryRestrictions: string[]
    private allergies: string[]

    constructor(dietaryRestrictions: string[] = [], allergies: string[] = []) {
        this.foodDatabase = FOOD_DATABASE
        this.dietaryRestrictions = dietaryRestrictions
        this.allergies = allergies
    }

    /**
     * Suggest meals for a specific meal type and macro targets
     */
    suggestMeals(
        mealType: string,
        calorieTarget: number,
        proteinTarget: number,
        carbsTarget: number,
        fatsTarget: number,
        count: number = 3
    ): MealSuggestion[] {
        const suggestions: MealSuggestion[] = []

        // Filter foods suitable for this meal type
        const suitableFoods = this.foodDatabase.filter(food =>
            food.meal_types.includes(mealType) &&
            this.isAllowed(food)
        )

        // Generate meal combinations
        for (let i = 0; i < count && i < suitableFoods.length * 2; i++) {
            const meal = this.generateMealCombination(
                suitableFoods,
                calorieTarget,
                proteinTarget,
                carbsTarget,
                fatsTarget,
                mealType
            )

            if (meal && !this.isDuplicate(meal, suggestions)) {
                suggestions.push(meal)
            }
        }

        return suggestions.slice(0, count)
    }

    /**
     * Generate a meal combination that hits macro targets
     */
    private generateMealCombination(
        foods: FoodOption[],
        calorieTarget: number,
        proteinTarget: number,
        carbsTarget: number,
        fatsTarget: number,
        mealType: string
    ): MealSuggestion | null {
        const selectedFoods: FoodOption[] = []
        let totalCalories = 0
        let totalProtein = 0
        let totalCarbs = 0
        let totalFats = 0

        // Prioritize protein source
        const proteinFoods = foods.filter(f => f.protein >= 15)
        if (proteinFoods.length > 0) {
            const proteinFood = proteinFoods[Math.floor(Math.random() * proteinFoods.length)]
            selectedFoods.push(proteinFood)
            totalCalories += proteinFood.calories
            totalProtein += proteinFood.protein
            totalCarbs += proteinFood.carbs
            totalFats += proteinFood.fats
        }

        // Add carb source if needed
        if (totalCarbs < carbsTarget * 0.7) {
            const carbFoods = foods.filter(f =>
                f.carbs >= 30 &&
                !selectedFoods.includes(f)
            )
            if (carbFoods.length > 0) {
                const carbFood = carbFoods[Math.floor(Math.random() * carbFoods.length)]
                selectedFoods.push(carbFood)
                totalCalories += carbFood.calories
                totalProtein += carbFood.protein
                totalCarbs += carbFood.carbs
                totalFats += carbFood.fats
            }
        }

        // Add vegetables or additional items
        const remainingCalories = calorieTarget - totalCalories
        if (remainingCalories > 50) {
            const fillerFoods = foods.filter(f =>
                !selectedFoods.includes(f) &&
                f.calories <= remainingCalories + 100
            )
            if (fillerFoods.length > 0) {
                const fillerFood = fillerFoods[Math.floor(Math.random() * fillerFoods.length)]
                selectedFoods.push(fillerFood)
                totalCalories += fillerFood.calories
                totalProtein += fillerFood.protein
                totalCarbs += fillerFood.carbs
                totalFats += fillerFood.fats
            }
        }

        if (selectedFoods.length === 0) return null

        const maxPrepTime = Math.max(...selectedFoods.map(f => f.preparation_time))
        const complexity = maxPrepTime <= 10 ? 'quick' : maxPrepTime <= 25 ? 'moderate' : 'complex'

        return {
            meal_name: selectedFoods.map(f => f.name).join(' + '),
            total_calories: totalCalories,
            total_protein: totalProtein,
            total_carbs: totalCarbs,
            total_fats: totalFats,
            foods: selectedFoods,
            preparation_time: selectedFoods.reduce((sum, f) => sum + f.preparation_time, 0),
            complexity,
            alternatives: [],
        }
    }

    /**
     * Check if food is allowed based on restrictions
     */
    private isAllowed(food: FoodOption): boolean {
        // Check dietary restrictions
        if (this.dietaryRestrictions.includes('vegetarian')) {
            if (food.tags.includes('non-vegetarian')) return false
        }
        if (this.dietaryRestrictions.includes('vegan')) {
            if (food.tags.includes('dairy') || food.tags.includes('eggs')) return false
        }

        // Check allergies
        for (const allergy of this.allergies) {
            if (food.name.toLowerCase().includes(allergy.toLowerCase())) {
                return false
            }
        }

        return true
    }

    /**
     * Check if meal is duplicate
     */
    private isDuplicate(meal: MealSuggestion, existing: MealSuggestion[]): boolean {
        return existing.some(m => m.meal_name === meal.meal_name)
    }
}

/**
 * Get food suggestions for a meal
 */
export function getFoodSuggestions(
    mealType: string,
    calorieTarget: number,
    proteinTarget: number,
    carbsTarget: number,
    fatsTarget: number,
    dietaryRestrictions: string[] = [],
    allergies: string[] = [],
    count: number = 3
): MealSuggestion[] {
    const suggester = new SmartFoodSuggester(dietaryRestrictions, allergies)
    return suggester.suggestMeals(mealType, calorieTarget, proteinTarget, carbsTarget, fatsTarget, count)
}

// Export food database for other uses
export { FOOD_DATABASE, type FoodOption, type MealSuggestion }
