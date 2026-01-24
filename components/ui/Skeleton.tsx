import { motion } from 'framer-motion'

interface SkeletonProps {
    className?: string
    variant?: 'text' | 'circular' | 'rectangular'
    width?: string | number
    height?: string | number
}

export function Skeleton({
    className = '',
    variant = 'rectangular',
    width,
    height
}: SkeletonProps) {
    const baseClasses = 'animate-pulse bg-white/5'

    const variantClasses = {
        text: 'h-4 rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-2xl'
    }

    const style = {
        width: width || '100%',
        height: height || (variant === 'text' ? '1rem' : '100%')
    }

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            style={style}
        />
    )
}

export function DashboardSkeleton() {
    return (
        <div className="min-h-screen bg-black text-white flex font-inter overflow-hidden">
            {/* Sidebar Skeleton */}
            <aside className="w-24 bg-zinc-950 border-r border-white/5 p-6 flex flex-col gap-8">
                <Skeleton variant="circular" width={48} height={48} />
                {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} variant="circular" width={48} height={48} />
                ))}
            </aside>

            {/* Main Content Skeleton */}
            <main className="flex-1 p-10">
                {/* Header */}
                <div className="mb-8">
                    <Skeleton width={200} height={32} className="mb-2" />
                    <Skeleton width={300} height={16} />
                </div>

                {/* Grid */}
                <div className="grid grid-cols-12 gap-8">
                    {/* Large Card */}
                    <div className="col-span-8">
                        <Skeleton height={350} />
                    </div>

                    {/* Small Card */}
                    <div className="col-span-4">
                        <Skeleton height={350} />
                    </div>

                    {/* Medium Cards */}
                    <div className="col-span-8">
                        <Skeleton height={600} />
                    </div>

                    <div className="col-span-4">
                        <Skeleton height={600} />
                    </div>
                </div>
            </main>
        </div>
    )
}

export function CardSkeleton() {
    return (
        <div className="stat-card p-6 space-y-4">
            <Skeleton width="60%" height={24} />
            <Skeleton width="100%" height={16} />
            <Skeleton width="80%" height={16} />
            <div className="grid grid-cols-3 gap-4 mt-6">
                <Skeleton height={80} />
                <Skeleton height={80} />
                <Skeleton height={80} />
            </div>
        </div>
    )
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
    return (
        <div className="space-y-4">
            {[...Array(count)].map((_, i) => (
                <div key={i} className="flex gap-4 p-4 bg-white/5 rounded-2xl">
                    <Skeleton variant="circular" width={48} height={48} />
                    <div className="flex-1 space-y-2">
                        <Skeleton width="70%" height={16} />
                        <Skeleton width="40%" height={12} />
                    </div>
                </div>
            ))}
        </div>
    )
}
