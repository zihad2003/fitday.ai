'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getUserSession } from '@/lib/auth'

// --- 1. TYPES ---
type Exercise = {
  id: string
  name: string
  sets: number
  reps: string
  rest: string
  tags: string[]
  gif_url: string
}

type DayPlan = {
  day: string
  focus: string
  exercises: Exercise[]
}

type UserProfile = {
  goal: 'lose_weight' | 'gain_muscle' | 'maintain'
  name: string
}

// FIX: Define the API Response structure
type ApiResponse<T> = {
  success: boolean
  data: T
  error?: string
}

// --- 2. WORKOUT TEMPLATES ---
const WORKOUT_TEMPLATES: Record<string, DayPlan[]> = {
  gain_muscle: [
    {
day: 'Monday', focus: 'Push (Chest/Triceps)', exercises: [
        { id: '1', name: 'Barbell Bench Press', sets: 4, reps: '8-12', rest: '90s', tags: ['Chest', 'Compound'], gif_url: 'https://i.imgur.com/8Xqy7sD.gif' },
        { id: '2', name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', rest: '60s', tags: ['Upper Chest'], gif_url: 'https://i.imgur.com/7Wx3R9m.gif' },
        { id: '3', name: 'Tricep Rope Pushdown', sets: 3, reps: '12-15', rest: '45s', tags: ['Triceps'], gif_url: 'https://i.imgur.com/8Xz7P9w.gif' },
        { id: '4', name: 'Lateral Raises', sets: 4, reps: '15-20', rest: '45s', tags: ['Shoulders'], gif_url: 'https://i.imgur.com/7Xz0Y9f.gif' }
      ]
    },
    {
day: 'Tuesday', focus: 'Pull (Back/Biceps)', exercises: [
        { id: '5', name: 'Deadlift', sets: 3, reps: '5-8', rest: '120s', tags: ['Back', 'Strength'], gif_url: 'https://i.imgur.com/8Zx6K9r.gif' },
        { id: '6', name: 'Lat Pulldown', sets: 3, reps: '10-12', rest: '60s', tags: ['Lats'], gif_url: 'https://i.imgur.com/7Xu8M9t.gif' },
        { id: '7', name: 'Barbell Curls', sets: 3, reps: '10-12', rest: '60s', tags: ['Biceps'], gif_url: 'https://i.imgur.com/7Xz7F9m.gif' }
      ]
    },
    { day: 'Wednesday', focus: 'Active Recovery', exercises: [] },
    { 
day: 'Thursday', focus: 'Legs (Quad Focus)', exercises: [
        { id: '8', name: 'Barbell Squat', sets: 4, reps: '6-10', rest: '120s', tags: ['Legs', 'Compound'], gif_url: 'https://i.imgur.com/7Xz7Z9h.gif' },
        { id: '9', name: 'Leg Extension', sets: 3, reps: '12-15', rest: '60s', tags: ['Quads'], gif_url: 'https://i.imgur.com/7Xz5H9p.gif' }
      ]
    },
    { day: 'Friday', focus: 'Upper Body Pump', exercises: [] },
    { day: 'Saturday', focus: 'Cardio & Abs', exercises: [] },
    { day: 'Sunday', focus: 'Rest', exercises: [] },
  ],
  lose_weight: [
    {
day: 'Monday', focus: 'HIIT Circuit', exercises: [
        { id: '10', name: 'Burpees', sets: 4, reps: '45 sec', rest: '15s', tags: ['Cardio', 'Full Body'], gif_url: 'https://i.imgur.com/7Xz7D9l.gif' },
        { id: '11', name: 'Mountain Climbers', sets: 4, reps: '45 sec', rest: '15s', tags: ['Core'], gif_url: 'https://i.imgur.com/8Xz9V9d.gif' },
        { id: '12', name: 'Jump Squats', sets: 4, reps: '30 sec', rest: '30s', tags: ['Legs', 'Plyo'], gif_url: 'https://i.imgur.com/6Xz4E9m.gif' }
      ]
    },
    { day: 'Tuesday', focus: 'LISS Cardio', exercises: [] },
    { day: 'Wednesday', focus: 'Full Body Strength', exercises: [] },
    { day: 'Thursday', focus: 'HIIT Circuit B', exercises: [] },
    { day: 'Friday', focus: 'Active Recovery', exercises: [] },
    { day: 'Saturday', focus: 'Long Run/Walk', exercises: [] },
    { day: 'Sunday', focus: 'Rest', exercises: [] },
  ],
  maintain: [
    { day: 'Monday', focus: 'Full Body A', exercises: [] },
    { day: 'Tuesday', focus: 'Rest', exercises: [] },
    { day: 'Wednesday', focus: 'Full Body B', exercises: [] },
    { day: 'Thursday', focus: 'Rest', exercises: [] },
    { day: 'Friday', focus: 'Full Body C', exercises: [] },
    { day: 'Saturday', focus: 'Mobility', exercises: [] },
    { day: 'Sunday', focus: 'Rest', exercises: [] },
  ]
}

export default function WorkoutPage() {
  const router = useRouter()
  // Define State Variables
  const [activeTab, setActiveTab] = useState(0)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

// --- 3. FETCH DATA ---
  useEffect(() => {
    // Check authentication first
    const session = getUserSession()
    if (!session) {
      router.push('/login')
      return
    }
    
    // Define async function inside useEffect
    const fetchUserAndWorkouts = async () => {
      if (!session.id) return
      
      try {
        // Fetch user profile
        const userRes = await fetch(`/api/users/${session.id}`)
        const userJson = (await userRes.json()) as ApiResponse<UserProfile>
        
        if (userJson.success) {
          setUserProfile(userJson.data)
        }

        // Fetch workout plans for today
        const today = new Date().toISOString().split('T')[0]
        const workoutRes = await fetch(`/api/workout-plans?user_id=${session.id}&date=${today}`)
        const workoutJson = (await workoutRes.json()) as any
        
        if (workoutJson.success && workoutJson.data.length > 0) {
          // Transform workout plan data to exercise format
          const transformedExercises = workoutJson.data.map((item: any, index: number) => ({
            id: item.id.toString(),
            name: item.exercise_name || item.name,
            sets: item.sets,
            reps: item.reps,
            rest: '60s', // Default rest time
            tags: [item.muscle_group],
            gif_url: item.gif_url || ''
          }))

          // Update current plan with real data
          if (userProfile && currentPlan[activeTab]) {
            const updatedPlan = [...currentPlan]
            updatedPlan[activeTab] = {
              ...updatedPlan[activeTab],
              exercises: transformedExercises
            }
          }
        }
        
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchUserAndWorkouts()
  }, [router])

  // Logic to select plan based on user profile
  const currentPlan = userProfile 
    ? (WORKOUT_TEMPLATES[userProfile.goal] || WORKOUT_TEMPLATES['maintain'])
    : WORKOUT_TEMPLATES['maintain']

  const activeDay = currentPlan[activeTab]

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500 animate-pulse">Calibrating Routine...</div>

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans pb-20 selection:bg-orange-500/30">
      
      {/* Navbar */}
      <div className="border-b border-white/5 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="text-sm font-mono text-slate-400 hover:text-white transition flex items-center gap-2">
            ← DASHBOARD
          </Link>
          <div className="font-mono text-xs text-orange-500 tracking-widest uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
            Training Mode
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 pt-10">
        
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-black text-white mb-2 uppercase italic">
            {userProfile?.goal.replace('_', ' ')} <span className="text-orange-500">PROTOCOL</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-lg">
            This weekly schedule is algorithmically adapted to your physiology. 
            Focus on form over weight.
          </p>
        </div>

        {/* Week Navigator */}
        <div className="flex gap-2 overflow-x-auto pb-6 mb-4 no-scrollbar">
          {currentPlan.map((day, index) => {
            const isActive = index === activeTab
            return (
              <button
                key={day.day}
                onClick={() => setActiveTab(index)}
                className={`flex-shrink-0 px-6 py-4 rounded-2xl border transition-all duration-300 relative overflow-hidden group ${
                  isActive 
                    ? 'bg-orange-600 border-orange-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.4)]' 
                    : 'bg-slate-900 border-white/10 text-slate-500 hover:border-orange-500/50 hover:text-slate-300'
                }`}
              >
                <div className="text-xs font-mono uppercase mb-1 opacity-70">Day {index + 1}</div>
                <div className="font-bold text-lg">{day.day.substring(0, 3)}</div>
                {isActive && <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>}
              </button>
            )
          })}
        </div>

        {/* Active Day View */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 key={activeTab}">
          
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">{activeDay.focus}</h2>
            <div className="text-xs font-mono text-slate-500 bg-white/5 px-3 py-1 rounded-full">
              {activeDay.exercises.length} Exercises
            </div>
          </div>

          {activeDay.exercises.length === 0 ? (
            <div className="bg-slate-900/50 border border-dashed border-white/10 rounded-3xl p-12 text-center">
              <div className="text-6xl mb-4">💤</div>
              <h3 className="text-xl font-bold text-white mb-2">Active Recovery</h3>
              <p className="text-slate-400 text-sm max-w-xs mx-auto">
                Your muscles grow while you rest. Focus on hydration, stretching, and hitting your protein goals today.
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {activeDay.exercises.map((exercise, i) => (
                <div key={exercise.id} className="bg-slate-900 border border-white/10 rounded-3xl p-6 md:p-8 hover:border-orange-500/30 transition duration-300 group">
                  <div className="flex flex-col md:flex-row gap-8">
                    
{/* Visual Area */}
                     <div className="w-full md:w-1/3 aspect-video bg-black rounded-xl overflow-hidden relative border border-white/5">
                       {exercise.gif_url ? (
                         <img 
                           src={exercise.gif_url} 
                           alt={exercise.name}
                           className="w-full h-full object-cover"
                           onError={(e) => {
                             e.currentTarget.style.display = 'none';
                             e.currentTarget.parentElement?.classList.add('bg-slate-950');
                           }}
                         />
                       ) : (
                         <div className="absolute inset-0 flex items-center justify-center text-slate-700 bg-slate-950">
                           <div className="flex flex-col items-center gap-2">
                             <span className="text-3xl opacity-50">▶</span>
                             <span className="text-[10px] font-mono uppercase">Visual Reference</span>
                           </div>
                         </div>
                       )}
                      
                      <div className="absolute bottom-2 left-2 flex gap-1">
                        {exercise.tags.map(tag => (
                          <span key={tag} className="text-[10px] bg-black/80 text-white px-2 py-0.5 rounded border border-white/10 backdrop-blur-md">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-3 items-center">
                           <span className="text-3xl font-black text-white/10 group-hover:text-orange-500/20 transition-colors">0{i + 1}</span>
                           <h3 className="text-xl font-bold text-white">{exercise.name}</h3>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <StatBox label="Sets" value={exercise.sets} />
                        <StatBox label="Reps" value={exercise.reps} />
                        <StatBox label="Rest" value={exercise.rest} />
                      </div>

                      <button className="w-full py-3 bg-white/5 hover:bg-orange-500 hover:text-black border border-white/10 hover:border-orange-500 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2">
                        <span>Log Set Performance</span>
                        <span className="text-lg">→</span>
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  )
}

function StatBox({ label, value }: { label: string, value: string | number }) {
  return (
    <div className="bg-black/20 border border-white/5 rounded-lg p-3 text-center">
      <div className="text-[10px] text-slate-500 uppercase font-mono mb-1">{label}</div>
      <div className="font-bold text-white text-lg">{value}</div>
    </div>
  )
}