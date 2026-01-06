// app/page.tsx - Professional Landing Page
'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getUserSession } from '@/lib/auth'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // চেক করা ইউজার লগইন আছে কিনা
    const session = getUserSession()
    if (session) {
      setUser(session)
    }
  }, [])

  return (
    <div className="min-h-screen bg-white">
      
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            FitDay.ai
          </div>
          <div className="flex gap-4">
            {user ? (
              <Link href="/dashboard" className="px-5 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="px-5 py-2 text-gray-600 hover:text-blue-600 font-medium transition">
                  Login
                </Link>
                <Link href="/register" className="px-5 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-50 rounded-full blur-3xl -z-10 opacity-50"></div>
        
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-block px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold mb-6 border border-blue-100">
            🇧🇩 The First AI Health App for Bangladesh
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight mb-6">
            Your Personal <br/>
            <span className="text-blue-600">AI Nutritionist</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            No more guessing calories. Get a medical-grade diet plan customized for 
            <strong> Bengali food habits</strong>, body type, and fitness goals.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register" className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-xl shadow-blue-200 hover:-translate-y-1">
              Create Free Plan
            </Link>
            <Link href="#features" className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold text-lg hover:bg-gray-50 transition hover:-translate-y-1">
              How it Works
            </Link>
          </div>

          <div className="mt-12 flex justify-center gap-8 text-gray-400 grayscale opacity-60">
            <span className="font-semibold">Scientifically Verified</span> • 
            <span className="font-semibold">Local Food Database</span> • 
            <span className="font-semibold">Privacy Focused</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl mb-6">🥗</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Bangladeshi Diet</h3>
              <p className="text-gray-600">
                We don't suggest avocado or salmon. Our AI builds plans with Rice, Dal, Fish, and Ruti that you eat every day.
              </p>
            </div>
            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl mb-6">🩺</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Medical Logic</h3>
              <p className="text-gray-600">
                Calculations based on the Mifflin-St Jeor equation tailored for South Asian metabolism and genetics.
              </p>
            </div>
            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl mb-6">💪</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Dynamic Workouts</h3>
              <p className="text-gray-600">
                Whether you want to lose belly fat or gain muscle, get a home-workout plan that adapts to your progress.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12 text-center">
        <p className="text-gray-500">© 2026 FitDay AI. Built for a healthier Bangladesh.</p>
      </footer>
    </div>
  )
}