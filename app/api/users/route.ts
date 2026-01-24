// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { selectQuery, executeMutation } from '@/lib/d1'
import { calculateBMR, calculateTDEE, calculateMacros } from '@/lib/nutrition'
import { hashPassword, generateSalt } from '@/lib/auth'

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')
    const email = searchParams.get('email')

    let sql = 'SELECT * FROM users'
    let params: any[] = []

    if (userId) {
      sql += ' WHERE id = ?'
      params.push(parseInt(userId))
    } else if (email) {
      sql += ' WHERE email = ?'
      params.push(email)
    }
    sql += ' ORDER BY created_at DESC'

    const users = await selectQuery(sql, params)
    const safeUsers = users.map((u: any) => {
      const { password, salt, ...userWithoutPassword } = u
      return userWithoutPassword
    })

    if (userId && safeUsers.length === 0) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: userId ? (safeUsers[0] || null) : safeUsers,
      count: userId ? 1 : safeUsers.length
    })
  } catch (error) {
    console.error('API Error [GET /users]:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, gender, age, height, weight, goal, activity_level = 'sedentary', experience_level = 'beginner' } = body as any

    if (!email || !password || !name || !age || !height || !weight || !goal) {
      return NextResponse.json({ success: false, error: 'All fields are required' }, { status: 400 })
    }

    const existingUsers = await selectQuery('SELECT id FROM users WHERE email = ?', [email])
    if (existingUsers.length > 0) {
      console.warn(`[API] Registration Conflict: Email '${email}' already exists.`);
      return NextResponse.json({ success: false, error: 'Email already exists' }, { status: 409 })
    }

    // Nutrition Calculation
    let targetCalories = 2000;
    let macros = null;
    try {
      const bmr = calculateBMR(gender, weight, height, age)
      const tdee = calculateTDEE(bmr, activity_level)
      macros = calculateMacros(tdee, goal)
      targetCalories = macros.targetCalories
    } catch (e) {
      console.warn("Nutrition calc failed, using defaults")
    }

    // SECURITY: Hash Password
    const salt = generateSalt();
    const hashedPassword = await hashPassword(password, salt);
    const storedPassword = `${salt}:${hashedPassword}`;

    const sql = `
      INSERT INTO users (email, password, name, gender, age, height_cm, weight_kg, activity_level, experience_level, goal, target_calories)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    const params = [email, storedPassword, name, gender, age, height, weight, activity_level, experience_level, goal, targetCalories]

    const changes = await executeMutation(sql, params)

    if (changes > 0) {
      const newUsers = await selectQuery('SELECT * FROM users WHERE email = ?', [email])
      if (newUsers && newUsers.length > 0) {
        const { password, salt, ...safeUser } = newUsers[0]
        return NextResponse.json({ success: true, data: safeUser, nutrition_profile: macros }, { status: 201 })
      }
      return NextResponse.json({ success: true, message: "User created" }, { status: 201 })
    } else {
      return NextResponse.json({ success: false, error: 'Failed to create user record' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error inside POST /api/users:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}