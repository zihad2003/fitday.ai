import { NextRequest, NextResponse } from 'next/server'
import { selectQuery, executeMutation } from '@/lib/d1'

export const runtime = 'nodejs'

// ==================================================================
// GET: Fetch Exercise Library
// ==================================================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Extract Filters
    const muscleGroup = searchParams.get('muscle_group')
    const difficulty = searchParams.get('difficulty')
    const equipment = searchParams.get('equipment')
    const category = searchParams.get('category')

    // Dynamic SQL Construction
    let sql = `
      SELECT * FROM exercises 
      WHERE 1=1
    `
    const params: (string | number)[] = []

    if (muscleGroup) {
      sql += ' AND muscle_group = ?'
      params.push(muscleGroup)
    }

    if (difficulty) {
      sql += ' AND difficulty = ?'
      params.push(difficulty)
    }

    if (equipment) {
      sql += ' AND equipment_needed LIKE ?'
      params.push(`%${equipment}%`)
    }

    if (category) {
      sql += ' AND muscle_group = ?'
      params.push(category)
    }

    // Default Sorting: Alphabetical by name
    sql += ' ORDER BY name ASC'

    const exercises = await selectQuery(sql, params)

    return NextResponse.json({
      success: true,
      count: exercises.length,
      data: exercises
    })

  } catch (error) {
    console.error('API Error [GET /exercises]:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}

// ==================================================================
// POST: Add New Exercise (Admin functionality)
// ==================================================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Basic validation
    const { name, difficulty, muscle_group, equipment_needed, safety_instruction, gif_url } = body as {
      name?: string
      difficulty?: string
      muscle_group?: string
      equipment_needed?: string
      safety_instruction?: string
      gif_url?: string
    }

    if (!name || !difficulty || !muscle_group || !equipment_needed || !safety_instruction) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 })
    }

    // Insert Exercise
    const sql = `
      INSERT INTO exercises (name, difficulty, muscle_group, equipment_needed, safety_instruction, gif_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `
    const params = [name, difficulty, muscle_group, equipment_needed, safety_instruction, gif_url || '']

    const changes = await executeMutation(sql, params)

    if (changes > 0) {
      // Fetch the newly created exercise
      const newExercises = await selectQuery('SELECT * FROM exercises WHERE id = last_insert_rowid()')

      return NextResponse.json({
        success: true,
        message: 'Exercise added successfully',
        data: newExercises[0]
      }, { status: 201 })
    } else {
      return NextResponse.json({ success: false, error: 'Database insert failed' }, { status: 500 })
    }

  } catch (error) {
    console.error('API Error [POST /exercises]:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}