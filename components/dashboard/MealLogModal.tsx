'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Utensils, Flame, Zap, Check } from 'lucide-react'
import { showToast } from '@/components/animations/Toast'

interface MealLogModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    defaultType?: string
}

export default function MealLogModal({ isOpen, onClose, onSuccess, defaultType = 'breakfast' }: MealLogModalProps) {
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState({
        food_name: '',
        meal_type: defaultType,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        date: new Date().toISOString().split('T')[0]
    })

    const handleSave = async () => {
        if (!data.food_name) {
            showToast('Please enter food name', 'error')
            return
        }

        setLoading(true)
        try {
            const res = await fetch('/api/meals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...data,
                    completed: true
                })
            })

            if (res.ok) {
                showToast('Fuel Logged: Neural Sync Complete')
                onSuccess()
                onClose()
            } else {
                showToast('Failed to log meal', 'error')
            }
        } catch (err) {
            console.error('Meal log error:', err)
            showToast('Sync Failed', 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-lg bg-zinc-950 border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-zinc-900/40">
                            <div>
                                <h3 className="text-2xl font-black font-outfit uppercase italic text-white flex items-center gap-3">
                                    Fuel <span className="text-orange-500">Log</span>
                                </h3>
                                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] mt-1">Caloric Intake Calibration</p>
                            </div>
                            <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-500 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-10 space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">Meal Type</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {['breakfast', 'lunch', 'dinner', 'snack'].map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setData({ ...data, meal_type: type })}
                                            className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${data.meal_type === type ? 'bg-orange-600 text-white' : 'bg-zinc-900 text-zinc-600 hover:bg-zinc-800'}`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">Food Item</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Grilled Chicken & Quinoa"
                                    value={data.food_name}
                                    onChange={(e) => setData({ ...data, food_name: e.target.value })}
                                    className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-6 text-sm text-white outline-none focus:border-orange-500/50 transition-all font-bold"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">Calories (Kcal)</label>
                                    <input
                                        type="number"
                                        value={data.calories || ''}
                                        onChange={(e) => setData({ ...data, calories: parseFloat(e.target.value) || 0 })}
                                        className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-6 text-xl font-black text-white outline-none focus:border-orange-500/50 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">Protein (G)</label>
                                    <input
                                        type="number"
                                        value={data.protein || ''}
                                        onChange={(e) => setData({ ...data, protein: parseFloat(e.target.value) || 0 })}
                                        className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-6 text-xl font-black text-white outline-none focus:border-orange-500/50 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">Carbs (G)</label>
                                    <input
                                        type="number"
                                        value={data.carbs || ''}
                                        onChange={(e) => setData({ ...data, carbs: parseFloat(e.target.value) || 0 })}
                                        className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-6 text-xl font-black text-white outline-none focus:border-orange-500/50 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">Fats (G)</label>
                                    <input
                                        type="number"
                                        value={data.fat || ''}
                                        onChange={(e) => setData({ ...data, fat: parseFloat(e.target.value) || 0 })}
                                        className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-6 text-xl font-black text-white outline-none focus:border-orange-500/50 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-8 border-t border-white/5 bg-zinc-900/20">
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="w-full py-5 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-lg text-white flex items-center justify-center gap-2"
                            >
                                {loading ? 'Syncing...' : 'Log Nutrition Data'} <Check size={16} />
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
