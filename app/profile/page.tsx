'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// --- 1. STRICT TYPES ---
type UserProfile = {
  id: number
  name: string
  email: string
  age: number
  gender: 'male' | 'female'
  height_cm: number
  weight_kg: number
  activity_level: string
  goal: string
  target_calories: number
}

type ApiResponse<T> = {
  success: boolean
  data: T
  error?: string
}

// FIX: Define Props Interface for the helper component
interface InputGroupProps {
  label: string
  value: string | number | undefined
  onChange: (value: string) => void // This tells TS that 'v' is always a string
  editing: boolean
  type?: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  
  // Initialize as empty object with Partial type
  const [formData, setFormData] = useState<Partial<UserProfile>>({})

  const USER_ID = 1

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/users/${USER_ID}`)
        const json = (await res.json()) as ApiResponse<UserProfile>
        if (json.success) {
          setUser(json.data)
          setFormData(json.data)
        }
      } catch (err) {
        console.error('Profile load failed', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/users/${USER_ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          // Safety: Ensure numbers are actually numbers before sending
          age: Number(formData.age),
          height: Number(formData.height_cm),
          weight: Number(formData.weight_kg)
        })
      })

      const json = (await res.json()) as ApiResponse<UserProfile>

      if (json.success) {
        setUser(json.data)
        setIsEditing(false)
      } else {
        alert(json.error || 'Update failed')
      }
    } catch (err) {
      alert('Connection Error')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    document.cookie = 'session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    localStorage.clear()
    router.push('/login')
  }

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500 animate-pulse">Loading...</div>
  if (!user) return null

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans pb-20">
      
      {/* Navbar */}
      <div className="border-b border-white/5 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="text-sm font-mono text-slate-400 hover:text-white transition flex items-center gap-2">
            ← DASHBOARD
          </Link>
          <div className="font-mono text-xs text-cyan-500 tracking-widest uppercase">
            System Settings
          </div>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-6 pt-10">
        
        {/* Header */}
        <div className="flex items-center gap-6 mb-10">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-3xl font-bold">
            {user.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{user.name}</h1>
            <p className="text-slate-400 text-sm font-mono">{user.email}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end mb-4">
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 uppercase tracking-widest border border-cyan-500/30 px-4 py-2 rounded-lg hover:bg-cyan-500/10 transition"
            >
              Edit Configuration
            </button>
          ) : (
            <div className="flex gap-3">
              <button onClick={() => setIsEditing(false)} className="text-xs font-bold text-slate-400 px-4 py-2">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="text-xs font-bold bg-cyan-500 text-black px-6 py-2 rounded-lg">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        {/* Form */}
        <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-8 space-y-8">
          <section>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 border-b border-white/5 pb-2">Biometrics</h3>
            <div className="grid grid-cols-2 gap-6">
              
              {/* FIX: Type conversion happens here */}
              <InputGroup 
                label="Weight (kg)" 
                value={isEditing ? formData.weight_kg : user.weight_kg} 
                onChange={(v) => setFormData({...formData, weight_kg: Number(v)})} // v is inferred string, converted to Number
                editing={isEditing}
                type="number"
              />
              <InputGroup 
                label="Height (cm)" 
                value={isEditing ? formData.height_cm : user.height_cm} 
                onChange={(v) => setFormData({...formData, height_cm: Number(v)})}
                editing={isEditing}
                type="number"
              />
              <InputGroup 
                label="Age (yrs)" 
                value={isEditing ? formData.age : user.age} 
                onChange={(v) => setFormData({...formData, age: Number(v)})}
                editing={isEditing}
                type="number"
              />

               <div className="flex flex-col gap-2">
                <label className="text-xs text-slate-400">Gender</label>
                {isEditing ? (
                  <select 
                    className="bg-slate-800 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-cyan-500 outline-none"
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value as 'male' | 'female'})}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                ) : (
                  <div className="p-3 bg-white/5 rounded-lg text-sm text-slate-300 capitalize">{user.gender}</div>
                )}
              </div>
            </div>
          </section>

          {/* Goal Selectors (Same as before) */}
          <section>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 border-b border-white/5 pb-2">Objectives</h3>
            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs text-slate-400">Current Goal</label>
                {isEditing ? (
                  <select 
                    className="bg-slate-800 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-cyan-500 outline-none"
                    value={formData.goal}
                    onChange={(e) => setFormData({...formData, goal: e.target.value})}
                  >
                    <option value="lose_weight">Lose Weight (Cut)</option>
                    <option value="maintain">Maintain (Recomp)</option>
                    <option value="gain_muscle">Gain Muscle (Bulk)</option>
                  </select>
                ) : (
                  <div className="p-3 bg-white/5 rounded-lg text-sm text-slate-300 capitalize">{user.goal?.replace('_', ' ')}</div>
                )}
              </div>
            </div>
          </section>

          <div className="pt-6 border-t border-white/5">
            <button onClick={handleLogout} className="w-full py-3 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl text-sm font-bold transition">
              Terminate Session
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

// --- FIX: Strictly Typed Helper Component ---
// Now TS knows exactly what props this component expects
function InputGroup({ label, value, onChange, editing, type = "text" }: InputGroupProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs text-slate-400">{label}</label>
      {editing ? (
        <input 
          type={type}
          className="bg-slate-800 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-cyan-500 outline-none transition-colors"
          value={value ?? ''} // Handle undefined values safely
          onChange={(e) => onChange(e.target.value)} // e.target.value is always string
        />
      ) : (
        <div className="p-3 bg-white/5 rounded-lg text-sm text-slate-300 border border-transparent">
          {value}
        </div>
      )}
    </div>
  )
}