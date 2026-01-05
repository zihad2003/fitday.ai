'use client'

import { useState, useEffect } from 'react'

interface Meal {
  id: string
  name: string
  calories: number
  type: string
  completed: boolean
}

export default function Diet() {
  const [meals, setMeals] = useState<Meal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getMeals = async () => {
      // Mock data for now
      const mockMeals: Meal[] = [
        { id: '1', name: 'Oatmeal with Berries', calories: 300, type: 'Breakfast', completed: false },
        { id: '2', name: 'Grilled Chicken Salad', calories: 400, type: 'Lunch', completed: false },
        { id: '3', name: 'Greek Yogurt', calories: 150, type: 'Snack', completed: false },
        { id: '4', name: 'Salmon with Vegetables', calories: 500, type: 'Dinner', completed: false },
      ]
      setMeals(mockMeals)
      setLoading(false)
    }
    getMeals()
  }, [])

  const toggleMeal = (mealId: string) => {
    setMeals(meals.map(meal =>
      meal.id === mealId ? { ...meal, completed: !meal.completed } : meal
    ))
  }

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>

  const completedMeals = meals.filter(meal => meal.completed).length
  const progress = meals.length > 0 ? (completedMeals / meals.length) * 100 : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">FitDay AI</h1>
              </div>
            </div>
            <div className="flex items-center">
              <a href="/dashboard" className="text-gray-700 hover:text-gray-900">Dashboard</a>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Today's Diet</h2>

          <div className="bg-white shadow rounded-lg p-4 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Progress</h3>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-green-600 h-2.5 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">{completedMeals} of {meals.length} meals completed</p>
          </div>

          <div className="space-y-4">
            {meals.map((meal) => (
              <div key={meal.id} className="bg-white shadow rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-lg font-medium ${meal.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {meal.name}
                    </h3>
                    <p className="text-gray-600">{meal.calories} calories • {meal.type}</p>
                  </div>
                  <button
                    onClick={() => toggleMeal(meal.id)}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      meal.completed
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {meal.completed ? 'Completed' : 'Mark Complete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}