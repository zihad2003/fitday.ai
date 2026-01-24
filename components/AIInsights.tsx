'use client'

import { useEffect, useState } from 'react'
import { getUserSession } from '@/lib/auth'

type InsightData = {
  food_suggestion?: string
  exercise_suggestion?: string
  lifestyle_tip?: string
  daily_quote?: string
}

export default function AIInsights() {
  const [insights, setInsights] = useState<InsightData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInsights = async () => {
      const session = getUserSession()
      if (!session) return

      try {
        // Fetch quick insights
        const [foodRes, exerciseRes, lifestyleRes] = await Promise.all([
          fetch(`/api/ai/suggestions?user_id=${session.id}&type=food`).catch(() => null),
          fetch(`/api/ai/suggestions?user_id=${session.id}&type=exercise`).catch(() => null),
          fetch(`/api/ai/suggestions?user_id=${session.id}&type=lifestyle`).catch(() => null)
        ])

        const insightsData: InsightData = {}

        if (foodRes) {
          const foodJson = await foodRes.json()
          if (foodJson.success && foodJson.data.suggestions?.[0]) {
            insightsData.food_suggestion = foodJson.data.suggestions[0].food_name
          }
        }

        if (exerciseRes) {
          const exerciseJson = await exerciseRes.json()
          if (exerciseJson.success && exerciseJson.data.suggestions?.[0]) {
            insightsData.exercise_suggestion = exerciseJson.data.suggestions[0].exercise_name
          }
        }

        if (lifestyleRes) {
          const lifestyleJson = await lifestyleRes.json()
          if (lifestyleJson.success) {
            insightsData.lifestyle_tip = lifestyleJson.data.motivation?.daily_quote
            insightsData.daily_quote = lifestyleJson.data.motivation?.daily_quote
          }
        }

        setInsights(insightsData)
      } catch (error) {
        console.error('Failed to fetch insights:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchInsights()
  }, [])

  if (loading || !insights) {
    return (
      <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6">
        <div className="h-4 w-32 bg-slate-800 rounded animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-900/50 border border-cyan-500/20 rounded-3xl p-6 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🤖</span>
        <h3 className="text-lg font-bold text-white">AI Daily Insights</h3>
      </div>

      {insights.food_suggestion && (
        <div className="flex items-start gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <span className="text-emerald-400">🥗</span>
          <div>
            <p className="text-xs text-slate-400 uppercase font-mono mb-1">Food Suggestion</p>
            <p className="text-sm text-white">{insights.food_suggestion}</p>
          </div>
        </div>
      )}

      {insights.exercise_suggestion && (
        <div className="flex items-start gap-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl">
          <span className="text-orange-400">💪</span>
          <div>
            <p className="text-xs text-slate-400 uppercase font-mono mb-1">Exercise Suggestion</p>
            <p className="text-sm text-white">{insights.exercise_suggestion}</p>
          </div>
        </div>
      )}

      {insights.daily_quote && (
        <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
          <p className="text-xs text-slate-400 uppercase font-mono mb-2">Daily Motivation</p>
          <p className="text-sm text-purple-300 italic">"{insights.daily_quote}"</p>
        </div>
      )}
    </div>
  )
}
