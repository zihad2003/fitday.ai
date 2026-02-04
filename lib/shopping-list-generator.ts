/**
 * Shopping List Generator
 * Aggregates ingredients from a meal plan into a categorized shopping list
 */

import { Ingredient, MealSuggestion } from './smart-food-suggester'

interface ShoppingItem {
    id: string
    name: string
    quantity: number
    unit: string
    category: string
    estimated_cost_bdt: number
    checked: boolean
}

interface ShoppingCategory {
    name: string
    items: ShoppingItem[]
}

interface ShoppingList {
    categories: ShoppingCategory[]
    total_items: number
    total_estimated_cost: number
    start_date: string
    end_date: string
}

export class ShoppingListGenerator {
    /**
     * Generate a weekly shopping list from a daily plan (assuming 7 days)
     */
    static generateFromDailyPlan(dailyPlan: any[]): ShoppingList {
        const ingredientMap = new Map<string, ShoppingItem>()

        // Iterate through each meal in the daily plan
        dailyPlan.forEach((mealSlot: any) => {
            // Assume the first suggestion is the primary choice
            const primaryChoice: MealSuggestion = mealSlot.suggestions[0]
            if (!primaryChoice) return

            primaryChoice.foods.forEach(food => {
                if (!food.ingredients) return

                food.ingredients.forEach(ing => {
                    // Create a unique key for aggregation (Name + Unit)
                    // This prevents adding '1 pc' to '100 g'
                    const key = `${ing.name.toLowerCase()}_${ing.unit.toLowerCase()}`

                    if (ingredientMap.has(key)) {
                        const existing = ingredientMap.get(key)!
                        existing.quantity += ing.quantity * 7 // Weekly multiplier
                    } else {
                        ingredientMap.set(key, {
                            id: key,
                            name: ing.name,
                            quantity: ing.quantity * 7, // Weekly multiplier
                            unit: ing.unit,
                            category: ing.category,
                            estimated_cost_bdt: this.estimateCost(ing.name, ing.quantity * 7, ing.unit),
                            checked: false
                        })
                    }
                })
            })
        })

        // Group by category
        const categoriesMap = new Map<string, ShoppingItem[]>()

        ingredientMap.forEach(item => {
            // Round quantity to 1 decimal place
            item.quantity = Math.round(item.quantity * 10) / 10

            if (!categoriesMap.has(item.category)) {
                categoriesMap.set(item.category, [])
            }
            categoriesMap.get(item.category)!.push(item)
        })

        // Sort categories and items
        const categories: ShoppingCategory[] = []
        const categoryOrder = ['Produce', 'Meat & Fish', 'Dairy & Eggs', 'Pantry', 'Bakery', 'Spices', 'Beverages', 'Other']

        categoryOrder.forEach(catName => {
            if (categoriesMap.has(catName)) {
                categories.push({
                    name: catName,
                    items: categoriesMap.get(catName)!.sort((a, b) => a.name.localeCompare(b.name))
                })
                categoriesMap.delete(catName)
            }
        })

        // Add remaining categories
        categoriesMap.forEach((items, catName) => {
            categories.push({
                name: catName,
                items: items.sort((a, b) => a.name.localeCompare(b.name))
            })
        })

        const totalCost = Array.from(ingredientMap.values()).reduce((sum, item) => sum + item.estimated_cost_bdt, 0)

        const today = new Date()
        const nextWeek = new Date(today)
        nextWeek.setDate(today.getDate() + 7)

        return {
            categories,
            total_items: ingredientMap.size,
            total_estimated_cost: Math.round(totalCost),
            start_date: today.toISOString().split('T')[0],
            end_date: nextWeek.toISOString().split('T')[0]
        }
    }

    /**
     * Rough cost estimation for Bangladesh context (BDT)
     * This is a basic estimator and would ideally fetch real prices
     */
    private static estimateCost(name: string, quantity: number, unit: string): number {
        const nameLower = name.toLowerCase()
        let rate = 0 // Price per unit

        // Basic price mapping (approximate BDT)
        if (nameLower.includes('chicken')) rate = 0.35 // 350 per kg
        else if (nameLower.includes('beef')) rate = 0.75 // 750 per kg
        else if (nameLower.includes('fish') || nameLower.includes('hilsa')) rate = 1.2 // 1200 per kg
        else if (nameLower.includes('rice')) rate = 0.07 // 70 per kg
        else if (nameLower.includes('egg')) rate = 12 // 12 per pc
        else if (nameLower.includes('milk')) rate = 0.09 // 90 per liter
        else if (nameLower.includes('vegetable') || nameLower.includes('spinach')) rate = 0.06 // 60 per kg
        else if (nameLower.includes('almond') || nameLower.includes('nut')) rate = 1.2 // 1200 per kg
        else if (nameLower.includes('oil')) rate = 0.18 // 180 per liter
        else if (nameLower.includes('onion')) rate = 5 // 5 per pc (avg)
        else rate = 0.1 // Default fallback per unit

        return rate * quantity
    }
}
