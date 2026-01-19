import { NextRequest, NextResponse } from 'next/server'
import { selectQuery, executeMutation } from '@/lib/d1'

export const runtime = 'edge'

// Generate simple meal plan
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { user_id?: number; date?: string }
    const { user_id, date } = body

    if (!user_id || !date) {
      return NextResponse.json({ success: false, error: 'User ID and date required' }, { status: 400 })
    }

    // Get user info
    const users = await selectQuery('SELECT * FROM users WHERE id = ? LIMIT 1', [user_id])
    if (users.length === 0) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    const user = users[0]
    const targetCalories = user.target_calories || 2000

    // Clear existing meal plans for this date
    await executeMutation('DELETE FROM meal_plans WHERE user_id = ? AND date = ?', [user_id, date])

    // Simple meal templates
    const mealTemplates = [
      { type: 'breakfast', foods: [1, 45, 38] }, // Rice, Egg, Tea
      { type: 'lunch', foods: [10, 25, 15] },     // Biryani, Fish, Vegetable
      { type: 'snack', foods: [33, 44] },          // Muri, Banana
      { type: 'dinner', foods: [6, 5, 21, 40] }  // Chicken, Dal, Vegetable, Yogurt
    ]

    const generatedMeals = []

    for (const meal of mealTemplates) {
      for (const foodId of meal.foods) {
        // Get food details
        const foodResult = await selectQuery('SELECT * FROM food_items WHERE id = ? LIMIT 1', [foodId])
        if (foodResult.length > 0) {
          const food = foodResult[0]
          
          // Insert meal plan
          await executeMutation(
            'INSERT INTO meal_plans (user_id, date, meal_type, food_id, quantity, is_generated) VALUES (?, ?, ?, ?, ?, 1)',
            [user_id, date, meal.type, foodId, 1]
          )

          generatedMeals.push({
            meal_type: meal.type,
            food: food.name,
            bangla_name: food.bangla_name,
            calories: food.calories,
            protein: food.protein,
            carbs: food.carbs,
            fat: food.fat,
            category: food.category
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Meal plan generated successfully',
      data: {
        user_id,
        date,
        target_calories: targetCalories,
        meals: generatedMeals
      }
    })

  } catch (error) {
    console.error('API Error [POST /meal-plans/generate]:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}