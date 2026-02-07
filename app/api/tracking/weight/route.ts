import { NextRequest, NextResponse } from 'next/server'
import { getUserSession } from '@/lib/auth'
import { getDb } from '@/lib/db'

export async function POST(request: NextRequest) {
    try {
        const session = await getUserSession()
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { weight_kg } = await request.json() as { weight_kg: number }
        const db = getDb()

        // 1. Update user_progress for today
        const existing = await db.prepare("SELECT id FROM user_progress WHERE user_id = ? AND date = date('now')").bind(session.userId).first()

        if (existing) {
            await db.prepare('UPDATE user_progress SET weight_kg = ? WHERE id = ?').bind(weight_kg, existing.id).run()
        } else {
            await db.prepare("INSERT INTO user_progress (user_id, date, weight_kg) VALUES (?, date('now'), ?)").bind(session.userId, weight_kg).run()
        }

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
