'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dumbbell, Clock, Flame, PlayCircle, Minimize2, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { HoverScale } from '@/components/animations/Transitions'

// Types (re-defined or imported)
interface Exercise {
    name: string
    sets: string
    reps: string
    rest: string
    gif?: string
    tags: string[]
}

interface WorkoutRoutine {
    title: string
    focus: string
    duration: string
    exercises: Exercise[]
}

export default function WorkoutCard({ workout }: { workout: WorkoutRoutine }) {
    const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)

    return (
        <HoverScale scale={1.02} className="h-full">
            <div className="stat-card p-8 h-full flex flex-col relative overflow-hidden group">
                {/* Background Atmosphere */}
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-500/10 transition-colors" />

                <div className="flex justify-between items-start mb-8 relative z-10">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-purple-400">Training Protocol</span>
                        </div>
                        <h3 className="text-2xl font-black font-outfit uppercase italic text-white leading-none mb-3">{workout.title}</h3>
                        <div className="flex gap-4 text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em]">
                            <span className="flex items-center gap-1.5"><Clock size={11} className="text-purple-500" /> {workout.duration}</span>
                            <span className="flex items-center gap-1.5"><Flame size={11} className="text-purple-500" /> {workout.focus}</span>
                        </div>
                    </div>
                    <Link href="/dashboard/workout/active" className="w-12 h-12 bg-purple-600 hover:bg-purple-500 rounded-[1rem] flex items-center justify-center text-white shadow-lg shadow-purple-600/20 group-hover:scale-110 transition-all z-20 cursor-pointer">
                        <PlayCircle size={24} className="fill-current" />
                    </Link>
                </div>

                {/* Exercise List */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 subtle-scrollbar relative z-10">
                    {workout.exercises.map((ex, i) => (
                        <div
                            key={i}
                            onClick={() => setSelectedExercise(ex)}
                            className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl hover:border-purple-500/30 hover:bg-white/[0.08] transition-all cursor-pointer flex gap-5 items-center group/item"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-black relative overflow-hidden shrink-0 border border-white/5 shadow-2xl">
                                {ex.gif ? (
                                    <img src={ex.gif} alt={ex.name} className="w-full h-full object-cover opacity-70 group-hover/item:opacity-100 group-hover/item:scale-110 transition-all duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-800"><Dumbbell size={16} /></div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                <div className="absolute bottom-1 right-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                    <PlayCircle size={12} className="text-purple-400" />
                                </div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <h4 className="font-black text-white text-[11px] uppercase font-outfit truncate tracking-wide">{ex.name}</h4>
                                <div className="flex gap-3 items-center text-[9px] text-zinc-600 uppercase tracking-widest mt-1.5 font-mono">
                                    <span className="text-purple-500/60">{ex.sets} Sets</span>
                                    <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                                    <span>{ex.reps} Reps</span>
                                </div>
                            </div>

                            <ChevronRight size={14} className="text-zinc-800 group-hover/item:text-purple-500 group-hover/item:translate-x-1 transition-all" />
                        </div>
                    ))}
                </div>

                {/* Modal */}
                <AnimatePresence>
                    {selectedExercise && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl"
                            onClick={() => setSelectedExercise(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 30, opacity: 0 }}
                                animate={{ scale: 1, y: 0, opacity: 1 }}
                                exit={{ scale: 0.9, y: 30, opacity: 0 }}
                                className="bg-zinc-950 border border-white/10 w-full max-w-lg rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(147,51,234,0.15)] relative"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="aspect-square bg-black relative flex items-center justify-center">
                                    {selectedExercise.gif ? (
                                        <img src={selectedExercise.gif} alt={selectedExercise.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Dumbbell size={80} className="text-zinc-900" />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
                                    <button
                                        onClick={() => setSelectedExercise(null)}
                                        className="absolute top-6 right-6 w-12 h-12 bg-white/5 hover:bg-white/10 text-white rounded-full flex items-center justify-center backdrop-blur-md border border-white/10 transition-all"
                                    >
                                        <Minimize2 size={18} />
                                    </button>
                                </div>
                                <div className="p-10 relative -mt-20 z-10">
                                    <div className="flex gap-2 mb-4">
                                        {selectedExercise.tags.map(tag => (
                                            <span key={tag} className="text-[8px] font-black uppercase tracking-[0.2em] bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full border border-purple-500/20">{tag}</span>
                                        ))}
                                    </div>
                                    <h3 className="text-4xl font-black font-outfit uppercase italic text-white mb-8 tracking-tight">{selectedExercise.name}</h3>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-white/[0.03] border border-white/5 p-5 rounded-[2rem] text-center">
                                            <div className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mb-1.5">Sets</div>
                                            <div className="text-2xl font-black italic font-outfit text-white">{selectedExercise.sets}</div>
                                        </div>
                                        <div className="bg-white/[0.03] border border-white/5 p-5 rounded-[2rem] text-center">
                                            <div className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mb-1.5">Reps</div>
                                            <div className="text-2xl font-black italic font-outfit text-white">{selectedExercise.reps}</div>
                                        </div>
                                        <div className="bg-white/[0.03] border border-white/5 p-5 rounded-[2rem] text-center">
                                            <div className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mb-1.5">Rest</div>
                                            <div className="text-2xl font-black italic font-outfit text-white">{selectedExercise.rest}</div>
                                        </div>
                                    </div>

                                    <button className="w-full mt-10 py-5 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-[0_10px_30px_rgba(147,51,234,0.3)] active:scale-95">
                                        Log Performance
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </HoverScale>
    )
}

