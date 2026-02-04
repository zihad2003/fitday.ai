'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { showToast } from '@/components/animations/Toast'

interface NotificationContextType {
    permission: NotificationPermission
    requestPermission: () => Promise<void>
    sendNotification: (title: string, options?: NotificationOptions) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [permission, setPermission] = useState<NotificationPermission>('default')

    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setPermission(Notification.permission)
        }
    }, [])

    const requestPermission = async () => {
        if (typeof window === 'undefined' || !('Notification' in window)) return

        const result = await Notification.requestPermission()
        setPermission(result)

        if (result === 'granted') {
            showToast('Neural Notifications Active', 'success')
        }
    }

    const sendNotification = (title: string, options?: NotificationOptions) => {
        if (permission === 'granted') {
            new Notification(title, {
                icon: '/logo.png', // Fallback icon
                ...options
            })
        } else {
            // Fallback to toast if browser notifications are blocked or not supported
            showToast(title, 'info')
        }
    }

    return (
        <NotificationContext.Provider value={{ permission, requestPermission, sendNotification }}>
            {children}
        </NotificationContext.Provider>
    )
}

export function useNotifications() {
    const context = useContext(NotificationContext)
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider')
    }
    return context
}
