/**
 * AI Progress Predictor
 * Predicts user progress based on historical data and goals
 */

interface ProgressData {
    date: string
    weight?: number
    bodyFat?: number
    measurements?: {
        chest?: number
        waist?: number
        hips?: number
        arms?: number
        thighs?: number
    }
    workoutCompleted?: boolean
    caloriesConsumed?: number
    caloriesBurned?: number
}

interface Prediction {
    targetDate: string
    predictedWeight: number
    predictedBodyFat?: number
    confidence: number // 0-100
    milestones: Milestone[]
    recommendations: string[]
    insights: string[]
}

interface Milestone {
    date: string
    description: string
    predictedValue: number
    metric: string
}

/**
 * Predict future progress based on historical data
 */
export function predictProgress(
    currentData: ProgressData,
    historicalData: ProgressData[],
    goal: { targetWeight: number; targetDate: string; type: 'lose_weight' | 'gain_muscle' | 'maintain' }
): Prediction {
    const trend = calculateTrend(historicalData)
    const daysToGoal = getDaysUntilDate(goal.targetDate)
    const predictedWeight = predictWeight(currentData.weight || 0, trend, daysToGoal)
    const confidence = calculateConfidence(historicalData, trend)
    const milestones = generateMilestones(currentData.weight || 0, goal.targetWeight, goal.targetDate)
    const recommendations = generateRecommendations(currentData, goal, trend)
    const insights = generateInsights(historicalData, trend, goal)

    return {
        targetDate: goal.targetDate,
        predictedWeight,
        confidence,
        milestones,
        recommendations,
        insights,
    }
}

/**
 * Calculate weight trend from historical data
 */
function calculateTrend(data: ProgressData[]): number {
    if (data.length < 2) return 0

    // Sort by date
    const sorted = [...data]
        .filter(d => d.weight !== undefined)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    if (sorted.length < 2) return 0

    // Simple linear regression
    const n = sorted.length
    let sumX = 0
    let sumY = 0
    let sumXY = 0
    let sumX2 = 0

    sorted.forEach((point, index) => {
        const x = index
        const y = point.weight || 0
        sumX += x
        sumY += y
        sumXY += x * y
        sumX2 += x * x
    })

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    return slope // kg per data point
}

/**
 * Predict weight at future date
 */
function predictWeight(currentWeight: number, trend: number, daysAhead: number): number {
    // Assume data points are weekly (7 days apart)
    const weeksAhead = daysAhead / 7
    const predictedChange = trend * weeksAhead
    return Math.round((currentWeight + predictedChange) * 10) / 10
}

/**
 * Calculate confidence level
 */
function calculateConfidence(data: ProgressData[], trend: number): number {
    if (data.length < 3) return 30 // Low confidence with little data

    // Calculate variance
    const weights = data.filter(d => d.weight !== undefined).map(d => d.weight!)
    const mean = weights.reduce((sum, w) => sum + w, 0) / weights.length
    const variance = weights.reduce((sum, w) => sum + Math.pow(w - mean, 2), 0) / weights.length
    const stdDev = Math.sqrt(variance)

    // Lower variance = higher confidence
    const varianceScore = Math.max(0, 100 - stdDev * 10)

    // More data = higher confidence
    const dataScore = Math.min(100, (data.length / 12) * 100) // 12 weeks = 100%

    // Consistency score (workout completion)
    const completedWorkouts = data.filter(d => d.workoutCompleted).length
    const consistencyScore = (completedWorkouts / data.length) * 100

    // Average the scores
    return Math.round((varianceScore + dataScore + consistencyScore) / 3)
}

/**
 * Generate milestones
 */
function generateMilestones(currentWeight: number, targetWeight: number, targetDate: string): Milestone[] {
    const totalChange = targetWeight - currentWeight
    const daysToGoal = getDaysUntilDate(targetDate)
    const milestones: Milestone[] = []

    // Create milestones at 25%, 50%, 75%, and 100%
    const percentages = [0.25, 0.5, 0.75, 1.0]

    percentages.forEach(pct => {
        const daysToMilestone = Math.round(daysToGoal * pct)
        const milestoneDate = new Date()
        milestoneDate.setDate(milestoneDate.getDate() + daysToMilestone)

        const predictedValue = currentWeight + totalChange * pct

        milestones.push({
            date: milestoneDate.toISOString().split('T')[0],
            description: `${Math.round(pct * 100)}% to goal`,
            predictedValue: Math.round(predictedValue * 10) / 10,
            metric: 'weight',
        })
    })

    return milestones
}

/**
 * Generate personalized recommendations
 */
function generateRecommendations(
    current: ProgressData,
    goal: { targetWeight: number; type: string },
    trend: number
): string[] {
    const recommendations: string[] = []
    const weeklyChange = trend
    const targetWeeklyChange = goal.type === 'lose_weight' ? -0.5 : goal.type === 'gain_muscle' ? 0.25 : 0

    // Progress assessment
    if (Math.abs(weeklyChange - targetWeeklyChange) > 0.2) {
        if (goal.type === 'lose_weight' && weeklyChange > targetWeeklyChange) {
            recommendations.push('Your weight loss is slower than expected. Consider reducing calorie intake by 200-300 calories.')
        } else if (goal.type === 'lose_weight' && weeklyChange < targetWeeklyChange) {
            recommendations.push('You\'re losing weight faster than recommended. Increase calories slightly to prevent muscle loss.')
        } else if (goal.type === 'gain_muscle' && weeklyChange < targetWeeklyChange) {
            recommendations.push('Increase your calorie intake by 200-300 calories to support muscle growth.')
        }
    } else {
        recommendations.push('You\'re on track! Keep up the great work.')
    }

    // Workout consistency
    recommendations.push('Maintain consistent workout schedule for best results.')

    // Nutrition
    if (goal.type === 'lose_weight') {
        recommendations.push('Focus on high-protein, high-fiber foods to stay satiated.')
    } else if (goal.type === 'gain_muscle') {
        recommendations.push('Ensure adequate protein intake (1.6-2.2g per kg body weight).')
    }

    // Recovery
    recommendations.push('Prioritize 7-9 hours of sleep for optimal recovery.')

    return recommendations
}

/**
 * Generate insights from data
 */
function generateInsights(data: ProgressData[], trend: number, goal: { type: string }): string[] {
    const insights: string[] = []

    // Trend insight
    if (trend < 0) {
        insights.push(`You're losing an average of ${Math.abs(trend).toFixed(2)} kg per week.`)
    } else if (trend > 0) {
        insights.push(`You're gaining an average of ${trend.toFixed(2)} kg per week.`)
    } else {
        insights.push('Your weight has been stable.')
    }

    // Consistency insight
    const completedWorkouts = data.filter(d => d.workoutCompleted).length
    const consistencyRate = (completedWorkouts / data.length) * 100

    if (consistencyRate >= 80) {
        insights.push(`Excellent consistency! You've completed ${Math.round(consistencyRate)}% of your workouts.`)
    } else if (consistencyRate >= 60) {
        insights.push(`Good consistency at ${Math.round(consistencyRate)}%. Try to aim for 80%+ for better results.`)
    } else {
        insights.push(`Workout consistency is at ${Math.round(consistencyRate)}%. Increasing this will significantly improve your results.`)
    }

    // Calorie tracking insight
    const trackedDays = data.filter(d => d.caloriesConsumed !== undefined).length
    if (trackedDays > 0) {
        const avgCalories = data
            .filter(d => d.caloriesConsumed !== undefined)
            .reduce((sum, d) => sum + (d.caloriesConsumed || 0), 0) / trackedDays

        insights.push(`Your average daily calorie intake is ${Math.round(avgCalories)} calories.`)
    }

    return insights
}

/**
 * Calculate days until target date
 */
function getDaysUntilDate(targetDate: string): number {
    const target = new Date(targetDate)
    const now = new Date()
    const diffTime = target.getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Calculate estimated time to reach goal
 */
export function estimateTimeToGoal(
    currentWeight: number,
    targetWeight: number,
    weeklyTrend: number
): { weeks: number; date: string; realistic: boolean } {
    const totalChange = targetWeight - currentWeight

    if (weeklyTrend === 0) {
        return {
            weeks: Infinity,
            date: 'Unable to estimate',
            realistic: false,
        }
    }

    const weeks = Math.abs(totalChange / weeklyTrend)
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() + weeks * 7)

    // Check if realistic (0.5-1kg per week for weight loss, 0.25-0.5kg for muscle gain)
    const realistic = Math.abs(weeklyTrend) >= 0.25 && Math.abs(weeklyTrend) <= 1.0

    return {
        weeks: Math.round(weeks),
        date: targetDate.toISOString().split('T')[0],
        realistic,
    }
}

/**
 * Generate weekly progress report
 */
export function generateWeeklyReport(weekData: ProgressData[]): {
    summary: string
    achievements: string[]
    areasToImprove: string[]
    nextWeekGoals: string[]
} {
    const workoutDays = weekData.filter(d => d.workoutCompleted).length
    const avgCalories = weekData
        .filter(d => d.caloriesConsumed)
        .reduce((sum, d) => sum + (d.caloriesConsumed || 0), 0) / weekData.length

    const achievements: string[] = []
    const areasToImprove: string[] = []

    // Workout achievements
    if (workoutDays >= 4) {
        achievements.push(`Completed ${workoutDays} workouts this week!`)
    } else if (workoutDays >= 2) {
        achievements.push(`Completed ${workoutDays} workouts.`)
    } else {
        areasToImprove.push('Increase workout frequency to at least 3 days per week.')
    }

    // Weight progress
    const firstWeight = weekData[0]?.weight
    const lastWeight = weekData[weekData.length - 1]?.weight
    if (firstWeight && lastWeight) {
        const change = lastWeight - firstWeight
        if (Math.abs(change) >= 0.3) {
            achievements.push(`Weight changed by ${change > 0 ? '+' : ''}${change.toFixed(1)} kg.`)
        }
    }

    const nextWeekGoals = [
        'Maintain consistent workout schedule',
        'Track meals daily for better nutrition awareness',
        'Get 7-9 hours of sleep each night',
    ]

    return {
        summary: `This week you completed ${workoutDays} workouts and maintained an average of ${Math.round(avgCalories)} calories per day.`,
        achievements,
        areasToImprove,
        nextWeekGoals,
    }
}
