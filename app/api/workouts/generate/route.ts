// app/api/workouts/generate/route.ts - Smart Workout Planner
import { NextRequest, NextResponse } from 'next/server'
import { selectQuery, executeMutation } from '@/lib/d1'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, date } = body

    if (!user_id || !date) {
      return NextResponse.json({ success: false, error: 'User ID and Date required' }, { status: 400 })
    }

    // ১. ইউজারের লক্ষ্য (Goal) জানা
    const users = await selectQuery('SELECT goal, activity_level FROM users WHERE id = ?', [user_id])
    if (users.length === 0) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }
    const user = users[0]

    // ২. ব্যায়ামের ডাটাবেস থেকে সব এক্সারসাইজ আনা
    const allExercises = await selectQuery('SELECT * FROM exercise_library')
    
    // ৩. গোল অনুযায়ী ফিল্টার করা
    let plan: any[] = []
    
    // হেল্পার ফাংশন: র‍্যান্ডম ৩-৪টি ব্যায়াম নেওয়া
    const pickRandom = (arr: any[], count: number) => {
      const shuffled = arr.sort(() => 0.5 - Math.random())
      return shuffled.slice(0, count)
    }

    if (user.goal === 'lose_weight') {
      // ওজন কমাতে: কার্ডিও + ফুল বডি (বেশি ক্যালোরি বার্ন)
      const cardio = allExercises.filter((e: any) => e.muscle_group === 'full_body' || e.muscle_group === 'legs')
      const core = allExercises.filter((e: any) => e.muscle_group === 'core')
      
      plan = [...pickRandom(cardio, 3), ...pickRandom(core, 1)]
    } 
    else if (user.goal === 'gain_muscle') {
      // পেশি বাড়াতে: শক্তি বাড়ানোর ব্যায়াম (Strength)
      const upper = allExercises.filter((e: any) => e.muscle_group === 'chest' || e.muscle_group === 'back')
      const legs = allExercises.filter((e: any) => e.muscle_group === 'legs')
      
      plan = [...pickRandom(upper, 2), ...pickRandom(legs, 2)]
    } 
    else {
      // মেইনটেইন বা ফিটনেস: মিক্সড
      plan = pickRandom(allExercises, 4)
    }

    // ৪. আগের প্ল্যান মুছে ফেলা (ডুপ্লিকেট এড়াতে)
    await executeMutation('DELETE FROM workouts WHERE user_id = ? AND date = ?', [user_id, date])

    // ৫. নতুন প্ল্যান সেভ করা
    for (const exercise of plan) {
      // আমরা 'type' কলামে এক্সারসাইজের নাম এবং সেট সংখ্যা লিখে দেব
      const description = `${exercise.name} (3 Sets x 12 Reps)`
      
      await executeMutation(
        'INSERT INTO workouts (user_id, date, type, completed) VALUES (?, ?, ?, ?)',
        [user_id, date, description, 0]
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Workout plan generated', 
      plan 
    })

  } catch (error) {
    console.error('Error generating workout:', error)
    return NextResponse.json({ success: false, error: 'Failed to generate workout' }, { status: 500 })
  }
}