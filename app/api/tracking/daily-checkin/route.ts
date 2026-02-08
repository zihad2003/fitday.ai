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

        const body = await request.json() as {
            weight_kg?: number,
            mood?: number,
            energy?: number,
            sleep_hours?: number,
            sleep_quality?: string,
            stress_level?: number
        }
        const { weight_kg, sleep_hours } = body

        // Check if log exists for today
        const existingRes = await query("SELECT id FROM user_progress WHERE user_id = ? AND date = date('now')", [userId])
        const existingLog = existingRes.data?.[0]

        if (existingLog) {
            await mutate(`
                UPDATE user_progress 
                SET weight_kg = COALESCE(?, weight_kg), sleep_hours = COALESCE(?, sleep_hours)
                WHERE id = ?
             `, [weight_kg || null, sleep_hours || null, existingLog.id])
        } else {
            await mutate(`
                INSERT INTO user_progress (user_id, date, weight_kg, sleep_hours)
                VALUES (?, date('now'), ?, ?)
             `, [userId, weight_kg || null, sleep_hours || null])
        }

        // Update user's current weight if provided (Schema uses 'weight')
        if (weight_kg) {
            await mutate('UPDATE users SET weight = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [weight_kg, userId])
        }

        // Trigger Gamification Engine
        let streak = 0
        try {
            const { GamificationService } = await import('@/lib/gamification')
            const streakInfo = await GamificationService.updateStreak(userId) as any
            streak = streakInfo.current || 0
            if (weight_kg) await GamificationService.checkAchievements(userId, 'weight_sync', 1)
            if (sleep_hours) await GamificationService.checkAchievements(userId, 'sleep_sync', 1)
        } catch (e) {
            console.warn('Gamification sync failed', e)
        }

        return NextResponse.json({
            success: true,
            message: 'Daily check-in completed',
            streak
        })
    } catch (error) {
        console.error('Daily check-in error:', error)
        return NextResponse.json({ error: 'Failed to complete check-in' }, { status: 500 })
    }
}

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser() as any
        if (!user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const userId = user.id

        // Check if user has completed today's check-in
        const resultRes = await query(`
            SELECT weight_kg, sleep_hours
            FROM user_progress 
            WHERE user_id = ? AND date = date('now')
        `, [userId])

        const result = resultRes.data?.[0]

        return NextResponse.json({
            completed: !!result,
            data: result || null,
        })
    } catch (error) {
        console.error('Check-in status error:', error)
        return NextResponse.json({ error: 'Failed to fetch check-in status' }, { status: 500 })
    }
}
