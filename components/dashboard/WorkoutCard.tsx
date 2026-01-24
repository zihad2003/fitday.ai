'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dumbbell, Clock, Flame, PlayCircle, Minimize2 } from 'lucide-react'

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
        <div className="stat-card p-6 h-full flex flex-col relative overflow-hidden group">
            {/* Header */}
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-purple-400">Training Protocol</span>
                    </div>
                    <h3 className="text-xl font-black font-outfit uppercase italic text-white leading-none mb-2">{workout.title}</h3>
                    <div className="flex gap-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                        <span className="flex items-center gap-1"><Clock size={10} /> {workout.duration}</span>
                        <span className="flex items-center gap-1"><Flame size={10} /> {workout.focus}</span>
                    </div>
                </div>
                <div className="w-10 h-10 bg-purple-900/20 rounded-xl flex items-center justify-center text-purple-400 border border-purple-500/20">
                    <Dumbbell size={18} />
                </div>
            </div>

            {/* Exercise List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar relative z-10">
                {workout.exercises.map((ex, i) => (
                    <div
                        key={i}
                        onClick={() => setSelectedExercise(ex)}
                        className="p-3 bg-white/5 border border-white/5 rounded-2xl hover:border-purple-500/30 hover:bg-white/10 transition-all cursor-pointer flex gap-4 items-center group/item"
                    >
                        <div className="w-12 h-12 rounded-xl bg-black relative overflow-hidden shrink-0 border border-white/10">
                            {ex.gif ? (
                                <img src={ex.gif} className="w-full h-full object-cover opacity-60 group-hover/item:opacity-100 transition-opacity" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-700"><Dumbbell size={14} /></div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-white text-xs uppercase font-outfit truncate">{ex.name}</h4>
                            <div className="flex gap-3 text-[9px] text-zinc-500 uppercase tracking-wide mt-1">
                                <span>{ex.sets} Sets</span>
                                <span className="w-px h-3 bg-white/10" />
                                <span>{ex.reps} Reps</span>
                            </div>
                        </div>
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
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
                        onClick={() => setSelectedExercise(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-zinc-950 border border-purple-500/20 w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="aspect-square bg-black relative">
                                {selectedExercise.gif && <img src={selectedExercise.gif} className="w-full h-full object-contain" />}
                                <button onClick={() => setSelectedExercise(null)} className="absolute top-4 right-4 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-sm">
                                    <Minimize2 size={14} />
                                </button>
                            </div>
                            <div className="p-6">
                                <h3 className="text-2xl font-black font-outfit uppercase italic text-white mb-4">{selectedExercise.name}</h3>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="bg-white/5 p-3 rounded-xl text-center">
                                        <div className="text-[9px] text-zinc-500 uppercase">Sets</div>
                                        <div className="text-lg font-black">{selectedExercise.sets}</div>
                                    </div>
                                    <div className="bg-white/5 p-3 rounded-xl text-center">
                                        <div className="text-[9px] text-zinc-500 uppercase">Reps</div>
                                        <div className="text-lg font-black">{selectedExercise.reps}</div>
                                    </div>
                                    <div className="bg-white/5 p-3 rounded-xl text-center">
                                        <div className="text-[9px] text-zinc-500 uppercase">Rest</div>
                                        <div className="text-lg font-black">{selectedExercise.rest}</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    )
}
