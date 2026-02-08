'use client'

import { motion } from 'framer-motion'
import { Plus, Droplet, Dumbbell, Utensils, Zap, Scale } from 'lucide-react'
import { showToast } from '@/components/animations/Toast'
import { useState } from 'react'
import { Analytics } from '@/lib/analytics'

interface QuickActionsProps {
    userId: number
    onOpenMealLog?: () => void
    onOpenCheckin?: () => void
}

export default function QuickActions({ userId, onOpenMealLog, onOpenCheckin }: QuickActionsProps) {
    const [loading, setLoading] = useState<string | null>(null)

    const handleQuickLog = async (type: 'water' | 'workout' | 'meal' | 'weight') => {
        if (type === 'meal' && onOpenMealLog) {
            onOpenMealLog()
            return
        }

        if (type === 'weight' && onOpenCheckin) {
            onOpenCheckin()
            return
        }

        if (type === 'workout') {
            const el = document.getElementById('workout-timeline')
            if (el) el.scrollIntoView({ behavior: 'smooth' })
            else showToast('Initiate Training Protocol from Timeline')
            return
        }

        setLoading(type)
        Analytics.trackFeatureUsage('quick_actions', 'initiate', { type })

        try {
            const today = new Date().toISOString().split('T')[0]

            if (type === 'water') {
                const res = await fetch('/api/tracking/water', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, date: today, water_liters: 0.25 }) // Quick add 250ml
                })
                if (res.ok) {
                    showToast('Neural Fluid Injected: +250ml')
                    Analytics.trackFeatureUsage('quick_actions', 'sync_success', { type: 'water', amount: 250 })
                }
            }
        } catch (err) {
            showToast('Synchronization Failed', 'error')
            Analytics.trackFeatureUsage('quick_actions', 'sync_error', { type, error: String(err) })
        } finally {
            setLoading(null)
        }
    }

    const actions = [
        { id: 'water', icon: Droplet, label: 'Hydrate', color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { id: 'workout', icon: Dumbbell, label: 'Training', color: 'text-purple-400', bg: 'bg-purple-500/10' },
        { id: 'meal', icon: Utensils, label: 'Fuel', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { id: 'weight', icon: Scale, label: 'Biometric', color: 'text-orange-400', bg: 'bg-orange-500/10' },
    ]

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {actions.map((action) => (
                <motion.button
                    key={action.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleQuickLog(action.id as any)}
                    className="flex flex-col items-center gap-3 p-6 bg-zinc-950 border border-white/5 rounded-[2rem] hover:border-white/10 transition-all group overflow-hidden relative"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-10 transition-opacity">
                        <action.icon size={48} />
                    </div>

                    <div className={`w-12 h-12 rounded-2xl ${action.bg} flex items-center justify-center ${action.color}`}>
                        <action.icon size={20} strokeWidth={2.5} />
                    </div>

                    <div className="text-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-1">
                            Initiate
                        </span>
                        <span className="text-xs font-black font-outfit uppercase italic text-white group-hover:text-purple-400 transition-colors">
                            {action.label}
                        </span>
                    </div>
                </motion.button>
            ))}
        </div>
    )
}
