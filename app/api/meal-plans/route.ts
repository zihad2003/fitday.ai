import { NextRequest, NextResponse } from 'next/server'
import { selectQuery, executeMutation } from '@/lib/d1'

export const runtime = 'nodejs'

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
        m.*,
        m.food_name,
        m.calories,
        m.protein,
        m.carbs,
        m.fat
      FROM meals m
      WHERE m.user_id = ?
    `

    const params: any[] = [Number(userId)]

    if (date) {
      sql += ' AND m.date = ?'
      params.push(date)
    }

    if (mealType) {
      sql += ' AND m.meal_type = ?'
      params.push(mealType)
    }

    sql += ' ORDER BY m.date, m.meal_type, m.created_at'

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