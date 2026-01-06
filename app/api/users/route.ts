// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server'
// নিচের লাইনটি লক্ষ্য করুন, এটি থাকতেই হবে
import { selectQuery, executeMutation } from '@/lib/d1' 
import { calculateBMR, calculateTDEE, calculateMacros } from '@/lib/nutrition'

// GET: সব ইউজার দেখার জন্য
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
    
    const safeUsers = users.map((u: any) => {
      const { password, ...userWithoutPassword } = u
      return userWithoutPassword
    })

    return NextResponse.json({ success: true, data: safeUsers })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch users' }, { status: 500 })
  }
}

// POST: নতুন ইউজার তৈরি করার জন্য
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // 'as any' বা সঠিক টাইপিং ব্যবহার করে এরর ফিক্স করা হলো
    const { email, password, name, gender, age, height, weight, goal, activity_level = 'sedentary' } = body as any

    // Validation
    if (!email || !password || !name || !age || !height || !weight || !goal) {
      return NextResponse.json({ success: false, error: 'All fields are required' }, { status: 400 })
    }

    // Check Duplicate
    const existingUsers = await selectQuery('SELECT id FROM users WHERE email = ?', [email])
    if (existingUsers.length > 0) {
      return NextResponse.json({ success: false, error: 'Email already exists' }, { status: 409 })
    }

    // Medical Intelligence (Fallback added)
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

    // Insert into DB
    const sql = `
      INSERT INTO users (email, password, name, gender, age, height_cm, weight_kg, activity_level, goal, target_calories)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    const params = [email, password, name, gender, age, height, weight, activity_level, goal, targetCalories]
    
    const changes = await executeMutation(sql, params)

    if (changes > 0) {
      // Retrieve User
      const newUsers = await selectQuery('SELECT * FROM users WHERE email = ?', [email])
      let responseData;

      if (newUsers && newUsers.length > 0) {
        const user = newUsers[0]
        const { password: key, ...rest } = user
        responseData = rest
      } else {
        responseData = { email, name, gender, age, height_cm: height, weight_kg: weight, activity_level, goal, target_calories: targetCalories }
      }

      return NextResponse.json({ success: true, data: responseData, nutrition_profile: macros }, { status: 201 })
    } else {
      return NextResponse.json({ success: false, error: 'Failed to create user record' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error inside POST /api/users:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}