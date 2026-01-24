'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link' // Keep just in case, though Sidebar uses it
import { getUserSession } from '@/lib/auth'
import AICoach from '@/components/dashboard/AICoach'
import Sidebar from '@/components/dashboard/Sidebar'
import TopBar from '@/components/dashboard/TopBar'
import LiveSchedule from '@/components/dashboard/LiveSchedule'
import MealCard from '@/components/dashboard/MealCard'
import WorkoutCard from '@/components/dashboard/WorkoutCard'
import { generateDailySchedule, getFullDailyPlan, ScheduleItem } from '@/lib/schedule-engine'
import { getRecommendedWorkout } from '@/lib/exercise-db'

// --- TYPE DEFINITIONS ---
type UserProfile = {
  id: number
  name: string
  weight_kg: number
  height_cm: number
  age: number
  gender: string
  goal: string
  activity_level: string
  target_calories: number
}

type ApiResponse<T> = {
  success: boolean
  data: T
  error?: string
}

// --- HEALTH CALCULATION LOGIC ---
const calculateMacros = (calories: number, goal: string) => {
  let ratio = { p: 0.3, c: 0.4, f: 0.3 }
  if (goal === 'lose' || goal === 'lose_weight') ratio = { p: 0.4, c: 0.3, f: 0.3 }
  if (goal === 'gain' || goal === 'gain_muscle') ratio = { p: 0.3, c: 0.5, f: 0.2 }

  return {
    protein: Math.round((calories * ratio.p) / 4),
    carbs: Math.round((calories * ratio.c) / 4),
    fat: Math.round((calories * ratio.f) / 9)
  }
}

const calculateBMI = (weight: number, heightCm: number) => {
  if (!weight || !heightCm) return { value: 0, status: 'Unknown', color: 'text-zinc-500' }
  const heightM = heightCm / 100
  const bmi = parseFloat((weight / (heightM * heightM)).toFixed(1))
  let status = 'Optimal'
  let color = 'text-emerald-400'
  if (bmi < 18.5) { status = 'Underweight'; color = 'text-blue-400' }
  else if (bmi >= 25 && bmi < 29.9) { status = 'Overweight'; color = 'text-orange-400' }
  else if (bmi >= 30) { status = 'Obese'; color = 'text-red-400' }
  return { value: bmi, status, color }
}

// --- MAIN COMPONENT ---
export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [dailySchedule, setDailySchedule] = useState<ScheduleItem[]>([])
  const [detailedPlan, setDetailedPlan] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const session = getUserSession()
        if (!session) { router.push('/login'); return }
        const res = await fetch(`/api/users/${session.id}`)
        let userData = session

        if (res.ok) {
          const json = (await res.json()) as ApiResponse<UserProfile>
          if (json.success) userData = json.data
        }

        setUser(userData)
        setDailySchedule(generateDailySchedule(userData))

        // STATIC PLAN FOR MEALS
        const staticPlan = getFullDailyPlan(userData)

        // DYNAMIC WORKOUT OVERRIDE
        getRecommendedWorkout(userData.goal).then(dynamicWorkout => {
          if (dynamicWorkout) {
            setDetailedPlan({ ...staticPlan, workout: dynamicWorkout })
          } else {
            setDetailedPlan(staticPlan)
          }
        }).catch(err => {
          console.error("Failed to load dynamic workout", err)
          setDetailedPlan(staticPlan)
        })

      } catch (err) {
        console.error('Error:', err)
        const session = getUserSession()
        if (session) {
          setUser(session)
          setDailySchedule(generateDailySchedule(session))
          setDetailedPlan(getFullDailyPlan(session))
        }
      } finally {
        setLoading(false)
      }
    }
    fetchUserData()
  }, [router])

  if (loading) return <DashboardSkeleton />
  if (!user) return null

  const macros = calculateMacros(user.target_calories || 2000, user.goal)
  const bmiData = calculateBMI(user.weight_kg, user.height_cm)

  return (
    <div className="min-h-screen bg-black text-white flex font-inter overflow-hidden">

      <Sidebar />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-10 no-scrollbar relative">

        {/* Background Atmosphere */}
        <div className="glow-purple top-[-10%] right-[-10%] w-[50%] h-[50%] opacity-10" />

        <TopBar title="Dashboard" subtitle={`Member: ${user.name} // Status: Active`} />

        {/* BENTO GRID LAYOUT */}
        <div className="grid grid-cols-12 gap-8 auto-rows-max">

          {/* ROW 1: CALORIES + MEAL PLAN */}

          {/* Calorie Intelligence Card (8 cols) */}
          <div className="col-span-12 lg:col-span-8 stat-card flex flex-col md:flex-row items-center gap-12 overflow-hidden relative min-h-[350px]">
            <div className="absolute top-0 right-[-10%] opacity-[0.02] text-[200px] font-black italic select-none">KC</div>

            <div className="relative shrink-0">
              <div className="liquid-meta-blob flex items-center justify-center">
                <div className="text-center z-10">
                  <span className="text-5xl font-black font-outfit italic">{user.target_calories}</span>
                  <p className="text-[8px] font-black uppercase tracking-widest text-white/60">Daily Target</p>
                </div>
              </div>
            </div>

            <div className="flex-1 w-full">
              <div className="flex justify-between items-end mb-10">
                <div>
                  <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.5em] mb-4">Calorie Goal</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black italic font-outfit uppercase">Maintenance</span>
                    <span className="text-purple-500 font-black text-xs uppercase tracking-widest">{user.goal.replace('_', ' ')}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-zinc-500 font-black uppercase mb-1">BMI Index</div>
                  <div className={`text-2xl font-black italic font-outfit ${bmiData.color}`}>{bmiData.value}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <MacroStat label="Protein" value={macros.protein} color="bg-purple-600" />
                <MacroStat label="Carbs" value={macros.carbs} color="bg-indigo-600" />
                <MacroStat label="Fats" value={macros.fat} color="bg-zinc-800" />
              </div>
            </div>
          </div>

          {/* Meal Plan Card (4 cols) - Separated Section 1 */}
          <div className="col-span-12 lg:col-span-4 h-[350px]">
            {detailedPlan && <MealCard meals={detailedPlan.meals} />}
          </div>


          {/* ROW 2: LIVE SCHEDULE + WORKOUT PLAN */}

          {/* Live Schedule Timeline (8 cols) */}
          <div className="col-span-12 lg:col-span-8 h-[600px]">
            <LiveSchedule schedule={dailySchedule} />
          </div>

          {/* Workout Section (4 cols) - Separated Section 2 */}
          <div className="col-span-12 lg:col-span-4 h-[600px] flex flex-col gap-8">
            {/* Workout Card */}
            <div className="flex-1">
              {detailedPlan && <WorkoutCard workout={detailedPlan.workout} />}
            </div>

            {/* AI Monitor (Small) */}
            <div className="h-[200px] stat-card p-0 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 to-transparent pointer-events-none" />
              <div className="p-4 border-b border-white/5 flex justify-between items-center bg-zinc-900/50">
                <h2 className="text-[10px] font-black text-purple-500 uppercase tracking-[0.2em]">Coach Active</h2>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="p-4">
                <AICoach />
              </div>
            </div>
          </div>

        </div>

        {/* Footer info */}
        <div className="mt-20 pt-10 border-t border-white/5 flex justify-between items-center text-zinc-800 font-mono text-[9px] uppercase tracking-widest">
          <span>Lat: 23.8103° N // Lng: 90.4125° E</span>
          <span>SYSTEM ONLINE</span>
        </div>

      </main>
    </div>
  )
}

function MacroStat({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="bg-black/40 p-5 rounded-[1.5rem] border border-white/5">
      <div className={`w-1.5 h-1.5 rounded-full ${color} mb-3`} />
      <div className="text-2xl font-black italic font-outfit leading-none mb-1">{value}g</div>
      <div className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">{label}</div>
    </div>
  );
}

function DashboardSkeleton() {
  return <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="w-10 h-10 bg-purple-600/50 rounded-lg animate-pulse" />
  </div>
}
