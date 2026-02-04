import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function POST(request: NextRequest) {
    try {
        const { userId, type } = await request.json() as { userId: number, type: string }
        const db = getDb()
        const today = new Date().toISOString().split('T')[0]

        // Upsert daily tracking to ensure the record exists for the day
        await db.prepare(`
            INSERT INTO daily_tracking (user_id, date, updated_at)
            VALUES (?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(user_id, date) DO UPDATE SET
                updated_at = CURRENT_TIMESTAMP
        `).bind(userId, today).run()

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
