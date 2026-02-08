import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail, createUser } from '@/lib/database'
import { createPasswordHash, sanitizeUser } from '@/lib/auth-utils'
import { createSession } from '@/lib/session-manager'
import { User } from '@/lib/types'
import { calculateBMR, calculateTDEE, calculateMacros } from '@/lib/nutrition'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
    try {
        // Parse request body
        const body = await request.json() as any
        const {
            email,
            password,
            name,
            age,
            gender,
            height,
            weight,
            goal,
            activity_level
        } = body

        // Validate required fields
        if (!email || !password || !name) {
            return NextResponse.json(
                { success: false, error: 'Email, password, and name are required' },
                { status: 400 }
            )
        }

        console.log('[Register] Attempting registration for:', email)

        // Check if user already exists
        const existingUser = await getUserByEmail(email)

        if (existingUser) {
            console.log('[Register] Email already exists:', email)
            return NextResponse.json(
                { success: false, error: 'Email already registered' },
                { status: 409 }
            )
        }

        // Hash password
        const password_hash = await createPasswordHash(password)

        // Calculate nutrition if profile data provided
        let daily_calorie_goal, daily_protein_goal, daily_carbs_goal, daily_fats_goal
        if (age && gender && height && weight && activity_level && goal) {
            const bmr = calculateBMR(gender, weight, height, age)
            const tdee = calculateTDEE(bmr, activity_level)
            const macros = calculateMacros(tdee, goal)
            daily_calorie_goal = macros.targetCalories
            daily_protein_goal = macros.proteinGrams
            daily_carbs_goal = macros.carbGrams
            daily_fats_goal = macros.fatGrams
        }

        // Create user
        const result = await createUser({
            email,
            password_hash,
            name,
            age: parseInt(age) || undefined,
            gender,
            height: parseFloat(height) || undefined,
            weight: parseFloat(weight) || undefined,
            primary_goal: goal,
            activity_level,
            daily_calorie_goal,
            daily_protein_goal,
            daily_carbs_goal,
            daily_fats_goal
        })

        if (!result.success) {
            console.error('[Register] Failed to create user:', result.error)
            return NextResponse.json(
                { success: false, error: 'Registration failed. Please try again.' },
                { status: 500 }
            )
        }

        // Get the created user
        const newUser = await getUserByEmail(email)

        if (!newUser) {
            console.error('[Register] User created but not found')
            return NextResponse.json(
                { success: false, error: 'Registration failed. Please try again.' },
                { status: 500 }
            )
        }

        // Create session
        const safeUser = sanitizeUser(newUser)
        await createSession(safeUser)

        console.log('✅ [Register] Success for:', email)

        return NextResponse.json({
            success: true,
            message: 'Registration successful',
            user: safeUser
        }, { status: 201 })

    } catch (error: any) {
        console.error('❌ [Register] Error:', error)
        return NextResponse.json(
            { success: false, error: 'Registration failed. Please try again.' },
            { status: 500 }
        )
    }
}
