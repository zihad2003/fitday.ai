'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Icons from '@/components/icons/Icons'
import { ShoppingListGenerator } from '@/lib/shopping-list-generator'

interface ShoppingListProps {
    planData?: any
    initialList?: any
}

export default function ShoppingList({ planData, initialList }: ShoppingListProps) {
    const [list, setList] = useState<any>(initialList || null)
    const [generated, setGenerated] = useState(!!initialList)
    const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())

    // Mock generation on load if planData exists
    useEffect(() => {
        if (initialList) {
            setList(initialList)
            setGenerated(true)
            return
        }

        if (planData && !generated) {
            // Assuming planData has a daily_plan array
            // If passing the raw API response structure, adjust path
            /* 
               Structure from API:
               { 
                 schedule: [ { suggestions: [...] }, ... ] 
               } 
            */
            const dailyPlan = planData.schedule || []
            if (dailyPlan.length > 0) {
                const generatedList = ShoppingListGenerator.generateFromDailyPlan(dailyPlan)
                setList(generatedList)
            }
            setGenerated(true)
        }
    }, [planData, generated])

    const toggleItem = (id: string) => {
        const newChecked = new Set(checkedItems)
        if (newChecked.has(id)) {
            newChecked.delete(id)
        } else {
            newChecked.add(id)
        }
        setCheckedItems(newChecked)
    }

    if (!list) return (
        <div className="glass-card p-8 text-center text-zinc-500">
            <Icons.ShoppingCart size={48} className="mx-auto mb-4 opacity-50" />
            <p>No meal plan selected. Generate a plan to see your shopping list.</p>
        </div>
    )

    const progress = Math.round((checkedItems.size / list.total_items) * 100)

    return (
        <div className="space-y-6">
            <div className="glass-card p-6 rounded-3xl">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-black font-outfit italic flex items-center gap-2">
                            <Icons.ShoppingCart className="text-emerald-400" />
                            Weekly Grocery List
                        </h2>
                        <div className="flex gap-4 text-sm text-zinc-400 mt-1">
                            <span>{list.total_items} items</span>
                            <span>•</span>
                            <span>Est. ৳{list.total_estimated_cost}</span>
                        </div>
                    </div>
                    <button className="p-2 bg-emerald-600/20 text-emerald-400 rounded-xl hover:bg-emerald-600/30 transition-colors">
                        <Icons.Download size={20} />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between text-xs font-bold mb-2">
                        <span className="text-zinc-400">SHOPPING PROGRESS</span>
                        <span className="text-emerald-400">{progress}%</span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className="h-full bg-emerald-500 rounded-full"
                        />
                    </div>
                </div>

                <div className="space-y-8">
                    {list.categories.map((category: any) => (
                        <div key={category.name}>
                            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3 pl-1">
                                {category.name}
                            </h3>
                            <div className="space-y-2">
                                {category.items.map((item: any) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        onClick={() => toggleItem(item.id)}
                                        className={`flex items-center p-3 rounded-xl cursor-pointer transition-all border ${checkedItems.has(item.id)
                                            ? 'bg-emerald-900/10 border-emerald-500/20 opacity-50'
                                            : 'bg-zinc-800/30 border-transparent hover:bg-zinc-800/50'
                                            }`}
                                    >
                                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center mr-4 transition-colors ${checkedItems.has(item.id)
                                            ? 'bg-emerald-500 border-emerald-500'
                                            : 'border-zinc-600'
                                            }`}>
                                            {checkedItems.has(item.id) && <Icons.Check size={12} className="text-black" strokeWidth={4} />}
                                        </div>
                                        <div className="flex-1">
                                            <span className={`font-medium ${checkedItems.has(item.id) ? 'line-through text-zinc-500' : ''}`}>
                                                {item.name}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm font-bold text-zinc-400">
                                                {item.quantity} {item.unit}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
