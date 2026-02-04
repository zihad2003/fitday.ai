import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const userId = request.nextUrl.searchParams.get('userId')
        if (!userId) {
            return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 })
        }

        const db = getDb()
        const history = await db.prepare(`
            SELECT w.*, e.name as exercise_name, e.muscle_group, e.gif_url
            FROM workouts w
            JOIN exercise_library e ON w.exercise_id = e.id
            WHERE w.user_id = ? AND w.completed = 1
            ORDER BY w.date DESC, w.created_at DESC
            LIMIT 50
        `).bind(userId).all()

        return NextResponse.json({ success: true, data: history.results })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
