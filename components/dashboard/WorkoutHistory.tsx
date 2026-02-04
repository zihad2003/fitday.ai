'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Dumbbell, Calendar, ChevronRight, Activity, Clock } from 'lucide-react'

interface WorkoutHistoryProps {
    userId: number
}

export default function WorkoutHistory({ userId }: WorkoutHistoryProps) {
    const [history, setHistory] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch(`/api/workouts/history?userId=${userId}`)
                const json = await res.json() as { success: boolean, data: any[] }
                if (json.success) {
                    setHistory(json.data)
                }
            } catch (err) {
                console.error("Failed to fetch history", err)
            } finally {
                setLoading(false)
            }
        }
        fetchHistory()
    }, [userId])

    if (loading) return <div className="h-40 bg-zinc-900/50 rounded-3xl animate-pulse" />

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center text-purple-500">
                        <Dumbbell size={20} />
                    </div>
                    <h3 className="text-xl font-black font-outfit uppercase italic text-white leading-none">Archives <span className="text-zinc-700">Protocol</span></h3>
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-3 py-1 bg-white/5 rounded-full">
                    {history.length} Logs Found
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {history.slice(0, 6).map((item, idx) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="p-5 bg-zinc-950 border border-white/5 rounded-3xl group hover:border-purple-500/30 transition-all"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-purple-600/10 rounded-lg text-purple-500 text-[10px] font-black uppercase tracking-widest">
                                {item.muscle_group}
                            </div>
                            <span className="text-[9px] font-mono text-zinc-600 uppercase">{new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                        </div>
                        <h4 className="text-sm font-black text-white uppercase italic font-outfit truncate">{item.exercise_name}</h4>

                        <div className="mt-4 grid grid-cols-3 gap-2">
                            <div className="p-2 bg-white/5 rounded-xl text-center">
                                <p className="text-[8px] font-black text-zinc-700 uppercase mb-0.5">Sets</p>
                                <p className="text-xs font-black text-zinc-300">{item.sets}</p>
                            </div>
                            <div className="p-2 bg-white/5 rounded-xl text-center">
                                <p className="text-[8px] font-black text-zinc-700 uppercase mb-0.5">Reps</p>
                                <p className="text-xs font-black text-zinc-300">{item.reps}</p>
                            </div>
                            <div className="p-2 bg-white/5 rounded-xl text-center">
                                <p className="text-[8px] font-black text-zinc-700 uppercase mb-0.5">Mass</p>
                                <p className="text-xs font-black text-purple-500">{item.weight}kg</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {history.length === 0 && (
                <div className="p-10 text-center border-2 border-dashed border-white/5 rounded-3xl bg-zinc-950/50">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">No Historical Records Found in Archives.</p>
                </div>
            )}
        </div>
    )
}
