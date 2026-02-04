'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import Sidebar from '@/components/dashboard/Sidebar'
import MobileNav from '@/components/dashboard/MobileNav'
import { PageTransition, FadeIn } from '@/components/animations/Transitions'
import ProfileManager from '@/components/profile/ProfileManager'

// --- STRICT TYPES ---
type UserProfile = {
  id: number
  name: string
  email: string
  age: number
  gender: 'male' | 'female'
  height_cm: number
  weight_kg: number
  target_weight_kg: number
  fitness_goal: string
  activity_level: string
  target_calories: number
  daily_water_goal_ml?: number
  wake_up_time?: string
  sleep_time?: string
  target_sleep_hours?: number
  workout_days_per_week?: number
  dietary_preference?: string
  available_equipment?: string
  workout_duration_preference?: number
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const meRes = await fetch('/api/auth/me')
        if (!meRes.ok) { router.push('/login'); return }
        const sessionJson: any = await meRes.json()

        if (sessionJson.success) {
          setUser(sessionJson.data)
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

  const handleUpdate = async (updatedData: any) => {
    if (!user?.id) return
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      })

      const json: any = await res.json()
      if (json.success) {
        setUser(json.data)
      } else {
        throw new Error(json.error || 'Update failed')
      }
    } catch (err: any) {
      console.error('Profile update failed', err)
      throw err
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-4">
      <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      <div className="text-purple-500 animate-pulse uppercase font-black tracking-widest text-[10px]">
        Synchronizing Neural Identity...
      </div>
    </div>
  )

  if (!user) return null

  return (
    <PageTransition>
      <div className="min-h-screen bg-black text-white flex font-inter overflow-hidden">
        <Sidebar activePage="profile" />
        <MobileNav activePage="profile" />

        <main className="flex-1 overflow-y-auto p-6 md:p-10 no-scrollbar relative">
          {/* Atmosphere */}
          <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-900/10 blur-[150px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-900/10 blur-[150px]" />
          </div>

          <div className="max-w-6xl mx-auto relative z-10">
            <header className="flex justify-between items-center mb-12">
              <Link href="/dashboard" className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-zinc-950/50 backdrop-blur-md border border-white/5 rounded-2xl flex items-center justify-center group-hover:border-purple-500/30 group-hover:bg-purple-500/5 transition-all">
                  <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                </div>
                <div>
                  <h1 className="text-sm font-black uppercase tracking-[0.3em] text-zinc-400 group-hover:text-white transition-colors">Neural Hub</h1>
                  <p className="text-[9px] text-zinc-600 font-mono uppercase mt-0.5">Return to Command Center</p>
                </div>
              </Link>
            </header>

            <ProfileManager user={user} onUpdate={handleUpdate} />

            <FadeIn delay={0.6}>
              <footer className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-zinc-800 font-mono text-[9px] uppercase tracking-[0.5em]">
                <div className="flex items-center gap-6">
                  <span>Data Encrypted AES-256</span>
                  <span>Privacy Protocol V4</span>
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
