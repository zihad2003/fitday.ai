import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'
import { getCurrentUser } from '@/lib/session-manager'
import { ShoppingListGenerator } from '@/lib/shopping-list-generator'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Fetch active meal plan
        const planRes = await query(`
            SELECT plan_data 
            FROM personalized_plans 
            WHERE user_id = ? AND plan_type = 'nutrition' AND status = 'active'
        `, [user.id])

        const plan = planRes.data?.[0] as any

        if (!plan || !plan.plan_data) {
            return NextResponse.json({ error: 'No active meal plan found' }, { status: 404 })
        }

        const planData = typeof plan.plan_data === 'string' ? JSON.parse(plan.plan_data) : plan.plan_data

        // Generate shopping list from the daily plan structure
        const list = ShoppingListGenerator.generateFromDailyPlan(planData.daily_plan)

        return NextResponse.json({
            success: true,
            data: list
        })

    } catch (error) {
        console.error('Shopping list fetch error:', error)
        return NextResponse.json(
            { error: 'Failed to generate shopping list' },
            { status: 500 }
        )
    }
}
