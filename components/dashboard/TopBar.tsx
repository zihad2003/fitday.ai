'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Bell, User, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getUserSession } from '@/lib/auth'

export default function TopBar({ title, subtitle }: { title: string, subtitle?: string }) {
    const [showNotifications, setShowNotifications] = useState(false)
    const [showSearch, setShowSearch] = useState(false)

    return (
        <nav className="flex justify-between items-center mb-12 relative z-50">
            <div>
                <h1 className="text-3xl font-black font-outfit italic tracking-tighter uppercase leading-none">
                    FitDay <span className="text-purple-500">{title}</span>
                </h1>
                {subtitle && <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.4em] mt-2">{subtitle}</p>}
            </div>

            <div className="flex items-center gap-6">
                {/* Search Bar - Expandable */}
                <div className={`flex items-center bg-zinc-950 border border-white/5 rounded-2xl h-14 transition-all duration-300 ${showSearch ? 'w-64 px-4' : 'w-14 p-1 justify-center'}`}>
                    {showSearch ? (
                        <div className="flex items-center w-full gap-2">
                            <Search size={18} className="text-zinc-500" />
                            <input
                                autoFocus
                                placeholder="Search..."
                                className="bg-transparent border-none outline-none text-xs font-bold text-white w-full placeholder:text-zinc-700 font-outfit uppercase tracking-widest"
                                onBlur={() => setShowSearch(false)}
                            />
                        </div>
                    ) : (
                        <button onClick={() => setShowSearch(true)} className="w-full h-full flex items-center justify-center text-zinc-500 hover:text-white transition-colors">
                            <Search size={18} />
                        </button>
                    )}
                </div>

                <div className="flex bg-zinc-950 border border-white/5 p-1 rounded-2xl h-14 relative">

                    {/* Notifications Toggle */}
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`w-12 h-12 flex items-center justify-center transition-colors relative ${showNotifications ? 'text-purple-500 bg-white/5 rounded-xl' : 'text-zinc-500 hover:text-white'}`}
                    >
                        <Bell size={18} />
                        <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    </button>

                    <Link href="/profile" className="w-12 h-12 flex items-center justify-center text-zinc-500 hover:text-white transition-colors">
                        <User size={18} />
                    </Link>
                </div>
            </div>

            {/* Notification Dropdown Panel (The "Right Sidebar" request) */}
            <AnimatePresence>
                {showNotifications && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-20 right-0 w-80 bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
                    >
                        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-zinc-900/50">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Notifications</h4>
                            <button onClick={() => setShowNotifications(false)}><X size={14} className="text-zinc-500 hover:text-white" /></button>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="p-4 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors">
                                    <div className="flex gap-3 mb-1">
                                        <div className="w-2 h-2 mt-1 rounded-full bg-purple-500 shrink-0" />
                                        <p className="text-xs font-bold text-zinc-300 font-outfit">Drink Water</p>
                                    </div>
                                    <p className="text-[10px] text-zinc-600 pl-5">It's time for your hydration check. +250ml.</p>
                                </div>
                            ))}
                            <div className="p-4 text-center">
                                <button className="text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-purple-400 transition-colors">Mark all as read</button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </nav>
    )
}
