import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as { userId: number, date: string, water_liters: number }
        const { userId, date, water_liters } = body

        if (!userId || !date) {
            return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 })
        }

        // Calculate the increment if we want to log every sip, 
        // OR simpler: Delete today's logs and insert the new total as a single entry for "today's total so far"
        // Since we don't know the previous total here without querying, and this is a "sync" from frontend state:

        // Strategy: We will treat `water_logs` effectively as "Total for the day" by removing prior entries for this user/date combination.
        // Ideally we'd modify the schema to have a unique constraint, but we work with what we have.

        // 1. Delete existing logs for today
        await db.prepare('DELETE FROM water_logs WHERE user_id = ? AND date = ?').bind(userId, date).run()

        // 2. Insert new total
        const waterMl = Math.round(water_liters * 1000)
        await db.prepare('INSERT INTO water_logs (user_id, date, amount_ml) VALUES (?, ?, ?)')
            .bind(userId, date, waterMl)
            .run()

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Water tracking API Error:', error)
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to sync water' },
            { status: 500 }
        )
    }
}
