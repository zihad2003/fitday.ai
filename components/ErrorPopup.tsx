// components/ErrorPopup.tsx
'use client'

interface ErrorPopupProps {
  message: string
  onClose: () => void
}

export default function ErrorPopup({ message, onClose }: ErrorPopupProps) {
  if (!message) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white/10 border border-red-500/50 p-6 rounded-2xl shadow-2xl max-w-sm w-full relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-red-500 blur-3xl opacity-20"></div>
        
        <div className="flex flex-col items-center text-center relative z-10">
          <div className="w-12 h-12 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center text-2xl mb-4 border border-red-500/30">
            ⚠️
          </div>
          
          <h3 className="text-xl font-bold text-white mb-2">System Error</h3>
          <p className="text-gray-300 text-sm mb-6 leading-relaxed">
            {message}
          </p>

          <button 
            onClick={onClose}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition shadow-lg shadow-red-900/50"
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  )
}