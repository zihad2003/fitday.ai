import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { MealPlanner } from '@/lib/meal-planner'
import { SubscriptionService } from '@/lib/subscription'

/**
 * AI Meal Plan API
 * POST /api/ai/meal-plan
 * Triggers re-generation and persistence of meal plan
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as { userId: string | number }
        const { userId } = body

        if (!userId) {
            return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 })
        }

        import { SubscriptionService } from '@/lib/subscription'

        // ...
        const db = getDb()
        const user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(Number(userId)).first() as any

        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
        }

        // Check credits
        const { allowed } = await SubscriptionService.consumeCredit(Number(userId))
        if (!allowed) {
            return NextResponse.json({
                success: false,
                error: 'AI Credits exhausted. Upgrade to Premium.',
                code: 'CREDIT_LIMIT_REACHED'
            }, { status: 402 })
        }

        // Use the new MealPlanner to generate and save a 7-day plan
        await MealPlanner.generateAndSaveWeeklyPlan(
            Number(userId),
            user.target_calories || 2000,
            user.goal || 'maintain'
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
