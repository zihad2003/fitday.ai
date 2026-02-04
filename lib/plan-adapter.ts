/**
 * Plan Adapter
 * Automatically adjusts workout and meal plans based on progress and user behavior
 */

import type { ProgressMetrics, PlateauDetection } from './progress-analyzer'

interface UserProfile {
    fitness_goal: string
    target_calories: number
    tdee: number
    workout_days_per_week: number
    activity_level: string
}

interface PlanAdjustment {
    type: 'calorie' | 'workout' | 'rest' | 'macro' | 'deload'
    reason: string
    old_value: number | string
    new_value: number | string
    description: string
    priority: number
}

interface AdaptedPlan {
    adjustments: PlanAdjustment[]
    new_target_calories: number
    new_macro_distribution: {
        protein: number
        carbs: number
        fats: number
    }
    workout_modifications: string[]
    rest_recommendations: string[]
    summary: string
}

export class PlanAdapter {
    private profile: UserProfile
    private metrics: ProgressMetrics
    private plateau: PlateauDetection

    constructor(profile: UserProfile, metrics: ProgressMetrics, plateau: PlateauDetection) {
        this.profile = profile
        this.metrics = metrics
        this.plateau = plateau
    }

    /**
     * Generate plan adaptations
     */
    adaptPlan(): AdaptedPlan {
        const adjustments: PlanAdjustment[] = []
        let new_target_calories = this.profile.target_calories
        const workout_modifications: string[] = []
        const rest_recommendations: string[] = []

        // 1. Calorie adjustments based on progress
        const calorieAdjustment = this.calculateCalorieAdjustment()
        if (calorieAdjustment !== 0) {
            adjustments.push({
                type: 'calorie',
                reason: this.getCalorieAdjustmentReason(),
                old_value: this.profile.target_calories,
                new_value: this.profile.target_calories + calorieAdjustment,
                description: `${calorieAdjustment > 0 ? 'Increase' : 'Decrease'} daily calories by ${Math.abs(calorieAdjustment)}`,
                priority: 5,
            })
            new_target_calories += calorieAdjustment
        }

        // 2. Workout adjustments based on adherence
        if (this.metrics.workout_adherence_percentage < 60) {
            adjustments.push({
                type: 'workout',
                reason: 'Low workout adherence',
                old_value: this.profile.workout_days_per_week,
                new_value: Math.max(this.profile.workout_days_per_week - 1, 3),
                description: 'Reduce workout frequency to improve sustainability',
                priority: 4,
            })
            workout_modifications.push('Reduce to ' + Math.max(this.profile.workout_days_per_week - 1, 3) + ' days per week')
            workout_modifications.push('Focus on quality over quantity')
        }

        // 3. Plateau-specific adjustments
        if (this.plateau.is_plateau) {
            if (this.profile.fitness_goal === 'lose_weight') {
                adjustments.push({
                    type: 'calorie',
                    reason: 'Weight loss plateau detected',
                    old_value: this.profile.target_calories,
                    new_value: this.profile.target_calories - 150,
                    description: 'Reduce calories to break through plateau',
                    priority: 5,
                })
                new_target_calories -= 150

                workout_modifications.push('Add 2 HIIT cardio sessions per week')
                workout_modifications.push('Increase daily step goal by 2000')
            } else if (this.profile.fitness_goal === 'build_muscle') {
                adjustments.push({
                    type: 'calorie',
                    reason: 'Muscle gain plateau detected',
                    old_value: this.profile.target_calories,
                    new_value: this.profile.target_calories + 200,
                    description: 'Increase calories to support muscle growth',
                    priority: 5,
                })
                new_target_calories += 200

                workout_modifications.push('Increase training volume by 10-15%')
                workout_modifications.push('Focus on progressive overload')
            }

            if (this.plateau.severity === 'severe') {
                adjustments.push({
                    type: 'deload',
                    reason: 'Severe plateau - recovery needed',
                    old_value: 'Regular training',
                    new_value: 'Deload week',
                    description: 'Take a deload week to recover and reset',
                    priority: 5,
                })
                rest_recommendations.push('Reduce training volume by 50% for one week')
                rest_recommendations.push('Focus on mobility and recovery')
            }
        }

        // 4. Bio-Recover & Lifestyle adjustments
        if (this.metrics.average_sleep_hours < 6.5) {
            adjustments.push({
                type: 'rest',
                reason: 'Insufficient sleep affecting recovery',
                old_value: this.metrics.average_sleep_hours.toFixed(1) + ' hours',
                new_value: '7-8 hours',
                description: 'Prioritize sleep for better recovery',
                priority: 4,
            })
            rest_recommendations.push('Aim for 7-8 hours of sleep')
        }

        if (this.metrics.average_energy < 3 || this.metrics.average_mood < 3) {
            adjustments.push({
                type: 'rest',
                reason: 'Low energy and mood levels',
                old_value: 'Current schedule',
                new_value: 'Reduced intensity',
                description: 'Reduce training intensity to prevent burnout',
                priority: 4,
            })
            rest_recommendations.push('Take an extra rest day this week')
            rest_recommendations.push('Reduce workout intensity by 20%')
        }

        // 5. INTEL: Intensity & Difficulty adaptations
        if (this.metrics.average_intensity < 2 && this.metrics.workout_adherence_percentage > 90) {
            adjustments.push({
                type: 'workout',
                reason: 'Workouts consistently too easy',
                old_value: 'Current difficulty',
                new_value: 'Increased difficulty',
                description: 'Increase training intensity or add 5-10% to weight lifted',
                priority: 3,
            })
            workout_modifications.push('Increase weight or reps for compound movements')
        }

        // INTEL: Recovery-based protein recommendation
        if (this.metrics.average_recovery < 2.5) {
            adjustments.push({
                type: 'macro',
                reason: 'Slow recovery detected',
                old_value: 'Standard protein',
                new_value: 'High protein (+15%)',
                description: 'Increase protein intake to support muscle recovery',
                priority: 4,
            })
            rest_recommendations.push('Consider 20g extra protein on training days')
        }

        // INTEL: Schedule Optimization
        if (this.metrics.best_workout_time && this.metrics.best_workout_time !== "18:00") {
            adjustments.push({
                type: 'workout',
                reason: 'Workout timing optimization',
                old_value: '18:00',
                new_value: this.metrics.best_workout_time,
                description: `You seem most consistent when training around ${this.metrics.best_workout_time}`,
                priority: 3,
            })
        }

        // INTEL: Pain / Discomfort Adaptations
        if (this.metrics.recent_pain_points.length > 0) {
            this.metrics.recent_pain_points.forEach(point => {
                let mod = ''
                if (point === 'Knees') mod = 'Swap running for cycling; use box squats'
                if (point === 'Lower Back') mod = 'Avoid deadlifts; focus on core stability'
                if (point === 'Shoulders') mod = 'Reduce overhead pressing; switch to neutral grip'

                if (mod) {
                    adjustments.push({
                        type: 'workout',
                        reason: `Recurring ${point} discomfort`,
                        old_value: 'Standard exercises',
                        new_value: 'Modified biomechanics',
                        description: mod,
                        priority: 5,
                    })
                    workout_modifications.push(mod)
                }
            })
        }

        // INTEL: Environment / Equipment adaptations
        const lastCheckin = this.metrics.days_tracked > 0 ? true : false // placeholder
        // If we detect user is mostly training at home with limited gear
        if (lastCheckin) {
            adjustments.push({
                type: 'workout',
                reason: 'Home-based training optimization',
                old_value: 'Gym equipment',
                new_value: 'Bodyweight/Bands',
                description: 'Incorporate tempo work and pauses to increase intensity without weights',
                priority: 3,
            })
        }

        // INTEL: Recipe refresh for dietary boredom
        if (this.metrics.days_tracked > 14 && this.profile.fitness_goal === 'lose_weight') {
            adjustments.push({
                type: 'macro',
                reason: 'Dietary monotony detection',
                old_value: 'Current meal rotation',
                new_value: 'Recipe refresh',
                description: 'Try 3 new high-protein Mediterranean recipes this week to prevent boredom',
                priority: 3,
            })
        }

        // Generate Final Macros
        const new_macros = this.calculateMacroDistribution(new_target_calories)

        return {
            adjustments: adjustments.sort((a, b) => b.priority - a.priority),
            new_target_calories,
            new_macro_distribution: new_macros,
            workout_modifications,
            rest_recommendations,
            summary: this.generateSummary(adjustments),
        }
    }

    private calculateCalorieAdjustment(): number {
        const weeklyChange = this.metrics.weekly_average_change
        const goal = this.profile.fitness_goal

        if (goal === 'lose_weight') {
            if (Math.abs(weeklyChange) < 0.3) return -200
            if (Math.abs(weeklyChange) > 1.2) return +150
        }
        if (goal === 'build_muscle') {
            if (weeklyChange < 0.2) return +200
            if (weeklyChange > 0.6) return -150
        }
        if (goal === 'maintain_fitness') {
            if (Math.abs(weeklyChange) > 0.3) return weeklyChange > 0 ? -100 : +100
        }
        return 0
    }

    private getCalorieAdjustmentReason(): string {
        const weeklyChange = this.metrics.weekly_average_change
        const goal = this.profile.fitness_goal
        if (goal === 'lose_weight') {
            return Math.abs(weeklyChange) < 0.3 ? 'Increase deficit for faster progress' : 'Reduce deficit for sustainability'
        }
        return 'Optimizing calorie intake based on progress'
    }

    private calculateMacroDistribution(calories: number): { protein: number; carbs: number; fats: number } {
        const goal = this.profile.fitness_goal
        let p = 0.3, c = 0.4, f = 0.3

        if (goal === 'build_muscle') { p = 0.30; c = 0.45; f = 0.25 }
        if (goal === 'lose_weight') { p = 0.35; c = 0.35; f = 0.30 }

        // Boost protein if recovery is slow
        if (this.metrics.average_recovery < 2.5) p += 0.05

        return {
            protein: Math.round((calories * p) / 4),
            carbs: Math.round((calories * c) / 4),
            fats: Math.round((calories * f) / 9),
        }
    }

    private generateSummary(adjustments: PlanAdjustment[]): string {
        if (adjustments.length === 0) return 'Your plan is working well. No adjustments needed.'
        const types = Array.from(new Set(adjustments.map(a => a.type)))
        return `We've optimized your ${types.join(', ')} strategies based on your recent biological data.`
    }
}

export function adaptUserPlan(
    profile: UserProfile,
    metrics: ProgressMetrics,
    plateau: PlateauDetection
): AdaptedPlan {
    const adapter = new PlanAdapter(profile, metrics, plateau)
    return adapter.adaptPlan()
}
