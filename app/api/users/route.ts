// app/api/users/route.ts - API routes for user CRUD operations
import { NextRequest, NextResponse } from 'next/server'
import { selectQuery, executeMutation } from '@/lib/d1'

// GET /api/users - Get all users or filter by query params
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    let sql = 'SELECT * FROM users'
    let params: any[] = []

    if (email) {
      sql += ' WHERE email = ?'
      params.push(email)
    }

    sql += ' ORDER BY created_at DESC'

    const users = await selectQuery(sql, params)
    return NextResponse.json({ success: true, data: users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, gender, age, height, weight, goal } = body

    // Validate required fields
    if (!email || !name) {
      return NextResponse.json(
        { success: false, error: 'Email and name are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUsers = await selectQuery('SELECT id FROM users WHERE email = ?', [email])
    if (existingUsers.length > 0) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Insert new user
    const sql = `
      INSERT INTO users (email, name, gender, age, height, weight, goal)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
    const params = [email, name, gender, age, height, weight, goal]
    const changes = await executeMutation(sql, params)

    if (changes > 0) {
      // Get the created user
      const newUsers = await selectQuery('SELECT * FROM users WHERE email = ?', [email])
      return NextResponse.json(
        { success: true, data: newUsers[0] },
        { status: 201 }
      )
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to create user' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    )
  }
}