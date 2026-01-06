// app/login/page.tsx - Updated Design
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveUserSession } from '@/lib/auth'
import Link from 'next/link'
import ErrorPopup from '@/components/ErrorPopup'

export default function Login() {
  const router = useRouter()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false) // Toggle State

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
      const data = await res.json()
      
      if (data.success) {
        saveUserSession(data.data)
        router.push('/dashboard')
      } else {
        setError(data.error || 'Invalid credentials.')
      }
    } catch (error) {
      setError('Unable to connect to server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden px-4">
      {error && <ErrorPopup message={error} onClose={() => setError('')} />}

      {/* Modern Background */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white z-10 relative">
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-blue-50 rounded-2xl mb-4 text-3xl">🧬</div>
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-500 mt-2 text-sm">Access your personalized health engine</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Email Access</label>
            <input 
              type="email" required 
              className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              placeholder="student@uiu.ac.bd"
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Security Key</label>
            <div className="relative">
              <input 
                type={showPass ? "text" : "password"} required 
                className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                placeholder="••••••••"
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3.5 text-gray-400 hover:text-blue-600 transition">
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button disabled={loading} className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-black hover:scale-[1.02] transition-all active:scale-95 flex justify-center gap-2 items-center">
            {loading ? <span className="animate-pulse">Verifying...</span> : 'Secure Login'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500">
            New to FitDay? <Link href="/register" className="text-blue-600 font-bold hover:underline">Create ID</Link>
          </p>
        </div>
      </div>
    </div>
  )
}