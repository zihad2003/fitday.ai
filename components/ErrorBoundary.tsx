'use client'

import { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
    children: ReactNode
    fallback?: ReactNode
}

interface State {
    hasError: boolean
    error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: any) {
        console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <div className="min-h-screen bg-black flex items-center justify-center p-6">
                    <div className="max-w-md w-full bg-zinc-950 border border-red-500/20 rounded-3xl p-12 text-center">
                        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle size={40} className="text-red-500" />
                        </div>

                        <h2 className="text-2xl font-black font-outfit uppercase italic text-white mb-4">
                            System Error
                        </h2>

                        <p className="text-sm text-zinc-400 mb-8">
                            {this.state.error?.message || 'An unexpected error occurred'}
                        </p>

                        <button
                            onClick={() => {
                                this.setState({ hasError: false, error: undefined })
                                window.location.reload()
                            }}
                            className="w-full h-14 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-2"
                        >
                            <RefreshCw size={16} />
                            Reload Application
                        </button>

                        <button
                            onClick={() => window.location.href = '/'}
                            className="w-full h-14 mt-4 text-zinc-500 hover:text-white transition font-black uppercase text-xs tracking-widest"
                        >
                            Return Home
                        </button>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

export function ErrorFallback({
    error,
    resetError
}: {
    error: Error
    resetError: () => void
}) {
    return (
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl">
            <div className="flex items-start gap-4">
                <AlertTriangle size={24} className="text-red-500 shrink-0 mt-1" />
                <div className="flex-1">
                    <h3 className="text-lg font-black text-red-500 mb-2">Error</h3>
                    <p className="text-sm text-zinc-400 mb-4">{error.message}</p>
                    <button
                        onClick={resetError}
                        className="h-10 px-6 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        </div>
    )
}
