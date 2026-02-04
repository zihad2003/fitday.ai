'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getUserSession } from '@/lib/auth'
import AICoach from '@/components/dashboard/AICoach'
import Sidebar from '@/components/dashboard/Sidebar'
import TopBar from '@/components/dashboard/TopBar'
import LiveSchedule from '@/components/dashboard/LiveSchedule'
import MealCard from '@/components/dashboard/MealCard'
import WorkoutCard from '@/components/dashboard/WorkoutCard'
import MobileNav from '@/components/dashboard/MobileNav'
import { generateDailySchedule, getFullDailyPlan, ScheduleItem } from '@/lib/schedule-engine'
import { getRecommendedWorkout } from '@/lib/exercise-db'
import NutritionDashboard from '@/components/NutritionDashboard'
import Icons from '@/components/icons/Icons'
import {
  PageTransition,
  FadeIn,
  StaggerContainer,
  StaggerItem,
  SlideUp,
  HoverScale
} from '@/components/animations/Transitions'
import { DashboardSkeleton } from '@/components/animations/SkeletonLoaders'
import { motion } from 'framer-motion'

// --- TYPE DEFINITIONS ---
type UserProfile = {
  id: number
  name: string
  weight_kg: number
  height_cm: number
  age: number
  gender: string
  goal: 'lose_weight' | 'gain_muscle' | 'maintain' | string
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
  if (!weight || !heightCm) return { value: 0, status: 'Unknown', color: 'text-zinc-500', barColor: 'bg-zinc-800' }
  const heightM = heightCm / 100
  const bmi = parseFloat((weight / (heightM * heightM)).toFixed(1))
  let status = 'Optimal'
  let color = 'text-emerald-400'
  let barColor = 'bg-emerald-500'

  if (bmi < 18.5) { status = 'Underweight'; color = 'text-blue-400'; barColor = 'bg-blue-500' }
  else if (bmi >= 25 && bmi < 29.9) { status = 'Overweight'; color = 'text-orange-400'; barColor = 'bg-orange-500' }
  else if (bmi >= 30) { status = 'Obese'; color = 'text-red-400'; barColor = 'bg-red-500' }

  return { value: bmi, status, color, barColor }
}

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [dailySchedule, setDailySchedule] = useState<ScheduleItem[]>([])
  const [detailedPlan, setDetailedPlan] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const meRes = await fetch('/api/auth/me')
        if (!meRes.ok) {
          router.push('/login')
          return
        }
        const sessionJson: any = await meRes.json()
        if (!sessionJson.success) {
          router.push('/login')
          return
        }

        let userData = sessionJson.data

        const res = await fetch(`/api/users/${userData.id}`)
        if (res.ok) {
          const json: any = await res.json()
          if (json.success) userData = json.data
        }

        setUser(userData)
        setDailySchedule(generateDailySchedule(userData as any))

        const staticPlan = getFullDailyPlan(userData as any)

        getRecommendedWorkout((userData as any).goal).then(dynamicWorkout => {
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
        router.push('/login')
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
    <PageTransition>
      <div className="min-h-screen bg-black text-white flex font-inter overflow-hidden">
        <Sidebar />
        <MobileNav />

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 no-scrollbar relative">
          {/* Background Atmosphere */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px]" />
          </div>

          <TopBar title="Dashboard" subtitle={`Member: ${user.name} // Status: Active`} />

          <StaggerContainer>
            <div className="grid grid-cols-12 gap-6 md:gap-8 auto-rows-max relative z-10">

              {/* ROW 1: CALORIES + MEAL PLAN */}
              <StaggerItem className="col-span-12 lg:col-span-8">
                <HoverScale scale={1.005} className="h-full">
                  <NutritionDashboard userId={user.id} />
                </HoverScale>
              </StaggerItem>

              {/* QUICK ACTIONS ROW */}
              <StaggerItem className="col-span-12 flex gap-4 overflow-x-auto no-scrollbar pb-2">
                <Link href="/dashboard/shopping-list" className="flex-1 min-w-[200px]">
                  <div className="glass-card p-4 flex items-center gap-4 hover:bg-white/5 transition-colors cursor-pointer group">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                      <Icons.ShoppingCart size={20} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Groceries</div>
                      <div className="font-black font-outfit text-white">Shopping List</div>
                    </div>
                  </div>
                </Link>
                <Link href="/dashboard/tracking/water" className="flex-1 min-w-[200px]">
                  <div className="glass-card p-4 flex items-center gap-4 hover:bg-white/5 transition-colors cursor-pointer group">
                    <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                      <Icons.Water size={20} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Hydration</div>
                      <div className="font-black font-outfit text-white">Log Water</div>
                    </div>
                  </div>
                </Link>
              </StaggerItem>

              <StaggerItem className="col-span-12 lg:col-span-4 translate-y-0 lg:h-[380px]">
                {detailedPlan && <MealCard meals={detailedPlan.meals} />}
              </StaggerItem>

              {/* ROW 2: LIVE SCHEDULE + WORKOUT PLAN */}
              <StaggerItem className="col-span-12 lg:col-span-8 min-h-[500px]">
                <LiveSchedule schedule={dailySchedule} />
              </StaggerItem>

              <StaggerItem className="col-span-12 lg:col-span-4 min-h-[500px] flex flex-col gap-8">
                <div className="flex-1">
                  {detailedPlan && <WorkoutCard workout={detailedPlan.workout} />}
                </div>

                {/* AI Predictive Insight (New Element) */}
                <HoverScale scale={1.02} className="h-[240px]">
                  <div className="stat-card p-0 overflow-hidden relative flex flex-col border border-purple-500/10 group h-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-transparent pointer-events-none" />
                    <div className="p-5 border-b border-white/5 flex justify-between items-center bg-zinc-900/40">
                      <h2 className="text-[10px] font-black text-purple-400 uppercase tracking-[0.3em]">AI Intelligence</h2>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-zinc-600 uppercase">Live Pulse</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-center">
                      <AICoach />
                    </div>
                  </div>
                </HoverScale>
              </StaggerItem>

            </div>
          </StaggerContainer>

          {/* SYSTEM FOOTER */}
          <FadeIn delay={1}>
            <div className="mt-24 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-zinc-800 font-mono text-[9px] uppercase tracking-[0.5em]">
              <div className="flex items-center gap-4">
                <span>COORD: 23.81° N / 90.41° E</span>
                <span className="w-1 h-1 bg-zinc-900 rounded-full" />
                <span>CORE_VER: 2.1.0</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-purple-900 animate-pulse">●</span>
                <span>FitDay Neural Engine Online</span>
              </div>
            </div>
          </FadeIn>
        </main>
      </div>
    </PageTransition>
  )
}

function MacroStat({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="bg-white/5 p-5 rounded-[2rem] border border-white/5 hover:border-white/10 transition-colors group relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-1 h-full ${color} opacity-20 group-hover:opacity-100 transition-opacity`} />
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-1.5 h-1.5 rounded-full ${color}`} />
        <div className="text-[9px] font-black text-white/40 uppercase tracking-widest">{label}</div>
      </div>
      <div className="text-2xl font-black italic font-outfit leading-none tabular-nums">{value}<span className="text-xs ml-0.5 text-zinc-600">g</span></div>
    </div>
  );
}

