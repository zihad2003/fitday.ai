'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Calendar, Activity, Map, Bot, Play, LogOut, Settings } from 'lucide-react'
import { logoutUser } from '@/lib/auth'
import { motion } from 'framer-motion'
import { HoverScale } from '@/components/animations/Transitions'

const NavIcon = ({ icon: Icon, active, href, label }: { icon: any, active?: boolean, href: string, label: string }) => (
    <HoverScale scale={1.1}>
        <Link href={href} title={label} aria-label={label}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 cursor-pointer relative group ${active ? 'bg-purple-600 text-white shadow-[0_0_25px_rgba(147,51,234,0.5)]' : 'text-zinc-500 hover:text-white hover:bg-white/5 saturate-[0.8] hover:saturate-100'}`}>
                <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                {active && (
                    <motion.div
                        layoutId="sidebar-active"
                        className="absolute -left-2 w-1.5 h-8 bg-purple-500 rounded-r-full"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                )}
                {/* Tooltip on hover */}
                <div className="absolute left-full ml-4 px-3 py-1.5 bg-zinc-900 border border-white/10 rounded-lg text-white font-black text-[9px] uppercase tracking-widest opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none z-50 whitespace-nowrap shadow-2xl">
                    {label}
                </div>
            </div>
        </Link>
    </HoverScale>
);

export default function Sidebar() {
    const pathname = usePathname()
    const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/')

    return (
        <aside className="shrink-0 hidden md:flex h-screen sticky top-0 flex-col py-10 pl-6 pr-5 border-r border-white/5 bg-black/40 backdrop-blur-3xl z-[100]">
            <div className="mb-20 pl-2">
                <Link href="/" aria-label="Go to landing page">
                    <motion.div
                        whileHover={{ scale: 1.05, rotate: -5 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-[0_0_20px_rgba(147,51,234,0.4)] flex items-center justify-center font-black text-white text-xs border border-white/10"
                    >
                        FD
                    </motion.div>
                </Link>
            </div>

            <nav className="flex-1 flex flex-col gap-8 items-center" aria-label="Main Navigation">
                <NavIcon icon={LayoutDashboard} active={isActive('/dashboard')} href="/dashboard" label="Intelligence" />
                <NavIcon icon={Calendar} active={isActive('/diet')} href="/diet" label="Nutrition" />
                <NavIcon icon={Activity} active={isActive('/workout')} href="/workout" label="Training" />
                <NavIcon icon={Map} active={isActive('/progress')} href="/progress" label="Analytics" />
                <NavIcon icon={Bot} active={isActive('/chat')} href="/chat" label="AI Coach" />
                <NavIcon icon={Play} active={isActive('/videos')} href="/videos" label="Archives" />
            </nav>

            <div className="mt-auto flex flex-col gap-6 items-center">
                <Link href="/profile" aria-label="User Settings" className="text-zinc-500 hover:text-white transition-colors">
                    <Settings size={20} />
                </Link>
                <button
                    onClick={() => logoutUser()}
                    className="w-14 h-14 flex items-center justify-center text-red-500/60 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all duration-300"
                    title="Terminate Session"
                    aria-label="Logout"
                >
                    <LogOut size={22} />
                </button>
            </div>
        </aside>
    )
}

