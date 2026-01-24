'use client'

import { useState, useEffect } from 'react'
import { getUserSession } from '@/lib/auth'
import { useRouter } from 'next/navigation'

interface Workout {
  id: number
  exercise_name: string
  completed: number | boolean
  gif_url?: string
  difficulty?: string
  muscle_group?: string
}

interface ApiResponse {
  success: boolean
  data?: any[]
  message?: string
}

export default function Workout() {
  const router = useRouter()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [userId, setUserId] = useState<number | null>(null)
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    const user = getUserSession()
    if (!user) {
      router.push('/login')
    } else {
      setUserId(user.id)
      fetchWorkouts(user.id)
    }
  }, [])

  const isCompleted = (val: number | boolean) => val === 1 || val === true

  const fetchWorkouts = async (uid: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/workouts?user_id=${uid}&date=${today}`)
      const json = (await res.json()) as ApiResponse

      if (json.success && json.data && json.data.length > 0) {
        setWorkouts(json.data)
        calculateProgress(json.data)
      } else {
        // Option to generate if none found
        console.log("No workouts found for today")
      }
    } catch (error) {
      console.error("Fetch Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleWorkout = async (workout: Workout) => {
    const nextStatus = isCompleted(workout.completed) ? 0 : 1
    const updatedWorkouts = workouts.map(w => w.id === workout.id ? { ...w, completed: nextStatus } : w)
    setWorkouts(updatedWorkouts)
    calculateProgress(updatedWorkouts)

    try {
      const res = await fetch(`/api/workouts/${workout.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: nextStatus === 1 })
      })
      const data = (await res.json()) as ApiResponse
      if (!data.success) throw new Error("Update failed")
    } catch (error) {
      console.error("Sync Error:", error)
      if (userId) fetchWorkouts(userId)
    }
  }

  const calculateProgress = (items: Workout[]) => {
    if (items.length === 0) return setProgress(0)
    const completedCount = items.filter(w => isCompleted(w.completed)).length
    setProgress(Math.round((completedCount / items.length) * 100))
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 pb-24 font-sans">
      <div className="glass-panel p-6 rounded-3xl mb-8 border border-white/10 bg-white/5 backdrop-blur-md">
        <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white">
          Training <span className="text-orange-500">Protocol</span>
        </h1>
        <div className="mt-6 h-2 bg-slate-900 rounded-full overflow-hidden">
          <div className="h-full bg-orange-500 shadow-[0_0_15px_#f97316] transition-all duration-1000" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="text-right text-[10px] text-slate-500 mt-2 font-mono uppercase tracking-widest">Efficiency: {progress}%</p>
      </div>

      {loading && (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <div className="grid gap-4">
        {workouts.map((workout) => (
          <div
            key={workout.id}
            className={`p-4 rounded-3xl border transition-all flex flex-col gap-4 ${isCompleted(workout.completed) ? 'bg-orange-950/10 border-orange-500/20 opacity-60' : 'bg-slate-900 border-white/5'}`}
          >
            <div className="flex items-center gap-4">
              <div
                onClick={() => toggleWorkout(workout)}
                className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center cursor-pointer transition-all ${isCompleted(workout.completed) ? 'bg-orange-500 border-orange-500 text-black' : 'border-slate-700 hover:border-orange-500'}`}
              >
                {isCompleted(workout.completed) && <span className="font-bold">✓</span>}
              </div>
              <div className="flex-1">
                <h3 className={`font-bold text-lg ${isCompleted(workout.completed) ? 'text-slate-500 line-through' : 'text-slate-100'}`}>
                  {workout.exercise_name}
                </h3>
                <div className="flex gap-2 mt-1">
                  <span className="text-[10px] font-mono bg-white/5 px-2 py-0.5 rounded text-slate-400 uppercase tracking-widest">
                    {workout.muscle_group || 'Resistance'}
                  </span>
                  <span className="text-[10px] font-mono bg-white/5 px-2 py-0.5 rounded text-slate-400 uppercase tracking-widest">
                    {workout.difficulty || 'Standard'}
                  </span>
                </div>
              </div>
            </div>

            {workout.gif_url && !isCompleted(workout.completed) && (
              <div className="rounded-2xl overflow-hidden border border-white/5 aspect-video bg-black/40">
                <img
                  src={workout.gif_url}
                  alt={workout.exercise_name}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                />
              </div>
            )}
          </div>
        ))}

        {workouts.length === 0 && !loading && (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl">
            <p className="text-slate-500 font-mono text-sm uppercase tracking-widest">No active protocol for today</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-4 px-6 py-2 bg-orange-600/20 text-orange-400 border border-orange-500/30 rounded-full text-xs font-bold hover:bg-orange-600 hover:text-white transition-all"
            >
              Initialize Generator
            </button>
          </div>
        )}
      </div>
    </div>
  )
}