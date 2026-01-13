'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { saveUserSession } from '@/lib/auth'

// --- 1. STRICT TYPES ---
interface RegisterResponse {
  success: boolean
  data?: any // In a real app, import the User type here
  error?: string
}

interface InputGroupProps {
  label: string
  name: string
  type: string
  placeholder: string
  value: string | number
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
}

export default function Register() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    gender: 'male',
    height: '',
    weight: '',
    activity_level: 'sedentary',
    goal: 'lose_weight'
  })

  // Handle Input Changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Submit Logic
  const handleRegister = async () => {
    setLoading(true)
    setError('')

    try {
      const payload = {
        ...formData,
        age: Number(formData.age),
        height: Number(formData.height),
        weight: Number(formData.weight)
      }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const content = await res.text()
      let data: RegisterResponse

      try {
        data = JSON.parse(content) as RegisterResponse
      } catch (e) {
        console.error('Invalid JSON response:', content)
        setError('Server Error: Invalid Response Format')
        setLoading(false)
        return
      }

      if (data.success) {
        if (data.data) {
          saveUserSession(data.data)
          router.push('/dashboard')
        }
      } else {
        setError(data.error || 'Registration failed')
        setLoading(false)
      }
    } catch (err) {
      console.error('Registration Fetch Error:', err)
      setError('System Error. Please check connection.')
      setLoading(false)
    }
  }

  // --- RENDER ---
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden px-4 font-sans">

      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] -z-10"></div>

      <div className="w-full max-w-lg">

        {/* Logo Section */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 relative group">
            <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-xl group-hover:bg-cyan-500/40 transition-all"></div>
            <img
              src="/logo.png"
              alt="FitDay Logo"
              className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_10px_rgba(6,182,212,0.4)]"
              style={{ mixBlendMode: 'screen' }}
            />
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-between mb-8 px-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${step >= s ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'bg-white/10 text-slate-500'
                }`}>
                {s}
              </div>
              <div className={`h-1 w-12 rounded-full transition-all duration-500 ${step > s ? 'bg-cyan-500' : 'bg-white/10'
                }`}></div>
            </div>
          ))}
        </div>

        {/* Main Glass Panel */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative overflow-hidden">

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white tracking-tight uppercase">
              {step === 1 && "Start Integration"}
              {step === 2 && "Physical Baseline"}
              {step === 3 && "Protocol Target"}
            </h2>
            <p className="text-slate-500 text-xs mt-1 font-mono tracking-widest uppercase">
              {step === 1 && "Identity Authentication"}
              {step === 2 && "Metric Calibration"}
              {step === 3 && "Engine Goal Alignment"}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-mono">
              [CRITICAL_FAILURE] {error}
            </div>
          )}

          {/* STEP 1: IDENTITY */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-300">
              <InputGroup label="Full Name" name="name" type="text" placeholder="John Doe" value={formData.name} onChange={handleChange} />
              <InputGroup label="Email Address" name="email" type="email" placeholder="john@example.com" value={formData.email} onChange={handleChange} />
              <InputGroup label="Password" name="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} />

              <button onClick={() => setStep(2)} className="w-full mt-4 bg-cyan-900/40 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-100 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-lg">
                Proceed to Calibration <span className="text-lg">→</span>
              </button>
            </div>
          )}

          {/* STEP 2: PHYSIOLOGY */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-300">
              <div className="grid grid-cols-2 gap-4">
                <InputGroup label="Age" name="age" type="number" placeholder="25" value={formData.age} onChange={handleChange} />
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-cyan-500/60 uppercase tracking-[0.2em] ml-1">Gender</label>
                  <div className="relative">
                    <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-4 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-cyan-500 text-white appearance-none transition-all pr-10 cursor-pointer hover:bg-white/10 select-aesthetic">
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-cyan-500">
                      ▼
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InputGroup label="Height (cm)" name="height" type="number" placeholder="175" value={formData.height} onChange={handleChange} />
                <InputGroup label="Weight (kg)" name="weight" type="number" placeholder="70" value={formData.weight} onChange={handleChange} />
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)} className="flex-1 py-3 text-slate-500 hover:text-white transition font-mono text-xs tracking-widest uppercase">Recall</button>
                <button onClick={() => setStep(3)} className="flex-[2] bg-cyan-900/40 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-100 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-lg">
                  Continue <span className="text-lg">→</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: OBJECTIVES */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-300">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-cyan-500/60 uppercase tracking-[0.2em] ml-1">Evolution Goal</label>
                <div className="relative">
                  <select name="goal" value={formData.goal} onChange={handleChange} className="w-full p-4 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-cyan-500 text-white appearance-none transition-all pr-10 cursor-pointer hover:bg-white/10 select-aesthetic">
                    <option value="lose_weight">Lose Weight (Fat Loss)</option>
                    <option value="maintain">Maintain (Recomp)</option>
                    <option value="gain_muscle">Build Muscle (Bulk)</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-cyan-500">
                    ▼
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-cyan-500/60 uppercase tracking-[0.2em] ml-1">Daily Burn Rate</label>
                <div className="relative">
                  <select name="activity_level" value={formData.activity_level} onChange={handleChange} className="w-full p-4 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-cyan-500 text-white appearance-none transition-all pr-10 cursor-pointer hover:bg-white/10 select-aesthetic">
                    <option value="sedentary">Sedentary (Office Job)</option>
                    <option value="light">Lightly Active (1-2 days/week)</option>
                    <option value="moderate">Moderately Active (3-5 days/week)</option>
                    <option value="active">Very Active (6+ days/week)</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-cyan-500">
                    ▼
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(2)} className="flex-1 py-3 text-slate-500 hover:text-white transition font-mono text-xs tracking-widest uppercase">Recall</button>
                <button
                  onClick={handleRegister}
                  disabled={loading}
                  className="flex-[2] bg-cyan-600 hover:bg-cyan-500 text-white py-3 rounded-xl font-bold shadow-[0_0_20px_rgba(8,145,178,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <span className="animate-pulse">SYNCHRONIZING...</span> : 'INITIALIZE PROTOCOL'}
                </button>
              </div>
            </div>
          )}

        </div>

        <div className="text-center mt-8">
          <Link href="/login" className="text-xs text-slate-500 hover:text-cyan-400 transition font-mono uppercase tracking-widest">
            Existing Identity? Authorize here
          </Link>
        </div>

      </div>

      <style jsx>{`
        .select-aesthetic option {
          background-color: #020617; /* bg-slate-950 */
          color: white;
          padding: 10px;
        }
      `}</style>
    </div>
  )
}

// --- FIX: Typed Helper Component ---
function InputGroup({ label, name, type, placeholder, value, onChange }: InputGroupProps) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-cyan-500/60 uppercase tracking-[0.2em] ml-1">{label}</label>
      <input
        name={name}
        type={type}
        required
        value={value}
        onChange={onChange}
        className="w-full p-4 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-cyan-500 text-white placeholder-slate-700 transition-all focus:bg-white/10"
        placeholder={placeholder}
      />
    </div>
  )
}