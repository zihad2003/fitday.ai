'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Icons from '@/components/icons/Icons'

interface ScheduleSettingsProps {
    isOpen: boolean
    onClose: () => void
    onSave: (prefs: any) => void
    currentPrefs: any
}

export default function ScheduleSettingsModal({ isOpen, onClose, onSave, currentPrefs }: ScheduleSettingsProps) {
    const [prefs, setPrefs] = useState({
        wakeTime: '07:00',
        workoutTime: '18:00',
        bedTime: '23:00'
    })

    useEffect(() => {
        if (currentPrefs) {
            setPrefs(prev => ({ ...prev, ...currentPrefs }))
        }
    }, [currentPrefs])

    const handleSave = () => {
        onSave(prefs)
        onClose()
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="glass-card w-full max-w-sm rounded-[2rem] overflow-hidden"
                    >
                        <div className="p-6 border-b border-white/5 flex justify-between items-center">
                            <h3 className="text-xl font-black font-outfit uppercase italic text-white leading-none">
                                Sync Timeline
                            </h3>
                            <button onClick={onClose} className="text-zinc-500 hover:text-white">
                                <Icons.Minimize size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
                                    Wake Up Protocol
                                </label>
                                <div className="relative">
                                    <Icons.Sun className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400" size={18} />
                                    <input
                                        type="time"
                                        value={prefs.wakeTime}
                                        onChange={(e) => setPrefs({ ...prefs, wakeTime: e.target.value })}
                                        className="w-full bg-zinc-900 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-white font-mono text-lg focus:border-purple-500 outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
                                    Training Block
                                </label>
                                <div className="relative">
                                    <Icons.Strength className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" size={18} />
                                    <input
                                        type="time"
                                        value={prefs.workoutTime}
                                        onChange={(e) => setPrefs({ ...prefs, workoutTime: e.target.value })}
                                        className="w-full bg-zinc-900 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-white font-mono text-lg focus:border-purple-500 outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
                                    Sleep Target
                                </label>
                                <div className="relative">
                                    <Icons.Moon className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" size={18} />
                                    <input
                                        type="time"
                                        value={prefs.bedTime}
                                        onChange={(e) => setPrefs({ ...prefs, bedTime: e.target.value })}
                                        className="w-full bg-zinc-900 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-white font-mono text-lg focus:border-purple-500 outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleSave}
                                className="w-full py-4 bg-purple-600 hover:bg-purple-500 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95 text-white"
                            >
                                Optimize Schedule
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

// Helper icon component since Sun isn't in Icons.tsx yet
// Wait, I should add Sun manually to the file content if Icons doesn't have it.
// I'll check Icons.tsx for Sun.
