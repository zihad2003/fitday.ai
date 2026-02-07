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
                up.date,
                up.weight_kg,
                up.water_liters * 1000 as water_ml,
                up.sleep_hours,
                COALESCE(dns.total_calories, 0) as calories_consumed,
                COALESCE(dws.completed_workouts, 0) as workouts_completed
            FROM user_progress up
            LEFT JOIN daily_nutrition_summary dns ON up.user_id = dns.user_id AND up.date = dns.date
            LEFT JOIN daily_workout_summary dws ON up.user_id = dws.user_id AND up.date = dws.date
            WHERE up.user_id = ? AND up.date >= date('now', '-30 days')
            ORDER BY up.date ASC
        `).bind(session.userId).all()

        // 3. Transform to DailyData format
        const dailyData = results.map((r: any) => ({
            date: r.date,
            weight_kg: r.weight_kg || 0,
            calories_consumed: r.calories_consumed || 0,
            workouts_completed: r.workouts_completed || 0,
            water_ml: r.water_ml || 0,
            sleep_hours: r.sleep_hours || 0,
            mood_rating: 0, // Mock for now
            energy_level: 0, // Mock for now
            recovery_level: 3, // Mock for now
            workout_intensity: 3, // Mock for now
            equipment: user.available_equipment || 'gym',
            pain_points: []
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
