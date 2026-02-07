import { NextRequest, NextResponse } from 'next/server'
import { selectQuery } from '@/lib/d1'
import { verifyPassword } from '@/lib/auth'
import { createSession } from '@/lib/session'

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body as any

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password required' }, { status: 400 })
    }

    // 1. Fetch User (Include password field)
    const users = await selectQuery('SELECT * FROM users WHERE email = ?', [email])

    if (users === null) {
      return NextResponse.json({ success: false, error: 'Database Connection Error. Please verify D1 bindings.' }, { status: 503 })
    }

    if (users.length === 0) {
      console.log(`[Login] No user found for email: ${email}`);
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
    }

    const user = users[0] as any
    const storedPassword = user.password // Expected format "salt:hash"

    // 2. Verify Password
    const isValid = await verifyPassword(password, storedPassword);

    if (!isValid) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
    }

    // 3. Create Session (HttpOnly Cookie)
    const { password: _, ...safeUser } = user
    await createSession(safeUser)

    return NextResponse.json({ success: true, message: 'Login successful' })

  } catch (error) {
    console.error('Login Error:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}