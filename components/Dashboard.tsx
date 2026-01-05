'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

interface Workout {
  id: number
  user_id: number
  date: string
  workout_type: string
  exercises: string
  completed: boolean
  created_at: string
}

interface Meal {
  id: number
  user_id: number
  date: string
  meal_type: string
  food: string
  completed: boolean
  created_at: string
}

export default function Dashboard() {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [meals, setMeals] = useState<Meal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // For demo purposes, using a hardcoded user ID
  // In a real app, this would come from authentication
  const userId = 1

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    setError(null)

    try {
      const today = new Date().toISOString().split('T')[0]

      // Fetch today's workouts
      const workoutsResponse = await fetch(`/api/workouts?user_id=${userId}&date=${today}`)
      const workoutsResult = await workoutsResponse.json()

      if (workoutsResult.success) {
        setWorkouts(workoutsResult.data)
      }

      // Fetch today's meals
      const mealsResponse = await fetch(`/api/meals?user_id=${userId}&date=${today}`)
      const mealsResult = await mealsResponse.json()

      if (mealsResult.success) {
        setMeals(mealsResult.data)
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const todaysWorkouts = workouts.filter(w => !w.completed)
  const todaysMeals = meals.filter(m => !m.completed)
  const completedWorkouts = workouts.filter(w => w.completed).length
  const completedMeals = meals.filter(m => m.completed).length

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-gray-900">FitDay AI</Link>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/profile" className="text-gray-700 hover:text-indigo-600 transition-colors">Profile</Link>
              <Link href="/checklist" className="text-gray-700 hover:text-indigo-600 transition-colors">Checklist</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Good morning!
          </h1>
          <p className="text-gray-600">Ready to crush your fitness goals today?</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Today's Workout</h3>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ) : todaysWorkouts.length > 0 ? (
              <div className="mb-4">
                <p className="text-gray-600 mb-1">{todaysWorkouts[0].workout_type}</p>
                <p className="text-sm text-gray-500">{todaysWorkouts.length} workout{todaysWorkouts.length > 1 ? 's' : ''} remaining</p>
              </div>
            ) : (
              <p className="text-gray-600 mb-4">No workouts scheduled for today</p>
            )}
            <Link
              href="/workout"
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              {todaysWorkouts.length > 0 ? 'Continue Workout' : 'Start Workout'} →
            </Link>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Meal Plan</h3>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ) : todaysMeals.length > 0 ? (
              <div className="mb-4">
                <p className="text-gray-600 mb-1">{todaysMeals.length} meal{todaysMeals.length > 1 ? 's' : ''} planned</p>
                <p className="text-sm text-gray-500">{completedMeals} completed today</p>
              </div>
            ) : (
              <p className="text-gray-600 mb-4">No meals planned for today</p>
            )}
            <Link
              href="/diet"
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View Plan →
            </Link>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Progress</h3>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ) : (
              <div className="mb-4">
                <p className="text-gray-600 mb-1">{completedWorkouts} workout{completedWorkouts !== 1 ? 's' : ''} completed</p>
                <p className="text-sm text-gray-500">{completedMeals} meal{completedMeals !== 1 ? 's' : ''} logged</p>
              </div>
            )}
            <Link
              href="/progress"
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View Progress →
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}