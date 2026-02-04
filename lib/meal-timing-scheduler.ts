/**
 * Meal Timing Scheduler
 * Calculates optimal meal times based on user schedule and workout timing
 */

interface UserSchedule {
    wake_up_time: string // HH:MM
    sleep_time: string // HH:MM
    preferred_workout_time?: string // HH:MM
    work_start_time?: string // HH:MM
    work_end_time?: string // HH:MM
}

interface MealTiming {
    meal_type: 'breakfast' | 'mid_morning_snack' | 'lunch' | 'pre_workout' | 'post_workout' | 'dinner' | 'evening_snack'
    meal_name: string
    scheduled_time: string // HH:MM
    time_window: string // e.g., "7:00 AM - 8:00 AM"
    calories_target: number
    protein_target: number
    carbs_target: number
    fats_target: number
    importance: 'critical' | 'high' | 'medium' | 'optional'
    notes: string[]
}

interface DailyMealSchedule {
    total_calories: number
    total_protein: number
    total_carbs: number
    total_fats: number
    meals: MealTiming[]
    meal_count: number
    eating_window_hours: number
}

export class MealTimingScheduler {
    private schedule: UserSchedule
    private totalCalories: number
    private fitnessGoal: string
    private hasWorkout: boolean

    constructor(
        schedule: UserSchedule,
        totalCalories: number,
        fitnessGoal: string,
        hasWorkout: boolean = true
    ) {
        this.schedule = schedule
        this.totalCalories = totalCalories
        this.fitnessGoal = fitnessGoal
        this.hasWorkout = hasWorkout
    }

    /**
     * Generate complete daily meal schedule
     */
    generateSchedule(): DailyMealSchedule {
        const meals: MealTiming[] = []
        const macros = this.calculateMacroTargets()

        // Calculate eating window
        const wakeTime = this.parseTime(this.schedule.wake_up_time)
        const sleepTime = this.parseTime(this.schedule.sleep_time)
        const eatingWindowHours = this.calculateEatingWindow(wakeTime, sleepTime)

        // Generate meal timings
        meals.push(this.scheduleBreakfast(macros))

        if (this.totalCalories >= 2000) {
            meals.push(this.scheduleMidMorningSnack(macros))
        }

        meals.push(this.scheduleLunch(macros))

        if (this.hasWorkout && this.schedule.preferred_workout_time) {
            meals.push(this.schedulePreWorkout(macros))
            meals.push(this.schedulePostWorkout(macros))
        }

        meals.push(this.scheduleDinner(macros))

        if (this.totalCalories >= 2500 || this.fitnessGoal === 'build_muscle') {
            meals.push(this.scheduleEveningSnack(macros))
        }

        return {
            total_calories: this.totalCalories,
            total_protein: macros.protein,
            total_carbs: macros.carbs,
            total_fats: macros.fats,
            meals: meals.sort((a, b) => this.parseTime(a.scheduled_time) - this.parseTime(b.scheduled_time)),
            meal_count: meals.length,
            eating_window_hours: eatingWindowHours,
        }
    }

    /**
     * Schedule breakfast
     */
    private scheduleBreakfast(macros: any): MealTiming {
        const wakeTime = this.parseTime(this.schedule.wake_up_time)
        const breakfastTime = this.addMinutes(wakeTime, 30) // 30 min after waking

        const caloriePercent = this.fitnessGoal === 'lose_weight' ? 0.25 : 0.30

        return {
            meal_type: 'breakfast',
            meal_name: 'Breakfast',
            scheduled_time: this.formatTime(breakfastTime),
            time_window: this.getTimeWindow(breakfastTime, 60),
            calories_target: Math.round(this.totalCalories * caloriePercent),
            protein_target: Math.round(macros.protein * 0.25),
            carbs_target: Math.round(macros.carbs * 0.30),
            fats_target: Math.round(macros.fats * 0.20),
            importance: 'critical',
            notes: [
                'Most important meal - kickstarts metabolism',
                'Include protein to reduce hunger throughout the day',
                'Complex carbs for sustained energy',
            ],
        }
    }

    /**
     * Schedule mid-morning snack
     */
    private scheduleMidMorningSnack(macros: any): MealTiming {
        const breakfastTime = this.parseTime(this.schedule.wake_up_time) + 30
        const snackTime = this.addMinutes(breakfastTime, 150) // 2.5 hours after breakfast

        return {
            meal_type: 'mid_morning_snack',
            meal_name: 'Mid-Morning Snack',
            scheduled_time: this.formatTime(snackTime),
            time_window: this.getTimeWindow(snackTime, 30),
            calories_target: Math.round(this.totalCalories * 0.10),
            protein_target: Math.round(macros.protein * 0.10),
            carbs_target: Math.round(macros.carbs * 0.10),
            fats_target: Math.round(macros.fats * 0.10),
            importance: 'medium',
            notes: [
                'Prevents mid-morning energy crash',
                'Keep it light and protein-rich',
            ],
        }
    }

    /**
     * Schedule lunch
     */
    private scheduleLunch(macros: any): MealTiming {
        const workStart = this.schedule.work_start_time
            ? this.parseTime(this.schedule.work_start_time)
            : this.parseTime(this.schedule.wake_up_time) + 180

        const lunchTime = this.addMinutes(workStart, 240) // 4 hours after work start

        const caloriePercent = this.fitnessGoal === 'lose_weight' ? 0.30 : 0.35

        return {
            meal_type: 'lunch',
            meal_name: 'Lunch',
            scheduled_time: this.formatTime(lunchTime),
            time_window: this.getTimeWindow(lunchTime, 60),
            calories_target: Math.round(this.totalCalories * caloriePercent),
            protein_target: Math.round(macros.protein * 0.35),
            carbs_target: Math.round(macros.carbs * 0.35),
            fats_target: Math.round(macros.fats * 0.30),
            importance: 'critical',
            notes: [
                'Largest meal of the day for most people',
                'Balance all macronutrients',
                'Include vegetables for fiber and micronutrients',
            ],
        }
    }

    /**
     * Schedule pre-workout meal
     */
    private schedulePreWorkout(macros: any): MealTiming {
        if (!this.schedule.preferred_workout_time) {
            throw new Error('Workout time required for pre-workout meal')
        }

        const workoutTime = this.parseTime(this.schedule.preferred_workout_time)
        const preWorkoutTime = this.addMinutes(workoutTime, -90) // 1.5 hours before workout

        return {
            meal_type: 'pre_workout',
            meal_name: 'Pre-Workout Meal',
            scheduled_time: this.formatTime(preWorkoutTime),
            time_window: this.getTimeWindow(preWorkoutTime, 30),
            calories_target: Math.round(this.totalCalories * 0.15),
            protein_target: Math.round(macros.protein * 0.15),
            carbs_target: Math.round(macros.carbs * 0.20), // Higher carbs for energy
            fats_target: Math.round(macros.fats * 0.10), // Lower fats for faster digestion
            importance: 'high',
            notes: [
                'Eat 1-2 hours before workout',
                'Focus on easily digestible carbs and moderate protein',
                'Avoid high-fat foods (slow digestion)',
                'Stay hydrated',
            ],
        }
    }

    /**
     * Schedule post-workout meal
     */
    private schedulePostWorkout(macros: any): MealTiming {
        if (!this.schedule.preferred_workout_time) {
            throw new Error('Workout time required for post-workout meal')
        }

        const workoutTime = this.parseTime(this.schedule.preferred_workout_time)
        const postWorkoutTime = this.addMinutes(workoutTime, 90) // 1.5 hours after workout (assuming 60 min workout + 30 min)

        const caloriePercent = this.fitnessGoal === 'build_muscle' ? 0.25 : 0.20

        return {
            meal_type: 'post_workout',
            meal_name: 'Post-Workout Meal',
            scheduled_time: this.formatTime(postWorkoutTime),
            time_window: this.getTimeWindow(postWorkoutTime, 60),
            calories_target: Math.round(this.totalCalories * caloriePercent),
            protein_target: Math.round(macros.protein * 0.30), // High protein for recovery
            carbs_target: Math.round(macros.carbs * 0.25), // Replenish glycogen
            fats_target: Math.round(macros.fats * 0.15),
            importance: 'critical',
            notes: [
                'CRITICAL for muscle recovery and growth',
                'Eat within 2 hours of finishing workout',
                'High protein (30-40g) for muscle repair',
                'Fast-digesting carbs to replenish glycogen',
                'This is the most important meal for muscle building',
            ],
        }
    }

    /**
     * Schedule dinner
     */
    private scheduleDinner(macros: any): MealTiming {
        const sleepTime = this.parseTime(this.schedule.sleep_time)
        const dinnerTime = this.addMinutes(sleepTime, -180) // 3 hours before sleep

        const caloriePercent = this.fitnessGoal === 'lose_weight' ? 0.25 : 0.20

        return {
            meal_type: 'dinner',
            meal_name: 'Dinner',
            scheduled_time: this.formatTime(dinnerTime),
            time_window: this.getTimeWindow(dinnerTime, 90),
            calories_target: Math.round(this.totalCalories * caloriePercent),
            protein_target: Math.round(macros.protein * 0.25),
            carbs_target: Math.round(macros.carbs * 0.20),
            fats_target: Math.round(macros.fats * 0.30),
            importance: 'high',
            notes: [
                'Eat at least 2-3 hours before bed',
                'Moderate carbs, higher protein and fats',
                'Avoid heavy, hard-to-digest foods',
            ],
        }
    }

    /**
     * Schedule evening snack
     */
    private scheduleEveningSnack(macros: any): MealTiming {
        const sleepTime = this.parseTime(this.schedule.sleep_time)
        const snackTime = this.addMinutes(sleepTime, -90) // 1.5 hours before sleep

        return {
            meal_type: 'evening_snack',
            meal_name: 'Evening Snack',
            scheduled_time: this.formatTime(snackTime),
            time_window: this.getTimeWindow(snackTime, 30),
            calories_target: Math.round(this.totalCalories * 0.10),
            protein_target: Math.round(macros.protein * 0.10),
            carbs_target: Math.round(macros.carbs * 0.05),
            fats_target: Math.round(macros.fats * 0.15),
            importance: 'optional',
            notes: [
                'Optional - only if calories allow',
                'Focus on slow-digesting protein (casein)',
                'Helps prevent muscle breakdown overnight',
                'Keep it light',
            ],
        }
    }

    /**
     * Calculate macro targets
     */
    private calculateMacroTargets(): { protein: number; carbs: number; fats: number } {
        let proteinPercent, carbsPercent, fatsPercent

        switch (this.fitnessGoal) {
            case 'build_muscle':
                proteinPercent = 0.30
                carbsPercent = 0.45
                fatsPercent = 0.25
                break
            case 'lose_weight':
                proteinPercent = 0.35
                carbsPercent = 0.35
                fatsPercent = 0.30
                break
            case 'increase_strength':
                proteinPercent = 0.30
                carbsPercent = 0.50
                fatsPercent = 0.20
                break
            default:
                proteinPercent = 0.25
                carbsPercent = 0.45
                fatsPercent = 0.30
        }

        return {
            protein: Math.round((this.totalCalories * proteinPercent) / 4),
            carbs: Math.round((this.totalCalories * carbsPercent) / 4),
            fats: Math.round((this.totalCalories * fatsPercent) / 9),
        }
    }

    // Utility methods
    private parseTime(time: string): number {
        const [hours, minutes] = time.split(':').map(Number)
        return hours * 60 + minutes
    }

    private formatTime(minutes: number): string {
        const hours = Math.floor(minutes / 60) % 24
        const mins = minutes % 60
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
    }

    private addMinutes(baseMinutes: number, minutesToAdd: number): number {
        return (baseMinutes + minutesToAdd + 1440) % 1440 // Handle day wraparound
    }

    private getTimeWindow(centerTime: number, windowMinutes: number): string {
        const start = this.addMinutes(centerTime, -windowMinutes / 2)
        const end = this.addMinutes(centerTime, windowMinutes / 2)
        return `${this.formatTime(start)} - ${this.formatTime(end)}`
    }

    private calculateEatingWindow(wakeTime: number, sleepTime: number): number {
        if (sleepTime > wakeTime) {
            return (sleepTime - wakeTime) / 60
        } else {
            return (1440 - wakeTime + sleepTime) / 60
        }
    }
}

/**
 * Generate meal schedule for user
 */
export function generateMealSchedule(
    schedule: UserSchedule,
    totalCalories: number,
    fitnessGoal: string,
    hasWorkout: boolean = true
): DailyMealSchedule {
    const scheduler = new MealTimingScheduler(schedule, totalCalories, fitnessGoal, hasWorkout)
    return scheduler.generateSchedule()
}
