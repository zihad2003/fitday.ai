'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Icons from '@/components/icons/Icons'
import { notificationService } from '@/lib/notification-service'

interface NotificationSettingsProps {
    userId: number
}

export default function NotificationSettings({ userId }: NotificationSettingsProps) {
    const [permission, setPermission] = useState<NotificationPermission>('default')
    const [settings, setSettings] = useState({
        enable_workout_reminders: true,
        enable_meal_reminders: true,
        enable_water_reminders: true,
        enable_sleep_reminders: true,
        enable_motivational_messages: true,
    })
    const [loading, setLoading] = useState(false)
    const [saved, setSaved] = useState(false)

    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setPermission(Notification.permission)
        }
        loadSettings()
    }, [])

    const loadSettings = async () => {
        try {
            const response = await fetch('/api/user/preferences')
            if (response.ok) {
                const data = await response.json()
                setSettings({
                    enable_workout_reminders: data.enable_workout_reminders ?? true,
                    enable_meal_reminders: data.enable_meal_reminders ?? true,
                    enable_water_reminders: data.enable_water_reminders ?? true,
                    enable_sleep_reminders: data.enable_sleep_reminders ?? true,
                    enable_motivational_messages: data.enable_motivational_messages ?? true,
                })
            }
        } catch (error) {
            console.error('Failed to load settings:', error)
        }
    }

    const requestPermission = async () => {
        const granted = await notificationService.requestPermission()
        if (granted) {
            setPermission('granted')
        }
    }

    const handleToggle = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }))
        setSaved(false)
    }

    const saveSettings = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/user/preferences', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            })

            if (response.ok) {
                setSaved(true)
                setTimeout(() => setSaved(false), 3000)

                // Reinitialize notifications with new settings
                const profileResponse = await fetch('/api/user/profile')
                if (profileResponse.ok) {
                    const profile = await profileResponse.json()
                    const service = notificationService
                    const schedule = service.generateSchedule(settings, profile)
                    await service.scheduleNotifications(schedule)
                }
            }
        } catch (error) {
            console.error('Failed to save settings:', error)
        } finally {
            setLoading(false)
        }
    }

    const testNotification = async () => {
        await notificationService.showNotification('🎉 Test Notification', {
            body: 'Notifications are working! You\'re all set.',
            tag: 'test',
        })
    }

    return (
        <div className="glass-card p-6 md:p-8 rounded-3xl">
            <div className="flex items-center gap-3 mb-6">
                <Icons.Activity size={24} className="text-purple-400" strokeWidth={2} />
                <h2 className="text-2xl font-black font-outfit italic">Notification Settings</h2>
            </div>

            {/* Permission Status */}
            {permission !== 'granted' && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-yellow-600/20 border border-yellow-500/50 rounded-2xl p-4 mb-6"
                >
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">⚠️</span>
                        <div className="flex-1">
                            <h3 className="font-bold text-yellow-400 mb-1">Notifications Disabled</h3>
                            <p className="text-sm text-zinc-400 mb-3">
                                Enable notifications to receive reminders for workouts, meals, and hydration.
                            </p>
                            <button
                                onClick={requestPermission}
                                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-xl font-bold text-sm transition-colors"
                            >
                                Enable Notifications
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Settings List */}
            <div className="space-y-4 mb-6">
                {/* Workout Reminders */}
                <SettingToggle
                    icon={<Icons.Strength size={20} className="text-purple-400" strokeWidth={2} />}
                    label="Workout Reminders"
                    description="Get notified before your scheduled workouts"
                    enabled={settings.enable_workout_reminders}
                    onToggle={() => handleToggle('enable_workout_reminders')}
                />

                {/* Meal Reminders */}
                <SettingToggle
                    icon={<Icons.Food size={20} className="text-orange-400" strokeWidth={2} />}
                    label="Meal Reminders"
                    description="Reminders for breakfast, lunch, snacks, and dinner"
                    enabled={settings.enable_meal_reminders}
                    onToggle={() => handleToggle('enable_meal_reminders')}
                />

                {/* Water Reminders */}
                <SettingToggle
                    icon={<Icons.Water size={20} className="text-cyan-400" strokeWidth={2} />}
                    label="Water Reminders"
                    description="Stay hydrated with regular water reminders"
                    enabled={settings.enable_water_reminders}
                    onToggle={() => handleToggle('enable_water_reminders')}
                />

                {/* Sleep Reminders */}
                <SettingToggle
                    icon={<Icons.Heart size={20} className="text-pink-400" strokeWidth={2} />}
                    label="Sleep Reminders"
                    description="Get reminded when it's time to wind down"
                    enabled={settings.enable_sleep_reminders}
                    onToggle={() => handleToggle('enable_sleep_reminders')}
                />

                {/* Motivational Messages */}
                <SettingToggle
                    icon={<Icons.Sparkles size={20} className="text-yellow-400" strokeWidth={2} />}
                    label="Motivational Messages"
                    description="Daily motivation to keep you going"
                    enabled={settings.enable_motivational_messages}
                    onToggle={() => handleToggle('enable_motivational_messages')}
                />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
                <button
                    onClick={saveSettings}
                    disabled={loading || saved}
                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saved ? '✓ Saved!' : loading ? 'Saving...' : 'Save Settings'}
                </button>

                {permission === 'granted' && (
                    <button
                        onClick={testNotification}
                        className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-bold transition-colors"
                    >
                        Test
                    </button>
                )}
            </div>

            {/* Info */}
            <p className="text-xs text-zinc-600 mt-4 text-center">
                Notifications help you stay on track with your fitness goals. You can customize times in your profile settings.
            </p>
        </div>
    )
}

function SettingToggle({
    icon,
    label,
    description,
    enabled,
    onToggle,
}: {
    icon: React.ReactNode
    label: string
    description: string
    enabled: boolean
    onToggle: () => void
}) {
    return (
        <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-xl hover:bg-zinc-900 transition-colors">
            <div className="flex items-start gap-3 flex-1">
                <div className="mt-1">{icon}</div>
                <div>
                    <h3 className="font-bold text-sm mb-1">{label}</h3>
                    <p className="text-xs text-zinc-500">{description}</p>
                </div>
            </div>

            <button
                onClick={onToggle}
                className={`relative w-12 h-6 rounded-full transition-colors ${enabled ? 'bg-purple-600' : 'bg-zinc-700'
                    }`}
            >
                <motion.div
                    animate={{ x: enabled ? 24 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-lg"
                />
            </button>
        </div>
    )
}
