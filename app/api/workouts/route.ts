import { NextRequest, NextResponse } from 'next/server'
import { WorkoutPlanner } from '@/lib/workout-planner'
import { getCurrentUser } from '@/lib/session-manager'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    if (!date) {
      return NextResponse.json({ success: false, error: 'Missing date parameter' }, { status: 400 })
    }

    const exercises = await WorkoutPlanner.getDailyWorkout(user.id!, date)

    return NextResponse.json({
      success: true,
      data: exercises
    })
  } catch (error: any) {
    console.error('Workouts API Error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch workouts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json() as {
      date: string,
      exercise_id: number,
      sets: number,
      reps: string,
      order_index: number
    }
    const { date, exercise_id, sets, reps, order_index } = body

    if (!date || !exercise_id) {
      return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 })
    }

    await WorkoutPlanner.saveWorkoutPlan(user.id!, date, exercise_id, sets, reps, order_index)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Workouts API Error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save workout' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json() as {
      id: number,
      completed: boolean
    }
    const { id, completed } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing exercise ID' }, { status: 400 })
    }

    const { mutate } = await import('@/lib/database')
    await mutate(`
      UPDATE workout_plans 
      SET completed = ? 
      WHERE id = ? AND user_id = ?
    `, [completed ? 1 : 0, id, user.id!])

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Workouts API Error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update workout' },
      { status: 500 }
    )
  }
}