'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getUserSession, saveUserSession, logoutUser } from '@/lib/auth'
import ErrorPopup from './ErrorPopup' // আপনার ডিজাইন করা পপআপটি এখানে ব্যবহার হবে

export default function Profile() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [user, setUser] = useState<any>(null)

  // Height State
  const [feet, setFeet] = useState('')
  const [inches, setInches] = useState('')

  const [formData, setFormData] = useState({
    name: '', age: '', gender: 'male',
    weight: '', activity_level: 'sedentary', goal: 'lose_weight'
  })

  const [nutritionPlan, setNutritionPlan] = useState<any>(null)

  useEffect(() => {
    const session = getUserSession()
    if (session) {
      setUser(session)
      setFormData({
        name: session.name || '',
        age: session.age || '',
        gender: session.gender || 'male',
        weight: session.weight_kg || '',
        activity_level: session.activity_level || 'sedentary',
        goal: session.goal || 'lose_weight'
      })

      if (session.height_cm) {
        const totalInches = session.height_cm / 2.54
        setFeet(Math.floor(totalInches / 12).toString())
        setInches(Math.round(totalInches % 12).toString())
      }
    } else {
      router.push('/login')
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (!user?.id) {
      setErrorMsg('Session Desynchronized. Rebooting...')
      setTimeout(() => logoutUser(), 1500)
      return
    }

    setLoading(true)

    const ftVal = parseFloat(feet) || 0
    const inVal = parseFloat(inches) || 0
    const heightCm = Math.round((ftVal * 30.48) + (inVal * 2.54))

    try {
      const payload = {
        ...formData,
        height_cm: heightCm,
        age: Number(formData.age),
        weight_kg: Number(formData.weight)
      }

      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = (await res.json()) as any

      if (json.success) {
        setSuccessMsg('Neural patterns updated.')
        saveUserSession(json.data)
        if (json.new_plan) setNutritionPlan(json.new_plan)
      } else {
        setErrorMsg(json.error || 'Update Interrupted')
      }
    } catch (error) {
      setErrorMsg('Core Database Mismatch. Re-logging required.')
      setTimeout(() => logoutUser(), 2000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 pb-24">
      <ErrorPopup message={errorMsg} onClose={() => setErrorMsg('')} />
      
      {/* Success Notification - Subtle Neon Toast */}
      {successMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-cyan-500 text-black px-6 py-3 rounded-full font-black text-xs tracking-widest animate-bounce shadow-[0_0_20px_#06b6d4]">
          {successMsg.toUpperCase()}
        </div>
      )}

      {/* Header Section */}
      <div className="max-w-4xl mx-auto mb-12 flex items-center gap-6 animate-fade-in">
        <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl flex items-center justify-center text-3xl shadow-[0_0_15px_rgba(6,182,212,0.1)]">
          <span className="animate-pulse">🧬</span>
        </div>
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">Bio-Metrics <span className="text-cyan-400">Sync</span></h1>
          <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest mt-1">Subject ID: {user?.id || 'Unknown'}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto grid lg:grid-cols-5 gap-8">
        {/* Main Configuration Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6">
          <div className="glass-panel p-8 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-30"></div>
            
            <div className="grid gap-6">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Personnel Name</label>
                <input type="text" required className="cyber-input"
                  value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Age (Cycles)</label>
                  <input type="number" required className="cyber-input"
                    value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Gender</label>
                  <select className="cyber-input" value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}>
                    <option value="male">MALE</option>
                    <option value="female">FEMALE</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Height (FT/IN)</label>
                  <div className="flex gap-2">
                    <input type="number" placeholder="FT" className="cyber-input text-center" value={feet} onChange={(e) => setFeet(e.target.value)} />
                    <input type="number" placeholder="IN" className="cyber-input text-center" value={inches} onChange={(e) => setInches(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Mass (KG)</label>
                  <input type="number" required className="cyber-input"
                    value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Activity Core</label>
                  <select className="cyber-input" value={formData.activity_level} onChange={(e) => setFormData({...formData, activity_level: e.target.value})}>
                    <option value="sedentary">SEDENTARY</option>
                    <option value="light">LIGHT</option>
                    <option value="moderate">MODERATE</option>
                    <option value="active">HIGH</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Objective</label>
                  <select className="cyber-input" value={formData.goal} onChange={(e) => setFormData({...formData, goal: e.target.value})}>
                    <option value="lose_weight">FAT REDUCTION</option>
                    <option value="maintain">STABILITY</option>
                    <option value="gain_muscle">TISSUE GROWTH</option>
                  </select>
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full mt-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-black font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(8,145,178,0.3)] disabled:opacity-50">
              {loading ? 'Processing...' : 'Overwrite System Memory'}
            </button>
          </div>
        </form>

        {/* Right Side: Metabolic Analytics */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-cyan-500/20 bg-cyan-500/5">
            <h3 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-4">Metabolic Ceiling</h3>
            <div className="text-5xl font-black italic tracking-tighter text-white">
              {nutritionPlan?.targetCalories || user?.target_calories || '---'}
              <span className="text-xs font-mono text-slate-500 ml-2">KCAL/DAY</span>
            </div>
            <div className="mt-4 h-1 bg-slate-900 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-500 w-2/3 shadow-[0_0_10px_#06b6d4]"></div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-white/5">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Macro Allocation</h3>
            <div className="space-y-4">
              {[
                { label: 'Protein', value: nutritionPlan?.proteinGrams || '--', color: 'bg-purple-500', text: 'text-purple-400' },
                { label: 'Carbs', value: nutritionPlan?.carbGrams || '--', color: 'bg-yellow-500', text: 'text-yellow-400' },
                { label: 'Fats', value: nutritionPlan?.fatGrams || '--', color: 'bg-red-500', text: 'text-red-400' }
              ].map((macro) => (
                <div key={macro.label} className="flex justify-between items-center group">
                  <div className="flex items-center gap-3">
                    <div className={`w-1 h-4 ${macro.color} rounded-full`}></div>
                    <span className={`text-xs font-bold uppercase ${macro.text}`}>{macro.label}</span>
                  </div>
                  <span className="text-sm font-mono font-bold">{macro.value}G</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .cyber-input {
          width: 100%;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 12px 16px;
          border-radius: 12px;
          color: white;
          font-family: monospace;
          font-size: 14px;
          transition: all 0.3s;
          outline: none;
        }
        .cyber-input:focus {
          border-color: #22d3ee;
          background: rgba(15, 23, 42, 0.9);
          box-shadow: 0 0 15px rgba(34, 211, 238, 0.1);
        }
        select.cyber-input option {
          background: #0f172a;
          color: white;
        }
      `}</style>
    </div>
  )
}