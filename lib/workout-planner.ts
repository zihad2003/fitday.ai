/**
 * FitDay AI - Intelligent Workout Planner
 * Integrates with D1 Database for persistent workout scheduling
 */

import { getDb } from './db'

export interface ExerciseLibraryItem {
    id: number
    name: string
    difficulty: string
    muscle_group: string
    equipment_needed: string
    safety_instruction: string
    gif_url: string
}

/**
 * FitDay AI - Intelligent Workout Planner
 * Integrates with D1 Database for persistent workout scheduling
 */

import { getDb } from './db'

export interface ExerciseLibraryItem {
    id: number
    name: string
    difficulty: string
    muscle_group: string
    equipment: string
    safety_instruction?: string // Optional in new schema? Checking seed matches 'instructions' probably
    gif_url: string
}

export class WorkoutPlanner {
    /**
     * Save a generated workout plan to the database (Template Based)
     * Now maps 'date' to 'Day of Week' in the active plan.
     */
    static async saveWorkoutPlan(userId: number, date: string, exerciseId: number, sets: number, reps: string, orderIndex: number) {
        const db = getDb()

        // 1. Get or Create Active Plan
        let plan = await db.prepare('SELECT id FROM workout_plans WHERE user_id = ? AND is_active = 1').bind(userId).first()

        if (!plan) {
            await db.prepare('INSERT INTO workout_plans (user_id, plan_name, goal, days_per_week) VALUES (?, ?, ?, ?)').bind(userId, 'My Active Plan', 'maintain', 4).run()
            plan = await db.prepare('SELECT last_insert_rowid() as id').first()
        }

        const planId = plan.id

        // 2. Determine Day of Week (0-6)
        const dayOfWeek = new Date(date).getDay()

        // 3. Get or Create Daily Workout Entry
        let dailyWorkout = await db.prepare('SELECT id FROM daily_workouts WHERE workout_plan_id = ? AND day_of_week = ?').bind(planId, dayOfWeek).first()

        if (!dailyWorkout) {
            // Basic Type inference
            await db.prepare('INSERT INTO daily_workouts (workout_plan_id, day_of_week, workout_type) VALUES (?, ?, ?)')
                .bind(planId, dayOfWeek, 'Mixed').run()
            dailyWorkout = await db.prepare('SELECT last_insert_rowid() as id').first()
        }

        const dailyWorkoutId = dailyWorkout.id

        // 4. Insert Exercise into Template
        await db.prepare(`
            INSERT INTO workout_exercises (daily_workout_id, exercise_id, sets, reps, order_index)
            VALUES (?, ?, ?, ?, ?)
        `).bind(dailyWorkoutId, exerciseId, sets, parseInt(reps) || 10, orderIndex).run()
    }

    /**
     * Fetch a user's workout plan for a specific date (Resolving Template)
     */
    static async getDailyWorkout(userId: number, date: string) {
        const db = getDb()
        const dayOfWeek = new Date(date).getDay()

        // Nested Query: Find users active plan -> Find day's workout -> Get exercises
        const { results } = await db.prepare(`
      SELECT 
        we.id,
        we.sets,
        we.reps,
        we.order_index,
        e.name as exercise_name,
        e.muscle_group,
        e.equipment,
        e.gif_url,
        e.instructions as safety_instruction
      FROM workout_plans wp
      JOIN daily_workouts dw ON wp.id = dw.workout_plan_id
      JOIN workout_exercises we ON dw.id = we.daily_workout_id
      JOIN exercises e ON we.exercise_id = e.id
      WHERE wp.user_id = ? AND wp.is_active = 1 AND dw.day_of_week = ?
      ORDER BY we.order_index ASC
    `).bind(userId, dayOfWeek).all()

        return results || []
    }

    /**
     * Automatically generate and persist a workout plan based on user goals
     */
    static async generateAndSaveWeeklyPlan(userId: number, goal: string, activityLevel: string, equipment: string) {
        const db = getDb()

        // 1. Fetch available exercises
        const { results } = await db.prepare("SELECT * FROM exercises").all()
        const allExercises = results as unknown as ExerciseLibraryItem[]

        // 2. Archive existing plans (Set is_active = 0)
        await db.prepare(`UPDATE workout_plans SET is_active = 0 WHERE user_id = ?`).bind(userId).run()

        // 3. Create New Plan
        await db.prepare('INSERT INTO workout_plans (user_id, plan_name, goal, days_per_week) VALUES (?, ?, ?, ?)').bind(userId, `Generated ${goal} Plan`, goal, 4).run()
        const plan = await db.prepare('SELECT last_insert_rowid() as id').first()
        const planId = plan.id

        // Schedule Logic (Simplified PPL)
        const activeDays = [1, 2, 4, 5] // Mon, Tue, Thu, Fri (0 is Sun)

        for (let dayIndex of activeDays) {
            const muscleGroups = this.getMuscleGroupsForDay(dayIndex, goal)
            const typeName = muscleGroups.join(' + ')

            // Create Daily Template
            await db.prepare('INSERT INTO daily_workouts (workout_plan_id, day_of_week, workout_type, focus_area) VALUES (?, ?, ?, ?)')
                .bind(planId, dayIndex % 7, 'Strength', typeName).run()

            const dailyWorkout = await db.prepare('SELECT last_insert_rowid() as id').first()

            let orderIndex = 0
            for (const group of muscleGroups) {
                const pool = allExercises.filter(ex =>
                    ex.muscle_group.toLowerCase() === group.toLowerCase() &&
                    (equipment === 'gym' || ex.equipment.toLowerCase() === 'bodyweight' || ex.equipment.toLowerCase() === equipment)
                )

                if (pool.length > 0) {
                    const exercise = pool[Math.floor(Math.random() * pool.length)]
                    const sets = goal === 'muscle_building' ? 4 : 3
                    const reps = goal === 'strength' ? 6 : 10

                    await db.prepare(`
                        INSERT INTO workout_exercises (daily_workout_id, exercise_id, sets, reps, order_index)
                        VALUES (?, ?, ?, ?, ?)
                    `).bind(dailyWorkout.id, exercise.id, sets, reps, orderIndex++).run()
                }
            }
        }
    }

    private static getMuscleGroupsForDay(dayIndex: number, goal: string): string[] {
        // Simple PPL or Upper/Lower logic
        const cycle = dayIndex % 7
        if (cycle === 1) return ['chest', 'shoulders', 'triceps'] // Mon: Push
        if (cycle === 2) return ['back', 'biceps', 'legs'] // Tue: Pull/Legs Mixed
        if (cycle === 4) return ['legs', 'core'] // Thu: Legs
        if (cycle === 5) return ['chest', 'back'] // Fri: Upper Hybrid
        return ['core']
    }
}
