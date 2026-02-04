'use client'

import { useState } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import MobileNav from '@/components/dashboard/MobileNav'
import TopBar from '@/components/dashboard/TopBar'
import ExerciseCard from '@/components/ExerciseCard'
import { EXERCISE_DATABASE, Exercise } from '@/lib/exercise-db'
import Icons from '@/components/icons/Icons'

export default function ExerciseLibraryPage() {
    const [search, setSearch] = useState('')
    const [filterMuscle, setFilterMuscle] = useState<string>('all')

    const muscles = ['chest', 'back', 'shoulders', 'legs', 'arms', 'core']

    const filteredExercises = EXERCISE_DATABASE.filter(ex => {
        const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase())
        const matchesMuscle = filterMuscle === 'all' || ex.target_muscle === filterMuscle
        return matchesSearch && matchesMuscle
    })

    return (
        <div className="min-h-screen bg-black text-white flex font-inter overflow-hidden">
            <Sidebar />
            <MobileNav />
            <main className="flex-1 overflow-y-auto p-6 md:p-10 no-scrollbar relative">
                <TopBar title="Exercise Library" subtitle="Visual Guidance & Form" />

                {/* Search & Filter */}
                <div className="mt-8 mb-8 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Icons.Activity className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search exercises..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-zinc-900/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-emerald-500/50 transition-colors"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        <button
                            onClick={() => setFilterMuscle('all')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${filterMuscle === 'all' ? 'bg-emerald-600 text-white' : 'bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white'
                                }`}
                        >
                            All
                        </button>
                        {muscles.map(m => (
                            <button
                                key={m}
                                onClick={() => setFilterMuscle(m)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${filterMuscle === m ? 'bg-emerald-600 text-white' : 'bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white'
                                    }`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredExercises.map(ex => (
                        <ExerciseCard key={ex.id} exercise={ex} />
                    ))}
                </div>
            </main>
        </div>
    )
}
