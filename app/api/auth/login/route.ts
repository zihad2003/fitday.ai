// app/api/auth/login/route.ts - Clean Login API

import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail } from '@/lib/database'
import { verifyPassword, sanitizeUser } from '@/lib/auth-utils'
import { createSession } from '@/lib/session-manager'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    const { email, password } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    console.log('[Login] Attempting login for:', email)

    // Get user from database
    const user = await getUserByEmail(email)

    if (!user) {
      console.log('[Login] User not found:', email)
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash)

    if (!isValidPassword) {
      console.log('[Login] Invalid password for:', email)
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Create session
    const safeUser = sanitizeUser(user)
    await createSession(safeUser)

    console.log('✅ [Login] Success for:', email)

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: safeUser
    })

  } catch (error: any) {
    console.error('❌ [Login] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Login failed. Please try again.' },
      { status: 500 }
    )
  }
}