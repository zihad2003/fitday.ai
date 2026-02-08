import { NextRequest, NextResponse } from 'next/server'
import { selectQuery, executeMutation } from '@/lib/d1'
import { z } from 'zod'

export const runtime = 'nodejs'

// --- 1. Validation Schema ---
// .partial() allows updating just "completed" without sending the whole object
const updateWorkoutSchema = z.object({
  type: z.string().min(2, "Workout type is too short").optional(),
  completed: z.boolean().optional(),
  duration: z.number().min(1).optional(), // Optional fields for future proofing
  calories: z.number().min(1).optional()
}).partial()

// ==================================================================
// GET: Fetch Single Workout
// ==================================================================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const workoutId = parseInt(id)

    if (isNaN(workoutId)) {
      return NextResponse.json({ success: false, error: 'Invalid ID format' }, { status: 400 })
    }

    const workouts = await selectQuery('SELECT * FROM workouts WHERE id = ?', [workoutId])
    
    if (workouts.length === 0) {
      return NextResponse.json({ success: false, error: 'Workout not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: workouts[0] })

  } catch (error) {
    console.error('API Error [GET /workouts/:id]:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}

// ==================================================================
// PUT: Update Workout (Partial Updates Supported)
// ==================================================================
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const workoutId = parseInt(id)

    if (isNaN(workoutId)) {
      return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 })
    }

    // A. Validate Request Body
    const body = await request.json()
    const validation = updateWorkoutSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ 
        success: false, 
        error: validation.error.issues[0].message 
      }, { status: 400 })
    }

    const updates = validation.data

    // B. Fetch Current Data (Required to merge partial updates)
    const existing = await selectQuery('SELECT * FROM workouts WHERE id = ?', [workoutId])
    if (existing.length === 0) {
      return NextResponse.json({ success: false, error: 'Workout not found' }, { status: 404 })
    }
    const currentWorkout = existing[0]

    // C. Merge Logic (New >> Old)
    const type = updates.type ?? currentWorkout.type
    // Handle boolean logic carefully (completed might be false)
    const completed = updates.completed !== undefined ? (updates.completed ? 1 : 0) : currentWorkout.completed
    
    // D. Update Database
    const sql = `
      UPDATE workouts
      SET type = ?, completed = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `
    const changes = await executeMutation(sql, [type, completed, workoutId])

    if (changes > 0) {
      // Optimistic return: construct the object without a second DB read
      const updatedData = { ...currentWorkout, type, completed, updated_at: new Date().toISOString() }
      
      return NextResponse.json({ success: true, data: updatedData })
    } else {
      return NextResponse.json({ success: false, error: 'Update failed' }, { status: 500 })
    }

  } catch (error) {
    console.error('API Error [PUT /workouts/:id]:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}

// ==================================================================
// DELETE: Remove Workout
// ==================================================================
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const workoutId = parseInt(id)

    if (isNaN(workoutId)) {
      return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 })
    }

    // "Safe Delete" pattern: We don't need to SELECT first.
    // The DELETE command returns the number of rows affected.
    const changes = await executeMutation('DELETE FROM workouts WHERE id = ?', [workoutId])

    if (changes > 0) {
      return NextResponse.json({ success: true, message: 'Workout deleted successfully' })
    } else {
      return NextResponse.json({ success: false, error: 'Workout not found' }, { status: 404 })
    }

  } catch (error) {
    console.error('API Error [DELETE /workouts/:id]:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}