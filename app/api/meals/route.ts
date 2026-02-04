import { NextRequest, NextResponse } from 'next/server'
import { selectQuery, executeMutation } from '@/lib/d1'
import { z } from 'zod'

export const runtime = 'edge'

// --- 1. Validation Schemas ---
const createMealSchema = z.object({
  user_id: z.number().or(z.string().transform(Number)),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  meal_type: z.enum(['breakfast', 'lunch', 'snack', 'dinner']),
  food_name: z.string().min(2, "Food name is too short"),
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
// ==================================================================
// GET: Fetch Meals (Joined with Meal Plans)
// ==================================================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Extract Filters
    const userId = searchParams.get('user_id')
    const date = searchParams.get('date')
    const mealType = searchParams.get('meal_type')
    const completed = searchParams.get('completed')

    // Dynamic SQL Construction to Join Tables
    // We select columns to match the 'flat' structure expected by the frontend
    let sql = `
      SELECT 
        mp.id, mp.user_id, mp.date, mp.meal_time as meal_type, 
        mp.consumed as completed, mp.serving_size as quantity,
        m.name as food_name, m.calories, m.protein, m.carbs, m.fats as fat
      FROM meal_plans mp
      JOIN meals m ON mp.meal_id = m.id
      WHERE 1=1
    `
    const params: (string | number)[] = []

    if (userId) {
      sql += ' AND mp.user_id = ?'
      params.push(parseInt(userId))
    }

    if (date) {
      sql += ' AND mp.date = ?'
      params.push(date)
    }

    // Note: Schema uses 'meal_id' link. 'meal_type' validation happens at application level or via join filter if needed.
    // The previous code filtered by 'meal_type'. In new schema, we store meal_type in 'meals' or rely on 'meal_time' in plan?
    // User schema says: meals table has meal_type. 
    // Wait, Schema says: meals(meal_type) AND meal_plans(meal_time).
    // Let's assume frontend passes "breakfast" etc as meal_type.

    if (mealType) {
      // Filter by the meal definition's type
      sql += ' AND m.meal_type = ?'
      params.push(mealType)
    }

    if (completed !== null) {
      sql += ' AND mp.consumed = ?'
      params.push(completed === 'true' ? 1 : 0)
    }

    sql += ' ORDER BY mp.date DESC, mp.id DESC'

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
// POST: Create New Meal (Library + Log)
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

    // 2. Find or Create Meal in Library
    // Check if a similar custom meal exists for this user? 
    // For simplicity, we create a new 'custom' meal entry for every log to avoid linking issues, 
    // OR we could try to deduplicate. Let's create new for now to ensure macros match exactly what user entered.

    const insertMealSql = `
      INSERT INTO meals (name, meal_type, calories, protein, carbs, fats, is_custom)
      VALUES (?, ?, ?, ?, ?, ?, 1)
      RETURNING id
    `
    // If D1 doesn't support RETURNING in existing setup, we might need two queries.
    // wrangler d1 execute supports RETURNING.

    // Note: executeMutation returns 'changes' count, not ID. We might need a utility fix or separate query.
    // Let's do Insert -> Select Last ID.

    await executeMutation(`
      INSERT INTO meals (name, meal_type, calories, protein, carbs, fats, is_custom)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `, [data.food_name, data.meal_type, data.calories, data.protein, data.carbs, data.fat])

    // Get the ID
    const mealResult = await selectQuery('SELECT last_insert_rowid() as id')
    const mealId = mealResult[0].id

    // 3. Insert into Meal Plans (The Log)
    const logSql = `
      INSERT INTO meal_plans (user_id, date, meal_id, consumed, serving_size)
      VALUES (?, ?, ?, ?, 1)
    `
    // Assuming 'completed' means consumed. createMealSchema has 'completed'.
    const consumed = data.completed ? 1 : 0

    const changes = await executeMutation(logSql, [
      data.user_id,
      data.date,
      mealId,
      consumed
    ])

    if (changes > 0) {
      // Re-fetch joined data to return
      const newLog = await selectQuery(`
          SELECT 
            mp.id, mp.user_id, mp.date, m.meal_type, 
            mp.consumed as completed, m.name as food_name, 
            m.calories, m.protein, m.carbs, m.fats as fat
          FROM meal_plans mp
          JOIN meals m ON mp.meal_id = m.id
          WHERE mp.id = last_insert_rowid()
      `)

      return NextResponse.json({
        success: true,
        message: 'Meal logged successfully',
        data: newLog[0]
      }, { status: 201 })
    } else {
      return NextResponse.json({ success: false, error: 'Database insert failed' }, { status: 500 })
    }

  } catch (error) {
    console.error('API Error [POST /meals]:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}