'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react'
import { useState, useEffect } from 'react'

export type ToastType = 'success' | 'error' | 'info'

interface Toast {
    id: number
    message: string
    type: ToastType
}

let toastCount = 0
let toastCallback: (message: string, type: ToastType) => void

export function showToast(message: string, type: ToastType = 'success') {
    if (toastCallback) toastCallback(message, type)
}

export default function ToastContainer() {
    const [toasts, setToasts] = useState<Toast[]>([])

    useEffect(() => {
        toastCallback = (message: string, type: ToastType) => {
            const id = ++toastCount
            setToasts(prev => [...prev, { id, message, type }])
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id))
            }, 4000)
        }
    }, [])

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }

    return (
        <div className="fixed bottom-24 md:bottom-10 right-6 md:right-10 z-[200] flex flex-col gap-3 pointer-events-none">
            <AnimatePresence>
                {toasts.map(toast => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                        className={`pointer-events-auto flex items-center gap-4 p-5 rounded-[1.5rem] border backdrop-blur-3xl shadow-2xl min-w-[300px] max-w-[400px] ${toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20' :
                                toast.type === 'error' ? 'bg-red-500/10 border-red-500/20' :
                                    'bg-blue-500/10 border-blue-500/20'
                            }`}
                    >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${toast.type === 'success' ? 'bg-emerald-500 text-black' :
                                toast.type === 'error' ? 'bg-red-500 text-white' :
                                    'bg-blue-500 text-white'
                            }`}>
                            {toast.type === 'success' && <CheckCircle2 size={20} />}
                            {toast.type === 'error' && <AlertCircle size={20} />}
                            {toast.type === 'info' && <Info size={20} />}
                        </div>

                        <div className="flex-1">
                            <p className="text-[11px] font-black uppercase tracking-widest text-zinc-300 leading-tight">
                                {toast.type === 'error' ? 'Sytem Error' : 'Neural Update'}
                            </p>
                            <p className="text-[13px] font-medium text-white/90 mt-1">{toast.message}</p>
                        </div>

                        <button
                            onClick={() => removeToast(toast.id)}
                            className="text-zinc-500 hover:text-white transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    )
}
