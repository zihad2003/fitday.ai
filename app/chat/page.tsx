'use client'

import Sidebar from '@/components/dashboard/Sidebar'
import TopBar from '@/components/dashboard/TopBar'
import AICoach from '@/components/dashboard/AICoach'

export default function ChatPage() {
    return (
        <div className="min-h-screen bg-black text-white flex font-inter overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-10 no-scrollbar relative flex flex-col">
                <div className="glow-purple top-[-10%] right-[-10%] w-[50%] h-[50%] opacity-10" />
                <TopBar title="AI Assistant" subtitle="Neural Interface // Status: Online" />

                <div className="flex-1 bg-zinc-900/50 border border-white/5 rounded-[3rem] overflow-hidden p-8 relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-purple-900/5 to-transparent pointer-events-none" />
                    <div className="h-full flex flex-col">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
                            <span className="text-[10px] uppercase tracking-widest font-black text-zinc-500">Coach Intelligence Active</span>
                        </div>
                        <AICoach />
                    </div>
                </div>
            </main>
        </div>
    )
}
