import { NextRequest, NextResponse } from 'next/server'
import { getUserSession } from '@/lib/auth'
import { getDb } from '@/lib/db'
import { WorkoutScheduler } from '@/lib/workout-scheduler'

export async function POST(request: NextRequest) {
    try {
        const session = await getUserSession()
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { force_regenerate } = await request.json().catch(() => ({}))
        const db = getDb()

        // Get user profile
        const user = await db
            .prepare(`
        SELECT 
          fitness_goal,
          fitness_level,
          workout_days_per_week
        FROM users 
        WHERE id = ?
      `)
            .bind(session.userId)
            .first()

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Generate Workout Plan
        const plan = WorkoutScheduler.generatePlan(
            user.workout_days_per_week || 3,
            user.fitness_goal as any || 'general_fitness',
            user.fitness_level as any || 'beginner'
        )

        // Save plan to database

        // Archive old active plans if regenerating
        if (force_regenerate) {
            await db.prepare("UPDATE personalized_plans SET status = 'archived' WHERE user_id = ? AND plan_type = 'workout' AND status = 'active'")
                .bind(session.userId)
                .run();
        }

        // Check availability or insert
        const existingPlan = await db.prepare("SELECT id FROM personalized_plans WHERE user_id = ? AND plan_type = 'workout' AND status = 'active'").bind(session.userId).first();

        if (!existingPlan) {
            const planQuery = `
          INSERT INTO personalized_plans (
            user_id,
            plan_type,
            plan_name,
            description,
            duration_weeks,
            difficulty_level,
            plan_data,
            status,
            start_date
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 'active', date('now'))
        `

            await db.prepare(planQuery).bind(
                session.userId,
                'workout',
                `${plan.split_name} Program`,
                `Targeted ${user.fitness_goal.replace('_', ' ')} plan using ${plan.split_name}`,
                8, // Default 8 weeks
                user.fitness_level || 'beginner',
                JSON.stringify(plan)
            ).run()
        }

        return NextResponse.json({
            success: true,
            data: plan
        })

    } catch (error) {
        console.error('Workout plan generation error:', error)
        return NextResponse.json(
            { error: 'Failed to generate workout plan' },
            { status: 500 }
        )
    }
}
