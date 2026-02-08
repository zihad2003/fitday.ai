import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'
import { getCurrentUser } from '@/lib/session-manager'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
        }

        const historyRes = await query(`
            SELECT w.*, e.name as exercise_name, e.muscle_group, e.gif_url
            FROM workouts w
            JOIN exercise_library e ON w.exercise_id = e.id
            WHERE w.user_id = ? AND w.completed = 1
            ORDER BY w.date DESC, w.created_at DESC
            LIMIT 50
        `, [user.id])

        return NextResponse.json({ success: true, data: historyRes.data || [] })
    } catch (error: any) {
        console.error('Workout History Error:', error)
        return NextResponse.json({ success: false, error: 'Failed to fetch history' }, { status: 500 })
    }
}
