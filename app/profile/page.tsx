'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { getUserSession } from '@/lib/auth'
import {
  Activity,
  ChevronLeft,
  Hash,
  Target,
  ShieldCheck,
  Lock,
  Settings,
  Trophy,
  Scale
} from 'lucide-react'
import Sidebar from '@/components/dashboard/Sidebar'
import MobileNav from '@/components/dashboard/MobileNav'
import { PageTransition, FadeIn, StaggerContainer, StaggerItem, HoverScale } from '@/components/animations/Transitions'

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
    const fetchProfile = async () => {
      try {
        const meRes = await fetch('/api/auth/me')
        if (!meRes.ok) { router.push('/login'); return }
        const sessionJson: any = await meRes.json()

        if (sessionJson.success) {
          const userData = sessionJson.data
          setUser(userData)
          setUserId(userData.id)
          setFormData(userData)

          const totalInches = userData.height_cm / 2.54
          setHeightFt(Math.floor(totalInches / 12).toString())
          setHeightIn(Math.round(totalInches % 12).toString())
        } else {
          router.push('/login')
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

      const json: any = await res.json()
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

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-purple-500 animate-pulse uppercase font-black tracking-widest text-[10px]">Synchronizing Neural Profile...</div>
  if (!user) return null

  return (
    <PageTransition>
      <div className="min-h-screen bg-black text-white flex font-inter overflow-hidden">
        <Sidebar />
        <MobileNav />

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 no-scrollbar relative">
          {/* Atmosphere */}
          <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-900/10 blur-[150px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-900/10 blur-[150px]" />
          </div>

          <div className="max-w-5xl mx-auto relative z-10">
            <header className="flex justify-between items-center mb-12">
              <Link href="/dashboard" className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-zinc-950/50 backdrop-blur-md border border-white/5 rounded-2xl flex items-center justify-center group-hover:border-purple-500/30 group-hover:bg-purple-500/5 transition-all">
                  <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                </div>
                <div>
                  <h1 className="text-sm font-black uppercase tracking-[0.3em] text-zinc-400 group-hover:text-white transition-colors">Digital Identity</h1>
                  <p className="text-[9px] text-zinc-600 font-mono uppercase mt-0.5">Return to Command Center</p>
                </div>
              </Link>

              <div className="flex gap-4">
                <AnimatePresence mode="wait">
                  {!isEditing ? (
                    <motion.button
                      key="edit"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      onClick={() => setIsEditing(true)}
                      className="h-12 px-8 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-3"
                    >
                      <Settings size={14} className="text-purple-500" />
                      Modify Parameters
                    </motion.button>
                  ) : (
                    <motion.div
                      key="saving"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex gap-3"
                    >
                      <button onClick={() => setIsEditing(false)} className="h-12 px-6 text-zinc-500 text-[10px] font-black uppercase tracking-widest hover:text-zinc-300 transition-colors">Discard</button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="h-12 px-10 bg-purple-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-[0_10px_30px_rgba(147,51,234,0.3)] hover:bg-purple-500 transition-all disabled:opacity-50"
                      >
                        {saving ? 'SYNCING...' : 'Authorize Changes'}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </header>

            <StaggerContainer>
              <div className="grid grid-cols-12 gap-8">

                {/* Profile Identity Card */}
                <StaggerItem className="col-span-12 lg:col-span-4 self-start">
                  <div className="stat-card flex flex-col items-center justify-center text-center p-12 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-b from-purple-600/[0.03] to-transparent" />
                    <div className="relative mb-10 w-40 h-40">
                      <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full scale-150 group-hover:scale-[2] transition-transform duration-700 opacity-60" />
                      <div className="w-full h-full rounded-[3.5rem] bg-gradient-to-br from-purple-500 to-indigo-700 flex items-center justify-center text-6xl font-black font-outfit italic relative z-10 border border-white/10 shadow-2xl">
                        {user.name.charAt(0)}
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-black border-2 border-purple-500 rounded-2xl flex items-center justify-center text-purple-500 z-20 shadow-xl">
                        <ShieldCheck size={20} />
                      </div>
                    </div>
                    <div className="relative z-10">
                      <h2 className="text-3xl font-black font-outfit italic uppercase mb-3 tracking-tight">{user.name}</h2>
                      <div className="px-4 py-1.5 bg-white/5 border border-white/5 rounded-full inline-flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest">{user.email}</span>
                      </div>
                    </div>

                    <div className="mt-12 w-full pt-8 border-t border-white/5 flex flex-col gap-4 relative z-10">
                      <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Digital Signatures</p>
                      <div className="flex justify-between items-center px-4 py-3 bg-black/40 rounded-xl border border-white/5">
                        <span className="text-[10px] text-zinc-500 font-mono">UID: 00{user.id}X</span>
                        <Lock size={12} className="text-zinc-800" />
                      </div>
                    </div>
                  </div>
                </StaggerItem>

                {/* Core Biometrics */}
                <StaggerItem className="col-span-12 lg:col-span-8">
                  <div className="stat-card p-10 md:p-16 h-full space-y-16 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                      <Trophy size={120} className="text-purple-500" />
                    </div>

                    <div>
                      <div className="flex items-center gap-3 mb-10">
                        <div className="w-1.5 h-8 bg-purple-600 rounded-full" />
                        <h3 className="text-xs text-white font-black uppercase tracking-[0.4em]">Biometric Protocol</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <ProfileField
                          label="Chronological Age"
                          value={formData.age}
                          isEditing={isEditing}
                          onChange={(v: any) => setFormData({ ...formData, age: v })}
                          icon={Hash}
                        />
                        <div className="space-y-4">
                          <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block">Neural Gender Mapping</label>
                          {isEditing ? (
                            <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="w-full h-16 bg-white/5 border border-white/5 rounded-2xl px-6 text-sm font-black uppercase italic outline-none focus:border-purple-500 transition-all font-outfit text-white appearance-none cursor-pointer">
                              <option value="male" className="bg-zinc-950">Biological Male</option>
                              <option value="female" className="bg-zinc-950">Biological Female</option>
                            </select>
                          ) : (
                            <div className="text-2xl font-black font-outfit italic uppercase text-white tracking-widest">{user.gender}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-white/5">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block">Structural Height (FT / IN)</label>
                        {isEditing ? (
                          <div className="flex gap-4">
                            <input type="number" value={heightFt} onChange={(e) => setHeightFt(e.target.value)} className="w-full h-16 bg-white/5 border border-white/5 rounded-2xl px-6 text-sm font-black font-outfit outline-none focus:border-purple-500 transition-all" placeholder="FT" />
                            <input type="number" value={heightIn} onChange={(e) => setHeightIn(e.target.value)} className="w-full h-16 bg-white/5 border border-white/5 rounded-2xl px-6 text-sm font-black font-outfit outline-none focus:border-purple-500 transition-all" placeholder="IN" />
                          </div>
                        ) : (
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-purple-600/10 flex items-center justify-center text-purple-600 border border-purple-500/20">
                              <Scale size={18} />
                            </div>
                            <div className="text-2xl font-black font-outfit italic uppercase text-white tracking-widest">{heightFt}'{heightIn}"</div>
                          </div>
                        )}
                      </div>
                      <ProfileField
                        label="Mass Payload (KG)"
                        value={formData.weight_kg}
                        isEditing={isEditing}
                        onChange={(v: any) => setFormData({ ...formData, weight_kg: v })}
                        icon={Activity}
                      />
                    </div>

                    <div className="pt-10 border-t border-white/5">
                      <div className="flex items-center gap-3 mb-10">
                        <div className="w-1.5 h-8 bg-indigo-600 rounded-full" />
                        <h3 className="text-xs text-white font-black uppercase tracking-[0.4em]">Strategic Directives</h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                          <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block">Active Directive (Goal)</label>
                          {isEditing ? (
                            <select value={formData.goal} onChange={(e) => setFormData({ ...formData, goal: e.target.value })} className="w-full h-16 bg-white/5 border border-white/5 rounded-2xl px-8 text-sm font-black uppercase italic outline-none focus:border-purple-500 transition-all font-outfit text-white appearance-none cursor-pointer">
                              <option value="lose_weight" className="bg-zinc-950">Metabolic Depletion (Cut)</option>
                              <option value="maintain" className="bg-zinc-950">Homeostasis (Maintain)</option>
                              <option value="gain_muscle" className="bg-zinc-950">Anabolic Synthesis (Bulk)</option>
                            </select>
                          ) : (
                            <div className="text-2xl font-black font-outfit italic uppercase text-purple-400 tracking-tight">{user.goal.replace('_', ' ')}</div>
                          )}
                        </div>

                        <div className="bg-black/50 p-8 rounded-[2.5rem] border border-white/5 flex items-center justify-between group hover:border-purple-500/30 transition-all">
                          <div>
                            <div className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mb-2">Neural Allocation</div>
                            <div className="text-3xl font-black font-outfit italic text-white leading-none tracking-tighter">{user.target_calories} <span className="text-xs text-zinc-700 uppercase not-italic ml-1">Kcal / Day</span></div>
                          </div>
                          <Target size={32} className="text-purple-600/20 group-hover:scale-110 group-hover:text-purple-600/40 transition-all" />
                        </div>
                      </div>
                    </div>
                  </div>
                </StaggerItem>

              </div>
            </StaggerContainer>

            <FadeIn delay={0.6}>
              <footer className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-zinc-800 font-mono text-[9px] uppercase tracking-[0.5em]">
                <div className="flex items-center gap-6">
                  <span className="flex items-center gap-2"><Lock size={10} /> Data Encrypted AES-256</span>
                  <span className="flex items-center gap-2"><ShieldCheck size={10} /> Privacy Protocol V4</span>
                </div>
                <span>Sync Node: FitDay_Core // Local Status: Secure</span>
              </footer>
            </FadeIn>
          </div>
        </main>
      </div>
    </PageTransition>
  )
}

function ProfileField({ label, value, isEditing, onChange, icon: Icon }: any) {
  return (
    <div className="space-y-4">
      <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block">{label}</label>
      {isEditing ? (
        <div className="relative group">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-16 bg-white/5 border border-white/5 rounded-2xl px-14 text-sm font-black font-outfit outline-none focus:border-purple-500 focus:bg-white/[0.08] transition-all text-white"
          />
          <Icon size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-700 group-hover:text-purple-500 transition-colors" />
        </div>
      ) : (
        <div className="flex items-center gap-5 group">
          <div className="w-10 h-10 rounded-xl bg-purple-600/10 flex items-center justify-center text-purple-600 border border-purple-500/20 group-hover:bg-purple-600/20 transition-all">
            <Icon size={18} />
          </div>
          <div className="text-2xl font-black font-outfit italic uppercase text-white tracking-widest tabular-nums">{value}</div>
        </div>
      )}
    </div>
  )
}

