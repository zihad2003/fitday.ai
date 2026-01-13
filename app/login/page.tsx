'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveUserSession } from '@/lib/auth'
import Link from 'next/link'
import ErrorPopup from '@/components/ErrorPopup'

// --- 1. Define the API Response Type ---
interface LoginResponse {
  success: boolean
  data?: any // You can replace 'any' with a User type if you have one
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
      // 
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      // --- 2. Cast the response to our Interface ---
      const data = (await res.json()) as LoginResponse
      
      if (data.success) {
        // Now TypeScript knows 'data.data' exists
        if (data.data) {
            saveUserSession(data.data)
            router.push('/dashboard')
        }
      } else {
        // Now TypeScript knows 'data.error' exists
        setError(data.error || 'Access Denied')
      }
    } catch (error) {
      setError('Connection Failure')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden px-4">
      {error && <ErrorPopup message={error} onClose={() => setError('')} />}

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[100px] -z-10 animate-pulse"></div>

      <div className="glass-panel p-8 rounded-3xl w-full max-w-md border border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white tracking-tight">System Access</h2>
          <p className="text-slate-400 mt-2 text-sm">Enter credentials to proceed</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-xs font-bold text-cyan-500 uppercase ml-1 mb-1 block tracking-widest">Email ID</label>
            <input 
              type="email" required 
              className="w-full p-4 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-cyan-500 text-white placeholder-slate-600 transition-all"
              placeholder="user@example.com"
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-cyan-500 uppercase ml-1 mb-1 block tracking-widest">Passcode</label>
            <div className="relative">
              <input 
                type={showPass ? "text" : "password"} required 
                className="w-full p-4 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-cyan-500 text-white placeholder-slate-600 transition-all"
                placeholder="••••••••"
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-4 text-slate-500 hover:text-white transition">
                {showPass ? 'HIDE' : 'SHOW'}
              </button>
            </div>
          </div>

          <button disabled={loading} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-4 rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(8,145,178,0.4)] transition-all active:scale-95 flex justify-center items-center">
            {loading ? <span className="animate-pulse">Authenticating...</span> : 'Connect'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <p className="text-sm text-slate-500">
            No ID found? <Link href="/register" className="text-cyan-400 font-bold hover:underline">Register New User</Link>
          </p>
        </div>
      </div>
    </div>
  )
}