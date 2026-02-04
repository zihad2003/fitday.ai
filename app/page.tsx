'use client'

import Link from 'next/link'
import { useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { getUserSession } from '@/lib/auth'
import BMIAnalyzer from '@/components/BMIAnalyzer'
import { PageTransition } from '@/components/animations/Transitions'

// ==========================================
// 1. UI COMPONENT: Premium Glass Card (Argus Inspired)
// ==========================================
const GlassCard = ({ children, className = "", delay = 0 }: { children: ReactNode, className?: string, delay?: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay }}
      className={`glass-card rounded-[3rem] ${className}`}
    >
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};

// ==========================================
// 3. MAIN PAGE
// ==========================================
export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [showScanner, setShowScanner] = useState(false)
  const { scrollYProgress } = useScroll()
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])

  useEffect(() => {
    // Check local storage for session
    const checkSession = async () => {
      const session = getUserSession()
      if (session) setUser(session)
    }
    checkSession()
  }, [])

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#000000] text-white selection:bg-purple-500/30 font-inter overflow-x-hidden">

        {/* Background Glows (Argus Style) */}
        <motion.div style={{ y: backgroundY }} className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="glow-purple top-[-20%] left-[-10%] w-[60%] h-[60%] blur-[160px] opacity-20" />
          <div className="glow-purple bottom-[-20%] right-[-10%] w-[60%] h-[60%] blur-[160px] opacity-15" />

          {/* Grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:64px_64px]" />
        </motion.div>

        <AnimatePresence>
          {showScanner && <BMIAnalyzer onClose={() => setShowScanner(false)} />}
        </AnimatePresence>

        {/* Floating Header */}
        <nav className="fixed w-full z-50 top-6 left-0 px-6">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="max-w-5xl mx-auto h-20 bg-white/[0.03] backdrop-blur-2xl border border-white/5 rounded-full flex items-center justify-between px-10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
          >
            <Link href="/" className="text-2xl font-black font-outfit italic tracking-tighter flex items-center gap-3 group">
              <div className="w-8 h-8 bg-purple-600 rounded-lg shadow-[0_0_20px_rgba(147,51,234,0.4)] group-hover:rotate-12 transition-transform duration-500 flex items-center justify-center text-[10px] font-black text-white">FD</div>
              <span className="text-white">FitDay</span><span className="text-purple-500">.AI</span>
            </Link>
            <div className="flex items-center gap-8">
              {user ? (
                <Link href="/dashboard" className="px-6 py-3 bg-white text-black rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all">Go to Dashboard</Link>
              ) : (
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => {
                      import('@/lib/auth').then(({ saveUserSession }) => {
                        saveUserSession({
                          id: 999,
                          name: 'Demo User',
                          email: 'demo@fitday.ai',
                          age: 25,
                          gender: 'male',
                          height_cm: 175,
                          weight_kg: 70,
                          goal: 'maintain',
                          activity_level: 'moderate',
                          target_calories: 2200
                        });
                        window.location.href = '/dashboard';
                      });
                    }}
                    className="text-[10px] font-black uppercase tracking-widest text-purple-400 hover:text-white transition-colors animate-pulse"
                  >
                    Try Demo
                  </button>
                  <Link href="/login" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">Login</Link>
                  <Link href="/register" className="px-8 py-3 bg-white text-black rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-purple-600 hover:text-white shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all active:scale-95">
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </nav>

        {/* Hero Section */}
        <section className="relative pt-48 pb-20 px-6 max-w-7xl mx-auto z-10 grid lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/5 bg-white/5 text-[10px] font-black mb-10 uppercase tracking-[0.3em] font-outfit italic">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse shadow-[0_0_10px_#9333ea]" />
              Tailored for Bangladesh
            </div>
            <h1 className="text-7xl lg:text-[10rem] font-black leading-[0.8] mb-10 font-outfit italic tracking-tighter">
              Smart <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-300 to-indigo-400">
                Lifestyle
              </span> <br />
              Coach.
            </h1>
            <p className="text-xl text-zinc-400 mb-12 max-w-xl leading-relaxed font-light font-inter">
              Your personal fitness and nutrition assistant. FitDay helps you track your health with local food logic and smart plans.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/register" className="h-16 px-10 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-3 shadow-[0_20px_40px_-10px_rgba(147,51,234,0.3)] hover:scale-105 active:scale-95">
                Start Now <span className="text-xl">→</span>
              </Link>
              <button
                onClick={() => setShowScanner(true)}
                className="h-16 px-10 border border-white/10 hover:border-purple-500/30 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all hover:bg-white/5"
              >
                Analyze BMI
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="relative aspect-square flex items-center justify-center"
          >
            {/* Ambient Background Pulse */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute w-full h-full bg-purple-600/30 rounded-full blur-[120px]"
            />

            {/* Main Fitness Visual (Health Core) */}
            <div className="relative w-[80%] h-[80%] flex items-center justify-center">
              <motion.div
                animate={{
                  y: [0, -20, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative z-10 w-full h-full"
              >
                <img
                  src="/health-core.png"
                  alt="FitDay AI Health Core"
                  className="w-full h-full object-contain drop-shadow-[0_0_50px_rgba(147,51,234,0.4)]"
                  style={{ mixBlendMode: 'screen' }}
                />
              </motion.div>

              {/* Floating Data Icons */}
              {[
                { icon: "🥗", label: "Nutrient", delay: 0, pos: "top-0 left-0" },
                { icon: "⚡", label: "Energy", delay: 1, pos: "top-20 right-0" },
                { icon: "❤️", label: "Vitality", delay: 2, pos: "bottom-10 left-20" },
                { icon: "🔥", label: "Metabolism", delay: 3, pos: "bottom-0 right-10" }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    y: [0, -15, 0],
                    x: [0, 10, 0]
                  }}
                  transition={{
                    duration: 4,
                    delay: item.delay,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className={`absolute ${item.pos} z-20 flex flex-col items-center gap-2`}
                >
                  <div className="w-14 h-14 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center text-2xl shadow-xl">
                    {item.icon}
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500 bg-black/50 px-2 py-1 rounded-full border border-white/5">
                    {item.label}
                  </span>
                </motion.div>
              ))}

              {/* Heartbeat Pulse Line (Animated SVG) */}
              <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 400 400">
                <motion.path
                  d="M0,200 L100,200 L120,150 L140,250 L160,200 L400,200"
                  fill="none"
                  stroke="rgba(147, 51, 234, 0.5)"
                  strokeWidth="2"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              </svg>
            </div>

            {/* Outer Decorative Circles */}
            <div className="absolute inset-0 border border-white/5 rounded-full animate-spin-slow opacity-20" />
            <div className="absolute inset-[15%] border border-purple-500/10 rounded-full animate-reverse-spin-slow opacity-20" />
          </motion.div>
        </section>

        {/* STATS SECTION */}
        <section className="relative py-24 border-y border-white/5 bg-white/[0.01] overflow-hidden">
          <div className="absolute inset-0 bg-noise opacity-[0.02]" />
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 relative z-10">
            {[
              { label: "Active Biometrics", val: "10K+", icon: "🔋", color: "text-purple-500" },
              { label: "Local Food Logs", val: "2.5M+", icon: "🍱", color: "text-cyan-500" },
              { label: "Neural Workouts", val: "800+", icon: "🦾", color: "text-indigo-500" },
              { label: "AI Prediction", val: "99.2%", icon: "📉", color: "text-emerald-500" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.8 }}
                className="group cursor-default"
              >
                <div className="flex flex-col items-center">
                  <div className={`text-4xl font-black font-outfit italic ${stat.color} mb-3 tracking-tighter group-hover:scale-110 transition-transform`}>{stat.val}</div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg opacity-40">{stat.icon}</span>
                    <div className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">{stat.label}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Feature Bento Grid */}
        <section className="py-40 px-6 max-w-7xl mx-auto z-10 relative">
          <div className="text-center mb-24">
            <h2 className="text-xs font-black text-purple-500 uppercase tracking-[0.6em] mb-4">Core Features</h2>
            <p className="text-4xl lg:text-6xl font-black font-outfit tracking-tighter italic uppercase text-white">Engineered for You.</p>
          </div>

          <div className="grid md:grid-cols-12 gap-6 auto-rows-[300px]">
            <GlassCard className="md:col-span-8 p-12 flex flex-col justify-end overflow-hidden group" delay={0.1}>
              <div className="absolute top-0 right-0 p-12 opacity-5"><span className="text-[200px] font-black italic">BN</span></div>
              <motion.img
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                src="/app-mockup.png"
                className="absolute top-0 right-[-10%] w-[60%] opacity-20 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none drop-shadow-2xl"
                style={{ transform: 'rotate(-5deg)', mixBlendMode: 'screen' }}
              />
              <div className="relative z-10">
                <h3 className="text-4xl lg:text-5xl font-black font-outfit italic text-white mb-6 uppercase leading-none">Localized <br /><span className="text-purple-500">Nutrition</span></h3>
                <p className="text-zinc-400 max-w-sm mb-8 uppercase text-[10px] font-black tracking-[0.3em] leading-loose">Accurate calorie counts for Bangladeshi cuisine. Engineered for the local palate.</p>
                <div className="flex gap-4">
                  {['RICE', 'LENTIL', 'FISH'].map(t => <span key={t} className="px-3 py-1 bg-white/5 rounded-full text-[8px] font-black uppercase tracking-widest border border-white/5">{t}</span>)}
                </div>
              </div>
            </GlassCard>

            <GlassCard className="md:col-span-4 p-12 flex flex-col items-center justify-center text-center group" delay={0.2}>
              <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center mb-8 border border-purple-500/20 group-hover:scale-110 transition-transform">
                <span className="text-4xl">🧬</span>
              </div>
              <h3 className="text-xl font-black font-outfit uppercase italic mb-4">Smart Profiling</h3>
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Adjusted for your specific body type.</p>
            </GlassCard>

            <GlassCard className="md:col-span-4 p-12 flex flex-col justify-between" delay={0.3}>
              <span className="text-3xl">🛡️</span>
              <div>
                <h3 className="text-xl font-black font-outfit italic text-white uppercase mb-2">Fast & Secure</h3>
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest leading-relaxed">Runs on global infrastructure. Zero latency responses.</p>
              </div>
            </GlassCard>

            <GlassCard className="md:col-span-8 p-12 flex items-center gap-10" delay={0.4}>
              <div className="h-full w-48 bg-white/5 rounded-2xl order-last overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 to-transparent" />
                <div className="p-4 space-y-2">
                  <div className="h-2 w-full bg-white/10 rounded-full" />
                  <div className="h-2 w-[60%] bg-white/10 rounded-full" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-3xl font-black font-outfit italic text-white mb-4 uppercase">AI Intelligence Hub</h3>
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest leading-loose max-w-sm">Powered by Gemini 1.5. Real-time nutritional reconstruction with 98% accuracy on plate scans.</p>
              </div>
            </GlassCard>
          </div>
        </section>

        {/* Performance Visualizer */}
        <section className="py-40 bg-white/[0.02] border-y border-white/5 relative z-10 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-5xl lg:text-8xl font-black font-outfit italic leading-[0.85] tracking-tighter mb-10 text-white uppercase">
                Total <br /> <span className="text-purple-500">Lifestyle </span> <br /> Control.
              </h2>
              <div className="space-y-8">
                {[
                  { t: 'METABOLIC SYNC', d: 'Your metrics updated in real-time with every meal.' },
                  { t: 'ADAPTIVE TRAINING', d: 'Plans that adapt to your progress.' },
                  { t: 'SMART RECOVERY', d: 'Sleep and hydration tracking integrated.' }
                ].map((item, i) => (
                  <div key={i} className="group cursor-default">
                    <div className="text-[10px] font-black text-zinc-500 group-hover:text-purple-400 transition-colors uppercase tracking-[0.4em] mb-2">{item.t}</div>
                    <p className="text-lg text-zinc-400 font-light">{item.d}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative p-10 bg-zinc-900/50 border border-white/10 rounded-[3rem] shadow-2xl backdrop-blur-xl group hover:border-purple-500/30 transition-all duration-500">
              <div className="flex justify-between items-center mb-10 border-b border-white/10 pb-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest font-outfit">Performance Stream</span>
                </div>
                <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest italic">Live Analyzer</div>
              </div>

              <div className="space-y-10">
                <div>
                  <div className="flex justify-between mb-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Total Output</span>
                    <span className="text-[10px] font-black text-purple-400 italic">SYNCED _ 88.4%</span>
                  </div>
                  <div className="h-6 bg-zinc-950 rounded-full border border-white/5 overflow-hidden p-1">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: '88%' }}
                      className="h-full bg-purple-500 rounded-full shadow-[0_0_15px_#9333ea]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                    <div className="text-[10px] font-black text-zinc-600 mb-2 uppercase tracking-widest">Efficiency</div>
                    <div className="text-4xl font-black text-white italic">0.96</div>
                  </div>
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                    <div className="text-[10px] font-black text-zinc-600 mb-2 uppercase tracking-widest">Intensity</div>
                    <div className="text-4xl font-black text-purple-400 italic">HIGH</div>
                  </div>
                </div>
              </div>

              <div className="mt-12 p-6 bg-purple-500/10 rounded-3xl border border-purple-500/20">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-black font-black text-xs shrink-0">AI</div>
                  <p className="text-[10px] text-purple-200 font-black uppercase tracking-widest leading-loose">"Metabolic rate is trending higher. Recommend 200kcal increase to sustain performance."</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final Call */}
        <section className="py-60 text-center relative z-10 px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <h2 className="text-5xl lg:text-[10rem] font-black mb-16 font-outfit italic tracking-tighter leading-none text-white uppercase">
              Start Your <br /> <span className="text-white/20">Journey Now.</span>
            </h2>
            <Link href="/register" className="inline-flex h-24 px-20 bg-white text-black rounded-full font-black uppercase italic text-sm tracking-[0.4em] hover:bg-purple-600 hover:scale-110 active:scale-95 transition-all shadow-[0_0_100px_rgba(255,255,255,0.1)]">
              Get Started
            </Link>
            <p className="mt-12 text-zinc-600 font-mono text-[10px] uppercase tracking-[0.5em]">Join the fitness revolution</p>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="pt-20 pb-10 border-t border-white/5 bg-[#000000] relative z-10 px-6 font-inter text-zinc-400">
          <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 mb-16">

            {/* Brand & Mission */}
            <div className="md:col-span-1">
              <Link href="/" className="text-2xl font-black font-outfit italic tracking-tighter mb-6 block text-white">
                FitDay<span className="text-purple-500">.AI</span>
              </Link>
              <p className="text-xs leading-relaxed mb-6">
                The first AI-powered fitness assistant tailored for the Bangladeshi lifestyle. We combine local nutrition data with advanced metabolic profiling to help you reach your goals.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-6 font-outfit">Platform</h4>
              <ul className="space-y-4 text-xs font-medium">
                <li><Link href="/dashboard" className="hover:text-purple-400 transition-colors">Dashboard</Link></li>
                <li><Link href="/register" className="hover:text-purple-400 transition-colors">Create Account</Link></li>
                <li><Link href="/login" className="hover:text-purple-400 transition-colors">Login</Link></li>
                <li><button onClick={() => setShowScanner(true)} className="hover:text-purple-400 transition-colors">BMI Calculator</button></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-6 font-outfit">Resources</h4>
              <ul className="space-y-4 text-xs font-medium">
                <li className="hover:text-purple-400 transition-colors cursor-pointer">Local Food Database</li>
                <li className="hover:text-purple-400 transition-colors cursor-pointer">Workout Library</li>
                <li className="hover:text-purple-400 transition-colors cursor-pointer">Success Stories</li>
                <li className="hover:text-purple-400 transition-colors cursor-pointer">Community</li>
              </ul>
            </div>

            {/* Legal & Contact */}
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-6 font-outfit">Contact & Legal</h4>
              <ul className="space-y-4 text-xs font-medium">
                <li className="hover:text-purple-400 transition-colors cursor-pointer">support@fitday.ai</li>
                <li className="hover:text-purple-400 transition-colors cursor-pointer">Privacy Policy</li>
                <li className="hover:text-purple-400 transition-colors cursor-pointer">Terms of Service</li>
                <li className="hover:text-purple-400 transition-colors cursor-pointer">Cookie Settings</li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-widest font-mono">
            <p>© 2026 FitDay AI. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <span className="hover:text-white cursor-pointer transition-colors">Twitter</span>
              <span className="hover:text-white cursor-pointer transition-colors">Instagram</span>
              <span className="hover:text-white cursor-pointer transition-colors">LinkedIn</span>
            </div>
          </div>
        </footer>
      </div>
    </PageTransition>
  )
}
