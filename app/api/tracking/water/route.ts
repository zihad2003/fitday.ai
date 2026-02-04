import { NextRequest, NextResponse } from 'next/server'
import { getUserSession } from '@/lib/auth'
import { getDb } from '@/lib/db'

export async function POST(request: NextRequest) {
    try {
        const session = await getUserSession()
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { amount_ml } = await request.json()
        const db = getDb()

        // Update today's water intake
        const query = `
      INSERT INTO daily_tracking (user_id, date, water_ml)
      VALUES (?, date('now'), ?)
      ON CONFLICT(user_id, date) DO UPDATE SET
        water_ml = water_ml + excluded.water_ml,
        updated_at = CURRENT_TIMESTAMP
    `

        await db.prepare(query).bind(session.userId, amount_ml).run()

        // Get updated total
        const result = await db
            .prepare('SELECT water_ml FROM daily_tracking WHERE user_id = ? AND date = date("now")')
            .bind(session.userId)
            .first()

        return NextResponse.json({
            success: true,
            total_water_ml: result?.water_ml || amount_ml,
        })
    } catch (error) {
        console.error('Water logging error:', error)
        return NextResponse.json({ error: 'Failed to log water' }, { status: 500 })
    }
}

export async function GET(request: NextRequest) {
    try {
        const session = await getUserSession()
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const db = getDb()

        // Get user goal and today's intake
        const userData = await db
            .prepare(`
                SELECT t.water_ml, u.daily_water_goal_ml 
                FROM daily_tracking t
                JOIN users u ON u.id = t.user_id
                WHERE t.user_id = ? AND t.date = date("now")
            `)
            .bind(session.userId)
            .first()

        const currentIntake = userData?.water_ml || 0
        // Default goal 2500 if not set
        const dailyGoal = userData?.daily_water_goal_ml || 2500

        // Calculate Streak
        // Fetch last 30 days of tracking
        const history = await db
            .prepare(`
                SELECT date, water_ml, 
                       (SELECT daily_water_goal_ml FROM users WHERE id = ?) as goal
                FROM daily_tracking 
                WHERE user_id = ? 
                AND date < date('now')
                ORDER BY date DESC 
                LIMIT 30
            `)
            .bind(session.userId, session.userId)
            .all()

        let streak = 0
        const today = new Date()

        // Simple streak logic: Check yesterday, then day before...
        // Note: This relies on contiguous records or logic to handle gaps.
        // For robustness, we iterate dates backwards.

        for (let i = 1; i <= 30; i++) {
            const d = new Date(today)
            d.setDate(today.getDate() - i)
            const dateStr = d.toISOString().split('T')[0]

            const record = history.results.find((r: any) => r.date === dateStr)

            if (record && (record as any).water_ml >= (record as any).goal) {
                streak++
            } else {
                break
            }
        }

        // If today goal is met, streak + 1 (visually) or keep previous streak
        // Usually streak implies completed days. We can return "current streak"
        // If today is done, maybe show streak + 1? simpler to just show completed days.

        return NextResponse.json({
            water_ml: currentIntake,
            goal: dailyGoal,
            streak: streak,
            goal_met: currentIntake >= dailyGoal
        })
    } catch (error) {
        console.error('Water fetch error:', error)
        return NextResponse.json({ error: 'Failed to fetch water data' }, { status: 500 })
    }
}
