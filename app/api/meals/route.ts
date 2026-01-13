import { NextRequest, NextResponse } from 'next/server'
import { selectQuery, executeMutation } from '@/lib/d1'
import { z } from 'zod'

export const runtime = 'edge'

// --- 1. Validation Schemas ---
const createMealSchema = z.object({
  user_id: z.number().or(z.string().transform(Number)),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  meal_type: z.enum(['breakfast', 'lunch', 'snack', 'dinner']),
  food: z.string().min(2, "Food name is too short"),
  completed: z.boolean().optional().default(false),
  // Optional macro fields for manual entry
  calories: z.number().optional().default(0),
  protein: z.number().optional().default(0),
  carbs: z.number().optional().default(0),
  fat: z.number().optional().default(0),
})

// ==================================================================
// GET: Fetch Meals (Filtered)
// ==================================================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Extract Filters
    const userId = searchParams.get('user_id')
    const date = searchParams.get('date')
    const mealType = searchParams.get('meal_type')
    const completed = searchParams.get('completed')

    // Dynamic SQL Construction
    let sql = 'SELECT * FROM meals WHERE 1=1'
    const params: (string | number)[] = []

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

    // Default Ordering: Most recent date first, then by meal type sequence
    sql += ' ORDER BY date DESC, CASE meal_type WHEN "breakfast" THEN 1 WHEN "lunch" THEN 2 WHEN "snack" THEN 3 WHEN "dinner" THEN 4 ELSE 5 END'

    const meals = await selectQuery(sql, params)
    
    return NextResponse.json({ 
      success: true, 
      count: meals.length, 
      data: meals 
    })

  } catch (error) {
    console.error('API Error [GET /meals]:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}

// ==================================================================
// POST: Create New Meal
// ==================================================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 1. Validate Input
    const validation = createMealSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json({ 
        success: false, 
        error: validation.error.issues[0].message 
      }, { status: 400 })
    }

    const data = validation.data

    // 2. Verify User Exists (Optional but recommended)
    const users = await selectQuery('SELECT id FROM users WHERE id = ? LIMIT 1', [data.user_id])
    if (users.length === 0) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    // 3. Insert Meal
    const sql = `
      INSERT INTO meals (user_id, date, meal_type, food, calories, protein, carbs, fat, completed)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    
    const params = [
      data.user_id, 
      data.date, 
      data.meal_type, 
      data.food,
      data.calories,
      data.protein,
      data.carbs,
      data.fat, 
      data.completed ? 1 : 0
    ]

    const changes = await executeMutation(sql, params)

    if (changes > 0) {
      // Fetch the newly created item to return full object
      const newMeals = await selectQuery('SELECT * FROM meals WHERE id = last_insert_rowid()')
      
      return NextResponse.json({ 
        success: true, 
        message: 'Meal logged successfully',
        data: newMeals[0] 
      }, { status: 201 })
    } else {
      return NextResponse.json({ success: false, error: 'Database insert failed' }, { status: 500 })
    }

  } catch (error) {
    console.error('API Error [POST /meals]:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}