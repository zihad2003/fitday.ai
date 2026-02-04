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
        const { weight_kg, mood, energy, sleep_hours, sleep_quality, stress_level } = body
        const db = getDb()

        // Insert or update daily check-in
        // Map input to progress_logs
        // We will store mood, energy, sleep in 'notes' as JSON because schema doesn't have columns for them
        const additionalMetrics = {
            mood_rating: mood,
            energy_level: energy,
            sleep_hours: sleep_hours,
            sleep_quality: sleep_quality,
            stress_level: stress_level
        }
        const notesJson = JSON.stringify(additionalMetrics)

        // Check if log exists for today
        const existingLog = await db.prepare('SELECT id FROM progress_logs WHERE user_id = ? AND log_date = date("now")').bind(session.userId).first()

        if (existingLog) {
            await db.prepare(`
                UPDATE progress_logs 
                SET weight = COALESCE(?, weight), notes = ? 
                WHERE id = ?
             `).bind(weight_kg || null, notesJson, existingLog.id).run()
        } else {
            await db.prepare(`
                INSERT INTO progress_logs (user_id, log_date, weight, notes)
                VALUES (?, date('now'), ?, ?)
             `).bind(session.userId, weight_kg || null, notesJson).run()
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
        // Check if user has completed today's check-in
        const result = await db
            .prepare(`
        SELECT 
          weight,
          notes
        FROM progress_logs 
        WHERE user_id = ? AND log_date = date('now')
      `)
            .bind(session.userId)
            .first()

        let formattedResult = null
        if (result) {
            let notesData = {}
            try {
                notesData = result.notes ? JSON.parse(result.notes) : {}
            } catch (e) { }

            formattedResult = {
                weight_kg: result.weight,
                ...notesData
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
