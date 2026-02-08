import { NextRequest, NextResponse } from 'next/server'
import { selectQuery } from '@/lib/d1'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const runtime = 'nodejs'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

/**
 * AI-Powered Personalized Suggestions
 * GET /api/ai/suggestions?user_id=1&type=food|exercise|lifestyle
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const suggestionType = searchParams.get('type') || 'lifestyle' // food, exercise, lifestyle

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 })
    }

    // Fetch user profile
    const users = await selectQuery('SELECT * FROM users WHERE id = ?', [Number(userId)])
    if (users.length === 0) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }
    const user = users[0] as any

    // Fetch recent progress data
    const today = new Date().toISOString().split('T')[0]
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weekAgoStr = weekAgo.toISOString().split('T')[0]

    const [progressData, mealsData, workoutsData] = await Promise.all([
      selectQuery(
        'SELECT * FROM user_progress WHERE user_id = ? AND date >= ? ORDER BY date DESC LIMIT 7',
        [Number(userId), weekAgoStr]
      ),
      selectQuery(
        'SELECT * FROM meals WHERE user_id = ? AND date >= ? ORDER BY date DESC LIMIT 20',
        [Number(userId), weekAgoStr]
      ),
      selectQuery(
        'SELECT * FROM workouts WHERE user_id = ? AND date >= ? ORDER BY date DESC LIMIT 20',
        [Number(userId), weekAgoStr]
      )
    ])

    // Calculate BMI
    const heightM = user.height_cm / 100
    const bmi = user.weight_kg / (heightM * heightM)

    // Build context for AI
    const userContext = {
      name: user.name,
      age: user.age,
      gender: user.gender,
      weight: user.weight_kg,
      height: user.height_cm,
      bmi: bmi.toFixed(1),
      goal: user.goal,
      activityLevel: user.activity_level,
      targetCalories: user.target_calories,
      recentMeals: mealsData.length,
      recentWorkouts: workoutsData.length,
      progressTrend: progressData.length > 1 
        ? (progressData[0] as any).weight_kg - (progressData[progressData.length - 1] as any).weight_kg
        : 0
    }

    let prompt = ''
    let systemContext = ''

    switch (suggestionType) {
      case 'food':
        systemContext = `You are a nutrition expert specializing in Bangladeshi cuisine. Provide personalized meal suggestions based on the user's profile, goals, and cultural preferences.`
        prompt = `User Profile:
- Name: ${userContext.name}
- Age: ${userContext.age}, Gender: ${userContext.gender}
- Weight: ${userContext.weight}kg, Height: ${userContext.height}cm, BMI: ${userContext.bmi}
- Goal: ${userContext.goal}
- Target Calories: ${userContext.targetCalories} kcal/day
- Activity Level: ${userContext.activityLevel}
- Recent meals logged: ${userContext.recentMeals}
- Weight trend: ${userContext.progressTrend > 0 ? 'Gaining' : userContext.progressTrend < 0 ? 'Losing' : 'Stable'}

Provide 3-5 personalized Bangladeshi food suggestions for today that:
1. Align with their goal (${userContext.goal})
2. Fit within their calorie target
3. Include authentic Bangladeshi dishes (ভাত, ডাল, মাছ, মাংস, সবজি)
4. Consider their recent eating patterns
5. Provide variety and nutritional balance

Format as JSON:
{
  "suggestions": [
    {
      "meal_type": "breakfast|lunch|snack|dinner",
      "food_name": "English name",
      "bangla_name": "বাংলা নাম",
      "calories": 0,
      "protein": 0,
      "carbs": 0,
      "fat": 0,
      "reason": "Why this is good for them"
    }
  ],
  "tips": ["tip1", "tip2", "tip3"]
}`
        break

      case 'exercise':
        systemContext = `You are a fitness coach specializing in personalized workout recommendations. Provide exercise suggestions based on user's fitness level, goals, and progress.`
        prompt = `User Profile:
- Name: ${userContext.name}
- Age: ${userContext.age}, Gender: ${userContext.gender}
- Weight: ${userContext.weight}kg, Height: ${userContext.height}cm, BMI: ${userContext.bmi}
- Goal: ${userContext.goal}
- Activity Level: ${userContext.activityLevel}
- Recent workouts completed: ${userContext.recentWorkouts}
- Weight trend: ${userContext.progressTrend > 0 ? 'Gaining' : userContext.progressTrend < 0 ? 'Losing' : 'Stable'}

Provide 3-5 personalized exercise/workout suggestions for today that:
1. Align with their goal (${userContext.goal})
2. Match their fitness level (${userContext.activityLevel})
3. Consider their BMI and safety (BMI: ${userContext.bmi})
4. Provide variety and progressive overload
5. Include proper form tips

Format as JSON:
{
  "suggestions": [
    {
      "exercise_name": "Exercise name",
      "muscle_group": "chest|back|legs|arms|core|cardio",
      "difficulty": "beginner|intermediate|advanced",
      "sets": 0,
      "reps": "8-12",
      "rest": "60s",
      "reason": "Why this exercise is good for them",
      "form_tip": "Key form tip"
    }
  ],
  "tips": ["tip1", "tip2", "tip3"]
}`
        break

      case 'lifestyle':
      default:
        systemContext = `You are a holistic wellness coach specializing in lifestyle optimization for fitness and health. Provide comprehensive lifestyle suggestions.`
        prompt = `User Profile:
- Name: ${userContext.name}
- Age: ${userContext.age}, Gender: ${userContext.gender}
- Weight: ${userContext.weight}kg, Height: ${userContext.height}cm, BMI: ${userContext.bmi}
- Goal: ${userContext.goal}
- Activity Level: ${userContext.activityLevel}
- Recent meals: ${userContext.recentMeals}, Recent workouts: ${userContext.recentWorkouts}
- Weight trend: ${userContext.progressTrend > 0 ? 'Gaining' : userContext.progressTrend < 0 ? 'Losing' : 'Stable'}

Provide comprehensive lifestyle suggestions covering:
1. Sleep optimization (hours, quality tips)
2. Hydration (daily water intake, timing)
3. Stress management (techniques, mindfulness)
4. Meal timing (when to eat for optimal results)
5. Recovery (rest days, active recovery)
6. Motivation and consistency tips

Format as JSON:
{
  "sleep": {
    "recommended_hours": 0,
    "tips": ["tip1", "tip2"]
  },
  "hydration": {
    "recommended_liters": 0,
    "tips": ["tip1", "tip2"]
  },
  "stress_management": {
    "techniques": ["technique1", "technique2"],
    "tips": ["tip1", "tip2"]
  },
  "meal_timing": {
    "breakfast_time": "07:00-08:00",
    "lunch_time": "12:00-13:00",
    "dinner_time": "19:00-20:00",
    "tips": ["tip1", "tip2"]
  },
  "recovery": {
    "rest_days_per_week": 0,
    "active_recovery_suggestions": ["suggestion1", "suggestion2"],
    "tips": ["tip1", "tip2"]
  },
  "motivation": {
    "daily_quote": "Motivational quote",
    "consistency_tips": ["tip1", "tip2", "tip3"]
  },
  "weekly_focus": "Main focus area for this week"
}`
        break
    }

    // Call Gemini AI
    const result = await model.generateContent(`${systemContext}\n\n${prompt}`)
    const response = result.response
    const text = response.text()

    // Parse JSON from response (handle markdown code blocks)
    let jsonStr = text
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      jsonStr = jsonMatch[0]
    }

    try {
      const suggestions = JSON.parse(jsonStr)

      return NextResponse.json({
        success: true,
        type: suggestionType,
        data: suggestions,
        generated_at: new Date().toISOString()
      })
    } catch (parseError) {
      // Fallback: return structured text response
      return NextResponse.json({
        success: true,
        type: suggestionType,
        data: {
          raw_response: text,
          note: 'AI response could not be parsed as JSON, returning raw text'
        },
        generated_at: new Date().toISOString()
      })
    }

  } catch (error: any) {
    console.error('AI Suggestions Error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'AI service unavailable' },
      { status: 500 }
    )
  }
}
