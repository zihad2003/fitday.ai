'use client'

import { useEffect, useRef } from 'react'
import { ScheduleItem } from '@/lib/schedule-engine'
import { notificationService } from '@/lib/notification-service'

export function useNotificationSystem(schedule: ScheduleItem[]) {
    const lastCheck = useRef<string>('')

    useEffect(() => {
        // Request permission on mount (non-intrusive usually, but browsers might block if not user triggered)
        // Better to have a UI button, but for proactive system we try.
        // notificationService.requestPermission() 

        const checkSchedule = () => {
            const now = new Date()
            const currentHM = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })

            if (currentHM === lastCheck.current) return
            lastCheck.current = currentHM

            const currentMinutes = now.getHours() * 60 + now.getMinutes()
            const dayKey = now.toDateString()

            schedule.forEach(item => {
                // Parse item time
                const [h, m] = item.time.split(':').map(Number)
                const itemMinutes = h * 60 + m

                // 1. EXACT TIME ALERT
                if (Math.abs(itemMinutes - currentMinutes) < 1) { // Within 1 minute
                    const key = `notif_exact_${dayKey}_${item.id}`
                    const isCompletedStored = localStorage.getItem(`completed_tasks_${dayKey}`)
                    const completedIds = isCompletedStored ? JSON.parse(isCompletedStored) : []

                    if (!localStorage.getItem(key) && !completedIds.includes(item.id)) {
                        fireNotification(item)
                        localStorage.setItem(key, 'true')
                    }
                }

                // 2. PRE-WORKOUT ALERT (30 mins before)
                if (item.type === 'workout') {
                    if (Math.abs(itemMinutes - 30 - currentMinutes) < 1) {
                        const key = `notif_pre_${dayKey}_${item.id}`
                        if (!localStorage.getItem(key)) {
                            notificationService.showNotification(`⚡ Get Ready: Workout in 30m`, {
                                body: `Fuel up! ${item.title} starts soon.`,
                                tag: 'pre-workout'
                            })
                            localStorage.setItem(key, 'true')
                        }
                    }
                }
            })
        }

        const timer = setInterval(checkSchedule, 10000) // Check every 10s
        checkSchedule() // Initial check

        return () => clearInterval(timer)
    }, [schedule])

    const fireNotification = (item: ScheduleItem) => {
        const today = new Date().toDateString()
        const stored = localStorage.getItem(`completed_tasks_${today}`)
        const completed = stored ? JSON.parse(stored) : []
        const pendingCount = schedule.filter(s => s.time < item.time && !completed.includes(s.id)).length

        let title = item.title
        let body = item.description
        const motivation = (notificationService as any).getMotivationalMessage?.() || "You got this!"

        // Smart Tone Adjustment
        if (pendingCount > 1) {
            title = `⚠️ Catching Up? ${item.title}`
            body = `You have a few things pending. Let's get back on track with this ${item.type}! ${motivation}`
        } else {
            switch (item.type) {
                case 'meal':
                    title = `🍽️ Fuel Time: ${item.title}`
                    body = `Stay energized! ${item.description}. ${motivation}`
                    break
                case 'workout':
                    title = `💪 Protocol: Workout`
                    body = `Time to execute ${item.title}. ${motivation}`
                    break
                case 'hydration':
                    title = `💧 Hydrate`
                    body = `Drink 500ml water to keep your metabolism prime.`
                    break
                case 'sleep':
                    title = `🌙 System Recovery`
                    body = `Prepare for 8h of deep recovery. Screens off soon!`
                    break
            }
        }

        notificationService.showNotification(title, {
            body,
            icon: '/icons/icon-192.png',
            vibrate: [200, 100, 200]
        } as any)
    }

    // Daily Progress Check-in (fires once a day at 9:00 PM)
    useEffect(() => {
        const checkProgress = () => {
            const now = new Date()
            if (now.getHours() === 21 && now.getMinutes() === 0) {
                const today = now.toDateString()
                const key = `daily_checkin_${today}`
                if (!localStorage.getItem(key)) {
                    const stored = localStorage.getItem(`completed_tasks_${today}`)
                    const completed = stored ? JSON.parse(stored) : []
                    const total = schedule.length
                    const percentage = Math.round((completed.length / total) * 100)

                    let message = `You completed ${percentage}% of your protocol today! `
                    if (percentage >= 80) message += "Legendary adherence! 🔥"
                    else if (percentage >= 50) message += "Solid progress. Rest up!"
                    else message += "Tomorrow is a new day to crush it."

                    notificationService.showNotification(`📊 Daily Debrief`, {
                        body: message,
                        tag: 'daily-checkin'
                    })
                    localStorage.setItem(key, 'true')
                }
            }
        }

        const timer = setInterval(checkProgress, 60000)
        return () => clearInterval(timer)
    }, [schedule])

    return {
        requestPermission: () => notificationService.requestPermission(),
        sendTest: () => notificationService.showNotification("FitDay AI", { body: "Proactive Monitoring Active 🚀" })
    }
}
