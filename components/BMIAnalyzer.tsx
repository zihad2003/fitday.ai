'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, Info, RotateCcw, ChevronDown } from 'lucide-react'

type UnitSystem = 'metric' | 'imperial'

interface BMIResult {
    value: number
    category: string
    color: string
    description: string
    deviation: string
}

export default function BMIAnalyzer({ onClose }: { onClose: () => void }) {
    const [unit, setUnit] = useState<UnitSystem>('metric')
    const [weight, setWeight] = useState('')
    const [heightCm, setHeightCm] = useState('')
    const [heightFt, setHeightFt] = useState('')
    const [heightIn, setHeightIn] = useState('')
    const [result, setResult] = useState<BMIResult | null>(null)
    const [error, setError] = useState('')

    const getBMICategory = (bmi: number): Omit<BMIResult, 'value'> => {
        if (bmi < 18.5) return {
            category: 'Underweight',
            color: 'text-blue-400 border-blue-500/50 bg-blue-500/10',
            description: 'Body weight is lower than recommended for this height.',
            deviation: 'Below optimal range'
        }
        if (bmi < 25) return {
            category: 'Normal Weight',
            color: 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10',
            description: 'Body weight is within the healthy range.',
            deviation: 'Optimal alignment'
        }
        if (bmi < 30) return {
            category: 'Overweight',
            color: 'text-orange-400 border-orange-500/50 bg-orange-500/10',
            description: 'Body weight is above the recommended range.',
            deviation: 'Above optimal range'
        }
        return {
            category: 'Obese',
            color: 'text-red-400 border-red-500/50 bg-red-500/10',
            description: 'Body weight suggests significantly higher accumulation of mass.',
            deviation: 'Significant deviation'
        }
    }

    const calculateBMI = () => {
        setError('')

        // 1. Validate & Normalize Weight (KG)
        const w = parseFloat(weight)
        if (!w || w <= 0 || w > 300) {
            setError('Please enter a valid weight (1-300 kg).')
            return
        }

        // 2. Validate & Normalize Height (Meters)
        let hMeters = 0
        if (unit === 'metric') {
            const cm = parseFloat(heightCm)
            if (!cm || cm <= 50 || cm > 300) {
                setError('Please enter a valid height (50-300 cm).')
                return
            }
            hMeters = cm / 100
        } else {
            const ft = parseFloat(heightFt) || 0
            const inc = parseFloat(heightIn) || 0
            if (ft === 0 && inc === 0) {
                setError('Please enter a valid height.')
                return
            }
            // Conversion: ((feet * 30.48) + (inches * 2.54)) / 100
            hMeters = ((ft * 30.48) + (inc * 2.54)) / 100
        }

        // Double Check
        if (hMeters <= 0.5 || hMeters > 3.0) {
            setError('Calculated height seems unrealistic. Please check inputs.')
            return
        }

        // 3. Compute BMI
        const bmiRaw = w / (hMeters * hMeters)
        const bmiValue = Math.round(bmiRaw * 100) / 100

        // 4. Generate Output
        setResult({
            value: bmiValue,
            ...getBMICategory(bmiValue)
        })
    }

    const resetForm = () => {
        setResult(null)
        setWeight('')
        setHeightCm('')
        setHeightFt('')
        setHeightIn('')
        setError('')
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-inter"
        >
            <div className="absolute inset-0" onClick={onClose} />

            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative w-full max-w-xl bg-zinc-950 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
                {/* Header */}
                <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-zinc-900/50">
                    <div>
                        <h3 className="text-xl font-black text-white font-outfit italic uppercase tracking-wide flex items-center gap-2">
                            <Activity className="text-purple-500" size={20} />
                            BMI Analyzer
                        </h3>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono mt-1">Advanced Body Metrics Module</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white">
                        ✕
                    </button>
                </div>

                <div className="p-8">
                    {!result ? (
                        <div className="space-y-8">
                            {/* Unit Toggle */}
                            <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                                {(['metric', 'imperial'] as const).map((u) => (
                                    <button
                                        key={u}
                                        onClick={() => setUnit(u)}
                                        className={`flex-1 py-3 text-xs font-black uppercase rounded-lg transition-all ${unit === u ? 'bg-purple-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                                    >
                                        {u === 'metric' ? 'Metric (CM / KG)' : 'Standard (FT / KG)'}
                                    </button>
                                ))}
                            </div>

                            {/* Input Grid */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Height</label>
                                    {unit === 'metric' ? (
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={heightCm}
                                                onChange={(e) => setHeightCm(e.target.value)}
                                                placeholder="e.g. 175"
                                                className="w-full h-14 bg-zinc-900 border border-white/10 rounded-xl px-4 text-white font-mono focus:border-purple-500 outline-none transition-all"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 text-xs font-black">CM</span>
                                        </div>
                                    ) : (
                                        <div className="flex gap-4">
                                            <div className="relative flex-1">
                                                <input
                                                    type="number"
                                                    value={heightFt}
                                                    onChange={(e) => setHeightFt(e.target.value)}
                                                    placeholder="5"
                                                    className="w-full h-14 bg-zinc-900 border border-white/10 rounded-xl px-4 text-white font-mono focus:border-purple-500 outline-none transition-all"
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 text-xs font-black">FT</span>
                                            </div>
                                            <div className="relative flex-1">
                                                <input
                                                    type="number"
                                                    value={heightIn}
                                                    onChange={(e) => setHeightIn(e.target.value)}
                                                    placeholder="9"
                                                    className="w-full h-14 bg-zinc-900 border border-white/10 rounded-xl px-4 text-white font-mono focus:border-purple-500 outline-none transition-all"
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 text-xs font-black">IN</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Weight</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={weight}
                                            onChange={(e) => setWeight(e.target.value)}
                                            placeholder="e.g. 70"
                                            className="w-full h-14 bg-zinc-900 border border-white/10 rounded-xl px-4 text-white font-mono focus:border-purple-500 outline-none transition-all"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 text-xs font-black">KG</span>
                                    </div>
                                </div>
                            </div>

                            <AnimatePresence>
                                {error && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-red-400 text-xs font-medium bg-red-500/10 p-3 rounded-lg border border-red-500/20 text-center">
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button
                                onClick={calculateBMI}
                                className="w-full h-14 bg-white text-black rounded-xl font-black uppercase text-xs tracking-widest hover:bg-purple-500 hover:text-white transition-all shadow-lg active:scale-95"
                            >
                                Run Analysis
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Result Card */}
                            <div className={`p-8 rounded-2xl border ${result.color} text-center space-y-4`}>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/20 text-xs font-black uppercase tracking-widest mb-2 border border-black/10">
                                    {result.deviation}
                                </div>
                                <div className="text-7xl font-black font-outfit italic tracking-tighter">
                                    {result.value}
                                </div>
                                <div className="text-xl font-bold uppercase tracking-wide">
                                    {result.category}
                                </div>
                                <div className="h-px w-20 bg-current opacity-20 mx-auto" />
                                <p className="text-sm font-medium opacity-90 max-w-sm mx-auto leading-relaxed">
                                    {result.description}
                                </p>
                            </div>

                            {/* Data Summary (Read Only) */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-zinc-900 p-4 rounded-xl border border-white/5">
                                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Weight Input</div>
                                    <div className="font-mono text-white">{weight} KG</div>
                                </div>
                                <div className="bg-zinc-900 p-4 rounded-xl border border-white/5">
                                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Height Input</div>
                                    <div className="font-mono text-white">
                                        {unit === 'metric' ? `${heightCm} CM` : `${heightFt}' ${heightIn}"`}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={resetForm}
                                    className="flex-1 h-12 border border-white/10 hover:bg-white/5 rounded-xl font-black uppercase text-[10px] tracking-widest text-zinc-400 hover:text-white transition-all flex items-center justify-center gap-2"
                                >
                                    <RotateCcw size={14} />
                                    New Scan
                                </button>
                                <button
                                    onClick={onClose}
                                    className="flex-1 h-12 bg-white text-black rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-purple-600 hover:text-white transition-all"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Disclaimer Footer */}
                    <div className="mt-8 pt-6 border-t border-white/5 flex items-start gap-3">
                        <Info className="flex-shrink-0 text-zinc-600 mt-0.5" size={14} />
                        <p className="text-[10px] text-zinc-600 leading-relaxed font-medium text-justify">
                            <strong className="text-zinc-500 uppercase">Disclaimer:</strong> This tool is for educational and screening purposes only. BMI is a simple metric and does not account for muscle mass, bone density, or overall body composition. It is not a diagnostic tool. Please consult a healthcare professional for specific health advice.
                        </p>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    )
}
