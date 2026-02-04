'use client'

import { motion } from 'framer-motion'
import {
    User,
    Target,
    Zap,
    Droplet,
    Moon,
    Activity,
    Edit2,
    ChevronRight,
    Shield,
    Dna,
    Cpu
} from 'lucide-react'
import { useState } from 'react'

interface ProfileProps {
    user: any
    onEdit: () => void
}

export default function ProfileRedesign({ user, onEdit }: ProfileProps) {
    const [stats] = useState([
        { label: 'Neural Goal', value: user.goal.replace('_', ' '), icon: Target, color: 'text-purple-400', bg: 'bg-purple-400/10' },
        { label: 'Metabolism', value: `${user.target_calories} Kcal`, icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
        { label: 'Hydration', value: `${user.daily_water_goal_ml || 2500}ml`, icon: Droplet, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { label: 'Recovery', value: user.sleep_time || '23:00', icon: Moon, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
    ])

    return (
        <div className="space-y-12">
            {/* Hero Profile Section */}
            <section className="relative">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-600/20 blur-[120px] rounded-full pointer-events-none" />

                <div className="relative bg-zinc-950/50 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-8 md:p-12 overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                        <Dna size={300} strokeWidth={0.5} />
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-10">
                        {/* Avatar */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-tr from-purple-600 to-cyan-500 rounded-[2.5rem] blur opacity-30 group-hover:opacity-60 transition duration-1000" />
                            <div className="relative w-40 h-40 bg-zinc-900 rounded-[2.5rem] flex items-center justify-center border border-white/10 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-transparent" />
                                <User size={64} className="text-zinc-700" />
                            </div>
                            <button
                                onClick={onEdit}
                                className="absolute -bottom-2 -right-2 w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center shadow-2xl hover:scale-110 transition-transform active:scale-95"
                            >
                                <Edit2 size={20} />
                            </button>
                        </div>

                        {/* Identity */}
                        <div className="flex-1 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-zinc-900 border border-white/5 rounded-full mb-6">
                                <Shield size={12} className="text-purple-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Verified biological profile</span>
                            </div>
                            <h1 className="text-5xl md:text-6xl font-black font-outfit italic tracking-tighter text-white mb-2">{user.name}</h1>
                            <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.3em] mb-8">{user.email} // ID: FIT-{user.id?.toString().padStart(4, '0')}</p>

                            <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                <Badge label={`${user.age} YRS`} />
                                <Badge label={`${user.weight_kg} KG`} />
                                <Badge label={`${user.height_cm} CM`} />
                                <Badge label={user.gender} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Neural Stats Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="group relative bg-zinc-900/50 border border-white/5 p-6 rounded-[2rem] hover:bg-zinc-800/50 transition-all"
                    >
                        <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6`}>
                            <stat.icon size={24} />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-1">{stat.label}</p>
                        <h3 className="text-xl font-black font-outfit italic text-white group-hover:translate-x-1 transition-transform">{stat.value}</h3>
                    </motion.div>
                ))}
            </section>

            {/* Advanced Parameters */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card title="Activity Parameters">
                        <div className="flex items-center justify-between p-6 bg-black/40 border border-white/5 rounded-3xl group">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500">
                                    <Activity size={28} />
                                </div>
                                <div>
                                    <h4 className="text-white font-black font-outfit italic uppercase tracking-wider text-xl">{user.activity_level.replace('_', ' ')}</h4>
                                    <p className="text-zinc-600 text-xs">Standard daily energy expenditure multiplier</p>
                                </div>
                            </div>
                            <ChevronRight size={24} className="text-zinc-800 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card title="Workout Frequency">
                            <div className="flex items-end gap-2">
                                <span className="text-5xl font-black font-outfit italic text-white">{user.workout_days_per_week || 4}</span>
                                <span className="text-xs font-black uppercase tracking-widest text-zinc-700 mb-2">Days / Week</span>
                            </div>
                            <div className="mt-6 flex gap-1">
                                {Array.from({ length: 7 }).map((_, i) => (
                                    <div key={i} className={`h-1.5 flex-1 rounded-full ${i < (user.workout_days_per_week || 4) ? 'bg-purple-500' : 'bg-zinc-800'}`} />
                                ))}
                            </div>
                        </Card>
                        <Card title="Digital Twin Status">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <Cpu size={32} className="text-cyan-500 animate-pulse" />
                                    <div className="absolute -inset-1 bg-cyan-500 blur opacity-20" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Sync Status</p>
                                    <p className="text-white font-black font-outfit italic uppercase">100% Calibrated</p>
                                </div>
                            </div>
                            <div className="mt-6 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} className="h-full bg-cyan-500" />
                            </div>
                        </Card>
                    </div>
                </div>

                <div className="space-y-8">
                    <Card title="Privacy Protocol">
                        <div className="space-y-6">
                            <PrivacyItem label="Neural Data Encryption" status="Active" />
                            <PrivacyItem label="Biometric Privacy" status="Level 4" />
                            <PrivacyItem label="Cloud Sync" status="Encrypted" />
                            <button className="w-full py-4 bg-zinc-900 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all">
                                Reset Identity
                            </button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}

function Badge({ label }: { label: string }) {
    return (
        <div className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400">
            {label}
        </div>
    )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="bg-zinc-950/50 border border-white/5 rounded-[2.5rem] p-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-8">{title}</h3>
            {children}
        </div>
    )
}

function PrivacyItem({ label, status }: { label: string; status: string }) {
    return (
        <div className="flex justify-between items-center py-3 border-b border-white/5">
            <span className="text-[10px] font-medium text-zinc-600 uppercase tracking-widest">{label}</span>
            <span className="text-[10px] font-black text-purple-500 uppercase tracking-widest">{status}</span>
        </div>
    )
}
