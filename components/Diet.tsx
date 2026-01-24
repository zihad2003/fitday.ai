'use client'

import { useState, useEffect } from 'react'
import { getUserSession } from '@/lib/auth'
import { useRouter } from 'next/navigation'

interface Meal {
  id: number
  meal_type: string
  food: string
  calories: number
  completed: number | boolean // D1 returns 0 or 1, UI uses boolean
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

  // হেল্পার ফাংশন: SQLite এর 0/1 কে boolean এ রূপান্তর করার জন্য
  const isCompleted = (val: number | boolean) => val === 1 || val === true

  const fetchMeals = async (uid: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/meals?user_id=${uid}&date=${today}`);
      const json = (await res.json()) as any;

      if (json && json.success && Array.isArray(json.data) && json.data.length > 0) {
        // Transform meal data to UI format
        const transformedMeals = json.data.map((item: any) => ({
          id: item.id,
          meal_type: item.meal_type,
          food: item.food_name,
          calories: Math.round(item.calories),
          completed: item.completed
        }));

        setMeals(transformedMeals);
        calculateProgress(transformedMeals);
      } else {
        await generatePlan(uid);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  }
  const generatePlan = async (uid: number) => {
    setLoading(true);
    try {
      const res = await fetch('/api/meals/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: uid, date: today })
      });

      const json = (await res.json()) as any;

      if (json && json.success) {
        // Handle both data and plan response formats
        const mealsData = json.data || json.plan || [];

        if (Array.isArray(mealsData)) {
          // Transform meal plan data to meal format
          const newMeals = mealsData.map((item: any, index: number) => ({
            id: item.id || (index + 1), // Use real ID if available
            meal_type: item.meal_type || 'breakfast',
            food: item.food_name || item.food,
            calories: item.calories || 0,
            completed: item.completed || false
          }));

          setMeals(newMeals);
          calculateProgress(newMeals);
        }
      }
    } catch (error) {
      console.error("Generation Error:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleCheckClick = (meal: Meal) => {
    if (isCompleted(meal.completed)) {
      toggleMeal(meal.id, meal.completed)
    } else {
      setConfirmMeal(meal)
    }
  }

  const confirmToggle = async () => {
    if (confirmMeal) {
      await toggleMeal(confirmMeal.id, confirmMeal.completed)
      setConfirmMeal(null)
    }
  }

  const toggleMeal = async (id: number, currentStatus: number | boolean) => {
    const nextStatus = isCompleted(currentStatus) ? 0 : 1;
    const updatedMeals = meals.map(m => m.id === id ? { ...m, completed: nextStatus } : m);

    setMeals(updatedMeals);
    calculateProgress(updatedMeals);

    // Update meal status via API
    try {
      const res = await fetch(`/api/meals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: nextStatus === 1 })
      })
      const data = (await res.json()) as { success: boolean };
      if (!data.success) {
        throw new Error("Update failed")
      }
    } catch (error) {
      console.error("Sync Error:", error);
      // Revert on failure
      setMeals(meals.map(m => m.id === id ? { ...m, completed: currentStatus } : m));
      calculateProgress(meals);
      if (userId) fetchMeals(userId);
    }
  }

  const calculateProgress = (items: Meal[]) => {
    if (items.length === 0) return setProgress(0)
    const completedCount = items.filter(m => isCompleted(m.completed)).length
    setProgress(Math.round((completedCount / items.length) * 100))
  }

  const mealTypes = ['breakfast', 'lunch', 'snack', 'dinner']

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 pb-24 font-sans">
      {/* Futuristic Header */}
      <div className="glass-panel p-6 rounded-3xl mb-8 relative overflow-hidden border border-white/10 bg-white/5 backdrop-blur-md">
        <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-600/10 to-transparent w-full"></div>
        <div className="flex justify-between items-center relative z-10">
          <h1 className="text-2xl font-black tracking-tighter italic uppercase">
            Fuel <span className="text-cyan-400">Logs</span>
          </h1>
          <div className="text-[10px] font-mono bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded">
            SYNC_DATE: {today}
          </div>
        </div>

        <div className="mt-6 h-2 bg-slate-900 rounded-full overflow-hidden relative z-10 border border-white/5">
          <div
            className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 shadow-[0_0_15px_#06b6d4] transition-all duration-1000"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-right text-[10px] text-slate-500 mt-2 font-mono uppercase tracking-widest">
          METABOLIC SYNC: <span className="text-cyan-400">{progress}%</span>
        </p>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-10 gap-3">
          <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-cyan-500 animate-pulse font-mono uppercase tracking-widest">Decoding Bio-Signals...</p>
        </div>
      )}

      {/* Meals List */}
      <div className="space-y-8">
        {mealTypes.map((type) => {
          const items = meals.filter(m => m.meal_type === type)
          if (items.length === 0 && !loading) return null

          return (
            <div key={type} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
                <span className="w-8 h-[1px] bg-slate-800"></span>
                {type}
              </h3>
              <div className="grid gap-3">
                {items.map((meal) => {
                  const completed = isCompleted(meal.completed)
                  return (
                    <div
                      key={meal.id}
                      onClick={() => handleCheckClick(meal)}
                      className={`p-5 rounded-2xl border transition-all duration-300 flex items-center gap-4 group ${completed
                        ? 'bg-cyan-950/20 border-cyan-500/20 opacity-60'
                        : 'bg-slate-900/40 border-white/5 hover:border-cyan-500/40 hover:bg-slate-900/80'
                        }`}
                    >
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${completed
                        ? 'bg-cyan-500 border-cyan-500 shadow-[0_0_10px_#06b6d4]'
                        : 'border-slate-700 group-hover:border-cyan-500/50'
                        }`}>
                        {completed && <span className="text-black font-bold text-xs">✓</span>}
                      </div>
                      <div className="flex-1">
                        <p className={`font-bold text-sm transition-all ${completed ? 'text-slate-500 line-through' : 'text-slate-100'}`}>
                          {meal.food}
                        </p>
                        <p className="text-[10px] font-mono text-cyan-500/70 mt-1">{meal.calories} KCAL</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Confirmation Modal */}
      {confirmMeal && (
        <div className="fixed inset-0 bg-slate-950/90 z-[100] flex items-center justify-center p-6 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-bold text-white text-center mb-2">Confirm Log</h3>
            <p className="text-slate-400 text-sm text-center mb-8">
              Mark <span className="text-cyan-400 font-bold">"{confirmMeal.food}"</span> as consumed?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmMeal(null)}
                className="flex-1 py-4 bg-slate-800 rounded-xl font-bold text-slate-400 hover:bg-slate-700 transition-colors"
              >
                BACK
              </button>
              <button
                onClick={confirmToggle}
                className="flex-1 py-4 bg-cyan-600 rounded-xl font-bold text-white hover:bg-cyan-500 shadow-[0_0_20px_rgba(8,145,178,0.4)] transition-all"
              >
                CONFIRM
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}