import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session-manager'
import { query } from '@/lib/database'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
    try {
        const userSession = await getCurrentUser() as any
        if (!userSession?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const userId = userSession.id

        // Get user targets
        const userRes = await query(`
            SELECT 
                daily_calorie_goal as target_calories,
                primary_goal as fitness_goal,
                2000 as daily_water_goal_ml
            FROM users 
            WHERE id = ?
        `, [userId])

        const user = userRes.data?.[0]

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Calculate macro targets based on goal
        const macros = calculateMacros(user.target_calories || 2000, user.fitness_goal || 'maintain')

        // Get today's tracking data
        const nutritionSummaryRes = await query(`
            SELECT 
                total_calories,
                total_protein,
                total_carbs,
                total_fat,
                total_meals
            FROM daily_nutrition_summary
            WHERE user_id = ? AND date = date('now')
        `, [userId])

        const nutritionSummary = nutritionSummaryRes.data?.[0]

        const progressDataRes = await query(`
            SELECT water_liters
            FROM user_progress
            WHERE user_id = ? AND date = date('now')
        `, [userId])

        const progressData = progressDataRes.data?.[0]

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
            meals_planned: 4,
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
        case 'gain_muscle':
        case 'build_muscle':
            proteinPercent = 0.30
            carbsPercent = 0.45
            fatsPercent = 0.25
            break
        case 'lose_weight':
        case 'fat_loss':
            proteinPercent = 0.35
            carbsPercent = 0.35
            fatsPercent = 0.30
            break
        case 'increase_strength':
        case 'strength':
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
