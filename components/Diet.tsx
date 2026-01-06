// components/Diet.tsx - With Verification
'use client'

import { useState, useEffect } from 'react'
import { getUserSession } from '@/lib/auth'
import { useRouter } from 'next/navigation'

interface Meal {
  id: number
  meal_type: string
  food: string
  calories: number
  completed: boolean
}

export default function Diet() {
  const router = useRouter()
  const [meals, setMeals] = useState<Meal[]>([])
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  
  // কনফার্মেশন মডালের জন্য স্টেট
  const [confirmMeal, setConfirmMeal] = useState<Meal | null>(null)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    const user = getUserSession()
    if (!user) router.push('/login')
    else fetchMeals(user.id)
  }, [])

  const fetchMeals = async (uid: number) => {
    try {
      const res = await fetch(`/api/meals?user_id=${uid}&date=${today}`)
      const data = await res.json()

      if (data.success && data.data.length > 0) {
        setMeals(data.data)
        calculateProgress(data.data)
      } else {
        generatePlan(uid)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const generatePlan = async (uid: number) => {
    try {
      setLoading(true)
      const res = await fetch('/api/meals/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: uid, date: today })
      })
      const data = await res.json()
      if (data.success) {
        setMeals(data.plan)
        calculateProgress(data.plan)
      }
    } finally {
      setLoading(false)
    }
  }

  // ১. চেক বক্সে ক্লিক করলে এই ফাংশন কল হবে
  const handleCheckClick = (meal: Meal) => {
    // যদি অলরেডি কমপ্লিট করা থাকে, তাহলে আন-চেক করার জন্য কনফার্মেশন লাগবে না (বা চাইলে দিতে পারেন)
    if (meal.completed) {
      toggleMeal(meal.id, true) // সরাসরি আন-চেক
    } else {
      setConfirmMeal(meal) // পপ-আপ ওপেন হবে
    }
  }

  // ২. পপ-আপে "Yes" দিলে এই ফাংশন কল হবে
  const confirmToggle = async () => {
    if (confirmMeal) {
      await toggleMeal(confirmMeal.id, false)
      setConfirmMeal(null) // পপ-আপ বন্ধ
    }
  }

  const toggleMeal = async (id: number, currentStatus: boolean) => {
    const updatedMeals = meals.map(m => 
      m.id === id ? { ...m, completed: !currentStatus } : m
    )
    setMeals(updatedMeals)
    calculateProgress(updatedMeals)

    await fetch(`/api/meals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !currentStatus })
    })
  }

  const calculateProgress = (items: Meal[]) => {
    if (items.length === 0) return setProgress(0)
    const completedCount = items.filter(m => m.completed).length
    setProgress(Math.round((completedCount / items.length) * 100))
  }

  const groupedMeals = {
    breakfast: meals.filter(m => m.meal_type === 'breakfast'),
    lunch: meals.filter(m => m.meal_type === 'lunch'),
    snack: meals.filter(m => m.meal_type === 'snack'),
    dinner: meals.filter(m => m.meal_type === 'dinner'),
  }

  return (
    <div className="max-w-2xl mx-auto p-4 pb-24 relative">
      
      {/* Header & Progress (Same as before) */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-6 text-white shadow-lg mb-6">
        <h1 className="text-2xl font-bold mb-2">🥗 Daily Nutrition</h1>
        <div className="mt-4 bg-blue-800/30 rounded-full h-2">
          <div className="bg-white h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="text-right text-xs mt-2">{progress}% Completed</p>
      </div>

      {loading && <p className="text-center text-gray-500">Preparing your meal plan...</p>}

      <div className="space-y-6">
        {Object.entries(groupedMeals).map(([type, items]) => (
          items.length > 0 && (
            <div key={type} className="animate-fade-in">
              <h3 className="text-lg font-bold text-gray-800 capitalize mb-3 flex items-center gap-2">
                {type === 'breakfast' && '🍳'} {type === 'lunch' && '🍚'}
                {type === 'snack' && '🍎'} {type === 'dinner' && '🌙'} {type}
              </h3>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {items.map((meal) => (
                  <div key={meal.id} className={`p-4 border-b last:border-0 flex items-center gap-4 transition-colors ${meal.completed ? 'bg-gray-50' : 'bg-white'}`}>
                    
                    {/* Checkbox Trigger */}
                    <input 
                      type="checkbox"
                      checked={meal.completed}
                      onChange={() => handleCheckClick(meal)} 
                      className="w-6 h-6 accent-blue-600 cursor-pointer"
                    />
                    
                    <div className="flex-1">
                      <p className={`font-medium text-gray-800 ${meal.completed ? 'line-through text-gray-400' : ''}`}>
                        {meal.food}
                      </p>
                      <p className="text-xs text-blue-600 font-medium mt-1">🔥 {meal.calories} kcal</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        ))}
      </div>

      {/* --- CONFIRMATION MODAL --- */}
      {confirmMeal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl transform transition-all scale-100">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                🥣
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Did you eat this?</h3>
              <p className="text-gray-500 text-sm mb-6">
                You are marking <span className="font-semibold text-gray-800">"{confirmMeal.food}"</span> as consumed. Be honest for best results!
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setConfirmMeal(null)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition"
                >
                  No, Wait
                </button>
                <button 
                  onClick={confirmToggle}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-lg shadow-blue-200 transition"
                >
                  Yes, Ate it
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}