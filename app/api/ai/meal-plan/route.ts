import { NextRequest, NextResponse } from 'next/server'
import { generateMealPlan, calculateCalorieNeeds } from '@/lib/ai-meal-planner'
import { selectQuery } from '@/lib/d1'

export const runtime = 'edge'

/**
 * AI Meal Plan API
 * POST /api/ai/meal-plan
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as { userId: string | number }
        const { userId } = body

        if (!userId) {
            return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 })
        }

        // Fetch user profile from DB
        const users = await selectQuery('SELECT * FROM users WHERE id = ?', [Number(userId)])
        if (users.length === 0) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
        }

        const user = users[0] as any

        // Map DB user to UserProfile for meal planner
        const profile = {
            goal: (user.goal || 'maintain') as any,
            weight: user.weight_kg || 70,
            height: user.height_cm || 170,
            age: user.age || 25,
            gender: (user.gender || 'male') as any,
            activityLevel: (user.activity_level || 'moderate') as any,
            dietaryRestrictions: user.dietary_restrictions ? JSON.parse(user.dietary_restrictions) : [],
            preferences: user.preferences ? JSON.parse(user.preferences) : []
        }

        // Generate smart plan
        const mealPlan = generateMealPlan(profile)

        return NextResponse.json({
            success: true,
            data: mealPlan,
            profile_used: {
                goal: profile.goal,
                daily_calories: mealPlan.totalCalories
            }
        })

    } catch (error: any) {
        console.error('Meal Plan API Error:', error)
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to generate meal plan' },
            { status: 500 }
        )
    }
}
