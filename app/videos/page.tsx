'use client'

import { useEffect, useState } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import TopBar from '@/components/dashboard/TopBar'
import { fetchAllExercises, ExerciseDBItem } from '@/lib/exercise-db'
import { PlayCircle } from 'lucide-react'

export default function VideosPage() {
    const [exercises, setExercises] = useState<ExerciseDBItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchAllExercises().then(data => {
            // Filter only those with images
            const visualEx = data.filter(e => e.images && e.images.length > 0)
            setExercises(visualEx.slice(0, 50)) // Show top 50 for performance
            setLoading(false)
        })
    }, [])

    return (
        <div className="min-h-screen bg-black text-white flex font-inter overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-10 no-scrollbar relative">
                <div className="glow-purple top-[-10%] right-[-10%] w-[50%] h-[50%] opacity-10" />
                <TopBar title="Workout Library" subtitle="Database: 800+ Exercises" />

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="aspect-square bg-white/5 rounded-3xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {exercises.map((ex) => (
                            <div key={ex.id} className="group bg-zinc-900 border border-white/5 p-4 rounded-3xl hover:border-purple-500/50 transition-all cursor-pointer">
                                <div className="aspect-square bg-black rounded-2xl overflow-hidden mb-4 relative">
                                    <img
                                        src={`https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${ex.images[0]}`}
                                        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity mix-blend-screen"
                                        alt={ex.name}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <PlayCircle size={40} className="text-white drop-shadow-lg" />
                                    </div>
                                </div>
                                <h3 className="text-sm font-black font-outfit uppercase italic text-white mb-2 line-clamp-1" title={ex.name}>{ex.name}</h3>
                                <div className="flex flex-wrap gap-2">
                                    <span className="text-[9px] px-2 py-1 bg-white/5 rounded text-zinc-400 uppercase tracking-wide">{ex.primaryMuscles[0]}</span>
                                    <span className="text-[9px] px-2 py-1 bg-white/5 rounded text-zinc-400 uppercase tracking-wide">{ex.level}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
