import { NextRequest, NextResponse } from 'next/server'
import { getUserSession } from '@/lib/auth'
import { getDb } from '@/lib/db'
import { analyzeUserProgress } from '@/lib/progress-analyzer'

export async function GET(request: NextRequest) {
    try {
        const session = await getUserSession()
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const db = getDb()

        // 1. Fetch user profile
        const user = await db.prepare("SELECT * FROM users WHERE id = ?").bind(session.userId).first() as any
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // 2. Fetch last 30 days of daily data
        const { results } = await db.prepare(`
            SELECT 
                dt.date,
                dt.weight_kg,
                dt.mood_rating,
                dt.energy_level,
                dt.sleep_hours,
                dt.pain_points,
                COALESCE(SUM(m.calories), 0) as calories_consumed,
                COUNT(CASE WHEN w.completed = 1 THEN 1 END) as workouts_completed,
                dt.water_liters * 1000 as water_ml
            FROM daily_tracking dt
            LEFT JOIN meals m ON dt.user_id = m.user_id AND dt.date = m.date
            LEFT JOIN workouts w ON dt.user_id = w.user_id AND dt.date = w.date
            WHERE dt.user_id = ? AND dt.date >= date('now', '-30 days')
            GROUP BY dt.date
            ORDER BY dt.date ASC
        `).bind(session.userId).all()

        // 3. Transform to DailyData format
        const dailyData = results.map((r: any) => ({
            date: r.date,
            weight_kg: r.weight_kg || 0,
            calories_consumed: r.calories_consumed || 0,
            workouts_completed: r.workouts_completed || 0,
            water_ml: r.water_ml || 0,
            sleep_hours: r.sleep_hours || 0,
            mood_rating: r.mood_rating || 0,
            energy_level: r.energy_level || 0,
            recovery_level: 3, // Mock for now
            workout_intensity: 3, // Mock for now
            equipment: user.available_equipment || 'gym',
            pain_points: typeof r.pain_points === 'string' ? JSON.parse(r.pain_points) : (r.pain_points || [])
        }))

        // 4. Run Analysis
        const analysis = analyzeUserProgress(
            dailyData,
            user.goal,
            user.weight_kg,
            user.start_weight_kg || user.weight_kg, // Use current as start if not set
            user.workout_days_per_week || 4,
            user.target_weight_kg
        )

        // 5. Get Gamification data
        const { GamificationService } = await import('@/lib/gamification')
        const gamification = await GamificationService.getProgressSummary(parseInt(session.userId))

        return NextResponse.json({
            success: true,
            data: {
                ...analysis,
                gamification
            }
        })

    } catch (error: any) {
        console.error('Progress Analysis error:', error)
        return NextResponse.json({ error: error.message || 'Failed to analyze progress' }, { status: 500 })
    }
}
