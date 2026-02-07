export interface Exercise {
    id: string
    name: string
    target_muscle: 'chest' | 'back' | 'shoulders' | 'legs' | 'arms' | 'core' | 'full_body'
    secondary_muscles: string[]
    type: 'compound' | 'isolation' | 'cardio'
    equipment: 'dumbbell' | 'barbell' | 'machine' | 'bodyweight' | 'cables'
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    movement_pattern?: 'push' | 'pull' | 'squat' | 'hinge' | 'lunge' | 'carry'
    description?: string
    gif_url?: string // Optional placeholder for future
    instructions?: string[]
}

export const EXERCISE_DATABASE: Exercise[] = [
    // CHEST
    {
        id: 'bench_press',
        name: 'Barbell Bench Press',
        target_muscle: 'chest',
        secondary_muscles: ['triceps', 'shoulders'],
        type: 'compound',
        equipment: 'barbell',
        difficulty: 'intermediate',
        movement_pattern: 'push'
    },
    {
        id: 'push_ups',
        name: 'Push Ups',
        target_muscle: 'chest',
        secondary_muscles: ['triceps', 'core'],
        type: 'compound',
        equipment: 'bodyweight',
        difficulty: 'beginner',
        movement_pattern: 'push'
    },
    {
        id: 'dumbbell_flyes',
        name: 'Dumbbell Flyes',
        target_muscle: 'chest',
        secondary_muscles: ['shoulders'],
        type: 'isolation',
        equipment: 'dumbbell',
        difficulty: 'intermediate',
        movement_pattern: 'push'
    },
    {
        id: 'incline_dumbell_press',
        name: 'Incline Dumbbell Press',
        target_muscle: 'chest',
        secondary_muscles: ['shoulders', 'triceps'],
        type: 'compound',
        equipment: 'dumbbell',
        difficulty: 'intermediate',
        movement_pattern: 'push'
    },

    // BACK
    {
        id: 'pull_ups',
        name: 'Pull Ups',
        target_muscle: 'back',
        secondary_muscles: ['biceps'],
        type: 'compound',
        equipment: 'bodyweight',
        difficulty: 'advanced',
        movement_pattern: 'pull'
    },
    {
        id: 'barbell_row',
        name: 'Barbell Bent Over Row',
        target_muscle: 'back',
        secondary_muscles: ['biceps', 'lower_back'],
        type: 'compound',
        equipment: 'barbell',
        difficulty: 'intermediate',
        movement_pattern: 'pull'
    },
    {
        id: 'lat_pulldown',
        name: 'Lat Pulldown',
        target_muscle: 'back',
        secondary_muscles: ['biceps'],
        type: 'compound',
        equipment: 'machine',
        difficulty: 'beginner',
        movement_pattern: 'pull'
    },
    {
        id: 'seated_cable_row',
        name: 'Seated Cable Row',
        target_muscle: 'back',
        secondary_muscles: ['biceps'],
        type: 'compound',
        equipment: 'cables',
        difficulty: 'beginner',
        movement_pattern: 'pull'
    },

    // SHOULDERS
    {
        id: 'overhead_press',
        name: 'Overhead Press',
        target_muscle: 'shoulders',
        secondary_muscles: ['triceps', 'core'],
        type: 'compound',
        equipment: 'barbell',
        difficulty: 'intermediate',
        movement_pattern: 'push'
    },
    {
        id: 'lateral_raises',
        name: 'Dumbbell Lateral Raises',
        target_muscle: 'shoulders',
        secondary_muscles: [],
        type: 'isolation',
        equipment: 'dumbbell',
        difficulty: 'beginner',
        movement_pattern: 'push'
    },
    {
        id: 'face_pulls',
        name: 'Face Pulls',
        target_muscle: 'shoulders',
        secondary_muscles: ['back'],
        type: 'isolation',
        equipment: 'cables',
        difficulty: 'beginner',
        movement_pattern: 'pull'
    },

    // LEGS
    {
        id: 'squat',
        name: 'Barbell Squat',
        target_muscle: 'legs',
        secondary_muscles: ['core', 'lower_back'],
        type: 'compound',
        equipment: 'barbell',
        difficulty: 'advanced',
        movement_pattern: 'squat'
    },
    {
        id: 'deadlift',
        name: 'Deadlift',
        target_muscle: 'legs', // Posterior chain mainly
        secondary_muscles: ['back', 'core'],
        type: 'compound',
        equipment: 'barbell',
        difficulty: 'advanced',
        movement_pattern: 'hinge'
    },
    {
        id: 'leg_press',
        name: 'Leg Press',
        target_muscle: 'legs',
        secondary_muscles: [],
        type: 'compound',
        equipment: 'machine',
        difficulty: 'beginner',
        movement_pattern: 'squat'
    },
    {
        id: 'lunges',
        name: 'Walking Lunges',
        target_muscle: 'legs',
        secondary_muscles: ['core'],
        type: 'compound',
        equipment: 'dumbbell',
        difficulty: 'intermediate',
        movement_pattern: 'lunge'
    },
    {
        id: 'leg_curls',
        name: 'Leg Curls',
        target_muscle: 'legs',
        secondary_muscles: [],
        type: 'isolation',
        equipment: 'machine',
        difficulty: 'beginner',
        movement_pattern: 'hinge'
    },

    // ARMS
    {
        id: 'bicep_curls',
        name: 'Dumbbell Bicep Curls',
        target_muscle: 'arms',
        secondary_muscles: [],
        type: 'isolation',
        equipment: 'dumbbell',
        difficulty: 'beginner',
        movement_pattern: 'pull'
    },
    {
        id: 'tricep_extensions',
        name: 'Tricep Rope Pushdowns',
        target_muscle: 'arms',
        secondary_muscles: [],
        type: 'isolation',
        equipment: 'cables',
        difficulty: 'beginner',
        movement_pattern: 'push'
    },
    {
        id: 'skull_crushers',
        name: 'Skull Crushers',
        target_muscle: 'arms',
        secondary_muscles: [],
        type: 'isolation',
        equipment: 'barbell',
        difficulty: 'intermediate',
        movement_pattern: 'push'
    },

    // CORE
    {
        id: 'plank',
        name: 'Plank',
        target_muscle: 'core',
        secondary_muscles: ['shoulders'],
        type: 'isolation',
        equipment: 'bodyweight',
        difficulty: 'beginner',
    },
    {
        id: 'leg_raises',
        name: 'Hanging Leg Raises',
        target_muscle: 'core',
        secondary_muscles: ['hip_flexors'],
        type: 'isolation',
        equipment: 'bodyweight',
        difficulty: 'intermediate',
    }
]

// Helper functions for the Workout Generator

export function getExercises(criteria: Partial<Exercise>): Exercise[] {
    return EXERCISE_DATABASE.filter(ex => {
        let match = true
        if (criteria.target_muscle && ex.target_muscle !== criteria.target_muscle) match = false
        if (criteria.type && ex.type !== criteria.type) match = false
        if (criteria.movement_pattern && ex.movement_pattern !== criteria.movement_pattern) match = false
        return match
    })
}

export function getCompoundExercise(muscle: string, pattern?: string): Exercise | undefined {
    const candidates = EXERCISE_DATABASE.filter(ex =>
        ex.target_muscle === muscle &&
        ex.type === 'compound' &&
        (!pattern || ex.movement_pattern === pattern)
    )
    if (candidates.length === 0) return undefined
    return candidates[Math.floor(Math.random() * candidates.length)]
}

export function getIsolationExercise(muscle: string): Exercise | undefined {
    const candidates = EXERCISE_DATABASE.filter(ex =>
        ex.target_muscle === muscle &&
        ex.type === 'isolation'
    )
    if (candidates.length === 0) return undefined
    return candidates[Math.floor(Math.random() * candidates.length)]
}

export async function getRecommendedWorkout(goal: string): Promise<any> {
    const isStrength = goal.includes('strength') || goal === 'gain_muscle'

    // Pick 3-4 exercises
    const main = getCompoundExercise(isStrength ? 'legs' : 'full_body', 'squat') || EXERCISE_DATABASE[0]
    const push = getCompoundExercise('chest', 'push') || EXERCISE_DATABASE[1]
    const pull = getCompoundExercise('back', 'pull') || EXERCISE_DATABASE[5]
    const acc = getIsolationExercise('arms') || EXERCISE_DATABASE[8]

    return {
        title: isStrength ? "Strength Primer" : "Metabolic Conditioning",
        focus: isStrength ? "Full Body Power" : "Fat Loss / Endurance",
        duration: "45 Min",
        exercises: [main, push, pull, acc].map(ex => ({
            name: ex.name,
            sets: isStrength ? "4" : "3",
            reps: isStrength ? "6-8" : "12-15",
            rest: isStrength ? "90s" : "60s",
            tags: [ex.target_muscle, ex.difficulty],
            gif: null
        }))
    }
}

// Support for AI Workout Generator
export type ExerciseDBItem = Exercise;

export async function getExercisesByMuscleGroup(muscle: string): Promise<Exercise[]> {
    // Map broader muscle groups if needed
    // The Exercise.target_muscle is 'chest' | 'back' | 'shoulders' | 'legs' | 'arms' | 'core' | 'full_body'
    // ai-workout-generator passes strings like 'glutes', 'calves' which might be subset

    // Normalize muscle string
    let target: any = muscle.toLowerCase();

    // Simple mapping for safety
    if (target === 'glutes' || target === 'calves' || target === 'quads' || target === 'hamstrings') target = 'legs';
    if (target === 'biceps' || target === 'triceps') target = 'arms';
    if (target === 'abs') target = 'core';


    return EXERCISE_DATABASE.filter(ex => ex.target_muscle === target);
}

export async function fetchAllExercises() {
    return EXERCISE_DATABASE;
}
