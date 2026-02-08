// lib/types.ts - Central TypeScript interfaces

export interface User {
    id?: number;
    email: string;
    name: string;
    password_hash?: string;
    created_at?: string;
    updated_at?: string;

    // Profile
    age?: number;
    gender?: 'male' | 'female' | 'other' | string;
    height?: number;
    weight?: number;
    target_weight?: number;

    // Goals
    primary_goal?: 'lose_weight' | 'gain_muscle' | 'maintain' | string;
    fitness_goal?: string; // Legacy mapping
    activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | string;
    workout_days_per_week?: number;

    // Nutrition
    daily_calorie_goal?: number;
    daily_protein_goal?: number;
    daily_carbs_goal?: number;
    daily_fats_goal?: number;
    daily_water_goal?: number;
    dietary_preference?: string;
    target_calories?: number; // Legacy mapping

    // Schedule
    wake_time?: string;
    sleep_time?: string;
    preferred_workout_time?: 'morning' | 'afternoon' | 'evening' | string;
}

export interface SessionPayload {
    user: User;
    expires: string;
    iat?: number;
    exp?: number;
}

export interface QueryResult<T = any> {
    success: boolean;
    data?: T[];
    error?: string;
}

export interface MutationResult {
    success: boolean;
    changes?: number;
    lastId?: number;
    error?: string;
}

export interface DailyNutrition {
    calories_consumed: number;
    calories_target: number;
    protein_consumed: number;
    protein_target: number;
    carbs_consumed: number;
    carbs_target: number;
    fats_consumed: number;
    fats_target: number;
    water_ml: number;
    water_target: number;
    meals_logged: number;
    meals_planned: number;
}
