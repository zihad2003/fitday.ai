'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dumbbell, Clock, Info, Check, Play, ChevronRight, Zap } from 'lucide-react'
import { Analytics } from '@/lib/analytics'
import { useCelebration } from '@/components/providers/CelebrationProvider'

interface WorkoutTimelineProps {
    userId: number
    date?: string
}

export default function WorkoutTimeline({ userId, date = new Date().toISOString().split('T')[0] }: WorkoutTimelineProps) {
    const [exercises, setExercises] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [activeId, setActiveId] = useState<number | null>(null)
    const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set())
    const { celebrate } = useCelebration()

    useEffect(() => {
        const fetchWorkout = async () => {
            try {
                const res = await fetch(`/api/workouts?user_id=${userId}&date=${date}`)
                const json = await res.json() as { success: boolean, data: any[] }
                if (json.success) {
                    setExercises(json.data)
                    // Sync completed state
                    const completed = new Set(json.data.filter(ex => ex.completed).map(ex => ex.id))
                    setCompletedExercises(completed)
                }
            } catch (err) {
                console.error("Failed to fetch workout plan", err)
            } finally {
                setLoading(false)
            }
        }
        fetchWorkout()
    }, [userId, date])

    const toggleComplete = async (id: number) => {
        const exercise = exercises.find(ex => ex.id === id)
        const isCurrentlyDone = completedExercises.has(id)
        const nextState = !isCurrentlyDone

        // 1. Optimistic UI update
        setCompletedExercises(prev => {
            const next = new Set(prev)
            if (isCurrentlyDone) {
                next.delete(id)
            } else {
                next.add(id)
            }
            return next
        })

        // 2. Persist to DB
        try {
            const res = await fetch('/api/workouts', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, completed: nextState })
            })

            if (res.ok) {
                if (nextState) {
                    Analytics.trackFeatureUsage('workout_timeline', 'complete_exercise', {
                        exercise_name: exercise?.exercise_name,
                        muscle_group: exercise?.muscle_group
                    })

                    // Track whole session completion
                    const totalCompleted = completedExercises.size + (nextState ? 1 : -1)
                    if (totalCompleted === exercises.length && exercises.length > 0) {
                        Analytics.trackConversion('workout_session_completed', 100)
                        celebrate('Neural Adaptation Complete', 'Training protocol terminated with high intensity. Physical evolution confirmed.', 'milestone')
                    }
                } else {
                    Analytics.trackFeatureUsage('workout_timeline', 'unmark_exercise', { exercise_name: exercise?.exercise_name })
                }
            } else {
                // Rollback if failed
                setCompletedExercises(prev => {
                    const next = new Set(prev)
                    if (nextState) next.delete(id)
                    else next.add(id)
                    return next
                })
            }
        } catch (err) {
            console.error("Failed to sync workout completion", err)
        }
    }

    if (loading) return <div className="animate-pulse bg-zinc-900 h-64 rounded-[2.5rem]" />
    if (exercises.length === 0) return (
        <div className="stat-card p-12 text-center border-dashed border-white/5 opacity-50">
            <Dumbbell size={48} className="mx-auto mb-4 text-zinc-800" />
            <p className="text-xs font-black uppercase tracking-widest text-zinc-600 italic">No Strategic Training Scheduled for Today</p>
        </div>
    )

    return (
        <div id="workout-timeline" className="bg-zinc-950 border border-white/5 rounded-[2.5rem] p-0 relative overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-zinc-900/30">
                <div>
                    <h3 className="text-xl font-black font-outfit uppercase italic text-white flex items-center gap-3">
                        Training Protocol
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full">
                            <Zap size={10} className="text-purple-500 fill-purple-500" />
                            <span className="text-[9px] font-black text-purple-400">ACTIVE SESSION</span>
                        </div>
                    </h3>
                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] mt-1">Neuromuscular Stimulus Program</p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-black font-mono text-purple-400 leading-none">{exercises.length} <span className="text-xs text-zinc-600">STAGES</span></div>
                </div>
            </div>

            <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
                {exercises.map((ex, idx) => {
                    const isActive = activeId === ex.id
                    const isDone = completedExercises.has(ex.id)

                    return (
                        <motion.div
                            key={`${ex.id}-${idx}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`group overflow-hidden rounded-3xl border transition-all duration-500 ${isActive
                                ? 'bg-gradient-to-br from-purple-900/30 to-black border-purple-500/50 scale-[1.02] shadow-2xl'
                                : isDone
                                    ? 'bg-emerald-900/5 border-emerald-500/10 opacity-70'
                                    : 'bg-white/5 border-white/5 hover:border-white/10'
                                }`}
                        >
                            <div
                                className="p-5 flex items-center gap-5 cursor-pointer"
                                onClick={() => setActiveId(isActive ? null : ex.id)}
                            >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border font-mono font-black italic transition-all ${isActive ? 'bg-purple-600 border-purple-400 text-white' : isDone ? 'bg-emerald-500 border-emerald-400 text-black' : 'bg-black border-white/10 text-zinc-600'
                                    }`}>
                                    {isDone ? <Check size={20} /> : (idx + 1).toString().padStart(2, '0')}
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{ex.muscle_group}</span>
                                        {isActive && <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-purple-500" />}
                                    </div>
                                    <h4 className={`text-base font-black font-outfit uppercase italic leading-none ${isDone ? 'line-through text-zinc-600' : 'text-zinc-200'}`}>
                                        {ex.exercise_name}
                                    </h4>
                                    <div className="flex gap-4 mt-3">
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={12} className="text-zinc-700" />
                                            <span className="text-[10px] font-mono font-bold text-zinc-500 tracking-tighter">{ex.sets} SETS × {ex.reps} REPS</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={(e) => { e.stopPropagation(); toggleComplete(ex.id) }}
                                    className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${isDone ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'bg-white/5 border-white/10 text-zinc-700 hover:text-white hover:border-white/20'
                                        }`}
                                >
                                    <Check size={16} />
                                </button>
                            </div>

                            <AnimatePresence>
                                {isActive && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="border-t border-purple-500/20 overflow-hidden"
                                    >
                                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* GIF Visual */}
                                            <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-900 border border-white/5">
                                                <img
                                                    src={ex.gif_url || "https://gymvisual.com/img/p/1/7/5/5/2/17552.gif"}
                                                    alt={ex.exercise_name}
                                                    className="w-full h-full object-cover mix-blend-screen opacity-80"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                                <div className="absolute bottom-4 left-4 p-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg flex items-center gap-2">
                                                    <Play size={10} className="text-purple-500 fill-purple-500" />
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400">Tactical Preview</span>
                                                </div>
                                            </div>

                                            {/* Specs */}
                                            <div className="space-y-4">
                                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Info size={14} className="text-purple-500" />
                                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Execution Protocol</span>
                                                    </div>
                                                    <p className="text-[11px] font-medium text-zinc-500 leading-relaxed italic uppercase">
                                                        {ex.safety_instruction || "Maintain rigid core stability. Controlled eccentric phase. Peak contraction at terminal range."}
                                                    </p>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="stat-sm">
                                                        <span className="label">Complexity</span>
                                                        <span className="val text-purple-400">{ex.difficulty || 'INT'}</span>
                                                    </div>
                                                    <div className="stat-sm">
                                                        <span className="label">Target Mass</span>
                                                        <span className="val text-cyan-400">{ex.muscle_group}</span>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={(e) => {
                                                        toggleComplete(ex.id)
                                                        if (idx < exercises.length - 1) {
                                                            setActiveId(exercises[idx + 1].id)
                                                        } else {
                                                            setActiveId(null)
                                                            import('@/components/animations/Toast').then(m => m.showToast('Daily Protocol Terminated Successfully', 'success'))
                                                        }
                                                    }}
                                                    className="w-full h-12 bg-white text-black rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all active:scale-95"
                                                >
                                                    {idx < exercises.length - 1 ? 'Next Protocol' : 'Finish Session'} <ChevronRight size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )
                })}
            </div>

            {/* Persistence Bar */}
            <div className="h-2 w-full bg-zinc-900 overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(completedExercises.size / exercises.length) * 100}%` }}
                    className="h-full bg-purple-600 shadow-[0_0_20px_#9333ea]"
                />
            </div>

            <style jsx>{`
        .stat-sm {
          @apply p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col gap-1;
        }
        .stat-sm .label {
          @apply text-[8px] font-black uppercase tracking-widest text-zinc-600;
        }
        .stat-sm .val {
          @apply text-sm font-black font-outfit uppercase italic;
        }
      `}</style>
        </div>
    )
}
