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

export function generateDailySchedule(user: UserProfile): ScheduleItem[] {
    const schedule: ScheduleItem[] = []
    let currentTime = setMinutes(setHours(new Date(), 7), 0) // Start at 7:00 AM

    // 1. Morning Routine
    schedule.push({
        id: 'bio-1',
        time: format(currentTime, 'HH:mm'),
        type: 'bio',
        title: 'Metabolic Wake-Up',
        description: 'Drink 500ml water + pinch of salt + lemon. Stretch for 5 mins.'
    })

    // 2. Breakfast (8:00 AM)
    currentTime = addMinutes(currentTime, 60)
    const bMeal = BANGLA_MEALS.breakfast[Math.floor(Math.random() * BANGLA_MEALS.breakfast.length)]
    schedule.push({
        id: 'meal-1',
        time: format(currentTime, 'HH:mm'),
        type: 'meal',
        title: 'Breakfast Protocol',
        description: bMeal.desc,
        calories: bMeal.cal,
        protein: bMeal.p
    })

    // 3. Hydration (11:00 AM)
    currentTime = addMinutes(currentTime, 180) // 3 hours later
    schedule.push({
        id: 'hydro-1',
        time: format(currentTime, 'HH:mm'),
        type: 'hydration',
        title: 'Hydration Check',
        description: 'Drink 500ml water. Essential for cognitive function.'
    })

    // 4. Lunch (1:30 PM)
    currentTime = addMinutes(currentTime, 150)
    const lMeal = BANGLA_MEALS.lunch[Math.floor(Math.random() * BANGLA_MEALS.lunch.length)]
    schedule.push({
        id: 'meal-2', // Lunch
        time: "13:30",
        type: 'meal',
        title: 'Nutrient Reload (Lunch)',
        description: lMeal.desc,
        calories: lMeal.cal,
        protein: lMeal.p
    })

    // 5. Afternoon Snack (4:30 PM)
    schedule.push({
        id: 'meal-3', // Snack
        time: "16:30",
        type: 'meal',
        title: 'Energy Bridge',
        description: BANGLA_MEALS.snack[Math.floor(Math.random() * BANGLA_MEALS.snack.length)].desc,
        calories: 150
    })

    // 6. Workout (6:00 PM)
    schedule.push({
        id: 'workout-1',
        time: "18:00",
        type: 'workout',
        title: WORKOUTS[user.goal].title,
        description: WORKOUTS[user.goal].desc
    })

    // 7. Dinner (8:30 PM)
    const dMeal = BANGLA_MEALS.dinner[Math.floor(Math.random() * BANGLA_MEALS.dinner.length)]
    schedule.push({
        id: 'meal-4', // Dinner
        time: "20:30",
        type: 'meal',
        title: 'Recovery Meal (Dinner)',
        description: dMeal.desc,
        calories: dMeal.cal
    })

    // 8. Sleep Prep (11:00 PM)
    schedule.push({
        id: 'sleep-1',
        time: "23:00",
        type: 'sleep',
        title: 'System Shutdown',
        description: 'No screens. Dark room. ensure 7-8h sleep for muscle recovery.'
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
