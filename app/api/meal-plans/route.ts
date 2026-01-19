import { NextRequest, NextResponse } from 'next/server'
import { selectQuery, executeMutation } from '@/lib/d1'

export const runtime = 'edge'

// GET: Fetch meal plans
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const date = searchParams.get('date')
    const mealType = searchParams.get('meal_type')

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 })
    }

    let sql = `
      SELECT 
        mp.*,
        f.name as food_name,
        f.bangla_name as food_bangla_name,
        f.serving_unit,
        f.calories as food_calories,
        f.protein as food_protein,
        f.carbs as food_carbs,
        f.fat as food_fat,
        f.category,
        (mp.quantity * f.calories) as total_calories,
        (mp.quantity * f.protein) as total_protein,
        (mp.quantity * f.carbs) as total_carbs,
        (mp.quantity * f.fat) as total_fat
      FROM meal_plans mp
      JOIN food_items f ON mp.food_id = f.id
      WHERE mp.user_id = ?
    `
    
    const params: any[] = [Number(userId)]

    if (date) {
      sql += ' AND mp.date = ?'
      params.push(date)
    }

    if (mealType) {
      sql += ' AND mp.meal_type = ?'
      params.push(mealType)
    }

    sql += ' ORDER BY mp.date, mp.meal_type, mp.created_at'

    const mealPlans = await selectQuery(sql, params)

    return NextResponse.json({
      success: true,
      data: mealPlans,
      count: mealPlans.length
    })

  } catch (error) {
    console.error('API Error [GET /meal-plans]:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}