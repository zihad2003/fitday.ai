'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Icons from '@/components/icons/Icons'
import { fetchExerciseImage } from '@/lib/exercise-image-service'
import { motion, AnimatePresence } from 'framer-motion'

export default function ActiveWorkoutPage() {
    const router = useRouter()
    const [workout, setWorkout] = useState<any>(null)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isResting, setIsResting] = useState(false)
    const [timer, setTimer] = useState(0)
    const [timerActive, setTimerActive] = useState(false)
    const [gifUrl, setGifUrl] = useState<string | null>(null)

    // Load workout on mount
    useEffect(() => {
        // Determine goal from user or default
        const goal = 'gain_muscle' // default or fetch from context

        // Simulate fetching the active workout
        import('@/lib/exercise-db').then(({ getRecommendedWorkout }) => {
            getRecommendedWorkout(goal).then(data => {
                setWorkout(data)
                fetchImage(data.exercises[0].name)
            })
        })
    }, [])

    const fetchImage = async (name: string) => {
        setGifUrl(null)
        const url = await fetchExerciseImage(name)
        setGifUrl(url)
    }

    // Timer logic
    useEffect(() => {
        let interval: any
        if (timerActive && timer > 0) {
            interval = setInterval(() => setTimer(t => t - 1), 1000)
        } else if (timer === 0 && timerActive) {
            setTimerActive(false)
            setIsResting(false) // Auto-end rest?
        }
        return () => clearInterval(interval)
    }, [timer, timerActive])

    const handleNext = () => {
        if (isResting) {
            // Skip rest
            setIsResting(false)
            setTimerActive(false)
            return
        }

        // Determine if we should rest or move to next exercise
        // For simplicity: after "Done" with exercise, go to Rest
        // But this UI is "Guidance", so it usually shows the Exercise while you do it.
        // Let's assume user clicks "Set Complete".
        // If not last set, rest. If last set, next exercise.
        // Simplifying: One "Exercise" screen per exercise. "Next" goes to Rest for that exercise.

        // Let's just go straight to next exercise for the MVP flow, showing a 'Rest' interstitial.

        if (currentIndex < workout.exercises.length - 1) {
            setIsResting(true)
            setTimer(60) // Default rest
            setTimerActive(true)
            // Pre-fetch next image
            fetchImage(workout.exercises[currentIndex + 1].name)
            setCurrentIndex(c => c + 1)
        } else {
            // Finish
            // Show completion modal or redirect
            alert("Workout Complete! Great job.")
            router.push('/dashboard')
        }
    }

    if (!workout) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading Workout...</div>

    const currentExercise = workout.exercises[currentIndex]

    return (
        <div className="min-h-screen bg-black text-white flex flex-col font-outfit relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-black pointer-events-none" />

            {/* Header */}
            <div className="p-6 flex items-center justify-between relative z-10 glass-card mx-4 mt-4 rounded-xl">
                <Link href="/dashboard" className="text-zinc-400 hover:text-white transition-colors">
                    <Icons.Minimize size={24} />
                </Link>
                <div className="text-center">
                    <h1 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">{workout.title}</h1>
                    <div className="flex items-center justify-center gap-2 text-xs font-mono text-purple-400">
                        <span>{currentIndex + 1} / {workout.exercises.length}</span>
                    </div>
                </div>
                <button className="text-zinc-400 hover:text-white">
                    <Icons.Activity size={24} />
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col p-6 relative z-10 max-w-md mx-auto w-full">

                {/* Visual Demo */}
                <div className="aspect-square bg-zinc-900 rounded-3xl overflow-hidden border border-white/10 relative shadow-2xl mb-8 group">
                    {isResting ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900">
                            <span className="text-zinc-500 font-black uppercase tracking-widest text-sm mb-4">Resting</span>
                            <div className="text-8xl font-black italic text-white font-mono tabular-nums">{timer}</div>
                            <span className="text-zinc-600 text-xs mt-4">seconds</span>
                            <div className="absolute bottom-8 w-full px-8">
                                <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: '100%' }}
                                        animate={{ width: `${(timer / 60) * 100}%` }}
                                        transition={{ duration: 1, ease: 'linear' }}
                                        className="h-full bg-emerald-500"
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {gifUrl ? (
                                <img src={gifUrl} alt={currentExercise.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                                    <Icons.Strength size={64} className="text-zinc-700" />
                                </div>
                            )}
                            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-6 pt-20">
                                <h2 className="text-3xl font-black uppercase italic leading-none">{currentExercise.name}</h2>
                            </div>
                        </>
                    )}
                </div>

                {/* Controls & Metrics */}
                <div className="glass-card p-6 rounded-3xl flex-1 flex flex-col justify-between">

                    {isResting ? (
                        <div>
                            <h3 className="text-zinc-400 uppercase text-xs font-bold tracking-widest mb-2">Up Next</h3>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center">
                                    <span className="font-black text-lg text-zinc-600">{currentIndex + 1}</span>
                                </div>
                                <div>
                                    <div className="font-bold text-lg">{workout.exercises[currentIndex].name}</div>
                                    <div className="text-xs text-zinc-500">{workout.exercises[currentIndex].sets} Sets x {workout.exercises[currentIndex].reps} Reps</div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-3 gap-4 mb-8">
                                <div className="text-center p-3 bg-white/5 rounded-2xl border border-white/5">
                                    <span className="block text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Sets</span>
                                    <span className="text-2xl font-black font-outfit">{currentExercise.sets}</span>
                                </div>
                                <div className="text-center p-3 bg-white/5 rounded-2xl border border-white/5">
                                    <span className="block text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Reps</span>
                                    <span className="text-2xl font-black font-outfit">{currentExercise.reps}</span>
                                </div>
                                <div className="text-center p-3 bg-white/5 rounded-2xl border border-white/5">
                                    <span className="block text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Tempo</span>
                                    <span className="text-2xl font-black font-outfit">2-0-2</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm text-zinc-300">
                                    <Icons.Check size={18} className="text-emerald-500" />
                                    <span>Keep core engaged throughout</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-zinc-300">
                                    <Icons.Check size={18} className="text-emerald-500" />
                                    <span>Control the eccentric phase</span>
                                </div>
                            </div>
                        </>
                    )}

                    <button
                        onClick={handleNext}
                        className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest mt-8 transition-all active:scale-95 shadow-xl flex items-center justify-center gap-2 ${isResting ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/20'
                            }`}
                    >
                        {isResting ? 'Skip Rest' : 'Complete Exercise'}
                        <Icons.ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    )
}
