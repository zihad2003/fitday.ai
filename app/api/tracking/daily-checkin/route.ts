import { NextRequest, NextResponse } from 'next/server'
import { getUserSession } from '@/lib/auth'
import { getDb } from '@/lib/db'

export async function POST(request: NextRequest) {
    try {
        const session = await getUserSession()
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { weight_kg, mood, energy, sleep_hours, sleep_quality, stress_level } = await request.json()
        const db = getDb()

        // Insert or update daily check-in
        const query = `
      INSERT INTO daily_tracking (
        user_id,
        date,
        weight_kg,
        mood_rating,
        energy_level,
        sleep_hours,
        sleep_quality,
        stress_level
      ) VALUES (?, date('now'), ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, date) DO UPDATE SET
        weight_kg = COALESCE(excluded.weight_kg, weight_kg),
        mood_rating = COALESCE(excluded.mood_rating, mood_rating),
        energy_level = COALESCE(excluded.energy_level, energy_level),
        sleep_hours = COALESCE(excluded.sleep_hours, sleep_hours),
        sleep_quality = COALESCE(excluded.sleep_quality, sleep_quality),
        stress_level = COALESCE(excluded.stress_level, stress_level),
        updated_at = CURRENT_TIMESTAMP
    `

        await db.prepare(query).bind(
            session.userId,
            weight_kg || null,
            mood || null,
            energy || null,
            sleep_hours || null,
            sleep_quality || null,
            stress_level || null
        ).run()

        // Update user's current weight if provided
        if (weight_kg) {
            await db
                .prepare('UPDATE users SET weight_kg = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
                .bind(weight_kg, session.userId)
                .run()
        }

        return NextResponse.json({
            success: true,
            message: 'Daily check-in completed',
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
          mood_rating,
          energy_level,
          sleep_hours,
          sleep_quality
        FROM daily_tracking 
        WHERE user_id = ? AND date = date('now')
      `)
            .bind(session.userId)
            .first()

        return NextResponse.json({
            completed: !!result,
            data: result || null,
        })
    } catch (error) {
        console.error('Check-in status error:', error)
        return NextResponse.json({ error: 'Failed to fetch check-in status' }, { status: 500 })
    }
}
