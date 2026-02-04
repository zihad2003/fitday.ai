/**
 * Notification Service
 * Handles scheduling and sending of notifications for workouts, meals, water, and sleep
 */

interface NotificationSchedule {
    type: 'workout' | 'meal' | 'water' | 'sleep' | 'motivation'
    title: string
    body: string
    scheduledTime: string // HH:MM format
    icon?: string
    tag?: string
}

interface UserPreferences {
    enable_workout_reminders: boolean
    enable_meal_reminders: boolean
    enable_water_reminders: boolean
    enable_sleep_reminders: boolean
    enable_motivational_messages: boolean
    workout_reminder_times?: string[] // JSON array
    meal_reminder_times?: string[] // JSON array
    water_reminder_times?: string[] // JSON array
}

interface UserProfile {
    wake_up_time?: string
    sleep_time?: string
    preferred_workout_time?: string
    workout_days_per_week?: number
}

export class NotificationService {
    private static instance: NotificationService
    private permission: NotificationPermission = 'default'

    private constructor() {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            this.permission = Notification.permission
        }
    }

    static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService()
        }
        return NotificationService.instance
    }

    /**
     * Request notification permission
     */
    async requestPermission(): Promise<boolean> {
        if (typeof window === 'undefined' || !('Notification' in window)) {
            console.warn('Notifications not supported')
            return false
        }

        if (this.permission === 'granted') {
            return true
        }

        try {
            const permission = await Notification.requestPermission()
            this.permission = permission
            return permission === 'granted'
        } catch (error) {
            console.error('Failed to request notification permission:', error)
            return false
        }
    }

    /**
     * Show a notification
     */
    async showNotification(title: string, options?: NotificationOptions): Promise<void> {
        if (this.permission !== 'granted') {
            const granted = await this.requestPermission()
            if (!granted) return
        }

        try {
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                // Use service worker for persistent notifications
                const registration = await navigator.serviceWorker.ready
                await registration.showNotification(title, {
                    icon: '/icon-192.png',
                    badge: '/badge-72.png',
                    vibrate: [200, 100, 200],
                    ...options,
                })
            } else {
                // Fallback to regular notification
                new Notification(title, {
                    icon: '/icon-192.png',
                    ...options,
                })
            }
        } catch (error) {
            console.error('Failed to show notification:', error)
        }
    }

    /**
     * Generate notification schedule based on user preferences
     */
    generateSchedule(preferences: UserPreferences, profile: UserProfile): NotificationSchedule[] {
        const schedule: NotificationSchedule[] = []

        // Workout Reminders
        if (preferences.enable_workout_reminders && profile.preferred_workout_time) {
            const workoutTime = this.adjustTime(profile.preferred_workout_time, -30) // 30 min before
            schedule.push({
                type: 'workout',
                title: '💪 Workout Time!',
                body: 'Your workout is scheduled in 30 minutes. Get ready!',
                scheduledTime: workoutTime,
                tag: 'workout-reminder',
            })
        }

        // Meal Reminders
        if (preferences.enable_meal_reminders) {
            const mealTimes = preferences.meal_reminder_times || ['08:00', '13:00', '16:00', '20:00']
            mealTimes.forEach((time, index) => {
                const mealNames = ['Breakfast', 'Lunch', 'Snack', 'Dinner']
                schedule.push({
                    type: 'meal',
                    title: `🍽️ ${mealNames[index]} Time`,
                    body: `Don't forget to log your ${mealNames[index].toLowerCase()}!`,
                    scheduledTime: time,
                    tag: `meal-${index}`,
                })
            })
        }

        // Water Reminders (every 2 hours during waking hours)
        if (preferences.enable_water_reminders) {
            const waterTimes = this.generateWaterReminders(
                profile.wake_up_time || '07:00',
                profile.sleep_time || '23:00'
            )
            waterTimes.forEach((time, index) => {
                schedule.push({
                    type: 'water',
                    title: '💧 Hydration Check',
                    body: 'Time to drink some water! Stay hydrated.',
                    scheduledTime: time,
                    tag: `water-${index}`,
                })
            })
        }

        // Sleep Reminder
        if (preferences.enable_sleep_reminders && profile.sleep_time) {
            const bedtimeReminder = this.adjustTime(profile.sleep_time, -30) // 30 min before
            schedule.push({
                type: 'sleep',
                title: '😴 Wind Down Time',
                body: 'Start preparing for bed. Good sleep is crucial for recovery!',
                scheduledTime: bedtimeReminder,
                tag: 'sleep-reminder',
            })
        }

        // Motivational Messages
        if (preferences.enable_motivational_messages) {
            schedule.push({
                type: 'motivation',
                title: '🌟 Daily Motivation',
                body: this.getMotivationalMessage(),
                scheduledTime: '09:00',
                tag: 'motivation-morning',
            })
        }

        return schedule
    }

    /**
     * Schedule all notifications
     */
    async scheduleNotifications(schedule: NotificationSchedule[]): Promise<void> {
        // Clear existing scheduled notifications
        await this.clearScheduledNotifications()

        // Schedule new notifications
        for (const item of schedule) {
            await this.scheduleNotification(item)
        }
    }

    /**
     * Schedule a single notification
     */
    private async scheduleNotification(item: NotificationSchedule): Promise<void> {
        const now = new Date()
        const [hours, minutes] = item.scheduledTime.split(':').map(Number)

        const scheduledDate = new Date()
        scheduledDate.setHours(hours, minutes, 0, 0)

        // If time has passed today, schedule for tomorrow
        if (scheduledDate <= now) {
            scheduledDate.setDate(scheduledDate.getDate() + 1)
        }

        const delay = scheduledDate.getTime() - now.getTime()

        // Store in localStorage for persistence
        const scheduledNotifications = this.getScheduledNotifications()
        scheduledNotifications.push({
            ...item,
            scheduledDate: scheduledDate.toISOString(),
        })
        localStorage.setItem('scheduled_notifications', JSON.stringify(scheduledNotifications))

        // Set timeout
        setTimeout(() => {
            this.showNotification(item.title, {
                body: item.body,
                tag: item.tag,
                requireInteraction: false,
                silent: false,
            })
        }, delay)
    }

    /**
     * Clear all scheduled notifications
     */
    private async clearScheduledNotifications(): Promise<void> {
        localStorage.removeItem('scheduled_notifications')
    }

    /**
     * Get scheduled notifications from storage
     */
    private getScheduledNotifications(): any[] {
        const stored = localStorage.getItem('scheduled_notifications')
        return stored ? JSON.parse(stored) : []
    }

    /**
     * Generate water reminder times
     */
    private generateWaterReminders(wakeTime: string, sleepTime: string): string[] {
        const [wakeHour] = wakeTime.split(':').map(Number)
        const [sleepHour] = sleepTime.split(':').map(Number)

        const times: string[] = []
        let currentHour = wakeHour + 1 // Start 1 hour after waking

        while (currentHour < sleepHour) {
            times.push(`${currentHour.toString().padStart(2, '0')}:00`)
            currentHour += 2 // Every 2 hours
        }

        return times
    }

    /**
     * Adjust time by minutes
     */
    private adjustTime(time: string, minutesOffset: number): string {
        const [hours, minutes] = time.split(':').map(Number)
        const date = new Date()
        date.setHours(hours, minutes + minutesOffset, 0, 0)

        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    }

    /**
     * Get random motivational message
     */
    private getMotivationalMessage(): string {
        const messages = [
            'You are stronger than you think! 💪',
            'Every workout counts. Keep going!',
            'Progress, not perfection. You got this!',
            'Your only limit is you. Push harder!',
            'Consistency is key. Stay committed!',
            'Believe in yourself and your goals!',
            'Small steps lead to big changes!',
            'You are one workout away from a good mood!',
            'Champions train, losers complain. Be a champion!',
            'Your body can do it. Convince your mind!',
        ]
        return messages[Math.floor(Math.random() * messages.length)]
    }

    /**
     * Send workout reminder
     */
    async sendWorkoutReminder(workoutType: string, timeUntil: number): Promise<void> {
        await this.showNotification('💪 Workout Reminder', {
            body: `${workoutType} workout in ${timeUntil} minutes. Get ready!`,
            tag: 'workout-reminder',
            actions: [
                { action: 'view', title: 'View Workout' },
                { action: 'dismiss', title: 'Dismiss' },
            ],
        })
    }

    /**
     * Send meal reminder
     */
    async sendMealReminder(mealType: string): Promise<void> {
        await this.showNotification(`🍽️ ${mealType} Time`, {
            body: `Time for your ${mealType.toLowerCase()}. Don't forget to log it!`,
            tag: `meal-${mealType.toLowerCase()}`,
            actions: [
                { action: 'log', title: 'Log Meal' },
                { action: 'dismiss', title: 'Dismiss' },
            ],
        })
    }

    /**
     * Send water reminder
     */
    async sendWaterReminder(currentIntake: number, goal: number): Promise<void> {
        const remaining = goal - currentIntake
        await this.showNotification('💧 Hydration Check', {
            body: `You've had ${currentIntake}ml today. ${remaining}ml to go!`,
            tag: 'water-reminder',
            actions: [
                { action: 'log-water', title: 'Log Water' },
                { action: 'dismiss', title: 'Dismiss' },
            ],
        })
    }

    /**
     * Send progress update
     */
    async sendProgressUpdate(message: string): Promise<void> {
        await this.showNotification('📊 Progress Update', {
            body: message,
            tag: 'progress-update',
        })
    }

    /**
     * Send achievement notification
     */
    async sendAchievement(title: string, description: string): Promise<void> {
        await this.showNotification(`🏆 ${title}`, {
            body: description,
            tag: 'achievement',
            requireInteraction: true,
        })
    }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance()

// Helper function to initialize notifications
export async function initializeNotifications(
    preferences: UserPreferences,
    profile: UserProfile
): Promise<boolean> {
    const service = NotificationService.getInstance()
    const granted = await service.requestPermission()

    if (granted) {
        const schedule = service.generateSchedule(preferences, profile)
        await service.scheduleNotifications(schedule)
    }

    return granted
}
