import { NextRequest, NextResponse } from 'next/server'
import { mutate, query } from '@/lib/database'
import { getCurrentUser } from '@/lib/session-manager'
import { MealPlanner } from '@/lib/meal-planner'
import { WorkoutPlanner } from '@/lib/workout-planner'

export const runtime = 'nodejs'

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
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await request.json() as OnboardingRequestData

        // Update user profile with onboarding data
        const updateQuery = `
            UPDATE users SET
                age = ?,
                gender = ?,
                height = ?,
                weight = ?,
                primary_goal = ?,
                daily_calorie_goal = ?,
                activity_level = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `

        await mutate(updateQuery, [
            data.age,
            data.gender,
            data.height_cm,
            data.weight_kg,
            data.goal,
            data.target_calories,
            data.activity_level,
            user.id
        ])

        // Generate and save the persistent meal plan using the new engine
        await MealPlanner.generateAndSaveWeeklyPlan(
            user.id!,
            data.target_calories,
            data.goal
        )

        // Generate and save the persistent workout plan using the new engine
        await WorkoutPlanner.generateAndSaveWeeklyPlan(
            user.id!,
            data.goal,
            data.activity_level,
            'gym'
        )

        // Create initial daily tracking entry (user_progress)
        const existProgress = await query("SELECT id FROM user_progress WHERE user_id = ? AND date = date('now')", [user.id])

        if (!existProgress.data?.length) {
            await mutate("INSERT INTO user_progress (user_id, date, weight) VALUES (?, date('now'), ?)", [user.id, data.weight_kg])
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
