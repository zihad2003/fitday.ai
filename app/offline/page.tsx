'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function OfflinePage() {
    const router = useRouter()
    const [isOnline, setIsOnline] = useState(false)

    useEffect(() => {
        // Check online status
        setIsOnline(navigator.onLine)

        const handleOnline = () => {
            setIsOnline(true)
            setTimeout(() => {
                router.push('/dashboard')
            }, 1000)
        }

        const handleOffline = () => {
            setIsOnline(false)
        }

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [router])

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center">
                {/* Offline Icon */}
                <div className="mb-8">
                    <svg
                        className="w-24 h-24 mx-auto text-slate-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
                        />
                    </svg>
                </div>

                {/* Status Message */}
                {isOnline ? (
                    <div className="space-y-4">
                        <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-white">Back Online!</h1>
                        <p className="text-slate-400">Redirecting you to the app...</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <h1 className="text-3xl font-bold text-white mb-2">You're Offline</h1>
                        <p className="text-slate-400 mb-6">
                            It looks like you've lost your internet connection. Don't worry, you can still access some features.
                        </p>

                        {/* Offline Features */}
                        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 text-left space-y-4">
                            <h2 className="text-lg font-semibold text-white mb-3">Available Offline:</h2>

                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <div>
                                    <p className="text-white font-medium">View Cached Data</p>
                                    <p className="text-sm text-slate-400">Access your recently viewed workouts and meals</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <div>
                                    <p className="text-white font-medium">Log Workouts & Meals</p>
                                    <p className="text-sm text-slate-400">Your data will sync when you're back online</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <div>
                                    <p className="text-white font-medium">Browse Exercise Library</p>
                                    <p className="text-sm text-slate-400">View cached exercise videos and instructions</p>
                                </div>
                            </div>
                        </div>

                        {/* Retry Button */}
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-6 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-colors w-full"
                        >
                            Try Again
                        </button>

                        {/* Tips */}
                        <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                            <p className="text-sm text-blue-300">
                                <strong>Tip:</strong> Check your WiFi or mobile data connection, then try again.
                            </p>
                        </div>
                    </div>
                )}

                {/* Connection Status Indicator */}
                <div className="mt-8 flex items-center justify-center gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
                    <span className="text-slate-400">
                        {isOnline ? 'Connected' : 'Disconnected'}
                    </span>
                </div>
            </div>
        </div>
    )
}
