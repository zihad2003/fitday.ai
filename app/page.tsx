'use client'

import Link from 'next/link'
import { useEffect, useState, useRef, MouseEvent, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
// If you have the real auth lib, use it. Otherwise, this mock prevents crashes:
import { getUserSession } from '@/lib/auth' 

// ==========================================
// 1. UI COMPONENT: Spotlight Card
// ==========================================
const SpotlightCard = ({ children, className = "" }: { children: ReactNode, className?: string }) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(6,182,212,0.15), transparent 40%)`,
        }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
};

// ==========================================
// 2. FEATURE: Bio-Metric Quick Scanner
// ==========================================
const QuickScanModal = ({ onClose }: { onClose: () => void }) => {
  const [unit, setUnit] = useState("cm")
  const [cm, setCm] = useState("")
  const [feet, setFeet] = useState("")
  const [inches, setInches] = useState("")
  const [weight, setWeight] = useState("")
  const [result, setResult] = useState<null | { bmi: string; status: string }>(null)
  const [isScanning, setIsScanning] = useState(false)

  const handleCalculate = () => {
    setIsScanning(true)
    // Simulate complex calculation delay
    setTimeout(() => {
      let heightMeters = 0
      if (unit === "cm") {
        heightMeters = parseFloat(cm) / 100
      } else {
        heightMeters = ((parseFloat(feet) || 0) * 0.3048) + ((parseFloat(inches) || 0) * 0.0254)
      }
      
      const weightKg = parseFloat(weight)
      if (heightMeters > 0 && weightKg > 0) {
        const bmiValue = weightKg / (heightMeters * heightMeters)
        let status = "Optimal"
        if (bmiValue < 18.5) status = "Underweight"
        else if (bmiValue >= 25 && bmiValue < 30) status = "Overweight"
        else if (bmiValue >= 30) status = "Obese"
        
        setResult({ bmi: bmiValue.toFixed(1), status })
      }
      setIsScanning(false)
    }, 1000)
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl transition-opacity" onClick={onClose}></div>
      
      <div className="relative w-full max-w-md bg-black/80 border border-white/10 rounded-3xl overflow-hidden animate-in fade-in zoom-in duration-300 ring-1 ring-white/5">
        {isScanning && <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500 shadow-[0_0_20px_#06b6d4] animate-[scan_1.5s_ease-in-out_infinite]"></div>}
        
        <div className="p-8 relative z-10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span> BIO-SCANNER
            </h3>
            <button onClick={onClose} className="text-slate-500 hover:text-white">✕</button>
          </div>

          {!result ? (
            <div className="space-y-4">
               <div className="flex bg-slate-900/50 p-1 rounded-lg border border-white/5">
                 {['cm', 'ft'].map((u) => (
                   <button key={u} onClick={() => setUnit(u)} className={`flex-1 py-2 text-xs font-mono uppercase rounded ${unit === u ? 'bg-white/10 text-cyan-400' : 'text-slate-500'}`}>
                     {u === 'cm' ? 'Metric' : 'Imperial'}
                   </button>
                 ))}
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 {unit === 'cm' ? (
                   <input type="number" placeholder="Height (cm)" value={cm} onChange={e => setCm(e.target.value)} className="col-span-2 bg-slate-900/50 border border-white/10 rounded-lg p-3 text-white focus:border-cyan-500 outline-none transition-colors" />
                 ) : (
                   <>
                     <input type="number" placeholder="Feet" value={feet} onChange={e => setFeet(e.target.value)} className="bg-slate-900/50 border border-white/10 rounded-lg p-3 text-white focus:border-cyan-500 outline-none" />
                     <input type="number" placeholder="Inches" value={inches} onChange={e => setInches(e.target.value)} className="bg-slate-900/50 border border-white/10 rounded-lg p-3 text-white focus:border-cyan-500 outline-none" />
                   </>
                 )}
                 <input type="number" placeholder="Weight (kg)" value={weight} onChange={e => setWeight(e.target.value)} className="col-span-2 bg-slate-900/50 border border-white/10 rounded-lg p-3 text-white focus:border-cyan-500 outline-none" />
               </div>

               <button onClick={handleCalculate} disabled={isScanning} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-4 rounded-lg font-bold transition-all disabled:opacity-50">
                 {isScanning ? 'SCANNING...' : 'CALCULATE'}
               </button>
            </div>
          ) : (
            <div className="text-center animate-in slide-in-from-bottom-2">
              <div className="text-xs text-slate-400 font-mono mb-2">RESULT</div>
              <div className="text-5xl font-black text-white mb-2">{result.bmi}</div>
              <div className={`inline-block px-3 py-1 rounded text-[10px] font-bold font-mono uppercase border ${result.status === 'Optimal' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                {result.status}
              </div>
              <button onClick={() => setResult(null)} className="block w-full mt-6 text-xs text-slate-500 hover:text-white underline">Reset</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ==========================================
// 3. PAGE: Landing
// ==========================================
export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [showScanner, setShowScanner] = useState(false)

  useEffect(() => {
    // Check local session
    const session = getUserSession()
    if (session) setUser(session)
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden selection:bg-cyan-500/30 font-sans relative">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      <div className="fixed inset-0 bg-slate-950/40 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_20%,#020617_100%)]"></div>

      {showScanner && <QuickScanModal onClose={() => setShowScanner(false)} />}

      {/* Navbar */}
      <nav className="fixed w-full z-50 top-0 left-0 border-b border-white/5 bg-slate-950/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-xl font-bold tracking-tighter flex items-center gap-2 group cursor-pointer">
            <div className="w-6 h-6 bg-cyan-500 rounded-sm shadow-[0_0_15px_rgba(6,182,212,0.5)] group-hover:rotate-45 transition duration-300"></div>
            FitDay<span className="text-cyan-400">.AI</span>
          </div>
          <div className="flex gap-6 items-center">
            {user ? (
               <Link href="/dashboard" className="px-5 py-2 text-sm border border-white/20 rounded-full hover:bg-white/5 transition">Dashboard</Link>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-slate-400 hover:text-white transition">Login</Link>
                <Link href="/register" className="px-5 py-2 text-sm bg-white text-black font-bold rounded-full hover:bg-cyan-50 transition shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-32 lg:pt-48 lg:pb-40 px-6 max-w-7xl mx-auto text-center z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-mono mb-8">
           <span className="relative flex h-2 w-2">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
           </span>
           SYSTEM V2.0 ONLINE
        </div>

        <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9] text-white">
          Upgrade Your <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-500 to-purple-600">
            Biological Engine
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
          Advanced AI nutrition metrics tailored for <span className="text-slate-200 font-semibold">Bangladeshi physiology</span>. 
          Precision tracking, real-time macro analysis, and adaptive protocols.
        </p>
        
        

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/register" className="group relative px-8 py-4 bg-white text-black rounded-lg font-bold text-lg overflow-hidden">
            <span className="relative z-10 group-hover:-translate-y-1 block transition-transform">Start Protocol</span>
            <div className="absolute inset-0 bg-cyan-200 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          </Link>
          
          <button 
            onClick={() => setShowScanner(true)}
            className="group px-8 py-4 bg-transparent border border-white/10 text-white rounded-lg font-bold text-lg hover:border-cyan-500/50 hover:bg-cyan-950/30 transition flex items-center justify-center gap-2 backdrop-blur-sm"
          >
            <span className="text-cyan-400 group-hover:scale-110 transition duration-300">⚡</span> Quick Bio-Scan
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 relative border-t border-white/5 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '🧬', title: 'Local Bio-Data', desc: 'Calibrated for Rice, Dal, and Fish. No generic western data sets.' },
              { icon: '⚡', title: 'Edge Compute', desc: 'Built on Cloudflare Workers. Zero latency generation.' },
              { icon: '🛡️', title: 'Medical Grade', desc: 'Mifflin-St Jeor formulas optimized for South Asian genetics.' }
            ].map((f, i) => (
              <SpotlightCard key={i} className="p-8 group">
                <div className="w-12 h-12 bg-slate-900 border border-white/10 rounded-lg flex items-center justify-center text-2xl mb-6 text-white shadow-inner group-hover:scale-110 transition duration-300 group-hover:border-cyan-500/30">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2 font-mono tracking-tight">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 py-12 text-center bg-slate-950">
        <p className="text-slate-600 font-mono text-xs uppercase tracking-widest">
          © 2026 FitDay AI. <span className="text-cyan-900">System Status: Optimal</span>
        </p>
      </footer>
    </div>
  )
}