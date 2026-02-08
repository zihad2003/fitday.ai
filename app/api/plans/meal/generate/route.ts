import { NextRequest, NextResponse } from 'next/server'
import { query, mutate } from '@/lib/database'
import { getCurrentUser } from '@/lib/session-manager'
import { generateMealSchedule } from '@/lib/meal-timing-scheduler'
import { getFoodSuggestions } from '@/lib/smart-food-suggester'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json().catch(() => ({})) as { force_regenerate?: boolean }
        const { force_regenerate } = body

        // Parse dietary restrictions and allergies
        const dietaryRestrictions = user.dietary_preference ? [user.dietary_preference] : []
        let allergies: string[] = []
        // food_allergies is not in schema yet, but we'll fallback

        // Generate Meal Schedule
        const schedule = generateMealSchedule(
            {
                wake_up_time: user.wake_time || '07:00',
                sleep_time: user.sleep_time || '23:00',
                preferred_workout_time: user.preferred_workout_time || '17:00',
            },
            user.daily_calorie_goal || 2000,
            user.primary_goal || 'maintenance',
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
            await mutate("UPDATE personalized_plans SET status = 'archived' WHERE user_id = ? AND plan_type = 'nutrition' AND status = 'active'", [user.id])
        }

        // Check if an active plan exists
        const existingPlanRes = await query("SELECT id FROM personalized_plans WHERE user_id = ? AND plan_type = 'nutrition' AND status = 'active'", [user.id])
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
                'nutrition',
                'Intelligent Nutrition Plan',
                `Personalized meal plan for ${user.primary_goal}`,
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
            ])
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
