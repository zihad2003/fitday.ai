import { NextRequest, NextResponse } from 'next/server'
import { query, mutate } from '@/lib/database'
import { getCurrentUser } from '@/lib/session-manager'
import { z } from 'zod'

export const runtime = 'nodejs'

// --- 1. Validation Schemas ---
const createMealSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  meal_type: z.enum(['breakfast', 'lunch', 'snack', 'dinner']),
  food_name: z.string().min(2, "Food name is too short"),
  completed: z.boolean().optional().default(false),
  calories: z.number().optional().default(0),
  protein: z.number().optional().default(0),
  carbs: z.number().optional().default(0),
  fat: z.number().optional().default(0),
})

// ==================================================================
// GET: Fetch Meals (Joined with Meal Plans)
// ==================================================================
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser() as any
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = user.id

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
    const mealType = searchParams.get('meal_type')
    const completed = searchParams.get('completed')

    let sql = `
      SELECT 
        m.id, m.user_id, m.date, m.meal_type, 
        m.completed, 1 as quantity,
        m.name as food_name, m.calories, m.protein, m.carbs, m.fats as fat
      FROM meals m
      WHERE m.user_id = ? AND m.date = ?
    `
    const params: any[] = [userId, date]

    if (mealType) {
      sql += ' AND m.meal_type = ?'
      params.push(mealType)
    }

    if (completed !== null) {
      sql += ' AND m.completed = ?'
      params.push(completed === 'true' ? 1 : 0)
    }

    sql += ' ORDER BY m.created_at DESC'

    const res = await query(sql, params)

    return NextResponse.json({
      success: true,
      count: res.data?.length || 0,
      data: res.data || []
    })

  } catch (error) {
    console.error('API Error [GET /meals]:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}

// ==================================================================
// POST: Create New Meal Log
// ==================================================================
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser() as any
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = user.id

    const body = await request.json()
    const validation = createMealSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: validation.error.issues[0].message
      }, { status: 400 })
    }

    const data = validation.data

    const res = await mutate(`
      INSERT INTO meals (user_id, date, name, meal_type, calories, protein, carbs, fats, completed, is_custom)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `, [userId, data.date, data.food_name, data.meal_type, data.calories, data.protein, data.carbs, data.fat, data.completed ? 1 : 0])

    if (res.success) {
      return NextResponse.json({
        success: true,
        message: 'Meal logged successfully',
        id: res.lastId
      }, { status: 201 })
    } else {
      return NextResponse.json({ success: false, error: 'Database insert failed' }, { status: 500 })
    }

  } catch (error) {
    console.error('API Error [POST /meals]:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}
