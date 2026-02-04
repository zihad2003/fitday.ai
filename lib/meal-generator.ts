/**
 * Meal Plan Generator
 * Generates personalized meal plans with Bangladeshi cuisine focus
 */

interface UserNutritionProfile {
    target_calories: number
    fitness_goal: string
    dietary_preference: string
    food_allergies: string[]
    disliked_foods: string[]
    age: number
    weight_kg: number
}

interface FoodItem {
    id: number
    name: string
    bangla_name: string
    serving_unit: string
    calories: number
    protein: number
    carbs: number
    fat: number
    category: string
    is_bangladeshi_staple: boolean
}

interface Meal {
    meal_type: 'breakfast' | 'lunch' | 'snack' | 'dinner'
    meal_name: string
    total_calories: number
    total_protein: number
    total_carbs: number
    total_fat: number
    foods: MealFood[]
    preparation_time: number
    recipe_notes: string
}

interface MealFood {
    food_id: number
    food_name: string
    bangla_name: string
    quantity: number
    unit: string
    calories: number
    protein: number
    carbs: number
    fat: number
}

interface DailyMealPlan {
    day: string
    total_calories: number
    total_protein: number
    total_carbs: number
    total_fat: number
    meals: Meal[]
}

interface WeeklyMealPlan {
    plan_name: string
    goal: string
    daily_calories: number
    macro_targets: {
        protein: number
        carbs: number
        fats: number
    }
    dietary_restrictions: string[]
    weekly_schedule: DailyMealPlan[]
    shopping_list: ShoppingItem[]
    meal_prep_tips: string[]
}

interface ShoppingItem {
    item_name: string
    bangla_name: string
    quantity: number
    unit: string
    category: string
}

// Bangladeshi Food Database
const BANGLADESHI_FOODS = {
    // PROTEINS
    proteins: [
        { name: 'Chicken Breast', bangla: 'মুরগির বুক', calories: 165, protein: 31, carbs: 0, fat: 3.6, unit: '100g', category: 'protein' },
        { name: 'Eggs', bangla: 'ডিম', calories: 155, protein: 13, carbs: 1.1, fat: 11, unit: '2 eggs', category: 'protein' },
        { name: 'Hilsa Fish', bangla: 'ইলিশ মাছ', calories: 310, protein: 21, carbs: 0, fat: 25, unit: '100g', category: 'protein' },
        { name: 'Rohu Fish', bangla: 'রুই মাছ', calories: 97, protein: 17, carbs: 0, fat: 3, unit: '100g', category: 'protein' },
        { name: 'Lentils (Dal)', bangla: 'ডাল', calories: 116, protein: 9, carbs: 20, fat: 0.4, unit: '100g', category: 'protein' },
        { name: 'Chickpeas', bangla: 'ছোলা', calories: 164, protein: 9, carbs: 27, fat: 2.6, unit: '100g', category: 'protein' },
        { name: 'Paneer', bangla: 'পনির', calories: 265, protein: 18, carbs: 3, fat: 20, unit: '100g', category: 'protein' },
        { name: 'Beef', bangla: 'গরুর মাংস', calories: 250, protein: 26, carbs: 0, fat: 15, unit: '100g', category: 'protein' },
        { name: 'Mutton', bangla: 'খাসির মাংস', calories: 294, protein: 25, carbs: 0, fat: 21, unit: '100g', category: 'protein' },
    ],

    // CARBS
    carbs: [
        { name: 'White Rice', bangla: 'সাদা ভাত', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, unit: '100g', category: 'carbs' },
        { name: 'Brown Rice', bangla: 'লাল চাল', calories: 111, protein: 2.6, carbs: 23, fat: 0.9, unit: '100g', category: 'carbs' },
        { name: 'Roti (Whole Wheat)', bangla: 'আটার রুটি', calories: 71, protein: 3, carbs: 15, fat: 0.4, unit: '1 roti', category: 'carbs' },
        { name: 'Paratha', bangla: 'পরোটা', calories: 126, protein: 3, carbs: 18, fat: 5, unit: '1 paratha', category: 'carbs' },
        { name: 'Potato', bangla: 'আলু', calories: 77, protein: 2, carbs: 17, fat: 0.1, unit: '100g', category: 'carbs' },
        { name: 'Sweet Potato', bangla: 'মিষ্টি আলু', calories: 86, protein: 1.6, carbs: 20, fat: 0.1, unit: '100g', category: 'carbs' },
        { name: 'Oats', bangla: 'ওটস', calories: 389, protein: 17, carbs: 66, fat: 7, unit: '100g', category: 'carbs' },
        { name: 'Bread', bangla: 'পাউরুটি', calories: 265, protein: 9, carbs: 49, fat: 3.2, unit: '100g', category: 'carbs' },
    ],

    // VEGETABLES
    vegetables: [
        { name: 'Spinach', bangla: 'পালং শাক', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, unit: '100g', category: 'vegetables' },
        { name: 'Broccoli', bangla: 'ব্রকলি', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, unit: '100g', category: 'vegetables' },
        { name: 'Cauliflower', bangla: 'ফুলকপি', calories: 25, protein: 1.9, carbs: 5, fat: 0.3, unit: '100g', category: 'vegetables' },
        { name: 'Cabbage', bangla: 'বাঁধাকপি', calories: 25, protein: 1.3, carbs: 6, fat: 0.1, unit: '100g', category: 'vegetables' },
        { name: 'Tomato', bangla: 'টমেটো', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, unit: '100g', category: 'vegetables' },
        { name: 'Cucumber', bangla: 'শসা', calories: 16, protein: 0.7, carbs: 3.6, fat: 0.1, unit: '100g', category: 'vegetables' },
        { name: 'Eggplant', bangla: 'বেগুন', calories: 25, protein: 1, carbs: 6, fat: 0.2, unit: '100g', category: 'vegetables' },
        { name: 'Okra', bangla: 'ঢেঁড়স', calories: 33, protein: 1.9, carbs: 7, fat: 0.2, unit: '100g', category: 'vegetables' },
    ],

    // FRUITS
    fruits: [
        { name: 'Banana', bangla: 'কলা', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, unit: '1 medium', category: 'fruits' },
        { name: 'Apple', bangla: 'আপেল', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, unit: '1 medium', category: 'fruits' },
        { name: 'Mango', bangla: 'আম', calories: 60, protein: 0.8, carbs: 15, fat: 0.4, unit: '100g', category: 'fruits' },
        { name: 'Papaya', bangla: 'পেঁপে', calories: 43, protein: 0.5, carbs: 11, fat: 0.3, unit: '100g', category: 'fruits' },
        { name: 'Orange', bangla: 'কমলা', calories: 47, protein: 0.9, carbs: 12, fat: 0.1, unit: '1 medium', category: 'fruits' },
    ],

    // HEALTHY FATS
    fats: [
        { name: 'Mustard Oil', bangla: 'সরিষার তেল', calories: 884, protein: 0, carbs: 0, fat: 100, unit: '100ml', category: 'fats' },
        { name: 'Olive Oil', bangla: 'জলপাই তেল', calories: 884, protein: 0, carbs: 0, fat: 100, unit: '100ml', category: 'fats' },
        { name: 'Ghee', bangla: 'ঘি', calories: 900, protein: 0, carbs: 0, fat: 100, unit: '100g', category: 'fats' },
        { name: 'Nuts (Mixed)', bangla: 'বাদাম', calories: 607, protein: 20, carbs: 21, fat: 54, unit: '100g', category: 'fats' },
        { name: 'Peanut Butter', bangla: 'চিনাবাদাম মাখন', calories: 588, protein: 25, carbs: 20, fat: 50, unit: '100g', category: 'fats' },
    ],

    // DAIRY
    dairy: [
        { name: 'Milk', bangla: 'দুধ', calories: 42, protein: 3.4, carbs: 5, fat: 1, unit: '100ml', category: 'dairy' },
        { name: 'Yogurt', bangla: 'দই', calories: 59, protein: 3.5, carbs: 4.7, fat: 3.3, unit: '100g', category: 'dairy' },
        { name: 'Cheese', bangla: 'পনির', calories: 402, protein: 25, carbs: 1.3, fat: 33, unit: '100g', category: 'dairy' },
    ],
}

// Traditional Bangladeshi Meal Templates
const MEAL_TEMPLATES = {
    breakfast: [
        {
            name: 'Traditional Bengali Breakfast',
            bangla: 'ঐতিহ্যবাহী বাংলা নাস্তা',
            foods: ['Paratha', 'Eggs', 'Banana'],
            prep_time: 20,
        },
        {
            name: 'Healthy Oats Bowl',
            bangla: 'স্বাস্থ্যকর ওটস',
            foods: ['Oats', 'Milk', 'Banana', 'Nuts (Mixed)'],
            prep_time: 10,
        },
        {
            name: 'Protein Roti Breakfast',
            bangla: 'প্রোটিন রুটি নাস্তা',
            foods: ['Roti (Whole Wheat)', 'Eggs', 'Yogurt'],
            prep_time: 15,
        },
    ],

    lunch: [
        {
            name: 'Classic Bengali Lunch',
            bangla: 'ক্লাসিক বাংলা দুপুরের খাবার',
            foods: ['White Rice', 'Lentils (Dal)', 'Chicken Breast', 'Spinach', 'Tomato'],
            prep_time: 45,
        },
        {
            name: 'Fish & Rice',
            bangla: 'মাছ ভাত',
            foods: ['Brown Rice', 'Rohu Fish', 'Eggplant', 'Lentils (Dal)'],
            prep_time: 40,
        },
        {
            name: 'Protein Bowl',
            bangla: 'প্রোটিন বাটি',
            foods: ['Brown Rice', 'Chicken Breast', 'Broccoli', 'Cauliflower'],
            prep_time: 35,
        },
    ],

    snack: [
        {
            name: 'Healthy Snack',
            bangla: 'স্বাস্থ্যকর স্ন্যাক্স',
            foods: ['Chickpeas', 'Cucumber', 'Tomato'],
            prep_time: 5,
        },
        {
            name: 'Fruit & Nuts',
            bangla: 'ফল ও বাদাম',
            foods: ['Apple', 'Nuts (Mixed)', 'Yogurt'],
            prep_time: 5,
        },
        {
            name: 'Protein Snack',
            bangla: 'প্রোটিন স্ন্যাক্স',
            foods: ['Eggs', 'Bread', 'Banana'],
            prep_time: 10,
        },
    ],

    dinner: [
        {
            name: 'Light Bengali Dinner',
            bangla: 'হালকা বাংলা রাতের খাবার',
            foods: ['Roti (Whole Wheat)', 'Chicken Breast', 'Cabbage', 'Lentils (Dal)'],
            prep_time: 35,
        },
        {
            name: 'Fish Dinner',
            bangla: 'মাছের রাতের খাবার',
            foods: ['White Rice', 'Hilsa Fish', 'Okra', 'Spinach'],
            prep_time: 40,
        },
        {
            name: 'Vegetarian Dinner',
            bangla: 'নিরামিষ রাতের খাবার',
            foods: ['Roti (Whole Wheat)', 'Paneer', 'Cauliflower', 'Lentils (Dal)'],
            prep_time: 30,
        },
    ],
}

export class MealPlanGenerator {
    private profile: UserNutritionProfile
    private macroTargets: { protein: number; carbs: number; fats: number }
    private mealCalories: { breakfast: number; lunch: number; snack: number; dinner: number }

    constructor(profile: UserNutritionProfile) {
        this.profile = profile
        this.macroTargets = this.calculateMacros()
        this.mealCalories = this.distributeMealCalories()
    }

    /**
     * Generate complete weekly meal plan
     */
    generateWeeklyPlan(): WeeklyMealPlan {
        const weeklySchedule: DailyMealPlan[] = []
        const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

        daysOfWeek.forEach((day, index) => {
            weeklySchedule.push(this.generateDailyPlan(day, index))
        })

        return {
            plan_name: this.generatePlanName(),
            goal: this.profile.fitness_goal,
            daily_calories: this.profile.target_calories,
            macro_targets: this.macroTargets,
            dietary_restrictions: this.getDietaryRestrictions(),
            weekly_schedule: weeklySchedule,
            shopping_list: this.generateShoppingList(weeklySchedule),
            meal_prep_tips: this.getMealPrepTips(),
        }
    }

    /**
     * Generate daily meal plan
     */
    private generateDailyPlan(day: string, dayIndex: number): DailyMealPlan {
        const meals: Meal[] = []

        // Generate each meal
        meals.push(this.generateMeal('breakfast', dayIndex))
        meals.push(this.generateMeal('lunch', dayIndex))
        meals.push(this.generateMeal('snack', dayIndex))
        meals.push(this.generateMeal('dinner', dayIndex))

        // Calculate totals
        const totals = meals.reduce(
            (acc, meal) => ({
                calories: acc.calories + meal.total_calories,
                protein: acc.protein + meal.total_protein,
                carbs: acc.carbs + meal.total_carbs,
                fat: acc.fat + meal.total_fat,
            }),
            { calories: 0, protein: 0, carbs: 0, fat: 0 }
        )

        return {
            day,
            total_calories: totals.calories,
            total_protein: totals.protein,
            total_carbs: totals.carbs,
            total_fat: totals.fat,
            meals,
        }
    }

    /**
     * Generate individual meal
     */
    private generateMeal(mealType: 'breakfast' | 'lunch' | 'snack' | 'dinner', dayIndex: number): Meal {
        const templates = MEAL_TEMPLATES[mealType]
        const template = templates[dayIndex % templates.length]

        const targetCalories = this.mealCalories[mealType]
        const foods: MealFood[] = []

        // Build meal from template
        template.foods.forEach(foodName => {
            const food = this.findFood(foodName)
            if (food && this.isAllowed(food)) {
                foods.push({
                    food_id: 0,
                    food_name: food.name,
                    bangla_name: food.bangla,
                    quantity: 1,
                    unit: food.unit,
                    calories: food.calories,
                    protein: food.protein,
                    carbs: food.carbs,
                    fat: food.fat,
                })
            }
        })

        // Adjust quantities to hit calorie target
        this.adjustPortions(foods, targetCalories)

        // Calculate totals
        const totals = foods.reduce(
            (acc, food) => ({
                calories: acc.calories + food.calories,
                protein: acc.protein + food.protein,
                carbs: acc.carbs + food.carbs,
                fat: acc.fat + food.fat,
            }),
            { calories: 0, protein: 0, carbs: 0, fat: 0 }
        )

        return {
            meal_type: mealType,
            meal_name: template.name,
            total_calories: Math.round(totals.calories),
            total_protein: Math.round(totals.protein),
            total_carbs: Math.round(totals.carbs),
            total_fat: Math.round(totals.fat),
            foods,
            preparation_time: template.prep_time,
            recipe_notes: this.getRecipeNotes(mealType),
        }
    }

    /**
     * Find food by name
     */
    private findFood(name: string): any {
        for (const category of Object.values(BANGLADESHI_FOODS)) {
            const food = category.find(f => f.name === name)
            if (food) return food
        }
        return null
    }

    /**
     * Check if food is allowed based on dietary restrictions
     */
    private isAllowed(food: any): boolean {
        const pref = this.profile.dietary_preference

        // Check allergies
        if (this.profile.food_allergies.some(allergy =>
            food.name.toLowerCase().includes(allergy.toLowerCase())
        )) {
            return false
        }

        // Check dietary preferences
        if (pref === 'vegetarian' && ['Chicken Breast', 'Hilsa Fish', 'Rohu Fish', 'Beef', 'Mutton'].includes(food.name)) {
            return false
        }

        if (pref === 'vegan' && ['Eggs', 'Paneer', 'Milk', 'Yogurt', 'Cheese', 'Ghee'].includes(food.name)) {
            return false
        }

        if (pref === 'pescatarian' && ['Chicken Breast', 'Beef', 'Mutton'].includes(food.name)) {
            return false
        }

        return true
    }

    /**
     * Adjust food portions to hit calorie target
     */
    private adjustPortions(foods: MealFood[], targetCalories: number): void {
        const currentCalories = foods.reduce((sum, f) => sum + f.calories, 0)
        const ratio = targetCalories / currentCalories

        foods.forEach(food => {
            food.quantity = Math.round(food.quantity * ratio * 10) / 10
            food.calories = Math.round(food.calories * ratio)
            food.protein = Math.round(food.protein * ratio * 10) / 10
            food.carbs = Math.round(food.carbs * ratio * 10) / 10
            food.fat = Math.round(food.fat * ratio * 10) / 10
        })
    }

    /**
     * Calculate macro targets
     */
    private calculateMacros(): { protein: number; carbs: number; fats: number } {
        const calories = this.profile.target_calories
        const goal = this.profile.fitness_goal

        let proteinPercent, carbsPercent, fatsPercent

        switch (goal) {
            case 'build_muscle':
                proteinPercent = 0.30
                carbsPercent = 0.45
                fatsPercent = 0.25
                break
            case 'lose_weight':
                proteinPercent = 0.35
                carbsPercent = 0.35
                fatsPercent = 0.30
                break
            case 'increase_strength':
                proteinPercent = 0.30
                carbsPercent = 0.50
                fatsPercent = 0.20
                break
            default:
                proteinPercent = 0.25
                carbsPercent = 0.45
                fatsPercent = 0.30
        }

        return {
            protein: Math.round((calories * proteinPercent) / 4),
            carbs: Math.round((calories * carbsPercent) / 4),
            fats: Math.round((calories * fatsPercent) / 9),
        }
    }

    /**
     * Distribute calories across meals
     */
    private distributeMealCalories(): { breakfast: number; lunch: number; snack: number; dinner: number } {
        const total = this.profile.target_calories

        return {
            breakfast: Math.round(total * 0.25),
            lunch: Math.round(total * 0.35),
            snack: Math.round(total * 0.15),
            dinner: Math.round(total * 0.25),
        }
    }

    /**
     * Generate shopping list
     */
    private generateShoppingList(weeklySchedule: DailyMealPlan[]): ShoppingItem[] {
        const items: Map<string, ShoppingItem> = new Map()

        weeklySchedule.forEach(day => {
            day.meals.forEach(meal => {
                meal.foods.forEach(food => {
                    const key = food.food_name
                    if (items.has(key)) {
                        const item = items.get(key)!
                        item.quantity += food.quantity
                    } else {
                        items.set(key, {
                            item_name: food.food_name,
                            bangla_name: food.bangla_name,
                            quantity: food.quantity,
                            unit: food.unit,
                            category: this.getFoodCategory(food.food_name),
                        })
                    }
                })
            })
        })

        return Array.from(items.values())
    }

    /**
     * Get food category
     */
    private getFoodCategory(foodName: string): string {
        for (const [category, foods] of Object.entries(BANGLADESHI_FOODS)) {
            if (foods.some(f => f.name === foodName)) {
                return category
            }
        }
        return 'other'
    }

    /**
     * Get dietary restrictions
     */
    private getDietaryRestrictions(): string[] {
        const restrictions = []

        if (this.profile.dietary_preference !== 'none') {
            restrictions.push(this.profile.dietary_preference)
        }

        restrictions.push(...this.profile.food_allergies)

        return restrictions
    }

    /**
     * Generate plan name
     */
    private generatePlanName(): string {
        const goalNames: Record<string, string> = {
            build_muscle: 'Muscle Building',
            lose_weight: 'Weight Loss',
            increase_strength: 'Strength',
            maintain_fitness: 'Maintenance',
        }

        return `${goalNames[this.profile.fitness_goal] || 'Custom'} Meal Plan - ${this.profile.target_calories} cal`
    }

    /**
     * Get recipe notes
     */
    private getRecipeNotes(mealType: string): string {
        const notes: Record<string, string> = {
            breakfast: 'Start your day with a balanced meal. Prepare the night before if short on time.',
            lunch: 'Main meal of the day. Ensure proper portion sizes and include vegetables.',
            snack: 'Keep it light and nutritious. Great for pre or post-workout.',
            dinner: 'Lighter than lunch. Avoid heavy carbs if trying to lose weight.',
        }

        return notes[mealType] || ''
    }

    /**
     * Get meal prep tips
     */
    private getMealPrepTips(): string[] {
        return [
            'Cook rice and dal in bulk for the week',
            'Marinate proteins the night before',
            'Pre-cut vegetables and store in airtight containers',
            'Prepare breakfast items on Sunday for the week',
            'Use meal prep containers to portion meals',
            'Keep healthy snacks readily available',
            'Drink water 30 minutes before meals',
            'Follow traditional Bengali cooking methods for authentic taste',
        ]
    }
}

/**
 * Generate meal plan for user
 */
export function generateMealPlan(profile: UserNutritionProfile): WeeklyMealPlan {
    const generator = new MealPlanGenerator(profile)
    return generator.generateWeeklyPlan()
}
