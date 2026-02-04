'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface StepCardProps {
    title: string
    subtitle: string
    children: ReactNode
}

export function StepCard({ title, subtitle, children }: StepCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="relative w-full max-w-2xl"
        >
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 blur-2xl opacity-50 rounded-[3rem]" />

            <div className="relative bg-zinc-950/80 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-8 md:p-12 shadow-2xl overflow-hidden">
                {/* Abstract Background Design */}
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="100" cy="100" r="80" stroke="url(#paint0_linear)" strokeWidth="0.5" />
                        <circle cx="100" cy="100" r="60" stroke="url(#paint1_linear)" strokeWidth="0.5" />
                        <defs>
                            <linearGradient id="paint0_linear" x1="20" y1="20" x2="180" y2="180" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#A855F7" />
                                <stop offset="1" stopColor="#06B6D4" />
                            </linearGradient>
                            <linearGradient id="paint1_linear" x1="180" y1="180" x2="20" y2="20" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#06B6D4" />
                                <stop offset="1" stopColor="#A855F7" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>

                <header className="mb-10 text-center md:text-left">
                    <motion.h2
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-4xl md:text-5xl font-black font-outfit italic text-white mb-4 tracking-tight leading-tight"
                    >
                        {title}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-zinc-500 font-medium text-lg uppercase tracking-tight"
                    >
                        {subtitle}
                    </motion.p>
                </header>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    {children}
                </motion.div>
            </div>
        </motion.div>
    )
}

export function NeuralProgress({ steps, current }: { steps: number; current: number }) {
    return (
        <div className="flex gap-2 mb-12">
            {Array.from({ length: steps }).map((_, i) => {
                const isActive = i + 1 <= current
                const isLast = i + 1 === current
                return (
                    <div key={i} className="flex-1 h-1 rounded-full bg-zinc-900 overflow-hidden relative">
                        <motion.div
                            className={`h-full absolute inset-0 ${isActive ? 'bg-gradient-to-r from-purple-500 to-cyan-500' : 'bg-transparent'}`}
                            initial={{ width: 0 }}
                            animate={{ width: isActive ? '100%' : '0%' }}
                            transition={{ duration: 0.6, ease: 'circOut' }}
                        />
                        {isLast && (
                            <motion.div
                                className="absolute inset-0 bg-white/40"
                                animate={{ opacity: [0, 0.4, 0] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                            />
                        )}
                    </div>
                )
            })}
        </div>
    )
}
