// components/Dashboard.tsx - Medical-Grade Health Overview
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getUserSession, logoutUser } from '@/lib/auth'

export default function Dashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  
  const [stats, setStats] = useState({
    targetCalories: 2000,
    consumedCalories: 0,
    workoutsCompleted: 0,
    totalWorkouts: 0,
    // Macros (Gram)
    protein: 0,
    carbs: 0,
    fat: 0
  })

  // পেজ লোড হওয়ার সাথে সাথে ডাটা আনা
  useEffect(() => {
    const user = getUserSession()
    
    if (!user) {
      router.push('/login') // লগইন না থাকলে বের করে দেবে
      return
    }

    setUserName(user.name)
    loadDashboardData(user.id, user.target_calories || 2000)
  }, [])

  const loadDashboardData = async (userId: number, targetCal: number) => {
    try {
      const today = new Date().toISOString().split('T')[0]

      // ১. ডায়েট ডাটা আনা
      const mealRes = await fetch(`/api/meals?user_id=${userId}&date=${today}`)
      const mealData = await mealRes.json()

      let consumed = 0
      if (mealData.success) {
        // শুধু 'completed' মিলগুলোর ক্যালোরি যোগ হবে
        consumed = mealData.data
          .filter((m: any) => m.completed)
          .reduce((sum: number, m: any) => sum + m.calories, 0)
      }

      // ২. ওয়ার্কআউট ডাটা আনা
      const workoutRes = await fetch(`/api/workouts?user_id=${userId}&date=${today}`)
      const workoutData = await workoutRes.json()
      
      let wCompleted = 0
      let wTotal = 0
      if (workoutData.success) {
        wTotal = workoutData.data.length
        wCompleted = workoutData.data.filter((w: any) => w.completed).length
      }

      // ৩. ম্যাক্রো হিসাব (আনুমানিক অনুপাত অনুযায়ী)
      // ১ গ্রাম প্রোটিন/কার্ব = ৪ ক্যালোরি, ১ গ্রাম ফ্যাট = ৯ ক্যালোরি
      // অনুপাত: প্রোটিন ২৫%, কার্ব ৫০%, ফ্যাট ২৫% (ব্যালেন্সড ডায়েট)
      const pGram = Math.round((consumed * 0.25) / 4)
      const cGram = Math.round((consumed * 0.50) / 4)
      const fGram = Math.round((consumed * 0.25) / 9)

      setStats({
        targetCalories: targetCal,
        consumedCalories: consumed,
        workoutsCompleted: wCompleted,
        totalWorkouts: wTotal,
        protein: pGram,
        carbs: cGram,
        fat: fGram
      })

    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  // প্রোগ্রেস পার্সেন্টেজ হিসাব
  const calorieProgress = Math.min(100, Math.round((stats.consumedCalories / stats.targetCalories) * 100))
  const remainingCalories = Math.max(0, stats.targetCalories - stats.consumedCalories)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-6 pb-20 space-y-8">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Hello, {userName} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">Here is your daily health report.</p>
        </div>
        <button 
          onClick={logoutUser}
          className="px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition"
        >
          Logout
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        
        {/* 1. Calorie Circle Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
          <h3 className="text-gray-500 font-medium text-sm mb-4">Daily Calories</h3>
          
          <div className="relative w-40 h-40 flex items-center justify-center">
            {/* Circular Background */}
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-100" />
              <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" 
                strokeDasharray={440}
                strokeDashoffset={440 - (440 * calorieProgress) / 100}
                className={`text-blue-600 transition-all duration-1000 ease-out`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-3xl font-bold text-gray-800">{stats.consumedCalories}</span>
              <p className="text-xs text-gray-400">of {stats.targetCalories}</p>
            </div>
          </div>
          
          <p className="mt-4 text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            {remainingCalories} kcal remaining
          </p>
        </div>

        {/* 2. Macros Breakdown */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-6">
            <span className="p-2 bg-green-100 text-green-600 rounded-lg text-xl">🥗</span>
            <h3 className="font-bold text-gray-800">Nutrients Consumed</h3>
          </div>

          <div className="space-y-5">
            {/* Protein */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-600">Protein</span>
                <span className="font-bold text-gray-800">{stats.protein}g</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.min(100, (stats.protein / 150) * 100)}%` }}></div>
              </div>
            </div>

            {/* Carbs */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-600">Carbs (Rice/Ruti)</span>
                <span className="font-bold text-gray-800">{stats.carbs}g</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${Math.min(100, (stats.carbs / 300) * 100)}%` }}></div>
              </div>
            </div>

            {/* Fat */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-600">Fats</span>
                <span className="font-bold text-gray-800">{stats.fat}g</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-red-400 rounded-full" style={{ width: `${Math.min(100, (stats.fat / 80) * 100)}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Workout Status */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl shadow-lg text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-0 top-0 p-4 opacity-10 text-9xl transform translate-x-4 -translate-y-4">💪</div>
          
          <div>
            <h3 className="text-lg font-bold mb-1">Workout Tracker</h3>
            <p className="text-gray-400 text-sm">Today's Activity</p>
          </div>

          <div className="mt-6">
            <div className="flex items-end gap-2">
              <h2 className="text-5xl font-bold">{stats.workoutsCompleted}</h2>
              <span className="text-xl text-gray-400 mb-2">/ {stats.totalWorkouts || 4}</span>
            </div>
            <p className="mt-2 text-sm text-gray-400">Exercises completed</p>
          </div>

          <Link href="/workout" className="mt-6 w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-center font-semibold transition backdrop-blur-sm">
            {stats.workoutsCompleted === 0 ? 'Start Workout' : 'Continue Training'}
          </Link>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <h2 className="text-lg font-bold text-gray-800 mt-4">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/diet" className="group p-5 bg-blue-50 hover:bg-blue-100 rounded-xl transition border border-blue-100">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl mb-3 shadow-sm group-hover:scale-110 transition">🥗</div>
          <h3 className="font-bold text-gray-800">Diet Plan</h3>
          <p className="text-xs text-gray-500 mt-1">Log your meals</p>
        </Link>

        <Link href="/workout" className="group p-5 bg-orange-50 hover:bg-orange-100 rounded-xl transition border border-orange-100">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl mb-3 shadow-sm group-hover:scale-110 transition">🏋️‍♂️</div>
          <h3 className="font-bold text-gray-800">Workout</h3>
          <p className="text-xs text-gray-500 mt-1">View routine</p>
        </Link>

        <Link href="/profile" className="group p-5 bg-purple-50 hover:bg-purple-100 rounded-xl transition border border-purple-100">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl mb-3 shadow-sm group-hover:scale-110 transition">⚙️</div>
          <h3 className="font-bold text-gray-800">Settings</h3>
          <p className="text-xs text-gray-500 mt-1">Update goals</p>
        </Link>

        <div className="p-5 bg-gray-50 rounded-xl border border-gray-100 opacity-60 cursor-not-allowed">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl mb-3 shadow-sm">📊</div>
          <h3 className="font-bold text-gray-800">Reports</h3>
          <p className="text-xs text-gray-500 mt-1">Coming soon</p>
        </div>
      </div>
    </div>
  )
}