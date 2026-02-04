'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Icons from '@/components/icons/Icons'

interface NutritionDashboardProps {
    userId: number
}

interface DailyNutrition {
    calories_consumed: number
    calories_target: number
    protein_consumed: number
    protein_target: number
    carbs_consumed: number
    carbs_target: number
    fats_consumed: number
    fats_target: number
    water_ml: number
    water_target: number
    meals_logged: number
    meals_planned: number
}

export default function NutritionDashboard({ userId }: NutritionDashboardProps) {
    const [data, setData] = useState<DailyNutrition>({
        calories_consumed: 0,
        calories_target: 2200,
        protein_consumed: 0,
        protein_target: 165,
        carbs_consumed: 0,
        carbs_target: 248,
        fats_consumed: 0,
        fats_target: 61,
        water_ml: 0,
        water_target: 2000,
        meals_logged: 0,
        meals_planned: 4,
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadNutritionData()
    }, [])

    const loadNutritionData = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/nutrition/daily')
            if (response.ok) {
                const result = await response.json()
                setData(result.data)
            }
        } catch (error) {
            console.error('Failed to load nutrition data:', error)
        } finally {
            setLoading(false)
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

    const caloriesPercent = (data.calories_consumed / data.calories_target) * 100
    const proteinPercent = (data.protein_consumed / data.protein_target) * 100
    const carbsPercent = (data.carbs_consumed / data.carbs_target) * 100
    const fatsPercent = (data.fats_consumed / data.fats_target) * 100
    const waterPercent = (data.water_ml / data.water_target) * 100
    const mealsPercent = (data.meals_logged / data.meals_planned) * 100

    const caloriesRemaining = data.calories_target - data.calories_consumed
    const proteinRemaining = data.protein_target - data.protein_consumed

    return (
        <div className="space-y-6">
            {/* Main Calorie Tracker */}
            <div className="glass-card p-8 rounded-3xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black font-outfit italic">Today's Nutrition</h2>
                    <button
                        onClick={loadNutritionData}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <Icons.Activity size={20} className="text-zinc-500" strokeWidth={2} />
                    </button>
                </div>

                {/* Calorie Ring */}
                <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
                    <div className="relative w-56 h-56">
                        <svg className="w-full h-full transform -rotate-90">
                            {/* Background circle */}
                            <circle
                                cx="112"
                                cy="112"
                                r="100"
                                stroke="currentColor"
                                strokeWidth="16"
                                fill="none"
                                className="text-zinc-800"
                            />
                            {/* Progress circle */}
                            <circle
                                cx="112"
                                cy="112"
                                r="100"
                                stroke="url(#calorie-gradient)"
                                strokeWidth="16"
                                fill="none"
                                strokeDasharray={`${Math.min(caloriesPercent, 100) * 6.28} 628`}
                                strokeLinecap="round"
                                className="transition-all duration-1000"
                            />
                            <defs>
                                <linearGradient id="calorie-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#f97316" />
                                    <stop offset="100%" stopColor="#eab308" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-5xl font-black">{data.calories_consumed}</span>
                            <span className="text-sm text-zinc-500">/ {data.calories_target} cal</span>
                            <span className={`text-xs mt-2 font-bold ${caloriesRemaining > 0 ? 'text-emerald-400' : 'text-red-400'
                                }`}>
                                {caloriesRemaining > 0 ? `${caloriesRemaining} left` : `${Math.abs(caloriesRemaining)} over`}
                            </span>
                        </div>
                    </div>

                    {/* Macro Breakdown */}
                    <div className="flex-1 w-full space-y-4">
                        <MacroBar
                            label="Protein"
                            icon={<Icons.Strength size={18} className="text-purple-400" strokeWidth={2} />}
                            consumed={data.protein_consumed}
                            target={data.protein_target}
                            unit="g"
                            color="purple"
                        />
                        <MacroBar
                            label="Carbs"
                            icon={<Icons.Fire size={18} className="text-orange-400" strokeWidth={2} />}
                            consumed={data.carbs_consumed}
                            target={data.carbs_target}
                            unit="g"
                            color="orange"
                        />
                        <MacroBar
                            label="Fats"
                            icon={<Icons.Heart size={18} className="text-pink-400" strokeWidth={2} />}
                            consumed={data.fats_consumed}
                            target={data.fats_target}
                            unit="g"
                            color="pink"
                        />
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <QuickStat
                        label="Meals"
                        value={`${data.meals_logged}/${data.meals_planned}`}
                        percent={mealsPercent}
                        icon={<Icons.Food size={16} className="text-cyan-400" strokeWidth={2} />}
                    />
                    <QuickStat
                        label="Water"
                        value={`${data.water_ml}ml`}
                        percent={waterPercent}
                        icon={<Icons.Water size={16} className="text-cyan-400" strokeWidth={2} />}
                    />
                    <QuickStat
                        label="Protein"
                        value={`${Math.round(proteinPercent)}%`}
                        percent={proteinPercent}
                        icon={<Icons.Strength size={16} className="text-purple-400" strokeWidth={2} />}
                    />
                    <QuickStat
                        label="Calories"
                        value={`${Math.round(caloriesPercent)}%`}
                        percent={caloriesPercent}
                        icon={<Icons.Fire size={16} className="text-orange-400" strokeWidth={2} />}
                    />
                </div>
            </div>

            {/* Meal Completion Status */}
            <div className="glass-card p-6 rounded-2xl">
                <h3 className="text-lg font-black mb-4">Meal Completion</h3>
                <div className="space-y-3">
                    <MealStatus meal="Breakfast" completed={data.meals_logged >= 1} time="8:00 AM" calories={550} />
                    <MealStatus meal="Lunch" completed={data.meals_logged >= 2} time="1:00 PM" calories={770} />
                    <MealStatus meal="Snack" completed={data.meals_logged >= 3} time="4:00 PM" calories={330} />
                    <MealStatus meal="Dinner" completed={data.meals_logged >= 4} time="8:00 PM" calories={550} />
                </div>
            </div>

            {/* Nutrition Tips */}
            <div className="glass-card p-6 rounded-2xl">
                <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                    <Icons.Sparkles size={18} className="text-yellow-400" strokeWidth={2} />
                    Today's Tips
                </h3>
                <div className="space-y-3">
                    {proteinPercent < 80 && (
                        <TipCard
                            type="warning"
                            message={`You need ${proteinRemaining}g more protein today. Add a protein shake or chicken breast!`}
                        />
                    )}
                    {caloriesPercent > 110 && (
                        <TipCard
                            type="warning"
                            message="You're over your calorie target. Consider lighter options for remaining meals."
                        />
                    )}
                    {waterPercent < 50 && (
                        <TipCard
                            type="info"
                            message="Hydration is low! Drink more water throughout the day."
                        />
                    )}
                    {mealsPercent === 100 && caloriesPercent >= 95 && caloriesPercent <= 105 && (
                        <TipCard
                            type="success"
                            message="Perfect day! You hit all your meals and stayed on target! 🎉"
                        />
                    )}
                </div>
            </div>
        </div>
    )
}

function MacroBar({ label, icon, consumed, target, unit, color }: any) {
    const percent = Math.min((consumed / target) * 100, 100)
    const remaining = target - consumed

    const colors: any = {
        purple: 'from-purple-600 to-purple-400',
        orange: 'from-orange-600 to-orange-400',
        pink: 'from-pink-600 to-pink-400',
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    {icon}
                    <span className="text-sm font-bold">{label}</span>
                </div>
                <span className="text-sm text-zinc-400">
                    {consumed}/{target}{unit} ({Math.round(percent)}%)
                </span>
            </div>
            <div className="relative h-3 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full bg-gradient-to-r ${colors[color]} rounded-full`}
                />
            </div>
            {remaining > 0 && (
                <p className="text-xs text-zinc-600 mt-1">{remaining}{unit} remaining</p>
            )}
        </div>
    )
}

function QuickStat({ label, value, percent, icon }: any) {
    return (
        <div className="p-3 bg-zinc-900/50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
                {icon}
                <span className="text-xs text-zinc-500 uppercase tracking-wider">{label}</span>
            </div>
            <p className="text-xl font-black">{value}</p>
            <div className="w-full bg-zinc-800 rounded-full h-1 mt-2">
                <div
                    className="bg-gradient-to-r from-cyan-600 to-cyan-400 h-1 rounded-full transition-all"
                    style={{ width: `${Math.min(percent, 100)}%` }}
                />
            </div>
        </div>
    )
}

function MealStatus({ meal, completed, time, calories }: any) {
    return (
        <div className={`flex items-center justify-between p-3 rounded-xl transition-all ${completed ? 'bg-emerald-600/10 border border-emerald-500/30' : 'bg-zinc-900/50'
            }`}>
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${completed ? 'bg-emerald-600' : 'bg-zinc-700'
                    }`}>
                    {completed ? (
                        <Icons.Check size={16} className="text-white" strokeWidth={3} />
                    ) : (
                        <Icons.Food size={16} className="text-zinc-400" strokeWidth={2} />
                    )}
                </div>
                <div>
                    <p className="font-bold text-sm">{meal}</p>
                    <p className="text-xs text-zinc-500">{time} • {calories} cal</p>
                </div>
            </div>
            {!completed && (
                <button className="px-3 py-1 bg-purple-600 hover:bg-purple-500 rounded-lg text-xs font-bold transition-colors">
                    Log
                </button>
            )}
        </div>
    )
}

function TipCard({ type, message }: any) {
    const styles: any = {
        success: 'bg-emerald-600/10 border-emerald-500/30 text-emerald-400',
        warning: 'bg-orange-600/10 border-orange-500/30 text-orange-400',
        info: 'bg-cyan-600/10 border-cyan-500/30 text-cyan-400',
    }

    const icons: any = {
        success: '✓',
        warning: '⚠️',
        info: 'ℹ️',
    }

    return (
        <div className={`p-3 rounded-xl border ${styles[type]}`}>
            <div className="flex items-start gap-2">
                <span className="text-lg">{icons[type]}</span>
                <p className="text-sm flex-1">{message}</p>
            </div>
        </div>
    )
}
