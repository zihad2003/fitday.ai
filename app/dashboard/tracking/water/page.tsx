'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import MobileNav from '@/components/dashboard/MobileNav'
import TopBar from '@/components/dashboard/TopBar'
import WaterTrackerFeatures from '@/components/WaterTrackerFeatures'
import { useRouter } from 'next/navigation'

export default function WaterTrackerPage() {
    const [userData, setUserData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        // We need user data for the water tracker (weight, etc usually, but the component fetches API itself?)
        // Actually WaterTrackerFeatures takes 'initialData'.
        // Let's fetch the water data to pass as initialData.

        fetch('/api/tracking/water')
            .then(res => res.json())
            .then(data => {
                setUserData(data)
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
    }, [])

    return (
        <div className="min-h-screen bg-black text-white flex font-inter overflow-hidden">
            <Sidebar />
            <MobileNav />
            <main className="flex-1 overflow-y-auto p-6 md:p-10 no-scrollbar relative">
                <TopBar title="Hydration Tracker" subtitle="Daily Water Intake" />
                <div className="mt-8 max-w-2xl mx-auto">
                    <div className="glass-card p-8 rounded-3xl">
                        {loading ? (
                            <div className="text-center text-zinc-500 py-10">Loading hydration data...</div>
                        ) : (
                            <WaterTrackerFeatures initialData={userData} />
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
