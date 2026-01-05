// app/api/users/[id]/route.ts - API routes for individual user CRUD operations
import { NextRequest, NextResponse } from 'next/server'
import { selectQuery, executeMutation } from '@/lib/d1'

// GET /api/users/[id] - Get a specific user by ID
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

// PUT /api/users/[id] - Update a specific user
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
    const { name, gender, age, height, weight, goal } = body

    // Check if user exists
    const existingUsers = await selectQuery('SELECT id FROM users WHERE id = ?', [userId])
    if (existingUsers.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Update user
    const sql = `
      UPDATE users
      SET name = ?, gender = ?, age = ?, height = ?, weight = ?, goal = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `
    const queryParams = [name, gender, age, height, weight, goal, userId]
    const changes = await executeMutation(sql, queryParams)

    if (changes > 0) {
      // Get the updated user
      const updatedUsers = await selectQuery('SELECT * FROM users WHERE id = ?', [userId])
      return NextResponse.json({ success: true, data: updatedUsers[0] })
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

    // Check if user exists
    const existingUsers = await selectQuery('SELECT id FROM users WHERE id = ?', [userId])
    if (existingUsers.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Delete user (cascades to workouts and meals due to foreign keys)
    const changes = await executeMutation('DELETE FROM users WHERE id = ?', [userId])

    if (changes > 0) {
      return NextResponse.json({ success: true, message: 'User deleted successfully' })
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to delete user' },
        { status: 500 }
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