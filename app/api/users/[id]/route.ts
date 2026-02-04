import { NextRequest, NextResponse } from 'next/server'
import { selectQuery, executeMutation } from '@/lib/d1'
import { calculateBMR, calculateTDEE, calculateMacros } from '@/lib/nutrition'
import { z } from 'zod'

export const runtime = 'edge'

// --- 1. Validation Schema (Partial Update) ---
// .partial() allows the frontend to send just "weight" without sending everything else
const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  age: z.number().min(10).max(120).optional(),
  height: z.number().min(50).max(300).optional(),
  weight: z.number().min(20).max(300).optional(),
  target_weight: z.number().min(20).max(300).optional(),
  activity_level: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']).optional(),
  primary_goal: z.enum(['muscle_building', 'fat_loss', 'maintenance', 'endurance', 'strength']).optional(),
  dietary_preference: z.string().optional(),
  workout_days_per_week: z.number().min(1).max(7).optional(),
  preferred_workout_time: z.enum(['morning', 'afternoon', 'evening']).optional(),
  wake_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
  sleep_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
  daily_water_goal: z.number().min(1).max(50).optional(),
}).partial()

// ==================================================================
// GET: Fetch User Profile
// ==================================================================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = parseInt(id)

    if (isNaN(userId)) {
      return NextResponse.json({ success: false, error: 'Invalid user ID' }, { status: 400 })
    }

    const users = await selectQuery('SELECT * FROM users WHERE id = ?', [userId])

    if (users.length === 0) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    // Security: Remove password before returning
    const { password_hash, ...safeUser } = users[0]

    return NextResponse.json({ success: true, data: safeUser })

  } catch (error) {
    console.error('API Error [GET /users/:id]:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}

// ==================================================================
// PUT: Update Profile & Recalculate Plan
// ==================================================================
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = parseInt(id)

    if (isNaN(userId)) {
      return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 })
    }

    // A. Validate Input
    const body = await request.json()
    const validation = updateUserSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: validation.error.issues[0].message
      }, { status: 400 })
    }

    const updates = validation.data

    // B. Fetch Current Data (Required for merging)
    const existingUsers = await selectQuery('SELECT * FROM users WHERE id = ?', [userId])
    if (existingUsers.length === 0) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }
    const currentUser = existingUsers[0]

    // C. Merge Logic (New Data > Old Data)
    const name = updates.name ?? currentUser.name
    const gender = updates.gender ?? currentUser.gender
    const age = updates.age ?? currentUser.age
    const height = updates.height ?? currentUser.height
    const weight = updates.weight ?? currentUser.weight
    const target_weight = updates.target_weight ?? currentUser.target_weight
    const primary_goal = updates.primary_goal ?? currentUser.primary_goal ?? 'maintenance'
    const activity_level = updates.activity_level ?? currentUser.activity_level ?? 'sedentary'
    const dietary_preference = updates.dietary_preference ?? currentUser.dietary_preference ?? 'none'
    const workout_days_per_week = updates.workout_days_per_week ?? currentUser.workout_days_per_week ?? 3
    const preferred_workout_time = updates.preferred_workout_time ?? currentUser.preferred_workout_time ?? 'morning'
    const wake_time = updates.wake_time ?? currentUser.wake_time ?? '07:00'
    const sleep_time = updates.sleep_time ?? currentUser.sleep_time ?? '23:00'
    const daily_water_goal = updates.daily_water_goal ?? currentUser.daily_water_goal ?? 8

    // D. Intelligence: Recalculate Nutrition
    const bmr = calculateBMR(gender as any, weight, height, age)
    const tdee = calculateTDEE(bmr, activity_level)
    const macros = calculateMacros(tdee, primary_goal)
    const daily_calorie_goal = macros.targetCalories

    // E. Execute Update
    const sql = `
      UPDATE users
      SET
        name = ?, gender = ?, age = ?, height = ?, weight = ?, target_weight = ?,
        primary_goal = ?, activity_level = ?, dietary_preference = ?,
        workout_days_per_week = ?, preferred_workout_time = ?,
        wake_time = ?, sleep_time = ?, daily_water_goal = ?,
        daily_calorie_goal = ?, daily_protein_goal = ?, daily_carbs_goal = ?, daily_fats_goal = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `
    const paramsList = [
      name, gender, age, height, weight, target_weight,
      primary_goal, activity_level, dietary_preference,
      workout_days_per_week, preferred_workout_time,
      wake_time, sleep_time, daily_water_goal,
      daily_calorie_goal, macros.proteinGrams, macros.carbsGrams, macros.fatGrams,
      userId
    ]

    const changes = await executeMutation(sql, paramsList)

    if (changes > 0) {
      const updatedUsers = await selectQuery('SELECT * FROM users WHERE id = ?', [userId])
      const { password_hash, ...newResponseData } = updatedUsers[0]

      return NextResponse.json({
        success: true,
        data: newResponseData,
        new_plan: macros
      })
    } else {
      return NextResponse.json({ success: false, error: 'Update failed' }, { status: 500 })
    }

  } catch (error) {
    console.error('API Error [PUT /users/:id]:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}

// ==================================================================
// DELETE: Remove User
// ==================================================================
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = parseInt(id)

    if (isNaN(userId)) {
      return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 })
    }

    const changes = await executeMutation('DELETE FROM users WHERE id = ?', [userId])

    if (changes > 0) {
      return NextResponse.json({ success: true, message: 'User account deleted' })
    } else {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

  } catch (error) {
    console.error('API Error [DELETE /users/:id]:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}