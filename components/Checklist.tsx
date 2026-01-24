'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns' // npm install date-fns
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getUserSession } from '@/lib/auth'

// --- Types matching your Database Schema ---
type Meal = {
  id: number
  meal_type: string
  food_name: string
  completed: number // 0 or 1
  calories: number
}

type Workout = {
  id: number
  exercise_name: string
  completed: number // 0 or 1
}

// Generic API Response Wrapper
type ApiResponse<T> = {
  success: boolean
  data: T
  error?: string
}

export default function ChecklistPage() {
  const router = useRouter()
  const [meals, setMeals] = useState<Meal[]>([])
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<number | null>(null)

  const today = format(new Date(), 'yyyy-MM-dd')

  // --- 1. DATA SYNC ENGINE ---
  useEffect(() => {
    // Check authentication first
    const session = getUserSession()
    if (!session) {
      router.push('/login')
      return
    }

    setUserId(session.id)

    async function fetchData() {
      if (!session.id) return

      try {
        // Parallel fetching for performance
        const [mealsRes, workoutsRes] = await Promise.all([
          fetch(`/api/meals?user_id=${session.id}&date=${today}`),
          fetch(`/api/workouts?user_id=${session.id}&date=${today}`)
        ])

        const mealsJson = (await mealsRes.json()) as ApiResponse<Meal[]>
        const workoutsJson = (await workoutsRes.json()) as ApiResponse<Workout[]>

        if (mealsJson.success) setMeals(mealsJson.data)
        if (workoutsJson.success) setWorkouts(workoutsJson.data)
      } catch (error) {
        console.error('Failed to sync protocol:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [today, router])

  // --- 2. OPTIMISTIC UPDATE HANDLERS ---
  const toggleMeal = async (id: number, currentStatus: number) => {
    // A. Immediate UI Update (Optimistic)
    const newStatus = currentStatus === 1 ? 0 : 1
    setMeals(prev => prev.map(m => m.id === id ? { ...m, completed: newStatus } : m))

    // B. Background API Sync
    try {
      await fetch(`/api/meals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: newStatus === 1 })
      })
    } catch {
      // Revert if server fails
      setMeals(prev => prev.map(m => m.id === id ? { ...m, completed: currentStatus } : m))
    }
  }

  const toggleWorkout = async (id: number, currentStatus: number) => {
    const newStatus = currentStatus === 1 ? 0 : 1
    setWorkouts(prev => prev.map(w => w.id === id ? { ...w, completed: newStatus } : w))

    try {
      await fetch(`/api/workouts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: newStatus === 1 })
      })
    } catch {
      setWorkouts(prev => prev.map(w => w.id === id ? { ...w, completed: currentStatus } : w))
    }
  }

  // --- 3. PROGRESS CALCULATION ---
  const totalItems = meals.length + workouts.length
  const completedItems = meals.filter(m => m.completed).length + workouts.filter(w => w.completed).length
  const progress = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100)

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-cyan-500/30 font-sans pb-20">

      {/* Background Grid */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      {/* Navbar */}
      <div className="border-b border-white/5 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="text-sm font-mono text-slate-400 hover:text-white transition flex items-center gap-2">
            ← BACK TO HUB
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs font-mono text-emerald-500 uppercase tracking-widest">Live Sync</span>
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 pt-10 relative z-10">

        {/* Progress Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-900/50 border border-white/10 rounded-3xl p-8 mb-12 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
            <div className="h-full bg-cyan-500 transition-all duration-700 ease-out shadow-[0_0_20px_#06b6d4]" style={{ width: `${progress}%` }}></div>
          </div>

          <div className="flex justify-between items-end relative z-10">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">Daily Protocol</h1>
              <p className="text-slate-400 font-mono text-sm">{format(new Date(), 'EEEE, MMMM do')}</p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-black text-white tracking-tighter">
                {progress}<span className="text-cyan-500 text-3xl">%</span>
              </div>
              <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mt-1">Completion</div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-16 bg-white/5 rounded-xl"></div>
            <div className="h-16 bg-white/5 rounded-xl"></div>
            <div className="h-16 bg-white/5 rounded-xl"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">

            {/* Meals Column */}
            <section className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span className="text-2xl">🥗</span> Nutrition
                </h2>
                <span className="text-xs font-mono bg-white/5 px-2 py-1 rounded text-slate-400">
                  {meals.filter(m => m.completed).length}/{meals.length}
                </span>
              </div>

              {meals.length === 0 ? (
                <div className="p-6 border border-dashed border-white/10 rounded-2xl text-center text-slate-500 text-sm bg-white/[0.02]">
                  No meal plan generated. <Link href="/dashboard" className="text-cyan-400 underline">Generate now</Link>
                </div>
              ) : (
                meals.map(meal => (
                  <div
                    key={meal.id}
                    onClick={() => toggleMeal(meal.id, meal.completed)}
                    className={`group relative p-4 rounded-2xl border cursor-pointer transition-all duration-300 overflow-hidden ${meal.completed
                        ? 'bg-emerald-500/5 border-emerald-500/20 opacity-50'
                        : 'bg-slate-900/50 border-white/10 hover:border-emerald-500/40 hover:bg-slate-800'
                      }`}
                  >
                    <div className="flex items-start gap-4 relative z-10">
                      <div className={`mt-1 min-w-[20px] h-5 rounded border flex items-center justify-center transition-all ${meal.completed
                          ? 'bg-emerald-500 border-emerald-500 rotate-0'
                          : 'border-slate-600 group-hover:border-emerald-500 rotate-45 group-hover:rotate-0 rounded-md'
                        }`}>
                        {meal.completed && <svg className="w-3 h-3 text-black font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <div>
                        <h3 className={`font-semibold text-sm leading-snug transition-colors ${meal.completed ? 'text-emerald-400/80 line-through decoration-emerald-500/30' : 'text-slate-200 group-hover:text-emerald-300'}`}>
                          {meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1)}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{meal.food_name}</p>
                        <div className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded bg-white/5 text-[10px] font-mono text-slate-400 border border-white/5">
                          🔥 {meal.calories} kcal
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </section>

            {/* Workouts Column */}
            <section className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span className="text-2xl">⚡</span> Training
                </h2>
                <span className="text-xs font-mono bg-white/5 px-2 py-1 rounded text-slate-400">
                  {workouts.filter(w => w.completed).length}/{workouts.length}
                </span>
              </div>

              {workouts.length === 0 ? (
                <div className="p-6 border border-dashed border-white/10 rounded-2xl text-center text-slate-500 text-sm bg-white/[0.02]">
                  Rest Day / Active Recovery
                </div>
              ) : (
                workouts.map(workout => (
                  <div
                    key={workout.id}
                    onClick={() => toggleWorkout(workout.id, workout.completed)}
                    className={`group relative p-4 rounded-2xl border cursor-pointer transition-all duration-300 overflow-hidden ${workout.completed
                        ? 'bg-cyan-500/5 border-cyan-500/20 opacity-50'
                        : 'bg-slate-900/50 border-white/10 hover:border-cyan-500/40 hover:bg-slate-800'
                      }`}
                  >
                    <div className="flex items-start gap-4 relative z-10">
                      <div className={`mt-1 min-w-[20px] h-5 rounded border flex items-center justify-center transition-all ${workout.completed
                          ? 'bg-cyan-500 border-cyan-500 rotate-0'
                          : 'border-slate-600 group-hover:border-cyan-500 rotate-45 group-hover:rotate-0 rounded-md'
                        }`}>
                        {workout.completed && <svg className="w-3 h-3 text-black font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <div>
                        <h3 className={`font-semibold text-sm leading-snug transition-colors ${workout.completed ? 'text-cyan-400/80 line-through decoration-cyan-500/30' : 'text-slate-200 group-hover:text-cyan-300'}`}>
                          {workout.exercise_name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">Targeted Protocol</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  )
}