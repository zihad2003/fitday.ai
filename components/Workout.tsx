// components/Workout.tsx - With Motivation Verification
'use client'

import { useState, useEffect } from 'react'
import { getUserSession } from '@/lib/auth'
import { useRouter } from 'next/navigation'

interface WorkoutItem {
  id: number
  type: string
  completed: boolean
}

export default function Workout() {
  const router = useRouter()
  const [workouts, setWorkouts] = useState<WorkoutItem[]>([])
  const [loading, setLoading] = useState(false)
  
  // কনফার্মেশন স্টেট
  const [confirmWorkout, setConfirmWorkout] = useState<WorkoutItem | null>(null)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    const user = getUserSession()
    if (!user) router.push('/login')
    else fetchWorkouts(user.id)
  }, [])

  const fetchWorkouts = async (uid: number) => {
    try {
      const res = await fetch(`/api/workouts?user_id=${uid}&date=${today}`)
      const data = await res.json()
      if (data.success && data.data.length > 0) setWorkouts(data.data)
      else generateWorkout(uid)
    } catch (error) { console.error(error) }
  }

  const generateWorkout = async (uid: number) => {
    try {
      setLoading(true)
      const res = await fetch('/api/workouts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: uid, date: today })
      })
      const data = await res.json()
      if (data.success) fetchWorkouts(uid)
    } finally { setLoading(false) }
  }

  // ১. ক্লিক হ্যান্ডলার
  const handleWorkoutClick = (item: WorkoutItem) => {
    if (item.completed) {
      toggleWorkout(item.id, true) // আন-চেক
    } else {
      setConfirmWorkout(item) // পপ-আপ
    }
  }

  // ২. কনফার্মেশন হ্যান্ডলার
  const confirmToggle = async () => {
    if (confirmWorkout) {
      await toggleWorkout(confirmWorkout.id, false)
      setConfirmWorkout(null)
    }
  }

  const toggleWorkout = async (id: number, currentStatus: boolean) => {
    const updated = workouts.map(w => w.id === id ? { ...w, completed: !currentStatus } : w)
    setWorkouts(updated)

    await fetch(`/api/workouts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !currentStatus })
    })
  }

  return (
    <div className="max-w-2xl mx-auto p-4 relative">
      <div className="bg-orange-600 rounded-2xl p-8 text-white shadow-lg mb-8">
        <h1 className="text-3xl font-bold">💪 Today's Training</h1>
        <p className="opacity-90 mt-1">Push yourself, because no one else is going to do it for you.</p>
      </div>

      {loading && <p className="text-center text-gray-500">Building your routine...</p>}

      <div className="space-y-4">
        {workouts.map((item) => (
          <div 
            key={item.id}
            // পুরো কার্ডেই ক্লিক করলে কাজ করবে
            onClick={() => handleWorkoutClick(item)}
            className={`p-5 rounded-xl border flex items-center gap-4 transition-all cursor-pointer hover:shadow-md ${
              item.completed ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-100 shadow-sm'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
              item.completed ? 'bg-orange-500 border-orange-500 text-white' : 'border-gray-300'
            }`}>
              {item.completed && '✓'}
            </div>
            
            <div>
              <h3 className={`font-bold text-lg text-gray-800 ${item.completed ? 'line-through opacity-50' : ''}`}>
                {item.type}
              </h3>
              <p className="text-xs text-orange-600 font-medium">
                {item.completed ? 'Completed' : 'Tap to complete'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* --- MOTIVATION MODAL --- */}
      {confirmWorkout && (
        <div className="fixed inset-0 bg-orange-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-fade-in-up">
            <div className="text-center">
              <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                🔥
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Finished this set?</h3>
              <p className="text-gray-500 text-sm mb-6">
                Great job! Did you complete all reps of <br/>
                <span className="font-semibold text-gray-800">"{confirmWorkout.type}"</span>?
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setConfirmWorkout(null)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition"
                >
                  Not yet
                </button>
                <button 
                  onClick={confirmToggle}
                  className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 shadow-lg shadow-orange-200 transition"
                >
                  Yes, Crushed It!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}