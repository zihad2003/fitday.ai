// app/api/users/[id]/route.ts - Individual User Operations with Intelligence
import { NextRequest, NextResponse } from 'next/server'
import { selectQuery, executeMutation } from '@/lib/d1'
import { calculateBMR, calculateTDEE, calculateMacros } from '@/lib/nutrition'

// GET /api/users/[id] - Get a specific user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id)
    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID' },
        { status: 400 }
      )
    }

    const users = await selectQuery('SELECT * FROM users WHERE id = ?', [userId])
    if (users.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: users[0] })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

// PUT /api/users/[id] - Update user & Recalculate Nutrition Plan
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id)
    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    
    // ১. আগের ডাটা নিয়ে আসা (যাতে কোনো ফিল্ড মিসিং থাকলে সমস্যা না হয়)
    const existingUsers = await selectQuery('SELECT * FROM users WHERE id = ?', [userId])
    if (existingUsers.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }
    const currentUser = existingUsers[0]

    // ২. নতুন ডাটার সাথে পুরনো ডাটা মার্জ করা
    // লক্ষ্য করুন: ফ্রন্টেন্ড পাঠাতে পারে 'height' কিন্তু ডিবিতে আছে 'height_cm'
    const name = body.name || currentUser.name
    const gender = body.gender || currentUser.gender
    const age = body.age || currentUser.age
    const height = body.height || currentUser.height_cm // Handle naming mismatch
    const weight = body.weight || currentUser.weight_kg // Handle naming mismatch
    const goal = body.goal || currentUser.goal
    const activity_level = body.activity_level || currentUser.activity_level || 'sedentary'

    // ৩. ইন্টেলিজেন্স লজিক আবার রান করা (Recalculate)
    const bmr = calculateBMR(gender, weight, height, age)
    const tdee = calculateTDEE(bmr, activity_level)
    const macros = calculateMacros(tdee, goal)
    const targetCalories = macros.targetCalories

    // ৪. আপডেট কোয়েরি (নতুন স্কিমা অনুযায়ী)
    const sql = `
      UPDATE users
      SET name = ?, gender = ?, age = ?, height_cm = ?, weight_kg = ?, activity_level = ?, goal = ?, target_calories = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `
    const queryParams = [name, gender, age, height, weight, activity_level, goal, targetCalories, userId]
    
    const changes = await executeMutation(sql, queryParams)

    if (changes > 0) {
      // ৫. আপডেটেড ইউজার রিটার্ন করা
      const updatedUsers = await selectQuery('SELECT * FROM users WHERE id = ?', [userId])
      return NextResponse.json({ 
        success: true, 
        data: updatedUsers[0],
        new_plan: macros // ফ্রন্টেন্ডে দেখানোর জন্য নতুন প্ল্যান
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to update user' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

// DELETE /api/users/[id] - Delete a specific user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id)
    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID' },
        { status: 400 }
      )
    }

    const changes = await executeMutation('DELETE FROM users WHERE id = ?', [userId])

    if (changes > 0) {
      return NextResponse.json({ success: true, message: 'User deleted successfully' })
    } else {
      return NextResponse.json(
        { success: false, error: 'User not found or failed to delete' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}