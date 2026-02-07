import { NextRequest, NextResponse } from 'next/server'
import { getUserSession } from '@/lib/auth'
import { getDb } from '@/lib/db'

export async function POST(request: NextRequest) {
    try {
        const session = await getUserSession()
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json() as {
            weight_kg?: number,
            mood?: number,
            energy?: number,
            sleep_hours?: number,
            sleep_quality?: string,
            stress_level?: number
        }
        const { weight_kg, sleep_hours } = body
        const db = getDb()

        // Check if log exists for today
        const existingLog = await db.prepare("SELECT id FROM user_progress WHERE user_id = ? AND date = date('now')").bind(session.userId).first()

        if (existingLog) {
            await db.prepare(`
                UPDATE user_progress 
                SET weight_kg = COALESCE(?, weight_kg), sleep_hours = COALESCE(?, sleep_hours)
                WHERE id = ?
             `).bind(weight_kg || null, sleep_hours || null, existingLog.id).run()
        } else {
            await db.prepare(`
                INSERT INTO user_progress (user_id, date, weight_kg, sleep_hours)
                VALUES (?, date('now'), ?, ?)
             `).bind(session.userId, weight_kg || null, sleep_hours || null).run()
        }

        // Update user's current weight if provided
        if (weight_kg) {
            await db
                .prepare('UPDATE users SET weight_kg = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
                .bind(weight_kg, session.userId)
                .run()
        }

        // Trigger Gamification Engine: Update Streak and check achievements
        const { GamificationService } = await import('@/lib/gamification')
        const streak = await GamificationService.updateStreak(parseInt(session.userId))

        // Check for specific achievements
        if (weight_kg) await GamificationService.checkAchievements(parseInt(session.userId), 'weight_sync', 1)
        if (sleep_hours) await GamificationService.checkAchievements(parseInt(session.userId), 'sleep_sync', 1)

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
        const session = await getUserSession()
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const db = getDb()

        // Check if user has completed today's check-in
        const result = await db
            .prepare(`
        SELECT 
          weight_kg,
          sleep_hours
        FROM user_progress 
        WHERE user_id = ? AND date = date('now')
      `)
            .bind(session.userId)
            .first()

        let formattedResult = null
        if (result) {
            formattedResult = {
                weight_kg: result.weight_kg,
                sleep_hours: result.sleep_hours
            }
        }

        return NextResponse.json({
            completed: !!result,
            data: formattedResult,
        })

        return NextResponse.json({
            completed: !!result,
            data: result || null,
        })
    } catch (error) {
        console.error('Check-in status error:', error)
        return NextResponse.json({ error: 'Failed to fetch check-in status' }, { status: 500 })
    }
}
