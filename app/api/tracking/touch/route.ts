import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function POST(request: NextRequest) {
    try {
        const { userId, type } = await request.json() as { userId: number, type: string }
        const db = getDb()
        const today = new Date().toISOString().split('T')[0]

        // Ensure a daily progress record exists
        const existing = await db.prepare("SELECT id FROM user_progress WHERE user_id = ? AND date = ?").bind(userId, today).first()

        if (!existing) {
            await db.prepare("INSERT INTO user_progress (user_id, date) VALUES (?, ?)").bind(userId, today).run()
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
