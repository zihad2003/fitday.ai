// app/api/meals/route.ts - API routes for meal CRUD operations
import { NextRequest, NextResponse } from 'next/server'
import { selectQuery, executeMutation } from '@/lib/d1'

// GET /api/meals - Get all meals or filter by query params
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const date = searchParams.get('date')
    const mealType = searchParams.get('meal_type')
    const completed = searchParams.get('completed')

    let sql = 'SELECT * FROM meals WHERE 1=1'
    let params: any[] = []

    if (userId) {
      sql += ' AND user_id = ?'
      params.push(parseInt(userId))
    }

    if (date) {
      sql += ' AND date = ?'
      params.push(date)
    }

    if (mealType) {
      sql += ' AND meal_type = ?'
      params.push(mealType)
    }

    if (completed !== null) {
      sql += ' AND completed = ?'
      params.push(completed === 'true' ? 1 : 0)
    }

    sql += ' ORDER BY date DESC, meal_type ASC, created_at DESC'

    const meals = await selectQuery(sql, params)
    return NextResponse.json({ success: true, data: meals })
  } catch (error) {
    console.error('Error fetching meals:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch meals' },
      { status: 500 }
    )
  }
}

// POST /api/meals - Create a new meal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, date, meal_type, food, completed = false } = body

    // Validate required fields
    if (!user_id || !date || !meal_type || !food) {
      return NextResponse.json(
        { success: false, error: 'user_id, date, meal_type, and food are required' },
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

    // Insert new meal
    const sql = `
      INSERT INTO meals (user_id, date, meal_type, food, completed)
      VALUES (?, ?, ?, ?, ?)
    `
    const params = [user_id, date, meal_type, food, completed ? 1 : 0]
    const changes = await executeMutation(sql, params)

    if (changes > 0) {
      // Get the created meal
      const newMeals = await selectQuery('SELECT * FROM meals WHERE id = last_insert_rowid()')
      return NextResponse.json(
        { success: true, data: newMeals[0] },
        { status: 201 }
      )
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to create meal' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error creating meal:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create meal' },
      { status: 500 }
    )
  }
}