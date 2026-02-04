'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    User, Target, Zap, Droplet, Moon, Activity,
    Settings, Shield, ChevronRight, Clock, Dumbbell,
    Utensils, Hash, Save, X, Info, Scale
} from 'lucide-react'
import { showToast } from '@/components/animations/Toast'

interface ProfileManagerProps {
    user: any
    onUpdate: (updatedData: any) => Promise<void>
}

export default function ProfileManager({ user, onUpdate }: ProfileManagerProps) {
    const [activeTab, setActiveTab] = useState('biological')
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState<any>(user)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        setFormData(user)
    }, [user])

    const tabs = [
        { id: 'biological', label: 'Biological', icon: User },
        { id: 'goals', label: 'Goals', icon: Target },
        { id: 'regimen', label: 'Regimen', icon: Activity },
        { id: 'lifestyle', label: 'Lifestyle', icon: Moon },
        { id: 'settings', label: 'Settings', icon: Settings },
    ]

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await onUpdate(formData)
            setIsEditing(false)
            showToast('Neural Profile Synchronized', 'success')
        } catch (err) {
            showToast('Sync Failed', 'error')
        } finally {
            setIsSaving(false)
        }
    }

    const renderField = (label: string, field: string, type: string = 'text', options?: string[]) => {
        const value = formData[field]

        if (!isEditing) {
            return (
                <div className="group py-4 border-b border-white/5 flex justify-between items-center transition-colors hover:bg-white/[0.01] px-4 rounded-xl">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{label}</span>
                    <span className="text-xs font-black font-outfit uppercase italic text-white group-hover:text-purple-400 transition-colors">
                        {field === 'fitness_goal' || field === 'activity_level' || field === 'dietary_preference' || field === 'available_equipment'
                            ? value?.replace(/_/g, ' ') : value}
                    </span>
                </div>
            )
        }

        return (
            <div className="space-y-2 px-4 py-2">
                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 block pl-1">{label}</label>
                {options ? (
                    <select
                        value={value}
                        onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                        className="w-full h-12 bg-zinc-900 border border-white/10 rounded-xl px-4 text-xs font-black uppercase italic text-white outline-none focus:border-purple-500 transition-all appearance-none cursor-pointer"
                    >
                        {options.map(opt => (
                            <option key={opt} value={opt} className="bg-zinc-950">{opt.replace(/_/g, ' ')}</option>
                        ))}
                    </select>
                ) : (
                    <input
                        type={type}
                        value={value || ''}
                        onChange={(e) => setFormData({ ...formData, [field]: type === 'number' ? Number(e.target.value) : e.target.value })}
                        className="w-full h-12 bg-zinc-900 border border-white/10 rounded-xl px-4 text-xs font-black text-white outline-none focus:border-purple-500 transition-all"
                    />
                )}
            </div>
        )
    }

    return (
        <div className="relative">
            {/* Header Controls */}
            <div className="flex justify-between items-end mb-10">
                <div className="space-y-2">
                    <h2 className="text-3xl font-black font-outfit italic tracking-tight uppercase text-white">
                        Metabolic <span className="text-purple-500">Identity</span>
                    </h2>
                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.4em]">Biometric data management interface</p>
                </div>

                <div className="flex gap-4">
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="h-12 px-8 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-3 group"
                        >
                            <Settings size={14} className="text-purple-500 group-hover:rotate-90 transition-transform duration-500" />
                            Configuration
                        </button>
                    ) : (
                        <div className="flex gap-3">
                            <button
                                onClick={() => { setIsEditing(false); setFormData(user); }}
                                className="h-12 px-6 text-zinc-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors"
                            >
                                Discard
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="h-12 px-10 bg-purple-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-[0_10px_30px_rgba(147,51,234,0.3)] hover:bg-purple-500 transition-all disabled:opacity-50 flex items-center gap-3"
                            >
                                <Save size={14} />
                                {isSaving ? 'SYNCING...' : 'Update Neural Link'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 p-1 bg-zinc-950 border border-white/5 rounded-2xl mb-12 overflow-x-auto no-scrollbar">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 min-w-[120px] h-12 flex items-center justify-center gap-3 rounded-xl transition-all ${activeTab === tab.id
                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20'
                                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                            }`}
                    >
                        <tab.icon size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-zinc-950/50 border border-white/5 rounded-[2.5rem] p-8 md:p-10"
                        >
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center text-purple-500">
                                    {tabs.find(t => t.id === activeTab)?.icon({ size: 20 })}
                                </div>
                                <h3 className="text-xl font-black font-outfit italic uppercase text-white">
                                    {tabs.find(t => t.id === activeTab)?.label} <span className="text-zinc-700">Parameters</span>
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                                {activeTab === 'biological' && (
                                    <>
                                        {renderField('Full Legal Name', 'name')}
                                        {renderField('Biological Age', 'age', 'number')}
                                        {renderField('Neural Gender', 'gender', 'text', ['male', 'female'])}
                                        {renderField('Height (CM)', 'height_cm', 'number')}
                                        {renderField('Current Mass (KG)', 'weight_kg', 'number')}
                                        {renderField('Target Mass (KG)', 'target_weight_kg', 'number')}
                                    </>
                                )}
                                {activeTab === 'goals' && (
                                    <>
                                        {renderField('Primary Objective', 'fitness_goal', 'text', [
                                            'build_muscle', 'lose_weight', 'maintain_fitness',
                                            'improve_endurance', 'increase_strength', 'improve_flexibility', 'general_health'
                                        ])}
                                        {renderField('Activity Intensity', 'activity_level', 'text', [
                                            'sedentary', 'light', 'moderate', 'active', 'very_active'
                                        ])}
                                        <div className="md:col-span-2 mt-6 p-6 bg-purple-600/5 rounded-3xl border border-purple-500/10 flex items-center gap-6">
                                            <div className="w-12 h-12 bg-purple-600/20 rounded-2xl flex items-center justify-center text-purple-500">
                                                <Target size={24} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-purple-400">Current Strategy</p>
                                                <p className="text-xs text-zinc-500 mt-1 uppercase italic font-bold">
                                                    Neural engine is optimizing for {formData.fitness_goal?.replace(/_/g, ' ')} with a focus on {formData.activity_level} metabolic output.
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                )}
                                {activeTab === 'regimen' && (
                                    <>
                                        {renderField('Dietary Protocol', 'dietary_preference', 'text', [
                                            'none', 'vegetarian', 'vegan', 'pescatarian', 'keto', 'paleo', 'halal', 'kosher', 'gluten_free', 'dairy_free'
                                        ])}
                                        {renderField('Training Frequency', 'workout_days_per_week', 'number')}
                                        {renderField('Equipment Access', 'available_equipment', 'text', [
                                            'home', 'gym', 'bodyweight_only', 'minimal'
                                        ])}
                                        {renderField('Stage Duration (Min)', 'workout_duration_preference', 'number')}
                                    </>
                                )}
                                {activeTab === 'lifestyle' && (
                                    <>
                                        {renderField('Wake Sequence', 'wake_up_time', 'time')}
                                        {renderField('Sleep Sequence', 'sleep_time', 'time')}
                                        {renderField('Target Recovery (Hrs)', 'target_sleep_hours', 'number')}
                                        {renderField('Daily Hydration (ML)', 'daily_water_goal_ml', 'number')}
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Sidebar Stats */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="stat-card p-8 bg-gradient-to-br from-zinc-950 to-zinc-900 border border-white/5 rounded-[2.5rem] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Scale size={100} />
                        </div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-6">Mass Trajectory</h4>
                        <div className="flex items-end gap-3 mb-2">
                            <span className="text-4xl font-black font-outfit italic text-white">{user.weight_kg}</span>
                            <span className="text-xs font-black text-zinc-700 uppercase mb-1.5">Current / KG</span>
                        </div>
                        <div className="flex items-center gap-2 mb-8">
                            <span className="text-xs font-bold text-purple-500 uppercase tracking-tight">Target: {user.target_weight_kg}kg</span>
                            <div className="flex-1 h-px bg-zinc-800" />
                        </div>
                        <button className="w-full h-12 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                            View Historical Drift <ChevronRight size={14} />
                        </button>
                    </div>

                    <div className="stat-card p-8 bg-zinc-950 border border-white/5 rounded-[2.5rem] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Shield size={100} />
                        </div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-6">Security Clearance</h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-white/5">
                                <span className="text-[10px] text-zinc-500 font-bold uppercase">Biometric Encryption</span>
                                <span className="text-[10px] text-emerald-500 font-black uppercase">Active</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-white/5">
                                <span className="text-[10px] text-zinc-500 font-bold uppercase">Access Hierarchy</span>
                                <span className="text-[10px] text-purple-500 font-black uppercase">Level 4</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
