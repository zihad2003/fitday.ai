/**
 * Progress Analyzer
 * Analyzes user progress and provides insights for plan adaptations
 */

interface DailyData {
    date: string
    weight_kg: number
    calories_consumed: number
    workouts_completed: number
    water_ml: number
    sleep_hours: number
    mood_rating: number
    energy_level: number
}

interface ProgressMetrics {
    // Weight Progress
    weight_change_kg: number
    weight_change_percentage: number
    weekly_average_change: number
    trend: 'gaining' | 'losing' | 'maintaining'

    // Workout Adherence
    workout_adherence_percentage: number
    workouts_completed: number
    workouts_planned: number
    current_streak: number
    longest_streak: number

    // Nutrition Compliance
    calorie_adherence_percentage: number
    average_daily_calories: number
    days_on_target: number

    // Lifestyle Metrics
    average_sleep_hours: number
    average_water_ml: number
    average_mood: number
    average_energy: number

    // Overall Score
    overall_score: number // 0-100
    consistency_score: number // 0-100
}

interface ProgressInsight {
    type: 'success' | 'warning' | 'info' | 'action'
    category: 'weight' | 'workout' | 'nutrition' | 'lifestyle' | 'general'
    title: string
    message: string
    recommendation?: string
    priority: number // 1-5, 5 being highest
}

interface PlateauDetection {
    is_plateau: boolean
    plateau_duration_days: number
    suggested_actions: string[]
    severity: 'none' | 'mild' | 'moderate' | 'severe'
}

interface GoalPrediction {
    estimated_days_to_goal: number
    estimated_completion_date: string
    confidence: number // 0-100
    on_track: boolean
    adjustment_needed: boolean
    recommended_adjustments: string[]
}

export class ProgressAnalyzer {
    private dailyData: DailyData[]
    private userGoal: string
    private targetWeight?: number
    private currentWeight: number
    private startWeight: number
    private workoutDaysPerWeek: number

    constructor(
        dailyData: DailyData[],
        userGoal: string,
        currentWeight: number,
        startWeight: number,
        workoutDaysPerWeek: number,
        targetWeight?: number
    ) {
        this.dailyData = dailyData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        this.userGoal = userGoal
        this.currentWeight = currentWeight
        this.startWeight = startWeight
        this.workoutDaysPerWeek = workoutDaysPerWeek
        this.targetWeight = targetWeight
    }

    /**
     * Analyze overall progress
     */
    analyzeProgress(): ProgressMetrics {
        const daysTracked = this.dailyData.length

        return {
            // Weight metrics
            weight_change_kg: this.calculateWeightChange(),
            weight_change_percentage: this.calculateWeightChangePercentage(),
            weekly_average_change: this.calculateWeeklyAverageChange(),
            trend: this.determineWeightTrend(),

            // Workout metrics
            workout_adherence_percentage: this.calculateWorkoutAdherence(),
            workouts_completed: this.getTotalWorkouts(),
            workouts_planned: this.getPlannedWorkouts(),
            current_streak: this.calculateCurrentStreak(),
            longest_streak: this.calculateLongestStreak(),

            // Nutrition metrics
            calorie_adherence_percentage: this.calculateCalorieAdherence(),
            average_daily_calories: this.calculateAverageDailyCalories(),
            days_on_target: this.getDaysOnTarget(),

            // Lifestyle metrics
            average_sleep_hours: this.calculateAverageSleep(),
            average_water_ml: this.calculateAverageWater(),
            average_mood: this.calculateAverageMood(),
            average_energy: this.calculateAverageEnergy(),

            // Overall scores
            overall_score: this.calculateOverallScore(),
            consistency_score: this.calculateConsistencyScore(),
        }
    }

    /**
     * Generate actionable insights
     */
    generateInsights(): ProgressInsight[] {
        const insights: ProgressInsight[] = []
        const metrics = this.analyzeProgress()

        // Weight insights
        if (this.userGoal === 'lose_weight') {
            if (metrics.weight_change_kg < 0) {
                insights.push({
                    type: 'success',
                    category: 'weight',
                    title: 'Great Progress!',
                    message: `You've lost ${Math.abs(metrics.weight_change_kg).toFixed(1)}kg! Keep it up!`,
                    priority: 5,
                })
            } else if (metrics.weight_change_kg > 0) {
                insights.push({
                    type: 'warning',
                    category: 'weight',
                    title: 'Weight Increasing',
                    message: `Your weight has increased by ${metrics.weight_change_kg.toFixed(1)}kg.`,
                    recommendation: 'Review your calorie intake and ensure you\'re in a deficit.',
                    priority: 4,
                })
            }
        } else if (this.userGoal === 'build_muscle') {
            if (metrics.weight_change_kg > 0 && metrics.weight_change_kg < 0.5) {
                insights.push({
                    type: 'success',
                    category: 'weight',
                    title: 'Healthy Muscle Gain',
                    message: `You've gained ${metrics.weight_change_kg.toFixed(1)}kg at a healthy rate!`,
                    priority: 5,
                })
            } else if (metrics.weight_change_kg > 1) {
                insights.push({
                    type: 'warning',
                    category: 'weight',
                    title: 'Rapid Weight Gain',
                    message: 'You\'re gaining weight quickly. Some might be fat.',
                    recommendation: 'Reduce calorie surplus slightly to minimize fat gain.',
                    priority: 4,
                })
            }
        }

        // Workout adherence insights
        if (metrics.workout_adherence_percentage >= 90) {
            insights.push({
                type: 'success',
                category: 'workout',
                title: 'Excellent Consistency!',
                message: `${metrics.workout_adherence_percentage.toFixed(0)}% workout adherence. You're crushing it!`,
                priority: 4,
            })
        } else if (metrics.workout_adherence_percentage < 50) {
            insights.push({
                type: 'warning',
                category: 'workout',
                title: 'Low Workout Adherence',
                message: `Only ${metrics.workout_adherence_percentage.toFixed(0)}% adherence. Let's get back on track!`,
                recommendation: 'Try reducing workout days or duration to make it more sustainable.',
                priority: 5,
            })
        }

        // Streak insights
        if (metrics.current_streak >= 7) {
            insights.push({
                type: 'success',
                category: 'workout',
                title: `${metrics.current_streak} Day Streak! 🔥`,
                message: 'Amazing consistency! Keep the momentum going.',
                priority: 3,
            })
        }

        // Sleep insights
        if (metrics.average_sleep_hours < 6) {
            insights.push({
                type: 'warning',
                category: 'lifestyle',
                title: 'Insufficient Sleep',
                message: `Averaging ${metrics.average_sleep_hours.toFixed(1)} hours. Recovery is crucial!`,
                recommendation: 'Aim for 7-9 hours of sleep for optimal recovery and results.',
                priority: 4,
            })
        } else if (metrics.average_sleep_hours >= 7) {
            insights.push({
                type: 'success',
                category: 'lifestyle',
                title: 'Great Sleep Habits',
                message: `Averaging ${metrics.average_sleep_hours.toFixed(1)} hours of sleep. Excellent!`,
                priority: 2,
            })
        }

        // Hydration insights
        if (metrics.average_water_ml < 1500) {
            insights.push({
                type: 'warning',
                category: 'lifestyle',
                title: 'Low Hydration',
                message: `Averaging ${metrics.average_water_ml}ml daily. Drink more water!`,
                recommendation: 'Aim for at least 2000ml (8 glasses) per day.',
                priority: 3,
            })
        }

        // Mood/Energy insights
        if (metrics.average_mood < 3 || metrics.average_energy < 3) {
            insights.push({
                type: 'info',
                category: 'lifestyle',
                title: 'Low Energy/Mood',
                message: 'Your mood and energy levels are below average.',
                recommendation: 'Consider a deload week or check if you\'re eating enough.',
                priority: 4,
            })
        }

        // Sort by priority
        return insights.sort((a, b) => b.priority - a.priority)
    }

    /**
     * Detect plateau
     */
    detectPlateau(): PlateauDetection {
        if (this.dailyData.length < 14) {
            return {
                is_plateau: false,
                plateau_duration_days: 0,
                suggested_actions: [],
                severity: 'none',
            }
        }

        // Get last 14 days of weight data
        const recentWeights = this.dailyData
            .slice(-14)
            .filter(d => d.weight_kg > 0)
            .map(d => d.weight_kg)

        if (recentWeights.length < 10) {
            return {
                is_plateau: false,
                plateau_duration_days: 0,
                suggested_actions: [],
                severity: 'none',
            }
        }

        // Calculate standard deviation
        const mean = recentWeights.reduce((a, b) => a + b, 0) / recentWeights.length
        const variance = recentWeights.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / recentWeights.length
        const stdDev = Math.sqrt(variance)

        // Plateau if standard deviation is very low (< 0.3kg)
        const is_plateau = stdDev < 0.3

        if (!is_plateau) {
            return {
                is_plateau: false,
                plateau_duration_days: 0,
                suggested_actions: [],
                severity: 'none',
            }
        }

        // Determine severity based on duration
        const plateau_duration_days = 14 // Simplified, could track actual duration
        let severity: 'none' | 'mild' | 'moderate' | 'severe' = 'mild'

        if (plateau_duration_days >= 28) severity = 'severe'
        else if (plateau_duration_days >= 21) severity = 'moderate'
        else if (plateau_duration_days >= 14) severity = 'mild'

        // Generate suggestions
        const suggested_actions: string[] = []

        if (this.userGoal === 'lose_weight') {
            suggested_actions.push('Reduce daily calories by 100-200')
            suggested_actions.push('Add 1-2 extra cardio sessions per week')
            suggested_actions.push('Increase daily steps by 2000')
            suggested_actions.push('Try intermittent fasting')
        } else if (this.userGoal === 'build_muscle') {
            suggested_actions.push('Increase daily calories by 200-300')
            suggested_actions.push('Increase protein intake by 20g')
            suggested_actions.push('Add progressive overload to workouts')
            suggested_actions.push('Ensure adequate sleep (8+ hours)')
        }

        suggested_actions.push('Take a deload week to recover')
        suggested_actions.push('Review and adjust macro distribution')

        return {
            is_plateau,
            plateau_duration_days,
            suggested_actions,
            severity,
        }
    }

    /**
     * Predict goal achievement
     */
    predictGoalAchievement(): GoalPrediction {
        if (!this.targetWeight || this.dailyData.length < 7) {
            return {
                estimated_days_to_goal: 0,
                estimated_completion_date: '',
                confidence: 0,
                on_track: false,
                adjustment_needed: false,
                recommended_adjustments: [],
            }
        }

        const weeklyChange = this.calculateWeeklyAverageChange()
        const remainingWeight = Math.abs(this.targetWeight - this.currentWeight)

        // Predict based on current rate
        const weeksToGoal = weeklyChange !== 0 ? remainingWeight / Math.abs(weeklyChange) : 999
        const daysToGoal = Math.round(weeksToGoal * 7)

        const completionDate = new Date()
        completionDate.setDate(completionDate.getDate() + daysToGoal)

        // Calculate confidence based on consistency
        const metrics = this.analyzeProgress()
        const confidence = Math.min(metrics.consistency_score, 100)

        // Determine if on track (healthy rate)
        let on_track = false
        const recommended_adjustments: string[] = []

        if (this.userGoal === 'lose_weight') {
            // Healthy weight loss: 0.5-1kg per week
            on_track = Math.abs(weeklyChange) >= 0.3 && Math.abs(weeklyChange) <= 1.2

            if (Math.abs(weeklyChange) < 0.3) {
                recommended_adjustments.push('Increase calorie deficit by 200-300 calories')
                recommended_adjustments.push('Add 2-3 cardio sessions per week')
            } else if (Math.abs(weeklyChange) > 1.2) {
                recommended_adjustments.push('Reduce calorie deficit slightly')
                recommended_adjustments.push('Ensure adequate protein intake')
            }
        } else if (this.userGoal === 'build_muscle') {
            // Healthy muscle gain: 0.25-0.5kg per week
            on_track = weeklyChange >= 0.2 && weeklyChange <= 0.6

            if (weeklyChange < 0.2) {
                recommended_adjustments.push('Increase calorie surplus by 200-300 calories')
                recommended_adjustments.push('Increase protein to 2g per kg bodyweight')
            } else if (weeklyChange > 0.6) {
                recommended_adjustments.push('Reduce calorie surplus to minimize fat gain')
            }
        }

        return {
            estimated_days_to_goal: daysToGoal,
            estimated_completion_date: completionDate.toISOString().split('T')[0],
            confidence,
            on_track,
            adjustment_needed: !on_track,
            recommended_adjustments,
        }
    }

    // Private calculation methods
    private calculateWeightChange(): number {
        return this.currentWeight - this.startWeight
    }

    private calculateWeightChangePercentage(): number {
        return ((this.currentWeight - this.startWeight) / this.startWeight) * 100
    }

    private calculateWeeklyAverageChange(): number {
        if (this.dailyData.length < 7) return 0

        const recentWeights = this.dailyData
            .slice(-14)
            .filter(d => d.weight_kg > 0)
            .map(d => d.weight_kg)

        if (recentWeights.length < 2) return 0

        const firstWeek = recentWeights.slice(0, 7).reduce((a, b) => a + b, 0) / 7
        const secondWeek = recentWeights.slice(-7).reduce((a, b) => a + b, 0) / 7

        return secondWeek - firstWeek
    }

    private determineWeightTrend(): 'gaining' | 'losing' | 'maintaining' {
        const change = this.calculateWeeklyAverageChange()
        if (change > 0.1) return 'gaining'
        if (change < -0.1) return 'losing'
        return 'maintaining'
    }

    private calculateWorkoutAdherence(): number {
        const planned = this.getPlannedWorkouts()
        const completed = this.getTotalWorkouts()
        return planned > 0 ? (completed / planned) * 100 : 0
    }

    private getTotalWorkouts(): number {
        return this.dailyData.reduce((sum, d) => sum + (d.workouts_completed || 0), 0)
    }

    private getPlannedWorkouts(): number {
        const weeks = Math.ceil(this.dailyData.length / 7)
        return weeks * this.workoutDaysPerWeek
    }

    private calculateCurrentStreak(): number {
        let streak = 0
        for (let i = this.dailyData.length - 1; i >= 0; i--) {
            if (this.dailyData[i].workouts_completed > 0) {
                streak++
            } else {
                break
            }
        }
        return streak
    }

    private calculateLongestStreak(): number {
        let longest = 0
        let current = 0

        this.dailyData.forEach(d => {
            if (d.workouts_completed > 0) {
                current++
                longest = Math.max(longest, current)
            } else {
                current = 0
            }
        })

        return longest
    }

    private calculateCalorieAdherence(): number {
        // Simplified - would need target calories
        return 85 // Placeholder
    }

    private calculateAverageDailyCalories(): number {
        const total = this.dailyData.reduce((sum, d) => sum + (d.calories_consumed || 0), 0)
        return this.dailyData.length > 0 ? total / this.dailyData.length : 0
    }

    private getDaysOnTarget(): number {
        // Simplified - would need target calories
        return Math.floor(this.dailyData.length * 0.7) // Placeholder
    }

    private calculateAverageSleep(): number {
        const total = this.dailyData.reduce((sum, d) => sum + (d.sleep_hours || 0), 0)
        const count = this.dailyData.filter(d => d.sleep_hours > 0).length
        return count > 0 ? total / count : 0
    }

    private calculateAverageWater(): number {
        const total = this.dailyData.reduce((sum, d) => sum + (d.water_ml || 0), 0)
        const count = this.dailyData.filter(d => d.water_ml > 0).length
        return count > 0 ? total / count : 0
    }

    private calculateAverageMood(): number {
        const total = this.dailyData.reduce((sum, d) => sum + (d.mood_rating || 0), 0)
        const count = this.dailyData.filter(d => d.mood_rating > 0).length
        return count > 0 ? total / count : 0
    }

    private calculateAverageEnergy(): number {
        const total = this.dailyData.reduce((sum, d) => sum + (d.energy_level || 0), 0)
        const count = this.dailyData.filter(d => d.energy_level > 0).length
        return count > 0 ? total / count : 0
    }

    private calculateOverallScore(): number {
        const metrics = this.analyzeProgress()

        // Weighted scoring
        const workoutScore = metrics.workout_adherence_percentage
        const sleepScore = Math.min((metrics.average_sleep_hours / 8) * 100, 100)
        const waterScore = Math.min((metrics.average_water_ml / 2000) * 100, 100)
        const moodScore = (metrics.average_mood / 5) * 100

        return (workoutScore * 0.4 + sleepScore * 0.2 + waterScore * 0.2 + moodScore * 0.2)
    }

    private calculateConsistencyScore(): number {
        // Based on how many days have data
        const daysWithData = this.dailyData.filter(d =>
            d.weight_kg > 0 || d.workouts_completed > 0 || d.water_ml > 0
        ).length

        const totalDays = this.dailyData.length
        return totalDays > 0 ? (daysWithData / totalDays) * 100 : 0
    }
}

/**
 * Analyze user progress
 */
export function analyzeUserProgress(
    dailyData: DailyData[],
    userGoal: string,
    currentWeight: number,
    startWeight: number,
    workoutDaysPerWeek: number,
    targetWeight?: number
): {
    metrics: ProgressMetrics
    insights: ProgressInsight[]
    plateau: PlateauDetection
    prediction: GoalPrediction
} {
    const analyzer = new ProgressAnalyzer(
        dailyData,
        userGoal,
        currentWeight,
        startWeight,
        workoutDaysPerWeek,
        targetWeight
    )

    return {
        metrics: analyzer.analyzeProgress(),
        insights: analyzer.generateInsights(),
        plateau: analyzer.detectPlateau(),
        prediction: analyzer.predictGoalAchievement(),
    }
}
