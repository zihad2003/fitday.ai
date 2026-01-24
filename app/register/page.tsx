'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { saveUserSession } from '@/lib/auth'

// --- 1. STRICT TYPES ---
interface RegisterResponse {
  success: boolean
  data?: any
  error?: string
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
    heightFeet: '',
    heightInches: '',
    weight: '',
    activity_level: 'sedentary',
    experience_level: 'beginner',
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
      // Calculate CM from Feet/Inches
      const ft = parseFloat(formData.heightFeet) || 0
      const inc = parseFloat(formData.heightInches) || 0
      const height_cm = Math.round((ft * 30.48) + (inc * 2.54))

      const payload = {
        ...formData,
        age: Number(formData.age),
        height: height_cm,
        weight: Number(formData.weight)
      }

      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json() as RegisterResponse

      if (data.success) {
        if (data.data) {
          saveUserSession(data.data)
          router.push('/dashboard')
        }
      } else {
        setError(data.error || 'Initialization failed')
        setLoading(false)
      }
    } catch (err) {
      setError('Connection refused by the central server.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden px-4 font-inter">

      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[160px] -z-10" />
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] -z-10" />

      <div className="w-full max-w-lg relative z-10">

        {/* Logo Section */}
        <div className="flex justify-center mb-12">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-[0_0_30px_rgba(147,51,234,0.4)] group-hover:rotate-12 transition-transform duration-500">
              FD
            </div>
            <span className="text-2xl font-black font-outfit italic tracking-tighter uppercase">FitDay<span className="text-purple-500">.AI</span></span>
          </Link>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-between mb-12 px-6">
          {['AUTH', 'BIO', 'GOAL'].map((s, idx) => (
            <div key={s} className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-[10px] font-black tracking-widest transition-all duration-700 ${step >= idx + 1 ? 'bg-purple-600 text-white shadow-[0_0_25px_rgba(147,51,234,0.4)]' : 'bg-white/5 text-zinc-700 border border-white/5'}`}>
                {s}
              </div>
              {idx < 2 && <div className={`h-[1px] w-12 rounded-full transition-all duration-700 ${step > idx + 1 ? 'bg-purple-600' : 'bg-white/5'}`} />}
            </div>
          ))}
        </div>

        {/* Main Panel */}
        <div className="argus-glass rounded-[2.5rem] p-12 relative overflow-hidden shadow-2xl">
          <div className="mb-12">
            <div className="text-[10px] text-purple-500 font-black uppercase tracking-[0.4em] mb-3">Get Started</div>
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic font-outfit leading-none">
              {step === 1 && "Create Account"}
              {step === 2 && "Personal Details"}
              {step === 3 && "Your Goals"}
            </h2>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-10 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-[10px] font-black uppercase tracking-widest"
              >
                [CRITICAL_ALERT] {error}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <ArgusInput label="Full Name" name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} />
                <ArgusInput label="Email Address" name="email" type="email" placeholder="john@example.com" value={formData.email} onChange={handleChange} />
                <ArgusInput label="Password" name="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} />

                <button onClick={() => setStep(2)} className="w-full h-16 bg-white text-black mt-8 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-purple-600 hover:text-white transition-all btn-beam">
                  Next Step <span className="ml-2">→</span>
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-2 gap-6">
                  <ArgusInput label="Age" name="age" type="number" placeholder="25" value={formData.age} onChange={handleChange} />
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] ml-1">Gender</label>
                    <div className="relative">
                      <select name="gender" value={formData.gender} onChange={handleChange} className="w-full h-14 px-5 bg-white/5 border border-white/5 rounded-2xl outline-none focus:border-purple-500 text-white appearance-none transition-all cursor-pointer hover:bg-white/10 font-black text-[10px] uppercase tracking-widest italic">
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-purple-500">▼</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] ml-1">Height (FT / IN)</label>
                    <div className="flex gap-3">
                      <input name="heightFeet" type="number" placeholder="Ft" value={formData.heightFeet} onChange={handleChange} className="flex-1 h-14 px-5 bg-white/5 border border-white/5 rounded-2xl outline-none focus:border-purple-500 text-white placeholder-zinc-800 transition-all font-outfit" />
                      <input name="heightInches" type="number" placeholder="In" value={formData.heightInches} onChange={handleChange} className="flex-1 h-14 px-5 bg-white/5 border border-white/5 rounded-2xl outline-none focus:border-purple-500 text-white placeholder-zinc-800 transition-all font-outfit" />
                    </div>
                  </div>
                  <ArgusInput label="Weight (KG)" name="weight" type="number" placeholder="70" value={formData.weight} onChange={handleChange} />
                </div>

                <div className="flex gap-4 mt-8">
                  <button onClick={() => setStep(1)} className="flex-1 h-16 text-zinc-600 hover:text-white transition font-black text-[10px] tracking-widest uppercase italic">Back</button>
                  <button onClick={() => setStep(3)} className="flex-[2] bg-white text-black h-16 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-purple-600 hover:text-white transition-all btn-beam">
                    Next Step <span className="ml-2">→</span>
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <ArgusSelect
                  label="Primary Goal"
                  name="goal"
                  value={formData.goal}
                  onChange={handleChange}
                  options={[
                    { value: 'lose_weight', label: 'Lose Weight' },
                    { value: 'maintain', label: 'Maintain Weight' },
                    { value: 'gain_muscle', label: 'Build Muscle' }
                  ]}
                />

                <ArgusSelect
                  label="Fitness Level"
                  name="experience_level"
                  value={formData.experience_level}
                  onChange={handleChange}
                  options={[
                    { value: 'beginner', label: 'Beginner' },
                    { value: 'intermediate', label: 'Intermediate' },
                    { value: 'pro', label: 'Advanced' }
                  ]}
                />

                <ArgusSelect
                  label="Activity Level"
                  name="activity_level"
                  value={formData.activity_level}
                  onChange={handleChange}
                  options={[
                    { value: 'sedentary', label: 'Sedentary (Little to no exercise)' },
                    { value: 'light', label: 'Lightly Active (1-3 days/week)' },
                    { value: 'moderate', label: 'Moderately Active (3-5 days/week)' },
                    { value: 'active', label: 'Very Active (6-7 days/week)' }
                  ]}
                />

                <div className="flex gap-4 mt-8">
                  <button onClick={() => setStep(2)} className="flex-1 h-16 text-zinc-600 hover:text-white transition font-black text-[10px] tracking-widest uppercase italic">Back</button>
                  <button
                    onClick={handleRegister}
                    disabled={loading}
                    className="flex-[2] bg-purple-600 hover:bg-purple-500 text-white h-16 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-[0_20px_40px_-5px_rgba(147,51,234,0.3)] transition-all btn-beam disabled:opacity-50"
                  >
                    {loading ? 'CREATING ACCOUNT...' : 'COMPLETE REGISTRATION'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="text-center mt-12">
          <Link href="/login" className="text-[10px] text-zinc-600 hover:text-purple-500 transition font-black uppercase tracking-[0.4em] italic mb-10 block">
            Already have an account?
          </Link>
        </div>
      </div>
    </div>
  )
}

function ArgusInput({ label, name, type = "text", placeholder, value, onChange }: any) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] ml-1">{label}</label>
      <input
        name={name}
        type={type}
        required
        value={value}
        onChange={onChange}
        className="w-full h-14 px-5 bg-white/5 border border-white/5 rounded-2xl outline-none focus:border-purple-500 text-white placeholder-zinc-800 transition-all focus:bg-white/10 font-outfit"
        placeholder={placeholder}
      />
    </div>
  )
}

function ArgusSelect({ label, name, value, onChange, options }: any) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] ml-1">{label}</label>
      <div className="relative">
        <select name={name} value={value} onChange={onChange} className="w-full h-14 px-5 bg-white/5 border border-white/5 rounded-2xl outline-none focus:border-purple-500 text-white appearance-none transition-all cursor-pointer hover:bg-white/10 font-black text-[10px] uppercase tracking-widest italic">
          {options.map((o: any) => <option key={o.value} value={o.value} className="bg-zinc-950 text-white">{o.label}</option>)}
        </select>
        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-purple-500">▼</div>
      </div>
    </div>
  )
}
