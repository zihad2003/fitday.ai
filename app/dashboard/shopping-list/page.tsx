'use client'

import { useState, useEffect } from 'react'
import ShoppingList from '@/components/ShoppingList'
import Sidebar from '@/components/dashboard/Sidebar'
import MobileNav from '@/components/dashboard/MobileNav'
import TopBar from '@/components/dashboard/TopBar'

export default function ShoppingListPage() {
    const [plan, setPlan] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Fetch active meal plan to generate list from
        fetch('/api/plans/meal/active')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    // The API returns the generated list directly now (from my implementation of route.ts)
                    // But wait, the route I wrote returns { success: true, data: list }
                    // And the ShoppingList component expects `planData` prop OR it uses the generator internally?
                    // Let's check ShoppingList.tsx again.
                    /* It takes `planData` prop and calls `generateFromDailyPlan`. 
                       BUT `app/api/plans/shopping-list/route.ts` (which I implemented) ALREADY generates the list.
                       I should update `ShoppingList` component to accept `listData` prop directly or update page to fetch plan data.
                    */
                }
            })

        // Actually, let's just fetch the plain plan so the component can generate it, 
        // OR better, let's update the page to fetch the list from the new API I made
        // and pass it to a modified ShoppingList component.

        // Let's look at `app/api/plans/shopping-list/route.ts` I wrote:
        // It returns `NextResponse.json({ success: true, data: list })` where list IS the generated shopping list.

        // And `components/ShoppingList.tsx` expects `planData` and generates list in useEffect.
        // I should update `components/ShoppingList.tsx` to accept a `preGeneratedList` prop or similar.
        // OR I can just pass `null` as planData and handle the list pass-in.

        // To save time/complexity, I will just replicate the fetch in the component or page.
        // Actually, since I have the `list` from API, let's update `ShoppingList.tsx` to optionally take `initialList`.
    }, [])

    return (
        <div className="min-h-screen bg-black text-white flex font-inter overflow-hidden">
            <Sidebar />
            <MobileNav />
            <main className="flex-1 overflow-y-auto p-6 md:p-10 no-scrollbar relative">
                <TopBar title="Shopping List" subtitle="Weekly Grocery Needs" />
                <div className="mt-8">
                    <ShoppingListWrapper />
                </div>
            </main>
        </div>
    )
}

function ShoppingListWrapper() {
    const [list, setList] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/plans/shopping-list')
            .then(res => res.json())
            .then(res => {
                if (res.success) {
                    setList(res.data)
                }
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }, [])

    if (loading) return <div className="text-zinc-500">Loading list...</div>

    // We need to modify ShoppingList component to accept the list directly
    // For now, I'll assume I can edit ShoppingList.tsx to accept `initialList`
    return <ShoppingList initialList={list} />
}
