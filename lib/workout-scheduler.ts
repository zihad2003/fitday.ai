import { Exercise, getCompoundExercise, getIsolationExercise, EXERCISE_DATABASE } from './exercise-db'

export interface WorkoutSession {
    day_name: string
    focus: string // 'Upper Body', 'Lower Power', 'Push', etc.
    duration_minutes: number
    warmup: string[]
    exercises: ProgrammedExercise[]
    cooldown: string[]
}

export interface ProgrammedExercise {
    exercise: Exercise
    sets: number
    reps: string
    rest_seconds: number
    notes: string
}

export interface WeeklyWorkoutPlan {
    split_name: string
    goal: string
    frequency: number // days per week
    schedule: WorkoutSession[]
}

export class WorkoutScheduler {
    static generatePlan(
        daysPerWeek: number,
        goal: 'build_muscle' | 'lose_weight' | 'increase_strength' | 'general_fitness',
        fitnessLevel: 'beginner' | 'intermediate' | 'advanced'
    ): WeeklyWorkoutPlan {

        let splitName = ''
        let schedule: WorkoutSession[] = []

        // 1. Determine Split Strategy
        if (daysPerWeek <= 2) {
            splitName = 'Full Body Split'
            schedule = this.generateFullBodySplit(daysPerWeek, goal)
        } else if (daysPerWeek === 3) {
            splitName = 'Full Body 3-Day Split'
            schedule = this.generateFullBodySplit(3, goal)
        } else if (daysPerWeek === 4) {
            splitName = 'Upper / Lower Split'
            schedule = this.generateUpperLowerSplit(4, goal)
        } else if (daysPerWeek === 5) {
            splitName = 'Upper / Lower / PPL Hybrid'
            schedule = this.generateHybridSplit5(goal)
        } else {
            splitName = 'Push / Pull / Legs (PPL)'
            schedule = this.generatePPLSplit(daysPerWeek, goal)
        }

        return {
            split_name: splitName,
            goal,
            frequency: daysPerWeek,
            schedule
        }
    }

    // --- SPLIT GENERATORS ---

    private static generateFullBodySplit(days: number, goal: string): WorkoutSession[] {
        const sessions: WorkoutSession[] = []
        for (let i = 1; i <= days; i++) {
            sessions.push(this.createSession(`Day ${i}`, 'Full Body', ['Squat', 'Push', 'Pull', 'Hinge', 'Core'], goal))
        }
        return sessions
    }

    private static generateUpperLowerSplit(days: number, goal: string): WorkoutSession[] {
        return [
            this.createSession('Day 1', 'Upper Body', ['Push', 'Pull', 'Push', 'Pull', 'Arms'], goal),
            this.createSession('Day 2', 'Lower Body', ['Squat', 'Hinge', 'Lunge', 'Calves', 'Core'], goal),
            this.createSession('Day 3', 'Upper Body', ['Pull', 'Push', 'Pull', 'Push', 'Arms'], goal), // Variation?
            this.createSession('Day 4', 'Lower Body', ['Hinge', 'Squat', 'Lunge', 'Core'], goal)
        ]
    }

    private static generateHybridSplit5(goal: string): WorkoutSession[] {
        return [
            this.createSession('Day 1', 'Upper Body Power', ['Push', 'Pull', 'Push', 'Pull'], goal),
            this.createSession('Day 2', 'Lower Body Power', ['Squat', 'Hinge', 'Lunge'], goal),
            this.createSession('Day 3', 'Push (Hypertrophy)', ['Chest', 'Shoulders', 'Triceps'], goal),
            this.createSession('Day 4', 'Pull (Hypertrophy)', ['Back', 'Biceps', 'Rear Delts'], goal),
            this.createSession('Day 5', 'Legs (Hypertrophy)', ['Quads', 'Hamstrings', 'Calves'], goal)
        ]
    }

    private static generatePPLSplit(days: number, goal: string): WorkoutSession[] {
        const sessions = [
            this.createSession('Day 1', 'Push', ['Chest', 'Shoulders', 'Triceps'], goal),
            this.createSession('Day 2', 'Pull', ['Back', 'Biceps', 'Rear Delts'], goal),
            this.createSession('Day 3', 'Legs', ['Quads', 'Hamstrings', 'Calves'], goal)
        ]

        if (days >= 4) sessions.push(this.createSession('Day 4', 'Push', ['Chest', 'Shoulders', 'Triceps'], goal))
        if (days >= 5) sessions.push(this.createSession('Day 5', 'Pull', ['Back', 'Biceps', 'Rear Delts'], goal))
        if (days >= 6) sessions.push(this.createSession('Day 6', 'Legs', ['Quads', 'Hamstrings', 'Calves'], goal))

        return sessions
    }

    // --- SESSION CREATOR ---

    private static createSession(dayName: string, focus: string, patterns: string[], goal: string): WorkoutSession {
        const exercises: ProgrammedExercise[] = []

        // Select exercises based on patterns/muscles
        patterns.forEach(pattern => {
            let exercise: Exercise | undefined

            // Pattern mapping logic
            if (pattern === 'Squat') exercise = getCompoundExercise('legs', 'squat')
            else if (pattern === 'Hinge') exercise = getCompoundExercise('legs', 'hinge')
            else if (pattern === 'Lunge') exercise = getCompoundExercise('legs', 'lunge')
            else if (pattern === 'Push') exercise = getCompoundExercise('chest', 'push') || getCompoundExercise('shoulders', 'push')
            else if (pattern === 'Pull') exercise = getCompoundExercise('back', 'pull')

            // Muscle specific
            else if (pattern === 'Chest') exercise = getCompoundExercise('chest')
            else if (pattern === 'Back') exercise = getCompoundExercise('back')
            else if (pattern === 'Shoulders') exercise = getCompoundExercise('shoulders')
            else if (pattern === 'Quads' || pattern === 'Hamstrings') exercise = getCompoundExercise('legs')

            // Isolation / Arms
            else if (pattern === 'Arms') exercise = getIsolationExercise('arms')
            else if (pattern === 'Triceps') exercise = getIsolationExercise('arms') // Need precise mapping in DB
            else if (pattern === 'Biceps') exercise = getIsolationExercise('arms')
            else if (pattern === 'Core') exercise = getIsolationExercise('core')

            if (exercise) {
                exercises.push(this.programExercise(exercise, goal))
            }
        })

        return {
            day_name: dayName,
            focus,
            duration_minutes: 45 + (exercises.length * 5),
            warmup: ['5 min light cardio', 'Dynamic stretching (Arm circles, Leg swings)'],
            exercises,
            cooldown: ['Static stretching', 'Foam rolling']
        }
    }

    // --- PROGRAMMING LOGIC (Sets/Reps) ---

    private static programExercise(exercise: Exercise, goal: string): ProgrammedExercise {
        let sets = 3
        let reps = '10-12'
        let rest = 60
        let notes = ''

        if (goal === 'increase_strength') {
            if (exercise.type === 'compound') {
                sets = 5
                reps = '5'
                rest = 180
                notes = 'Focus on heavy load and perfect form'
            } else {
                sets = 3
                reps = '8-10'
                rest = 90
                notes = 'Accessory work'
            }
        } else if (goal === 'build_muscle') {
            sets = exercise.type === 'compound' ? 4 : 3
            reps = exercise.type === 'compound' ? '8-10' : '10-12'
            rest = exercise.type === 'compound' ? 90 : 60
            notes = 'Control the negative, squeeze at top'
        } else if (goal === 'lose_weight') {
            sets = 3
            reps = '12-15'
            rest = 45
            notes = 'Keep heart rate up'
        }

        return {
            exercise,
            sets,
            reps,
            rest_seconds: rest,
            notes
        }
    }
}
