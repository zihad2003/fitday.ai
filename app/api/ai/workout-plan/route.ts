import { NextRequest, NextResponse } from 'next/server'
import { generateWorkoutPlan } from '@/lib/ai-workout-generator'
import { selectQuery } from '@/lib/d1'
import { SubscriptionService } from '@/lib/subscription'

export const runtime = 'edge'

/**
 * AI Workout Plan API
 * POST /api/ai/workout-plan
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

        // Check subscription & consume credit
        const { allowed, remaining } = await SubscriptionService.consumeCredit(Number(userId))
        if (!allowed) {
            return NextResponse.json({
                success: false,
                error: 'AI Credits exhausted. Please upgrade to continue.',
                code: 'CREDIT_LIMIT_REACHED'
            }, { status: 402 })
        }

        const user = users[0] as any

        // Map DB user to WorkoutProfile
        const profile = {
            goal: (user.goal || 'maintain') as any,
            fitnessLevel: (user.activity_level === 'sedentary' ? 'beginner' : user.activity_level === 'very_active' ? 'advanced' : 'intermediate') as any,
            daysPerWeek: 4, // Default
            sessionDuration: 60, // Default minutes
            equipment: user.available_equipment ? JSON.parse(user.available_equipment) : [],
        }

        // Generate smart plan
        const workoutPlan = await generateWorkoutPlan(profile)

        return NextResponse.json({
            success: true,
            data: workoutPlan,
            profile_used: {
                goal: profile.goal,
                level: profile.fitnessLevel
            }
        })

    } catch (error: any) {
        console.error('Workout Plan API Error:', error)
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to generate workout plan' },
            { status: 500 }
        )
    }
}
