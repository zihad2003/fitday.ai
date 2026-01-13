'use client'

import { useEffect, useState } from 'react'
import { format, addDays, subDays } from 'date-fns' // npm install date-fns
import Link from 'next/link'

// --- Types ---
type Meal = {
  id: number
  meal_type: string
  food: string
  calories: number
  protein: number
  carbs: number
  fat: number
  completed: number
}

type ApiResponse<T> = {
  success: boolean
  data: T
  error?: string
}

// --- Helper: Macro Calculator ---
const calculateTotalMacros = (meals: Meal[]) => {
  return meals.reduce((acc, meal) => ({
    calories: acc.calories + (meal.calories || 0),
    protein: acc.protein + (meal.protein || 0),
    carbs: acc.carbs + (meal.carbs || 0),
    fat: acc.fat + (meal.fat || 0)
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 })
}

export default function DietPage() {
  const [date, setDate] = useState(new Date())
  const [meals, setMeals] = useState<Meal[]>([])
  const [loading, setLoading] = useState(true)

  const USER_ID = 1 // Replace with auth context later
  const formattedDate = format(date, 'yyyy-MM-dd')

  // --- Fetch Data ---
  useEffect(() => {
    const fetchDiet = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/meals?user_id=${USER_ID}&date=${formattedDate}`)
        const json = (await res.json()) as ApiResponse<Meal[]>
        
        if (json.success && Array.isArray(json.data)) {
          setMeals(json.data)
        } else {
          setMeals([])
        }
      } catch (err) {
        console.error('Failed to load diet data', err)
      } finally {
        setLoading(false)
      }
    }
    fetchDiet()
  }, [formattedDate])

  const totals = calculateTotalMacros(meals)
  const TARGET_CALORIES = 2200 // Ideally fetched from User Profile

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans pb-20 relative selection:bg-emerald-500/30">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-950 to-slate-950 pointer-events-none"></div>

      {/* Navbar */}
      <div className="border-b border-white/5 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="text-sm font-mono text-slate-400 hover:text-white transition flex items-center gap-2">
            ← DASHBOARD
          </Link>
          <div className="font-mono text-xs text-emerald-500 tracking-widest uppercase">
            Nutrition Intelligence
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 pt-10 relative z-10">

        {/* Date Navigator */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => setDate(subDays(date, 1))} className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition">
            ← Prev
          </button>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">{format(date, 'EEEE')}</h1>
            <p className="text-sm text-slate-500 font-mono">{format(date, 'MMMM do, yyyy')}</p>
          </div>
          <button onClick={() => setDate(addDays(date, 1))} className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition">
            Next →
          </button>
        </div>

        {/* Macro Summary Card */}
        <div className="grid md:grid-cols-4 gap-4 mb-10">
          {/* Main Calorie Gauge */}
          <div className="md:col-span-1 bg-slate-900 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
            <div className="relative z-10">
              <div className="text-xs text-slate-500 uppercase font-mono mb-1">Total Intake</div>
              <div className="text-4xl font-black text-white tracking-tight">{totals.calories}</div>
              <div className="text-xs text-slate-400 mt-1">/ {TARGET_CALORIES} kcal</div>
            </div>
            {/* Simple progress bar background */}
            <div className="absolute bottom-0 left-0 h-1 bg-emerald-500" style={{ width: `${Math.min((totals.calories / TARGET_CALORIES) * 100, 100)}%` }}></div>
          </div>

          {/* Macro Breakdown */}
          <MacroCard label="Protein" value={totals.protein} target={150} color="bg-emerald-500" />
          <MacroCard label="Carbs" value={totals.carbs} target={200} color="bg-blue-500" />
          <MacroCard label="Fats" value={totals.fat} target={70} color="bg-orange-500" />
        </div>

        {/* Meal List */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
            <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
            Daily Log
          </h2>

          {loading ? (
             <div className="text-center py-20 text-slate-500 animate-pulse">Syncing nutrition data...</div>
          ) : meals.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
              <p className="text-slate-400 mb-4">No meals logged for this date.</p>
              <Link href="/dashboard" className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition">
                Generate Plan
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {['breakfast', 'lunch', 'snack', 'dinner'].map((type) => {
                const mealForType = meals.filter(m => m.meal_type === type)
                if (mealForType.length === 0) return null

                return (
                  <div key={type} className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition group">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="capitalize text-lg font-bold text-emerald-100">{type}</h3>
                      <div className="text-xs font-mono text-slate-500 bg-black/20 px-2 py-1 rounded">
                        {mealForType.reduce((s, m) => s + m.calories, 0)} kcal
                      </div>
                    </div>

                    <div className="space-y-3">
                      {mealForType.map(meal => (
                        <div key={meal.id} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                          <div>
                            <div className="text-slate-300 font-medium">{meal.food}</div>
                            {/* Tiny Macro Pills */}
                            <div className="flex gap-2 mt-1">
                              <span className="text-[10px] text-emerald-400 bg-emerald-400/10 px-1.5 rounded">P: {meal.protein}g</span>
                              <span className="text-[10px] text-blue-400 bg-blue-400/10 px-1.5 rounded">C: {meal.carbs}g</span>
                              <span className="text-[10px] text-orange-400 bg-orange-400/10 px-1.5 rounded">F: {meal.fat}g</span>
                            </div>
                          </div>
                          <div className={`w-3 h-3 rounded-full ${meal.completed ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-slate-700'}`}></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

// --- Sub Component ---
function MacroCard({ label, value, target, color }: { label: string, value: number, target: number, color: string }) {
  const percent = Math.min((value / target) * 100, 100)
  
  return (
    <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <span className="text-xs text-slate-500 uppercase font-mono">{label}</span>
        <span className="text-xs font-bold text-white">{value}g</span>
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between text-[10px] text-slate-600 mb-1">
          <span>0g</span>
          <span>{target}g</span>
        </div>
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
          <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${percent}%` }}></div>
        </div>
      </div>
    </div>
  )
}