'use client'

import React from 'react'
import { Utensils, Zap, Clock } from 'lucide-react'
import { HoverScale, FadeIn } from '@/components/animations/Transitions'

interface Meal {
    name: string
    cal: number
    p: number
    desc: string
}

interface MealPlan {
    breakfast: Meal
    lunch: Meal
    dinner: Meal
    snack: Meal
}

export default function MealCard({ meals }: { meals: MealPlan }) {
    return (
        <HoverScale scale={1.02} className="h-full">
            <div className="stat-card p-8 h-full flex flex-col relative overflow-hidden group">
                {/* Visual Atmosphere */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-orange-500/10 transition-colors" />

                <div className="flex justify-between items-start mb-8 relative z-10">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-orange-400">Nutritional Feed</span>
                        </div>
                        <h3 className="text-2xl font-black font-outfit uppercase italic text-white leading-none">Daily Protocol</h3>
                    </div>
                    <div className="w-12 h-12 bg-orange-900/10 rounded-[1rem] flex items-center justify-center text-orange-500 border border-orange-500/20 group-hover:scale-110 group-hover:rotate-6 transition-transform">
                        <Utensils size={20} />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2 subtle-scrollbar relative z-10">
                    <MealItem type="breakfast" meal={meals.breakfast} icon="🍳" />
                    <MealItem type="lunch" meal={meals.lunch} icon="🍗" />
                    <MealItem type="snack" meal={meals.snack} icon="🍎" />
                    <MealItem type="dinner" meal={meals.dinner} icon="🥗" />
                </div>

                <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <Zap size={10} className="text-orange-500" />
                            <span className="text-[8px] font-black uppercase text-zinc-500 tracking-widest">Macro Optimized</span>
                        </div>
                    </div>
                    <span className="text-[9px] font-mono text-zinc-700 uppercase">Cycle: Alpha_01</span>
                </div>
            </div>
        </HoverScale>
    )
}

function MealItem({ type, meal, icon }: { type: string, meal: Meal, icon: string }) {
    return (
        <div className="flex gap-5 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-orange-500/20 transition-all duration-300 group/item">
            <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center text-2xl shrink-0 border border-white/5 shadow-2xl group-hover/item:scale-110 transition-transform">
                {icon}
            </div>
            <div className="min-w-0 flex-1 py-1">
                <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600 group-hover/item:text-orange-500/60 transition-colors uppercase">{type}</span>
                    <div className="flex items-center gap-1">
                        <Clock size={8} className="text-zinc-700" />
                        <span className="text-[9px] font-mono text-orange-400 tabular-nums">{meal.cal} KCAL</span>
                    </div>
                </div>
                <h4 className="font-black text-white text-[11px] uppercase font-outfit truncate tracking-wide">{meal.name}</h4>
                <p className="text-[9px] text-zinc-600 line-clamp-1 mt-1 font-medium">{meal.desc}</p>
            </div>
        </div>
    )
}

