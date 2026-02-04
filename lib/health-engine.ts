/**
 * FitDay AI - Core Health & Calculation Engine
 * Advanced biometric processing for personalized fitness
 */

export type Gender = 'male' | 'female' | 'other'
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
export type FitnessGoal = 'lose_weight' | 'gain_muscle' | 'maintain' | 'increase_strength' | 'improve_endurance'

export interface BodyMetrics {
    age: number
    gender: Gender
    heightCm: number
    weightKg: number
    bodyFatPercentage?: number
    activityLevel: ActivityLevel
    goal: FitnessGoal
}

export interface MacroDistribution {
    proteinGrams: number
    carbGrams: number
    fatGrams: number
    calories: number
}

export class HealthEngine {
    /**
     * Calculate Basal Metabolic Rate (BMR)
     * Using Mifflin-St Jeor Equation or Katch-McArdle if body fat is known
     */
    static calculateBMR(metrics: BodyMetrics): number {
        const { weightKg, heightCm, age, gender, bodyFatPercentage } = metrics

        // If body fat is known, Katch-McArdle is more accurate
        if (bodyFatPercentage && bodyFatPercentage > 0) {
            const leanMass = weightKg * (1 - bodyFatPercentage / 100)
            return Math.round(370 + 21.6 * leanMass)
        }

        // Default Mifflin-St Jeor
        let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age
        if (gender === 'male') {
            bmr += 5
        } else {
            bmr -= 161
        }
        return Math.round(bmr)
    }

    /**
     * Calculate Total Daily Energy Expenditure (TDEE)
     */
    static calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
        const multipliers: Record<ActivityLevel, number> = {
            sedentary: 1.2,
            light: 1.375,
            moderate: 1.55,
            active: 1.725,
            very_active: 1.9,
        }

        return Math.round(bmr * (multipliers[activityLevel] || 1.2))
    }

    /**
     * Calculate Target Calories based on goal
     */
    static calculateTargetCalories(tdee: number, goal: FitnessGoal): number {
        switch (goal) {
            case 'lose_weight':
                return Math.round(tdee - 500) // 500 calorie deficit for ~0.5kg/week loss
            case 'gain_muscle':
                return Math.round(tdee + 250) // Moderate surplus for lean gain
            case 'increase_strength':
                return Math.round(tdee + 200)
            case 'improve_endurance':
                return Math.round(tdee + 150)
            case 'maintain':
            default:
                return tdee
        }
    }

    /**
     * Calculate Macro Ratios based on goal and activity
     */
    static calculateMacros(calories: number, goal: FitnessGoal): MacroDistribution {
        let proteinPct, carbPct, fatPct

        switch (goal) {
            case 'gain_muscle':
                proteinPct = 0.30
                carbPct = 0.50
                fatPct = 0.20
                break
            case 'lose_weight':
                proteinPct = 0.35
                carbPct = 0.35
                fatPct = 0.30
                break
            case 'increase_strength':
                proteinPct = 0.30
                carbPct = 0.45
                fatPct = 0.25
                break
            case 'maintain':
            default:
                proteinPct = 0.25
                carbPct = 0.45
                fatPct = 0.30
                break
        }

        return {
            calories,
            proteinGrams: Math.round((calories * proteinPct) / 4),
            carbGrams: Math.round((calories * carbPct) / 4),
            fatGrams: Math.round((calories * fatPct) / 9),
        }
    }

    /**
     * Calculate BMI
     */
    static calculateBMI(weightKg: number, heightCm: number): number {
        const heightM = heightCm / 100
        return parseFloat((weightKg / (heightM * heightM)).toFixed(1))
    }

    /**
     * Determine BMI Category
     */
    static getBMICategory(bmi: number): string {
        if (bmi < 18.5) return 'Underweight'
        if (bmi < 25) return 'Healthy'
        if (bmi < 30) return 'Overweight'
        return 'Obese'
    }

    /**
     * Calculate Daily Water Goal (ml)
     * Basic rule: 35ml per kg of bodyweight, adjusted for activity
     */
    static calculateWaterGoal(weightKg: number, activityLevel: ActivityLevel): number {
        let base = weightKg * 35
        if (activityLevel === 'active' || activityLevel === 'very_active') {
            base += 500
        }
        return Math.round(base / 250) * 250 // Round to nearest 250ml
    }
}
