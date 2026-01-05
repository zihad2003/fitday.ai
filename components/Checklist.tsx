'use client'

import { useState, useEffect } from 'react'

interface Task {
  id: string
  name: string
  time: string
  completed: boolean
  canComplete: boolean
}

export default function Checklist() {
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    const mockTasks: Task[] = [
      { id: '1', name: 'Drink 8 glasses of water', time: '08:00', completed: false, canComplete: true },
      { id: '2', name: 'Morning workout', time: '09:00', completed: false, canComplete: true },
      { id: '3', name: 'Healthy breakfast', time: '09:30', completed: false, canComplete: true },
      { id: '4', name: 'Lunch break', time: '13:00', completed: false, canComplete: false },
      { id: '5', name: 'Evening walk', time: '18:00', completed: false, canComplete: false },
      { id: '6', name: 'Dinner', time: '19:00', completed: false, canComplete: false },
      { id: '7', name: 'Sleep by 10 PM', time: '22:00', completed: false, canComplete: false },
    ]
    setTasks(mockTasks)
  }, [])

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ))
  }

  const completedTasks = tasks.filter(task => task.completed).length
  const totalTasks = tasks.length
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Daily Checklist</h2>

          <div className="bg-white shadow rounded-lg p-4 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Progress</h3>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">{completedTasks} of {totalTasks} tasks completed</p>
          </div>

          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task.id} className="bg-white shadow rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-lg font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {task.name}
                    </h3>
                    <p className="text-gray-600">Scheduled for {task.time}</p>
                    {!task.canComplete && (
                      <p className="text-sm text-orange-600">Available at scheduled time</p>
                    )}
                  </div>
                  <button
                    onClick={() => toggleTask(task.id)}
                    disabled={!task.canComplete}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      task.completed
                        ? 'bg-green-100 text-green-800'
                        : task.canComplete
                        ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {task.completed ? 'Completed' : 'Mark Complete'}
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