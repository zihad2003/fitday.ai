'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Bell, User, X, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getUserSession } from '@/lib/auth'
import { HoverScale, FadeIn } from '@/components/animations/Transitions'

export default function TopBar({ title, subtitle }: { title: string, subtitle?: string }) {
    const [showNotifications, setShowNotifications] = useState(false)
    const [showSearch, setShowSearch] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <nav className={`flex justify-between items-center mb-10 relative z-[90] transition-all duration-300 ${scrolled ? 'py-4' : 'py-0'}`}>
            <FadeIn>
                <div className="flex flex-col">
                    <div className="flex items-center gap-3">
                        <div className="md:hidden w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center font-black text-white text-[10px]">FD</div>
                        <h1 className="text-2xl md:text-4xl font-black font-outfit italic tracking-tight uppercase leading-none">
                            FITDAY <span className="text-purple-500">{title}</span>
                        </h1>
                    </div>
                    {subtitle && (
                        <div className="flex items-center gap-2 mt-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <p className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.4em]">{subtitle}</p>
                        </div>
                    )}
                </div>
            </FadeIn>

            <div className="flex items-center gap-4 md:gap-6">
                {/* AI Status Indicator */}
                <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/5 rounded-2xl">
                    <Zap size={14} className="text-purple-500 fill-purple-500" />
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Neural Link Active</span>
                </div>

                {/* Search Bar - Expandable */}
                <motion.div
                    layout
                    className={`flex items-center bg-zinc-950/50 backdrop-blur-md border border-white/5 rounded-2xl h-12 md:h-14 transition-all duration-500 ${showSearch ? 'w-48 md:w-80 px-4 ring-2 ring-purple-500/20 border-purple-500/30' : 'w-12 md:w-14 p-1 justify-center'}`}
                >
                    {showSearch ? (
                        <div className="flex items-center w-full gap-3 overflow-hidden">
                            <Search size={18} className="text-purple-500" />
                            <input
                                autoFocus
                                placeholder="Universal Search..."
                                className="bg-transparent border-none outline-none text-[10px] md:text-xs font-bold text-white w-full placeholder:text-zinc-700 font-outfit uppercase tracking-widest"
                                onBlur={() => setShowSearch(false)}
                            />
                            <button onClick={() => setShowSearch(false)} className="text-zinc-600 hover:text-white transition-colors">
                                <X size={14} />
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => setShowSearch(true)} className="w-full h-full flex items-center justify-center text-zinc-500 hover:text-white transition-colors">
                            <Search size={18} />
                        </button>
                    )}
                </motion.div>

                <div className="flex bg-zinc-950/50 backdrop-blur-md border border-white/5 p-1 rounded-2xl h-12 md:h-14 relative">
                    {/* Notifications Toggle */}
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center transition-all relative ${showNotifications ? 'text-purple-400 bg-white/5 rounded-xl scale-95' : 'text-zinc-500 hover:text-white'}`}
                        aria-label="View notifications"
                    >
                        <Bell size={18} />
                        <span className="absolute top-3 right-3 w-1.5 h-1.5 bg-purple-500 rounded-full animate-ping" />
                        <span className="absolute top-3 right-3 w-1.5 h-1.5 bg-purple-500 rounded-full" />
                    </button>

                    <Link href="/profile" aria-label="Profile Settings">
                        <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-zinc-500 hover:text-white transition-colors group">
                            <User size={18} className="group-hover:scale-110 transition-transform" />
                        </div>
                    </Link>
                </div>
            </div>

            {/* Notification Dropdown Panel */}
            <AnimatePresence>
                {showNotifications && (
                    <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.95 }}
                        className="absolute top-20 right-0 w-80 bg-zinc-950 border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden backdrop-blur-2xl"
                    >
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-zinc-900/40">
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Incoming Feed</h4>
                                <p className="text-[8px] text-zinc-600 uppercase mt-0.5">3 Unread Alerts</p>
                            </div>
                            <button onClick={() => setShowNotifications(false)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-500 hover:text-white transition-colors">
                                <X size={14} />
                            </button>
                        </div>
                        <div className="max-h-[400px] overflow-y-auto subtle-scrollbar">
                            <NotificationItem
                                title="Threshold Breach"
                                body="Calories exceeded daily allocation by 12%. Adjusting dinner protocol."
                                time="12m ago"
                                type="warning"
                            />
                            <NotificationItem
                                title="Hydration Synchronized"
                                body="Optimal water levels reached for current metabolic state."
                                time="1h ago"
                                type="success"
                            />
                            <NotificationItem
                                title="System Update"
                                body="Neural Coach has updated your training intensity coefficients."
                                time="4h ago"
                                type="info"
                            />
                            <div className="p-6 text-center">
                                <button className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-600 hover:text-purple-400 transition-colors">Archive All Logs</button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    )
}

function NotificationItem({ title, body, time, type }: { title: string, body: string, time: string, type: 'warning' | 'success' | 'info' }) {
    const colors = {
        warning: 'bg-orange-500',
        success: 'bg-emerald-500',
        info: 'bg-indigo-500'
    }

    return (
        <div className="p-6 border-b border-white/5 hover:bg-white/[0.02] cursor-pointer transition-colors group">
            <div className="flex justify-between items-start mb-2">
                <div className="flex gap-3 items-center">
                    <div className={`w-1.5 h-1.5 rounded-full ${colors[type]} group-hover:scale-125 transition-transform`} />
                    <p className="text-[11px] font-black text-white font-outfit uppercase tracking-wider">{title}</p>
                </div>
                <span className="text-[8px] font-mono text-zinc-700 uppercase">{time}</span>
            </div>
            <p className="text-[10px] text-zinc-500 pl-4 leading-relaxed group-hover:text-zinc-400 transition-colors">{body}</p>
        </div>
    )
}

