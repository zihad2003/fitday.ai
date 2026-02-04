'use client'

import { useEffect, useState } from 'react'
import { format, addDays, subDays } from 'date-fns'
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
  HoverScale
} from '@/components/animations/Transitions'
import { motion } from 'framer-motion'
import { CardSkeleton, ListSkeleton, Skeleton } from '@/components/animations/SkeletonLoaders'
import Button from '@/components/ui/Button'
import { announceToScreenReader } from '@/lib/accessibility'

// --- Types ---
type Meal = {
  id: number
  meal_type: string
  food_name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  completed: number
}

type AIMeal = {
  id: string
  type: string
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  ingredients: string[]
  instructions: string[]
}

type ApiResponse<T> = {
  success: boolean
  data: T
  error?: string
}

const calculateTotalMacros = (meals: Meal[]) => {
  return meals.reduce((acc, meal) => ({
    calories: acc.calories + (meal.calories || 0),
    protein: acc.protein + (meal.protein || 0),
    carbs: acc.carbs + (meal.carbs || 0),
    fat: acc.fat + (meal.fat || 0)
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 })
}

export default function DietPage() {
  const router = useRouter()
  const [date, setDate] = useState(new Date())
  const [meals, setMeals] = useState<Meal[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<number | null>(null)
  const [targetCalories, setTargetCalories] = useState(2200)
  const [generating, setGenerating] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)

  const formattedDate = format(date, 'yyyy-MM-dd')

  useEffect(() => {
    const session = getUserSession()
    if (!session) {
      router.push('/login')
      return
    }

    setUserId(session.id)
    fetchDiet(session.id)
  }, [formattedDate, router])

  const fetchDiet = async (uid: number) => {
    setLoading(true)
    try {
      const userRes = await fetch(`/api/users/${uid}`)
      const userJson: any = await userRes.json()
      if (userJson.success && userJson.data.target_calories) {
        setTargetCalories(userJson.data.target_calories || 2200)
      }

      const res = await fetch(`/api/meals?user_id=${uid}&date=${formattedDate}`)
      const json: any = await res.json()

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

  const handleGenerateAIPlan = async () => {
    if (!userId) return
    setGenerating(true)
    announceToScreenReader('Generating your personalized AI meal plan...', 'polite')

    try {
      const res = await fetch('/api/ai/meal-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })
      const json: any = await res.json()

      if (json.success) {
        // Here you would typically save these to the database
        // For now, we'll just mock the update and show a success animation
        setShowCelebration(true)
        announceToScreenReader('AI Meal Plan generated successfully!', 'assertive')

        // Refresh list
        setTimeout(() => fetchDiet(userId), 1000)
      }
    } catch (err) {
      console.error('Failed to generate AI plan', err)
    } finally {
      setGenerating(false)
    }
  }

  const totals = calculateTotalMacros(meals)

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-950 text-white font-sans pb-20 relative selection:bg-emerald-500/30">
        <Celebration show={showCelebration} onComplete={() => setShowCelebration(false)} />

        {/* Background Ambience */}
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-950 to-slate-950 pointer-events-none"></div>

        {/* Navbar */}
        <div className="border-b border-white/5 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/dashboard" className="text-sm font-mono text-slate-400 hover:text-white transition flex items-center gap-2" aria-label="Back to dashboard">
              ← DASHBOARD
            </Link>
            <div className="font-mono text-xs text-emerald-500 tracking-widest uppercase">
              Nutrition Intelligence
            </div>
          </div>
        </div>

        <main id="main-content" className="max-w-4xl mx-auto px-6 pt-10 relative z-10">

          {/* Date Navigator */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => setDate(subDays(date, 1))}
              className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition"
              aria-label="Previous Day"
            >
              ← Prev
            </button>
            <div className="text-center">
              <FadeIn>
                <h1 className="text-2xl font-bold text-white">{format(date, 'EEEE')}</h1>
                <p className="text-sm text-slate-500 font-mono">{format(date, 'MMMM do, yyyy')}</p>
              </FadeIn>
            </div>
            <button
              onClick={() => setDate(addDays(date, 1))}
              className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition"
              aria-label="Next Day"
            >
              Next →
            </button>
          </div>

          {/* Macro Summary Card */}
          <StaggerContainer>
            <div className="grid md:grid-cols-4 gap-4 mb-10">
              <StaggerItem>
                <div className="md:col-span-1 bg-slate-900 border border-white/10 rounded-2xl p-6 relative overflow-hidden h-full">
                  <div className="relative z-10">
                    <div className="text-xs text-slate-500 uppercase font-mono mb-1">Total Intake</div>
                    <div className="text-4xl font-black text-white tracking-tight">{totals.calories}</div>
                    <div className="text-xs text-slate-400 mt-1">/ {targetCalories} kcal</div>
                  </div>
                  <div className="absolute bottom-0 left-0 h-1 bg-emerald-500 transition-all duration-500" style={{ width: `${Math.min((totals.calories / targetCalories) * 100, 100)}%` }}></div>
                </div>
              </StaggerItem>

              <StaggerItem><MacroCard label="Protein" value={totals.protein} target={150} color="bg-emerald-500" /></StaggerItem>
              <StaggerItem><MacroCard label="Carbs" value={totals.carbs} target={200} color="bg-blue-500" /></StaggerItem>
              <StaggerItem><MacroCard label="Fats" value={totals.fat} target={70} color="bg-orange-500" /></StaggerItem>
            </div>
          </StaggerContainer>

          {/* AI Generation Action */}
          <SlideUp delay={0.3}>
            <div className="bg-gradient-to-br from-emerald-600/10 to-transparent border border-emerald-500/20 rounded-3xl p-6 mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h2 className="text-lg font-bold text-white mb-1">Feeling uninspired?</h2>
                <p className="text-sm text-slate-400">Let our AI generate a personalized South Asian meal plan for you.</p>
              </div>
              <Button
                variant="primary"
                size="lg"
                loading={generating}
                loadingText="Generating..."
                onClick={handleGenerateAIPlan}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
              >
                ✨ AI Smart Plan
              </Button>
            </div>
          </SlideUp>

          {/* Meal List */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
              <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
              Daily Log
            </h2>

            {loading ? (
              <ListSkeleton items={4} />
            ) : meals.length === 0 ? (
              <FadeIn>
                <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
                  <p className="text-slate-400 mb-6 font-mono">NO ENTRIES FOUND FOR THIS CYCLE</p>
                  <Button variant="ghost" className="border-white/10 text-slate-300" onClick={() => setDate(new Date())}>
                    Jump to Today
                  </Button>
                </div>
              </FadeIn>
            ) : (
              <StaggerContainer>
                <div className="grid gap-6">
                  {['breakfast', 'lunch', 'snack', 'dinner'].map((type) => {
                    const mealForType = meals.filter(m => m.meal_type === type)
                    if (mealForType.length === 0) return null

                    return (
                      <StaggerItem key={type}>
                        <HoverScale scale={1.01}>
                          <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6 md:p-8 transition-colors hover:border-white/20">
                            <div className="flex justify-between items-start mb-6">
                              <h3 className="capitalize text-xl font-bold text-white flex items-center gap-3">
                                {type === 'breakfast' && '🍳'}
                                {type === 'lunch' && '🍲'}
                                {type === 'snack' && '🍇'}
                                {type === 'dinner' && '🍱'}
                                {type}
                              </h3>
                              <div className="text-sm font-mono text-emerald-400 bg-emerald-400/5 px-3 py-1 rounded-full border border-emerald-400/10">
                                {mealForType.reduce((s, m) => s + m.calories, 0)} kcal
                              </div>
                            </div>

                            <div className="space-y-4">
                              {mealForType.map(meal => (
                                <div key={meal.id} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0 group/item">
                                  <div className="flex-1">
                                    <div className="text-slate-200 font-bold group-hover/item:text-emerald-400 transition-colors">
                                      {meal.food_name}
                                    </div>
                                    <div className="flex gap-3 mt-1.5">
                                      <span className="text-[11px] font-mono text-emerald-500/80">P: {meal.protein}g</span>
                                      <span className="text-[11px] font-mono text-blue-500/80">C: {meal.carbs}g</span>
                                      <span className="text-[11px] font-mono text-orange-500/80">F: {meal.fat}g</span>
                                    </div>
                                  </div>
                                  <div
                                    className={`w-4 h-4 rounded-full border-2 border-white/10 ${meal.completed ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 'bg-slate-800'}`}
                                    aria-label={meal.completed ? 'Completed' : 'Pending'}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </HoverScale>
                      </StaggerItem>
                    )
                  })}
                </div>
              </StaggerContainer>
            )}
          </div>
        </main>
      </div>
    </PageTransition>
  )
}

function MacroCard({ label, value, target, color }: { label: string, value: number, target: number, color: string }) {
  const percent = Math.min((value / target) * 100, 100)

  return (
    <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 flex flex-col justify-between h-full group hover:border-white/20 transition-all">
      <div className="flex justify-between items-start">
        <span className="text-xs text-slate-500 uppercase font-mono">{label}</span>
        <span className="text-sm font-black text-white group-hover:text-emerald-400 transition-colors">{value}g</span>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-[10px] text-slate-600 mb-1.5 font-mono">
          <span>0g</span>
          <span>{target}g</span>
        </div>
        <div className="h-2 w-full bg-slate-800/50 rounded-full overflow-hidden border border-white/5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={`h-full ${color} shadow-[0_0_8px_rgba(16,185,129,0.3)]`}
          />
        </div>
      </div>
    </div>
  )
}
