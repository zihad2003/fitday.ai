import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'
import { MealPlanner } from '@/lib/meal-planner'
import { SubscriptionService } from '@/lib/subscription'
import { getCurrentUser } from '@/lib/session-manager'

export const runtime = 'nodejs'

/**
 * AI Meal Plan API
 * POST /api/ai/meal-plan
 * Triggers re-generation and persistence of meal plan
 */
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        // Check credits
        const { allowed } = await SubscriptionService.consumeCredit(user.id!)
        if (!allowed) {
            return NextResponse.json({
                success: false,
                error: 'AI Credits exhausted. Upgrade to Premium.',
                code: 'CREDIT_LIMIT_REACHED'
            }, { status: 402 })
        }

        // Use the new MealPlanner to generate and save a 7-day plan
        await MealPlanner.generateAndSaveWeeklyPlan(
            user.id!,
            user.daily_calorie_goal || 2000,
            user.primary_goal || 'maintain'
        )

        return NextResponse.json({
            success: true,
            message: '7-Day Neural Meal Plan generated and persisted successfully'
        })

    } catch (error: any) {
        console.error('Meal Plan API Error:', error)
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to generate meal plan' },
            { status: 500 }
        )
    }
}
