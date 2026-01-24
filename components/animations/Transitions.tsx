'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { ReactNode, CSSProperties } from 'react'

interface BaseProps {
    children: ReactNode
    className?: string
    style?: CSSProperties
}

/**
 * Page Transition Wrapper
 * Provides smooth fade and slide animations between page changes
 */
export function PageTransition({ children, className, style }: BaseProps) {
    const pathname = usePathname()

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={pathname}
                className={className}
                style={style}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{
                    duration: 0.3,
                    ease: [0.22, 1, 0.36, 1],
                }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    )
}

/**
 * Fade In Animation
 */
export function FadeIn({ children, delay = 0, className, style }: BaseProps & { delay?: number }) {
    return (
        <motion.div
            className={className}
            style={style}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay }}
        >
            {children}
        </motion.div>
    )
}

/**
 * Slide Up Animation
 */
export function SlideUp({ children, delay = 0, className, style }: BaseProps & { delay?: number }) {
    return (
        <motion.div
            className={className}
            style={style}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
        >
            {children}
        </motion.div>
    )
}

/**
 * Scale In Animation
 */
export function ScaleIn({ children, delay = 0, className, style }: BaseProps & { delay?: number }) {
    return (
        <motion.div
            className={className}
            style={style}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
        >
            {children}
        </motion.div>
    )
}

/**
 * Stagger Children Animation
 */
export function StaggerContainer({ children, staggerDelay = 0.1, className, style }: BaseProps & { staggerDelay?: number }) {
    return (
        <motion.div
            className={className}
            style={style}
            initial="hidden"
            animate="visible"
            variants={{
                visible: {
                    transition: {
                        staggerChildren: staggerDelay,
                    },
                },
            }}
        >
            {children}
        </motion.div>
    )
}

/**
 * Stagger Item
 */
export function StaggerItem({ children, className, style }: BaseProps) {
    return (
        <motion.div
            className={className}
            style={style}
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
            {children}
        </motion.div>
    )
}

/**
 * Hover Scale Animation
 */
export function HoverScale({ children, scale = 1.05, className, style }: BaseProps & { scale?: number }) {
    return (
        <motion.div
            className={className}
            style={style}
            whileHover={{ scale }}
            whileTap={{ scale: scale * 0.95 }}
            transition={{ duration: 0.2 }}
        >
            {children}
        </motion.div>
    )
}

/**
 * Celebration Animation
 */
export function Celebration({ show, onComplete }: { show: boolean; onComplete?: () => void }) {
    if (!show) return null

    return (
        <motion.div
            className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onAnimationComplete={onComplete}
        >
            <motion.div
                className="text-8xl"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
                🎉
            </motion.div>
        </motion.div>
    )
}

/**
 * Loading Dots Animation
 */
export function LoadingDots({ className }: { className?: string }) {
    return (
        <div className={`flex gap-1 ${className}`}>
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    className="w-2 h-2 bg-purple-500 rounded-full"
                    animate={{
                        y: [0, -10, 0],
                    }}
                    transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.2,
                    }}
                />
            ))}
        </div>
    )
}

/**
 * Pulse Animation
 */
export function Pulse({ children, className, style }: BaseProps) {
    return (
        <motion.div
            className={className}
            style={style}
            animate={{
                scale: [1, 1.05, 1],
            }}
            transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
            }}
        >
            {children}
        </motion.div>
    )
}

/**
 * Shake Animation
 */
export function Shake({ children, trigger, className, style }: BaseProps & { trigger: boolean }) {
    return (
        <motion.div
            className={className}
            style={style}
            animate={trigger ? {
                x: [0, -10, 10, -10, 10, 0],
            } : {}}
            transition={{ duration: 0.4 }}
        >
            {children}
        </motion.div>
    )
}
