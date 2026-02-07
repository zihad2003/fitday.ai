import { NextRequest, NextResponse } from 'next/server'
import { getUserSession } from '@/lib/auth'
import { getDb } from '@/lib/db'
import { generateMealSchedule } from '@/lib/meal-timing-scheduler'
import { getFoodSuggestions } from '@/lib/smart-food-suggester'

export async function POST(request: NextRequest) {
    try {
        const session = await getUserSession()
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json().catch(() => ({})) as { force_regenerate?: boolean }
        const { force_regenerate } = body
        const db = getDb()

        // Get user profile
        const user = await db
            .prepare(`
        SELECT 
          fitness_goal,
          target_calories,
          dietary_preference,
          food_allergies,
          wake_up_time,
          sleep_time,
          preferred_workout_time,
          workout_days_per_week
        FROM users 
        WHERE id = ?
      `)
            .bind(session.userId)
            .first()

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Parse dietary restrictions and allergies
        const dietaryRestrictions = user.dietary_preference ? [user.dietary_preference] : []
        let allergies: string[] = []
        try {
            allergies = JSON.parse(user.food_allergies || '[]')
        } catch (e) {
            allergies = []
        }

        // Generate Meal Schedule
        const schedule = generateMealSchedule(
            {
                wake_up_time: user.wake_up_time || '07:00',
                sleep_time: user.sleep_time || '23:00',
                preferred_workout_time: user.preferred_workout_time || '17:00',
            },
            user.target_calories || 2000,
            user.fitness_goal,
            (user.workout_days_per_week || 3) > 0
        )

        // Fill schedule with food suggestions
        const fullPlan = schedule.meals.map(meal => {
            const suggestions = getFoodSuggestions(
                meal.meal_type,
                meal.calories_target,
                meal.protein_target,
                meal.carbs_target,
                meal.fats_target,
                dietaryRestrictions,
                allergies,
                3 // Get 3 options
            )

            return {
                ...meal,
                suggestions
            }
        })

        // Save plan to database
        // Ensure we delete old active plans first if regenerating
        if (force_regenerate) {
            await db.prepare("UPDATE personalized_plans SET status = 'archived' WHERE user_id = ? AND plan_type = 'nutrition' AND status = 'active'")
                .bind(session.userId)
                .run();
        }

        // Check if an active plan exists
        const existingPlan = await db.prepare("SELECT id FROM personalized_plans WHERE user_id = ? AND plan_type = 'nutrition' AND status = 'active'").bind(session.userId).first();

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
                'nutrition',
                'Intelligent Nutrition Plan',
                `Personalized meal plan for ${user.fitness_goal}`,
                4, // Default 4 weeks
                'intermediate',
                JSON.stringify({
                    schedule_summary: {
                        eating_window: schedule.eating_window_hours,
                        meal_count: schedule.meal_count,
                        total_calories: schedule.total_calories
                    },
                    daily_plan: fullPlan
                })
            ).run()
        }

        return NextResponse.json({
            success: true,
            data: {
                matches_targets: true,
                eating_window_hours: schedule.eating_window_hours,
                schedule: fullPlan
            }
        })

    } catch (error) {
        console.error('Meal plan generation error:', error)
        return NextResponse.json(
            { error: 'Failed to generate meal plan' },
            { status: 500 }
        )
    }
}
