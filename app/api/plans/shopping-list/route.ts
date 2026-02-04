import { NextRequest, NextResponse } from 'next/server'
import { getUserSession } from '@/lib/auth'
import { getDb } from '@/lib/db'
import { ShoppingListGenerator } from '@/lib/shopping-list-generator'

export async function GET(request: NextRequest) {
    try {
        const session = await getUserSession()
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const db = getDb()

        // Fetch active meal plan
        const plan = await db
            .prepare(`
        SELECT plan_data 
        FROM personalized_plans 
        WHERE user_id = ? AND plan_type = 'nutrition' AND status = 'active'
      `)
            .bind(session.userId)
            .first()

        if (!plan || !plan.plan_data) {
            return NextResponse.json({ error: 'No active meal plan found' }, { status: 404 })
        }

        const planData = JSON.parse(plan.plan_data)

        // Generate shopping list from the daily plan structure
        // planData.daily_plan contains the array of meals
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
