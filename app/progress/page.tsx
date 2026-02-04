'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp, TrendingDown, Target, Zap,
  Award, Trophy, Crown, ArrowLeft,
  Calendar, Activity, Droplet, Moon,
  ChevronRight, Star
} from 'lucide-react'
import Link from 'next/link'
import Sidebar from '@/components/dashboard/Sidebar'
import TopBar from '@/components/dashboard/TopBar'
import MobileNav from '@/components/dashboard/MobileNav'
import { PageTransition, FadeIn, StaggerContainer, StaggerItem, SlideUp } from '@/components/animations/Transitions'
import WorkoutHistory from '@/components/dashboard/WorkoutHistory'
import ProgressCharts from '@/components/dashboard/ProgressCharts'
import { exportToCSV } from '@/lib/integrations/export-engine'

export default function ProgressPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await fetch('/api/analysis/progress')
        const json = await res.json() as { success: boolean, data: any }
        if (json.success) {
          setData(json.data)
        }
      } catch (err) {
        console.error("Failed to fetch progress", err)
      } finally {
        setLoading(false)
      }
    }
    fetchProgress()
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500">De-fragmenting Progress Matrix...</p>
      </div>
    </div>
  )

  if (!data) return null

  const { metrics, insights, gamification } = data

  return (
    <div className="min-h-screen bg-black text-white font-inter">
      <Sidebar activePage="progress" />

      <main className="lg:pl-72 min-h-screen pb-24 lg:pb-0">
        <TopBar title="Evolution Analytics" />

        <div className="p-6 lg:p-10 max-w-7xl mx-auto">
          <PageTransition>
            <StaggerContainer>

              {/* HERO SECTION: Current Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <StaggerItem className="md:col-span-2">
                  <div className="bg-gradient-to-br from-purple-900/40 via-black to-zinc-950 border border-purple-500/20 rounded-[3rem] p-10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                      <TrendingUp size={200} className="text-purple-400" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="px-4 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-full">
                          <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Metabolic Trajectory</span>
                        </div>
                      </div>
                      <div className="flex gap-4 mb-6">
                        <button
                          onClick={() => exportToCSV(data.dailyData, `FitDay_Evolution_${new Date().toISOString().split('T')[0]}`)}
                          className="px-6 h-10 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all text-zinc-400 hover:text-white flex items-center gap-2"
                        >
                          Neural Export (CSV)
                        </button>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-1 bg-purple-500 rounded-full" />
                          <span className="text-[9px] font-black uppercase text-zinc-600">Weight</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-1 bg-cyan-500 rounded-full" />
                          <span className="text-[9px] font-black uppercase text-zinc-600">Activity</span>
                        </div>
                      </div>
                      <h2 className="text-5xl font-black font-outfit uppercase italic mb-4">
                        {metrics.weight_change_kg > 0 ? '+' : ''}{metrics.weight_change_kg.toFixed(1)} <span className="text-2xl text-zinc-600">KG</span>
                      </h2>
                      <p className="text-sm text-zinc-400 max-w-md leading-relaxed uppercase font-medium italic">
                        Current status: <span className="text-white font-bold">{metrics.trend}</span>.
                        You are currently operating at <span className="text-purple-400 font-bold">{metrics.consistency_score.toFixed(0)}% efficiency</span> relative to your primary directive.
                      </p>
                    </div>
                  </div>
                </StaggerItem>

                <StaggerItem>
                  <div className="bg-zinc-950 border border-white/5 rounded-[3rem] p-8 flex flex-col justify-between h-full group hover:border-purple-500/30 transition-all">
                    <div>
                      <div className="flex justify-between items-start mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-black">
                          <Zap size={24} className="fill-black" />
                        </div>
                        <div className="text-right">
                          <div className="text-4xl font-black font-outfit text-white leading-none">{gamification.streak.current_streak}</div>
                          <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mt-1">Day Streak</div>
                        </div>
                      </div>
                      <p className="text-xs text-zinc-500 font-medium uppercase leading-relaxed italic">
                        Your longest sustained sync window is <span className="text-white font-bold">{gamification.streak.longest_streak} days</span>. Maintain current focus to evolve.
                      </p>
                    </div>
                    <div className="mt-8 h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(gamification.streak.current_streak / (gamification.streak.longest_streak || 1)) * 100}%` }}
                        className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                      />
                    </div>
                  </div>
                </StaggerItem>
              </div>

              {/* ANALYTICS GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">

                {/* ADHERENCE STATS */}
                <div className="lg:col-span-1 space-y-6">
                  <StatCard label="Workout Adherence" value={`${metrics.workout_adherence_percentage.toFixed(0)}%`} icon={<Activity size={20} />} color="purple" />
                  <StatCard label="Calorie Precision" value={`${metrics.calorie_adherence_percentage.toFixed(0)}%`} icon={<Target size={20} />} color="cyan" />
                  <StatCard label="Avg Sleep" value={`${metrics.average_sleep_hours.toFixed(1)}h`} icon={<Moon size={20} />} color="indigo" />
                  <StatCard label="Avg Hydration" value={`${metrics.average_water_ml / 1000}L`} icon={<Droplet size={20} />} color="blue" />
                </div>

                {/* TREND CHARTS */}
                <div className="lg:col-span-3">
                  <ProgressCharts data={data.dailyData || []} />
                </div>
              </div>

              {/* ACHIEVEMENTS BLOCK */}
              <div className="mb-12">
                <div className="flex items-center gap-4 mb-8">
                  <Award size={24} className="text-yellow-500" />
                  <h3 className="text-xl font-black font-outfit uppercase italic text-white leading-none">Unlocked Evolutionary Milestones</h3>
                  <div className="h-[2px] flex-1 bg-white/5" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {gamification.achievements.map((ach: any, idx: number) => (
                    <StaggerItem key={ach.id}>
                      <div className="bg-zinc-950 border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:border-yellow-500/30 transition-all">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                          <Trophy size={80} className="text-yellow-500" />
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500 mb-4">
                          {ach.name.includes('King') ? <Crown size={20} /> : <Star size={20} />}
                        </div>
                        <h4 className="text-sm font-black font-outfit uppercase italic text-zinc-200 mb-1">{ach.name}</h4>
                        <p className="text-[10px] text-zinc-500 font-medium uppercase leading-relaxed">{ach.description}</p>
                        <div className="mt-4 pt-4 border-t border-white/5 text-[8px] font-black text-zinc-700 uppercase tracking-widest">
                          Unlocked {new Date(ach.earned_at).toLocaleDateString()}
                        </div>
                      </div>
                    </StaggerItem>
                  ))}
                  {gamification.achievements.length === 0 && (
                    <div className="col-span-4 p-12 text-center border-2 border-dashed border-white/5 rounded-3xl opacity-30">
                      <p className="text-xs font-black uppercase tracking-widest italic">No Milestones Unlocked. Initiate Protocol to Begin.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* INSIGHTS & HISTORY PANEL */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="bg-zinc-950 border border-orange-500/20 rounded-[3rem] p-10 overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-12 opacity-5">
                    <Activity size={120} className="text-orange-400" />
                  </div>
                  <h3 className="text-xl font-black font-outfit uppercase italic text-white flex items-center gap-3 mb-8">
                    Adaptive Recommendations
                    <div className="px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full text-[9px] font-black text-orange-400">ENGINE ACTIVE</div>
                  </h3>

                  <div className="space-y-4">
                    {insights.map((insight: any, i: number) => (
                      <div key={i} className={`p-6 rounded-2xl border flex items-center gap-6 ${insight.type === 'success' ? 'bg-emerald-500/5 border-emerald-500/10' :
                        insight.type === 'warning' ? 'bg-orange-500/5 border-orange-500/10' :
                          'bg-blue-500/5 border-blue-500/10'
                        }`}>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${insight.type === 'success' ? 'bg-emerald-500 text-black' :
                          insight.type === 'warning' ? 'bg-orange-500 text-black' :
                            'bg-blue-500 text-white'
                          }`}>
                          {insight.type === 'success' ? <Zap size={20} /> : <Calendar size={20} />}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-black font-outfit uppercase italic text-white">{insight.title}</h4>
                          <p className="text-[11px] text-zinc-500 font-medium uppercase leading-relaxed mt-1">{insight.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-zinc-950 border border-white/5 rounded-[3rem] p-10 relative overflow-hidden">
                  <WorkoutHistory userId={data.userId || 1} />
                </div>
              </div>

            </StaggerContainer>
          </PageTransition>
        </div>
      </main>

      <MobileNav activePage="progress" />

      <style jsx>{`
                .stat-card {
                    @apply bg-zinc-950 border border-white/5 rounded-2xl p-6 flex flex-col gap-2 transition-all hover:border-white/10;
                }
            `}</style>
    </div>
  )
}

function StatCard({ label, value, icon, color }: any) {
  const colors: any = {
    purple: "text-purple-500 shadow-[0_0_15px_#9333ea20]",
    cyan: "text-cyan-500 shadow-[0_0_15px_#06b6d420]",
    indigo: "text-indigo-500 shadow-[0_0_15px_#6366f120]",
    blue: "text-blue-500 shadow-[0_0_15px_#3b82f620]"
  }

  return (
    <div className="bg-zinc-950 border border-white/5 rounded-[2rem] p-6 group hover:translate-x-2 transition-all">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center ${colors[color]}`}>
          {icon}
        </div>
        <div>
          <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">{label}</div>
          <div className="text-xl font-black font-outfit uppercase italic text-white">{value}</div>
        </div>
      </div>
    </div>
  )
}
