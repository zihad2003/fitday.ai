'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { getUserSession } from '@/lib/auth'
import { LayoutDashboard, Calendar, Activity, Map, Bot, Play, LogOut, ChevronLeft, User, Mail, Hash, Target } from 'lucide-react'
import Sidebar from '@/components/dashboard/Sidebar'

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

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [userId, setUserId] = useState<number | null>(null)

  const [formData, setFormData] = useState<any>({})
  const [heightFt, setHeightFt] = useState('')
  const [heightIn, setHeightIn] = useState('')

  useEffect(() => {
    const session = getUserSession()
    if (!session) { router.push('/login'); return }
    setUserId(session.id)

    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/users/${session.id}`)
        const json = (await res.json()) as ApiResponse<UserProfile>
        if (json.success) {
          setUser(json.data)
          setFormData(json.data)
          // Convert CM to FT/IN
          const totalInches = json.data.height_cm / 2.54
          setHeightFt(Math.floor(totalInches / 12).toString())
          setHeightIn(Math.round(totalInches % 12).toString())
        }
      } catch (err) {
        console.error('Profile load failed', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [router])

  const handleSave = async () => {
    if (!userId) return
    setSaving(true)
    try {
      const ft = parseFloat(heightFt) || 0
      const inc = parseFloat(heightIn) || 0
      const height_cm = Math.round((ft * 30.48) + (inc * 2.54))

      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          height: height_cm,
          weight: Number(formData.weight_kg),
          age: Number(formData.age)
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

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-purple-500 animate-pulse uppercase font-black tracking-widest text-[10px]">Synchronizing...</div>
  if (!user) return null

  return (
    <div className="min-h-screen bg-black text-white flex font-inter overflow-hidden">

      <Sidebar />

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto p-10 no-scrollbar relative">
        <div className="glow-purple top-[-10%] right-[-10%] w-[50%] h-[50%] opacity-10" />

        <nav className="flex justify-between items-center mb-12">
          <Link href="/dashboard" className="flex items-center gap-3 group text-zinc-500 hover:text-white transition-colors">
            <div className="w-10 h-10 bg-zinc-950 border border-white/5 rounded-xl flex items-center justify-center group-hover:border-purple-500/30 transition-all">
              <ChevronLeft size={18} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">Return to Dashboard</span>
          </Link>

          <div className="flex gap-4">
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="h-12 px-6 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-3">
                <button onClick={() => setIsEditing(false)} className="h-12 px-6 text-zinc-500 text-[10px] font-black uppercase tracking-widest">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="h-12 px-8 bg-purple-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(147,51,234,0.4)] btn-beam">
                  {saving ? 'SAVING...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </nav>

        <section className="max-w-4xl mx-auto grid grid-cols-12 gap-8">

          {/* Profile Identity Card */}
          <div className="col-span-12 lg:col-span-4 stat-card flex flex-col items-center justify-center text-center p-12">
            <div className="w-32 h-32 rounded-[3rem] bg-gradient-to-br from-purple-500 to-indigo-900 flex items-center justify-center text-5xl font-black font-outfit italic mb-8 shadow-[0_0_50px_rgba(147,51,234,0.2)]">
              {user.name.charAt(0)}
            </div>
            <h2 className="text-3xl font-black font-outfit italic uppercase mb-2">{user.name}</h2>
            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{user.email}</p>
          </div>

          {/* Core Biometrics */}
          <div className="col-span-12 lg:col-span-8 stat-card p-12 space-y-12">
            <div>
              <h3 className="text-[10px] text-purple-500 font-black uppercase tracking-[0.6em] mb-8">Personal Information</h3>
              <div className="grid grid-cols-2 gap-8">
                <ProfileField
                  label="Age"
                  value={formData.age}
                  isEditing={isEditing}
                  onChange={(v: any) => setFormData({ ...formData, age: v })}
                  icon={Hash}
                />
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Gender</label>
                  {isEditing ? (
                    <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-5 text-sm font-black uppercase italic outline-none focus:border-purple-500 transition-all font-outfit">
                      <option value="male" className="bg-zinc-950">Male</option>
                      <option value="female" className="bg-zinc-950">Female</option>
                    </select>
                  ) : (
                    <div className="text-xl font-black font-outfit italic uppercase text-white">{user.gender}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/5">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Height (FT / IN)</label>
                {isEditing ? (
                  <div className="flex gap-3">
                    <input type="number" value={heightFt} onChange={(e) => setHeightFt(e.target.value)} className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-5 text-sm font-black font-outfit outline-none focus:border-purple-500 transition-all" placeholder="FT" />
                    <input type="number" value={heightIn} onChange={(e) => setHeightIn(e.target.value)} className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-5 text-sm font-black font-outfit outline-none focus:border-purple-500 transition-all" placeholder="IN" />
                  </div>
                ) : (
                  <div className="text-xl font-black font-outfit italic uppercase text-white">{heightFt}'{heightIn}"</div>
                )}
              </div>
              <ProfileField
                label="Weight (KG)"
                value={formData.weight_kg}
                isEditing={isEditing}
                onChange={(v: any) => setFormData({ ...formData, weight_kg: v })}
                icon={Activity}
              />
            </div>
          </div>

          {/* Strategic Directives */}
          <div className="col-span-12 stat-card p-12">
            <h3 className="text-[10px] text-purple-500 font-black uppercase tracking-[0.6em] mb-8">Your Goals</h3>
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Current Goal</label>
                {isEditing ? (
                  <select value={formData.goal} onChange={(e) => setFormData({ ...formData, goal: e.target.value })} className="w-full h-16 bg-white/5 border border-white/5 rounded-2xl px-8 text-sm font-black uppercase italic outline-none focus:border-purple-500 transition-all font-outfit">
                    <option value="lose_weight" className="bg-zinc-950">Lose Weight (Cut)</option>
                    <option value="maintain" className="bg-zinc-950">Maintain Weight</option>
                    <option value="gain_muscle" className="bg-zinc-950">Build Muscle (Bulk)</option>
                  </select>
                ) : (
                  <div className="text-3xl font-black font-outfit italic uppercase text-white tracking-tight">{user.goal.replace('_', ' ')}</div>
                )}
              </div>

              <div className="bg-zinc-950 p-8 rounded-[2rem] border border-white/5 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mb-1">Daily Calories</div>
                  <div className="text-4xl font-black font-outfit italic text-white leading-none">{user.target_calories} KCAL</div>
                </div>
                <Target size={42} className="text-purple-600/30" />
              </div>
            </div>
          </div>

        </section>

        <div className="mt-20 pt-10 border-t border-white/5 flex justify-between items-center text-zinc-800 font-mono text-[9px] uppercase tracking-widest">
          <span>FitDay AI // Profile Settings</span>
          <span>SECURE CONNECTION</span>
        </div>
      </main>
    </div>
  )
}

function ProfileField({ label, value, isEditing, onChange, icon: Icon }: any) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{label}</label>
      {isEditing ? (
        <div className="relative">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-12 text-sm font-black font-outfit outline-none focus:border-purple-500 transition-all"
          />
          <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" />
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <Icon size={20} className="text-purple-600" />
          <div className="text-xl font-black font-outfit italic uppercase text-white">{value}</div>
        </div>
      )}
    </div>
  )
}
