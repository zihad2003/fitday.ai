import { NextRequest, NextResponse } from 'next/server'
import { getUserSession } from '@/lib/auth'
import { getDb } from '@/lib/db'

export async function POST(request: NextRequest) {
    try {
        const session = await getUserSession()
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const db = getDb()

        // Increment workouts completed for today
        const query = `
      INSERT INTO daily_tracking (user_id, date, workouts_completed)
      VALUES (?, date('now'), 1)
      ON CONFLICT(user_id, date) DO UPDATE SET
        workouts_completed = workouts_completed + 1,
        updated_at = CURRENT_TIMESTAMP
    `

        await db.prepare(query).bind(session.userId).run()

        // Get updated count
        const result = await db
            .prepare('SELECT workouts_completed FROM daily_tracking WHERE user_id = ? AND date = date("now")')
            .bind(session.userId)
            .first()

        return NextResponse.json({
            success: true,
            workouts_completed: result?.workouts_completed || 1,
            message: 'Great job! Workout logged! 💪',
        })
    } catch (error) {
        console.error('Workout completion error:', error)
        return NextResponse.json({ error: 'Failed to log workout' }, { status: 500 })
    }
}
