import { NextRequest, NextResponse } from 'next/server'
import { selectQuery, executeMutation } from '@/lib/d1'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const runtime = 'edge'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

/**
 * AI-Powered Meal Plan Generation
 * POST /api/ai/meals
 * Body: { user_id, date }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { user_id: number; date: string }
    const { user_id, date } = body

    if (!user_id || !date) {
      return NextResponse.json({ success: false, error: 'User ID and date required' }, { status: 400 })
    }

    // Fetch user profile
    const users = await selectQuery('SELECT * FROM users WHERE id = ?', [user_id])
    if (users.length === 0) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }
    const user = users[0] as any

    // Fetch available Bangladeshi foods
    const foods = await selectQuery(
      'SELECT name, bangla_name, calories, protein, carbs, fat, category FROM food_items ORDER BY RANDOM() LIMIT 50'
    )

    // Fetch recent meals for context
    const recentMeals = await selectQuery(
      'SELECT food, meal_type, calories FROM meals WHERE user_id = ? AND date < ? ORDER BY date DESC LIMIT 10',
      [user_id, date]
    )

    // Calculate BMI and nutritional needs
    const heightM = user.height_cm / 100
    const bmi = user.weight_kg / (heightM * heightM)
    
    // BMR Calculation
    let bmr = 10 * user.weight_kg + 6.25 * user.height_cm - 5 * user.age
    bmr += user.gender === 'male' ? 5 : -161
    
    const activityMultipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    }
    
    let targetCals = bmr * (activityMultipliers[user.activity_level] || 1.2)
    if (user.goal === 'lose_weight') targetCals -= 500
    if (user.goal === 'gain_muscle') targetCals += 300

    // Build AI prompt
    const foodsList = foods.map((f: any) => 
      `${f.name} (${f.bangla_name || f.name}): ${f.calories} cal, ${f.protein}g protein, ${f.carbs}g carbs, ${f.fat}g fat - ${f.category}`
    ).join('\n')

    const recentMealsList = recentMeals.length > 0
      ? recentMeals.map((m: any) => `${m.meal_type}: ${m.food} (${m.calories} cal)`).join('\n')
      : 'No recent meals'

    const prompt = `You are a nutritionist specializing in Bangladeshi cuisine. Create a personalized meal plan.

User Profile:
- Age: ${user.age}, Gender: ${user.gender}
- Weight: ${user.weight_kg}kg, Height: ${user.height_cm}cm, BMI: ${bmi.toFixed(1)}
- Goal: ${user.goal}
- Activity Level: ${user.activity_level}
- Target Calories: ${Math.round(targetCals)} kcal/day

Available Bangladeshi Foods:
${foodsList}

Recent Meals (for variety):
${recentMealsList}

Create a complete daily meal plan with 4 meals (breakfast, lunch, snack, dinner) that:
1. Totals approximately ${Math.round(targetCals)} calories
2. Includes authentic Bangladeshi dishes
3. Provides balanced macronutrients (protein, carbs, fats)
4. Aligns with goal: ${user.goal}
5. Avoids repetition from recent meals
6. Is culturally appropriate and realistic

Respond ONLY with valid JSON:
{
  "meals": [
    {
      "meal_type": "breakfast|lunch|snack|dinner",
      "food_name": "English name",
      "bangla_name": "বাংলা নাম",
      "calories": 0,
      "protein": 0,
      "carbs": 0,
      "fat": 0,
      "reason": "Why this meal fits their goals"
    }
  ],
  "total_calories": 0,
  "total_protein": 0,
  "total_carbs": 0,
  "total_fat": 0,
  "ai_insights": "Brief personalized insight about this meal plan"
}`

    // Call Gemini AI
    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    // Parse JSON
    let jsonStr = text
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      jsonStr = jsonMatch[0]
    }

    const mealPlan = JSON.parse(jsonStr)

    // Save meals to database
    const savedMeals = []
    for (const meal of mealPlan.meals) {
      // Try to find matching food in database
      const matchingFood = foods.find((f: any) => 
        f.name.toLowerCase().includes(meal.food_name.toLowerCase()) ||
        f.bangla_name?.includes(meal.bangla_name)
      )

      const foodName = matchingFood ? matchingFood.name : meal.food_name
      const calories = matchingFood ? matchingFood.calories : meal.calories
      const protein = matchingFood ? matchingFood.protein : meal.protein
      const carbs = matchingFood ? matchingFood.carbs : meal.carbs
      const fat = matchingFood ? matchingFood.fat : meal.fat

      await executeMutation(
        `INSERT INTO meals (user_id, date, meal_type, food, calories, protein, carbs, fat, completed)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
        [user_id, date, meal.meal_type, foodName, calories, protein, carbs, fat]
      )

      savedMeals.push({
        meal_type: meal.meal_type,
        food: foodName,
        calories,
        protein,
        carbs,
        fat
      })
    }

    return NextResponse.json({
      success: true,
      plan: savedMeals,
      summary: {
        total_calories: mealPlan.total_calories || savedMeals.reduce((sum, m) => sum + m.calories, 0),
        total_protein: mealPlan.total_protein || savedMeals.reduce((sum, m) => sum + m.protein, 0),
        total_carbs: mealPlan.total_carbs || savedMeals.reduce((sum, m) => sum + m.carbs, 0),
        total_fat: mealPlan.total_fat || savedMeals.reduce((sum, m) => sum + m.fat, 0)
      },
      ai_insights: mealPlan.ai_insights || 'AI-generated personalized meal plan'
    })

  } catch (error: any) {
    console.error('AI Meal Generation Error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'AI meal generation failed' },
      { status: 500 }
    )
  }
}
