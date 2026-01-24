'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Calendar, Activity, Map, Bot, Play, LogOut } from 'lucide-react'
import { logoutUser } from '@/lib/auth'

const NavIcon = ({ icon: Icon, active, href }: { icon: any, active?: boolean, href: string }) => (
    <Link href={href}>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 cursor-pointer ${active ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)]' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>
            <Icon size={20} />
        </div>
    </Link>
);

export default function Sidebar() {
    const pathname = usePathname()

    const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/')

    return (
        <aside className="wavy-sidebar shrink-0 hidden md:flex h-screen sticky top-0 flex-col py-10 pl-6 pr-4 border-r border-white/5 bg-black/50 backdrop-blur-xl">
            <div className="mb-20 pl-2">
                <Link href="/">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg shadow-[0_0_15px_rgba(147,51,234,0.4)] flex items-center justify-center font-black text-white text-[10px]">FD</div>
                </Link>
            </div>

            <div className="flex-1 flex flex-col gap-8">
                <NavIcon icon={LayoutDashboard} active={isActive('/dashboard')} href="/dashboard" />
                <NavIcon icon={Calendar} active={isActive('/calendar')} href="/calendar" />
                <NavIcon icon={Activity} active={isActive('/activity')} href="/activity" />
                <NavIcon icon={Map} active={isActive('/map')} href="/map" />
                <NavIcon icon={Bot} active={isActive('/chat')} href="/chat" />
                <NavIcon icon={Play} active={isActive('/videos')} href="/videos" />
            </div>

            <div className="mt-auto pl-1">
                <button onClick={() => logoutUser()} className="w-12 h-12 flex items-center justify-center text-red-400 hover:bg-red-500/10 rounded-2xl transition-all">
                    <LogOut size={20} />
                </button>
            </div>
        </aside>
    )
}
