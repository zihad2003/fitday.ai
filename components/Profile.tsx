// components/Profile.tsx - Fixed Crash Issue & Futuristic UI
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getUserSession, saveUserSession, logoutUser } from '@/lib/auth'

export default function Profile() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState({ message: '', type: '' })
  const [user, setUser] = useState<any>(null)

  // Height State
  const [feet, setFeet] = useState('')
  const [inches, setInches] = useState('')

  const [formData, setFormData] = useState({
    name: '', email: '', age: '', gender: 'male',
    weight: '', activity_level: 'sedentary', goal: 'lose_weight'
  })

  const [nutritionPlan, setNutritionPlan] = useState<any>(null)

  useEffect(() => {
    const session = getUserSession()
    if (session) {
      setUser(session)
      setFormData({
        name: session.name || '',
        email: session.email || '',
        age: session.age || '',
        gender: session.gender || 'male',
        weight: session.weight_kg || '',
        activity_level: session.activity_level || 'sedentary',
        goal: session.goal || 'lose_weight'
      })

      // CM to Feet/Inch Conversion
      if (session.height_cm) {
        const totalInches = session.height_cm / 2.54
        const ft = Math.floor(totalInches / 12)
        const inch = Math.round(totalInches % 12)
        setFeet(ft.toString())
        setInches(inch.toString())
      }
    } else {
      router.push('/login')
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setNotification({ message: '', type: '' })

    // 🔥 CRITICAL FIX: ডাটাবেস রিসেট হলে বা সেশন মিসম্যাচ হলে চেক করা
    if (!user || !user.id) {
      setNotification({ message: 'Session expired. Logging out...', type: 'error' })
      setTimeout(() => logoutUser(), 1500)
      return
    }

    setLoading(true)

    // Feet/Inch -> CM Calculation
    const ftVal = parseFloat(feet) || 0
    const inVal = parseFloat(inches) || 0
    const heightCm = (ftVal * 30.48) + (inVal * 2.54)

    try {
      const payload = {
        ...formData,
        height: Math.round(heightCm),
        age: Number(formData.age),
        weight: Number(formData.weight)
      }

      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      // যদি সার্ভার 404 বা 500 দেয় (রিসেট ডাটাবেসের কারণে)
      if (!res.ok) {
        throw new Error('User not found in database')
      }

      const data = await res.json()

      if (data.success) {
        setNotification({ message: 'System updated successfully!', type: 'success' })
        saveUserSession(data.data)
        if (data.new_plan) setNutritionPlan(data.new_plan)
      } else {
        setNotification({ message: data.error || 'Update failed', type: 'error' })
      }
    } catch (error) {
      // যদি ইউজার আইডি না পাওয়া যায়, ফোর্স লগআউট
      setNotification({ message: 'Database mismatch. Please login again.', type: 'error' })
      setTimeout(() => logoutUser(), 2000)
    } finally {
      setLoading(false)
    }
  }

  // Helper
  const handleInput = (key: string, val: string) => {
     if ((key === 'age' || key === 'weight') && (Number(val) < 0 || val.includes('-'))) return
     setFormData({ ...formData, [key]: val })
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="p-3 bg-blue-100 rounded-2xl text-2xl">⚙️</div>
        <div>
           <h2 className="text-2xl font-bold text-gray-800">System Configuration</h2>
           <p className="text-gray-500 text-sm">Update your biological metrics</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Side: Form */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden">
          {/* Background Decor */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

          {notification.message && (
            <div className={`p-4 mb-6 rounded-xl text-sm font-bold flex items-center gap-2 animate-fade-in ${
              notification.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
            }`}>
              {notification.type === 'success' ? '✅' : '⚠️'} {notification.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Full Name</label>
              <input type="text" required className="input-modern"
                value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Age</label>
                <input type="number" min="10" required className="input-modern"
                  value={formData.age} onChange={(e) => handleInput('age', e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Gender</label>
                <select className="input-modern"
                  value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Height</label>
                  <div className="flex gap-2">
                    <input type="number" placeholder="Ft" className="input-modern text-center"
                      value={feet} onChange={(e) => setFeet(e.target.value)}
                    />
                    <input type="number" placeholder="In" className="input-modern text-center"
                      value={inches} onChange={(e) => setInches(e.target.value)}
                    />
                  </div>
               </div>
               <div>
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Weight (kg)</label>
                  <input type="number" min="20" required className="input-modern"
                    value={formData.weight} onChange={(e) => handleInput('weight', e.target.value)}
                  />
               </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Activity</label>
                <select className="input-modern"
                  value={formData.activity_level} onChange={(e) => setFormData({...formData, activity_level: e.target.value})}
                >
                  <option value="sedentary">Sedentary (Office)</option>
                  <option value="light">Light Activity</option>
                  <option value="moderate">Moderate Exercise</option>
                  <option value="active">Very Active</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Goal</label>
                <select className="input-modern"
                  value={formData.goal} onChange={(e) => setFormData({...formData, goal: e.target.value})}
                >
                  <option value="lose_weight">Lose Weight</option>
                  <option value="maintain">Maintain Weight</option>
                  <option value="gain_muscle">Build Muscle</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-black transition shadow-lg flex justify-center items-center gap-2"
            >
              {loading ? <span className="animate-spin">⏳</span> : 'Update System'}
            </button>
          </form>
        </div>

        {/* Right Side: Live Report */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-blue-500 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10">
               <h3 className="font-bold opacity-80 mb-1">Target Calories</h3>
               <div className="text-4xl font-bold mb-4">
                 {nutritionPlan ? nutritionPlan.targetCalories : (user?.target_calories || '---')} 
                 <span className="text-lg font-normal opacity-70"> kcal</span>
               </div>
               <div className="h-1 bg-white/20 rounded-full w-full">
                 <div className="h-full bg-white rounded-full w-3/4"></div>
               </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4">Macro Breakdown</h3>
            {nutritionPlan ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-xl">
                   <span className="text-purple-700 font-medium">Protein</span>
                   <span className="font-bold text-gray-800">{nutritionPlan.proteinGrams}g</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-xl">
                   <span className="text-yellow-700 font-medium">Carbs</span>
                   <span className="font-bold text-gray-800">{nutritionPlan.carbGrams}g</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
                   <span className="text-red-700 font-medium">Fats</span>
                   <span className="font-bold text-gray-800">{nutritionPlan.fatGrams}g</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-sm text-center py-4">Save changes to calculate new macros.</p>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .input-modern {
          width: 100%;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          outline: none;
          background: #f8fafc;
          transition: all 0.2s;
          font-weight: 500;
          color: #1e293b;
        }
        .input-modern:focus {
          border-color: #3b82f6;
          background: white;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }
      `}</style>
    </div>
  )
}