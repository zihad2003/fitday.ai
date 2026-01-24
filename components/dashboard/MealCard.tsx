'use client'

import React from 'react'
import { Utensils } from 'lucide-react'

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
        <div className="stat-card p-6 h-full flex flex-col relative overflow-hidden">
            {/* Visual Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-orange-400">Nutrition Plan</span>
                    </div>
                    <h3 className="text-xl font-black font-outfit uppercase italic text-white leading-none">Daily Menu</h3>
                </div>
                <div className="w-10 h-10 bg-orange-900/20 rounded-xl flex items-center justify-center text-orange-400 border border-orange-500/20">
                    <Utensils size={18} />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {Object.entries(meals).map(([type, meal], i) => (
                    <div key={i} className="flex gap-4 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                        <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center text-xl shrink-0 border border-white/10">
                            {type === 'breakfast' && '🍳'}
                            {type === 'lunch' && '🍗'}
                            {type === 'snack' && '🍎'}
                            {type === 'dinner' && '🥗'}
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">{type}</span>
                                <span className="text-[9px] font-mono text-orange-400">{meal.cal} KCAL</span>
                            </div>
                            <h4 className="font-bold text-white text-xs uppercase font-outfit truncate leading-tight">{meal.name}</h4>
                            <p className="text-[10px] text-zinc-500 line-clamp-1 mt-1">{meal.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    )
}
