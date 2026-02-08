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

        const { type } = await request.json() as { type: string }
        const today = new Date().toISOString().split('T')[0]

        // Ensure a daily progress record exists
        const existingRes = await query("SELECT id FROM user_progress WHERE user_id = ? AND date = ?", [userId, today])
        const existing = existingRes.data?.[0]

        if (!existing) {
            await mutate("INSERT INTO user_progress (user_id, date) VALUES (?, ?)", [userId, today])
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
