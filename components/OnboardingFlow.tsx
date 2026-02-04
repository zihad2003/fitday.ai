'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Icons from '@/components/icons/Icons'

interface OnboardingData {
    // Step 1: Basic Info
    age?: number
    gender?: 'male' | 'female' | 'other'
    height_cm?: number
    weight_kg?: number
    body_fat_percentage?: number

    // Step 2: Goals
    fitness_goal?: string
    target_weight_kg?: number
    target_body_fat_percentage?: number
    goal_deadline?: string

    // Step 3: Dietary Preferences
    dietary_preference?: string
    food_allergies?: string[]
    disliked_foods?: string[]

    // Step 4: Workout Preferences
    workout_days_per_week?: number
    preferred_workout_time?: string
    available_equipment?: string
    workout_duration_preference?: number

    // Step 5: Lifestyle
    wake_up_time?: string
    sleep_time?: string
    daily_water_goal_ml?: number
    activity_level?: string
}

const fitnessGoals = [
    { id: 'build_muscle', label: 'Build Muscle', icon: Icons.Strength, color: 'purple', description: 'Gain lean muscle mass and strength' },
    { id: 'lose_weight', label: 'Lose Weight', icon: Icons.Fire, color: 'pink', description: 'Burn fat and achieve your target weight' },
    { id: 'maintain_fitness', label: 'Maintain Fitness', icon: Icons.Target, color: 'cyan', description: 'Stay healthy and maintain current physique' },
    { id: 'improve_endurance', label: 'Improve Endurance', icon: Icons.Running, color: 'indigo', description: 'Boost stamina and cardiovascular health' },
    { id: 'increase_strength', label: 'Increase Strength', icon: Icons.Weight, color: 'emerald', description: 'Get stronger and lift heavier' },
    { id: 'general_health', label: 'General Health', icon: Icons.Heart, color: 'red', description: 'Overall wellness and healthy lifestyle' },
]

const dietaryPreferences = [
    { id: 'none', label: 'No Restrictions', description: 'I eat everything' },
    { id: 'vegetarian', label: 'Vegetarian', description: 'No meat or fish' },
    { id: 'vegan', label: 'Vegan', description: 'No animal products' },
    { id: 'pescatarian', label: 'Pescatarian', description: 'Fish but no meat' },
    { id: 'keto', label: 'Keto', description: 'Low carb, high fat' },
    { id: 'halal', label: 'Halal', description: 'Islamic dietary laws' },
    { id: 'gluten_free', label: 'Gluten-Free', description: 'No gluten' },
    { id: 'dairy_free', label: 'Dairy-Free', description: 'No dairy products' },
]

const equipmentOptions = [
    { id: 'gym', label: 'Full Gym Access', icon: Icons.Strength, description: 'I have access to a complete gym' },
    { id: 'home', label: 'Home Equipment', icon: Icons.Target, description: 'Dumbbells, resistance bands, etc.' },
    { id: 'minimal', label: 'Minimal Equipment', icon: Icons.Running, description: 'Just basic items' },
    { id: 'bodyweight_only', label: 'Bodyweight Only', icon: Icons.Activity, description: 'No equipment needed' },
]

const activityLevels = [
    { id: 'sedentary', label: 'Sedentary', description: 'Little to no exercise', multiplier: 1.2 },
    { id: 'light', label: 'Lightly Active', description: '1-3 days/week', multiplier: 1.375 },
    { id: 'moderate', label: 'Moderately Active', description: '3-5 days/week', multiplier: 1.55 },
    { id: 'active', label: 'Very Active', description: '6-7 days/week', multiplier: 1.725 },
    { id: 'very_active', label: 'Extremely Active', description: 'Athlete level', multiplier: 1.9 },
]

export default function OnboardingFlow() {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(1)
    const [data, setData] = useState<OnboardingData>({})
    const [loading, setLoading] = useState(false)

    const totalSteps = 5

    const updateData = (newData: Partial<OnboardingData>) => {
        setData(prev => ({ ...prev, ...newData }))
    }

    const nextStep = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(prev => prev + 1)
        }
    }

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1)
        }
    }

    const handleSubmit = async () => {
        setLoading(true)
        try {
            // Calculate BMR and TDEE
            const bmr = calculateBMR(data)
            const tdee = calculateTDEE(bmr, data.activity_level || 'moderate')

            const response = await fetch('/api/onboarding/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...data,
                    bmr,
                    tdee,
                    target_calories: calculateTargetCalories(tdee, data.fitness_goal),
                    onboarding_completed: true,
                }),
            })

            if (response.ok) {
                router.push('/dashboard?onboarding=complete')
            } else {
                alert('Failed to complete onboarding. Please try again.')
            }
        } catch (error) {
            console.error('Onboarding error:', error)
            alert('An error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const calculateBMR = (data: OnboardingData): number => {
        if (!data.weight_kg || !data.height_cm || !data.age || !data.gender) return 0

        // Mifflin-St Jeor Equation
        const bmr = (10 * data.weight_kg) + (6.25 * data.height_cm) - (5 * data.age)
        return data.gender === 'male' ? bmr + 5 : bmr - 161
    }

    const calculateTDEE = (bmr: number, activityLevel: string): number => {
        const level = activityLevels.find(l => l.id === activityLevel)
        return Math.round(bmr * (level?.multiplier || 1.55))
    }

    const calculateTargetCalories = (tdee: number, goal?: string): number => {
        switch (goal) {
            case 'lose_weight':
                return Math.round(tdee - 500) // 500 calorie deficit
            case 'build_muscle':
                return Math.round(tdee + 300) // 300 calorie surplus
            case 'increase_strength':
                return Math.round(tdee + 200) // 200 calorie surplus
            default:
                return tdee // Maintenance
        }
    }

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="glow-purple top-[-20%] left-[-10%] w-[60%] h-[60%] blur-[160px] opacity-20" />
                <div className="glow-cyan bottom-[-20%] right-[-10%] w-[60%] h-[60%] blur-[160px] opacity-15" />
                <div className="absolute inset-0 bg-noise opacity-[0.02]" />
            </div>

            <div className="max-w-4xl w-full relative z-10">
                {/* Progress Bar */}
                <div className="mb-12">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-sm font-black uppercase tracking-wider text-zinc-500">
                            Step {currentStep} of {totalSteps}
                        </h2>
                        <span className="text-sm font-bold text-purple-400">
                            {Math.round((currentStep / totalSteps) * 100)}% Complete
                        </span>
                    </div>
                    <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-purple-600 to-cyan-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                        />
                    </div>
                </div>

                {/* Step Content */}
                <AnimatePresence mode="wait">
                    {currentStep === 1 && (
                        <Step1BasicInfo key="step1" data={data} updateData={updateData} />
                    )}
                    {currentStep === 2 && (
                        <Step2Goals key="step2" data={data} updateData={updateData} />
                    )}
                    {currentStep === 3 && (
                        <Step3Dietary key="step3" data={data} updateData={updateData} />
                    )}
                    {currentStep === 4 && (
                        <Step4Workout key="step4" data={data} updateData={updateData} />
                    )}
                    {currentStep === 5 && (
                        <Step5Lifestyle key="step5" data={data} updateData={updateData} />
                    )}
                </AnimatePresence>

                {/* Navigation */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-4 mt-12"
                >
                    {currentStep > 1 && (
                        <button
                            onClick={prevStep}
                            className="flex-1 py-4 px-6 bg-zinc-900 hover:bg-zinc-800 rounded-2xl font-bold transition-colors"
                        >
                            Back
                        </button>
                    )}
                    {currentStep < totalSteps ? (
                        <button
                            onClick={nextStep}
                            className="flex-1 py-4 px-6 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 rounded-2xl font-bold transition-all shadow-[0_0_30px_rgba(147,51,234,0.3)]"
                        >
                            Continue
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex-1 py-4 px-6 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 rounded-2xl font-bold transition-all shadow-[0_0_30px_rgba(147,51,234,0.3)] disabled:opacity-50"
                        >
                            {loading ? 'Creating Your Plan...' : 'Complete Setup'}
                        </button>
                    )}
                </motion.div>
            </div>
        </div>
    )
}

// Step Components
function Step1BasicInfo({ data, updateData }: { data: OnboardingData; updateData: (data: Partial<OnboardingData>) => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-card p-8 md:p-12 rounded-3xl"
        >
            <div className="mb-8">
                <h1 className="text-4xl md:text-5xl font-black font-outfit italic mb-4">
                    Let's Get to Know You
                </h1>
                <p className="text-zinc-400">
                    We need some basic information to create your personalized fitness plan.
                </p>
            </div>

            <div className="space-y-6">
                {/* Age */}
                <div>
                    <label className="block text-sm font-black uppercase tracking-wider text-zinc-500 mb-2">
                        Age
                    </label>
                    <input
                        type="number"
                        value={data.age || ''}
                        onChange={(e) => updateData({ age: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                        placeholder="25"
                        min="13"
                        max="100"
                    />
                </div>

                {/* Gender */}
                <div>
                    <label className="block text-sm font-black uppercase tracking-wider text-zinc-500 mb-3">
                        Gender
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                        {['male', 'female', 'other'].map((gender) => (
                            <button
                                key={gender}
                                onClick={() => updateData({ gender: gender as any })}
                                className={`py-3 px-4 rounded-xl font-bold capitalize transition-all ${data.gender === gender
                                        ? 'bg-purple-600 border-purple-500'
                                        : 'bg-zinc-900 border-white/10 hover:border-purple-500/50'
                                    } border`}
                            >
                                {gender}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Height */}
                <div>
                    <label className="block text-sm font-black uppercase tracking-wider text-zinc-500 mb-2">
                        Height (cm)
                    </label>
                    <input
                        type="number"
                        value={data.height_cm || ''}
                        onChange={(e) => updateData({ height_cm: parseFloat(e.target.value) })}
                        className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                        placeholder="170"
                        min="100"
                        max="250"
                    />
                </div>

                {/* Weight */}
                <div>
                    <label className="block text-sm font-black uppercase tracking-wider text-zinc-500 mb-2">
                        Current Weight (kg)
                    </label>
                    <input
                        type="number"
                        step="0.1"
                        value={data.weight_kg || ''}
                        onChange={(e) => updateData({ weight_kg: parseFloat(e.target.value) })}
                        className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                        placeholder="70"
                        min="30"
                        max="300"
                    />
                </div>

                {/* Body Fat % (Optional) */}
                <div>
                    <label className="block text-sm font-black uppercase tracking-wider text-zinc-500 mb-2">
                        Body Fat % <span className="text-zinc-600">(Optional)</span>
                    </label>
                    <input
                        type="number"
                        step="0.1"
                        value={data.body_fat_percentage || ''}
                        onChange={(e) => updateData({ body_fat_percentage: parseFloat(e.target.value) })}
                        className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                        placeholder="20"
                        min="5"
                        max="50"
                    />
                </div>
            </div>
        </motion.div>
    )
}

function Step2Goals({ data, updateData }: { data: OnboardingData; updateData: (data: Partial<OnboardingData>) => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-card p-8 md:p-12 rounded-3xl"
        >
            <div className="mb-8">
                <h1 className="text-4xl md:text-5xl font-black font-outfit italic mb-4">
                    What's Your Goal?
                </h1>
                <p className="text-zinc-400">
                    Choose your primary fitness objective. We'll create a plan tailored to achieve it.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
                {fitnessGoals.map((goal) => {
                    const Icon = goal.icon
                    return (
                        <button
                            key={goal.id}
                            onClick={() => updateData({ fitness_goal: goal.id })}
                            className={`p-6 rounded-2xl border transition-all text-left ${data.fitness_goal === goal.id
                                    ? `bg-${goal.color}-600/20 border-${goal.color}-500`
                                    : 'bg-zinc-900/50 border-white/10 hover:border-white/20'
                                }`}
                        >
                            <Icon size={32} className={`text-${goal.color}-400 mb-3`} strokeWidth={2} />
                            <h3 className="font-black text-lg mb-1">{goal.label}</h3>
                            <p className="text-sm text-zinc-500">{goal.description}</p>
                        </button>
                    )
                })}
            </div>

            {/* Target Weight (if losing/gaining) */}
            {(data.fitness_goal === 'lose_weight' || data.fitness_goal === 'build_muscle') && (
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-black uppercase tracking-wider text-zinc-500 mb-2">
                            Target Weight (kg)
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            value={data.target_weight_kg || ''}
                            onChange={(e) => updateData({ target_weight_kg: parseFloat(e.target.value) })}
                            className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                            placeholder="65"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-black uppercase tracking-wider text-zinc-500 mb-2">
                            Target Date <span className="text-zinc-600">(Optional)</span>
                        </label>
                        <input
                            type="date"
                            value={data.goal_deadline || ''}
                            onChange={(e) => updateData({ goal_deadline: e.target.value })}
                            className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                        />
                    </div>
                </div>
            )}
        </motion.div>
    )
}

function Step3Dietary({ data, updateData }: { data: OnboardingData; updateData: (data: Partial<OnboardingData>) => void }) {
    const [allergies, setAllergies] = useState<string[]>(data.food_allergies || [])
    const [allergyInput, setAllergyInput] = useState('')

    const addAllergy = () => {
        if (allergyInput.trim()) {
            const newAllergies = [...allergies, allergyInput.trim()]
            setAllergies(newAllergies)
            updateData({ food_allergies: newAllergies })
            setAllergyInput('')
        }
    }

    const removeAllergy = (index: number) => {
        const newAllergies = allergies.filter((_, i) => i !== index)
        setAllergies(newAllergies)
        updateData({ food_allergies: newAllergies })
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-card p-8 md:p-12 rounded-3xl"
        >
            <div className="mb-8">
                <h1 className="text-4xl md:text-5xl font-black font-outfit italic mb-4">
                    Dietary Preferences
                </h1>
                <p className="text-zinc-400">
                    Tell us about your dietary restrictions so we can create the perfect meal plan.
                </p>
            </div>

            <div className="space-y-8">
                {/* Dietary Preference */}
                <div>
                    <label className="block text-sm font-black uppercase tracking-wider text-zinc-500 mb-3">
                        Dietary Preference
                    </label>
                    <div className="grid md:grid-cols-2 gap-3">
                        {dietaryPreferences.map((pref) => (
                            <button
                                key={pref.id}
                                onClick={() => updateData({ dietary_preference: pref.id })}
                                className={`p-4 rounded-xl border transition-all text-left ${data.dietary_preference === pref.id
                                        ? 'bg-cyan-600/20 border-cyan-500'
                                        : 'bg-zinc-900/50 border-white/10 hover:border-white/20'
                                    }`}
                            >
                                <h4 className="font-bold mb-1">{pref.label}</h4>
                                <p className="text-xs text-zinc-500">{pref.description}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Food Allergies */}
                <div>
                    <label className="block text-sm font-black uppercase tracking-wider text-zinc-500 mb-3">
                        Food Allergies
                    </label>
                    <div className="flex gap-2 mb-3">
                        <input
                            type="text"
                            value={allergyInput}
                            onChange={(e) => setAllergyInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addAllergy()}
                            className="flex-1 px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                            placeholder="e.g., Peanuts, Shellfish"
                        />
                        <button
                            onClick={addAllergy}
                            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold transition-colors"
                        >
                            Add
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {allergies.map((allergy, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-red-600/20 border border-red-500/50 rounded-full text-sm flex items-center gap-2"
                            >
                                {allergy}
                                <button
                                    onClick={() => removeAllergy(index)}
                                    className="hover:text-red-400 transition-colors"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

function Step4Workout({ data, updateData }: { data: OnboardingData; updateData: (data: Partial<OnboardingData>) => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-card p-8 md:p-12 rounded-3xl"
        >
            <div className="mb-8">
                <h1 className="text-4xl md:text-5xl font-black font-outfit italic mb-4">
                    Workout Preferences
                </h1>
                <p className="text-zinc-400">
                    Let's design a workout routine that fits your schedule and equipment.
                </p>
            </div>

            <div className="space-y-8">
                {/* Workout Days */}
                <div>
                    <label className="block text-sm font-black uppercase tracking-wider text-zinc-500 mb-3">
                        How many days can you workout per week?
                    </label>
                    <div className="grid grid-cols-7 gap-2">
                        {[1, 2, 3, 4, 5, 6, 7].map((days) => (
                            <button
                                key={days}
                                onClick={() => updateData({ workout_days_per_week: days })}
                                className={`py-3 rounded-xl font-bold transition-all ${data.workout_days_per_week === days
                                        ? 'bg-purple-600 border-purple-500'
                                        : 'bg-zinc-900 border-white/10 hover:border-purple-500/50'
                                    } border`}
                            >
                                {days}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Preferred Time */}
                <div>
                    <label className="block text-sm font-black uppercase tracking-wider text-zinc-500 mb-3">
                        Preferred Workout Time
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {['morning', 'afternoon', 'evening', 'flexible'].map((time) => (
                            <button
                                key={time}
                                onClick={() => updateData({ preferred_workout_time: time })}
                                className={`py-3 px-4 rounded-xl font-bold capitalize transition-all ${data.preferred_workout_time === time
                                        ? 'bg-cyan-600 border-cyan-500'
                                        : 'bg-zinc-900 border-white/10 hover:border-cyan-500/50'
                                    } border`}
                            >
                                {time}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Equipment */}
                <div>
                    <label className="block text-sm font-black uppercase tracking-wider text-zinc-500 mb-3">
                        Available Equipment
                    </label>
                    <div className="grid md:grid-cols-2 gap-4">
                        {equipmentOptions.map((equip) => {
                            const Icon = equip.icon
                            return (
                                <button
                                    key={equip.id}
                                    onClick={() => updateData({ available_equipment: equip.id })}
                                    className={`p-4 rounded-xl border transition-all text-left ${data.available_equipment === equip.id
                                            ? 'bg-indigo-600/20 border-indigo-500'
                                            : 'bg-zinc-900/50 border-white/10 hover:border-white/20'
                                        }`}
                                >
                                    <Icon size={24} className="text-indigo-400 mb-2" strokeWidth={2} />
                                    <h4 className="font-bold mb-1">{equip.label}</h4>
                                    <p className="text-xs text-zinc-500">{equip.description}</p>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Workout Duration */}
                <div>
                    <label className="block text-sm font-black uppercase tracking-wider text-zinc-500 mb-3">
                        Preferred Workout Duration (minutes)
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                        {[30, 45, 60, 90].map((duration) => (
                            <button
                                key={duration}
                                onClick={() => updateData({ workout_duration_preference: duration })}
                                className={`py-3 rounded-xl font-bold transition-all ${data.workout_duration_preference === duration
                                        ? 'bg-purple-600 border-purple-500'
                                        : 'bg-zinc-900 border-white/10 hover:border-purple-500/50'
                                    } border`}
                            >
                                {duration}m
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

function Step5Lifestyle({ data, updateData }: { data: OnboardingData; updateData: (data: Partial<OnboardingData>) => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-card p-8 md:p-12 rounded-3xl"
        >
            <div className="mb-8">
                <h1 className="text-4xl md:text-5xl font-black font-outfit italic mb-4">
                    Lifestyle & Schedule
                </h1>
                <p className="text-zinc-400">
                    Help us understand your daily routine to create the perfect schedule.
                </p>
            </div>

            <div className="space-y-6">
                {/* Activity Level */}
                <div>
                    <label className="block text-sm font-black uppercase tracking-wider text-zinc-500 mb-3">
                        Current Activity Level
                    </label>
                    <div className="space-y-2">
                        {activityLevels.map((level) => (
                            <button
                                key={level.id}
                                onClick={() => updateData({ activity_level: level.id })}
                                className={`w-full p-4 rounded-xl border transition-all text-left ${data.activity_level === level.id
                                        ? 'bg-purple-600/20 border-purple-500'
                                        : 'bg-zinc-900/50 border-white/10 hover:border-white/20'
                                    }`}
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-bold">{level.label}</h4>
                                        <p className="text-xs text-zinc-500">{level.description}</p>
                                    </div>
                                    <span className="text-xs text-zinc-600">×{level.multiplier}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Wake/Sleep Time */}
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-black uppercase tracking-wider text-zinc-500 mb-2">
                            Wake Up Time
                        </label>
                        <input
                            type="time"
                            value={data.wake_up_time || ''}
                            onChange={(e) => updateData({ wake_up_time: e.target.value })}
                            className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-black uppercase tracking-wider text-zinc-500 mb-2">
                            Sleep Time
                        </label>
                        <input
                            type="time"
                            value={data.sleep_time || ''}
                            onChange={(e) => updateData({ sleep_time: e.target.value })}
                            className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                        />
                    </div>
                </div>

                {/* Water Goal */}
                <div>
                    <label className="block text-sm font-black uppercase tracking-wider text-zinc-500 mb-3">
                        Daily Water Goal (ml)
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                        {[2000, 2500, 3000, 3500].map((amount) => (
                            <button
                                key={amount}
                                onClick={() => updateData({ daily_water_goal_ml: amount })}
                                className={`py-3 rounded-xl font-bold transition-all ${data.daily_water_goal_ml === amount
                                        ? 'bg-cyan-600 border-cyan-500'
                                        : 'bg-zinc-900 border-white/10 hover:border-cyan-500/50'
                                    } border`}
                            >
                                {amount / 1000}L
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
