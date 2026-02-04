'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Calendar, Dumbbell, Utensils, Zap, Clock,
    ChevronRight, ArrowLeft, Target, Shield,
    Thermometer, Activity, Droplet
} from 'lucide-react'
import Link from 'next/link'
import Sidebar from '@/components/dashboard/Sidebar'
import MobileNav from '@/components/dashboard/MobileNav'
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from '@/components/animations/Transitions'

export default function GrowthHub() {
    const [loading, setLoading] = useState(true)
    const [planData, setPlanData] = useState<any>(null)

    useEffect(() => {
        const fetchPlan = async () => {
            try {
                // Fetch user data for context
                const meRes = await fetch('/api/auth/me')
                const meJson = await meRes.json()

                if (meJson.success) {
                    const user = meJson.data
                    setPlanData({
                        weeklySplit: user.fitness_goal === 'build_muscle'
                            ? ['Push', 'Pull', 'Legs', 'Rest', 'Upper', 'Lower', 'Rest']
                            : ['Full Body', 'Rest', 'Full Body', 'Rest', 'Full Body', 'Cardio', 'Rest'],
                        dailyMacros: {
                            calories: user.target_calories,
                            protein: Math.round(user.target_calories * 0.3 / 4),
                            carbs: Math.round(user.target_calories * 0.4 / 4),
                            fats: Math.round(user.target_calories * 0.3 / 9),
                        },
                        mealSchedule: [
                            { time: user.wake_up_time || '07:00', type: 'Breakfast', menu: 'Oatmeal with Blueberries & Whey' },
                            { time: '13:00', type: 'Lunch', menu: 'Grilled Chicken & Quinoa Salad' },
                            { time: '16:00', type: 'Snack', menu: 'Greek Yogurt & Almonds' },
                            { time: user.sleep_time ? `${parseInt(user.sleep_time) - 3}:00` : '20:00', type: 'Dinner', menu: 'Salmon with Steamed Broccoli' },
                        ],
                        trainingDetails: {
                            sessionsPerWeek: user.workout_days_per_week || 4,
                            avgDuration: user.workout_duration_preference || 60,
                            focus: user.fitness_goal?.replace('_', ' ') || 'General Fitness'
                        }
                    })
                }
            } catch (err) {
                console.error("Plan load failed", err)
            } finally {
                setLoading(false)
            }
        }
        fetchPlan()
    }, [])

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className={`w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin`} />
        </div>
    )

    return (
        <PageTransition>
            <div className="min-h-screen bg-black text-white flex font-inter overflow-hidden">
                <Sidebar activePage="plans" />
                <MobileNav activePage="plans" />

                <main className="flex-1 overflow-y-auto p-6 md:p-10 no-scrollbar relative">
                    {/* Atmosphere */}
                    <div className="fixed inset-0 pointer-events-none">
                        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/10 blur-[150px]" />
                        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-900/10 blur-[150px]" />
                    </div>

                    <div className="max-w-6xl mx-auto relative z-10">
                        <header className="flex justify-between items-center mb-16">
                            <div className="space-y-2">
                                <h1 className="text-4xl md:text-5xl font-black font-outfit italic tracking-tight uppercase">
                                    Protocol <span className="text-purple-500">Manifest</span>
                                </h1>
                                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.4em]">Comprehensive Roadmap for Adaptation</p>
                            </div>
                            <div className="hidden md:flex items-center gap-4 px-6 py-3 bg-white/5 border border-white/5 rounded-2xl">
                                <Shield size={16} className="text-purple-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Biological Directive V2.4</span>
                            </div>
                        </header>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                            {/* Column 1: Nutrition Architecture */}
                            <div className="lg:col-span-4 space-y-8">
                                <section className="p-8 bg-zinc-950 border border-white/5 rounded-[2.5rem] relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <Utensils size={120} />
                                    </div>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-10 flex items-center gap-3">
                                        Fuel Structure
                                        <div className="h-px flex-1 bg-white/5" />
                                    </h3>

                                    <div className="space-y-6">
                                        <MacroItem label="Energy Allocation" value={`${planData.dailyMacros.calories} KCAL`} icon={Zap} color="text-yellow-500" />
                                        <MacroItem label="Amino Synthesis" value={`${planData.dailyMacros.protein}G PRO`} icon={Activity} color="text-purple-500" />
                                        <MacroItem label="Glycogen Load" value={`${planData.dailyMacros.carbs}G CHO`} icon={Zap} color="text-cyan-500" />
                                        <MacroItem label="Lipid Balance" value={`${planData.dailyMacros.fats}G FAT`} icon={Droplet} color="text-orange-500" />
                                    </div>

                                    <div className="mt-12 pt-8 border-t border-white/5">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-4">Meal Synchronization</p>
                                        <div className="space-y-4">
                                            {planData.mealSchedule.map((meal: any, i: number) => (
                                                <div key={i} className="flex gap-4">
                                                    <span className="text-[10px] font-mono text-zinc-700 w-12 shrink-0">{meal.time}</span>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase text-white leading-none mb-1">{meal.type}</p>
                                                        <p className="text-[9px] text-zinc-500 uppercase">{meal.menu}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </section>
                            </div>

                            {/* Column 2: Training Split & Weekly Overview */}
                            <div className="lg:col-span-8 space-y-8">
                                <section className="p-10 bg-zinc-950 border border-purple-500/10 rounded-[3rem] relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-10 opacity-5">
                                        <Dumbbell size={160} />
                                    </div>
                                    <div className="flex justify-between items-center mb-12">
                                        <h3 className="text-2xl font-black font-outfit uppercase italic text-white flex items-center gap-4">
                                            Weekly Split Protocol
                                            <div className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-[9px] font-black text-purple-400">DYNAMIC</div>
                                        </h3>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Main Focus</p>
                                            <p className="text-xs font-black text-purple-500 uppercase">{planData.trainingDetails.focus}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-7 gap-4">
                                        {planData.weeklySplit.map((day: string, i: number) => (
                                            <div key={i} className={`p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all ${day === 'Rest'
                                                    ? 'bg-black border-white/5 opacity-40'
                                                    : 'bg-white/5 border-purple-500/20 shadow-[0_0_20px_#9333ea10]'
                                                }`}>
                                                <span className="text-[10px] font-black text-zinc-600 uppercase">D-{i + 1}</span>
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${day === 'Rest' ? 'text-zinc-800' : 'text-purple-500'}`}>
                                                    {day === 'Rest' ? <Clock size={16} /> : <Dumbbell size={16} />}
                                                </div>
                                                <span className={`text-[8px] font-black uppercase tracking-widest text-center ${day === 'Rest' ? 'text-zinc-600' : 'text-white'}`}>
                                                    {day}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
                                        <SummaryBox label="Sessions" value={planData.trainingDetails.sessionsPerWeek} />
                                        <SummaryBox label="Avg Vol" value="12k KG" />
                                        <SummaryBox label="Cardio" value="60m" />
                                        <SummaryBox label="Rest" value={7 - planData.trainingDetails.sessionsPerWeek} />
                                    </div>
                                </section>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <section className="p-8 bg-zinc-950 border border-white/5 rounded-[2.5rem]">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-6 flex items-center gap-3">
                                            Biometric Thresholds
                                            <Thermometer size={14} className="text-orange-500" />
                                        </h4>
                                        <div className="space-y-4">
                                            <ProgressMetric label="Neural Capacity" value={84} color="bg-purple-500" />
                                            <ProgressMetric label="Metabolic Recovery" value={92} color="bg-cyan-500" />
                                            <ProgressMetric label="Mechanical Strain" value={65} color="bg-red-500" />
                                        </div>
                                    </section>

                                    <section className="p-8 bg-zinc-950 border border-white/5 rounded-[2.5rem] flex flex-col justify-between">
                                        <div>
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-6 flex items-center gap-3">
                                                AI Adaptation Sync
                                                <Zap size={14} className="text-yellow-500" />
                                            </h4>
                                            <p className="text-[11px] text-zinc-500 font-medium uppercase leading-relaxed italic">
                                                The Neural Engine has recently adjusted your <span className="text-white">Wednesday volume</span> based on a detected recovery lag. Your current protocol is 100% optimized for retention.
                                            </p>
                                        </div>
                                        <Link href="/dashboard" className="mt-6 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-purple-500 hover:text-white transition-colors group">
                                            View Optimization Logs <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </section>
                                </div>
                            </div>

                        </div>
                    </div>
                </main>
            </div>
        </PageTransition>
    )
}

function MacroItem({ label, value, icon: Icon, color }: any) {
    return (
        <div className="flex justify-between items-center group">
            <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-lg bg-black border border-white/5 flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
                    <Icon size={14} />
                </div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{label}</span>
            </div>
            <span className="text-xs font-black font-outfit text-white uppercase italic">{value}</span>
        </div>
    )
}

function SummaryBox({ label, value }: { label: string, value: any }) {
    return (
        <div className="bg-black/40 border border-white/5 rounded-2xl p-4 text-center">
            <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-xl font-black font-outfit text-white uppercase italic">{value}</p>
        </div>
    )
}

function ProgressMetric({ label, value, color }: { label: string, value: number, color: string }) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{label}</span>
                <span className="text-[9px] font-mono text-white">{value}%</span>
            </div>
            <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} className={`h-full ${color}`} />
            </div>
        </div>
    )
}
