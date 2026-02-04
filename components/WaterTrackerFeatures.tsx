'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Icons from '@/components/icons/Icons'
import { WaterCalculator, type WaterReminder } from '@/lib/water-calculator'

interface WaterTrackerProps {
    initialData?: {
        goal: number
        current: number
    }
}

export default function WaterTrackerFeatures({ initialData }: WaterTrackerProps) {
    const [goal, setGoal] = useState(initialData?.goal || 2500)
    const [current, setCurrent] = useState(initialData?.current || 0)
    const [reminders, setReminders] = useState<WaterReminder[]>([])
    const [isAdding, setIsAdding] = useState(false)
    const [selectedAmount, setSelectedAmount] = useState(250)
    const [streak, setStreak] = useState(5) // Example streak
    const [showConfetti, setShowConfetti] = useState(false)

    // Hydration Percentage
    const percentage = Math.min((current / goal) * 100, 100)

    useEffect(() => {
        // Simulate fetching user schedule (would come from API/Context)
        const schedule = WaterCalculator.generateReminders(
            '07:00', '23:00', '17:00', goal
        )
        setReminders(schedule)
    }, [goal])

    const handleAddWater = async (amount: number) => {
        setIsAdding(true)
        const newAmount = current + amount
        setCurrent(newAmount)

        // Optimistic UI update - Replace with actual API call
        try {
            await fetch('/api/tracking/water', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount_ml: amount })
            })

            if (newAmount >= goal && current < goal) {
                setShowConfetti(true)
                setTimeout(() => setShowConfetti(false), 3000)
            }
        } catch (err) {
            console.error('Failed to log water', err)
            setCurrent(current) // Revert on error
        } finally {
            setIsAdding(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Main Tracker Card */}
            <div className="glass-card p-6 rounded-3xl relative overflow-hidden">
                {/* Background Wave Animation could go here */}

                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div>
                        <h2 className="text-2xl font-black font-outfit italic">Hydration</h2>
                        <p className="text-zinc-400 text-sm">Daily Goal: {goal}ml</p>
                    </div>
                    <div className="flex items-center gap-1 bg-zinc-800/50 px-3 py-1 rounded-full">
                        <Icons.Fire size={14} className="text-orange-400" />
                        <span className="text-xs font-bold text-orange-400">{streak} Day Streak!</span>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center py-6 relative z-10">
                    <div className="relative w-40 h-40 mb-4">
                        {/* Circular Progress */}
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="80" cy="80" r="70" stroke="#1e293b" strokeWidth="12" fill="none" />
                            <motion.circle
                                cx="80" cy="80" r="70"
                                stroke="url(#waterGradient)"
                                strokeWidth="12"
                                fill="none"
                                initial={{ strokeDasharray: "0 440" }}
                                animate={{ strokeDasharray: `${(percentage / 100) * 440} 440` }}
                                strokeLinecap="round"
                            />
                            <defs>
                                <linearGradient id="waterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#38bdf8" />
                                    <stop offset="100%" stopColor="#2563eb" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-black text-white">{current}</span>
                            <span className="text-xs text-cyan-200">ml</span>
                        </div>
                    </div>

                    <p className="text-cyan-200 text-sm font-medium mb-6">
                        {current >= goal ? "Goal Reached! 🎉" : `${goal - current}ml to go`}
                    </p>

                    {/* Quick Add Buttons */}
                    <div className="grid grid-cols-3 gap-3 w-full">
                        {[250, 500, 750].map((amt) => (
                            <button
                                key={amt}
                                onClick={() => handleAddWater(amt)}
                                disabled={isAdding}
                                className="flex flex-col items-center justify-center p-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 transition-all active:scale-95"
                            >
                                <Icons.Water size={20} className="text-blue-400 mb-1" />
                                <span className="text-xs font-bold text-blue-100">+{amt}ml</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Smart Schedule */}
            <div className="glass-card p-6 rounded-3xl">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Icons.Clock size={18} className="text-zinc-400" />
                    Recommended Schedule
                </h3>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {reminders.map((reminder, idx) => {
                        // Determine status based on current vs implied schedule progress
                        // Simple logic: if 'current' covers up to this reminder's cumulative amount
                        // For improved logic, we'd map specific logs to reminders, but this is a visual guide
                        const cumulativeAmount = reminders.slice(0, idx + 1).reduce((sum, r) => sum + r.amount_ml, 0)
                        const isCompleted = current >= cumulativeAmount

                        return (
                            <div
                                key={idx}
                                className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${isCompleted
                                        ? 'bg-emerald-900/10 border-emerald-500/20 opacity-60'
                                        : 'bg-zinc-900/40 border-zinc-800'
                                    }`}
                            >
                                <div className="flex flex-col items-center min-w-[3rem]">
                                    <span className="text-sm font-bold text-white">{reminder.time}</span>
                                    {reminder.priority === 'critical' && (
                                        <span className="text-[10px] text-red-400 font-bold uppercase">Must</span>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-zinc-200">{reminder.label}</p>
                                    <p className="text-xs text-zinc-500">{reminder.message}</p>
                                </div>

                                <div className="text-right">
                                    <span className="text-xs font-bold text-blue-400">{reminder.amount_ml}ml</span>
                                    {isCompleted && <Icons.Check size={14} className="text-emerald-400 ml-auto mt-1" />}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Motivation Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-cyan-500/30">
                <div className="flex gap-3">
                    <div className="p-2 bg-cyan-500/20 rounded-lg h-fit">
                        <Icons.Sparkles size={20} className="text-cyan-300" />
                    </div>
                    <div>
                        <h4 className="font-bold text-cyan-100 text-sm mb-1">Did you know?</h4>
                        <p className="text-xs text-cyan-200/80 leading-relaxed">
                            Drinking water 30 minutes before a meal can help digestion and calorie control.
                            Keep it up to boost your metabolism by up to 30%!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
