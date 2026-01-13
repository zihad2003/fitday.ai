import { NextRequest, NextResponse } from 'next/server'
import { selectQuery } from '@/lib/d1'
import { hashPassword } from '@/lib/auth'

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

    if (users.length === 0) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
    }

    const user = users[0] as any
    const storedPassword = user.password // Expected format "salt:hash"

    // 2. Verify Password
    // Handle legacy or different formats safely
    let isValid = false;

    if (storedPassword.includes(':')) {
      const [salt, storedHash] = storedPassword.split(':');
      const attemptHash = await hashPassword(password, salt);
      if (attemptHash === storedHash) {
        isValid = true;
      }
    } else {
      // Fallback for old plain text or unsalted (not recommended but handles legacy dev data)
      if (storedPassword === password) isValid = true;
    }

    if (!isValid) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
    }

    // 3. Return Session Data
    const { password: _, ...safeUser } = user
    return NextResponse.json({ success: true, data: safeUser })

  } catch (error) {
    console.error('Login Error:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}