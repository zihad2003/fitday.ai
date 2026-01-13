import { NextRequest, NextResponse } from 'next/server'
import { executeMutation } from '@/lib/d1'
import { z } from 'zod'

export const runtime = 'edge'

// --- FIX 1: Use Standard Zod Boolean (No Arguments) ---
// This guarantees compatibility and removes the red line.
const updateSchema = z.object({
  completed: z.boolean() 
})

// ==================================================================
// PUT: Update Meal Status
// ==================================================================
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const mealId = parseInt(id)

    if (isNaN(mealId)) {
      return NextResponse.json({ success: false, error: 'Invalid ID format' }, { status: 400 })
    }

    const body = await request.json()
    
    // Validate
    const validation = updateSchema.safeParse(body)

    if (!validation.success) {
      // --- FIX 2: Custom Error Logic Here ---
      // Instead of configuring it inside z.boolean(), we set the message here.
      // This is cleaner and type-safe.
      return NextResponse.json({ 
        success: false, 
        error: "Completed status is required and must be true/false" 
      }, { status: 400 })
    }

    const { completed } = validation.data

    // Database Update
    const sql = `
      UPDATE meals 
      SET completed = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `
    const args = [completed ? 1 : 0, mealId]
    const changes = await executeMutation(sql, args)

    if (changes > 0) {
      return NextResponse.json({ success: true, message: 'Meal status updated' })
    } else {
      return NextResponse.json({ success: false, error: 'Meal not found' }, { status: 404 })
    }

  } catch (error) {
    console.error('API Error [PUT]:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}

// ==================================================================
// DELETE: Remove Meal
// ==================================================================
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const mealId = parseInt(id)

    if (isNaN(mealId)) {
      return NextResponse.json({ success: false, error: 'Invalid ID format' }, { status: 400 })
    }

    const changes = await executeMutation('DELETE FROM meals WHERE id = ?', [mealId])

    if (changes > 0) {
      return NextResponse.json({ success: true, message: 'Meal deleted successfully' })
    } else {
      return NextResponse.json({ success: false, error: 'Meal not found' }, { status: 404 })
    }

  } catch (error) {
    console.error('API Error [DELETE]:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}