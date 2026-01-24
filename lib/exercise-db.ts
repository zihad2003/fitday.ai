export interface ExerciseDBItem {
    id: string
    name: string
    force: string | null
    level: string
    mechanic: string | null
    equipment: string | null
    primaryMuscles: string[]
    secondaryMuscles: string[]
    instructions: string[]
    category: string
    images: string[]
}

const BASE_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json'

let cachedExercises: ExerciseDBItem[] | null = null

export async function fetchAllExercises(): Promise<ExerciseDBItem[]> {
    if (cachedExercises) return cachedExercises

    try {
        const res = await fetch(BASE_URL)
        if (!res.ok) throw new Error('Failed to fetch exercise DB')
        const data = (await res.json()) as ExerciseDBItem[]
        cachedExercises = data
        return data
    } catch (error) {
        console.error('Exercise DB Error:', error)
        return []
    }
}

export async function getRecommendedWorkout(goal: string): Promise<any> {
    const exercises = await fetchAllExercises()
    if (!exercises.length) return null

    // Goal to Muscle Group Mapping
    let primaryMuscles: string[] = []
    let style = 'strength'

    if (goal === 'lose_weight' || goal === 'lose') {
        primaryMuscles = ['quadriceps', 'hamstrings', 'chest', 'abdominals']
        style = 'cardio'
    } else if (goal === 'gain_muscle' || goal === 'gain') {
        primaryMuscles = ['chest', 'shoulders', 'biceps', 'triceps', 'lats']
        style = 'hypertrophy'
    } else { // maintain
        primaryMuscles = ['quadriceps', 'chest', 'back', 'abdominals']
        style = 'strength'
    }

    // Filter Exercises
    const routine = []
    for (const muscle of primaryMuscles) {
        const candidates = exercises.filter(e =>
            e.primaryMuscles.includes(muscle) &&
            e.images.length > 0
        )
        if (candidates.length) {
            const randomEx = candidates[Math.floor(Math.random() * candidates.length)]
            routine.push({
                name: randomEx.name,
                sets: style === 'hypertrophy' ? '3-4' : '3',
                reps: style === 'cardio' ? '15-20' : (style === 'hypertrophy' ? '8-12' : '10'),
                rest: '60s',
                tags: [muscle, randomEx.level],
                gif: `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${randomEx.images[0]}`
            })
        }
    }

    // Add some random variety if short
    while (routine.length < 5) {
        const randomEx = exercises[Math.floor(Math.random() * exercises.length)]
        if (randomEx.images.length > 0 && !routine.find(r => r.name === randomEx.name)) {
            routine.push({
                name: randomEx.name,
                sets: '3',
                reps: '12',
                rest: '60s',
                tags: [randomEx.primaryMuscles[0] || 'Full Body', randomEx.level],
                gif: `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${randomEx.images[0]}`
            })
        }
    }

    return {
        title: `AI Generated: ${style.charAt(0).toUpperCase() + style.slice(1)} Focus`,
        focus: style === 'cardio' ? 'High Intensity' : 'Muscle Building',
        duration: '45-60 Min',
        exercises: routine.slice(0, 8) // Limit to 8 exercises
    }
}

/**
 * Get exercises filtered by muscle group
 */
export async function getExercisesByMuscleGroup(muscleGroup: string): Promise<ExerciseDBItem[]> {
    const exercises = await fetchAllExercises()
    if (!exercises.length) return []

    const normalizedMuscle = muscleGroup.toLowerCase()

    return exercises.filter(exercise =>
        exercise.primaryMuscles.some(m => m.toLowerCase().includes(normalizedMuscle)) ||
        exercise.secondaryMuscles.some(m => m.toLowerCase().includes(normalizedMuscle)) ||
        exercise.category.toLowerCase().includes(normalizedMuscle)
    )
}

