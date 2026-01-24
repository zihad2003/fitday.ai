'use client'

import { useState, useRef, useCallback, ReactNode } from 'react'
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'

interface PullToRefreshProps {
    onRefresh: () => Promise<void>
    children: ReactNode
    threshold?: number
    disabled?: boolean
}

/**
 * Pull to Refresh Component
 * Provides mobile-friendly pull-to-refresh functionality
 */
export function PullToRefresh({
    onRefresh,
    children,
    threshold = 80,
    disabled = false
}: PullToRefreshProps) {
    const [isRefreshing, setIsRefreshing] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const y = useMotionValue(0)

    // Transform pull distance to rotation for spinner
    const rotate = useTransform(y, [0, threshold], [0, 360])
    const opacity = useTransform(y, [0, threshold], [0, 1])
    const scale = useTransform(y, [0, threshold], [0.5, 1])

    const handleDragEnd = useCallback(async (_: any, info: PanInfo) => {
        if (disabled || isRefreshing) return

        if (info.offset.y > threshold) {
            setIsRefreshing(true)
            try {
                await onRefresh()
            } finally {
                setIsRefreshing(false)
                y.set(0)
            }
        } else {
            y.set(0)
        }
    }, [disabled, isRefreshing, threshold, onRefresh, y])

    return (
        <div ref={containerRef} className="relative overflow-hidden">
            {/* Pull Indicator */}
            <motion.div
                className="absolute top-0 left-0 right-0 flex items-center justify-center"
                style={{
                    opacity,
                    y: useTransform(y, (value) => Math.max(0, value - 40)),
                }}
            >
                <motion.div
                    className="flex flex-col items-center gap-2 py-4"
                    style={{ scale }}
                >
                    <motion.div
                        className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full"
                        style={{ rotate }}
                        animate={isRefreshing ? { rotate: 360 } : {}}
                        transition={isRefreshing ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
                    />
                    <span className="text-xs text-purple-400 font-medium">
                        {isRefreshing ? 'Refreshing...' : 'Pull to refresh'}
                    </span>
                </motion.div>
            </motion.div>

            {/* Content */}
            <motion.div
                drag={!disabled && !isRefreshing ? 'y' : false}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0.5, bottom: 0 }}
                onDragEnd={handleDragEnd}
                style={{ y }}
                className="touch-pan-y"
            >
                {children}
            </motion.div>
        </div>
    )
}

/**
 * Refresh Button
 * Alternative refresh trigger for desktop
 */
export function RefreshButton({ onRefresh, isLoading }: { onRefresh: () => void; isLoading?: boolean }) {
    return (
        <motion.button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <motion.svg
                className="w-5 h-5 text-purple-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                animate={isLoading ? { rotate: 360 } : {}}
                transition={isLoading ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
            </motion.svg>
        </motion.button>
    )
}
