'use client'

import { useEffect, useState } from 'react'
import { format, subDays, eachDayOfInterval } from 'date-fns'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getUserSession } from '@/lib/auth'
import {
  PageTransition,
  SlideUp,
  StaggerContainer,
  StaggerItem,
  FadeIn,
  ScaleIn,
  HoverScale,
  LoadingDots
} from '@/components/animations/Transitions'
import { CardSkeleton, TableSkeleton } from '@/components/animations/SkeletonLoaders'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'

// --- 1. TYPES ---
type DailyStat = {
  date: string
  calories: number
  target: number
  workoutCompleted: boolean
}

type PredictionResult = {
  predictedWeight: number
  confidence: number
  milestones: Array<{
    date: string
    description: string
    predictedValue: number
    metric: string
  }>
  recommendations: string[]
  insights: string[]
}

type ApiResponse<T> = {
  success: boolean
  data: T
}

export default function ProgressPage() {
  const router = useRouter()
  const [stats, setStats] = useState<DailyStat[]>([])
  const [loading, setLoading] = useState(true)
  const [predicting, setPredicting] = useState(false)
  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [consistencyScore, setConsistencyScore] = useState(0)
  const [userId, setUserId] = useState<number | null>(null)

  useEffect(() => {
    const session = getUserSession()
    if (!session) {
      router.push('/login')
      return
    }

    setUserId(session.id)
    fetchHistory(session.id)
  }, [router])

  const fetchHistory = async (uid: number) => {
    setLoading(true)
    try {
      const today = new Date()
      const last7Days = eachDayOfInterval({
        start: subDays(today, 6),
        end: today
      })

      const userRes = await fetch(`/api/users/${uid}`)
      const userData = (await userRes.json()) as ApiResponse<any>
      const targetCals = userData.success ? userData.data.target_calories : 2200

      const promises = last7Days.map(async (date) => {
        const dateStr = format(date, 'yyyy-MM-dd')
        const [mealRes, workoutRes] = await Promise.all([
          fetch(`/api/meals?user_id=${uid}&date=${dateStr}`),
          fetch(`/api/workouts?user_id=${uid}&date=${dateStr}`)
        ])

        const meals = (await mealRes.json()) as ApiResponse<any[]>
        const workouts = (await workoutRes.json()) as ApiResponse<any[]>

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

      if (results.length > 0) {
        const adherenceDays = results.filter(d =>
          d.workoutCompleted || (d.calories > d.target * 0.8 && d.calories < d.target * 1.2)
        ).length
        setConsistencyScore(Math.round((adherenceDays / results.length) * 100))
      }

      // Automatically fetch AI prediction
      handlePredict(uid)

    } catch (err) {
      console.error('Analytics failed', err)
    } finally {
      setLoading(false)
    }
  }

  const handlePredict = async (uid: number) => {
    setPredicting(true)
    try {
      const res = await fetch('/api/ai/predict-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: uid })
      })
      const json = (await res.json()) as any
      if (json.success) {
        setPrediction(json.data)
      }
    } catch (err) {
      console.error('Prediction failed', err)
    } finally {
      setPredicting(false)
    }
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-950 text-white font-sans pb-20 selection:bg-purple-500/30 relative">
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-purple-900/10 via-slate-950 to-slate-950 pointer-events-none"></div>

        {/* Navbar */}
        <div className="border-b border-white/5 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/dashboard" className="text-sm font-mono text-slate-400 hover:text-white transition flex items-center gap-2">
              ← DASHBOARD
            </Link>
            <div className="font-mono text-xs text-purple-500 tracking-widest uppercase">
              Predictive Intelligence
            </div>
          </div>
        </div>

        <main className="max-w-4xl mx-auto px-6 pt-10 relative z-10">

          {/* Header Section */}
          <div className="flex flex-col md:flex-row gap-8 mb-12 items-start justify-between">
            <FadeIn>
              <h1 className="text-4xl font-black text-white mb-2 uppercase italic tracking-tighter">Growth <span className="text-purple-500">Analytics</span></h1>
              <p className="text-slate-400 text-sm max-w-sm">Synchronized physiological data points and predictive trajectory analysis.</p>
            </FadeIn>

            <StaggerContainer>
              <StaggerItem>
                <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 flex items-center gap-6 shadow-2xl">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-800" />
                      <motion.circle
                        initial={{ strokeDashoffset: 175 }}
                        animate={{ strokeDashoffset: 175 - (175 * consistencyScore) / 100 }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent"
                        className={`${consistencyScore > 70 ? 'text-purple-500' : 'text-orange-500'}`}
                        strokeDasharray={175}
                      />
                    </svg>
                    <span className="absolute text-sm font-bold tracking-tighter font-mono">{consistencyScore}%</span>
                  </div>
                  <div>
                    <div className="text-lg font-black text-white leading-none mb-1">CONSISTENCY</div>
                    <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">System Adherence</div>
                  </div>
                </div>
              </StaggerItem>
            </StaggerContainer>
          </div>

          {loading ? (
            <div className="space-y-12">
              <CardSkeleton />
              <TableSkeleton />
            </div>
          ) : (
            <div className="space-y-12">

              {/* AI Prediction Section */}
              <SlideUp delay={0.2}>
                <section className="bg-gradient-to-br from-purple-600/10 to-transparent border border-purple-500/20 rounded-[3rem] p-8 md:p-12 relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex flex-col md:flex-row justify-between gap-8 mb-10">
                      <div>
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tight mb-2 flex items-center gap-3">
                          <span className="text-3xl">🔮</span> AI Trajectory Projection
                        </h2>
                        <p className="text-slate-400 text-sm max-w-sm">Neural-calculated milestones based on your current velocity.</p>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-500 font-mono uppercase mb-1">Confidence Score</div>
                        <div className="text-3xl font-black text-purple-400 font-mono tracking-tighter">{prediction?.confidence || 0}%</div>
                      </div>
                    </div>

                    {predicting ? (
                      <div className="py-20 flex flex-col items-center gap-4">
                        <LoadingDots />
                        <span className="text-xs font-mono text-purple-500 uppercase animate-pulse">Running Monte Carlo Simulations...</span>
                      </div>
                    ) : prediction ? (
                      <div className="grid md:grid-cols-2 gap-8">
                        {/* Milestones */}
                        <div className="space-y-4">
                          <h3 className="text-xs font-mono uppercase text-slate-500 tracking-widest mb-4">Milestone Roadmap</h3>
                          {prediction.milestones.map((ms, i) => (
                            <ScaleIn key={i} delay={i * 0.1}>
                              <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-4 flex justify-between items-center group hover:bg-white/5 transition-colors">
                                <div>
                                  <div className="text-xs font-mono text-purple-500 mb-1">{format(new Date(ms.date), 'MMM dd, yyyy')}</div>
                                  <div className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors uppercase">{ms.description}</div>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-black text-white">{ms.predictedValue}</div>
                                  <div className="text-[10px] font-mono text-slate-500 uppercase">{ms.metric}</div>
                                </div>
                              </div>
                            </ScaleIn>
                          ))}
                        </div>

                        {/* Insights & Recs */}
                        <div className="space-y-6">
                          <div className="bg-slate-950/50 rounded-3xl p-6 border border-white/5">
                            <h3 className="text-xs font-mono uppercase text-slate-500 tracking-widest mb-4">AI Insights</h3>
                            <ul className="space-y-3">
                              {prediction.insights.map((insight, i) => (
                                <li key={i} className="text-sm text-slate-300 flex items-start gap-3">
                                  <span className="text-purple-500 mt-1">●</span>
                                  {insight}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="bg-purple-500/5 rounded-3xl p-6 border border-purple-500/10">
                            <h3 className="text-xs font-mono uppercase text-purple-500 tracking-widest mb-4">Optimization Strategy</h3>
                            <ul className="space-y-3">
                              {prediction.recommendations.map((rec, i) => (
                                <li key={i} className="text-sm text-white/80 flex items-start gap-3">
                                  <span className="text-purple-400 mt-1">→</span>
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <Button variant="primary" onClick={() => userId && handlePredict(userId)}>Generate Prediction</Button>
                      </div>
                    )}
                  </div>
                </section>
              </SlideUp>

              {/* Chart 1: Calorie Adherence */}
              <FadeIn delay={0.4}>
                <section className="bg-slate-900/50 border border-white/10 rounded-[2.5rem] p-8 md:p-10">
                  <div className="flex justify-between items-center mb-10">
                    <h3 className="font-black text-xl flex items-center gap-3 uppercase italic">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Nutritional Adherence
                    </h3>
                    <div className="flex gap-4 text-[10px] font-mono uppercase text-slate-500">
                      <div className="flex items-center gap-2"><span className="w-2 h-2 bg-emerald-500/30 rounded-full"></span> Intake</div>
                      <div className="flex items-center gap-2"><span className="w-2 h-0.5 bg-slate-700"></span> Target</div>
                    </div>
                  </div>

                  <div className="h-64 flex items-end justify-between gap-4 md:gap-8 px-2">
                    {stats.map((day, i) => {
                      const target = day.target || 2200
                      const percent = Math.min((day.calories / (target * 1.5)) * 100, 100)
                      const isOver = day.calories > target

                      return (
                        <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                          <HoverScale scale={1.05} className="w-full flex flex-col items-center">
                            {/* Tooltip */}
                            <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-black font-black text-[10px] px-3 py-1.5 rounded-lg whitespace-nowrap z-20 shadow-2xl pointer-events-none">
                              {day.calories} KCAL
                            </div>

                            {/* Target Line Marker */}
                            <div className="absolute w-full border-t border-dashed border-white/10 bottom-[66%] z-0" title="Target Line"></div>

                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${percent}%` }}
                              transition={{ duration: 1, delay: i * 0.1 }}
                              className={`w-full max-w-[48px] rounded-t-2xl transition-all duration-300 relative z-10 ${isOver ? 'bg-gradient-to-t from-orange-600 to-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.2)]' : 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                                }`}
                            />
                            <div className="mt-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest">{format(new Date(day.date), 'EEE')}</div>
                          </HoverScale>
                        </div>
                      )
                    })}
                  </div>
                </section>
              </FadeIn>

              {/* Chart 2: Workout Frequency */}
              <FadeIn delay={0.6}>
                <section className="bg-slate-900/50 border border-white/10 rounded-[2.5rem] p-8 md:p-10">
                  <h3 className="font-black text-xl flex items-center gap-3 mb-10 uppercase italic">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    Neuro-Muscular Frequency
                  </h3>

                  <div className="grid grid-cols-7 gap-3">
                    {stats.map((day, i) => (
                      <div key={i} className="flex flex-col items-center gap-4">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: i * 0.1 }}
                          className={`w-full aspect-square rounded-2xl md:rounded-3xl border flex items-center justify-center transition-all ${day.workoutCompleted
                            ? 'bg-purple-600 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.3)]'
                            : 'bg-slate-900/50 border-white/5'
                            }`}>
                          {day.workoutCompleted ? (
                            <span className="text-2xl md:text-3xl">🎚️</span>
                          ) : (
                            <span className="text-[10px] font-mono text-slate-700 uppercase tracking-tighter">OFF</span>
                          )}
                        </motion.div>
                        <span className="text-[10px] font-mono text-slate-500 uppercase">{format(new Date(day.date), 'dd MMM')}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </FadeIn>

            </div>
          )}
        </main>
      </div>
    </PageTransition>
  )
}
