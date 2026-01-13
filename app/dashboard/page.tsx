'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { getUserSession } from '@/lib/auth'

// --- 1. TYPE DEFINITIONS ---
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

// --- 2. HEALTH CALCULATION LOGIC ---
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

// BMI Calculator
const calculateBMI = (weight: number, heightCm: number) => {
  if (!weight || !heightCm) return { value: 0, status: 'Unknown', color: 'text-slate-500' }

  const heightM = heightCm / 100
  const bmi = parseFloat((weight / (heightM * heightM)).toFixed(1))

  let status = 'Normal'
  let color = 'text-emerald-400'

  if (bmi < 18.5) { status = 'Underweight'; color = 'text-blue-400' }
  else if (bmi >= 25 && bmi < 29.9) { status = 'Overweight'; color = 'text-orange-400' }
  else if (bmi >= 30) { status = 'Obese'; color = 'text-red-400' }

  return { value: bmi, status, color }
}

// --- 3. MAIN COMPONENT ---
export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState('')

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // 1. Check Session
        const session = getUserSession()
        if (!session) {
          router.push('/login')
          return
        }

        // 2. Fetch Fresh Data using Session ID
        const res = await fetch(`/api/users/${session.id}`)

        if (!res.ok) {
          // Fallback to session data if API fails or user deleted
          if (res.status === 404) {
            router.push('/login') // User deleted
            return
          }
          setUser(session) // Use stale session data as fallback
          return
        }

        const data = (await res.json()) as ApiResponse<UserProfile>
        if (data.success) {
          setUser(data.data)
        } else {
          // Fallback
          setUser(session)
        }
      } catch (err) {
        console.error('Error fetching user:', err)
        // Try fallback to session if API completely fails (e.g. offline)
        const session = getUserSession()
        if (session) setUser(session)
      } finally {
        setLoading(false)
      }
    }
    fetchUserData()
  }, [router])

  const generatePlan = async (type: 'meals' | 'workouts') => {
    if (!user) return

    setGenerating(type)
    const today = format(new Date(), 'yyyy-MM-dd')

    try {
      const endpoint = type === 'meals' ? '/api/meals/generate' : '/api/workouts/generate'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, date: today })
      })
      const data = (await res.json()) as ApiResponse<any>

      if (data.success) {
        router.push('/checklist')
      } else {
        alert(data.error || 'Generation failed')
      }
    } catch (error) {
      console.error(error)
      alert('System Error')
    } finally {
      setGenerating('')
    }
  }

  if (loading) return <DashboardSkeleton />

  // Safety check, though redirect should handle it
  if (!user) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Redirecting...</div>

  const macros = calculateMacros(user.target_calories || 2000, user.goal)
  const bmiData = calculateBMI(user.weight_kg, user.height_cm)

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">
              Command Center
            </h1>
            <p className="text-slate-400 mt-1 font-mono text-sm">
              Welcome back, <span className="text-cyan-400">{user.name}</span>.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/checklist" className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-lg text-sm font-bold transition flex items-center gap-2">
              📝 View Checklist
            </Link>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6">

          {/* Main Calorie Card */}
          <div className="md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-900/50 border border-white/10 rounded-3xl p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition duration-500">
              <span className="text-9xl">⚡</span>
            </div>

            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-slate-400 font-mono text-xs uppercase tracking-widest mb-2">Daily Fuel</h3>
                <div className="text-6xl font-black text-white tracking-tighter">
                  {user.target_calories} <span className="text-2xl text-slate-500 font-medium">kcal</span>
                </div>
              </div>

              {/* BMI Indicator inside main card */}
              <div className="text-right bg-black/20 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
                <div className="text-xs text-slate-400 uppercase font-mono mb-1">BMI Score</div>
                <div className={`text-2xl font-bold ${bmiData.color}`}>{bmiData.value}</div>
                <div className="text-[10px] text-slate-500">{bmiData.status}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <MacroItem label="Protein" amount={macros.protein} color="bg-emerald-500" />
              <MacroItem label="Carbs" amount={macros.carbs} color="bg-blue-500" />
              <MacroItem label="Fats" amount={macros.fat} color="bg-orange-500" />
            </div>
          </div>

          {/* User Bio Card */}
          <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-8 flex flex-col justify-between">
            <div>
              <h3 className="text-slate-400 font-mono text-xs uppercase tracking-widest mb-4">Bio-Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400">Weight</span>
                  <span className="font-mono">{user.weight_kg} kg</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400">Height</span>
                  <span className="font-mono">{user.height_cm} cm</span>
                </div>
                {/* Health Goal Display */}
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400">Goal</span>
                  <span className="font-mono capitalize text-cyan-400 text-right text-xs">
                    {user.goal.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
            <Link href={`/profile`} className="mt-6 text-xs text-center text-slate-500 hover:text-white transition uppercase tracking-widest border border-white/5 py-3 rounded-lg hover:bg-white/5">
              Update Stats
            </Link>
          </div>
        </div>

        {/* AI Generator Section */}
        <section>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-2 h-6 bg-cyan-500 rounded-sm"></span>
            AI Protocol Generators
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <GeneratorCard
              title="Nutrition Protocol"
              desc="Generate a full day meal plan based on your caloric needs."
              icon="🥗"
              loading={generating === 'meals'}
              onClick={() => generatePlan('meals')}
              buttonText="Generate Meals"
              color="emerald"
            />
            <GeneratorCard
              title="Training Protocol"
              desc="Create a targeted workout routine adapted to your goal."
              icon="💪"
              loading={generating === 'workouts'}
              onClick={() => generatePlan('workouts')}
              buttonText="Generate Workout"
              color="orange"
            />
          </div>
        </section>

      </div>
    </div>
  )
}

function MacroItem({ label, amount, color }: { label: string, amount: number, color: string }) {
  return (
    <div className="bg-slate-950/50 rounded-xl p-4 border border-white/5">
      <div className={`w-2 h-2 rounded-full ${color} mb-2`}></div>
      <div className="text-2xl font-bold text-white">{amount}g</div>
      <div className="text-xs text-slate-500 uppercase font-mono">{label}</div>
    </div>
  )
}

function GeneratorCard({ title, desc, icon, loading, onClick, buttonText, color }: any) {
  const isEmerald = color === 'emerald'
  return (
    <div className="group relative p-8 bg-slate-900 border border-white/10 rounded-3xl overflow-hidden transition-all hover:border-white/20">
      <div className={`absolute top-0 left-0 w-1 h-full ${isEmerald ? 'bg-emerald-500' : 'bg-orange-500'} opacity-50 group-hover:opacity-100 transition-all`}></div>
      <div className="relative z-10">
        <div className="text-4xl mb-4">{icon}</div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed h-10">{desc}</p>
        <button
          onClick={onClick}
          disabled={loading}
          className={`w-full py-4 rounded-xl font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2
            ${isEmerald
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-black'
              : 'bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500 hover:text-black'}
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {loading ? <span className="animate-pulse">PROCESSING...</span> : <>{buttonText} <span className="text-lg">→</span></>}
        </button>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-slate-950 p-6 flex items-center justify-center">
      <div className="space-y-4 w-full max-w-lg">
        <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
          <div className="h-full bg-cyan-500/50 animate-[shimmer_2s_infinite] w-1/2"></div>
        </div>
      </div>
    </div>
  )
}