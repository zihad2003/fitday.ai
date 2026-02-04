import { NextRequest, NextResponse } from 'next/server'
import { getUserSession } from '@/lib/auth'
import { getDb } from '@/lib/db'

export async function POST(request: NextRequest) {
    try {
        const session = await getUserSession()
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await request.json()
        const db = getDb()

        // Update user profile with onboarding data
        const updateQuery = `
      UPDATE users SET
        age = ?,
        gender = ?,
        height_cm = ?,
        weight_kg = ?,
        body_fat_percentage = ?,
        fitness_goal = ?,
        target_weight_kg = ?,
        target_body_fat_percentage = ?,
        goal_deadline = ?,
        dietary_preference = ?,
        food_allergies = ?,
        disliked_foods = ?,
        workout_days_per_week = ?,
        preferred_workout_time = ?,
        available_equipment = ?,
        workout_duration_preference = ?,
        wake_up_time = ?,
        sleep_time = ?,
        daily_water_goal_ml = ?,
        activity_level = ?,
        bmr = ?,
        tdee = ?,
        target_calories = ?,
        onboarding_completed = ?,
        onboarding_step = ?,
        profile_completeness = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `

        await db.prepare(updateQuery).bind(
            data.age,
            data.gender,
            data.height_cm,
            data.weight_kg,
            data.body_fat_percentage || null,
            data.fitness_goal,
            data.target_weight_kg || null,
            data.target_body_fat_percentage || null,
            data.goal_deadline || null,
            data.dietary_preference || 'none',
            JSON.stringify(data.food_allergies || []),
            JSON.stringify(data.disliked_foods || []),
            data.workout_days_per_week,
            data.preferred_workout_time,
            data.available_equipment,
            data.workout_duration_preference,
            data.wake_up_time,
            data.sleep_time,
            data.daily_water_goal_ml || 2000,
            data.activity_level || 'moderate',
            data.bmr,
            data.tdee,
            data.target_calories,
            true,
            5,
            100,
            session.userId
        ).run()

        // Create user preferences
        const preferencesQuery = `
      INSERT INTO user_preferences (
        user_id,
        enable_workout_reminders,
        enable_meal_reminders,
        enable_water_reminders,
        enable_sleep_reminders,
        enable_progress_updates,
        enable_motivational_messages,
        use_metric_system,
        show_calories,
        show_macros,
        theme,
        profile_visibility,
        share_progress
      ) VALUES (?, 1, 1, 1, 1, 1, 1, 1, 1, 1, 'dark', 'private', 0)
      ON CONFLICT(user_id) DO UPDATE SET
        updated_at = CURRENT_TIMESTAMP
    `

        await db.prepare(preferencesQuery).bind(session.userId).run()

        // Create initial goal
        if (data.fitness_goal && data.target_weight_kg) {
            const goalQuery = `
        INSERT INTO user_goals (
          user_id,
          goal_type,
          goal_name,
          target_value,
          current_value,
          unit,
          start_date,
          target_date,
          status,
          priority
        ) VALUES (?, ?, ?, ?, ?, ?, date('now'), ?, 'active', 1)
      `

            const goalType = data.fitness_goal === 'lose_weight' ? 'weight_loss' :
                data.fitness_goal === 'build_muscle' ? 'muscle_gain' :
                    'custom'

            await db.prepare(goalQuery).bind(
                session.userId,
                goalType,
                `Reach ${data.target_weight_kg}kg`,
                data.target_weight_kg,
                data.weight_kg,
                'kg',
                data.goal_deadline || null
            ).run()
        }

        // Generate personalized workout plan
        const workoutPlan = await generateWorkoutPlan(data)

        // Generate personalized meal plan
        const mealPlan = await generateMealPlan(data)

        // Save plans to database
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

        // Save workout plan
        await db.prepare(planQuery).bind(
            session.userId,
            'workout',
            'Personalized Workout Plan',
            `Custom ${data.fitness_goal} workout plan`,
            12,
            getDifficultyLevel(data.activity_level),
            JSON.stringify(workoutPlan),
        ).run()

        // Save meal plan
        await db.prepare(planQuery).bind(
            session.userId,
            'nutrition',
            'Personalized Meal Plan',
            `Custom nutrition plan for ${data.fitness_goal}`,
            12,
            'beginner',
            JSON.stringify(mealPlan),
        ).run()

        // Create initial daily tracking entry
        const trackingQuery = `
      INSERT INTO daily_tracking (
        user_id,
        date,
        weight_kg,
        body_fat_percentage
      ) VALUES (?, date('now'), ?, ?)
      ON CONFLICT(user_id, date) DO UPDATE SET
        weight_kg = excluded.weight_kg,
        body_fat_percentage = excluded.body_fat_percentage
    `

        await db.prepare(trackingQuery).bind(
            session.userId,
            data.weight_kg,
            data.body_fat_percentage || null
        ).run()

        return NextResponse.json({
            success: true,
            message: 'Onboarding completed successfully',
            data: {
                bmr: data.bmr,
                tdee: data.tdee,
                target_calories: data.target_calories,
                workout_plan: workoutPlan,
                meal_plan: mealPlan,
            }
        })

    } catch (error) {
        console.error('Onboarding error:', error)
        return NextResponse.json(
            { error: 'Failed to complete onboarding' },
            { status: 500 }
        )
    }
}

// Helper function to generate workout plan
async function generateWorkoutPlan(data: any) {
    const { fitness_goal, workout_days_per_week, available_equipment, workout_duration_preference } = data

    // Define workout templates based on goal
    const workoutTemplates: any = {
        build_muscle: {
            split: workout_days_per_week >= 5 ? 'push_pull_legs' : workout_days_per_week >= 3 ? 'upper_lower' : 'full_body',
            focus: 'hypertrophy',
            rep_range: '8-12',
            sets: 3 - 4,
        },
        lose_weight: {
            split: 'circuit',
            focus: 'fat_loss',
            rep_range: '12-15',
            sets: 3,
            cardio_minutes: 20,
        },
        improve_endurance: {
            split: 'cardio_focused',
            focus: 'endurance',
            cardio_minutes: 30,
        },
        increase_strength: {
            split: workout_days_per_week >= 4 ? 'powerlifting' : 'full_body',
            focus: 'strength',
            rep_range: '4-6',
            sets: 5,
        },
        maintain_fitness: {
            split: 'balanced',
            focus: 'maintenance',
            rep_range: '10-12',
            sets: 3,
        },
    }

    const template = workoutTemplates[fitness_goal] || workoutTemplates.maintain_fitness

    // Generate weekly schedule
    const weeklySchedule = []
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

    for (let i = 0; i < workout_days_per_week; i++) {
        weeklySchedule.push({
            day: daysOfWeek[i],
            workout_type: getWorkoutType(template.split, i),
            duration_minutes: workout_duration_preference || 60,
            exercises: [], // Will be populated from exercise library
        })
    }

    return {
        goal: fitness_goal,
        template: template.split,
        weekly_schedule: weeklySchedule,
        equipment: available_equipment,
        duration_weeks: 12,
        progression_plan: 'Progressive overload every 2 weeks',
    }
}

// Helper function to generate meal plan
async function generateMealPlan(data: any) {
    const { target_calories, dietary_preference, food_allergies } = data

    // Calculate macro distribution based on goal
    const macros = calculateMacros(target_calories, data.fitness_goal)

    return {
        daily_calories: target_calories,
        macros: macros,
        meal_count: 4, // breakfast, lunch, snack, dinner
        dietary_restrictions: {
            preference: dietary_preference,
            allergies: food_allergies || [],
        },
        sample_day: {
            breakfast: {
                calories: Math.round(target_calories * 0.25),
                protein: Math.round(macros.protein * 0.25),
                carbs: Math.round(macros.carbs * 0.30),
                fats: Math.round(macros.fats * 0.20),
            },
            lunch: {
                calories: Math.round(target_calories * 0.35),
                protein: Math.round(macros.protein * 0.35),
                carbs: Math.round(macros.carbs * 0.35),
                fats: Math.round(macros.fats * 0.35),
            },
            snack: {
                calories: Math.round(target_calories * 0.15),
                protein: Math.round(macros.protein * 0.15),
                carbs: Math.round(macros.carbs * 0.15),
                fats: Math.round(macros.fats * 0.15),
            },
            dinner: {
                calories: Math.round(target_calories * 0.25),
                protein: Math.round(macros.protein * 0.25),
                carbs: Math.round(macros.carbs * 0.20),
                fats: Math.round(macros.fats * 0.30),
            },
        },
    }
}

function calculateMacros(calories: number, goal: string) {
    let proteinPercentage, carbsPercentage, fatsPercentage

    switch (goal) {
        case 'build_muscle':
            proteinPercentage = 0.30
            carbsPercentage = 0.45
            fatsPercentage = 0.25
            break
        case 'lose_weight':
            proteinPercentage = 0.35
            carbsPercentage = 0.35
            fatsPercentage = 0.30
            break
        case 'increase_strength':
            proteinPercentage = 0.30
            carbsPercentage = 0.50
            fatsPercentage = 0.20
            break
        default:
            proteinPercentage = 0.25
            carbsPercentage = 0.45
            fatsPercentage = 0.30
    }

    return {
        protein: Math.round((calories * proteinPercentage) / 4), // 4 cal per gram
        carbs: Math.round((calories * carbsPercentage) / 4),
        fats: Math.round((calories * fatsPercentage) / 9), // 9 cal per gram
    }
}

function getWorkoutType(split: string, dayIndex: number): string {
    const splits: any = {
        push_pull_legs: ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs', 'Rest'],
        upper_lower: ['Upper', 'Lower', 'Rest', 'Upper', 'Lower', 'Rest', 'Rest'],
        full_body: ['Full Body', 'Rest', 'Full Body', 'Rest', 'Full Body', 'Rest', 'Rest'],
        circuit: ['Circuit', 'Circuit', 'Rest', 'Circuit', 'Circuit', 'Rest', 'Rest'],
    }

    return splits[split]?.[dayIndex] || 'Full Body'
}

function getDifficultyLevel(activityLevel: string): string {
    switch (activityLevel) {
        case 'sedentary':
        case 'light':
            return 'beginner'
        case 'moderate':
        case 'active':
            return 'intermediate'
        case 'very_active':
            return 'advanced'
        default:
            return 'beginner'
    }
}
