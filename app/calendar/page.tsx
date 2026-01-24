'use client'
import Sidebar from '@/components/dashboard/Sidebar'
import TopBar from '@/components/dashboard/TopBar'

export default function CalendarPage() {
    return (
        <div className="min-h-screen bg-black text-white flex font-inter overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-10 no-scrollbar relative">
                <div className="glow-purple top-[-10%] right-[-10%] w-[50%] h-[50%] opacity-10" />
                <TopBar title="Schedule" subtitle="Monthly View" />
                <div className="h-[60vh] border border-white/5 bg-zinc-900/50 rounded-[3rem] flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-6xl mb-4 opacity-20">📅</div>
                        <h2 className="text-2xl font-black font-outfit uppercase italic text-zinc-600">Calendar Syncing...</h2>
                    </div>
                </div>
            </main>
        </div>
    )
}
