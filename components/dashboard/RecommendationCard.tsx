'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Icons from '@/components/icons/Icons'
import { Sparkles, ArrowRight, X, Check, Zap, Flame, Moon } from 'lucide-react'

interface Adjustment {
    type: 'calorie' | 'workout' | 'rest' | 'macro' | 'deload'
    reason: string
    description: string
    new_value: any
    priority: number
}

interface RecommendationCardProps {
    adjustments: Adjustment[]
    onAccept: (adjustment: Adjustment) => void
    onDismiss: (index: number) => void
}

export default function RecommendationCard({ adjustments, onAccept, onDismiss }: RecommendationCardProps) {
    if (adjustments.length === 0) return null

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-600/20 flex items-center justify-center text-purple-500">
                        <Sparkles size={16} />
                    </div>
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white italic">Neural Adaptations</h3>
                        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Active Intelligence Engine</p>
                    </div>
                </div>
                <div className="px-2 py-1 rounded bg-zinc-900 border border-white/5 text-[8px] font-mono text-zinc-600 uppercase">
                    {adjustments.length} Pending
                </div>
            </div>

            <AnimatePresence mode="popLayout">
                {adjustments.map((adj, idx) => (
                    <motion.div
                        key={`${adj.type}-${idx}`}
                        initial={{ opacity: 0, x: 20, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -20, scale: 0.95 }}
                        className="glass-card relative overflow-hidden group border border-purple-500/10 hover:border-purple-500/30 transition-all p-5"
                    >
                        <div className="absolute top-0 right-0 p-4 flex gap-2">
                            <button
                                onClick={() => onDismiss(idx)}
                                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/10 transition-all"
                            >
                                <X size={14} />
                            </button>
                        </div>

                        <div className="flex gap-5">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${getTypeColor(adj.type)} shadow-lg`}>
                                {getTypeIcon(adj.type)}
                            </div>

                            <div className="flex-1 pr-8">
                                <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">{adj.reason}</div>
                                <h4 className="text-sm font-black text-white uppercase italic leading-tight mb-2">{adj.description}</h4>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => onAccept(adj)}
                                        className="px-4 py-2 bg-purple-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-purple-500 transition-all flex items-center gap-2"
                                    >
                                        Deploy <Check size={12} />
                                    </button>
                                    <span className="text-[10px] font-mono text-zinc-600 uppercase italic">Priority: {adj.priority}/5</span>
                                </div>
                            </div>
                        </div>

                        {/* Visual accent */}
                        <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity blur-2xl" />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    )
}

function getTypeIcon(type: string) {
    switch (type) {
        case 'calorie': return <Flame size={20} className="text-orange-950" />
        case 'workout': return <Zap size={20} className="text-purple-950" />
        case 'macro': return <Icons.Sparkles size={20} className="text-emerald-950" />
        case 'rest': return <Moon size={20} className="text-indigo-950" />
        case 'deload': return <Activity size={20} className="text-amber-950" />
        default: return <Sparkles size={20} className="text-white" />
    }
}

function getTypeColor(type: string) {
    switch (type) {
        case 'calorie': return 'bg-orange-500 shadow-orange-500/20'
        case 'workout': return 'bg-purple-500 shadow-purple-500/20'
        case 'macro': return 'bg-emerald-500 shadow-emerald-500/20'
        case 'rest': return 'bg-indigo-500 shadow-indigo-500/20'
        case 'deload': return 'bg-amber-500 shadow-amber-500/20'
        default: return 'bg-zinc-800'
    }
}

function Activity({ size, className }: { size: number, className: string }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="3" fill="none" className={className}>
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    )
}
