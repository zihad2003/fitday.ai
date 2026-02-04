import { NextRequest, NextResponse } from 'next/server'
import { getUserSession } from '@/lib/auth'
import { getDb } from '@/lib/db'
import { analyzeUserProgress } from '@/lib/progress-analyzer'
import { adaptUserPlan } from '@/lib/plan-adapter'

export async function GET(request: NextRequest) {
    try {
        const session = await getUserSession()
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const db = getDb()

        // Get user profile
        const user = await db
            .prepare(`
        SELECT 
          fitness_goal,
          weight_kg,
          target_weight_kg,
          target_calories,
          tdee,
          workout_days_per_week,
          activity_level,
          created_at
        FROM users 
        WHERE id = ?
      `)
            .bind(session.userId)
            .first()

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Get daily tracking data (last 30 days)
        const dailyData = await db
            .prepare(`
        SELECT 
          date,
          weight_kg,
          calories_consumed,
          workouts_completed,
          water_ml,
          sleep_hours,
          mood_rating,
          energy_level
        FROM daily_tracking
        WHERE user_id = ?
        AND date >= date('now', '-30 days')
        ORDER BY date ASC
      `)
            .bind(session.userId)
            .all()

        // Get start weight (first recorded weight or current weight)
        const firstWeight = dailyData.results.find((d: any) => d.weight_kg > 0)?.weight_kg || user.weight_kg
        const currentWeight = user.weight_kg

        // Analyze progress
        const analysis = analyzeUserProgress(
            dailyData.results as any[],
            user.fitness_goal,
            currentWeight,
            firstWeight,
            user.workout_days_per_week,
            user.target_weight_kg
        )

        // Adapt plan if needed
        const adaptedPlan = adaptUserPlan(
            {
                fitness_goal: user.fitness_goal,
                target_calories: user.target_calories,
                tdee: user.tdee,
                workout_days_per_week: user.workout_days_per_week,
                activity_level: user.activity_level,
            },
            analysis.metrics,
            analysis.plateau
        )

        // Calculate days since start
        const startDate = new Date(user.created_at)
        const today = new Date()
        const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

        return NextResponse.json({
            success: true,
            data: {
                metrics: analysis.metrics,
                insights: analysis.insights,
                plateau: analysis.plateau,
                prediction: analysis.prediction,
                adapted_plan: adaptedPlan,
                days_tracked: dailyData.results.length,
                days_since_start: daysSinceStart,
            },
        })
    } catch (error) {
        console.error('Progress analysis error:', error)
        return NextResponse.json(
            { error: 'Failed to analyze progress' },
            { status: 500 }
        )
    }
}

// Apply plan adjustments
export async function POST(request: NextRequest) {
    try {
        const session = await getUserSession()
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { new_target_calories, new_workout_days } = await request.json()
        const db = getDb()

        // Update user profile with new targets
        const query = `
      UPDATE users SET
        target_calories = COALESCE(?, target_calories),
        workout_days_per_week = COALESCE(?, workout_days_per_week),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `

        await db.prepare(query).bind(
            new_target_calories || null,
            new_workout_days || null,
            session.userId
        ).run()

        return NextResponse.json({
            success: true,
            message: 'Plan adjustments applied successfully',
        })
    } catch (error) {
        console.error('Plan adjustment error:', error)
        return NextResponse.json(
            { error: 'Failed to apply adjustments' },
            { status: 500 }
        )
    }
}
