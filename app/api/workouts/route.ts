import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { WorkoutPlanner } from '@/lib/workout-planner'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const date = searchParams.get('date')

    if (!userId || !date) {
      return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 })
    }

    const exercises = await WorkoutPlanner.getDailyWorkout(Number(userId), date)

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
    const body = await request.json() as {
      userId: number,
      date: string,
      exercise_id: number,
      sets: number,
      reps: string,
      order_index: number
    }
    const { userId, date, exercise_id, sets, reps, order_index } = body

    if (!userId || !date || !exercise_id) {
      return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 })
    }

    await WorkoutPlanner.saveWorkoutPlan(userId, date, exercise_id, sets, reps, order_index)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Workouts API Error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save workout' },
      { status: 500 }
    )
  }
}