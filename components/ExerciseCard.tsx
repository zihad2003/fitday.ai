'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Icons from '@/components/icons/Icons'
import { Exercise } from '@/lib/exercise-db'
import { fetchExerciseImage } from '@/lib/exercise-image-service'

interface ExerciseCardProps {
    exercise: Exercise
    compact?: boolean
}

export default function ExerciseCard({ exercise, compact = false }: ExerciseCardProps) {
    const [imageUrl, setImageUrl] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let mounted = true
        fetchExerciseImage(exercise.name).then(url => {
            if (mounted) {
                setImageUrl(url)
                setLoading(false)
            }
        })
        return () => { mounted = false }
    }, [exercise.name])

    return (
        <div className={`glass-card overflow-hidden group hover:border-emerald-500/30 transition-all ${compact ? 'p-3' : 'p-0'}`}>
            {/* Image Area */}
            <div className={`relative bg-zinc-900/50 flex items-center justify-center overflow-hidden ${compact ? 'h-24 rounded-lg mb-2' : 'h-48'}`}>
                {!compact && (
                    <div className="absolute top-2 right-2 z-10">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${exercise.difficulty === 'beginner' ? 'bg-emerald-500/20 text-emerald-400' :
                                exercise.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                                    'bg-red-500/20 text-red-400'
                            }`}>
                            {exercise.difficulty}
                        </span>
                    </div>
                )}

                {loading ? (
                    <Icons.Activity className="animate-pulse text-zinc-700" size={24} />
                ) : imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={exercise.name}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                ) : (
                    <div className="text-zinc-700 flex flex-col items-center gap-2">
                        <Icons.Strength size={24} />
                        <span className="text-[10px]">No Preview</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className={compact ? '' : 'p-5'}>
                <h3 className={`font-bold font-outfit text-white ${compact ? 'text-sm' : 'text-lg'}`}>{exercise.name}</h3>

                <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs text-zinc-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                        {exercise.target_muscle}
                    </span>
                    <span className="text-xs text-zinc-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        {exercise.type}
                    </span>
                </div>

                {!compact && (
                    <div className="mt-4 flex gap-2">
                        <button className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors">
                            Details
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
