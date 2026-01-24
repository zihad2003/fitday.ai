'use client'

import { motion } from 'framer-motion'

/**
 * Enhanced Skeleton Loaders with Animations
 * Provides smooth, animated loading states
 */

interface SkeletonProps {
    className?: string
    variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
    width?: string | number
    height?: string | number
    animate?: boolean
}

export function Skeleton({
    className = '',
    variant = 'rectangular',
    width,
    height,
    animate = true
}: SkeletonProps) {
    const baseClasses = 'bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%]'

    const variantClasses = {
        text: 'h-4 rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-none',
        rounded: 'rounded-lg'
    }

    const style = {
        width: width || '100%',
        height: height || (variant === 'text' ? '1rem' : variant === 'circular' ? '40px' : '20px')
    }

    if (!animate) {
        return (
            <div
                className={`${baseClasses} ${variantClasses[variant]} ${className}`}
                style={style}
            />
        )
    }

    return (
        <motion.div
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            style={style}
            animate={{
                backgroundPosition: ['0% 0%', '200% 0%'],
            }}
            transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'linear',
            }}
        />
    )
}

/**
 * Card Skeleton
 * Loading state for card components
 */
export function CardSkeleton({ className = '' }: { className?: string }) {
    return (
        <div className={`bg-slate-900/50 border border-white/10 rounded-2xl p-6 ${className}`}>
            <div className="flex items-center gap-4 mb-4">
                <Skeleton variant="circular" width={48} height={48} />
                <div className="flex-1">
                    <Skeleton variant="text" width="60%" className="mb-2" />
                    <Skeleton variant="text" width="40%" height={12} />
                </div>
            </div>
            <Skeleton variant="rounded" height={100} className="mb-3" />
            <Skeleton variant="text" width="80%" className="mb-2" />
            <Skeleton variant="text" width="60%" />
        </div>
    )
}

/**
 * Dashboard Skeleton
 * Loading state for dashboard page
 */
export function DashboardSkeleton() {
    return (
        <div className="min-h-screen bg-slate-950 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Skeleton variant="text" width={200} height={32} className="mb-2" />
                    <Skeleton variant="text" width={300} height={16} />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {[1, 2, 3].map((i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <CardSkeleton />
                        </motion.div>
                    ))}
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <CardSkeleton className="h-96" />
                    </div>
                    <div>
                        <CardSkeleton className="h-96" />
                    </div>
                </div>
            </div>
        </div>
    )
}

/**
 * List Skeleton
 * Loading state for lists
 */
export function ListSkeleton({ items = 5, className = '' }: { items?: number; className?: string }) {
    return (
        <div className={`space-y-4 ${className}`}>
            {Array.from({ length: items }).map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-4 p-4 bg-slate-900/50 border border-white/10 rounded-xl"
                >
                    <Skeleton variant="circular" width={40} height={40} />
                    <div className="flex-1">
                        <Skeleton variant="text" width="70%" className="mb-2" />
                        <Skeleton variant="text" width="40%" height={12} />
                    </div>
                    <Skeleton variant="rounded" width={80} height={32} />
                </motion.div>
            ))}
        </div>
    )
}

/**
 * Table Skeleton
 * Loading state for tables
 */
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-white/10">
                        {Array.from({ length: columns }).map((_, i) => (
                            <th key={i} className="p-4 text-left">
                                <Skeleton variant="text" width="80%" height={16} />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: rows }).map((_, rowIndex) => (
                        <motion.tr
                            key={rowIndex}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: rowIndex * 0.05 }}
                            className="border-b border-white/5"
                        >
                            {Array.from({ length: columns }).map((_, colIndex) => (
                                <td key={colIndex} className="p-4">
                                    <Skeleton variant="text" width="90%" />
                                </td>
                            ))}
                        </motion.tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

/**
 * Profile Skeleton
 * Loading state for profile page
 */
export function ProfileSkeleton() {
    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Header */}
            <div className="flex items-center gap-6 mb-8">
                <Skeleton variant="circular" width={120} height={120} />
                <div className="flex-1">
                    <Skeleton variant="text" width={200} height={32} className="mb-2" />
                    <Skeleton variant="text" width={150} height={16} className="mb-4" />
                    <div className="flex gap-2">
                        <Skeleton variant="rounded" width={100} height={36} />
                        <Skeleton variant="rounded" width={100} height={36} />
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="text-center p-4 bg-slate-900/50 border border-white/10 rounded-xl">
                        <Skeleton variant="text" width={60} height={32} className="mb-2 mx-auto" />
                        <Skeleton variant="text" width={80} height={14} className="mx-auto" />
                    </div>
                ))}
            </div>

            {/* Content */}
            <CardSkeleton className="h-64" />
        </div>
    )
}

/**
 * Grid Skeleton
 * Loading state for grid layouts
 */
export function GridSkeleton({ items = 6, columns = 3 }: { items?: number; columns?: number }) {
    return (
        <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-6`}>
            {Array.from({ length: items }).map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                >
                    <CardSkeleton />
                </motion.div>
            ))}
        </div>
    )
}
