// app/register/page.tsx - Futuristic & Secure Registration
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveUserSession } from '@/lib/auth'
import Link from 'next/link'
import ErrorPopup from '@/components/ErrorPopup'

export default function Register() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Password Visibility States
  const [showPass, setShowPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)

  // Height State
  const [heightFt, setHeightFt] = useState('')
  const [heightIn, setHeightIn] = useState('')

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', 
    age: '', gender: 'male', weight: '', activity_level: 'sedentary', goal: 'lose_weight'
  })

  // --- Logic Helpers ---
  const handleInput = (key: string, val: string) => {
    if ((key === 'age' || key === 'weight') && (val.includes('-') || Number(val) < 0)) return
    setFormData({ ...formData, [key]: val })
  }

  const handleHeight = (type: 'ft' | 'in', val: string) => {
    if (val.includes('-') || Number(val) < 0) return
    if (type === 'ft') setHeightFt(val)
    else setHeightIn(val)
  }

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // 1. Email Format Check
    if (!validateEmail(formData.email)) {
      setError("Invalid email format. Please check again.")
      setLoading(false)
      return
    }

    // 2. Password Match Check
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!")
      setLoading(false)
      return
    }

    // 3. Password Length Check
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.")
      setLoading(false)
      return
    }

    const ft = parseFloat(heightFt) || 0
    const inch = parseFloat(heightIn) || 0
    const totalCm = (ft * 30.48) + (inch * 2.54)

    if (totalCm <= 0 || Number(formData.age) <= 0 || Number(formData.weight) <= 0) {
        setError("Invalid body metrics. Please enter positive values.")
        setLoading(false)
        return
    }

    try {
      // confirmPassword ফিল্ডটি API-তে পাঠানোর দরকার নেই
      const { confirmPassword, ...apiData } = formData

      const payload = { 
        ...apiData, 
        height: Math.round(totalCm), 
        age: parseFloat(formData.age), 
        weight: parseFloat(formData.weight) 
      }

      const res = await fetch('/api/users', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload) 
      })

      const data = await res.json()
      
      if (data.success) {
        saveUserSession(data.data)
        router.push('/dashboard')
      } else {
        setError(data.error || 'Registration failed.')
      }
    } catch (err) {
      setError('Network error. Check connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-10 px-4 flex items-center justify-center bg-gray-50 relative overflow-hidden">
      
      {error && <ErrorPopup message={error} onClose={() => setError('')} />}

      {/* Background Effect */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      </div>

      <div className="bg-white/90 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl w-full max-w-3xl border border-white z-10 relative">
        <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">Create Account</h2>
        <p className="text-center text-gray-500 mb-8 text-sm">Start your medical-grade fitness journey</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Identity Section */}
          <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl border border-blue-100 shadow-sm">
            <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span> User Identity
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <input required placeholder="Full Name" className="input-modern" 
                value={formData.name} onChange={e => handleInput('name', e.target.value)} />
              
              <input required type="email" placeholder="Email Address" className="input-modern" 
                value={formData.email} onChange={e => handleInput('email', e.target.value)} />

              {/* Password with Eye Icon */}
              <div className="relative">
                <input required type={showPass ? "text" : "password"} placeholder="Password" className="input-modern w-full" 
                  value={formData.password} onChange={e => handleInput('password', e.target.value)} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3.5 text-gray-400 hover:text-blue-600">
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <input required type={showConfirmPass ? "text" : "password"} placeholder="Confirm Password" className={`input-modern w-full ${formData.confirmPassword && formData.password !== formData.confirmPassword ? 'border-red-300 bg-red-50' : ''}`}
                  value={formData.confirmPassword} onChange={e => handleInput('confirmPassword', e.target.value)} />
                 <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-3 top-3.5 text-gray-400 hover:text-blue-600">
                  {showConfirmPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
          </div>

          {/* Body Metrics Section */}
          <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-2xl border border-green-100 shadow-sm">
            <h3 className="text-xs font-bold text-green-600 uppercase tracking-widest mb-4 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-green-600"></span> Physical Stats
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <input type="number" min="1" placeholder="Age" className="input-modern" 
                value={formData.age} onChange={e => handleInput('age', e.target.value)} />
              
              <div className="relative">
                <select className="input-modern appearance-none w-full" value={formData.gender} onChange={e => handleInput('gender', e.target.value)}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                <span className="absolute right-3 top-3.5 text-gray-400 pointer-events-none">▼</span>
              </div>
              
              <div className="flex gap-2 col-span-2 bg-white rounded-xl border border-gray-200 p-1">
                <input placeholder="Ft" type="number" min="1" className="w-1/2 p-2 outline-none text-center border-r border-gray-100" 
                  value={heightFt} onChange={e => handleHeight('ft', e.target.value)} />
                <input placeholder="In" type="number" min="0" max="11" className="w-1/2 p-2 outline-none text-center" 
                  value={heightIn} onChange={e => handleHeight('in', e.target.value)} />
              </div>
              
              <input placeholder="Weight (kg)" type="number" min="1" className="input-modern col-span-2" 
                value={formData.weight} onChange={e => handleInput('weight', e.target.value)} />
            </div>
          </div>

          {/* Goals Section */}
          <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-2xl border border-purple-100 shadow-sm">
            <h3 className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-600"></span> Objectives
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative">
                <select className="input-modern appearance-none w-full" value={formData.activity_level} onChange={e => handleInput('activity_level', e.target.value)}>
                  <option value="sedentary">🏢 Sedentary (Office Job)</option>
                  <option value="light">🚶 Light Activity</option>
                  <option value="moderate">🏃 Moderate Exercise</option>
                  <option value="active">🏋️ Very Active</option>
                </select>
                <span className="absolute right-3 top-3.5 text-gray-400 pointer-events-none">▼</span>
              </div>
              
              <div className="relative">
                <select className="input-modern appearance-none w-full" value={formData.goal} onChange={e => handleInput('goal', e.target.value)}>
                  <option value="lose_weight">🔥 Lose Weight</option>
                  <option value="maintain">⚖️ Maintain Weight</option>
                  <option value="gain_muscle">💪 Build Muscle</option>
                </select>
                <span className="absolute right-3 top-3.5 text-gray-400 pointer-events-none">▼</span>
              </div>
            </div>
          </div>

          <button disabled={loading} className="w-full bg-gray-900 hover:bg-black text-white py-4 rounded-xl font-bold text-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2">
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : 'Initialize System'}
          </button>
        </form>
        
        <p className="text-center mt-6 text-sm text-gray-500">
          Already have an account? <Link href="/login" className="text-blue-600 font-bold hover:underline">Login System</Link>
        </p>
      </div>
      
      {/* CSS Injection for Modern Inputs */}
      <style jsx>{`
        .input-modern {
          width: 100%;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          outline: none;
          background: white;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          font-size: 0.95rem;
          color: #1e293b;
        }
        .input-modern:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
          transform: translateY(-1px);
        }
        .input-modern::placeholder {
          color: #94a3b8;
        }
      `}</style>
    </div>
  )
}