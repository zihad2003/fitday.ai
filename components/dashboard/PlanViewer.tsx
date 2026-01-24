'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dumbbell, Utensils, Flame, Clock, PlayCircle, Minimize2 } from 'lucide-react'

// Define the shape of our data (mirroring schedule-engine structure)
interface Meal {
    name: string
    cal: number
    p: number
    desc: string
}

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

interface DetailedPlan {
    meals: {
        breakfast: Meal
        lunch: Meal
        dinner: Meal
        snack: Meal
    }
    workout: WorkoutRoutine
}

export default function PlanViewer({ plan }: { plan: DetailedPlan }) {
    const [activeTab, setActiveTab] = useState<'nutrition' | 'training'>('training')
    const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)

    return (
        <div className="h-full flex flex-col space-y-6">

            {/* Tab Switcher */}
            <div className="flex bg-zinc-950 p-1.5 rounded-2xl border border-white/5 self-start">
                <button
                    onClick={() => setActiveTab('training')}
                    className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'training' ? 'bg-purple-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                >
                    Training Protocol
                </button>
                <button
                    onClick={() => setActiveTab('nutrition')}
                    className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'nutrition' ? 'bg-orange-500 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                >
                    Nutrition Plan
                </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative">
                <AnimatePresence mode='wait'>

                    {/* TRAINING TAB */}
                    {activeTab === 'training' && (
                        <motion.div
                            key="training"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-6"
                        >
                            <div className="bg-purple-900/10 border border-purple-500/20 p-6 rounded-[2rem] flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-black font-outfit uppercase italic text-white mb-2">{plan.workout.title}</h3>
                                    <div className="flex gap-4 text-[10px] font-mono text-purple-300 uppercase tracking-widest">
                                        <span className="flex items-center gap-1"><Clock size={12} /> {plan.workout.duration}</span>
                                        <span className="flex items-center gap-1"><Flame size={12} /> {plan.workout.focus}</span>
                                    </div>
                                </div>
                                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white shadow-[0_0_20px_#9333ea]">
                                    <Dumbbell size={20} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {plan.workout.exercises.map((ex, i) => (
                                    <div
                                        key={i}
                                        className="p-5 bg-white/5 border border-white/5 rounded-3xl hover:border-purple-500/30 transition-all cursor-pointer group"
                                        onClick={() => setSelectedExercise(ex)}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-zinc-500 group-hover:text-purple-400 group-hover:scale-110 transition-all">
                                                <PlayCircle size={18} />
                                            </div>
                                            <span className="text-[10px] bg-white/10 px-2 py-1 rounded text-zinc-400 uppercase tracking-widest">{ex.sets} x {ex.reps}</span>
                                        </div>
                                        <h4 className="font-bold text-white mb-1 uppercase font-outfit text-sm">{ex.name}</h4>
                                        <p className="text-[10px] text-zinc-500 uppercase tracking-wide">Rest: {ex.rest}</p>

                                        {/* Tiny GIF Preview (Placeholder Visual) */}
                                        <div className="mt-4 h-24 bg-black/50 rounded-xl overflow-hidden relative opacity-60 group-hover:opacity-100 transition-opacity">
                                            <img src={ex.gif || "/placeholder-workout.gif"} className="w-full h-full object-cover mix-blend-screen" alt="Demo" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* NUTRITION TAB */}
                    {activeTab === 'nutrition' && (
                        <motion.div
                            key="nutrition"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-4"
                        >
                            {Object.entries(plan.meals).map(([type, meal], i) => (
                                <div key={i} className="bg-zinc-900 border border-white/5 p-6 rounded-3xl flex gap-6 items-center">
                                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-2xl shrink-0">
                                        {type === 'breakfast' && '🍳'}
                                        {type === 'lunch' && '🍗'}
                                        {type === 'snack' && '🍎'}
                                        {type === 'dinner' && '🥗'}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">{type}</span>
                                            <span className="h-3 w-[1px] bg-white/10" />
                                            <span className="text-[10px] font-mono text-zinc-500">{meal.cal} KCAL</span>
                                        </div>
                                        <h4 className="text-lg font-bold text-white italic font-outfit uppercase">{meal.name}</h4>
                                        <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{meal.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>

            {/* EXERCISE MODAL */}
            <AnimatePresence>
                {selectedExercise && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl"
                        onClick={() => setSelectedExercise(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-zinc-950 border border-white/10 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="h-64 bg-black relative flex items-center justify-center overflow-hidden">
                                {/* Highlight: Use iframe/video for valid GIFs or fallback to image */}
                                {selectedExercise.gif ? (
                                    <img src={selectedExercise.gif} className="w-full h-full object-cover opacity-80" />
                                ) : (
                                    <div className="text-zinc-700 font-mono text-xs uppercase">Visual Loading...</div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
                                <button
                                    onClick={() => setSelectedExercise(null)}
                                    className="absolute top-6 right-6 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white text-white hover:text-black transition-all"
                                >
                                    <Minimize2 size={18} />
                                </button>
                            </div>

                            <div className="p-10">
                                <h2 className="text-3xl font-black font-outfit italic uppercase text-white mb-2">{selectedExercise.name}</h2>
                                <div className="flex gap-2 mb-8">
                                    {selectedExercise.tags.map(t => (
                                        <span key={t} className="px-3 py-1 bg-purple-900/30 text-purple-300 rounded text-[9px] font-black uppercase tracking-widest border border-purple-500/20">{t}</span>
                                    ))}
                                </div>

                                <div className="grid grid-cols-3 gap-4 mb-8">
                                    <div className="p-4 bg-white/5 rounded-2xl text-center">
                                        <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Sets</div>
                                        <div className="text-xl font-black italic text-white">{selectedExercise.sets}</div>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-2xl text-center">
                                        <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Reps</div>
                                        <div className="text-xl font-black italic text-white">{selectedExercise.reps}</div>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-2xl text-center">
                                        <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Rest</div>
                                        <div className="text-xl font-black italic text-white">{selectedExercise.rest}</div>
                                    </div>
                                </div>

                                <button onClick={() => setSelectedExercise(null)} className="w-full h-14 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all">
                                    Complete Set
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    )
}
