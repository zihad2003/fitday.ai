/**
 * Plan Adapter
 * Automatically adjusts workout and meal plans based on progress
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

        // Calorie adjustments based on progress
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

        // Workout adjustments based on adherence
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

        // Plateau-specific adjustments
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

        // Sleep-based adjustments
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
            rest_recommendations.push('Consider reducing training volume temporarily')
        }

        // Energy/mood-based adjustments
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

        // Macro adjustments
        const new_macros = this.calculateMacroDistribution(new_target_calories)

        // Generate summary
        const summary = this.generateSummary(adjustments)

        return {
            adjustments: adjustments.sort((a, b) => b.priority - a.priority),
            new_target_calories,
            new_macro_distribution: new_macros,
            workout_modifications,
            rest_recommendations,
            summary,
        }
    }

    /**
     * Calculate calorie adjustment
     */
    private calculateCalorieAdjustment(): number {
        const weeklyChange = this.metrics.weekly_average_change
        const goal = this.profile.fitness_goal

        // Weight loss goal
        if (goal === 'lose_weight') {
            // Target: 0.5-1kg per week
            if (Math.abs(weeklyChange) < 0.3) {
                // Too slow - increase deficit
                return -200
            } else if (Math.abs(weeklyChange) > 1.2) {
                // Too fast - reduce deficit
                return +150
            }
        }

        // Muscle gain goal
        if (goal === 'build_muscle') {
            // Target: 0.25-0.5kg per week
            if (weeklyChange < 0.2) {
                // Too slow - increase surplus
                return +200
            } else if (weeklyChange > 0.6) {
                // Too fast - reduce surplus
                return -150
            }
        }

        // Maintenance
        if (goal === 'maintain_fitness') {
            if (Math.abs(weeklyChange) > 0.3) {
                // Adjust to maintain weight
                return weeklyChange > 0 ? -100 : +100
            }
        }

        return 0
    }

    /**
     * Get reason for calorie adjustment
     */
    private getCalorieAdjustmentReason(): string {
        const weeklyChange = this.metrics.weekly_average_change
        const goal = this.profile.fitness_goal

        if (goal === 'lose_weight') {
            if (Math.abs(weeklyChange) < 0.3) {
                return 'Weight loss too slow - increasing deficit'
            } else if (Math.abs(weeklyChange) > 1.2) {
                return 'Weight loss too fast - reducing deficit for sustainability'
            }
        }

        if (goal === 'build_muscle') {
            if (weeklyChange < 0.2) {
                return 'Muscle gain too slow - increasing surplus'
            } else if (weeklyChange > 0.6) {
                return 'Weight gain too fast - reducing surplus to minimize fat gain'
            }
        }

        if (goal === 'maintain_fitness') {
            return 'Adjusting to maintain current weight'
        }

        return 'Optimizing calorie intake based on progress'
    }

    /**
     * Calculate macro distribution
     */
    private calculateMacroDistribution(calories: number): { protein: number; carbs: number; fats: number } {
        const goal = this.profile.fitness_goal
        let proteinPercent, carbsPercent, fatsPercent

        switch (goal) {
            case 'build_muscle':
                proteinPercent = 0.30
                carbsPercent = 0.45
                fatsPercent = 0.25
                break
            case 'lose_weight':
                proteinPercent = 0.35
                carbsPercent = 0.35
                fatsPercent = 0.30
                break
            case 'increase_strength':
                proteinPercent = 0.30
                carbsPercent = 0.50
                fatsPercent = 0.20
                break
            default:
                proteinPercent = 0.25
                carbsPercent = 0.45
                fatsPercent = 0.30
        }

        return {
            protein: Math.round((calories * proteinPercent) / 4),
            carbs: Math.round((calories * carbsPercent) / 4),
            fats: Math.round((calories * fatsPercent) / 9),
        }
    }

    /**
     * Generate summary
     */
    private generateSummary(adjustments: PlanAdjustment[]): string {
        if (adjustments.length === 0) {
            return 'Your plan is working well! Keep up the great work. No adjustments needed at this time.'
        }

        const parts: string[] = []

        const calorieAdj = adjustments.find(a => a.type === 'calorie')
        if (calorieAdj) {
            const change = Number(calorieAdj.new_value) - Number(calorieAdj.old_value)
            parts.push(`Adjust calories by ${change > 0 ? '+' : ''}${change}`)
        }

        const workoutAdj = adjustments.find(a => a.type === 'workout')
        if (workoutAdj) {
            parts.push(`Modify workout frequency`)
        }

        const deloadAdj = adjustments.find(a => a.type === 'deload')
        if (deloadAdj) {
            parts.push(`Take a deload week`)
        }

        const restAdj = adjustments.find(a => a.type === 'rest')
        if (restAdj) {
            parts.push(`Prioritize recovery`)
        }

        return `Based on your progress, we recommend: ${parts.join(', ')}. These adjustments will help you stay on track toward your goals.`
    }
}

/**
 * Adapt user's plan based on progress
 */
export function adaptUserPlan(
    profile: UserProfile,
    metrics: ProgressMetrics,
    plateau: PlateauDetection
): AdaptedPlan {
    const adapter = new PlanAdapter(profile, metrics, plateau)
    return adapter.adaptPlan()
}
