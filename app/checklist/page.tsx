'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { getUserSession } from '@/lib/auth'
import { LayoutDashboard, Calendar, Activity, Map, Bot, Play, LogOut, ChevronLeft, Search, Bell, User } from 'lucide-react'

// --- Types ---
type Meal = {
  id: number
  meal_type: string
  food: string
  completed: number
  calories: number
}

type Workout = {
  id: number
  type: string
  completed: number
  gif_url?: string
  difficulty?: string
}

type ApiResponse<T> = {
  success: boolean
  data: T
  count?: number
  error?: string
}

const NavIcon = ({ icon: Icon, active = false }: { icon: any, active?: boolean }) => (
  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 cursor-pointer ${active ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)]' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>
    <Icon size={20} />
  </div>
);

export default function ChecklistPage() {
  const router = useRouter()
  const [meals, setMeals] = useState<Meal[]>([])
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const today = format(new Date(), 'yyyy-MM-dd')

  useEffect(() => {
    const session = getUserSession()
    if (!session) { router.push('/login'); return }

    async function fetchData() {
      try {
        const [mealsRes, workoutsRes] = await Promise.all([
          fetch(`/api/meals?user_id=${session.id}&date=${today}`),
          fetch(`/api/workouts?user_id=${session.id}&date=${today}`)
        ])
        const mealsJson = (await mealsRes.json()) as ApiResponse<Meal[]>
        const workoutsJson = (await workoutsRes.json()) as ApiResponse<Workout[]>
        if (mealsJson.success && Array.isArray(mealsJson.data)) setMeals(mealsJson.data)
        if (workoutsJson.success && Array.isArray(workoutsJson.data)) setWorkouts(workoutsJson.data)
      } catch (error) {
        console.error('Failed to sync protocol:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [today, router])

  const toggleMeal = async (id: number, currentStatus: number) => {
    const newStatus = currentStatus === 1 ? 0 : 1
    setMeals(prev => prev.map(m => m.id === id ? { ...m, completed: newStatus } : m))
    try {
      await fetch(`/api/meals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: newStatus === 1 })
      })
    } catch {
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

  const totalItems = meals.length + workouts.length
  const completedItems = meals.filter(m => m.completed).length + workouts.filter(w => w.completed).length
  const progress = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100)

  return (
    <div className="min-h-screen bg-black text-white flex font-inter overflow-hidden">

      {/* SIDEBAR */}
      <aside className="wavy-sidebar shrink-0 hidden md:flex">
        <div className="mb-20">
          <Link href="/">
            <div className="w-10 h-10 bg-purple-600 rounded-lg" />
          </Link>
        </div>
        <div className="flex-1 flex flex-col gap-8">
          <Link href="/dashboard"><NavIcon icon={LayoutDashboard} /></Link>
          <NavIcon icon={Calendar} active />
          <NavIcon icon={Activity} />
          <NavIcon icon={Map} />
          <NavIcon icon={Bot} />
          <NavIcon icon={Play} />
        </div>
        <div className="mt-auto">
          <NavIcon icon={LogOut} />
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto p-10 no-scrollbar relative">
        <div className="glow-purple top-[-10%] right-[-10%] w-[50%] h-[50%] opacity-10" />

        <nav className="flex justify-between items-center mb-12">
          <Link href="/dashboard" className="flex items-center gap-3 group text-zinc-500 hover:text-white transition-colors">
            <div className="w-10 h-10 bg-zinc-950 border border-white/5 rounded-xl flex items-center justify-center group-hover:border-purple-500/30 transition-all">
              <ChevronLeft size={18} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">Back to Hub</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
            <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Protocol Sync: Active</span>
          </div>
        </nav>

        <section className="max-w-4xl mx-auto">

          {/* Progress Header */}
          <div className="bg-zinc-950 border border-white/5 p-12 rounded-[2.5rem] mb-12 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-white/5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-purple-600 shadow-[0_0_20px_#9333ea]"
              />
            </div>
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-5xl font-black font-outfit italic uppercase mb-2 leading-none">Protocol <span className="text-purple-500">Day 01</span></h1>
                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.4em]">{format(new Date(), 'EEEE // dd.MM.yyyy')}</p>
              </div>
              <div className="text-right">
                <div className="text-7xl font-black font-outfit italic leading-none">{progress}<span className="text-2xl text-purple-500 not-italic ml-1">%</span></div>
                <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mt-2">Sync Progression</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 gap-8 opacity-20">
              <div className="h-96 bg-zinc-950 rounded-[2.5rem] animate-pulse" />
              <div className="h-96 bg-zinc-950 rounded-[2.5rem] animate-pulse" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">

              {/* NUTRITION Column */}
              <div className="space-y-6">
                <h2 className="text-xs font-black text-purple-500 uppercase tracking-[0.6em] mb-4">Nutrient Synthesis</h2>
                {meals.length === 0 ? (
                  <div className="p-10 border border-dashed border-white/5 rounded-[2.5rem] text-center text-zinc-700 text-[10px] font-black uppercase tracking-widest">No synthesis data</div>
                ) : (
                  meals.map(meal => (
                    <div
                      key={meal.id}
                      onClick={() => toggleMeal(meal.id, meal.completed)}
                      className={`p-8 bg-zinc-950 border rounded-[2.5rem] cursor-pointer transition-all duration-500 ${meal.completed ? 'border-purple-600/20 bg-purple-600/5 opacity-40' : 'border-white/5 hover:border-purple-500/30'}`}
                    >
                      <div className="flex items-start gap-6">
                        <div className={`mt-1 min-w-[24px] h-6 rounded-lg border flex items-center justify-center transition-all ${meal.completed ? 'bg-purple-600 border-purple-600' : 'border-zinc-700'}`}>
                          {meal.completed && <span className="text-black font-black text-[10px]">✓</span>}
                        </div>
                        <div>
                          <h3 className={`text-lg font-black font-outfit uppercase italic leading-none mb-2 ${meal.completed ? 'text-purple-500 line-through' : 'text-white'}`}>
                            {meal.meal_type}
                          </h3>
                          <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest leading-loose">{meal.food}</p>
                          <div className="mt-4 inline-block px-3 py-1 bg-white/5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border border-white/5">
                            {meal.calories} KCAL
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* TRAINING Column */}
              <div className="space-y-6">
                <h2 className="text-xs font-black text-purple-500 uppercase tracking-[0.6em] mb-4">Tactical Training</h2>
                {workouts.length === 0 ? (
                  <div className="p-10 border border-dashed border-white/5 rounded-[2.5rem] text-center text-zinc-700 text-[10px] font-black uppercase tracking-widest">Active Recovery State</div>
                ) : (
                  workouts.map(workout => (
                    <div
                      key={workout.id}
                      onClick={() => toggleWorkout(workout.id, workout.completed)}
                      className={`p-8 bg-zinc-950 border rounded-[2.5rem] cursor-pointer transition-all duration-500 ${workout.completed ? 'border-purple-600/20 bg-purple-600/5 opacity-40' : 'border-white/5 hover:border-purple-500/30'}`}
                    >
                      <div className="flex items-start gap-6">
                        <div className={`mt-1 min-w-[24px] h-6 rounded-lg border flex items-center justify-center transition-all ${workout.completed ? 'bg-purple-600 border-purple-600' : 'border-zinc-700'}`}>
                          {workout.completed && <span className="text-black font-black text-[10px]">✓</span>}
                        </div>
                        <div className="flex-1">
                          <h3 className={`text-lg font-black font-outfit uppercase italic leading-none mb-2 ${workout.completed ? 'text-purple-500 line-through' : 'text-white'}`}>
                            {workout.type}
                          </h3>
                          <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest leading-loose">Execution Tier: {workout.difficulty || 'Standard'}</p>

                          {workout.gif_url && (
                            <div className="mt-6 rounded-2xl overflow-hidden border border-white/5 opacity-60 group-hover:opacity-100 transition-opacity">
                              <img src={workout.gif_url} className="w-full h-32 object-cover grayscale" alt="Demo" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}
        </section>

        <div className="mt-20 pt-10 border-t border-white/5 flex justify-between items-center text-zinc-800 font-mono text-[9px] uppercase tracking-widest">
          <span>Protocol: V2.04 // Dhaka_Core</span>
          <span>ESTABLISH_LOG_COMPLETE</span>
        </div>
      </main>

    </div>
  )
}
