'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Droplet, Plus, Minus, Zap, Award } from 'lucide-react'
import { Analytics } from '@/lib/analytics'
import { useCelebration } from '@/components/providers/CelebrationProvider'

interface WaterTrackerProps {
    userId: number
    targetMl: number
}

export default function WaterTracker({ userId, targetMl }: WaterTrackerProps) {
    const [currentMl, setCurrentMl] = useState(0)
    const [loading, setLoading] = useState(true)
    const { celebrate } = useCelebration()

    useEffect(() => {
        // Fetch today's water from daily_tracking
        const fetchWater = async () => {
            try {
                const today = new Date().toISOString().split('T')[0]
                const res = await fetch(`/api/tracking/daily?user_id=${userId}&date=${today}`)
                const json = await res.json() as { success: boolean, data?: { water_liters: number } }
                if (json.success && json.data) {
                    setCurrentMl((json.data.water_liters || 0) * 1000)
                }
            } catch (err) {
                console.error("Failed to fetch water data", err)
            } finally {
                setLoading(false)
            }
        }
        fetchWater()
    }, [userId])

    const updateWater = async (newMl: number) => {
        const prev = currentMl
        setCurrentMl(newMl)

        // Track usage
        Analytics.trackFeatureUsage('water_tracker', 'update_volume', { volume_ml: newMl - prev })

        // Goal completion conversion tracking
        if (newMl >= targetMl && prev < targetMl) {
            Analytics.trackConversion('hydration_goal_completed', 100)
            celebrate('Metabolic Optimization', 'Daily hydration directive achieved. Fluid balance established.', 'milestone')
        }

        try {
            const today = new Date().toISOString().split('T')[0]
            await fetch('/api/tracking/water', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, date: today, water_liters: newMl / 1000 })
            })
        } catch (err) {
            console.error("Failed to sync water", err)
            setCurrentMl(prev)
        }
    }

    const percentage = Math.min((currentMl / targetMl) * 100, 100)

    return (
        <div className="bg-zinc-950 border border-white/5 rounded-[2.5rem] p-8 relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Droplet size={120} className="text-blue-500" />
            </div>

            <div className="relative z-10">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h3 className="text-xl font-black font-outfit uppercase italic text-white flex items-center gap-3">
                            Hydration Sync
                            <div className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </div>
                        </h3>
                        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] mt-1">Metabolic Lubrication</p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-black font-mono text-blue-400 leading-none">{currentMl} <span className="text-xs text-zinc-600">ML</span></div>
                        <div className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mt-1">Goal: {targetMl}ml</div>
                    </div>
                </div>

                {/* Progress Visual */}
                <div className="relative h-4 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/5 mb-8">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-cyan-400 shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                    />
                    <AnimatePresence>
                        {percentage >= 100 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-400 flex items-center justify-center"
                            >
                                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-black">Optimal Hydration Reached</div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Controls */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <button
                        onClick={() => updateWater(Math.max(0, currentMl - 250))}
                        className="h-14 bg-zinc-900/50 border border-white/5 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all active:scale-95"
                    >
                        <Minus size={20} className="text-zinc-500" />
                    </button>

                    <button
                        onClick={() => updateWater(currentMl + 250)}
                        className="h-14 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-blue-500 shadow-lg shadow-blue-900/20 active:scale-95 transition-all"
                    >
                        <Plus size={14} /> 250ML
                    </button>

                    <button
                        onClick={() => updateWater(currentMl + 500)}
                        className="h-14 bg-zinc-900/50 border border-white/5 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all active:scale-95"
                    >
                        <div className="flex flex-col items-center">
                            <Plus size={14} className="text-blue-400" />
                            <span className="text-[10px] font-black text-white/70">500ML</span>
                        </div>
                    </button>

                    <button
                        onClick={() => updateWater(currentMl + 1000)}
                        className="h-14 bg-gradient-to-br from-blue-900/40 to-black border border-blue-500/20 rounded-2xl flex items-center justify-center hover:border-blue-500/40 transition-all active:scale-95"
                    >
                        <div className="flex flex-col items-center">
                            <Plus size={14} className="text-cyan-400" />
                            <span className="text-[10px] font-black text-white/70">1.0L</span>
                        </div>
                    </button>
                </div>

                {/* Reminders Pulse */}
                <div className="mt-8 flex items-center justify-between p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                    <div className="flex items-center gap-4">
                        <Zap size={16} className="text-blue-500 animate-pulse" />
                        <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest italic">
                            পানির তৃষ্ণা মেটান - Stay Hydrated
                        </p>
                    </div>
                    <Award size={16} className={`transition-colors ${percentage >= 100 ? 'text-emerald-500' : 'text-zinc-800'}`} />
                </div>
            </div>
        </div>
    )
}
