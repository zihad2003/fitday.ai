import { NextRequest, NextResponse } from 'next/server'
import { getUserSession } from '@/lib/auth'
import { getDb } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const session = await getUserSession()
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const db = getDb()

        // Get user targets
        const user = await db
            .prepare(`
        SELECT 
          target_calories,
          fitness_goal,
          daily_water_goal_ml
        FROM users 
        WHERE id = ?
      `)
            .bind(session.userId)
            .first()

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Calculate macro targets based on goal
        const macros = calculateMacros(user.target_calories, user.fitness_goal)

        // Get today's tracking data from VIEW and user_progress
        const nutritionSummary = await db
            .prepare(`
        SELECT 
          total_calories,
          total_protein,
          total_carbs,
          total_fat,
          total_meals
        FROM daily_nutrition_summary
        WHERE user_id = ? AND date = date('now')
      `)
            .bind(session.userId)
            .first()

        const progressData = await db
            .prepare(`
        SELECT water_liters
        FROM user_progress
        WHERE user_id = ? AND date = date('now')
      `)
            .bind(session.userId)
            .first()

        const data = {
            calories_consumed: nutritionSummary?.total_calories || 0,
            calories_target: user.target_calories || 2000,
            protein_consumed: nutritionSummary?.total_protein || 0,
            protein_target: macros.protein,
            carbs_consumed: nutritionSummary?.total_carbs || 0,
            carbs_target: macros.carbs,
            fats_consumed: nutritionSummary?.total_fat || 0,
            fats_target: macros.fats,
            water_ml: (progressData?.water_liters || 0) * 1000,
            water_target: user.daily_water_goal_ml || 2000,
            meals_logged: nutritionSummary?.total_meals || 0,
            meals_planned: 4, // Default to 4 meals
        }

        return NextResponse.json({
            success: true,
            data
        })

    } catch (error) {
        console.error('Daily nutrition error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch daily nutrition' },
            { status: 500 }
        )
    }
}

function calculateMacros(calories: number, goal: string) {
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
