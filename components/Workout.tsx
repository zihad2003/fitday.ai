'use client'

import { useState, useEffect } from 'react'

interface Exercise {
  id: string
  name: string
  sets: number
  reps: number
  completed: boolean
}

interface Workout {
  id: string
  name: string
  duration: number
  exercises: Exercise[]
}

export default function Workout() {
  const [workout, setWorkout] = useState<Workout | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getWorkout = async () => {
      // For now, use mock data. In real app, fetch from D1 API
      const mockWorkout: Workout = {
        id: '1',
        name: 'Chest Day',
        duration: 45,
        exercises: [
          { id: '1', name: 'Bench Press', sets: 3, reps: 10, completed: false },
          { id: '2', name: 'Push-ups', sets: 3, reps: 15, completed: false },
          { id: '3', name: 'Chest Flyes', sets: 3, reps: 12, completed: false },
        ]
      }
      setWorkout(mockWorkout)
      setLoading(false)
    }
    getWorkout()
  }, [])

  const toggleExercise = (exerciseId: string) => {
    if (!workout) return
    setWorkout({
      ...workout,
      exercises: workout.exercises.map(ex =>
        ex.id === exerciseId ? { ...ex, completed: !ex.completed } : ex
      )
    })
  }

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>

  if (!workout) return <div>No workout available</div>

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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{workout.name}</h2>
          <p className="text-gray-600 mb-6">Duration: {workout.duration} minutes</p>

          <div className="space-y-4">
            {workout.exercises.map((exercise) => (
              <div key={exercise.id} className="bg-white shadow rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-lg font-medium ${exercise.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {exercise.name}
                    </h3>
                    <p className="text-gray-600">{exercise.sets} sets × {exercise.reps} reps</p>
                  </div>
                  <button
                    onClick={() => toggleExercise(exercise.id)}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      exercise.completed
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {exercise.completed ? 'Completed' : 'Mark Complete'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700">
              Finish Workout
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}