'use client'

import Sidebar from '@/components/dashboard/Sidebar'
import TopBar from '@/components/dashboard/TopBar'
import AICoach from '@/components/dashboard/AICoach'
import MobileNav from '@/components/dashboard/MobileNav'
import { PageTransition, FadeIn } from '@/components/animations/Transitions'

export default function ChatPage() {
    return (
        <PageTransition>
            <div className="min-h-screen bg-black text-white flex font-inter overflow-hidden">
                <Sidebar />
                <MobileNav />
                <main className="flex-1 overflow-y-auto p-6 md:p-10 no-scrollbar relative flex flex-col">
                    {/* Background Atmosphere */}
                    <div className="fixed inset-0 pointer-events-none">
                        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/10 blur-[120px]" />
                        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/10 blur-[120px]" />
                    </div>

                    <TopBar title="AI Assistant" subtitle="Neural Cognitive Layer // Status: Syncing" />

                    <div className="flex-1 flex flex-col items-center justify-center max-w-5xl mx-auto w-full relative z-10">
                        <FadeIn className="w-full h-full flex flex-col">
                            <div className="flex-1 bg-zinc-950/50 border border-white/5 rounded-[3rem] overflow-hidden flex flex-col shadow-2xl backdrop-blur-3xl">
                                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-zinc-900/40">
                                    <div className="flex items-center gap-4">
                                        <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
                                        <div>
                                            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white">Coach Intelligence</h2>
                                            <p className="text-[9px] text-zinc-500 font-mono uppercase mt-0.5">Quantum Processing Optimized</p>
                                        </div>
                                    </div>
                                    <div className="px-4 py-1.5 bg-purple-900/20 border border-purple-500/20 rounded-full">
                                        <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest italic">V2.4 Active</span>
                                    </div>
                                </div>
                                <div className="flex-1 flex flex-col min-h-0">
                                    <AICoach fullHeight />
                                </div>
                            </div>
                        </FadeIn>

                        {/* Quick Prompt Tokens */}
                        <div className="mt-8 flex flex-wrap justify-center gap-3">
                            <PromptToken label="Calculate My Macros" />
                            <PromptToken label="Suggest High-Protein Snacks" />
                            <PromptToken label="Review My Workout Consistency" />
                            <PromptToken label="Explain Body Fat Percentage" />
                        </div>
                    </div>
                </main>
            </div>
        </PageTransition>
    )
}

function PromptToken({ label }: { label: string }) {
    return (
        <button className="px-5 py-2.5 bg-white/5 border border-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-white/10 hover:border-purple-500/30 transition-all">
            {label}
        </button>
    )
}

