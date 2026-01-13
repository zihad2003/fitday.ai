'use client'

import { useEffect, useState } from 'react'
import { format, subDays, eachDayOfInterval } from 'date-fns'
import Link from 'next/link'

// --- 1. STRICT TYPE DEFINITIONS ---

// What the chart needs
type DailyStat = {
  date: string
  calories: number
  target: number
  workoutCompleted: boolean
}

// What the User API returns
type UserData = {
  target_calories: number
}

// What the Meals API returns
type MealItem = {
  calories: number
}

// What the Workouts API returns
type WorkoutItem = {
  completed: number // SQLite uses 0 (false) or 1 (true)
}

// Generic Wrapper for all API responses
type ApiResponse<T> = {
  success: boolean
  data: T
}

export default function ProgressPage() {
  const [stats, setStats] = useState<DailyStat[]>([])
  const [loading, setLoading] = useState(true)
  const [consistencyScore, setConsistencyScore] = useState(0)

  const USER_ID = 1 // Replace with real auth later

  // --- 2. DATA FETCHING ENGINE ---
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // Generate last 7 days array
        const today = new Date()
        const last7Days = eachDayOfInterval({
          start: subDays(today, 6),
          end: today
        })

        // A. Fetch User Target (Context)
        const userRes = await fetch(`/api/users/${USER_ID}`)
        // FIX: Cast response to typed interface
        const userData = (await userRes.json()) as ApiResponse<UserData>
        const targetCals = userData.success ? userData.data.target_calories : 2000

        // B. Fetch Daily Logs (Parallel)
        const promises = last7Days.map(async (date) => {
          const dateStr = format(date, 'yyyy-MM-dd')
          
          const [mealRes, workoutRes] = await Promise.all([
            fetch(`/api/meals?user_id=${USER_ID}&date=${dateStr}`),
            fetch(`/api/workouts?user_id=${USER_ID}&date=${dateStr}`)
          ])

          // FIX: Cast responses to typed interfaces
          const meals = (await mealRes.json()) as ApiResponse<MealItem[]>
          const workouts = (await workoutRes.json()) as ApiResponse<WorkoutItem[]>

          // Calculate Totals safely
          const dailyCals = meals.success 
            ? meals.data.reduce((acc, m) => acc + (m.calories || 0), 0) 
            : 0
            
          const workedOut = workouts.success 
            ? workouts.data.some((w) => w.completed === 1) 
            : false

          return {
            date: dateStr,
            calories: dailyCals,
            target: targetCals,
            workoutCompleted: workedOut
          }
        })

        const results = await Promise.all(promises)
        setStats(results)

        // C. Calculate Consistency Score
        const totalDays = results.length
        if (totalDays > 0) {
          const adherenceDays = results.filter(d => 
            d.workoutCompleted || (d.calories > d.target * 0.8 && d.calories < d.target * 1.2)
          ).length
          setConsistencyScore(Math.round((adherenceDays / totalDays) * 100))
        }

      } catch (err) {
        console.error('Analytics failed', err)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans pb-20 selection:bg-purple-500/30">
      
      {/* Navbar */}
      <div className="border-b border-white/5 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="text-sm font-mono text-slate-400 hover:text-white transition flex items-center gap-2">
            ← DASHBOARD
          </Link>
          <div className="font-mono text-xs text-purple-500 tracking-widest uppercase">
            System Analytics
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 pt-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          <div className="flex-1">
            <h1 className="text-3xl font-black text-white mb-2">Performance Trends</h1>
            <p className="text-slate-400 text-sm">Last 7 Days Activity Analysis</p>
          </div>
          
          {/* Consistency Score Card */}
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 flex items-center gap-6">
             <div className="relative w-16 h-16 flex items-center justify-center">
               {/* SVG Circular Progress */}
               <svg className="w-full h-full transform -rotate-90">
                 <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-800" />
                 <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" 
                   className={`${consistencyScore > 70 ? 'text-purple-500' : 'text-orange-500'} transition-all duration-1000 ease-out`}
                   strokeDasharray={175}
                   strokeDashoffset={175 - (175 * consistencyScore) / 100}
                 />
               </svg>
               <span className="absolute text-sm font-bold">{consistencyScore}%</span>
             </div>
             <div>
               <div className="text-lg font-bold text-white">Consistency Score</div>
               <div className="text-xs text-slate-500 font-mono">Based on adherence</div>
             </div>
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center text-slate-500 animate-pulse border border-dashed border-white/10 rounded-3xl">
            Analyzing Datasets...
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Chart 1: Calorie Adherence */}
            <section className="bg-slate-900/50 border border-white/10 rounded-3xl p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Caloric Intake vs Target
                </h3>
                <div className="flex gap-4 text-[10px] font-mono uppercase text-slate-500">
                  <div className="flex items-center gap-1"><span className="w-2 h-2 bg-slate-700 rounded-sm"></span> Intake</div>
                  <div className="flex items-center gap-1"><span className="w-2 h-1 border-t border-dashed border-slate-500"></span> Target</div>
                </div>
              </div>

              <div className="h-48 flex items-end justify-between gap-2">
                {stats.map((day, i) => {
                  // Prevent division by zero if target is 0
                  const target = day.target || 2000 
                  const percent = Math.min((day.calories / (target * 1.5)) * 100, 100) 
                  const isOver = day.calories > target
                  
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center group relative">
                      {/* Tooltip */}
                      <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-xs px-2 py-1 rounded border border-white/10 whitespace-nowrap z-10">
                        {day.calories} kcal
                      </div>
                      
                      {/* Target Line Marker (at 66% height represents 100% target if scale is 150%) */}
                      <div className="absolute w-full border-t border-dashed border-white/20 bottom-[66%]" title="Target"></div>

                      <div 
                        className={`w-full max-w-[40px] rounded-t-lg transition-all duration-500 hover:brightness-110 ${isOver ? 'bg-orange-500/80' : 'bg-emerald-500/80'}`}
                        style={{ height: `${percent}%` }}
                      ></div>
                      <div className="mt-2 text-[10px] font-mono text-slate-500">{format(new Date(day.date), 'EEE')}</div>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Chart 2: Workout Frequency */}
            <section className="bg-slate-900/50 border border-white/10 rounded-3xl p-8">
              <h3 className="font-bold flex items-center gap-2 mb-6">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                Training Frequency
              </h3>
              
              <div className="flex justify-between">
                {stats.map((day, i) => (
                  <div key={i} className="flex flex-col items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all ${
                      day.workoutCompleted 
                        ? 'bg-purple-500 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]' 
                        : 'bg-slate-800/50 border-white/5'
                    }`}>
                      {day.workoutCompleted ? (
                        <span className="text-xl">💪</span>
                      ) : (
                        <span className="text-xs text-slate-600">Rest</span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">{format(new Date(day.date), 'dd MMM')}</span>
                  </div>
                ))}
              </div>
            </section>

          </div>
        )}
      </main>
    </div>
  )
}