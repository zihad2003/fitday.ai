'use client'

import { useState, useEffect } from 'react'
import { getUserSession } from '@/lib/auth'
import { useRouter } from 'next/navigation'

// TypeScript Interfaces to fix ".success" errors
interface ApiResponse {
  success: boolean
  data?: any[]
  plan?: any[]
  error?: string
}

interface Meal {
  id: number
  meal_type: string
  food: string
  calories: number
  completed: number | boolean
}

export default function Diet() {
  const router = useRouter()
  const [meals, setMeals] = useState<Meal[]>([])
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [confirmMeal, setConfirmMeal] = useState<Meal | null>(null)
  const [userId, setUserId] = useState<number | null>(null)
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    const user = getUserSession()
    if (!user) {
      router.push('/login')
    } else {
      setUserId(user.id)
      fetchMeals(user.id)
    }
  }, [])

  const isCompleted = (val: number | boolean) => val === 1 || val === true

  const fetchMeals = async (uid: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/meals?user_id=${uid}&date=${today}`)
      const json = (await res.json()) as ApiResponse // FIXED ERROR HERE
      
      if (json.success && json.data && json.data.length > 0) {
        setMeals(json.data)
        calculateProgress(json.data)
      } else {
        await generatePlan(uid)
      }
    } catch (error) {
      console.error("Fetch Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const generatePlan = async (uid: number) => {
    setLoading(true)
    try {
      const res = await fetch('/api/meals/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: uid, date: today })
      })
      const json = (await res.json()) as ApiResponse // FIXED ERROR HERE
      
      if (json.success) {
        const newMeals = json.plan || json.data || []
        setMeals(newMeals)
        calculateProgress(newMeals)
      }
    } catch (error) {
      console.error("Generation Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleMeal = async (id: number, currentStatus: number | boolean) => {
    const nextStatus = isCompleted(currentStatus) ? 0 : 1
    const updatedMeals = meals.map(m => m.id === id ? { ...m, completed: nextStatus } : m)
    setMeals(updatedMeals)
    calculateProgress(updatedMeals)

    try {
      const res = await fetch(`/api/meals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: nextStatus })
      })
      const data = (await res.json()) as ApiResponse // FIXED ERROR HERE
      if (!data.success) throw new Error("Update failed")
    } catch (error) {
      console.error("Sync Error:", error)
      if (userId) fetchMeals(userId)
    }
  }

  const calculateProgress = (items: Meal[]) => {
    if (items.length === 0) return setProgress(0)
    const completedCount = items.filter(m => isCompleted(m.completed)).length
    setProgress(Math.round((completedCount / items.length) * 100))
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 pb-24 font-sans">
      <div className="glass-panel p-6 rounded-3xl mb-8 border border-white/10 bg-white/5 backdrop-blur-md">
        <h1 className="text-2xl font-black italic uppercase tracking-tighter">Fuel <span className="text-cyan-400">Logs</span></h1>
        <div className="mt-6 h-2 bg-slate-900 rounded-full overflow-hidden">
          <div className="h-full bg-cyan-500 shadow-[0_0_15px_#06b6d4] transition-all duration-1000" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="text-right text-[10px] text-slate-500 mt-2 font-mono uppercase tracking-widest">Protocol Sync: {progress}%</p>
      </div>

      <div className="space-y-6">
        {['breakfast', 'lunch', 'snack', 'dinner'].map((type) => {
          const items = meals.filter(m => m.meal_type === type)
          return items.map((meal) => (
            <div key={meal.id} onClick={() => isCompleted(meal.completed) ? toggleMeal(meal.id, meal.completed) : setConfirmMeal(meal)}
              className={`p-5 rounded-2xl border transition-all flex items-center gap-4 ${isCompleted(meal.completed) ? 'bg-cyan-950/20 border-cyan-500/20 opacity-60' : 'bg-slate-900/40 border-white/5 hover:border-cyan-500/40'}`}>
              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${isCompleted(meal.completed) ? 'bg-cyan-500 border-cyan-500 text-black' : 'border-slate-700'}`}>
                {isCompleted(meal.completed) && '✓'}
              </div>
              <div className="flex-1">
                <p className={`font-bold text-sm ${isCompleted(meal.completed) ? 'text-slate-500 line-through' : 'text-slate-100'}`}>{meal.food}</p>
                <p className="text-[10px] font-mono text-cyan-500/70 mt-1">{meal.calories} KCAL</p>
              </div>
            </div>
          ))
        })}
      </div>

      {confirmMeal && (
        <div className="fixed inset-0 bg-slate-950/90 z-[100] flex items-center justify-center p-6 backdrop-blur-md">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 w-full max-w-sm text-center">
            <h3 className="text-xl font-bold text-white mb-2 italic">Confirm Log</h3>
            <p className="text-slate-400 text-sm mb-8">Mark <span className="text-cyan-400 font-bold">"{confirmMeal.food}"</span> as consumed?</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmMeal(null)} className="flex-1 py-4 bg-slate-800 rounded-xl font-bold text-slate-400">BACK</button>
              <button onClick={() => { toggleMeal(confirmMeal.id, confirmMeal.completed); setConfirmMeal(null); }} className="flex-1 py-4 bg-cyan-600 rounded-xl font-bold text-white shadow-[0_0_20px_#0891b2]">CONFIRM</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}