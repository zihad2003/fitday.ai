import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as { userId: number, date: string, water_liters: number }
        const { userId, date, water_liters } = body

        if (!userId || !date) {
            return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 })
        }

        const db = getDb()

        // Check if progress entry exists for today
        const existing = await db.prepare('SELECT id FROM user_progress WHERE user_id = ? AND date = ?').bind(userId, date).first()

        if (existing) {
            // Update existing
            await db.prepare('UPDATE user_progress SET water_liters = ? WHERE id = ?')
                .bind(water_liters, existing.id)
                .run()
        } else {
            // Insert new
            await db.prepare('INSERT INTO user_progress (user_id, date, water_liters) VALUES (?, ?, ?)')
                .bind(userId, date, water_liters)
                .run()
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Water tracking API Error:', error)
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to sync water' },
            { status: 500 }
        )
    }
}
