'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Icons from '@/components/icons/Icons'

interface QuickLoggersProps {
    userId: number
    onUpdate?: () => void
}

export default function QuickLoggers({ userId, onUpdate }: QuickLoggersProps) {
    const [waterCount, setWaterCount] = useState(0)
    const [showWaterAnimation, setShowWaterAnimation] = useState(false)
    const [loading, setLoading] = useState(false)

    // Log water intake
    const logWater = async (amount: number = 250) => {
        setShowWaterAnimation(true)
        setWaterCount(prev => prev + 1)

        setTimeout(() => setShowWaterAnimation(false), 1000)

        try {
            await fetch('/api/tracking/water', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount_ml: amount }),
            })
            onUpdate?.()
        } catch (error) {
            console.error('Failed to log water:', error)
        }
    }

    // Quick workout completion
    const completeWorkout = async () => {
        setLoading(true)
        try {
            await fetch('/api/tracking/workout-complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            })
            onUpdate?.()
        } catch (error) {
            console.error('Failed to log workout:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Water Logger */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => logWater(250)}
                className="glass-card p-6 rounded-2xl relative overflow-hidden group"
            >
                <AnimatePresence>
                    {showWaterAnimation && (
                        <motion.div
                            initial={{ scale: 0, opacity: 1 }}
                            animate={{ scale: 3, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-cyan-500/20 rounded-full"
                        />
                    )}
                </AnimatePresence>

                <Icons.Water size={32} className="text-cyan-400 mb-3 mx-auto group-hover:scale-110 transition-transform" strokeWidth={2} />
                <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400 mb-1">Water</h3>
                <p className="text-2xl font-black text-cyan-400">+250ml</p>
                {waterCount > 0 && (
                    <p className="text-xs text-zinc-600 mt-2">{waterCount} logged today</p>
                )}
            </motion.button>

            {/* Workout Complete */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={completeWorkout}
                disabled={loading}
                className="glass-card p-6 rounded-2xl relative overflow-hidden group disabled:opacity-50"
            >
                <Icons.Check size={32} className="text-emerald-400 mb-3 mx-auto group-hover:scale-110 transition-transform" strokeWidth={2.5} />
                <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400 mb-1">Workout</h3>
                <p className="text-lg font-black text-emerald-400">Complete</p>
            </motion.button>

            {/* Meal Logger */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/diet'}
                className="glass-card p-6 rounded-2xl relative overflow-hidden group"
            >
                <Icons.Food size={32} className="text-orange-400 mb-3 mx-auto group-hover:scale-110 transition-transform" strokeWidth={2} />
                <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400 mb-1">Meal</h3>
                <p className="text-lg font-black text-orange-400">Log Food</p>
            </motion.button>

            {/* Weight Logger */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                    const weight = prompt('Enter your weight (kg):')
                    if (weight) {
                        fetch('/api/tracking/weight', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ weight_kg: parseFloat(weight) }),
                        }).then(() => onUpdate?.())
                    }
                }}
                className="glass-card p-6 rounded-2xl relative overflow-hidden group"
            >
                <Icons.Weight size={32} className="text-purple-400 mb-3 mx-auto group-hover:scale-110 transition-transform" strokeWidth={2} />
                <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400 mb-1">Weight</h3>
                <p className="text-lg font-black text-purple-400">Log</p>
            </motion.button>
        </div>
    )
}

// Water Tracker Component
export function WaterTracker({ dailyGoal = 2000, current = 0 }: { dailyGoal?: number; current?: number }) {
    const percentage = Math.min((current / dailyGoal) * 100, 100)
    const glassesNeeded = Math.ceil((dailyGoal - current) / 250)

    return (
        <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Icons.Water size={24} className="text-cyan-400" strokeWidth={2} />
                    <h3 className="text-sm font-black uppercase tracking-wider">Hydration</h3>
                </div>
                <span className="text-xs text-zinc-500">{current}ml / {dailyGoal}ml</span>
            </div>

            {/* Water Level Visualization */}
            <div className="relative h-32 bg-zinc-900 rounded-2xl overflow-hidden mb-4">
                <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${percentage}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cyan-600 to-cyan-400"
                    style={{
                        boxShadow: '0 -4px 20px rgba(34, 211, 238, 0.4)',
                    }}
                >
                    {/* Water Wave Effect */}
                    <div className="absolute top-0 left-0 right-0 h-2 bg-cyan-300/50 animate-pulse" />
                </motion.div>

                {/* Percentage Text */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-black text-white drop-shadow-lg">
                        {Math.round(percentage)}%
                    </span>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">
                    {glassesNeeded > 0 ? `${glassesNeeded} glasses left` : 'Goal reached! 🎉'}
                </span>
                <span className={`font-bold ${percentage >= 100 ? 'text-emerald-400' : 'text-cyan-400'}`}>
                    {percentage >= 100 ? 'Complete' : `${Math.round(dailyGoal - current)}ml to go`}
                </span>
            </div>
        </div>
    )
}

// Daily Check-in Component
export function DailyCheckin({ onComplete }: { onComplete?: () => void }) {
    const [step, setStep] = useState(1)
    const [data, setData] = useState({
        weight_kg: '',
        mood: 3,
        energy: 3,
        sleep_hours: 7,
        sleep_quality: 3,
    })

    const handleSubmit = async () => {
        try {
            await fetch('/api/tracking/daily-checkin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })
            onComplete?.()
        } catch (error) {
            console.error('Failed to submit check-in:', error)
        }
    }

    return (
        <div className="glass-card p-8 rounded-3xl max-w-md mx-auto">
            <h2 className="text-2xl font-black font-outfit italic mb-6 text-center">
                Morning Check-in
            </h2>

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div>
                            <label className="block text-sm font-black uppercase tracking-wider text-zinc-500 mb-2">
                                Today's Weight (kg)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                value={data.weight_kg}
                                onChange={(e) => setData({ ...data, weight_kg: e.target.value })}
                                className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl focus:border-purple-500 focus:outline-none transition-colors text-2xl font-bold text-center"
                                placeholder="70.5"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-black uppercase tracking-wider text-zinc-500 mb-3">
                                How did you sleep?
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="5"
                                value={data.sleep_quality}
                                onChange={(e) => setData({ ...data, sleep_quality: parseInt(e.target.value) })}
                                className="w-full"
                            />
                            <div className="flex justify-between text-xs text-zinc-600 mt-1">
                                <span>Poor</span>
                                <span>Excellent</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-black uppercase tracking-wider text-zinc-500 mb-2">
                                Hours Slept
                            </label>
                            <input
                                type="number"
                                step="0.5"
                                value={data.sleep_hours}
                                onChange={(e) => setData({ ...data, sleep_hours: parseFloat(e.target.value) })}
                                className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl focus:border-purple-500 focus:outline-none transition-colors text-center"
                            />
                        </div>

                        <button
                            onClick={() => setStep(2)}
                            className="w-full py-3 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl font-bold hover:from-purple-500 hover:to-cyan-400 transition-all"
                        >
                            Continue
                        </button>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div>
                            <label className="block text-sm font-black uppercase tracking-wider text-zinc-500 mb-3">
                                Mood Rating
                            </label>
                            <div className="flex gap-2 justify-center">
                                {[1, 2, 3, 4, 5].map((rating) => (
                                    <button
                                        key={rating}
                                        onClick={() => setData({ ...data, mood: rating })}
                                        className={`w-12 h-12 rounded-full font-bold transition-all ${data.mood === rating
                                                ? 'bg-purple-600 scale-110'
                                                : 'bg-zinc-800 hover:bg-zinc-700'
                                            }`}
                                    >
                                        {rating === 1 ? '😢' : rating === 2 ? '😕' : rating === 3 ? '😐' : rating === 4 ? '😊' : '😄'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-black uppercase tracking-wider text-zinc-500 mb-3">
                                Energy Level
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="5"
                                value={data.energy}
                                onChange={(e) => setData({ ...data, energy: parseInt(e.target.value) })}
                                className="w-full"
                            />
                            <div className="flex justify-between text-xs text-zinc-600 mt-1">
                                <span>Exhausted</span>
                                <span>Energized</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setStep(1)}
                                className="flex-1 py-3 bg-zinc-800 rounded-xl font-bold hover:bg-zinc-700 transition-colors"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl font-bold hover:from-purple-500 hover:to-cyan-400 transition-all"
                            >
                                Complete Check-in
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
