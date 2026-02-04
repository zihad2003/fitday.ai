'use client'

import { useEffect, useState, useCallback } from 'react'
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
import ScheduleSettingsModal from '@/components/dashboard/ScheduleSettingsModal'
import DailyCheckinModal from '@/components/dashboard/DailyCheckinModal'
import RecommendationCard from '@/components/dashboard/RecommendationCard'
import { generateDailySchedule, getFullDailyPlan, ScheduleItem } from '@/lib/schedule-engine'
import { getRecommendedWorkout } from '@/lib/exercise-db'
import { useNotificationSystem } from '@/hooks/useNotificationSystem'
import NutritionDashboard from '@/components/NutritionDashboard'
import Icons from '@/components/icons/Icons'
import WorkoutTimeline from '@/components/dashboard/WorkoutTimeline'
import WaterTracker from '@/components/dashboard/WaterTracker'
import QuickActions from '@/components/dashboard/QuickActions'
import ToastContainer from '@/components/animations/Toast'
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
  daily_water_goal_ml?: number
}

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [dailySchedule, setDailySchedule] = useState<ScheduleItem[]>([])
  const [detailedPlan, setDetailedPlan] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [schedulePrefs, setSchedulePrefs] = useState<any>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isCheckinOpen, setIsCheckinOpen] = useState(false)
  const [hasCheckedIn, setHasCheckedIn] = useState(false)
  const [adaptations, setAdaptations] = useState<any[]>([])

  const { requestPermission } = useNotificationSystem(dailySchedule)

  const fetchUserData = useCallback(async () => {
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
  }, [router])

  const fetchAdaptations = useCallback(async () => {
    try {
      const res = await fetch('/api/analysis/progress')
      if (res.ok) {
        const json = await res.json() as any
        if (json.success && json.data.adapted_plan) {
          setAdaptations(json.data.adapted_plan.adjustments || [])
        }
      }
    } catch (err) {
      console.error("Failed to fetch adaptations", err)
    }
  }, [])

  // Load initial data
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('schedulePrefs')
      if (stored) setSchedulePrefs(JSON.parse(stored))

      // Check if checked in today
      const checkinStatus = localStorage.getItem(`daily_checkin_${new Date().toDateString()}`)
      if (checkinStatus) setHasCheckedIn(true)
    }
    fetchUserData()
    fetchAdaptations()
  }, [fetchUserData, fetchAdaptations])

  const handleSaveCheckin = async (data: any) => {
    try {
      const res = await fetch('/api/tracking/daily-checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (res.ok) {
        setHasCheckedIn(true)
        localStorage.setItem(`daily_checkin_${new Date().toDateString()}`, 'true')
        if (user) {
          setUser({ ...user, weight_kg: data.weight_kg })
        }
        // Refresh adaptations after check-in
        fetchAdaptations()
      }
    } catch (err) {
      console.error('Check-in failed', err)
    }
  }

  const handleAcceptAdjustment = async (adj: any) => {
    try {
      const body: any = {}
      if (adj.type === 'calorie') body.new_target_calories = adj.new_value
      if (adj.type === 'workout') body.new_workout_days = adj.new_value

      const res = await fetch('/api/analysis/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (res.ok) {
        setAdaptations(prev => prev.filter(item => item !== adj))
        fetchUserData()
      }
    } catch (err) {
      console.error("Failed to apply adjustment", err)
    }
  }

  const handleSavePrefs = (newPrefs: any) => {
    setSchedulePrefs(newPrefs)
    localStorage.setItem('schedulePrefs', JSON.stringify(newPrefs))
  }

  useEffect(() => {
    if (user) {
      setDailySchedule(generateDailySchedule(user as any, schedulePrefs))
    }
  }, [user, schedulePrefs])

  if (loading) return <DashboardSkeleton />
  if (!user) return null

  return (
    <PageTransition>
      <div className="min-h-screen bg-black text-white flex font-inter overflow-hidden">
        <Sidebar activePage="dashboard" />
        <MobileNav activePage="dashboard" />

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 no-scrollbar relative">
          {/* Background Atmosphere */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px]" />
          </div>

          <TopBar
            title="Neural Dashboard"
            subtitle={user?.name ? `${user.name.split(' ')[0]}'s biometric data` : 'Neural-Sync Active'}
          />

          <StaggerContainer>
            <div className="grid grid-cols-12 gap-8 md:gap-10 auto-rows-max relative z-10">

              {/* LEFT COLUMN: PRIMARY DATA */}
              <div className="col-span-12 lg:col-span-8 flex flex-col gap-8 md:gap-10">

                {!hasCheckedIn && (
                  <FadeIn>
                    <div className="bg-gradient-to-r from-purple-600/20 to-indigo-600/10 border border-purple-500/20 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[80px] group-hover:bg-purple-500/20 transition-all" />
                      <div className="flex items-center gap-6 relative z-10">
                        <div className="w-16 h-16 rounded-2xl bg-purple-600 flex items-center justify-center text-white shadow-[0_0_30px_rgba(147,51,234,0.4)]">
                          <Icons.Sparkles size={28} />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-white uppercase italic leading-none mb-2">Morning Protocol Pending</h3>
                          <p className="text-xs text-zinc-400 font-medium uppercase tracking-widest leading-none">Sync your physique & neural data for precise tracking.</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsCheckinOpen(true)}
                        className="w-full md:w-auto px-10 py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all shadow-xl active:scale-95"
                      >
                        Sync Now
                      </button>
                    </div>
                  </FadeIn>
                )}

                <StaggerItem>
                  <HoverScale scale={1.005} className="h-full">
                    <NutritionDashboard userId={user.id} />
                  </HoverScale>
                </StaggerItem>

                <StaggerItem>
                  <QuickActions userId={user.id} />
                </StaggerItem>

                <StaggerItem>
                  <WorkoutTimeline userId={user.id} />
                </StaggerItem>

                <StaggerItem>
                  <WaterTracker userId={user.id} targetMl={user.daily_water_goal_ml || 2500} />
                </StaggerItem>
              </div>

              {/* RIGHT COLUMN: ADAPTATIONS & QUICK STATS */}
              <div className="col-span-12 lg:col-span-4 flex flex-col gap-8 md:gap-10">

                {/* AI ADAPTATIONS SECTION */}
                <StaggerItem>
                  <RecommendationCard
                    adjustments={adaptations}
                    onAccept={handleAcceptAdjustment}
                    onDismiss={(idx) => setAdaptations(prev => prev.filter((_, i) => i !== idx))}
                  />
                </StaggerItem>

                <StaggerItem>
                  <LiveSchedule schedule={dailySchedule} onOpenSettings={() => setIsSettingsOpen(true)} />
                </StaggerItem>

                {/* AI COACH MINI */}
                <StaggerItem>
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

                {/* ANALYTICS LINK */}
                <StaggerItem>
                  <Link href="/progress">
                    <div className="glass-card p-6 flex items-center justify-between group hover:bg-white/5 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-600/20 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                          <Icons.Sparkles size={24} />
                        </div>
                        <div>
                          <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Biological Audit</div>
                          <div className="text-sm font-black text-white uppercase italic">Open Growth Hub</div>
                        </div>
                      </div>
                      <Icons.ChevronRight className="text-zinc-700 group-hover:text-white transition-colors" />
                    </div>
                  </Link>
                </StaggerItem>

              </div>
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

      <ToastContainer />

      <ScheduleSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSavePrefs}
        currentPrefs={schedulePrefs}
        onEnableNotifications={requestPermission}
      />

      <DailyCheckinModal
        isOpen={isCheckinOpen}
        onClose={() => setIsCheckinOpen(false)}
        onSave={handleSaveCheckin}
      />
    </PageTransition>
  )
}
