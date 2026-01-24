'use client'

import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Coffee, Dumbbell, Droplets, Moon, Check, Clock, ChevronRight, Zap } from 'lucide-react'
import { ScheduleItem } from '@/lib/schedule-engine'

interface LiveScheduleProps {
    schedule: ScheduleItem[]
}

const getIcon = (type: string) => {
    switch (type) {
        case 'meal': return <Coffee size={18} className="text-orange-400" />
        case 'workout': return <Dumbbell size={18} className="text-purple-500" />
        case 'hydration': return <Droplets size={18} className="text-blue-400" />
        case 'sleep': return <Moon size={18} className="text-indigo-300" />
        default: return <Clock size={18} className="text-zinc-400" />
    }
}

export default function LiveSchedule({ schedule }: LiveScheduleProps) {
    const [now, setNow] = useState(new Date())
    const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set())
    const scrollRef = useRef<HTMLDivElement>(null)

    // Update time every minute
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60000)
        return () => clearInterval(timer)
    }, [])

    const currentHM = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })

    const toggleTask = (id: string) => {
        setCompletedTasks(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    return (
        <div className="bg-zinc-950 border border-white/5 rounded-[2.5rem] p-0 relative overflow-hidden h-full flex flex-col shadow-2xl">
            {/* Header */}
            <div className="p-8 pb-4 border-b border-white/5 flex justify-between items-center bg-zinc-900/30">
                <div>
                    <h3 className="text-2xl font-black font-outfit uppercase italic text-white flex items-center gap-3">
                        Timeline
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                        </span>
                    </h3>
                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] mt-1">Your Daily Protocol</p>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-black font-mono text-white/90 leading-none">{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    <div className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">{now.toLocaleDateString([], { weekday: 'long' })}</div>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar p-6 space-y-2 relative" ref={scrollRef}>
                {schedule.map((item, index) => {
                    const isNext = item.time >= currentHM && (index === 0 || schedule[index - 1].time < currentHM)
                    const isCompleted = completedTasks.has(item.id)
                    const isPassed = item.time < currentHM && !isNext

                    return (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`group relative rounded-3xl p-4 transition-all duration-300 border ${isNext
                                    ? 'bg-gradient-to-r from-purple-900/20 to-transparent border-purple-500/50 shadow-[0_0_30px_rgba(147,51,234,0.1)]'
                                    : isCompleted
                                        ? 'bg-zinc-900/30 border-white/5 opacity-60'
                                        : 'bg-white/5 border-white/5 hover:border-white/10'
                                }`}
                        >
                            {/* Connector Line */}
                            {index !== schedule.length - 1 && (
                                <div className="absolute left-[34px] top-16 bottom-[-20px] w-px bg-gradient-to-b from-white/10 to-transparent z-0" />
                            )}

                            <div className="flex items-start gap-5 relative z-10">
                                {/* Time & Icon Column */}
                                <div className="flex flex-col items-center gap-2">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${isNext
                                            ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_15px_#9333ea]'
                                            : isCompleted
                                                ? 'bg-emerald-900/20 border-emerald-500/20 text-emerald-500'
                                                : 'bg-black border-white/10 text-zinc-500'
                                        }`}>
                                        {isCompleted ? <Check size={20} className="stroke-[3]" /> : getIcon(item.type)}
                                    </div>
                                    <div className={`text-[10px] font-mono font-bold tracking-widest ${isNext ? 'text-purple-400' : 'text-zinc-600'}`}>
                                        {item.time}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 pt-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            {isNext && (
                                                <div className="flex items-center gap-1 mb-1 text-[9px] font-black uppercase tracking-widest text-purple-400">
                                                    <Zap size={10} className="fill-purple-400" />
                                                    Current Task
                                                </div>
                                            )}
                                            <h4 className={`text-base font-black font-outfit uppercase italic leading-tight ${isCompleted ? 'line-through text-zinc-600' : 'text-white'}`}>
                                                {item.title}
                                            </h4>
                                        </div>

                                        {/* Interaction: Checkbox */}
                                        <button
                                            onClick={() => toggleTask(item.id)}
                                            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${isCompleted
                                                    ? 'bg-emerald-500 border-emerald-500 text-black'
                                                    : 'border-white/20 hover:border-white text-transparent hover:bg-white/10'
                                                }`}
                                        >
                                            <Check size={14} className="stroke-[4]" />
                                        </button>
                                    </div>

                                    <p className={`text-[11px] mt-2 font-medium leading-relaxed ${isCompleted ? 'text-zinc-700' : 'text-zinc-400'}`}>
                                        {item.description}
                                    </p>

                                    {/* Extended Meta Tags */}
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        <div className="px-2 py-1 rounded-md bg-black/40 border border-white/5 text-[9px] font-mono text-zinc-500 uppercase">
                                            {item.type}
                                        </div>
                                        {item.calories && (
                                            <div className="px-2 py-1 rounded-md bg-orange-900/20 border border-orange-500/20 text-[9px] font-mono text-orange-400 uppercase">
                                                {item.calories} Kcal
                                            </div>
                                        )}
                                        {item.protein && (
                                            <div className="px-2 py-1 rounded-md bg-purple-900/20 border border-purple-500/20 text-[9px] font-mono text-purple-400 uppercase">
                                                {item.protein}G Pro
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            {/* Completion Progress Bar */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-zinc-800">
                <motion.div
                    className="h-full bg-emerald-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${(completedTasks.size / schedule.length) * 100}%` }}
                />
            </div>
        </div>
    )
}
