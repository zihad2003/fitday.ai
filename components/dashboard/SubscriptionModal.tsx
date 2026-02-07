'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, CreditCard, Sparkles, Loader2 } from 'lucide-react'
import { useState } from 'react'

export default function SubscriptionModal({ isOpen, onClose, onUpgrade }: { isOpen: boolean, onClose: () => void, onUpgrade: () => void }) {
    const [loading, setLoading] = useState(false)

    const handleUpgrade = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/subscription/upgrade', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId: 'premium_monthly' })
            })
            const json = await res.json()
            if (json.success) {
                onUpgrade()
                onClose()
            } else {
                alert('Upgrade failed. Please try again.')
            }
        } catch (e) {
            console.error(e)
            alert('Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-4 cursor-pointer"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl p-8 z-[201] shadow-2xl overflow-hidden"
                    >
                        {/* Background Effects */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 blur-[100px] pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 blur-[80px] pointer-events-none" />

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
                                        <Sparkles size={12} />
                                        Premium Access
                                    </div>
                                    <h2 className="text-3xl font-black text-white font-outfit leading-tight">
                                        Unlock Complete <br />
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Intelligence.</span>
                                    </h2>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                    <X size={20} className="text-zinc-400" />
                                </button>
                            </div>

                            <div className="bg-white/5 rounded-2xl p-6 mb-6 border border-white/5">
                                <div className="flex items-end gap-2 mb-4">
                                    <h3 className="text-4xl font-black text-white font-outfit">৳299</h3>
                                    <span className="text-zinc-400 mb-1">/ month</span>
                                </div>
                                <p className="text-zinc-400 text-sm mb-6">
                                    Less than the cost of a coffee. Get unlimited access to the most advanced fitness AI in Bangladesh.
                                </p>

                                <ul className="space-y-3">
                                    {[
                                        'Unlimited AI Meal Plans',
                                        'Unlimited AI Workout Routines',
                                        'Advanced Progress Analytics',
                                        'AI Coach Chat Access (24/7)'
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-sm text-zinc-300">
                                            <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                                                <Check size={12} className="text-green-400" />
                                            </div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <button
                                onClick={handleUpgrade}
                                disabled={loading}
                                className="w-full h-14 bg-white text-black rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        Upgrade Now
                                        <CreditCard size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>

                            <p className="text-center text-xs text-zinc-500 mt-4">
                                Secure payment via SSLCommerz / Stripe. Cancel anytime.
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
