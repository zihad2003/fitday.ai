import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session-manager'
import { query, mutate } from '@/lib/database'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser() as any
        if (!user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const userId = user.id

        // Log a completed workout record
        const today = new Date().toISOString().split('T')[0]

        await mutate(`
            INSERT INTO workouts (user_id, date, exercise_name, completed)
            VALUES (?, ?, ?, ?)
        `, [userId, today, 'Quick Session', 1])

        // Get updated count for the day
        const countRes = await query(`
            SELECT COUNT(*) as count FROM workouts 
            WHERE user_id = ? AND date = ? AND completed = 1
        `, [userId, today])

        const count = countRes.data?.[0]?.count || 1

        return NextResponse.json({
            success: true,
            workouts_completed: count,
            message: 'Great job! Workout logged! 💪',
        })
    } catch (error) {
        console.error('Workout completion error:', error)
        return NextResponse.json({ error: 'Failed to log workout' }, { status: 500 })
    }
}
