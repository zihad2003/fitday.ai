import { NextRequest, NextResponse } from 'next/server'
import { query, mutate } from '@/lib/database'
import { getCurrentUser } from '@/lib/session-manager'
import { WorkoutScheduler } from '@/lib/workout-scheduler'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json().catch(() => ({})) as { force_regenerate?: boolean }
        const { force_regenerate } = body

        // Generate Workout Plan based on user profile
        const plan = WorkoutScheduler.generatePlan(
            user.workout_days_per_week || 3,
            (user.primary_goal as any) || 'general_fitness',
            (user.fitness_level as any) || 'beginner'
        )

        // Archive old active plans if regenerating
        if (force_regenerate) {
            await mutate("UPDATE personalized_plans SET status = 'archived' WHERE user_id = ? AND plan_type = 'workout' AND status = 'active'", [user.id])
        }

        // Check availability or insert
        const existingPlanRes = await query("SELECT id FROM personalized_plans WHERE user_id = ? AND plan_type = 'workout' AND status = 'active'", [user.id])
        const existingPlan = existingPlanRes.data?.[0]

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

            await mutate(planQuery, [
                user.id,
                'workout',
                `${plan.split_name} Program`,
                `Targeted ${user.primary_goal?.replace('_', ' ')} plan using ${plan.split_name}`,
                8, // Default 8 weeks
                user.fitness_level || 'beginner',
                JSON.stringify(plan)
            ])
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
