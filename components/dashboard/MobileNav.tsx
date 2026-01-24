'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Calendar, Activity, Bot, User } from 'lucide-react'
import { motion } from 'framer-motion'

export default function MobileNav() {
    const pathname = usePathname()
    const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/')

    const navItems = [
        { icon: LayoutDashboard, href: '/dashboard', label: 'Home' },
        { icon: Calendar, href: '/diet', label: 'Diet' },
        { icon: Bot, href: '/chat', label: 'Coach' },
        { icon: Activity, href: '/workout', label: 'Workout' },
        { icon: User, href: '/profile', label: 'Profile' },
    ]

    return (
        <div className="md:hidden fixed bottom-6 left-6 right-6 z-[100]">
            <nav className="bg-zinc-950/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-2 flex items-center justify-between shadow-2xl overflow-hidden">
                {navItems.map((item) => {
                    const active = isActive(item.href)
                    return (
                        <Link key={item.href} href={item.href} className="relative flex-1 flex flex-col items-center py-3">
                            <div className={`relative z-10 transition-all duration-300 ${active ? 'text-purple-500 scale-110' : 'text-zinc-600'}`}>
                                <item.icon size={20} strokeWidth={active ? 2.5 : 2} />
                            </div>
                            {active && (
                                <motion.div
                                    layoutId="mobile-nav-active"
                                    className="absolute inset-0 bg-purple-500/10 rounded-2xl"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            {active && (
                                <motion.div
                                    layoutId="mobile-nav-dot"
                                    className="absolute -bottom-1 w-1 h-1 bg-purple-500 rounded-full"
                                />
                            )}
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}
