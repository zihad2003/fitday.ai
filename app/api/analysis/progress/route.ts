import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session-manager'
import { query } from '@/lib/database'
import { analyzeUserProgress } from '@/lib/progress-analyzer'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
    try {
        const userSession = await getCurrentUser() as any
        if (!userSession?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const userId = userSession.id

        // 1. Fetch user profile
        const userRes = await query("SELECT * FROM users WHERE id = ?", [userId])
        const user = userRes.data?.[0]

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // 2. Fetch last 30 days of daily data
        const progressRes = await query(`
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
        `, [userId])

        const results = progressRes.data || []

        // 3. Transform to DailyData format
        const dailyData = results.map((r: any) => ({
            date: r.date,
            weight_kg: r.weight_kg || 0,
            calories_consumed: r.calories_consumed || 0,
            workouts_completed: r.workouts_completed || 0,
            water_ml: r.water_ml || 0,
            sleep_hours: r.sleep_hours || 0,
            mood_rating: 0,
            energy_level: 0,
            recovery_level: 3,
            workout_intensity: 3,
            equipment: user.available_equipment || 'gym',
            pain_points: []
        }))

        // 4. Run Analysis
        const analysis = analyzeUserProgress(
            dailyData,
            user.primary_goal || 'maintain',
            user.weight || 70,
            user.start_weight || user.weight || 70,
            user.workout_days_per_week || 3,
            user.target_weight || 70
        )

        // 5. Get Gamification data
        let gamification = null
        try {
            const { GamificationService } = await import('@/lib/gamification')
            gamification = await GamificationService.getProgressSummary(userId)
        } catch (e) {
            console.warn('Gamification service failed', e)
        }

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
