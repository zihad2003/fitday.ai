'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Scale, Flame, Zap, Moon, Smile, TrendingUp } from 'lucide-react'
import Button from '@/components/ui/Button'
import Icons from '@/components/icons/Icons'

interface DailyCheckinModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (data: any) => void
}

export default function DailyCheckinModal({ isOpen, onClose, onSave }: DailyCheckinModalProps) {
    const [step, setStep] = useState(1)
    const [data, setData] = useState({
        weight_kg: 70,
        mood: 3,
        energy: 3,
        sleep_hours: 8,
        notes: '',
        workout_intensity: 3, // 1: Easy, 5: Max Effort
        recovery_level: 3, // 1: Very Sore, 5: Fully Recovered
        equipment: 'home', // 'home' or 'gym'
        pain_points: [] as string[]
    })

    const handleSave = () => {
        onSave(data)
        onClose()
    }

    const steps = [
        { id: 1, title: 'Physique Update', icon: <Scale size={24} /> },
        { id: 2, title: 'Bio-Rhythm', icon: <Zap size={24} /> },
        { id: 3, title: 'Neural State', icon: <Smile size={24} /> }
    ]

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
                        className="relative w-full max-w-lg bg-zinc-950 border border-white/10 rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-zinc-900/40">
                            <div>
                                <h3 className="text-2xl font-black font-outfit uppercase italic text-white flex items-center gap-3">
                                    Daily <span className="text-purple-500">Sync</span>
                                </h3>
                                <div className="flex gap-2 mt-2">
                                    {steps.map(s => (
                                        <div key={s.id} className={`h-1 rounded-full transition-all duration-500 ${step >= s.id ? 'w-8 bg-purple-500' : 'w-4 bg-zinc-800'}`} />
                                    ))}
                                </div>
                            </div>
                            <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-500 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-10">
                            {step === 1 && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-14 h-14 rounded-2xl bg-purple-600/20 flex items-center justify-center text-purple-400">
                                            <Scale size={28} />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-white uppercase italic">Body Weight</h4>
                                            <p className="text-xs text-zinc-500 font-mono tracking-widest uppercase">Precision logging (KG)</p>
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={data.weight_kg}
                                            onChange={(e) => setData({ ...data, weight_kg: parseFloat(e.target.value) })}
                                            className="w-full bg-zinc-900 border-2 border-white/5 rounded-3xl p-8 text-5xl font-black font-outfit text-center text-white focus:border-purple-500/50 outline-none transition-all"
                                        />
                                        <span className="absolute right-10 top-1/2 -translate-y-1/2 text-zinc-600 font-black italic text-xl">KG</span>
                                    </div>

                                    <div className="flex justify-between mt-8">
                                        {[65, 70, 75, 80].map(val => (
                                            <button
                                                key={val}
                                                onClick={() => setData({ ...data, weight_kg: val })}
                                                className="px-6 py-3 bg-zinc-900 rounded-xl text-xs font-black text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all"
                                            >
                                                {val}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-14 h-14 rounded-2xl bg-blue-600/20 flex items-center justify-center text-blue-400">
                                            <Moon size={28} />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-white uppercase italic">Vital Metrics</h4>
                                            <p className="text-xs text-zinc-500 font-mono tracking-widest uppercase">Sleep & Energy levels</p>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-4 block">Sleep Duration</label>
                                            <div className="flex items-center gap-6 bg-zinc-900 p-6 rounded-3xl">
                                                <input
                                                    type="range" min="4" max="12" step="0.5"
                                                    value={data.sleep_hours}
                                                    onChange={(e) => setData({ ...data, sleep_hours: parseFloat(e.target.value) })}
                                                    className="flex-1 accent-purple-500"
                                                />
                                                <span className="text-2xl font-black text-white font-mono w-16">{data.sleep_hours}h</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-4 block">Recovery State</label>
                                                <div className="flex gap-2">
                                                    {[1, 2, 3, 4, 5].map(val => (
                                                        <button
                                                            key={val}
                                                            onClick={() => setData({ ...data, recovery_level: val })}
                                                            className={`flex-1 h-12 rounded-xl text-xs font-bold transition-all ${data.recovery_level === val ? 'bg-blue-600 text-white' : 'bg-zinc-900 text-zinc-600'}`}
                                                        >
                                                            {val}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-4 block">Last Workout Intensity</label>
                                                <div className="flex gap-2">
                                                    {[1, 2, 3, 4, 5].map(val => (
                                                        <button
                                                            key={val}
                                                            onClick={() => setData({ ...data, workout_intensity: val })}
                                                            className={`flex-1 h-12 rounded-xl text-xs font-bold transition-all ${data.workout_intensity === val ? 'bg-orange-600 text-white' : 'bg-zinc-900 text-zinc-600'}`}
                                                        >
                                                            {val}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-4 block">Environment</label>
                                            <div className="grid grid-cols-2 gap-4">
                                                <button
                                                    onClick={() => setData({ ...data, equipment: 'home' })}
                                                    className={`py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${data.equipment === 'home' ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-600'}`}
                                                >
                                                    🏠 Home (Limited)
                                                </button>
                                                <button
                                                    onClick={() => setData({ ...data, equipment: 'gym' })}
                                                    className={`py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${data.equipment === 'gym' ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-600'}`}
                                                >
                                                    🏋️ Full Gym
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-4 block">Physical Discomfort (Pain)</label>
                                            <div className="flex flex-wrap gap-2">
                                                {['Knees', 'Lower Back', 'Shoulders', 'Wrists', 'Ankles', 'Neck'].map(point => (
                                                    <button
                                                        key={point}
                                                        onClick={() => {
                                                            const newPoints = data.pain_points.includes(point)
                                                                ? data.pain_points.filter(p => p !== point)
                                                                : [...data.pain_points, point]
                                                            setData({ ...data, pain_points: newPoints })
                                                        }}
                                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${data.pain_points.includes(point) ? 'bg-red-600 text-white' : 'bg-zinc-900 text-zinc-600 border border-white/5'}`}
                                                    >
                                                        {point}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 flex items-center justify-center text-emerald-400">
                                            <Smile size={28} />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-white uppercase italic">Neural Sync</h4>
                                            <p className="text-xs text-zinc-500 font-mono tracking-widest uppercase">Current mood state</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-5 gap-3 mb-10">
                                        {['😫', '😕', '😐', '🙂', '🔥'].map((emoji, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setData({ ...data, mood: idx + 1 })}
                                                className={`h-20 rounded-2xl flex items-center justify-center text-3xl transition-all ${data.mood === idx + 1 ? 'bg-emerald-600 shadow-[0_0_20px_#10b981] scale-105 border-emerald-400' : 'bg-zinc-900 border border-white/5 opacity-40 hover:opacity-100'}`}
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>

                                    <textarea
                                        placeholder="Physical or mental notes for today..."
                                        className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-6 text-xs text-zinc-300 min-h-[100px] outline-none focus:border-purple-500/50 transition-all font-medium leading-relaxed"
                                        value={data.notes}
                                        onChange={(e) => setData({ ...data, notes: e.target.value })}
                                    />
                                </motion.div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-8 border-t border-white/5 bg-zinc-900/20 flex gap-4">
                            {step > 1 && (
                                <button
                                    onClick={() => setStep(step - 1)}
                                    className="px-8 py-4 bg-zinc-800 hover:bg-zinc-700 rounded-2xl font-black text-xs uppercase tracking-widest text-zinc-400 transition-all"
                                >
                                    Back
                                </button>
                            )}
                            {step < 3 ? (
                                <button
                                    onClick={() => setStep(step + 1)}
                                    className="flex-1 py-4 bg-purple-600 hover:bg-purple-500 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-lg text-white"
                                >
                                    Continue
                                </button>
                            ) : (
                                <button
                                    onClick={handleSave}
                                    className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-lg text-white"
                                >
                                    Seal Protocol
                                </button>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
