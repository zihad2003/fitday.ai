/**
 * FitDay AI - Intelligent Meal Planner
 * Integrates with D1 Database for persistent meal scheduling
 */

import { query, mutate } from './database'

export interface FoodItem {
    id: number
    name: string
    bangla_name: string
    serving_unit: string
    calories: number
    protein: number
    carbs: number
    fat: number
    category: string
}

export class MealPlanner {
    /**
     * Save a generated meal plan to the database
     */
    static async saveMealPlan(userId: number, date: string, mealType: string, foodId: number, quantity: number) {
        await mutate(`
            INSERT INTO meal_plans (user_id, date, meal_type, food_id, quantity)
            VALUES (?, ?, ?, ?, ?)
        `, [userId, date, mealType, foodId, quantity])
    }

    /**
     * Automatically generate and persist a meal plan based on user goals
     */
    static async generateAndSaveWeeklyPlan(userId: number, targetCalories: number, goal: string) {
        // 1. Fetch available foods
        const res = await query("SELECT * FROM food_items")
        const foods = (res.data || []) as unknown as FoodItem[]

        if (!foods || foods.length === 0) {
            console.warn("No food items found in database.")
            return
        }

        // Categorize foods for smarter selection
        const categorized = {
            breakfast: foods.filter(f => ['carb', 'protein', 'fruit'].includes(f.category) && !['Biryani', 'Tehari', 'Beef', 'Mutton'].some(n => f.name.includes(n))),
            lunch: foods.filter(f => ['carb', 'protein', 'vegetable'].includes(f.category)),
            snack: foods.filter(f => ['snack', 'fruit', 'beverage'].includes(f.category)),
            dinner: foods.filter(f => ['carb', 'protein', 'vegetable'].includes(f.category) && f.calories < 400),
        }

        // 2. Clear existing plan for the next 7 days
        await mutate(`
            DELETE FROM meal_plans 
            WHERE user_id = ? AND date >= date('now')
        `, [userId])

        const dates = Array.from({ length: 7 }).map((_, i) => {
            const d = new Date()
            d.setDate(d.getDate() + i)
            return d.toISOString().split('T')[0]
        })

        for (const date of dates) {
            const plan = [
                { type: 'breakfast', target: targetCalories * 0.25 },
                { type: 'lunch', target: targetCalories * 0.35 },
                { type: 'snack', target: targetCalories * 0.15 },
                { type: 'dinner', target: targetCalories * 0.25 },
            ]

            for (const meal of plan) {
                const pool = (categorized as any)[meal.type] || foods
                if (pool.length === 0) continue

                // Pick 2 random items for major meals, 1 for snack
                const iterations = meal.type === 'snack' ? 1 : 2
                for (let i = 0; i < iterations; i++) {
                    const food = pool[Math.floor(Math.random() * pool.length)]
                    const portionTarget = meal.target / iterations
                    const quantity = Math.max(0.5, parseFloat((portionTarget / food.calories).toFixed(1)))

                    await this.saveMealPlan(userId, date, meal.type, food.id, quantity)
                }
            }
        }
    }
}
