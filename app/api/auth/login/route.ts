// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { selectQuery } from '@/lib/d1'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and Password required' }, { status: 400 })
    }

    // পাসওয়ার্ড চেক করা
    // (Note: প্রোডাকশনে আমরা পাসওয়ার্ড হ্যাশ করি, আপাতত প্লেইন টেক্সট রাখা হচ্ছে শিক্ষার উদ্দেশ্যে)
    const users = await selectQuery('SELECT * FROM users WHERE email = ? AND password = ?', [email, password])

    if (users.length > 0) {
      const user = users[0]
      // পাসওয়ার্ড রিমুভ করে ফ্রন্টেন্ডে পাঠানো (সিকিউরিটি)
      delete user.password 
      
      return NextResponse.json({ success: true, data: user })
    } else {
      return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 })
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Login failed' }, { status: 500 })
  }
}