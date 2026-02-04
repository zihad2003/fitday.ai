'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Icons from '@/components/icons/Icons'
import { StepCard, NeuralProgress } from './OnboardingStep'
import { HealthEngine, Gender, ActivityLevel, FitnessGoal } from '@/lib/health-engine'

interface OnboardingData {
    age: number
    gender: Gender
    heightCm: number
    weightKg: number
    bodyFatPercentage?: number
    goal: FitnessGoal
    activityLevel: ActivityLevel
    targetWeightKg?: number
    workoutDaysPerWeek: number
    preferredWorkoutTime: string
    availableEquipment: string
    wakeUpTime: string
    sleepTime: string
}

const DEFAULT_DATA: OnboardingData = {
    age: 25,
    gender: 'male',
    heightCm: 175,
    weightKg: 70,
    goal: 'maintain',
    activityLevel: 'moderate',
    workoutDaysPerWeek: 4,
    preferredWorkoutTime: 'morning',
    availableEquipment: 'gym',
    wakeUpTime: '07:00',
    sleepTime: '23:00'
}

export default function OnboardingFlowRedesign() {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(1)
    const [data, setData] = useState<OnboardingData>(DEFAULT_DATA)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const totalSteps = 6

    const updateData = (newData: Partial<OnboardingData>) => {
        setData(prev => ({ ...prev, ...newData }))
    }

    const results = useMemo(() => {
        const bmr = HealthEngine.calculateBMR({
            age: data.age,
            gender: data.gender,
            heightCm: data.heightCm,
            weightKg: data.weightKg,
            bodyFatPercentage: data.bodyFatPercentage,
            activityLevel: data.activityLevel,
            goal: data.goal
        })
        const tdee = HealthEngine.calculateTDEE(bmr, data.activityLevel)
        const calories = HealthEngine.calculateTargetCalories(tdee, data.goal)
        const macros = HealthEngine.calculateMacros(calories, data.goal)
        const water = HealthEngine.calculateWaterGoal(data.weightKg, data.activityLevel)

        return { bmr, tdee, calories, macros, water }
    }, [data])

    const handleComplete = async () => {
        setIsSubmitting(true)
        try {
            const response = await fetch('/api/onboarding/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...data,
                    bmr: results.bmr,
                    tdee: results.tdee,
                    target_calories: results.calories,
                    target_protein: results.macros.proteinGrams,
                    target_carbs: results.macros.carbGrams,
                    target_fats: results.macros.fatGrams,
                    daily_water_goal_ml: results.water,
                    onboarding_completed: true,
                }),
            })

            if (response.ok) {
                router.push('/dashboard?onboarding=complete')
            } else {
                alert('Transmission failed. Re-syncing required.')
            }
        } catch (error) {
            console.error('Onboarding failed:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 font-inter overflow-x-hidden relative">
            {/* Background Atmosphere */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[100%] h-[100%] bg-purple-900/5 blur-[200px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[100%] h-[100%] bg-indigo-900/5 blur-[200px]" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] contrast-150 brightness-150" />
            </div>

            <div className="w-full max-w-2xl relative z-10">
                <NeuralProgress steps={totalSteps} current={currentStep} />

                <AnimatePresence mode="wait">
                    {currentStep === 1 && (
                        <StepCard
                            key="step1"
                            title="Biological Foundation"
                            subtitle="Initialize your physical parameters"
                        >
                            <div className="grid grid-cols-2 gap-8">
                                <InputGroup label="Age" type="number" value={data.age} onChange={(v: string) => updateData({ age: parseInt(v) })} unit="Yrs" />
                                <InputGroup label="Gender" type="select" options={['male', 'female', 'other']} value={data.gender} onChange={(v: string) => updateData({ gender: v as Gender })} />
                                <InputGroup label="Height" type="number" value={data.heightCm} onChange={(v: string) => updateData({ heightCm: parseFloat(v) })} unit="Cm" />
                                <InputGroup label="Weight" type="number" value={data.weightKg} onChange={(v: string) => updateData({ weightKg: parseFloat(v) })} unit="Kg" />
                            </div>
                        </StepCard>
                    )}

                    {currentStep === 2 && (
                        <StepCard
                            key="step2"
                            title="Active Intelligence"
                            subtitle="Map your metabolical activity"
                        >
                            <div className="space-y-6">
                                {[
                                    { id: 'sedentary', label: 'Sedentary', desc: 'Minimal movement, office life' },
                                    { id: 'light', label: 'Lightly Active', desc: '1-3 days of activity' },
                                    { id: 'moderate', label: 'Moderately Active', desc: '3-5 days of training' },
                                    { id: 'active', label: 'Very Active', desc: 'Hard training 6-7 days' },
                                ].map((level) => (
                                    <OptionCard
                                        key={level.id}
                                        active={data.activityLevel === level.id}
                                        onClick={() => updateData({ activityLevel: level.id as ActivityLevel })}
                                        label={level.label}
                                        desc={level.desc}
                                    />
                                ))}
                            </div>
                        </StepCard>
                    )}

                    {currentStep === 3 && (
                        <StepCard
                            key="step3"
                            title="Primary Directive"
                            subtitle="Define your evolution objective"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { id: 'lose_weight', label: 'Lose Weight', icon: Icons.Activity, color: 'pink' },
                                    { id: 'gain_muscle', label: 'Build Muscle', icon: Icons.Strength, color: 'purple' },
                                    { id: 'maintain', label: 'Maintain', icon: Icons.Target, color: 'cyan' },
                                    { id: 'increase_strength', label: 'Power Up', icon: Icons.Weight, color: 'orange' },
                                ].map((goal) => (
                                    <GoalButton
                                        key={goal.id}
                                        active={data.goal === goal.id}
                                        onClick={() => updateData({ goal: goal.id as FitnessGoal })}
                                        label={goal.label}
                                        icon={goal.icon}
                                        color={goal.color}
                                    />
                                ))}
                            </div>

                            {(data.goal === 'lose_weight' || data.goal === 'gain_muscle') && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
                                    <InputGroup label="Target Weight" type="number" value={data.targetWeightKg || data.weightKg} onChange={(v: string) => updateData({ targetWeightKg: parseFloat(v) })} unit="Kg" />
                                </motion.div>
                            )}
                        </StepCard>
                    )}

                    {currentStep === 4 && (
                        <StepCard
                            key="step4"
                            title="Tactical Protocol"
                            subtitle="Configure your training environment"
                        >
                            <div className="space-y-8">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-4 block">Weekly Intensity</label>
                                    <div className="flex justify-between gap-2">
                                        {[2, 3, 4, 5, 6].map(d => (
                                            <button
                                                key={d}
                                                onClick={() => updateData({ workoutDaysPerWeek: d })}
                                                className={`flex-1 py-4 rounded-xl border font-outfit font-black italic transition-all ${data.workoutDaysPerWeek === d ? 'bg-purple-600 border-purple-400 text-white shadow-lg' : 'bg-white/5 border-white/5 text-zinc-600 hover:border-white/10'}`}
                                            >
                                                {d} <span className="text-[10px] not-italic opacity-50 ml-1">Days</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <InputGroup label="Preferred Time" type="select" options={['morning', 'afternoon', 'evening']} value={data.preferredWorkoutTime} onChange={(v: string) => updateData({ preferredWorkoutTime: v })} />
                                    <InputGroup label="Equipment" type="select" options={['gym', 'home', 'minimal', 'bodyweight']} value={data.availableEquipment} onChange={(v: string) => updateData({ availableEquipment: v })} />
                                </div>
                            </div>
                        </StepCard>
                    )}

                    {currentStep === 5 && (
                        <StepCard
                            key="step5"
                            title="Circadian Sync"
                            subtitle="Optimize your biological cycle"
                        >
                            <div className="grid grid-cols-2 gap-8">
                                <InputGroup label="Wake Up" type="time" value={data.wakeUpTime} onChange={(v: string) => updateData({ wakeUpTime: v })} />
                                <InputGroup label="Shut Down" type="time" value={data.sleepTime} onChange={(v: string) => updateData({ sleepTime: v })} />
                            </div>
                            <div className="mt-12 p-8 bg-indigo-600/10 border border-indigo-500/20 rounded-3xl">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white">
                                        <Icons.Activity size={20} />
                                    </div>
                                    <h4 className="font-outfit font-black italic uppercase text-indigo-400 tracking-wider">Hydration Sync</h4>
                                </div>
                                <p className="text-zinc-500 text-sm mb-4">Based on your mass and activity, we've calculated your optimal fluid intake.</p>
                                <div className="text-4xl font-black font-outfit italic text-white">{results.water} <span className="text-sm not-italic text-zinc-600 ml-1">ML / DAY</span></div>
                            </div>
                        </StepCard>
                    )}

                    {currentStep === 6 && (
                        <StepCard
                            key="step6"
                            title="Neural Matrix Active"
                            subtitle="Your optimized parameters are ready"
                        >
                            <div className="space-y-6">
                                <ResultRow label="Basal metabolic rate" value={`${results.bmr} kcal`} />
                                <ResultRow label="Active metabolism" value={`${results.tdee} kcal`} />
                                <ResultRow label="Strategic target" value={`${results.calories} kcal`} color="text-purple-400" />
                                <div className="grid grid-cols-3 gap-4 pt-4">
                                    <MacroStat label="Protein" value={`${results.macros.proteinGrams}g`} />
                                    <MacroStat label="Carbs" value={`${results.macros.carbGrams}g`} />
                                    <MacroStat label="Fats" value={`${results.macros.fatGrams}g`} />
                                </div>
                            </div>
                        </StepCard>
                    )}
                </AnimatePresence>

                {/* Navigation */}
                <div className="mt-12 flex gap-4">
                    {currentStep > 1 && (
                        <button
                            onClick={() => setCurrentStep(prev => prev - 1)}
                            className="flex-1 py-5 px-8 rounded-2xl bg-zinc-900 text-zinc-400 font-black uppercase tracking-widest text-[10px] hover:text-white transition-all border border-white/5 active:scale-95"
                        >
                            Regress
                        </button>
                    )}

                    <button
                        onClick={() => currentStep === totalSteps ? handleComplete() : setCurrentStep(prev => prev + 1)}
                        disabled={isSubmitting}
                        className="flex-[2] py-5 px-8 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-[10px] hover:bg-zinc-200 transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)] active:scale-95 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Synchronizing...' : currentStep === totalSteps ? 'Activate Protocol' : 'Proceed'}
                    </button>
                </div>

                <p className="mt-8 text-center text-[9px] font-mono text-zinc-800 uppercase tracking-[0.5em]">
                    Secure Neural Handshake: FitDay_OS_v2.0
                </p>
            </div>
        </div>
    )
}

// UI HELPER COMPONENTS
interface InputGroupProps {
    label: string
    type: 'number' | 'text' | 'select' | 'time'
    options?: string[]
    value: any
    onChange: (v: string) => void
    unit?: string
}

function InputGroup({ label, type, options, value, onChange, unit }: InputGroupProps) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-1 block">{label}</label>
            <div className="relative group">
                {type === 'select' ? (
                    <select
                        value={value}
                        onChange={e => onChange(e.target.value)}
                        className="w-full h-16 bg-white/5 border border-white/5 rounded-2xl px-6 font-outfit font-black italic uppercase outline-none focus:border-purple-500 transition-all appearance-none cursor-pointer"
                    >
                        {options?.map((opt: string) => (
                            <option key={opt} value={opt} className="bg-zinc-950">{opt.replace('_', ' ')}</option>
                        ))}
                    </select>
                ) : (
                    <input
                        type={type}
                        value={value}
                        onChange={e => onChange(e.target.value)}
                        className="w-full h-16 bg-white/5 border border-white/5 rounded-2xl px-6 font-outfit font-black italic outline-none focus:border-purple-500 transition-all"
                    />
                )}
                {unit && <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-zinc-700 uppercase">{unit}</span>}
            </div>
        </div>
    )
}

function OptionCard({ active, onClick, label, desc }: any) {
    return (
        <button
            onClick={onClick}
            className={`w-full p-6 rounded-2xl border transition-all text-left group ${active ? 'bg-purple-600/10 border-purple-500 shadow-lg' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
        >
            <div className="flex justify-between items-center mb-1">
                <h4 className={`font-outfit font-black italic uppercase tracking-wider ${active ? 'text-white' : 'text-zinc-400 group-hover:text-white'}`}>{label}</h4>
                {active && <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />}
            </div>
            <p className="text-xs text-zinc-600">{desc}</p>
        </button>
    )
}

function GoalButton({ active, onClick, label, icon: Icon, color }: any) {
    return (
        <button
            onClick={onClick}
            className={`p-8 rounded-[2rem] border transition-all text-center flex flex-col items-center group overflow-hidden relative ${active ? `bg-${color}-600/20 border-${color}-500 shadow-xl` : 'bg-white/5 border-white/5 hover:border-white/10'}`}
        >
            {active && <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/20 blur-3xl`} />}
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${active ? `bg-${color}-500 text-white` : 'bg-zinc-900 text-zinc-600'}`}>
                <Icon size={28} />
            </div>
            <h3 className={`font-outfit font-black italic uppercase tracking-tight ${active ? 'text-white' : 'text-zinc-500'}`}>{label}</h3>
        </button>
    )
}

function ResultRow({ label, value, color = "text-white" }: any) {
    return (
        <div className="flex justify-between items-center py-4 border-b border-white/5">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">{label}</span>
            <span className={`text-xl font-black font-outfit italic ${color}`}>{value}</span>
        </div>
    )
}

function MacroStat({ label, value }: any) {
    return (
        <div className="text-center p-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-1">{label}</div>
            <div className="text-lg font-black font-outfit italic text-white">{value}</div>
        </div>
    )
}
