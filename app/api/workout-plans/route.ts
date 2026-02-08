import { NextRequest, NextResponse } from 'next/server'
import { selectQuery, executeMutation } from '@/lib/d1'

export const runtime = 'nodejs'

// Workout templates by goal
const getWorkoutTemplates = (goal: string) => {
  const templates = {
    lose_weight: [
      { exercise_id: 61, sets: 4, reps: '45 sec', weight: 0 }, // Burpees
      { exercise_id: 68, sets: 4, reps: '45 sec', weight: 0 }, // Mountain Climbers
      { exercise_id: 64, sets: 1, reps: '20 min', weight: 0 }, // Running
      { exercise_id: 65, sets: 3, reps: '15 min', weight: 0 }, // Cycling
      { exercise_id: 57, sets: 3, reps: '12-15', weight: 20 }, // Goblet Squats
      { exercise_id: 54, sets: 3, reps: '10-12', weight: 15 }, // Dumbbell Shoulder Press
      { exercise_id: 56, sets: 3, reps: '15-20', weight: 0 }  // Plank
    ],
    gain_muscle: [
      { exercise_id: 1, sets: 4, reps: '8-12', weight: 60 }, // Barbell Bench Press
      { exercise_id: 3, sets: 3, reps: '10-12', weight: 40 }, // Incline Dumbbell Press
      { exercise_id: 31, sets: 3, reps: '12-15', weight: 30 }, // Tricep Pushdowns
      { exercise_id: 25, sets: 4, reps: '15-20', weight: 10 }, // Lateral Raises
      { exercise_id: 37, sets: 3, reps: '10-12', weight: 50 }, // Barbell Curls
      { exercise_id: 43, sets: 3, reps: '8-10', weight: 80 }, // Barbell Squats
      { exercise_id: 49, sets: 3, reps: '12-15', weight: 40 }, // Leg Extensions
      { exercise_id: 55, sets: 3, reps: '15-20', weight: 0 }  // Crunches
    ],
    maintain: [
      { exercise_id: 1, sets: 3, reps: '10-12', weight: 50 }, // Barbell Bench Press
      { exercise_id: 13, sets: 3, reps: '8-10', weight: 60 }, // Pull-ups
      { exercise_id: 25, sets: 3, reps: '12-15', weight: 8 }, // Lateral Raises
      { exercise_id: 31, sets: 3, reps: '12-15', weight: 25 }, // Tricep Pushdowns
      { exercise_id: 37, sets: 3, reps: '10-12', weight: 40 }, // Barbell Curls
      { exercise_id: 43, sets: 3, reps: '10-12', weight: 60 }, // Barbell Squats
      { exercise_id: 58, sets: 3, reps: '12-15', weight: 30 }, // Leg Press
      { exercise_id: 54, sets: 3, reps: '12-15', weight: 20 }  // Dumbbell Shoulder Press
    ]
  }

  return templates[goal as keyof typeof templates] || templates.maintain
}

// Generate workout plan
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { user_id?: number; date?: string }
    const { user_id, date } = body

    if (!user_id || !date) {
      return NextResponse.json({ success: false, error: 'User ID and date required' }, { status: 400 })
    }

    // Get user info
    const users = await selectQuery('SELECT * FROM users WHERE id = ? LIMIT 1', [user_id])
    if (users.length === 0) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    const user = users[0]
    const goal = user.goal || 'maintain'

    // Clear existing workouts for this date
    await executeMutation('DELETE FROM workouts WHERE user_id = ? AND date = ?', [user_id, date])

    // Get workout template
    const workoutTemplate = getWorkoutTemplates(goal)
    const generatedWorkouts = []

    let orderIndex = 1
    for (const exercise of workoutTemplate) {
      // Get exercise details
      const exerciseResult = await selectQuery('SELECT * FROM exercises WHERE id = ? LIMIT 1', [exercise.exercise_id])
      if (exerciseResult.length > 0) {
        const exerciseDetail = exerciseResult[0]

        // Insert workout
        await executeMutation(
          'INSERT INTO workouts (user_id, date, exercise_name, sets, reps, weight, completed) VALUES (?, ?, ?, ?, ?, ?, 0)',
          [user_id, date, exerciseDetail.name, exercise.sets, exercise.reps, exercise.weight]
        )

        generatedWorkouts.push({
          order_index: orderIndex,
          exercise: exerciseDetail.name,
          muscle_group: exerciseDetail.muscle_group,
          difficulty: exerciseDetail.difficulty,
          sets: exercise.sets,
          reps: exercise.reps,
          weight: exercise.weight,
          equipment_needed: exerciseDetail.equipment_needed,
          safety_instruction: exerciseDetail.safety_instruction,
          gif_url: exerciseDetail.gif_url,
          completed: false
        })

        orderIndex++
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Workout plan generated successfully',
      data: {
        user_id,
        date,
        goal: goal,
        workouts: generatedWorkouts
      }
    })

  } catch (error) {
    console.error('API Error [POST /workout-plans/generate]:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}

// GET: Fetch workout plans
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const date = searchParams.get('date')

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 })
    }

    let sql = `
      SELECT 
        w.*,
        e.difficulty,
        e.muscle_group,
        e.gif_url
      FROM workouts w
      LEFT JOIN exercises e ON w.exercise_name = e.name
      WHERE w.user_id = ?
    `

    const params: any[] = [Number(userId)]

    if (date) {
      sql += ' AND w.date = ?'
      params.push(date)
    }

    sql += ' ORDER BY w.date, w.id'

    const workoutPlans = await selectQuery(sql, params)

    return NextResponse.json({
      success: true,
      data: workoutPlans,
      count: workoutPlans.length
    })

  } catch (error) {
    console.error('API Error [GET /workout-plans]:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}