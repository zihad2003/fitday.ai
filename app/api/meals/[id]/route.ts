// app/api/meals/[id]/route.ts - API routes for individual meal CRUD operations
import { NextRequest, NextResponse } from 'next/server'
import { selectQuery, executeMutation } from '@/lib/d1'

// GET /api/meals/[id] - Get a specific meal by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid meal ID' },
        { status: 400 }
      )
    }

    const meals = await selectQuery('SELECT * FROM meals WHERE id = ?', [id])
    if (meals.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Meal not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: meals[0] })
  } catch (error) {
    console.error('Error fetching meal:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch meal' },
      { status: 500 }
    )
  }
}

// PUT /api/meals/[id] - Update a specific meal
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid meal ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { user_id, date, meal_type, food, completed } = body

    // Check if meal exists
    const existingMeals = await selectQuery('SELECT id FROM meals WHERE id = ?', [id])
    if (existingMeals.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Meal not found' },
        { status: 404 }
      )
    }

    // Build update query dynamically
    const updates: string[] = []
    const queryParams: any[] = []

    if (user_id !== undefined) {
      updates.push('user_id = ?')
      queryParams.push(user_id)
    }

    if (date !== undefined) {
      updates.push('date = ?')
      queryParams.push(date)
    }

    if (meal_type !== undefined) {
      updates.push('meal_type = ?')
      queryParams.push(meal_type)
    }

    if (food !== undefined) {
      updates.push('food = ?')
      queryParams.push(food)
    }

    if (completed !== undefined) {
      updates.push('completed = ?')
      queryParams.push(completed ? 1 : 0)
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      )
    }

    updates.push('updated_at = CURRENT_TIMESTAMP')
    const sql = `UPDATE meals SET ${updates.join(', ')} WHERE id = ?`
    queryParams.push(id)

    const changes = await executeMutation(sql, queryParams)

    if (changes > 0) {
      // Get the updated meal
      const updatedMeals = await selectQuery('SELECT * FROM meals WHERE id = ?', [id])
      return NextResponse.json({ success: true, data: updatedMeals[0] })
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to update meal' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error updating meal:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update meal' },
      { status: 500 }
    )
  }
}

// DELETE /api/meals/[id] - Delete a specific meal
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid meal ID' },
        { status: 400 }
      )
    }

    // Check if meal exists
    const existingMeals = await selectQuery('SELECT id FROM meals WHERE id = ?', [id])
    if (existingMeals.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Meal not found' },
        { status: 404 }
      )
    }

    const changes = await executeMutation('DELETE FROM meals WHERE id = ?', [id])

    if (changes > 0) {
      return NextResponse.json({ success: true, message: 'Meal deleted successfully' })
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to delete meal' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error deleting meal:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete meal' },
      { status: 500 }
    )
  }
}