/**
 * Water Goal Calculator & Reminder Logic
 * Calculates personalized water needs and optimal reminder schedules
 */

interface WaterFactors {
    weight_kg: number
    activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
    climate?: 'cool' | 'moderate' | 'hot' | 'humid'
    workout_duration_min?: number
    is_workout_day?: boolean
}

export class WaterCalculator {
    /**
     * Calculate daily water goal in ml
     * Based on weight, activity, and environmental factors
     */
    static calculateDailyGoal(factors: WaterFactors): number {
        // Baseline: 35ml per kg of body weight
        let goal = factors.weight_kg * 35

        // Activity Level Adjustment
        const activityMultipliers = {
            sedentary: 1.0,
            light: 1.1,
            moderate: 1.2,
            active: 1.3,
            very_active: 1.4,
        }
        goal *= activityMultipliers[factors.activity_level]

        // Workout adjustment: Add 500ml for every 30 mins of exercise
        if (factors.is_workout_day && factors.workout_duration_min) {
            goal += (factors.workout_duration_min / 30) * 500
        }

        // Climate adjustment
        if (factors.climate === 'hot' || factors.climate === 'humid') {
            goal += 500
        }

        return Math.round(goal / 50) * 50 // Round to nearest 50ml
    }

    /**
     * Generate smart hydration reminders
     */
    static generateReminders(
        wakeTime: string,
        sleepTime: string,
        workoutTime?: string,
        totalGoal: number = 2500
    ): WaterReminder[] {
        const reminders: WaterReminder[] = []

        // 1. Wake Up Hydration (10 mins after waking)
        const wake = this.parseTime(wakeTime)
        reminders.push({
            time: this.formatTime(wake + 10),
            label: 'Wake Up Hydration',
            message: 'Start your day with a glass of water to jumpstart your metabolism! 💧',
            amount_ml: 250,
            priority: 'high'
        })

        // 2. Workout Hydration (if workout day)
        if (workoutTime) {
            const workout = this.parseTime(workoutTime)

            // 45 min before
            reminders.push({
                time: this.formatTime(workout - 45),
                label: 'Pre-Workout Prep',
                message: 'Hydrate now for better performance! 💪',
                amount_ml: 350,
                priority: 'high'
            })

            // Immediately after
            reminders.push({
                time: this.formatTime(workout + 60), // Assuming 1hr workout
                label: 'Post-Workout Recovery',
                message: 'Replenish fluids lost during your workout.',
                amount_ml: 500,
                priority: 'critical'
            })
        }

        // 3. Hourly Reminders during activity window
        const startHour = Math.ceil((wake + 60) / 60)
        const endHour = Math.floor((this.parseTime(sleepTime) - 60) / 60)

        // Distribute remaining goal across the day
        const existingVolume = reminders.reduce((sum, r) => sum + r.amount_ml, 0)
        const remainingGoal = Math.max(0, totalGoal - existingVolume)
        const activeHours = endHour - startHour
        const hourlyAmount = Math.round(remainingGoal / activeHours / 50) * 50

        for (let h = startHour; h < endHour; h++) {
            // Don't schedule if it clashes closely with workout reminders
            const timeInMins = h * 60
            const isClashing = reminders.some(r => Math.abs(this.parseTime(r.time) - timeInMins) < 45)

            if (!isClashing) {
                reminders.push({
                    time: `${h.toString().padStart(2, '0')}:00`,
                    label: 'Hydration Check',
                    message: this.getRandomMessage(),
                    amount_ml: hourlyAmount,
                    priority: 'medium'
                })
            }
        }

        // 4. Bedtime Hydration (1 hour before bed)
        reminders.push({
            time: this.formatTime(this.parseTime(sleepTime) - 60),
            label: 'Evening Hydration',
            message: 'A small glass of water before bed aids recovery.',
            amount_ml: 200,
            priority: 'low'
        })

        return reminders.sort((a, b) => this.parseTime(a.time) - this.parseTime(b.time))
    }

    private static parseTime(time: string): number {
        const [h, m] = time.split(':').map(Number)
        return h * 60 + m
    }

    private static formatTime(mins: number): string {
        const h = Math.floor(mins / 60) % 24
        const m = mins % 60
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
    }

    private static getRandomMessage(): string {
        const messages = [
            "Time for a hydration break! 💧",
            "Your brain needs water to focus. Drink up!",
            "Stay hydrated, stay energized! ⚡",
            "Empty glass? Time to refill! 🚰",
            "Clear skin starts with hydration. ✨",
            "Water break! Your body will thank you.",
        ]
        return messages[Math.floor(Math.random() * messages.length)]
    }
}

export interface WaterReminder {
    time: string
    label: string
    message: string
    amount_ml: number
    priority: 'critical' | 'high' | 'medium' | 'low'
}
