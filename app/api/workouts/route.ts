// app/api/workouts/route.ts - API routes for workout CRUD operations
import { NextRequest, NextResponse } from 'next/server'
import { selectQuery, executeMutation } from '@/lib/d1'

// GET /api/workouts - Get all workouts or filter by query params
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const date = searchParams.get('date')
    const completed = searchParams.get('completed')

    let sql = 'SELECT * FROM workouts WHERE 1=1'
    let params: any[] = []

    if (userId) {
      sql += ' AND user_id = ?'
      params.push(parseInt(userId))
    }

    if (date) {
      sql += ' AND date = ?'
      params.push(date)
    }

    if (completed !== null) {
      sql += ' AND completed = ?'
      params.push(completed === 'true' ? 1 : 0)
    }

    sql += ' ORDER BY date DESC, created_at DESC'

    const workouts = await selectQuery(sql, params)
    return NextResponse.json({ success: true, data: workouts })
  } catch (error) {
    console.error('Error fetching workouts:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch workouts' },
      { status: 500 }
    )
  }
}

// POST /api/workouts - Create a new workout
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, date, type, completed = false } = body

    // Validate required fields
    if (!user_id || !date || !type) {
      return NextResponse.json(
        { success: false, error: 'user_id, date, and type are required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const users = await selectQuery('SELECT id FROM users WHERE id = ?', [user_id])
    if (users.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Insert new workout
    const sql = `
      INSERT INTO workouts (user_id, date, type, completed)
      VALUES (?, ?, ?, ?)
    `
    const params = [user_id, date, type, completed ? 1 : 0]
    const changes = await executeMutation(sql, params)

    if (changes > 0) {
      // Get the created workout
      const newWorkouts = await selectQuery('SELECT * FROM workouts WHERE id = last_insert_rowid()')
      return NextResponse.json(
        { success: true, data: newWorkouts[0] },
        { status: 201 }
      )
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to create workout' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error creating workout:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create workout' },
      { status: 500 }
    )
  }
}