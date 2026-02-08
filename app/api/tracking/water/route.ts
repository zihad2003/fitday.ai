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

        const body = await request.json() as { date: string, water_liters: number }
        const { date, water_liters } = body

        if (!date) {
            return NextResponse.json({ success: false, error: 'Missing date' }, { status: 400 })
        }

        // Check if progress entry exists for today
        const existingRes = await query('SELECT id FROM user_progress WHERE user_id = ? AND date = ?', [userId, date])
        const existing = existingRes.data?.[0]

        if (existing) {
            await mutate('UPDATE user_progress SET water_liters = ? WHERE id = ?', [water_liters, existing.id])
        } else {
            await mutate('INSERT INTO user_progress (user_id, date, water_liters) VALUES (?, ?, ?)', [userId, date, water_liters])
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
