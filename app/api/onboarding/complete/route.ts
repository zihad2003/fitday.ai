import { NextRequest, NextResponse } from 'next/server'
import { getUserSession } from '@/lib/auth'
import { getDb } from '@/lib/db'
import { generateWorkoutPlan } from '@/lib/workout-generator'

interface OnboardingRequestData {
    age: number
    gender: 'male' | 'female' | 'other'
    height_cm: number
    weight_kg: number
    goal: string
    target_calories: number
    bmr: number
    tdee: number
    activity_level: string
    workout_days_per_week?: number
}

export async function POST(request: NextRequest) {
    try {
        const session = await getUserSession()
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await request.json() as OnboardingRequestData
        const db = getDb()

        // Update user profile with onboarding data
        const updateQuery = `
      UPDATE users SET
        age = ?,
        gender = ?,
        height_cm = ?,
        weight_kg = ?,
        goal = ?,
        target_calories = ?,
        bmr = ?,
        tdee = ?,
        activity_level = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `

        await db.prepare(updateQuery).bind(
            data.age,
            data.gender,
            data.height_cm,
            data.weight_kg,
            data.goal,
            data.target_calories,
            data.bmr,
            data.tdee,
            data.activity_level,
            session.userId
        ).run()

        // Generate and save the persistent meal plan using the new engine
        const { MealPlanner } = await import('@/lib/meal-planner')
        await MealPlanner.generateAndSaveWeeklyPlan(
            parseInt(session.userId),
            data.target_calories,
            data.goal
        )

        // Generate and save the persistent workout plan using the new engine
        const { WorkoutPlanner } = await import('@/lib/workout-planner')
        await WorkoutPlanner.generateAndSaveWeeklyPlan(
            parseInt(session.userId),
            data.goal,
            data.activity_level,
            'gym'
        )

        // Create initial daily tracking entry (user_progress)
        // Check if exists first (unlikely for new user but safe)
        const existProgress = await db.prepare("SELECT id FROM user_progress WHERE user_id = ? AND date = date('now')").bind(session.userId).first()

        if (!existProgress) {
            await db.prepare("INSERT INTO user_progress (user_id, date, weight_kg) VALUES (?, date('now'), ?)").bind(session.userId, data.weight_kg).run()
        }

        return NextResponse.json({
            success: true,
            message: 'Onboarding completed successfully',
            data: {
                bmr: data.bmr,
                tdee: data.tdee,
                target_calories: data.target_calories
            }
        })

    } catch (error) {
        console.error('Onboarding error:', error)
        return NextResponse.json(
            { error: 'Failed to complete onboarding' },
            { status: 500 }
        )
    }
}

// Helper function to determine difficulty level
function getDifficultyLevel(activityLevel: string): string {
    switch (activityLevel) {
        case 'sedentary':
        case 'light':
            return 'beginner'
        case 'moderate':
        case 'active':
            return 'intermediate'
        case 'very_active':
            return 'advanced'
        default:
            return 'beginner'
    }
}
