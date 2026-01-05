// app/api/workouts/[id]/route.ts - API routes for individual workout CRUD operations
import { NextRequest, NextResponse } from 'next/server'
import { selectQuery, executeMutation } from '@/lib/d1'

// GET /api/workouts/[id] - Get a specific workout by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workoutId = parseInt(params.id)
    if (isNaN(workoutId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid workout ID' },
        { status: 400 }
      )
    }

    const workouts = await selectQuery('SELECT * FROM workouts WHERE id = ?', [workoutId])
    if (workouts.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Workout not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: workouts[0] })
  } catch (error) {
    console.error('Error fetching workout:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch workout' },
      { status: 500 }
    )
  }
}

// PUT /api/workouts/[id] - Update a specific workout
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workoutId = parseInt(params.id)
    if (isNaN(workoutId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid workout ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { type, completed } = body

    // Check if workout exists
    const existingWorkouts = await selectQuery('SELECT id FROM workouts WHERE id = ?', [workoutId])
    if (existingWorkouts.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Workout not found' },
        { status: 404 }
      )
    }

    // Update workout
    const sql = `
      UPDATE workouts
      SET type = ?, completed = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `
    const queryParams = [type, completed ? 1 : 0, workoutId]
    const changes = await executeMutation(sql, queryParams)

    if (changes > 0) {
      // Get the updated workout
      const updatedWorkouts = await selectQuery('SELECT * FROM workouts WHERE id = ?', [workoutId])
      return NextResponse.json({ success: true, data: updatedWorkouts[0] })
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to update workout' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error updating workout:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update workout' },
      { status: 500 }
    )
  }
}

// DELETE /api/workouts/[id] - Delete a specific workout
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workoutId = parseInt(params.id)
    if (isNaN(workoutId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid workout ID' },
        { status: 400 }
      )
    }

    // Check if workout exists
    const existingWorkouts = await selectQuery('SELECT id FROM workouts WHERE id = ?', [workoutId])
    if (existingWorkouts.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Workout not found' },
        { status: 404 }
      )
    }

    // Delete workout
    const changes = await executeMutation('DELETE FROM workouts WHERE id = ?', [workoutId])

    if (changes > 0) {
      return NextResponse.json({ success: true, message: 'Workout deleted successfully' })
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to delete workout' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error deleting workout:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete workout' },
      { status: 500 }
    )
  }
}