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

        const { weight_kg } = await request.json() as { weight_kg: number }

        // 1. Update user_progress for today
        const existingRes = await query("SELECT id FROM user_progress WHERE user_id = ? AND date = date('now')", [userId])
        const existing = existingRes.data?.[0]

        if (existing) {
            await mutate('UPDATE user_progress SET weight_kg = ? WHERE id = ?', [weight_kg, existing.id])
        } else {
            await mutate("INSERT INTO user_progress (user_id, date, weight_kg) VALUES (?, date('now'), ?)", [userId, weight_kg])
        }

        // Also update user's current weight in 'users' table (uses 'weight')
        await mutate('UPDATE users SET weight = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [weight_kg, userId])

        return NextResponse.json({
            success: true,
            weight_kg,
        })
    } catch (error) {
        console.error('Weight logging error:', error)
        return NextResponse.json({ error: 'Failed to log weight' }, { status: 500 })
    }
}
