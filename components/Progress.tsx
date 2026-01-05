'use client'

import { useState, useEffect } from 'react'

interface ProgressData {
  date: string
  workouts: number
  meals: number
  weight: number
}

export default function Progress() {
  const [progressData, setProgressData] = useState<ProgressData[]>([])

  useEffect(() => {
    // Mock progress data
    const mockData: ProgressData[] = [
      { date: '2024-01-01', workouts: 1, meals: 3, weight: 75 },
      { date: '2024-01-02', workouts: 1, meals: 4, weight: 74.8 },
      { date: '2024-01-03', workouts: 0, meals: 3, weight: 74.6 },
      { date: '2024-01-04', workouts: 1, meals: 4, weight: 74.4 },
      { date: '2024-01-05', workouts: 1, meals: 4, weight: 74.2 },
      { date: '2024-01-06', workouts: 1, meals: 4, weight: 74.0 },
    ]
    setProgressData(mockData)
  }, [])

  const totalWorkouts = progressData.reduce((sum, day) => sum + day.workouts, 0)
  const totalMeals = progressData.reduce((sum, day) => sum + day.meals, 0)
  const avgMeals = progressData.length > 0 ? totalMeals / progressData.length : 0
  const weightLoss = progressData.length > 1 ? progressData[0].weight - progressData[progressData.length - 1].weight : 0

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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Progress Summary</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">W</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Workouts
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {totalWorkouts}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">M</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Avg Meals/Day
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {avgMeals.toFixed(1)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">L</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Weight Loss
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {weightLoss.toFixed(1)} kg
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Recent Activity
              </h3>
              <div className="space-y-4">
                {progressData.slice(-7).map((day, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{day.date}</p>
                      <p className="text-sm text-gray-500">
                        {day.workouts} workouts, {day.meals} meals
                      </p>
                    </div>
                    <div className="text-sm text-gray-900">
                      {day.weight} kg
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'FitDay AI Achievement',
                    text: `I've completed ${totalWorkouts} workouts and lost ${weightLoss.toFixed(1)} kg with FitDay AI!`,
                    url: window.location.href,
                  })
                } else {
                  // Fallback: copy to clipboard or show message
                  alert('Sharing not supported on this device')
                }
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Share Achievement
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}