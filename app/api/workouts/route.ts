import { NextRequest, NextResponse } from 'next/server'
import { selectQuery, executeMutation } from '@/lib/d1'
import { z } from 'zod'

export const runtime = 'edge'

// --- 1. Validation Schema ---
const createWorkoutSchema = z.object({
  user_id: z.number().or(z.string().transform(Number)),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  type: z.string().min(3, "Workout description is too short"),
  completed: z.boolean().optional().default(false),
  // Optional: Add duration/calories if your DB supports them later
  duration: z.number().min(1).optional().default(0),
  calories: z.number().min(1).optional().default(0)
})

// ==================================================================
// GET: Fetch Workouts (Filtered)
// ==================================================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Extract Filters
    const userId = searchParams.get('user_id')
    const date = searchParams.get('date')
    const completed = searchParams.get('completed')

    // Dynamic SQL Construction
    let sql = `
      SELECT w.*, e.gif_url, e.difficulty, e.muscle_group 
      FROM workouts w 
      LEFT JOIN exercise_library e ON w.type = e.name 
      WHERE 1=1
    `
    const params: (string | number)[] = []

    if (userId) {
      sql += ' AND w.user_id = ?'
      params.push(parseInt(userId))
    }

    if (date) {
      sql += ' AND w.date = ?'
      params.push(date)
    }

    if (completed !== null) {
      sql += ' AND w.completed = ?'
      params.push(completed === 'true' ? 1 : 0)
    }

    // Default Sorting: Newest dates first
    sql += ' ORDER BY w.date DESC, w.created_at DESC'

    const workouts = await selectQuery(sql, params)

    return NextResponse.json({
      success: true,
      count: workouts.length,
      data: workouts
    })

  } catch (error) {
    console.error('API Error [GET /workouts]:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}

// ==================================================================
// POST: Log New Workout
// ==================================================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 1. Validate Input
    const validation = createWorkoutSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: validation.error.issues[0].message
      }, { status: 400 })
    }

    const data = validation.data

    // 2. Verify User Exists
    const users = await selectQuery('SELECT id FROM users WHERE id = ? LIMIT 1', [data.user_id])
    if (users.length === 0) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    // 3. Insert Workout
    // Note: If you add 'duration' or 'calories' columns to your DB later, add them here.
    const sql = `
      INSERT INTO workouts (user_id, date, type, completed)
      VALUES (?, ?, ?, ?)
    `
    const params = [
      data.user_id,
      data.date,
      data.type,
      data.completed ? 1 : 0
    ]

    const changes = await executeMutation(sql, params)

    if (changes > 0) {
      // Fetch the newly created item
      const newWorkouts = await selectQuery('SELECT * FROM workouts WHERE id = last_insert_rowid()')

      return NextResponse.json({
        success: true,
        message: 'Workout logged successfully',
        data: newWorkouts[0]
      }, { status: 201 })
    } else {
      return NextResponse.json({ success: false, error: 'Database insert failed' }, { status: 500 })
    }

  } catch (error) {
    console.error('API Error [POST /workouts]:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}