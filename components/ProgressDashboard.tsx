'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Icons from '@/components/icons/Icons'

interface ProgressDashboardProps {
    userId: number
}

export default function ProgressDashboard({ userId }: ProgressDashboardProps) {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [applying, setApplying] = useState(false)

    useEffect(() => {
        loadProgress()
    }, [])

    const loadProgress = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/analysis/progress')
            if (response.ok) {
                const result = await response.json()
                setData(result.data)
            }
        } catch (error) {
            console.error('Failed to load progress:', error)
        } finally {
            setLoading(false)
        }
    }

    const applyAdjustments = async () => {
        if (!data?.adapted_plan) return

        setApplying(true)
        try {
            const response = await fetch('/api/analysis/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    new_target_calories: data.adapted_plan.new_target_calories,
                    new_workout_days: data.adapted_plan.workout_modifications.length > 0 ? 4 : null,
                }),
            })

            if (response.ok) {
                alert('Plan adjustments applied successfully!')
                loadProgress()
            }
        } catch (error) {
            console.error('Failed to apply adjustments:', error)
        } finally {
            setApplying(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin">
                    <Icons.Activity size={32} className="text-purple-400" strokeWidth={2} />
                </div>
            </div>
        )
    }

    if (!data) {
        return (
            <div className="glass-card p-8 rounded-3xl text-center">
                <p className="text-zinc-500">No progress data available yet. Start tracking to see your progress!</p>
            </div>
        )
    }

    const { metrics, insights, plateau, prediction, adapted_plan } = data

    return (
        <div className="space-y-6">
            {/* Overall Score */}
            <div className="glass-card p-8 rounded-3xl">
                <h2 className="text-2xl font-black font-outfit italic mb-6">Progress Overview</h2>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Overall Score Circle */}
                    <div className="flex flex-col items-center justify-center">
                        <div className="relative w-48 h-48">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="96"
                                    cy="96"
                                    r="88"
                                    stroke="currentColor"
                                    strokeWidth="12"
                                    fill="none"
                                    className="text-zinc-800"
                                />
                                <circle
                                    cx="96"
                                    cy="96"
                                    r="88"
                                    stroke="url(#gradient)"
                                    strokeWidth="12"
                                    fill="none"
                                    strokeDasharray={`${(metrics.overall_score / 100) * 553} 553`}
                                    strokeLinecap="round"
                                    className="transition-all duration-1000"
                                />
                                <defs>
                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#a855f7" />
                                        <stop offset="100%" stopColor="#06b6d4" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-5xl font-black">{Math.round(metrics.overall_score)}</span>
                                <span className="text-sm text-zinc-500 uppercase tracking-wider">Score</span>
                            </div>
                        </div>
                        <p className="text-sm text-zinc-400 mt-4 text-center">
                            {metrics.overall_score >= 80 ? 'Excellent progress!' :
                                metrics.overall_score >= 60 ? 'Good progress!' :
                                    metrics.overall_score >= 40 ? 'Making progress!' :
                                        'Let\'s improve!'}
                        </p>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                        <MetricCard
                            icon={<Icons.Weight size={20} className="text-purple-400" strokeWidth={2} />}
                            label="Weight Change"
                            value={`${metrics.weight_change_kg > 0 ? '+' : ''}${metrics.weight_change_kg.toFixed(1)}kg`}
                            trend={metrics.trend}
                        />
                        <MetricCard
                            icon={<Icons.Strength size={20} className="text-cyan-400" strokeWidth={2} />}
                            label="Workout Adherence"
                            value={`${Math.round(metrics.workout_adherence_percentage)}%`}
                            subtext={`${metrics.workouts_completed}/${metrics.workouts_planned}`}
                        />
                        <MetricCard
                            icon={<Icons.Fire size={20} className="text-orange-400" strokeWidth={2} />}
                            label="Current Streak"
                            value={`${metrics.current_streak} days`}
                            subtext={`Best: ${metrics.longest_streak}`}
                        />
                        <MetricCard
                            icon={<Icons.Heart size={20} className="text-pink-400" strokeWidth={2} />}
                            label="Consistency"
                            value={`${Math.round(metrics.consistency_score)}%`}
                            subtext={`${data.days_tracked} days tracked`}
                        />
                    </div>
                </div>
            </div>

            {/* Insights */}
            {insights.length > 0 && (
                <div className="glass-card p-8 rounded-3xl">
                    <h3 className="text-xl font-black font-outfit italic mb-4 flex items-center gap-2">
                        <Icons.Sparkles size={20} className="text-yellow-400" strokeWidth={2} />
                        Insights & Recommendations
                    </h3>
                    <div className="space-y-3">
                        {insights.slice(0, 5).map((insight: any, index: number) => (
                            <InsightCard key={index} insight={insight} />
                        ))}
                    </div>
                </div>
            )}

            {/* Plateau Warning */}
            {plateau.is_plateau && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`glass-card p-6 rounded-2xl border-2 ${plateau.severity === 'severe' ? 'border-red-500/50 bg-red-500/10' :
                            plateau.severity === 'moderate' ? 'border-orange-500/50 bg-orange-500/10' :
                                'border-yellow-500/50 bg-yellow-500/10'
                        }`}
                >
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">⚠️</span>
                        <div className="flex-1">
                            <h3 className="font-black text-lg mb-2">
                                {plateau.severity === 'severe' ? 'Severe Plateau Detected' :
                                    plateau.severity === 'moderate' ? 'Plateau Detected' :
                                        'Progress Slowing'}
                            </h3>
                            <p className="text-sm text-zinc-400 mb-3">
                                Your progress has stalled for {plateau.plateau_duration_days} days. Here's what you can do:
                            </p>
                            <ul className="space-y-1">
                                {plateau.suggested_actions.map((action: string, index: number) => (
                                    <li key={index} className="text-sm flex items-start gap-2">
                                        <span className="text-purple-400">•</span>
                                        <span>{action}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Goal Prediction */}
            {prediction.estimated_days_to_goal > 0 && (
                <div className="glass-card p-8 rounded-3xl">
                    <h3 className="text-xl font-black font-outfit italic mb-4 flex items-center gap-2">
                        <Icons.Target size={20} className="text-purple-400" strokeWidth={2} />
                        Goal Prediction
                    </h3>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div>
                            <p className="text-sm text-zinc-500 uppercase tracking-wider mb-2">Estimated Completion</p>
                            <p className="text-2xl font-black">{prediction.estimated_days_to_goal} days</p>
                            <p className="text-xs text-zinc-600 mt-1">{prediction.estimated_completion_date}</p>
                        </div>
                        <div>
                            <p className="text-sm text-zinc-500 uppercase tracking-wider mb-2">Confidence</p>
                            <p className="text-2xl font-black">{Math.round(prediction.confidence)}%</p>
                            <div className="w-full bg-zinc-800 rounded-full h-2 mt-2">
                                <div
                                    className="bg-gradient-to-r from-purple-600 to-cyan-400 h-2 rounded-full transition-all"
                                    style={{ width: `${prediction.confidence}%` }}
                                />
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-zinc-500 uppercase tracking-wider mb-2">Status</p>
                            <p className={`text-2xl font-black ${prediction.on_track ? 'text-emerald-400' : 'text-orange-400'}`}>
                                {prediction.on_track ? 'On Track' : 'Needs Adjustment'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Plan Adjustments */}
            {adapted_plan.adjustments.length > 0 && (
                <div className="glass-card p-8 rounded-3xl border-2 border-purple-500/30">
                    <h3 className="text-xl font-black font-outfit italic mb-4 flex items-center gap-2">
                        <Icons.TrendingUp size={20} className="text-purple-400" strokeWidth={2} />
                        Recommended Plan Adjustments
                    </h3>

                    <p className="text-zinc-400 mb-6">{adapted_plan.summary}</p>

                    <div className="space-y-4 mb-6">
                        {adapted_plan.adjustments.map((adj: any, index: number) => (
                            <div key={index} className="p-4 bg-zinc-900/50 rounded-xl">
                                <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-bold">{adj.description}</h4>
                                    <span className={`text-xs px-2 py-1 rounded-full ${adj.type === 'calorie' ? 'bg-orange-600/20 text-orange-400' :
                                            adj.type === 'workout' ? 'bg-purple-600/20 text-purple-400' :
                                                adj.type === 'rest' ? 'bg-cyan-600/20 text-cyan-400' :
                                                    'bg-zinc-600/20 text-zinc-400'
                                        }`}>
                                        {adj.type}
                                    </span>
                                </div>
                                <p className="text-sm text-zinc-500">{adj.reason}</p>
                                <div className="flex items-center gap-2 mt-2 text-xs text-zinc-600">
                                    <span>{adj.old_value}</span>
                                    <span>→</span>
                                    <span className="text-purple-400 font-bold">{adj.new_value}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={applyAdjustments}
                        disabled={applying}
                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 rounded-xl font-bold transition-all disabled:opacity-50"
                    >
                        {applying ? 'Applying...' : 'Apply Adjustments'}
                    </button>
                </div>
            )}
        </div>
    )
}

function MetricCard({ icon, label, value, subtext, trend }: any) {
    return (
        <div className="p-4 bg-zinc-900/50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
                {icon}
                <span className="text-xs text-zinc-500 uppercase tracking-wider">{label}</span>
            </div>
            <p className="text-2xl font-black">{value}</p>
            {subtext && <p className="text-xs text-zinc-600 mt-1">{subtext}</p>}
            {trend && (
                <p className={`text-xs mt-1 ${trend === 'losing' ? 'text-emerald-400' :
                        trend === 'gaining' ? 'text-cyan-400' :
                            'text-zinc-500'
                    }`}>
                    {trend === 'losing' ? '↓ Losing' :
                        trend === 'gaining' ? '↑ Gaining' :
                            '→ Maintaining'}
                </p>
            )}
        </div>
    )
}

function InsightCard({ insight }: any) {
    const icons = {
        success: '✓',
        warning: '⚠️',
        info: 'ℹ️',
        action: '→',
    }

    const colors = {
        success: 'text-emerald-400 bg-emerald-600/10 border-emerald-500/30',
        warning: 'text-orange-400 bg-orange-600/10 border-orange-500/30',
        info: 'text-cyan-400 bg-cyan-600/10 border-cyan-500/30',
        action: 'text-purple-400 bg-purple-600/10 border-purple-500/30',
    }

    return (
        <div className={`p-4 rounded-xl border ${colors[insight.type]}`}>
            <div className="flex items-start gap-3">
                <span className="text-xl">{icons[insight.type]}</span>
                <div className="flex-1">
                    <h4 className="font-bold mb-1">{insight.title}</h4>
                    <p className="text-sm text-zinc-400">{insight.message}</p>
                    {insight.recommendation && (
                        <p className="text-sm text-zinc-500 mt-2 italic">
                            💡 {insight.recommendation}
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}
