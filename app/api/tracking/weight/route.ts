import { NextRequest, NextResponse } from 'next/server'
import { getUserSession } from '@/lib/auth'
import { getDb } from '@/lib/db'

export async function POST(request: NextRequest) {
    try {
        const session = await getUserSession()
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { weight_kg } = await request.json()
        const db = getDb()

        // Update today's weight
        const query = `
      INSERT INTO daily_tracking (user_id, date, weight_kg)
      VALUES (?, date('now'), ?)
      ON CONFLICT(user_id, date) DO UPDATE SET
        weight_kg = excluded.weight_kg,
        updated_at = CURRENT_TIMESTAMP
    `

        await db.prepare(query).bind(session.userId, weight_kg).run()

        // Also update user's current weight
        await db
            .prepare('UPDATE users SET weight_kg = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
            .bind(weight_kg, session.userId)
            .run()

        return NextResponse.json({
            success: true,
            weight_kg,
        })
    } catch (error) {
        console.error('Weight logging error:', error)
        return NextResponse.json({ error: 'Failed to log weight' }, { status: 500 })
    }
}
