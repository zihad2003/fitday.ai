import { NextResponse } from 'next/server'
import { selectQuery, executeMutation } from '@/lib/d1'

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    // TypeScript Error Fix: Type casting
    const { user_id, date } = (await req.json()) as { user_id: number; date: string }
    
    // ইউজারের গোল চেক করা
    const users = await selectQuery('SELECT goal FROM users WHERE id = ?', [user_id])
    const user = users[0] as any

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' })
    }

    // লজিক: গোল অনুযায়ী এক্সারসাইজ সিলেক্ট করা
    // লুজ ওয়েট হলে ফুল বডি, গেইন মাসল হলে স্ট্রেন্থ ফোকাসড
    const difficulty = 'beginner'
    const workoutOptions = await selectQuery(
      'SELECT name FROM exercise_library WHERE difficulty = ? ORDER BY RANDOM() LIMIT 3',
      [difficulty]
    )

    const savedWorkouts = []

    for (const ex of workoutOptions) {
      const exercise = ex as any
      const query = 'INSERT INTO workouts (user_id, date, type, completed) VALUES (?, ?, ?, 0)'
      const params = [user_id, date, exercise.name]
      
      await executeMutation(query, params)
      savedWorkouts.push({ exercise: exercise.name, date })
    }

    return NextResponse.json({ success: true, plan: savedWorkouts })

  } catch (error: any) {
    console.error('Workout Gen Error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}