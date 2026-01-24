'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { saveUserSession } from '@/lib/auth'
import Link from 'next/link'

interface LoginResponse {
  success: boolean
  data?: any
  error?: string
}

export default function Login() {
  const router = useRouter()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = (await res.json()) as LoginResponse

      if (data.success) {
        router.push('/dashboard')
      } else {
        setError(data.error || 'Access Denied')
      }
    } catch (error) {
      setError('Connection Failure: System Offline')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden px-4 font-inter">

      {/* Background Ambience */}
      <div className="glow-purple top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-20" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="w-full max-w-md relative z-10">
        <div className="flex justify-center mb-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-[0_0_30px_rgba(147,51,234,0.4)]">FD</div>
          </Link>
        </div>

        <div className="argus-glass rounded-[2.5rem] p-12 border border-white/5 relative overflow-hidden">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-black font-outfit italic text-white tracking-tighter uppercase leading-none mb-3">Welcome <span className="text-purple-500">Back</span></h2>
            <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.4em]">Please sign in to continue</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-black uppercase tracking-widest text-center"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Email Address</label>
              <input
                type="email" required
                className="w-full h-14 px-5 bg-white/5 border border-white/5 rounded-2xl outline-none focus:border-purple-500 text-white placeholder-zinc-800 transition-all font-outfit"
                placeholder="identity@core.link"
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"} required
                  className="w-full h-14 px-5 bg-white/5 border border-white/5 rounded-2xl outline-none focus:border-purple-500 text-white placeholder-zinc-800 transition-all font-outfit"
                  placeholder="••••••••"
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition text-[8px] font-black uppercase tracking-widest">
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button disabled={loading} className="w-full h-16 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-purple-600 hover:text-white transition-all btn-beam shadow-[0_20px_40px_-5px_rgba(255,255,255,0.1)] mt-8">
              {loading ? 'LOGGING IN...' : 'LOGIN'}
            </button>
          </form>

          <div className="mt-10 pt-10 border-t border-white/5 text-center">
            <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">
              Don't have an account? <Link href="/register" className="text-purple-500 hover:text-purple-400">Sign Up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
