'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getUserSession } from '@/lib/auth'

type LifestyleData = {
  sleep: {
    recommended_hours: number
    tips: string[]
  }
  hydration: {
    recommended_liters: number
    tips: string[]
  }
  stress_management: {
    techniques: string[]
    tips: string[]
  }
  meal_timing: {
    breakfast_time: string
    lunch_time: string
    dinner_time: string
    tips: string[]
  }
  recovery: {
    rest_days_per_week: number
    active_recovery_suggestions: string[]
    tips: string[]
  }
  motivation: {
    daily_quote: string
    consistency_tips: string[]
  }
  weekly_focus: string
}

export default function LifestylePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [lifestyleData, setLifestyleData] = useState<LifestyleData | null>(null)
  const [userId, setUserId] = useState<number | null>(null)

  useEffect(() => {
    const session = getUserSession()
    if (!session) {
      router.push('/login')
      return
    }

    setUserId(session.id)
    fetchLifestyleSuggestions(session.id)
  }, [router])

  const fetchLifestyleSuggestions = async (uid: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/ai/suggestions?user_id=${uid}&type=lifestyle`)
      const json = await res.json()
      
      if (json.success && json.data) {
        setLifestyleData(json.data)
      }
    } catch (error) {
      console.error('Failed to fetch lifestyle suggestions:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 font-mono text-sm">Analyzing your lifestyle patterns...</p>
        </div>
      </div>
    )
  }

  if (!lifestyleData) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-6">
        <div className="max-w-4xl mx-auto text-center py-20">
          <p className="text-slate-400 mb-4">Unable to load lifestyle suggestions</p>
          <button
            onClick={() => userId && fetchLifestyleSuggestions(userId)}
            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-bold transition"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20">
      {/* Navbar */}
      <div className="border-b border-white/5 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="text-sm font-mono text-slate-400 hover:text-white transition flex items-center gap-2">
            ← DASHBOARD
          </Link>
          <div className="font-mono text-xs text-purple-500 tracking-widest uppercase">
            Lifestyle Optimization
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 pt-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-black text-white mb-2 uppercase italic">
            Life <span className="text-purple-400">Maintenance</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl">
            AI-powered holistic wellness recommendations tailored to your goals and lifestyle
          </p>
        </div>

        {/* Weekly Focus */}
        {lifestyleData.weekly_focus && (
          <div className="bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border border-purple-500/30 rounded-3xl p-8 mb-8">
            <div className="flex items-start gap-4">
              <div className="text-4xl">🎯</div>
              <div>
                <h2 className="text-lg font-bold text-white mb-2">This Week's Focus</h2>
                <p className="text-slate-300 leading-relaxed">{lifestyleData.weekly_focus}</p>
              </div>
            </div>
          </div>
        )}

        {/* Grid Layout */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Sleep */}
          <LifestyleCard
            icon="😴"
            title="Sleep Optimization"
            color="blue"
          >
            <div className="mb-4">
              <div className="text-3xl font-black text-blue-400 mb-1">
                {lifestyleData.sleep.recommended_hours} <span className="text-lg text-slate-400">hours</span>
              </div>
              <p className="text-xs text-slate-500 uppercase font-mono">Recommended Daily</p>
            </div>
            <ul className="space-y-2">
              {lifestyleData.sleep.tips.map((tip, i) => (
                <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </LifestyleCard>

          {/* Hydration */}
          <LifestyleCard
            icon="💧"
            title="Hydration"
            color="cyan"
          >
            <div className="mb-4">
              <div className="text-3xl font-black text-cyan-400 mb-1">
                {lifestyleData.hydration.recommended_liters} <span className="text-lg text-slate-400">liters</span>
              </div>
              <p className="text-xs text-slate-500 uppercase font-mono">Daily Water Intake</p>
            </div>
            <ul className="space-y-2">
              {lifestyleData.hydration.tips.map((tip, i) => (
                <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </LifestyleCard>

          {/* Stress Management */}
          <LifestyleCard
            icon="🧘"
            title="Stress Management"
            color="purple"
          >
            <div className="mb-4">
              <p className="text-xs text-slate-500 uppercase font-mono mb-3">Techniques</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {lifestyleData.stress_management.techniques.map((tech, i) => (
                  <span key={i} className="px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full text-xs text-purple-300">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
            <ul className="space-y-2">
              {lifestyleData.stress_management.tips.map((tip, i) => (
                <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </LifestyleCard>

          {/* Meal Timing */}
          <LifestyleCard
            icon="⏰"
            title="Meal Timing"
            color="emerald"
          >
            <div className="mb-4 space-y-3">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-slate-400 text-sm">Breakfast</span>
                <span className="font-mono text-emerald-400">{lifestyleData.meal_timing.breakfast_time}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-slate-400 text-sm">Lunch</span>
                <span className="font-mono text-emerald-400">{lifestyleData.meal_timing.lunch_time}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Dinner</span>
                <span className="font-mono text-emerald-400">{lifestyleData.meal_timing.dinner_time}</span>
              </div>
            </div>
            <ul className="space-y-2 mt-4">
              {lifestyleData.meal_timing.tips.map((tip, i) => (
                <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </LifestyleCard>
        </div>

        {/* Recovery */}
        <LifestyleCard
          icon="🔄"
          title="Recovery & Rest"
          color="orange"
          className="mb-8"
        >
          <div className="mb-4">
            <div className="text-3xl font-black text-orange-400 mb-1">
              {lifestyleData.recovery.rest_days_per_week} <span className="text-lg text-slate-400">days/week</span>
            </div>
            <p className="text-xs text-slate-500 uppercase font-mono mb-4">Recommended Rest Days</p>
            <div className="mb-4">
              <p className="text-xs text-slate-500 uppercase font-mono mb-2">Active Recovery</p>
              <div className="flex flex-wrap gap-2">
                {lifestyleData.recovery.active_recovery_suggestions.map((suggestion, i) => (
                  <span key={i} className="px-3 py-1 bg-orange-500/10 border border-orange-500/30 rounded-full text-xs text-orange-300">
                    {suggestion}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <ul className="space-y-2">
            {lifestyleData.recovery.tips.map((tip, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                <span className="text-orange-400 mt-1">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </LifestyleCard>

        {/* Motivation */}
        <LifestyleCard
          icon="💪"
          title="Motivation & Consistency"
          color="rose"
        >
          <div className="mb-6 p-6 bg-rose-500/10 border border-rose-500/30 rounded-2xl">
            <p className="text-rose-300 italic text-lg leading-relaxed">"{lifestyleData.motivation.daily_quote}"</p>
          </div>
          <ul className="space-y-3">
            {lifestyleData.motivation.consistency_tips.map((tip, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-start gap-3">
                <span className="text-rose-400 font-bold mt-0.5">{i + 1}.</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </LifestyleCard>

        {/* Refresh Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => userId && fetchLifestyleSuggestions(userId)}
            className="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)]"
          >
            🔄 Refresh Suggestions
          </button>
        </div>
      </main>
    </div>
  )
}

function LifestyleCard({
  icon,
  title,
  color,
  children,
  className = ''
}: {
  icon: string
  title: string
  color: 'blue' | 'cyan' | 'purple' | 'emerald' | 'orange' | 'rose'
  children: React.ReactNode
  className?: string
}) {
  const colorClasses = {
    blue: 'border-blue-500/20 bg-blue-500/5',
    cyan: 'border-cyan-500/20 bg-cyan-500/5',
    purple: 'border-purple-500/20 bg-purple-500/5',
    emerald: 'border-emerald-500/20 bg-emerald-500/5',
    orange: 'border-orange-500/20 bg-orange-500/5',
    rose: 'border-rose-500/20 bg-rose-500/5'
  }

  return (
    <div className={`bg-slate-900/50 border rounded-3xl p-6 ${colorClasses[color]} ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">{icon}</span>
        <h2 className="text-xl font-bold text-white">{title}</h2>
      </div>
      {children}
    </div>
  )
}
