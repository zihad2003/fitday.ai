import { addMinutes, format, parse, setHours, setMinutes } from 'date-fns'

export interface ScheduleItem {
    id: string
    time: string // 24h format "HH:mm"
    type: 'meal' | 'workout' | 'hydration' | 'sleep' | 'bio'
    title: string
    description: string
    calories?: number
    protein?: number
    isCompleted?: boolean
}

export interface UserProfile {
    name: string
    goal: 'lose_weight' | 'maintain' | 'gain_muscle'
    activity_level: string
    target_calories: number
    gender: string
    weight_kg: number
}

// BMR Factors & Logic
const MEAL_RATIOS = {
    lose_weight: { b: 0.25, l: 0.35, d: 0.25, s: 0.15 },
    maintain: { b: 0.3, l: 0.35, d: 0.25, s: 0.1 },
    gain_muscle: { b: 0.25, l: 0.3, d: 0.25, s: 0.1, pre: 0.05, post: 0.05 }
}

const BANGLA_MEALS = {
    breakfast: [
        { name: "Sourdough Ruti & Omelette", cal: 350, p: 18, desc: "2 brown ruti with 2 egg whites, 1 yolk onion omelette." },
        { name: "Oats Khichuri", cal: 400, p: 15, desc: "Oats cooked with moong dal and mixed vegetables." },
        { name: "Brown Bread & Peanut Butter", cal: 380, p: 14, desc: "2 slices toasted with 2 tbsp peanut butter." }
    ],
    lunch: [
        { name: "Rice & Fish Curry", cal: 550, p: 35, desc: "1 cup steamed rice, 150g Rui/Katla fish bhuna, leafy greens (shak)." },
        { name: "Chicken Bhuna & Rice", cal: 600, p: 40, desc: "1 cup rice, 150g chicken curry (light oil), cucumber salad." },
        { name: "Dal & Dim Bhuna", cal: 500, p: 25, desc: "1 cup rice, thick mosoor dal, 2 egg curry." }
    ],
    dinner: [
        { name: "Ruti & Grilled Chicken", cal: 400, p: 35, desc: "2 ruti with 150g grilled chicken piece." },
        { name: "Mixed Vegetable & Chicken Salad", cal: 350, p: 30, desc: "Bowl of chickpea, cucumber, tomato and boiled chicken." },
        { name: "Atta Ruti & Sabji", cal: 300, p: 12, desc: "3 ruti with mixed vegetable labra (minimal oil)." }
    ],
    snack: [
        { name: "Green Tea & Almonds", cal: 150, p: 6, desc: "Green tea with 10 almonds." },
        { name: "Seasonal Fruit", cal: 100, p: 1, desc: "1 Guava or Apple." },
        { name: "Yogurt (Tok Doi)", cal: 120, p: 8, desc: "1 cup low fat yogurt with chia seeds." }
    ]
}

// Definitions
export interface Exercise {
    name: string
    sets: string
    reps: string
    rest: string
    gif?: string
    tags: string[]
}

export interface WorkoutRoutine {
    title: string
    focus: string
    duration: string
    exercises: Exercise[]
}

const WORKOUT_ROUTINES: Record<string, WorkoutRoutine> = {
    lose_weight: {
        title: "High Intensity Burn",
        focus: "Cardio & Endurance",
        duration: "45 Min",
        exercises: [
            { name: "Jumping Jacks", sets: "3", reps: "60 sec", rest: "30s", tags: ["Cardio", "Warmup"], gif: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Jumping-Jack.gif" },
            { name: "Burpees", sets: "4", reps: "15", rest: "45s", tags: ["Full Body", "HIIT"], gif: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Burpee.gif" },
            { name: "Mountain Climbers", sets: "3", reps: "45 sec", rest: "30s", tags: ["Core", "Cardio"], gif: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Mountain-Climber.gif" },
            { name: "High Knees", sets: "3", reps: "60 sec", rest: "45s", tags: ["Cardio", "Legs"], gif: "https://fitnessprogramer.com/wp-content/uploads/2021/02/High-Knee-Run.gif" }
        ]
    },
    maintain: {
        title: "Functional Strength",
        focus: "Mobility & Strength",
        duration: "40 Min",
        exercises: [
            { name: "Push Ups", sets: "3", reps: "12-15", rest: "60s", tags: ["Chest", "Arms"], gif: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Push-Up.gif" },
            { name: "Bodyweight Squats", sets: "4", reps: "20", rest: "60s", tags: ["Legs", "Glutes"], gif: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Squat.gif" },
            { name: "Plank Hold", sets: "3", reps: "60 sec", rest: "45s", tags: ["Core", "Stability"], gif: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Plank.gif" },
            { name: "Lunges", sets: "3", reps: "12 / leg", rest: "60s", tags: ["Legs", "Balance"], gif: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Lunges.gif" }
        ]
    },
    gain_muscle: {
        title: "Hypertrophy Push",
        focus: "Muscle Growth",
        duration: "60 Min",
        exercises: [
            { name: "Bench Press", sets: "4", reps: "8-12", rest: "90s", tags: ["Chest", "Compound"], gif: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Bench-Press.gif" },
            { name: "Dumbbell Shoulder Press", sets: "3", reps: "10-12", rest: "60s", tags: ["Shoulders", "Hypertrophy"], gif: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Shoulder-Press.gif" },
            { name: "Incline Flys", sets: "3", reps: "12-15", rest: "60s", tags: ["Chest", "Isolation"], gif: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Incline-Dumbbell-Fly.gif" },
            { name: "Tricep Dips", sets: "3", reps: "Failure", rest: "60s", tags: ["Arms", "Bodyweight"], gif: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Triceps-Dips.gif" }
        ]
    }
}

const WORKOUTS = {
    lose_weight: { title: "HIIT Cardio Burn", desc: "45 mins: Jumping Jacks, Burpees, Mountain Climbers. Keep heart rate > 140." },
    maintain: { title: "Functional Strength", desc: "45 mins: Pushups, Squats, Lunges, Plank. 3 sets of 12 reps." },
    gain_muscle: { title: "Hypertrophy Push/Pull", desc: "60 mins: Heavy compound movements. Bench Press, Deadlift, Overhead Press." }
}

export function getFullDailyPlan(user: UserProfile) {
    // 1. Get Meals
    const bMeal = BANGLA_MEALS.breakfast[Math.floor(Math.random() * BANGLA_MEALS.breakfast.length)]
    const lMeal = BANGLA_MEALS.lunch[Math.floor(Math.random() * BANGLA_MEALS.lunch.length)]
    const dMeal = BANGLA_MEALS.dinner[Math.floor(Math.random() * BANGLA_MEALS.dinner.length)]
    const sMeal = BANGLA_MEALS.snack[Math.floor(Math.random() * BANGLA_MEALS.snack.length)]

    // 2. Get Workout
    // Default to maintain if goal not found
    const goalKey = WORKOUT_ROUTINES[user.goal] ? user.goal : 'maintain'
    const workout = WORKOUT_ROUTINES[goalKey]

    return {
        meals: {
            breakfast: bMeal,
            lunch: lMeal,
            dinner: dMeal,
            snack: sMeal
        },
        workout: workout
    }
}

export interface SchedulePreferences {
    wakeTime: string // "07:00"
    bedTime: string // "23:00"
    workoutTime: string // "18:00"
}

export function generateDailySchedule(user: UserProfile, prefs?: SchedulePreferences): ScheduleItem[] {
    const schedule: ScheduleItem[] = []

    // Defaults
    const wakeTimeStr = prefs?.wakeTime || "07:00"
    const bedTimeStr = prefs?.bedTime || "23:00"
    const workoutTimeStr = prefs?.workoutTime || "18:00"

    const today = new Date()
    const wakeDate = parse(wakeTimeStr, 'HH:mm', today)
    const bedDate = parse(bedTimeStr, 'HH:mm', today)
    const workoutDate = parse(workoutTimeStr, 'HH:mm', today)

    // Helper to format
    const fmt = (d: Date) => format(d, 'HH:mm')

    // 1. Wake Up Routine
    schedule.push({
        id: 'bio-wake',
        time: fmt(wakeDate),
        type: 'bio',
        title: 'Metabolic Wake-Up',
        description: 'Hydrate immediately: 500ml water + pinch of salt. 5 mins light mobility.'
    })

    // 2. Schedule Workout
    // We add workout now so we can schedule meals around it
    const workoutDurationMins = 60
    const workoutEnd = addMinutes(workoutDate, workoutDurationMins)

    schedule.push({
        id: 'workout-main',
        time: fmt(workoutDate),
        type: 'workout',
        title: WORKOUTS[user.goal]?.title || "Daily Training",
        description: WORKOUTS[user.goal]?.desc || "Complete your assigned workout session."
    })

    // 3. Smart Meal Scheduling
    // Strategy: Breakfast 45m after wake. Lunch 4h after. Dinner 3h before bed.

    let breakfastTime = addMinutes(wakeDate, 45)
    let lunchTime = addMinutes(breakfastTime, 240) // +4 hours
    let dinnerTime = addMinutes(bedDate, -150) // -2.5 hours before bed

    // Conflict Resolution: Workout vs Meals
    // Pre-Workout: Ensure fed 1.5h before workout if possible
    const preWorkoutTarget = addMinutes(workoutDate, -90)

    // Post-Workout: Ensure fed within 45 mins
    const postWorkoutTarget = addMinutes(workoutEnd, 30)

    // -- MEAL PLACEMENT --

    // Breakfast
    const bMeal = BANGLA_MEALS.breakfast[Math.floor(Math.random() * BANGLA_MEALS.breakfast.length)]
    schedule.push({
        id: 'meal-breakfast',
        time: fmt(breakfastTime),
        type: 'meal',
        title: 'Breakfast',
        description: bMeal.desc,
        calories: bMeal.cal,
        protein: bMeal.p
    })

    // Lunch
    const lMeal = BANGLA_MEALS.lunch[Math.floor(Math.random() * BANGLA_MEALS.lunch.length)]
    schedule.push({
        id: 'meal-lunch',
        time: fmt(lunchTime),
        type: 'meal',
        title: 'Lunch',
        description: lMeal.desc,
        calories: lMeal.cal,
        protein: lMeal.p
    })

    // Afternoon/Pre-Workout Snack
    // If lunch is far from workout (>3h), add snack
    const minutesLunchToWorkout = (workoutDate.getTime() - lunchTime.getTime()) / 60000

    if (minutesLunchToWorkout > 180) {
        // Add Pre-workout snack
        const sMeal = BANGLA_MEALS.snack[Math.floor(Math.random() * BANGLA_MEALS.snack.length)]
        schedule.push({
            id: 'meal-snack',
            time: fmt(addMinutes(workoutDate, -60)), // 1 hour before
            type: 'meal',
            title: 'Pre-Workout Fuel',
            description: sMeal.desc,
            calories: sMeal.cal
        })
    }

    // Dinner / Post-Workout
    // If workout is late evening, Dinner IS the post workout
    // If workout is early (e.g. morning), Dinner is separate

    // Check gap between Workout End and Dinner
    const minutesWorkoutToDinner = (dinnerTime.getTime() - workoutEnd.getTime()) / 60000

    const dMeal = BANGLA_MEALS.dinner[Math.floor(Math.random() * BANGLA_MEALS.dinner.length)]

    if (minutesWorkoutToDinner > 90) {
        // Gap is big, need immediate post-workout recovery
        schedule.push({
            id: 'bio-recovery',
            time: fmt(addMinutes(workoutEnd, 15)),
            type: 'bio',
            title: 'Post-Workout Recovery',
            description: 'Protein Shake or 3 egg whites immediately.'
        })
        schedule.push({
            id: 'meal-dinner',
            time: fmt(dinnerTime),
            type: 'meal',
            title: 'Dinner',
            description: dMeal.desc,
            calories: dMeal.cal
        })
    } else {
        // Dinner serves as post-workout
        schedule.push({
            id: 'meal-dinner',
            time: fmt(dinnerTime < workoutEnd ? addMinutes(workoutEnd, 30) : dinnerTime), // Ensure it's after workout
            type: 'meal',
            title: 'Dinner (Recovery)',
            description: dMeal.desc,
            calories: dMeal.cal
        })
    }

    // Hydration Reminders (Slot into gaps)
    const midMorning = addMinutes(breakfastTime, 120) // 2h after breakfast
    if (Math.abs(midMorning.getTime() - workoutDate.getTime()) > 3600000) { // Don't clash with workout
        schedule.push({
            id: 'hydro-mid',
            time: fmt(midMorning),
            type: 'hydration',
            title: 'Hydration',
            description: 'Drink 500ml water.'
        })
    }

    // Sleep
    schedule.push({
        id: 'bio-sleep',
        time: fmt(bedDate),
        type: 'sleep',
        title: 'Sleep Protocol',
        description: 'Screens off. Dark room.'
    })

    return schedule.sort((a, b) => a.time.localeCompare(b.time))
}

export function getCurrentAction(schedule: ScheduleItem[]): ScheduleItem | null {
    const now = new Date()
    const currentHM = format(now, "HH:mm")

    // Find the event closest to now (but not passed by more than 1 hour) or upcoming
    // Simple logic: Find first event where time > now - 30 mins

    // For demo, let's just find the next upcoming one
    return schedule.find(item => item.time >= currentHM) || schedule[0]
}
