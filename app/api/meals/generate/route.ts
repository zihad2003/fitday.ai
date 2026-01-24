import { NextResponse } from 'next/server'
import { selectQuery, executeMutation } from '@/lib/d1'

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    // TypeScript Error Fix: Type casting the incoming body
    const { user_id, date } = (await req.json()) as { user_id: number; date: string }

    // ১. ইউজার প্রোফাইল ফেচ করা
    const users = await selectQuery('SELECT * FROM users WHERE id = ?', [user_id])
    const user = users[0] as any

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' })
    }

    // ২. মেডিকেল লজিক: ক্যালরি ক্যালকুলেশন (Mifflin-St Jeor Equation)
    let bmr = 10 * user.weight_kg + 6.25 * user.height_cm - 5 * user.age
    bmr += user.gender === 'male' ? 5 : -161

    const activityMultipliers: Record<string, number> = {
      sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725
    }

    let targetCals = bmr * (activityMultipliers[user.activity_level] || 1.2)

    // গোল অনুযায়ী ক্যালরি অ্যাডজাস্টমেন্ট
    if (user.goal === 'lose_weight') targetCals -= 500
    if (user.goal === 'gain_muscle') targetCals += 300

    // ৩. খাবার সিলেকশন লজিক (Bangladeshi Context: Combo Meals)
    // We define "slots" but each slot can generate multiple items
    const mealStructure = [
      {
        type: 'breakfast',
        components: [
          { category: 'carb', min: 100, max: 300 }, // Ruti/Paratha
          { category: 'protein', min: 50, max: 150 } // Egg/Dal
        ]
      },
      {
        type: 'lunch',
        components: [
          { category: 'carb', min: 200, max: 400 }, // Rice
          { category: 'protein', min: 100, max: 300 }, // Fish/Chicken
          { category: 'vegetable', min: 50, max: 150 } // Bhorta/Shak
        ]
      },
      {
        type: 'snack',
        components: [
          { category: 'snack', min: 50, max: 250 } // Singara/Fuchka or Fruit (fallback handled in query if needed, or update seed)
        ]
      },
      {
        type: 'dinner',
        components: [
          { category: 'carb', min: 100, max: 300 }, // Ruti/Rice
          { category: 'protein', min: 100, max: 250 } // Chicken/Fish
        ]
      }
    ]

    const generatedPlan = []

    // Clean up old meal plan for this date to avoid duplicates
    // await executeMutation('DELETE FROM meals WHERE user_id = ? AND date = ?', [user_id, date]) 
    // Commented out: The user might want to generate multiple times or just add to it. 
    // But usually regeneration implies replacement. Let's leave it additive for now or safe.

    for (const mealTime of mealStructure) {
      for (const component of mealTime.components) {

        // Try exact category match
        let foods = await selectQuery(
          'SELECT name, calories FROM food_items WHERE category = ? AND calories BETWEEN ? AND ? ORDER BY RANDOM() LIMIT 1',
          [component.category, component.min, component.max]
        )

        // Fallback for snacks if 'snack' category yields nothing, try 'fruit'
        if ((!foods || foods.length === 0) && component.category === 'snack') {
          foods = await selectQuery(
            'SELECT name, calories FROM food_items WHERE category = ? AND calories BETWEEN ? AND ? ORDER BY RANDOM() LIMIT 1',
            ['fruit', component.min, component.max]
          )
        }

        const food = (foods[0] as any) || { name: 'Healthy Option', calories: 150 }

        // ৪. ডাটাবেসে সেভ করা
        const insertQuery = `
          INSERT INTO meals (user_id, date, meal_type, food_name, calories, completed) 
          VALUES (?, ?, ?, ?, ?, 0)
        `
        await executeMutation(insertQuery, [user_id, date, mealTime.type, food.name, food.calories])

        generatedPlan.push({ type: mealTime.type, food: food.name, calories: food.calories })
      }
    }

    return NextResponse.json({ success: true, plan: generatedPlan })

  } catch (error: any) {
    console.error('Meal Gen Error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}