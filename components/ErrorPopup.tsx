'use client'

import { useEffect } from 'react'

interface ErrorPopupProps {
  message: string
  onClose: () => void
}

export default function ErrorPopup({ message, onClose }: ErrorPopupProps) {
  // অটো-ক্লোজ ফিচার (৫ সেকেন্ড পর নিজে নিজেই চলে যাবে)
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onClose, 5000)
      return () => clearTimeout(timer)
    }
  }, [message, onClose])

  if (!message) return null

  return (
    <div className="fixed top-6 right-6 z-[100] w-full max-w-sm animate-in slide-in-from-right-8 fade-in duration-300">
      <div className="relative group">
        {/* Outer Glow Effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-orange-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
        
        {/* Main Panel */}
        <div className="relative bg-slate-900/80 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-2xl flex items-start gap-4">
          
          {/* Futuristic Icon Container */}
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <span className="text-red-500 text-lg">!</span>
            {/* Pulsing Dot */}
            <div className="absolute w-2 h-2 bg-red-500 rounded-full animate-ping opacity-75"></div>
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">Signal Interrupted</h3>
              <button 
                onClick={onClose} 
                className="text-slate-500 hover:text-white transition-colors text-lg leading-none"
              >
                &times;
              </button>
            </div>
            <p className="text-slate-200 text-xs font-medium leading-relaxed">
              {message}
            </p>
          </div>

          {/* Bottom Progress Bar (Auto-hide timer) */}
          <div className="absolute bottom-0 left-0 h-[2px] bg-red-500/40 rounded-full animate-shrink-width" style={{ width: '100%' }}></div>
        </div>
      </div>
    </div>
  )
}