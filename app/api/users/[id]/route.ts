import { NextRequest, NextResponse } from 'next/server'
import { selectQuery, executeMutation } from '@/lib/d1'
import { calculateBMR, calculateTDEE, calculateMacros } from '@/lib/nutrition'
import { z } from 'zod'

export const runtime = 'edge'

// --- 1. Validation Schema (Partial Update) ---
// .partial() allows the frontend to send just "weight" without sending everything else
const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  gender: z.enum(['male', 'female']).optional(),
  age: z.number().min(10).max(120).optional(),
  height: z.number().min(50).max(300).optional(), // Maps to height_cm
  weight: z.number().min(20).max(300).optional(), // Maps to weight_kg
  activity_level: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']).optional(),
  goal: z.enum(['lose', 'maintain', 'gain']).optional(),
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

    // Security: Remove password/salt before returning
    const { password, salt, ...safeUser } = users[0]

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
    // Handle specific mapping: frontend 'height' -> db 'height_cm'
    const height = updates.height ?? currentUser.height_cm 
    const weight = updates.weight ?? currentUser.weight_kg
    const goal = updates.goal ?? currentUser.goal
    const activity_level = updates.activity_level ?? currentUser.activity_level ?? 'sedentary'

    // D. Intelligence: Recalculate Nutrition
    // We strictly use the helper functions from lib/nutrition
    const bmr = calculateBMR(gender, weight, height, age)
    const tdee = calculateTDEE(bmr, activity_level)
    const macros = calculateMacros(tdee, goal)
    const targetCalories = macros.targetCalories

    // E. Execute Update
    const sql = `
      UPDATE users
      SET name = ?, gender = ?, age = ?, height_cm = ?, weight_kg = ?, activity_level = ?, goal = ?, target_calories = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `
    const paramsList = [name, gender, age, height, weight, activity_level, goal, targetCalories, userId]
    
    const changes = await executeMutation(sql, paramsList)

    if (changes > 0) {
      // Return updated profile + the new calculated macros
      const { password, salt, ...updatedProfile } = currentUser // reuse safe fields
      
      // Update the safe profile object with new values before returning
      // (saves a database round-trip read)
      const newResponseData = {
        ...updatedProfile,
        name, gender, age, height_cm: height, weight_kg: weight, activity_level, goal, target_calories: targetCalories
      }

      return NextResponse.json({ 
        success: true, 
        data: newResponseData,
        new_plan: macros // 
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