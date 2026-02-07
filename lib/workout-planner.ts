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

export class WorkoutPlanner {
    /**
     * Save a generated workout plan to the database.
     * Maps to the 'workout_plans' table which stores planned exercises for a specific date.
     */
    static async saveWorkoutPlan(userId: number, date: string, exerciseId: number, sets: number, reps: string, orderIndex: number) {
        const db = getDb()

        // Insert directly into workout_plans
        await db.prepare(`
            INSERT INTO workout_plans (user_id, date, exercise_id, sets, reps, order_index, is_generated)
            VALUES (?, ?, ?, ?, ?, ?, 1)
        `).bind(userId, date, exerciseId, sets, reps, orderIndex).run()
    }

    /**
     * Fetch a user's workout plan for a specific date.
     */
    static async getDailyWorkout(userId: number, date: string) {
        const db = getDb()

        // Join workout_plans with exercise_library
        const { results } = await db.prepare(`
            SELECT 
                wp.id,
                wp.sets,
                wp.reps,
                wp.weight,
                wp.duration,
                wp.order_index,
                wp.is_generated,
                e.name as exercise_name,
                e.muscle_group,
                e.equipment_needed as equipment,
                e.gif_url,
                e.safety_instruction
            FROM workout_plans wp
            JOIN exercise_library e ON wp.exercise_id = e.id
            WHERE wp.user_id = ? AND wp.date = ?
            ORDER BY wp.order_index ASC
        `).bind(userId, date).all()

        return results || []
    }

    /**
     * Automatically generate and persist a workout plan based on user goals for the upcoming week.
     * Since we don't have a template system in the schema, we generate for the next 7 days.
     */
    static async generateAndSaveWeeklyPlan(userId: number, goal: string, activityLevel: string, equipment: string) {
        const db = getDb()

        // 1. Fetch available exercises
        const { results } = await db.prepare("SELECT * FROM exercise_library").all()
        const allExercises = results as unknown as ExerciseLibraryItem[]

        if (!allExercises || allExercises.length === 0) {
            console.warn("No exercises found in library.");
            return;
        }

        // 2. Clear existing future plans (optional, to avoid duplicates)
        // await db.prepare('DELETE FROM workout_plans WHERE user_id = ? AND date >= ?').bind(userId, new Date().toISOString().split('T')[0]).run()

        // 3. Generate for next 7 days
        const today = new Date();
        const activeDays = [1, 2, 4, 5] // Mon, Tue, Thu, Fri (0 is Sun)

        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(today);
            currentDate.setDate(today.getDate() + i);
            const dateStr = currentDate.toISOString().split('T')[0];
            const dayOfWeek = currentDate.getDay();

            if (activeDays.includes(dayOfWeek)) {
                const muscleGroups = this.getMuscleGroupsForDay(dayOfWeek, goal);

                let orderIndex = 0;
                for (const group of muscleGroups) {
                    const pool = allExercises.filter(ex =>
                        ex.muscle_group.toLowerCase() === group.toLowerCase() &&
                        (equipment === 'gym' || ex.equipment_needed.toLowerCase() === 'bodyweight' || ex.equipment_needed.toLowerCase() === equipment)
                    )

                    if (pool.length > 0) {
                        const exercise = pool[Math.floor(Math.random() * pool.length)]
                        const sets = goal === 'gain_muscle' ? 4 : 3
                        const reps = goal === 'increase_strength' ? '5' : '10-12'

                        await this.saveWorkoutPlan(userId, dateStr, exercise.id, sets, reps, orderIndex++);
                    }
                }
            }
        }
    }

    private static getMuscleGroupsForDay(dayIndex: number, goal: string): string[] {
        // Simple PPL or Upper/Lower logic
        // 0=Sun, 1=Mon...
        const cycle = dayIndex;
        if (cycle === 1) return ['chest', 'shoulders', 'triceps'] // Mon: Push
        if (cycle === 2) return ['back', 'biceps', 'legs'] // Tue: Pull/Legs Mixed
        if (cycle === 4) return ['legs', 'core'] // Thu: Legs
        if (cycle === 5) return ['chest', 'back'] // Fri: Upper Hybrid
        return ['core']
    }
}
