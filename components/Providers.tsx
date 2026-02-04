'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { ReactNode, useEffect } from 'react'
import { NotificationProvider } from './providers/NotificationProvider'
import { CelebrationProvider } from './providers/CelebrationProvider'
import { Analytics } from '@/lib/analytics'

export default function Providers({ children }: { children: ReactNode }) {
    useEffect(() => {
        // Track session start and retention heartbeat
        Analytics.trackInteraction('session_heartbeat', { type: 'start' })

        const interval = setInterval(() => {
            Analytics.trackInteraction('session_heartbeat', { type: 'pulse' })
        }, 60000 * 5) // Pulse every 5 minutes

        return () => clearInterval(interval)
    }, [])

    return (
        <QueryClientProvider client={queryClient}>
            <NotificationProvider>
                <CelebrationProvider>
                    {children}
                </CelebrationProvider>
            </NotificationProvider>
        </QueryClientProvider>
    )
}
