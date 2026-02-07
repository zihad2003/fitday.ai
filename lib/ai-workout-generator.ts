/**
 * AI Workout Generator
 * Creates personalized workout plans based on user goals, fitness level, and available equipment
 */

import { getExercisesByMuscleGroup, type ExerciseDBItem } from './exercise-db'

interface WorkoutProfile {
    goal: 'lose_weight' | 'gain_muscle' | 'maintain' | 'endurance' | 'strength'
    fitnessLevel: 'beginner' | 'intermediate' | 'advanced'
    daysPerWeek: number
    sessionDuration: number // in minutes
    equipment: string[]
    targetMuscles?: string[]
    injuries?: string[]
}

interface WorkoutPlan {
    name: string
    description: string
    duration: string
    frequency: string
    schedule: WorkoutDay[]
    tips: string[]
    progressionPlan: string[]
}

interface WorkoutDay {
    day: number
    name: string
    focus: string
    warmup: Exercise[]
    mainWorkout: Exercise[]
    cooldown: Exercise[]
    totalDuration: number
}

interface Exercise {
    name: string
    sets: number
    reps: string
    rest: string
    notes?: string
    gif?: string
    difficulty?: string
}

/**
 * Generate personalized workout plan
 */
export async function generateWorkoutPlan(profile: WorkoutProfile): Promise<WorkoutPlan> {
    const schedule = await createWeeklySchedule(profile)
    const tips = generateWorkoutTips(profile)
    const progression = generateProgressionPlan(profile)

    return {
        name: `${profile.goal.replace('_', ' ').toUpperCase()} - ${profile.fitnessLevel} Program`,
        description: getWorkoutDescription(profile),
        duration: `${profile.sessionDuration} minutes`,
        frequency: `${profile.daysPerWeek} days per week`,
        schedule,
        tips,
        progressionPlan: progression,
    }
}

/**
 * Create weekly workout schedule
 */
async function createWeeklySchedule(profile: WorkoutProfile): Promise<WorkoutDay[]> {
    const schedule: WorkoutDay[] = []

    // Define split based on days per week
    const splits = getSplitRoutine(profile.daysPerWeek, profile.goal)

    for (let i = 0; i < profile.daysPerWeek; i++) {
        const split = splits[i]
        const day = await createWorkoutDay(i + 1, split, profile)
        schedule.push(day)
    }

    return schedule
}

/**
 * Get workout split based on frequency and goal
 */
function getSplitRoutine(daysPerWeek: number, goal: string): Array<{ name: string; focus: string; muscles: string[] }> {
    const splits: Record<number, Array<{ name: string; focus: string; muscles: string[] }>> = {
        3: [
            { name: 'Full Body A', focus: 'Upper Body Focus', muscles: ['chest', 'back', 'shoulders'] },
            { name: 'Full Body B', focus: 'Lower Body Focus', muscles: ['legs', 'glutes', 'core'] },
            { name: 'Full Body C', focus: 'Balanced', muscles: ['chest', 'back', 'legs'] },
        ],
        4: [
            { name: 'Upper Body', focus: 'Push', muscles: ['chest', 'shoulders', 'triceps'] },
            { name: 'Lower Body', focus: 'Legs & Glutes', muscles: ['legs', 'glutes', 'calves'] },
            { name: 'Upper Body', focus: 'Pull', muscles: ['back', 'biceps'] },
            { name: 'Full Body', focus: 'Conditioning', muscles: ['core', 'cardio'] },
        ],
        5: [
            { name: 'Chest & Triceps', focus: 'Push', muscles: ['chest', 'triceps'] },
            { name: 'Back & Biceps', focus: 'Pull', muscles: ['back', 'biceps'] },
            { name: 'Legs', focus: 'Lower Body', muscles: ['legs', 'glutes'] },
            { name: 'Shoulders & Core', focus: 'Stability', muscles: ['shoulders', 'core'] },
            { name: 'Full Body', focus: 'Conditioning', muscles: ['cardio', 'core'] },
        ],
        6: [
            { name: 'Chest', focus: 'Chest Development', muscles: ['chest'] },
            { name: 'Back', focus: 'Back Development', muscles: ['back'] },
            { name: 'Legs', focus: 'Leg Development', muscles: ['legs', 'glutes'] },
            { name: 'Shoulders', focus: 'Shoulder Development', muscles: ['shoulders'] },
            { name: 'Arms', focus: 'Arm Development', muscles: ['biceps', 'triceps'] },
            { name: 'Full Body', focus: 'Conditioning', muscles: ['cardio', 'core'] },
        ],
    }

    return splits[daysPerWeek] || splits[3]
}

/**
 * Create individual workout day
 */
async function createWorkoutDay(
    day: number,
    split: { name: string; focus: string; muscles: string[] },
    profile: WorkoutProfile
): Promise<WorkoutDay> {
    const warmup = getWarmupExercises()
    const mainWorkout = await getMainWorkout(split.muscles, profile)
    const cooldown = getCooldownExercises()

    return {
        day,
        name: split.name,
        focus: split.focus,
        warmup,
        mainWorkout,
        cooldown,
        totalDuration: profile.sessionDuration,
    }
}

/**
 * Get warmup exercises
 */
function getWarmupExercises(): Exercise[] {
    return [
        {
            name: 'Dynamic Stretching',
            sets: 1,
            reps: '5-10 each',
            rest: '0s',
            notes: 'Arm circles, leg swings, torso twists',
        },
        {
            name: 'Light Cardio',
            sets: 1,
            reps: '5 minutes',
            rest: '0s',
            notes: 'Jogging, jumping jacks, or cycling',
        },
    ]
}

/**
 * Get cooldown exercises
 */
function getCooldownExercises(): Exercise[] {
    return [
        {
            name: 'Static Stretching',
            sets: 1,
            reps: '30s each',
            rest: '0s',
            notes: 'Hold each stretch for 30 seconds',
        },
        {
            name: 'Foam Rolling',
            sets: 1,
            reps: '5 minutes',
            rest: '0s',
            notes: 'Focus on worked muscle groups',
        },
    ]
}

/**
 * Get main workout exercises
 */
async function getMainWorkout(muscles: string[], profile: WorkoutProfile): Promise<Exercise[]> {
    const exercises: Exercise[] = []
    const exercisesPerMuscle = Math.ceil(6 / muscles.length) // Aim for 6 total exercises

    for (const muscle of muscles) {
        try {
            const dbExercises = await getExercisesByMuscleGroup(muscle)
            const filtered = dbExercises
                .filter(ex => {
                    // Filter by fitness level
                    if (profile.fitnessLevel === 'beginner' && ex.difficulty === 'advanced') return false
                    if (profile.fitnessLevel === 'intermediate' && ex.difficulty === 'advanced') return false

                    // Filter by equipment if specified
                    if (profile.equipment.length > 0 && ex.equipment) {
                        const hasEquipment = profile.equipment.some(eq =>
                            ex.equipment?.toLowerCase().includes(eq.toLowerCase()) ||
                            ex.equipment?.toLowerCase() === 'body only'
                        )
                        if (!hasEquipment) return false
                    }

                    return true
                })
                .slice(0, exercisesPerMuscle)

            for (const ex of filtered) {
                exercises.push(convertToExercise(ex, profile))
            }
        } catch (error) {
            console.error(`Failed to load exercises for ${muscle}:`, error)
        }
    }

    return exercises.slice(0, 6) // Limit to 6 exercises
}

/**
 * Convert DB exercise to workout exercise with sets/reps
 */
function convertToExercise(dbEx: ExerciseDBItem, profile: WorkoutProfile): Exercise {
    const { sets, reps, rest } = getSetsRepsRest(profile)

    return {
        name: dbEx.name,
        sets,
        reps,
        rest,
        gif: dbEx.gif_url,
        difficulty: dbEx.difficulty,
        notes: dbEx.instructions?.[0],
    }
}

/**
 * Get sets, reps, and rest based on goal and level
 */
function getSetsRepsRest(profile: WorkoutProfile): { sets: number; reps: string; rest: string } {
    const configs = {
        lose_weight: {
            beginner: { sets: 3, reps: '12-15', rest: '45s' },
            intermediate: { sets: 3, reps: '15-20', rest: '30s' },
            advanced: { sets: 4, reps: '15-20', rest: '30s' },
        },
        gain_muscle: {
            beginner: { sets: 3, reps: '8-12', rest: '60s' },
            intermediate: { sets: 4, reps: '8-12', rest: '60s' },
            advanced: { sets: 4, reps: '6-10', rest: '90s' },
        },
        strength: {
            beginner: { sets: 3, reps: '5-8', rest: '90s' },
            intermediate: { sets: 4, reps: '4-6', rest: '2min' },
            advanced: { sets: 5, reps: '3-5', rest: '3min' },
        },
        endurance: {
            beginner: { sets: 2, reps: '15-20', rest: '30s' },
            intermediate: { sets: 3, reps: '20-25', rest: '30s' },
            advanced: { sets: 3, reps: '25-30', rest: '20s' },
        },
        maintain: {
            beginner: { sets: 3, reps: '10-12', rest: '60s' },
            intermediate: { sets: 3, reps: '10-12', rest: '60s' },
            advanced: { sets: 3, reps: '10-12', rest: '60s' },
        },
    }

    return configs[profile.goal]?.[profile.fitnessLevel] || configs.maintain.intermediate
}

/**
 * Generate workout tips
 */
function generateWorkoutTips(profile: WorkoutProfile): string[] {
    const baseTips = [
        'Always warm up before starting your workout',
        'Focus on proper form over heavy weights',
        'Stay hydrated throughout your workout',
        'Get adequate rest between workout days',
    ]

    const goalTips = {
        lose_weight: [
            'Combine strength training with cardio for best results',
            'Keep rest periods short to maintain elevated heart rate',
            'Track your calories to ensure you\'re in a deficit',
        ],
        gain_muscle: [
            'Progressive overload is key - gradually increase weight',
            'Eat in a calorie surplus with adequate protein',
            'Get 7-9 hours of sleep for muscle recovery',
        ],
        strength: [
            'Focus on compound movements (squat, deadlift, bench)',
            'Take longer rest periods for full recovery',
            'Consider working with a spotter for heavy lifts',
        ],
        endurance: [
            'Gradually increase volume over time',
            'Include active recovery days',
            'Focus on cardiovascular health',
        ],
        maintain: [
            'Consistency is more important than intensity',
            'Listen to your body and adjust as needed',
            'Mix up your routine to prevent boredom',
        ],
    }

    return [...baseTips, ...(goalTips[profile.goal] || [])]
}

/**
 * Generate progression plan
 */
function generateProgressionPlan(profile: WorkoutProfile): string[] {
    return [
        'Week 1-2: Focus on learning proper form and technique',
        'Week 3-4: Increase weight by 5-10% if form is good',
        'Week 5-6: Add an extra set to main exercises',
        'Week 7-8: Increase weight again or add advanced variations',
        'Week 9+: Reassess goals and adjust program as needed',
    ]
}

/**
 * Get workout description
 */
function getWorkoutDescription(profile: WorkoutProfile): string {
    const descriptions = {
        lose_weight: 'High-volume training with shorter rest periods to maximize calorie burn and fat loss',
        gain_muscle: 'Hypertrophy-focused program with moderate weight and volume for muscle growth',
        strength: 'Low-rep, high-weight training to build maximum strength',
        endurance: 'High-rep, circuit-style training to improve muscular endurance',
        maintain: 'Balanced program to maintain current fitness levels',
    }

    return descriptions[profile.goal] || descriptions.maintain
}
