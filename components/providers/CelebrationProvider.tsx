'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Star, Zap, Award } from 'lucide-react'

interface CelebrationContextType {
    celebrate: (title: string, message: string, type?: 'success' | 'milestone' | 'streak') => void
}

const CelebrationContext = createContext<CelebrationContextType | undefined>(undefined)

export function CelebrationProvider({ children }: { children: React.ReactNode }) {
    const [active, setActive] = useState<{ title: string, message: string, type: string } | null>(null)

    const celebrate = (title: string, message: string, type = 'success') => {
        setActive({ title, message, type })
        setTimeout(() => setActive(null), 5000)
    }

    return (
        <CelebrationContext.Provider value={{ celebrate }}>
            {children}
            <AnimatePresence>
                {active && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 50 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none p-6"
                    >
                        <div className="bg-zinc-950/80 backdrop-blur-3xl border border-purple-500/30 p-10 rounded-[3rem] shadow-[0_0_100px_rgba(147,51,234,0.3)] max-w-md text-center relative overflow-hidden">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                className="absolute -top-20 -right-20 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl"
                            />

                            <div className="relative z-10">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", damping: 10 }}
                                    className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl mx-auto mb-8 flex items-center justify-center text-white shadow-2xl"
                                >
                                    {active.type === 'streak' ? <Zap size={40} className="fill-white" /> :
                                        active.type === 'milestone' ? <Trophy size={40} /> : <Star size={40} className="fill-white" />}
                                </motion.div>

                                <h3 className="text-2xl font-black font-outfit uppercase italic text-white mb-3 tracking-tight">
                                    {active.title}
                                </h3>
                                <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-400 mb-6">
                                    {active.type} Achieved
                                </p>
                                <p className="text-sm text-zinc-400 font-medium leading-relaxed uppercase italic">
                                    {active.message}
                                </p>

                                <div className="mt-8 flex justify-center gap-2">
                                    {[1, 2, 3].map(i => (
                                        <motion.div
                                            key={i}
                                            animate={{
                                                y: [0, -10, 0],
                                                opacity: [0.3, 1, 0.3]
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                delay: i * 0.2
                                            }}
                                            className="w-1.5 h-1.5 rounded-full bg-purple-500"
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </CelebrationContext.Provider>
    )
}

export function useCelebration() {
    const context = useContext(CelebrationContext)
    if (context === undefined) {
        throw new Error('useCelebration must be used within a CelebrationProvider')
    }
    return context
}
