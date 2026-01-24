'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getUserSession } from '@/lib/auth'
import {
  PageTransition,
  SlideUp,
  StaggerContainer,
  StaggerItem,
  FadeIn,
  Celebration,
  HoverScale,
  LoadingDots
} from '@/components/animations/Transitions'
import { CardSkeleton, ListSkeleton } from '@/components/animations/SkeletonLoaders'
import Button from '@/components/ui/Button'
import { announceToScreenReader } from '@/lib/accessibility'

// --- 1. TYPES ---
type Exercise = {
  id: string
  name: string
  sets: number
  reps: string
  rest: string
  tags: string[]
  gif_url?: string
  difficulty?: string
  notes?: string
}

type DayPlan = {
  day: number
  name: string
  focus: string
  warmup: Exercise[]
  mainWorkout: Exercise[]
}

type UserProfile = {
  id: number
  goal: 'lose_weight' | 'gain_muscle' | 'maintain' | 'strength' | 'endurance'
  name: string
  activity_level: string
}

type ApiResponse<T> = {
  success: boolean
  data: T
  error?: string
}

export default function WorkoutPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState(0)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [weeklySchedule, setWeeklySchedule] = useState<DayPlan[]>([])
  const [showCelebration, setShowCelebration] = useState(false)

  useEffect(() => {
    const session = getUserSession()
    if (!session) {
      router.push('/login')
      return
    }

    fetchData(session.id)
  }, [router])

  const fetchData = async (uid: number) => {
    setLoading(true)
    try {
      const userRes = await fetch(`/api/users/${uid}`)
      const userJson = (await userRes.json()) as ApiResponse<UserProfile>

      if (userJson.success) {
        setUserProfile(userJson.data)
      }

      // Fetch current plan
      const planRes = await fetch(`/api/ai/workout-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: uid })
      })
      const planJson = await planRes.json()

      if (planJson.success) {
        setWeeklySchedule(planJson.data.schedule)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateAIWorkout = async () => {
    if (!userProfile) return
    setGenerating(true)
    announceToScreenReader('Generating your high-performance AI workout protocol...', 'polite')

    try {
      const res = await fetch('/api/ai/workout-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userProfile.id })
      })
      const json = await res.json()

      if (json.success) {
        setWeeklySchedule(json.data.schedule)
        setShowCelebration(true)
        announceToScreenReader('New workout protocol optimized and ready.', 'assertive')
      }
    } catch (err) {
      console.error('Failed to generate AI workout', err)
    } finally {
      setGenerating(false)
    }
  }

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><LoadingDots /></div>

  const activeDay = weeklySchedule[activeTab]

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-950 text-white font-sans pb-20 relative selection:bg-orange-500/30">
        <Celebration show={showCelebration} onComplete={() => setShowCelebration(false)} />

        {/* Navbar */}
        <div className="border-b border-white/5 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/dashboard" className="text-sm font-mono text-slate-400 hover:text-white transition flex items-center gap-2">
              ← DASHBOARD
            </Link>
            <div className="font-mono text-xs text-orange-500 tracking-widest uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
              Training Protocol
            </div>
          </div>
        </div>

        <main className="max-w-4xl mx-auto px-6 pt-10">

          {/* Header */}
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <FadeIn>
                <h1 className="text-4xl font-black text-white mb-2 uppercase italic tracking-tight">
                  {userProfile?.goal.replace('_', ' ')} <span className="text-orange-500">PROGRAM</span>
                </h1>
                <p className="text-slate-400 text-sm max-w-lg">
                  Algorithmically optimized training schedule based on your physiology and performance history.
                </p>
              </FadeIn>
            </div>

            <Button
              variant="outline"
              className="border-orange-500/30 text-orange-400 hover:bg-orange-500 hover:text-black font-bold"
              onClick={handleGenerateAIWorkout}
              loading={generating}
              loadingText="Optimizing..."
            >
              ✨ Regenerate Protocol
            </Button>
          </div>

          {/* Week Navigator */}
          <div className="flex gap-3 overflow-x-auto pb-6 mb-8 no-scrollbar scroll-smooth">
            {weeklySchedule.map((day, index) => {
              const isActive = index === activeTab
              return (
                <button
                  key={index}
                  onClick={() => setActiveTab(index)}
                  className={`flex-shrink-0 px-8 py-5 rounded-3xl border transition-all duration-300 relative overflow-hidden group ${isActive
                      ? 'bg-orange-600 border-orange-500 text-white shadow-[0_0_25px_rgba(249,115,22,0.35)]'
                      : 'bg-slate-900 border-white/10 text-slate-500 hover:border-orange-500/50 hover:text-slate-300'
                    }`}
                >
                  <div className="text-[10px] font-mono uppercase mb-1 opacity-60">Day {day.day}</div>
                  <div className="font-black text-xl">L-{index + 1}</div>
                  {isActive && <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>}
                </button>
              )
            })}
          </div>

          {/* Active Day View */}
          {!activeDay ? (
            <div className="text-center py-20"><LoadingDots /></div>
          ) : (
            <FadeIn key={activeTab}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-black text-white mb-1 uppercase tracking-tighter">{activeDay.name}</h2>
                  <p className="text-orange-500 font-mono text-xs uppercase tracking-widest">{activeDay.focus}</p>
                </div>
                <div className="text-xs font-mono text-slate-400 bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-sm">
                  {activeDay.mainWorkout.length + activeDay.warmup.length} Movements
                </div>
              </div>

              {activeDay.mainWorkout.length === 0 ? (
                <div className="bg-slate-900/50 border border-dashed border-white/10 rounded-[3rem] p-16 text-center">
                  <div className="text-7xl mb-6">🧘</div>
                  <h3 className="text-2xl font-black text-white mb-3 uppercase">Active Recovery</h3>
                  <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
                    System maintenance in progress. Focus on flexibility, hydration, and nutritional density today.
                  </p>
                </div>
              ) : (
                <StaggerContainer>
                  <div className="grid gap-6">
                    {/* Render Warmup first */}
                    {activeDay.warmup.map((exercise, i) => (
                      <StaggerItem key={`warmup-${i}`}>
                        <ExerciseCard exercise={exercise} index={i} type="warmup" />
                      </StaggerItem>
                    ))}

                    {/* Render Main Workout */}
                    {activeDay.mainWorkout.map((exercise, i) => (
                      <StaggerItem key={`main-${i}`}>
                        <ExerciseCard exercise={exercise} index={i + activeDay.warmup.length} type="main" />
                      </StaggerItem>
                    ))}
                  </div>
                </StaggerContainer>
              )}
            </FadeIn>
          )}
        </main>
      </div>
    </PageTransition>
  )
}

function ExerciseCard({ exercise, index, type }: { exercise: Exercise, index: number, type: 'warmup' | 'main' }) {
  return (
    <HoverScale scale={1.01}>
      <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-6 md:p-10 hover:border-orange-500/30 transition-all duration-500 group relative overflow-hidden">
        {/* Badge */}
        <div className={`absolute top-0 right-0 px-6 py-2 rounded-bl-3xl font-mono text-[10px] uppercase tracking-widest border-l border-b border-white/5 ${type === 'warmup' ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'}`}>
          {type}
        </div>

        <div className="flex flex-col md:flex-row gap-10">

          {/* Visual Content */}
          <div className="w-full md:w-2/5 aspect-[4/3] bg-black rounded-3xl overflow-hidden relative border border-white/5 shadow-2xl">
            {exercise.gif_url ? (
              <img
                src={exercise.gif_url}
                alt={exercise.name}
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-slate-800 bg-slate-950">
                <div className="flex flex-col items-center gap-3">
                  <span className="text-4xl opacity-20">🎞️</span>
                  <span className="text-[10px] font-mono uppercase tracking-widest">Visual Missing</span>
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
          </div>

          {/* Detailed Info */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-5xl font-black text-white/5 group-hover:text-orange-500/10 transition-colors tabular-nums">
                {index + 1 < 10 ? `0${index + 1}` : index + 1}
              </span>
              <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight leading-none mb-1">{exercise.name}</h3>
                <div className="flex gap-2">
                  {exercise.difficulty && (
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-white/5 text-slate-400 rounded border border-white/5">
                      {exercise.difficulty}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-8">
              <StatBox label="Sets" value={exercise.sets} />
              <StatBox label="Reps" value={exercise.reps} />
              <StatBox label="Rest" value={exercise.rest} />
            </div>

            {exercise.notes && (
              <p className="text-sm text-slate-400 italic mb-8 border-l-2 border-orange-500/30 pl-4 leading-relaxed">
                "{exercise.notes}"
              </p>
            )}

            <button className="w-full py-5 bg-white/5 hover:bg-orange-600 hover:text-white border border-white/10 hover:border-orange-500 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3 group/btn shadow-xl active:scale-95">
              <span>Log Performance</span>
              <span className="text-xl group-hover/btn:translate-x-1 transition-transform">→</span>
            </button>
          </div>

        </div>
      </div>
    </HoverScale>
  )
}

function StatBox({ label, value }: { label: string, value: string | number }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-center group-hover:bg-white/[0.05] transition-colors">
      <div className="text-[10px] text-slate-500 uppercase font-mono mb-2 tracking-tighter">{label}</div>
      <div className="font-black text-white text-xl tabular-nums">{value}</div>
    </div>
  )
}