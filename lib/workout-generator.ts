/**
 * Workout Plan Generator
 * Generates personalized workout plans based on user goals, equipment, and schedule
 */

interface UserProfile {
    fitness_goal: string
    workout_days_per_week: number
    available_equipment: string
    workout_duration_preference: number
    activity_level: string
    age: number
    gender: string
}

interface Exercise {
    id: number
    name: string
    difficulty: string
    muscle_group: string
    equipment_needed: string
    safety_instruction: string
    gif_url: string
}

interface WorkoutDay {
    day: string
    workout_type: string
    duration_minutes: number
    focus: string
    exercises: WorkoutExercise[]
}

interface WorkoutExercise {
    exercise_id: number
    exercise_name: string
    sets: number
    reps: string
    rest_seconds: number
    notes: string
    order: number
}

interface WorkoutPlan {
    plan_name: string
    goal: string
    duration_weeks: number
    difficulty: string
    weekly_schedule: WorkoutDay[]
    progression_strategy: string
    deload_week: number
    notes: string[]
}

// Exercise database organized by muscle group and equipment
const EXERCISE_TEMPLATES = {
    // CHEST
    chest: {
        gym: [
            { name: 'Barbell Bench Press', difficulty: 'intermediate', primary: true },
            { name: 'Incline Dumbbell Press', difficulty: 'intermediate', primary: true },
            { name: 'Cable Flyes', difficulty: 'beginner', primary: false },
            { name: 'Chest Dips', difficulty: 'advanced', primary: true },
            { name: 'Machine Chest Press', difficulty: 'beginner', primary: true },
        ],
        home: [
            { name: 'Dumbbell Bench Press', difficulty: 'intermediate', primary: true },
            { name: 'Dumbbell Flyes', difficulty: 'beginner', primary: false },
            { name: 'Push-ups (Weighted)', difficulty: 'intermediate', primary: true },
        ],
        bodyweight: [
            { name: 'Push-ups', difficulty: 'beginner', primary: true },
            { name: 'Diamond Push-ups', difficulty: 'intermediate', primary: true },
            { name: 'Decline Push-ups', difficulty: 'intermediate', primary: true },
            { name: 'Archer Push-ups', difficulty: 'advanced', primary: true },
        ],
    },

    // BACK
    back: {
        gym: [
            { name: 'Barbell Rows', difficulty: 'intermediate', primary: true },
            { name: 'Pull-ups', difficulty: 'intermediate', primary: true },
            { name: 'Lat Pulldown', difficulty: 'beginner', primary: true },
            { name: 'Seated Cable Rows', difficulty: 'beginner', primary: true },
            { name: 'Deadlifts', difficulty: 'advanced', primary: true },
            { name: 'T-Bar Rows', difficulty: 'intermediate', primary: true },
        ],
        home: [
            { name: 'Dumbbell Rows', difficulty: 'beginner', primary: true },
            { name: 'Resistance Band Rows', difficulty: 'beginner', primary: true },
            { name: 'Inverted Rows', difficulty: 'intermediate', primary: true },
        ],
        bodyweight: [
            { name: 'Pull-ups', difficulty: 'intermediate', primary: true },
            { name: 'Chin-ups', difficulty: 'intermediate', primary: true },
            { name: 'Inverted Rows', difficulty: 'beginner', primary: true },
            { name: 'Superman Holds', difficulty: 'beginner', primary: false },
        ],
    },

    // LEGS
    legs: {
        gym: [
            { name: 'Barbell Squats', difficulty: 'intermediate', primary: true },
            { name: 'Romanian Deadlifts', difficulty: 'intermediate', primary: true },
            { name: 'Leg Press', difficulty: 'beginner', primary: true },
            { name: 'Leg Curls', difficulty: 'beginner', primary: false },
            { name: 'Leg Extensions', difficulty: 'beginner', primary: false },
            { name: 'Calf Raises', difficulty: 'beginner', primary: false },
            { name: 'Bulgarian Split Squats', difficulty: 'intermediate', primary: true },
        ],
        home: [
            { name: 'Dumbbell Squats', difficulty: 'beginner', primary: true },
            { name: 'Dumbbell Lunges', difficulty: 'beginner', primary: true },
            { name: 'Dumbbell Romanian Deadlifts', difficulty: 'intermediate', primary: true },
            { name: 'Single Leg Deadlifts', difficulty: 'intermediate', primary: true },
        ],
        bodyweight: [
            { name: 'Bodyweight Squats', difficulty: 'beginner', primary: true },
            { name: 'Lunges', difficulty: 'beginner', primary: true },
            { name: 'Bulgarian Split Squats', difficulty: 'intermediate', primary: true },
            { name: 'Pistol Squats', difficulty: 'advanced', primary: true },
            { name: 'Jump Squats', difficulty: 'intermediate', primary: true },
        ],
    },

    // SHOULDERS
    shoulders: {
        gym: [
            { name: 'Overhead Press', difficulty: 'intermediate', primary: true },
            { name: 'Dumbbell Shoulder Press', difficulty: 'intermediate', primary: true },
            { name: 'Lateral Raises', difficulty: 'beginner', primary: false },
            { name: 'Front Raises', difficulty: 'beginner', primary: false },
            { name: 'Face Pulls', difficulty: 'beginner', primary: false },
            { name: 'Arnold Press', difficulty: 'intermediate', primary: true },
        ],
        home: [
            { name: 'Dumbbell Shoulder Press', difficulty: 'intermediate', primary: true },
            { name: 'Dumbbell Lateral Raises', difficulty: 'beginner', primary: false },
            { name: 'Dumbbell Front Raises', difficulty: 'beginner', primary: false },
        ],
        bodyweight: [
            { name: 'Pike Push-ups', difficulty: 'intermediate', primary: true },
            { name: 'Handstand Push-ups', difficulty: 'advanced', primary: true },
            { name: 'Shoulder Taps', difficulty: 'beginner', primary: false },
        ],
    },

    // ARMS
    arms: {
        gym: [
            { name: 'Barbell Curls', difficulty: 'beginner', primary: true },
            { name: 'Tricep Dips', difficulty: 'intermediate', primary: true },
            { name: 'Hammer Curls', difficulty: 'beginner', primary: false },
            { name: 'Tricep Pushdowns', difficulty: 'beginner', primary: false },
            { name: 'Skull Crushers', difficulty: 'intermediate', primary: true },
            { name: 'Cable Curls', difficulty: 'beginner', primary: false },
        ],
        home: [
            { name: 'Dumbbell Curls', difficulty: 'beginner', primary: true },
            { name: 'Dumbbell Tricep Extensions', difficulty: 'beginner', primary: true },
            { name: 'Hammer Curls', difficulty: 'beginner', primary: false },
        ],
        bodyweight: [
            { name: 'Close-Grip Push-ups', difficulty: 'beginner', primary: true },
            { name: 'Tricep Dips', difficulty: 'intermediate', primary: true },
            { name: 'Chin-ups (Biceps)', difficulty: 'intermediate', primary: true },
        ],
    },

    // CORE
    core: {
        all: [
            { name: 'Planks', difficulty: 'beginner', primary: true },
            { name: 'Russian Twists', difficulty: 'beginner', primary: false },
            { name: 'Hanging Leg Raises', difficulty: 'advanced', primary: true },
            { name: 'Ab Wheel Rollouts', difficulty: 'advanced', primary: true },
            { name: 'Bicycle Crunches', difficulty: 'beginner', primary: false },
            { name: 'Mountain Climbers', difficulty: 'intermediate', primary: false },
        ],
    },

    // CARDIO
    cardio: {
        all: [
            { name: 'Treadmill Running', difficulty: 'beginner', primary: true },
            { name: 'Cycling', difficulty: 'beginner', primary: true },
            { name: 'Rowing Machine', difficulty: 'intermediate', primary: true },
            { name: 'Jump Rope', difficulty: 'intermediate', primary: true },
            { name: 'Burpees', difficulty: 'intermediate', primary: true },
            { name: 'High Knees', difficulty: 'beginner', primary: false },
        ],
    },
}

export class WorkoutPlanGenerator {
    private userProfile: UserProfile

    constructor(userProfile: UserProfile) {
        this.userProfile = userProfile
    }

    /**
     * Generate complete workout plan
     */
    generatePlan(): WorkoutPlan {
        const split = this.determineSplit()
        const difficulty = this.determineDifficulty()
        const weeklySchedule = this.generateWeeklySchedule(split)

        return {
            plan_name: this.generatePlanName(),
            goal: this.userProfile.fitness_goal,
            duration_weeks: 12,
            difficulty,
            weekly_schedule: weeklySchedule,
            progression_strategy: this.getProgressionStrategy(),
            deload_week: 4, // Every 4th week
            notes: this.generatePlanNotes(),
        }
    }

    /**
     * Determine workout split based on frequency
     */
    private determineSplit(): string {
        const days = this.userProfile.workout_days_per_week
        const goal = this.userProfile.fitness_goal

        if (goal === 'lose_weight') {
            return 'circuit' // High intensity circuits
        }

        if (goal === 'improve_endurance') {
            return 'cardio_focused'
        }

        if (days >= 6) {
            return 'push_pull_legs' // PPL split
        } else if (days >= 4) {
            return 'upper_lower' // Upper/Lower split
        } else if (days >= 3) {
            return 'full_body' // Full body 3x/week
        } else {
            return 'full_body' // 2x/week full body
        }
    }

    /**
     * Determine difficulty level
     */
    private determineDifficulty(): string {
        const activityLevel = this.userProfile.activity_level

        if (activityLevel === 'sedentary' || activityLevel === 'light') {
            return 'beginner'
        } else if (activityLevel === 'moderate' || activityLevel === 'active') {
            return 'intermediate'
        } else {
            return 'advanced'
        }
    }

    /**
     * Generate weekly workout schedule
     */
    private generateWeeklySchedule(split: string): WorkoutDay[] {
        const schedule: WorkoutDay[] = []
        const days = this.userProfile.workout_days_per_week
        const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

        switch (split) {
            case 'push_pull_legs':
                schedule.push(
                    this.createWorkoutDay('Monday', 'Push', ['chest', 'shoulders', 'arms']),
                    this.createWorkoutDay('Tuesday', 'Pull', ['back', 'arms']),
                    this.createWorkoutDay('Wednesday', 'Legs', ['legs', 'core']),
                    this.createWorkoutDay('Thursday', 'Push', ['chest', 'shoulders', 'arms']),
                    this.createWorkoutDay('Friday', 'Pull', ['back', 'arms']),
                    this.createWorkoutDay('Saturday', 'Legs', ['legs', 'core']),
                )
                break

            case 'upper_lower':
                schedule.push(
                    this.createWorkoutDay('Monday', 'Upper', ['chest', 'back', 'shoulders', 'arms']),
                    this.createWorkoutDay('Tuesday', 'Lower', ['legs', 'core']),
                    this.createWorkoutDay('Thursday', 'Upper', ['chest', 'back', 'shoulders', 'arms']),
                    this.createWorkoutDay('Friday', 'Lower', ['legs', 'core']),
                )
                break

            case 'full_body':
                const fullBodyDays = days === 2 ? ['Monday', 'Thursday'] : ['Monday', 'Wednesday', 'Friday']
                fullBodyDays.forEach(day => {
                    schedule.push(
                        this.createWorkoutDay(day, 'Full Body', ['chest', 'back', 'legs', 'shoulders', 'core'])
                    )
                })
                break

            case 'circuit':
                for (let i = 0; i < days; i++) {
                    schedule.push(
                        this.createCircuitWorkout(daysOfWeek[i])
                    )
                }
                break

            case 'cardio_focused':
                for (let i = 0; i < days; i++) {
                    schedule.push(
                        this.createCardioWorkout(daysOfWeek[i])
                    )
                }
                break
        }

        return schedule.slice(0, days)
    }

    /**
     * Create a workout day with exercises
     */
    private createWorkoutDay(day: string, workoutType: string, muscleGroups: string[]): WorkoutDay {
        const exercises: WorkoutExercise[] = []
        let order = 1

        muscleGroups.forEach(group => {
            const groupExercises = this.selectExercises(group, workoutType)
            groupExercises.forEach(ex => {
                exercises.push({
                    ...ex,
                    order: order++,
                })
            })
        })

        return {
            day,
            workout_type: workoutType,
            duration_minutes: this.userProfile.workout_duration_preference,
            focus: muscleGroups.join(', '),
            exercises,
        }
    }

    /**
     * Select exercises for a muscle group
     */
    private selectExercises(muscleGroup: string, workoutType: string): WorkoutExercise[] {
        const equipment = this.getEquipmentCategory()
        const difficulty = this.determineDifficulty()
        const goal = this.userProfile.fitness_goal

        // Get exercise pool
        let exercisePool = EXERCISE_TEMPLATES[muscleGroup as keyof typeof EXERCISE_TEMPLATES]?.[equipment] ||
            EXERCISE_TEMPLATES[muscleGroup as keyof typeof EXERCISE_TEMPLATES]?.['all'] || []

        // Filter by difficulty
        exercisePool = exercisePool.filter(ex =>
            ex.difficulty === difficulty ||
            (difficulty === 'intermediate' && ex.difficulty === 'beginner') ||
            (difficulty === 'advanced' && ex.difficulty !== 'beginner')
        )

        // Select exercises
        const primaryExercises = exercisePool.filter(ex => ex.primary)
        const accessoryExercises = exercisePool.filter(ex => !ex.primary)

        const selected: WorkoutExercise[] = []

        // Add 1-2 primary exercises
        const primaryCount = workoutType === 'Full Body' ? 1 : 2
        primaryExercises.slice(0, primaryCount).forEach(ex => {
            selected.push(this.createExerciseEntry(ex, goal, true))
        })

        // Add 1-2 accessory exercises
        const accessoryCount = workoutType === 'Full Body' ? 1 : 2
        accessoryExercises.slice(0, accessoryCount).forEach(ex => {
            selected.push(this.createExerciseEntry(ex, goal, false))
        })

        return selected
    }

    /**
     * Create exercise entry with sets/reps based on goal
     */
    private createExerciseEntry(exercise: any, goal: string, isPrimary: boolean): WorkoutExercise {
        let sets: number
        let reps: string
        let rest: number

        switch (goal) {
            case 'build_muscle':
                sets = isPrimary ? 4 : 3
                reps = '8-12'
                rest = isPrimary ? 90 : 60
                break

            case 'increase_strength':
                sets = isPrimary ? 5 : 3
                reps = isPrimary ? '4-6' : '6-8'
                rest = isPrimary ? 180 : 120
                break

            case 'lose_weight':
                sets = 3
                reps = '12-15'
                rest = 45
                break

            default:
                sets = 3
                reps = '10-12'
                rest = 60
        }

        return {
            exercise_id: 0, // Will be populated from database
            exercise_name: exercise.name,
            sets,
            reps,
            rest_seconds: rest,
            notes: exercise.difficulty === 'advanced' ? 'Focus on form. Use spotter if needed.' : '',
            order: 0, // Will be set by caller
        }
    }

    /**
     * Create circuit training workout
     */
    private createCircuitWorkout(day: string): WorkoutDay {
        const exercises: WorkoutExercise[] = [
            { exercise_id: 0, exercise_name: 'Burpees', sets: 3, reps: '15', rest_seconds: 30, notes: 'High intensity', order: 1 },
            { exercise_id: 0, exercise_name: 'Jump Squats', sets: 3, reps: '20', rest_seconds: 30, notes: '', order: 2 },
            { exercise_id: 0, exercise_name: 'Push-ups', sets: 3, reps: '15', rest_seconds: 30, notes: '', order: 3 },
            { exercise_id: 0, exercise_name: 'Mountain Climbers', sets: 3, reps: '30', rest_seconds: 30, notes: '', order: 4 },
            { exercise_id: 0, exercise_name: 'Plank', sets: 3, reps: '60s', rest_seconds: 30, notes: '', order: 5 },
        ]

        return {
            day,
            workout_type: 'Circuit',
            duration_minutes: 30,
            focus: 'Full body fat burning',
            exercises,
        }
    }

    /**
     * Create cardio-focused workout
     */
    private createCardioWorkout(day: string): WorkoutDay {
        const exercises: WorkoutExercise[] = [
            { exercise_id: 0, exercise_name: 'Treadmill Running', sets: 1, reps: '30 min', rest_seconds: 0, notes: 'Moderate pace', order: 1 },
            { exercise_id: 0, exercise_name: 'Jump Rope', sets: 3, reps: '3 min', rest_seconds: 60, notes: 'HIIT style', order: 2 },
        ]

        return {
            day,
            workout_type: 'Cardio',
            duration_minutes: 45,
            focus: 'Cardiovascular endurance',
            exercises,
        }
    }

    /**
     * Get equipment category
     */
    private getEquipmentCategory(): string {
        const equipment = this.userProfile.available_equipment

        if (equipment === 'bodyweight_only') return 'bodyweight'
        if (equipment === 'gym') return 'gym'
        return 'home'
    }

    /**
     * Generate plan name
     */
    private generatePlanName(): string {
        const goalNames: Record<string, string> = {
            build_muscle: 'Muscle Building',
            lose_weight: 'Fat Loss',
            increase_strength: 'Strength Gain',
            improve_endurance: 'Endurance',
            maintain_fitness: 'Maintenance',
        }

        const goalName = goalNames[this.userProfile.fitness_goal] || 'Fitness'
        return `${goalName} - ${this.userProfile.workout_days_per_week} Day Program`
    }

    /**
     * Get progression strategy
     */
    private getProgressionStrategy(): string {
        const goal = this.userProfile.fitness_goal

        if (goal === 'increase_strength') {
            return 'Add 2.5-5kg every week on compound lifts. Deload every 4th week.'
        } else if (goal === 'build_muscle') {
            return 'Increase reps or weight when you can complete all sets with good form. Progress every 1-2 weeks.'
        } else if (goal === 'lose_weight') {
            return 'Increase circuit rounds or decrease rest time as fitness improves.'
        } else {
            return 'Progressive overload: increase weight or reps every 2 weeks.'
        }
    }

    /**
     * Generate plan notes
     */
    private generatePlanNotes(): string[] {
        return [
            'Always warm up for 5-10 minutes before starting',
            'Focus on proper form over heavy weight',
            'Rest 1-2 days between workouts for the same muscle group',
            'Stay hydrated throughout your workout',
            'Cool down and stretch after each session',
            'Track your progress and adjust weights accordingly',
            'Listen to your body and rest when needed',
        ]
    }
}

/**
 * Generate workout plan for user
 */
export function generateWorkoutPlan(userProfile: UserProfile): WorkoutPlan {
    const generator = new WorkoutPlanGenerator(userProfile)
    return generator.generatePlan()
}
