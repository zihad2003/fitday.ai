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
        const result = await db
            .prepare('SELECT water_ml FROM daily_tracking WHERE user_id = ? AND date = date("now")')
            .bind(session.userId)
            .first()

        return NextResponse.json({
            water_ml: result?.water_ml || 0,
        })
    } catch (error) {
        console.error('Water fetch error:', error)
        return NextResponse.json({ error: 'Failed to fetch water data' }, { status: 500 })
    }
}
