import { NextRequest, NextResponse } from 'next/server'
import { selectQuery, executeMutation } from '@/lib/d1'

export const runtime = 'edge'

// POST: Log daily progress
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      user_id?: number
      date?: string
      weight_kg?: number
      body_fat_percentage?: number
      calories_consumed?: number
      calories_burned?: number
      protein_consumed?: number
      steps?: number
      water_liters?: number
      sleep_hours?: number
    }

    const { user_id, date, ...progressData } = body

    if (!user_id || !date) {
      return NextResponse.json({ success: false, error: 'User ID and date required' }, { status: 400 })
    }

    // Check if user exists
    const users = await selectQuery('SELECT id FROM users WHERE id = ? LIMIT 1', [user_id])
    if (users.length === 0) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    // Check if progress already exists for this date
    const existingProgress = await selectQuery(
      'SELECT id FROM user_progress WHERE user_id = ? AND date = ? LIMIT 1',
      [user_id, date]
    )

    let result
    if (existingProgress.length > 0) {
      // Update existing progress
      const updateFields: string[] = []
      const updateParams: any[] = []

      Object.entries(progressData).forEach(([key, value]) => {
        if (value !== undefined) {
          updateFields.push(`${key} = ?`)
          updateParams.push(value)
        }
      })

      if (updateFields.length > 0) {
        const updateSql = `UPDATE user_progress SET ${updateFields.join(', ')} WHERE user_id = ? AND date = ?`
        updateParams.push(user_id, date)
        
        await executeMutation(updateSql, updateParams)
      }

      result = await selectQuery(
        'SELECT * FROM user_progress WHERE user_id = ? AND date = ? LIMIT 1',
        [user_id, date]
      )
    } else {
      // Insert new progress
      const insertFields: string[] = ['user_id', 'date']
      const insertValues: any[] = [user_id, date]
      const placeholders: string[] = ['?', '?']

      Object.entries(progressData).forEach(([key, value]) => {
        if (value !== undefined) {
          insertFields.push(key)
          insertValues.push(value)
          placeholders.push('?')
        }
      })

      const insertSql = `INSERT INTO user_progress (${insertFields.join(', ')}) VALUES (${placeholders.join(', ')})`
      await executeMutation(insertSql, insertValues)

      result = await selectQuery(
        'SELECT * FROM user_progress WHERE user_id = ? AND date = ? LIMIT 1',
        [user_id, date]
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Progress logged successfully',
      data: result[0]
    })

  } catch (error) {
    console.error('API Error [POST /progress]:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}

// GET: Fetch progress data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const date = searchParams.get('date')
    const period = searchParams.get('period') // week, month, year
    const analytics = searchParams.get('analytics') // true for analytics

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 })
    }

    if (analytics === 'true') {
      return getProgressAnalytics(userId, period || 'week')
    }

    let sql = 'SELECT * FROM user_progress WHERE user_id = ?'
    const params: any[] = [Number(userId)]

    if (date) {
      sql += ' AND date = ?'
      params.push(date)
    } else if (period) {
      const endDate = new Date()
      let startDate = new Date()

      switch (period) {
        case 'week':
          startDate.setDate(endDate.getDate() - 7)
          break
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1)
          break
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - 1)
          break
      }

      sql += ' AND date >= ? AND date <= ?'
      params.push(startDate.toISOString().split('T')[0])
      params.push(endDate.toISOString().split('T')[0])
    }

    sql += ' ORDER BY date DESC'

    const progressData = await selectQuery(sql, params)

    return NextResponse.json({
      success: true,
      data: progressData,
      count: progressData.length
    })

  } catch (error) {
    console.error('API Error [GET /progress]:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}

// Helper function for analytics
async function getProgressAnalytics(userId: string | null, period: string) {
  if (!userId) return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 })

  // Calculate date range
  const endDate = new Date()
  let startDate = new Date()

  switch (period) {
    case 'week':
      startDate.setDate(endDate.getDate() - 7)
      break
    case 'month':
      startDate.setMonth(endDate.getMonth() - 1)
      break
    case 'year':
      startDate.setFullYear(endDate.getFullYear() - 1)
      break
  }

  const startDateStr = startDate.toISOString().split('T')[0]
  const endDateStr = endDate.toISOString().split('T')[0]

  // Get progress summary
  const progressSummary = await selectQuery(`
    SELECT 
      AVG(weight_kg) as avg_weight,
      MIN(weight_kg) as min_weight,
      MAX(weight_kg) as max_weight,
      AVG(calories_consumed) as avg_calories,
      SUM(calories_consumed) as total_calories,
      AVG(calories_burned) as avg_calories_burned,
      SUM(calories_burned) as total_calories_burned,
      AVG(protein_consumed) as avg_protein,
      SUM(protein_consumed) as total_protein,
      AVG(steps) as avg_steps,
      SUM(steps) as total_steps,
      AVG(water_liters) as avg_water,
      SUM(water_liters) as total_water,
      AVG(sleep_hours) as avg_sleep,
      COUNT(*) as days_tracked
    FROM user_progress 
    WHERE user_id = ? AND date >= ? AND date <= ?
  `, [userId, startDateStr, endDateStr])

  // Get meal compliance
  const mealCompliance = await selectQuery(`
    SELECT 
      COUNT(CASE WHEN completed = 1 THEN 1 END) as completed_meals,
      COUNT(*) as total_meals,
      ROUND(COUNT(CASE WHEN completed = 1 THEN 1 END) * 100.0 / COUNT(*), 2) as compliance_rate
    FROM meals_with_food 
    WHERE user_id = ? AND date >= ? AND date <= ?
  `, [userId, startDateStr, endDateStr])

  // Get workout compliance
  const workoutCompliance = await selectQuery(`
    SELECT 
      COUNT(CASE WHEN completed = 1 THEN 1 END) as completed_workouts,
      COUNT(*) as total_workouts,
      ROUND(COUNT(CASE WHEN completed = 1 THEN 1 END) * 100.0 / COUNT(*), 2) as compliance_rate
    FROM workouts_with_exercise 
    WHERE user_id = ? AND date >= ? AND date <= ?
  `, [userId, startDateStr, endDateStr])

  const analytics = {
    period,
    date_range: {
      start: startDateStr,
      end: endDateStr
    },
    progress_summary: progressSummary[0] || {},
    meal_compliance: mealCompliance[0] || {},
    workout_compliance: workoutCompliance[0] || {}
  }

  return NextResponse.json({
    success: true,
    data: analytics
  })
}