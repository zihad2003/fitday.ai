'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Magnetic,
    Reveal,
    TiltCard,
    Counter,
    Ripple,
    TextReveal,
    GradientBorder,
    Floating,
} from '@/components/animations/AdvancedAnimations'
import {
    FadeIn,
    SlideUp,
    ScaleIn,
    StaggerContainer,
    StaggerItem,
    HoverScale,
    Pulse,
    LoadingDots,
} from '@/components/animations/Transitions'

export default function AnimationShowcase() {
    const [count, setCount] = useState(0)

    return (
        <div className="min-h-screen bg-black text-white p-8">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="glow-purple top-[-20%] left-[-10%] w-[60%] h-[60%] blur-[160px] opacity-20" />
                <div className="glow-cyan bottom-[-20%] right-[-10%] w-[60%] h-[60%] blur-[160px] opacity-15" />
                <div className="absolute inset-0 bg-noise opacity-[0.02]" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <FadeIn>
                    <div className="text-center mb-20">
                        <TextReveal
                            text="Modern Animation Showcase"
                            className="text-6xl font-black font-outfit italic mb-4 gradient-text-animated"
                        />
                        <p className="text-zinc-400 text-lg">
                            Premium micro-interactions and animations for FitDay AI
                        </p>
                    </div>
                </FadeIn>

                {/* Grid of Animation Examples */}
                <StaggerContainer staggerDelay={0.1}>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                        {/* Magnetic Button */}
                        <StaggerItem>
                            <div className="glass-card p-8 rounded-3xl h-full">
                                <h3 className="text-sm font-black uppercase tracking-wider text-purple-400 mb-4">
                                    Magnetic Effect
                                </h3>
                                <p className="text-zinc-400 text-sm mb-6">
                                    Buttons that follow your cursor
                                </p>
                                <Magnetic>
                                    <button className="btn-primary w-full">
                                        Hover Me
                                    </button>
                                </Magnetic>
                            </div>
                        </StaggerItem>

                        {/* 3D Tilt Card */}
                        <StaggerItem>
                            <div className="glass-card p-8 rounded-3xl h-full">
                                <h3 className="text-sm font-black uppercase tracking-wider text-cyan-400 mb-4">
                                    3D Tilt Effect
                                </h3>
                                <p className="text-zinc-400 text-sm mb-6">
                                    Interactive card with depth
                                </p>
                                <TiltCard className="bg-gradient-to-br from-cyan-600/20 to-purple-600/20 p-6 rounded-2xl border border-white/10">
                                    <div className="text-4xl mb-2">🎯</div>
                                    <p className="text-sm font-bold">Hover to tilt</p>
                                </TiltCard>
                            </div>
                        </StaggerItem>

                        {/* Counter Animation */}
                        <StaggerItem>
                            <div className="glass-card p-8 rounded-3xl h-full">
                                <h3 className="text-sm font-black uppercase tracking-wider text-indigo-400 mb-4">
                                    Animated Counter
                                </h3>
                                <p className="text-zinc-400 text-sm mb-6">
                                    Smooth number transitions
                                </p>
                                <div className="text-center">
                                    <Counter
                                        to={count}
                                        className="text-5xl font-black italic text-indigo-400"
                                        suffix="+"
                                    />
                                    <button
                                        onClick={() => setCount(count + 100)}
                                        className="mt-4 px-4 py-2 bg-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-500 transition-colors"
                                    >
                                        Add 100
                                    </button>
                                </div>
                            </div>
                        </StaggerItem>

                        {/* Ripple Effect */}
                        <StaggerItem>
                            <div className="glass-card p-8 rounded-3xl h-full">
                                <h3 className="text-sm font-black uppercase tracking-wider text-pink-400 mb-4">
                                    Ripple Effect
                                </h3>
                                <p className="text-zinc-400 text-sm mb-6">
                                    Click anywhere inside
                                </p>
                                <Ripple className="bg-pink-600/20 p-8 rounded-2xl border border-pink-500/20 cursor-pointer hover:bg-pink-600/30 transition-colors">
                                    <div className="text-center">
                                        <div className="text-4xl mb-2">💧</div>
                                        <p className="text-sm font-bold">Click Me</p>
                                    </div>
                                </Ripple>
                            </div>
                        </StaggerItem>

                        {/* Gradient Border */}
                        <StaggerItem>
                            <div className="glass-card p-8 rounded-3xl h-full">
                                <h3 className="text-sm font-black uppercase tracking-wider text-emerald-400 mb-4">
                                    Gradient Border
                                </h3>
                                <p className="text-zinc-400 text-sm mb-6">
                                    Animated border gradient
                                </p>
                                <GradientBorder className="p-6 rounded-2xl">
                                    <div className="text-center">
                                        <div className="text-4xl mb-2">✨</div>
                                        <p className="text-sm font-bold">Premium Card</p>
                                    </div>
                                </GradientBorder>
                            </div>
                        </StaggerItem>

                        {/* Floating Animation */}
                        <StaggerItem>
                            <div className="glass-card p-8 rounded-3xl h-full">
                                <h3 className="text-sm font-black uppercase tracking-wider text-orange-400 mb-4">
                                    Floating Element
                                </h3>
                                <p className="text-zinc-400 text-sm mb-6">
                                    Continuous float animation
                                </p>
                                <div className="flex justify-center">
                                    <Floating duration={4} distance={15}>
                                        <div className="text-6xl">🚀</div>
                                    </Floating>
                                </div>
                            </div>
                        </StaggerItem>
                    </div>
                </StaggerContainer>

                {/* CSS Animation Examples */}
                <Reveal>
                    <div className="mb-20">
                        <h2 className="text-4xl font-black font-outfit italic mb-8 text-center">
                            CSS Animations
                        </h2>
                        <div className="grid md:grid-cols-4 gap-6">
                            {/* Shimmer */}
                            <div className="glass-card p-6 rounded-2xl shimmer">
                                <div className="text-3xl mb-2">✨</div>
                                <p className="text-sm font-bold">Shimmer</p>
                            </div>

                            {/* Pulse */}
                            <div className="glass-card p-6 rounded-2xl">
                                <div className="text-3xl mb-2 animate-pulse-slow">💓</div>
                                <p className="text-sm font-bold">Pulse</p>
                            </div>

                            {/* Float */}
                            <div className="glass-card p-6 rounded-2xl">
                                <div className="text-3xl mb-2 animate-float">🎈</div>
                                <p className="text-sm font-bold">Float</p>
                            </div>

                            {/* Spin */}
                            <div className="glass-card p-6 rounded-2xl">
                                <div className="text-3xl mb-2 animate-spin-slow">⚙️</div>
                                <p className="text-sm font-bold">Spin</p>
                            </div>

                            {/* Bounce */}
                            <div className="glass-card p-6 rounded-2xl">
                                <div className="text-3xl mb-2 animate-bounce-gentle">⚡</div>
                                <p className="text-sm font-bold">Bounce</p>
                            </div>

                            {/* Wiggle */}
                            <div className="glass-card p-6 rounded-2xl">
                                <div className="text-3xl mb-2 animate-wiggle">🎯</div>
                                <p className="text-sm font-bold">Wiggle</p>
                            </div>

                            {/* Heartbeat */}
                            <div className="glass-card p-6 rounded-2xl">
                                <div className="text-3xl mb-2 animate-heartbeat">❤️</div>
                                <p className="text-sm font-bold">Heartbeat</p>
                            </div>

                            {/* Glow Pulse */}
                            <div className="glass-card p-6 rounded-2xl animate-glow-pulse">
                                <div className="text-3xl mb-2">🌟</div>
                                <p className="text-sm font-bold">Glow Pulse</p>
                            </div>
                        </div>
                    </div>
                </Reveal>

                {/* Text Animations */}
                <Reveal>
                    <div className="mb-20">
                        <h2 className="text-4xl font-black font-outfit italic mb-8 text-center">
                            Text Effects
                        </h2>
                        <div className="glass-card p-12 rounded-3xl text-center space-y-8">
                            <div>
                                <p className="text-sm text-zinc-500 mb-2">Gradient Text</p>
                                <h3 className="text-5xl font-black gradient-text-animated">
                                    Amazing Gradient
                                </h3>
                            </div>
                            <div>
                                <p className="text-sm text-zinc-500 mb-2">Glow Text</p>
                                <h3 className="text-5xl font-black text-glow-purple text-purple-400">
                                    Glowing Text
                                </h3>
                            </div>
                            <div>
                                <p className="text-sm text-zinc-500 mb-2">Reveal Animation</p>
                                <TextReveal
                                    text="Character by Character"
                                    className="text-3xl font-bold"
                                    staggerDelay={0.05}
                                />
                            </div>
                        </div>
                    </div>
                </Reveal>

                {/* Interactive Elements */}
                <Reveal>
                    <div className="mb-20">
                        <h2 className="text-4xl font-black font-outfit italic mb-8 text-center">
                            Interactive Elements
                        </h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            <HoverScale scale={1.05}>
                                <div className="glass-card p-8 rounded-3xl hover-lift cursor-pointer">
                                    <div className="text-4xl mb-4">🎨</div>
                                    <h3 className="text-xl font-bold mb-2">Hover Lift</h3>
                                    <p className="text-sm text-zinc-400">
                                        Lifts on hover with shadow
                                    </p>
                                </div>
                            </HoverScale>

                            <div className="glass-card p-8 rounded-3xl hover-glow cursor-pointer">
                                <div className="text-4xl mb-4">💎</div>
                                <h3 className="text-xl font-bold mb-2">Hover Glow</h3>
                                <p className="text-sm text-zinc-400">
                                    Glows on hover
                                </p>
                            </div>

                            <div className="glass-card p-8 rounded-3xl magnetic cursor-pointer">
                                <div className="text-4xl mb-4">🧲</div>
                                <h3 className="text-xl font-bold mb-2">Magnetic</h3>
                                <p className="text-sm text-zinc-400">
                                    Subtle scale on hover
                                </p>
                            </div>
                        </div>
                    </div>
                </Reveal>

                {/* Loading States */}
                <Reveal>
                    <div className="mb-20">
                        <h2 className="text-4xl font-black font-outfit italic mb-8 text-center">
                            Loading States
                        </h2>
                        <div className="glass-card p-12 rounded-3xl">
                            <div className="flex flex-col items-center gap-8">
                                <div>
                                    <p className="text-sm text-zinc-500 mb-4 text-center">Loading Dots</p>
                                    <LoadingDots />
                                </div>
                                <div className="w-full max-w-md">
                                    <p className="text-sm text-zinc-500 mb-4 text-center">Skeleton Loader</p>
                                    <div className="space-y-3">
                                        <div className="skeleton h-4 w-full" />
                                        <div className="skeleton h-4 w-3/4" />
                                        <div className="skeleton h-4 w-1/2" />
                                    </div>
                                </div>
                                <div className="w-full max-w-md">
                                    <p className="text-sm text-zinc-500 mb-4 text-center">Progress Bar</p>
                                    <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-purple-600 to-cyan-400"
                                            animate={{ width: ['0%', '100%'] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Reveal>

                {/* Back Button */}
                <div className="text-center">
                    <Magnetic>
                        <a
                            href="/dashboard"
                            className="inline-block px-8 py-4 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-500 transition-colors shadow-[0_0_30px_rgba(147,51,234,0.3)]"
                        >
                            Back to Dashboard
                        </a>
                    </Magnetic>
                </div>
            </div>
        </div>
    )
}
