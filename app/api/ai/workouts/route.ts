import { NextRequest, NextResponse } from 'next/server'
import { selectQuery, executeMutation } from '@/lib/d1'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const runtime = 'edge'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

/**
 * AI-Powered Workout Plan Generation
 * POST /api/ai/workouts
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

    // Fetch available exercises
    const exercises = await selectQuery(
      'SELECT name, difficulty, muscle_group, equipment_needed, safety_instruction, gif_url FROM exercise_library ORDER BY RANDOM() LIMIT 50'
    )

    // Fetch recent workouts for context
    const recentWorkouts = await selectQuery(
      'SELECT type, date FROM workouts WHERE user_id = ? AND date < ? ORDER BY date DESC LIMIT 10',
      [user_id, date]
    )

    // Calculate BMI for safety
    const heightM = user.height_cm / 100
    const bmi = user.weight_kg / (heightM * heightM)
    const isHighImpactSafe = bmi < 30

    // Build AI prompt
    const exercisesList = exercises.map((e: any) =>
      `${e.name}: ${e.muscle_group} (${e.difficulty}), Equipment: ${e.equipment_needed}`
    ).join('\n')

    const recentWorkoutsList = recentWorkouts.length > 0
      ? recentWorkouts.map((w: any) => `${w.date}: ${w.type}`).join('\n')
      : 'No recent workouts'

    const prompt = `You are a certified fitness coach. Create a personalized workout plan.

User Profile:
- Age: ${user.age}, Gender: ${user.gender}
- Weight: ${user.weight_kg}kg, Height: ${user.height_cm}cm, BMI: ${bmi.toFixed(1)}
- Goal: ${user.goal}
- Activity Level: ${user.activity_level}
- High Impact Safe: ${isHighImpactSafe}

Available Exercises:
${exercisesList}

Recent Workouts (for variety):
${recentWorkoutsList}

Create a personalized workout plan with 3-5 exercises that:
1. Aligns with goal: ${user.goal}
2. Matches fitness level: ${user.activity_level}
3. Is safe for BMI: ${bmi.toFixed(1)} ${!isHighImpactSafe ? '(avoid high impact)' : ''}
4. Provides progressive overload
5. Avoids repetition from recent workouts
6. Includes proper sets, reps, and rest periods

Respond ONLY with valid JSON:
{
  "workouts": [
    {
      "exercise_name": "Exercise name",
      "muscle_group": "chest|back|legs|arms|core|cardio",
      "difficulty": "beginner|intermediate|advanced",
      "sets": 0,
      "reps": "8-12",
      "rest": "60s",
      "equipment": "equipment needed",
      "reason": "Why this exercise fits their goals",
      "form_tip": "Key form instruction"
    }
  ],
  "workout_duration": "45-60 minutes",
  "ai_insights": "Brief personalized insight about this workout"
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

    const workoutPlan = JSON.parse(jsonStr)

    // Find matching exercises in database and save
    const savedWorkouts = []
    for (const workout of workoutPlan.workouts) {
      // Try to find matching exercise
      const matchingExercise = exercises.find((e: any) =>
        e.name.toLowerCase().includes(workout.exercise_name.toLowerCase()) ||
        workout.exercise_name.toLowerCase().includes(e.name.toLowerCase())
      )

      const exerciseName = matchingExercise ? matchingExercise.name : workout.exercise_name

      await executeMutation(
        'INSERT INTO workouts (user_id, date, type, completed) VALUES (?, ?, ?, 0)',
        [user_id, date, exerciseName]
      )

      savedWorkouts.push({
        exercise: exerciseName,
        muscle_group: workout.muscle_group,
        difficulty: workout.difficulty,
        sets: workout.sets,
        reps: workout.reps,
        rest: workout.rest,
        reason: workout.reason,
        form_tip: workout.form_tip
      })
    }

    return NextResponse.json({
      success: true,
      plan: savedWorkouts,
      summary: {
        workout_duration: workoutPlan.workout_duration || '45-60 minutes',
        total_exercises: savedWorkouts.length
      },
      ai_insights: workoutPlan.ai_insights || 'AI-generated personalized workout plan'
    })

  } catch (error: any) {
    console.error('AI Workout Generation Error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'AI workout generation failed' },
      { status: 500 }
    )
  }
}
