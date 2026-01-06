// app/api/meals/[id]/route.ts - Update Meal Status
import { NextRequest, NextResponse } from 'next/server'
import { selectQuery, executeMutation } from '@/lib/d1'

// PUT /api/meals/[id] - মিল আপডেট করা (যেমন: completed টিক দেওয়া)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const mealId = parseInt(params.id)
    if (isNaN(mealId)) {
      return NextResponse.json({ success: false, error: 'Invalid meal ID' }, { status: 400 })
    }

    const body = await request.json()
    // আমরা শুধু completed স্ট্যাটাস আপডেট করার অপশন দিচ্ছি
    const { completed } = body

    if (completed === undefined) {
      return NextResponse.json({ success: false, error: 'Completed status required' }, { status: 400 })
    }

    // আপডেট কোয়েরি
    const sql = `
      UPDATE meals
      SET completed = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `
    const paramsList = [completed ? 1 : 0, mealId]
    const changes = await executeMutation(sql, paramsList)

    if (changes > 0) {
      return NextResponse.json({ success: true, message: 'Meal updated' })
    } else {
      return NextResponse.json({ success: false, error: 'Meal not found' }, { status: 404 })
    }
  } catch (error) {
    console.error('Error updating meal:', error)
    return NextResponse.json({ success: false, error: 'Failed to update meal' }, { status: 500 })
  }
}

// DELETE /api/meals/[id] - মিল ডিলিট করা
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const mealId = parseInt(params.id)
    const changes = await executeMutation('DELETE FROM meals WHERE id = ?', [mealId])

    if (changes > 0) {
      return NextResponse.json({ success: true, message: 'Meal deleted' })
    } else {
      return NextResponse.json({ success: false, error: 'Meal not found' }, { status: 404 })
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete meal' }, { status: 500 })
  }
}