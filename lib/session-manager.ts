// lib/session-manager.ts - Clean Session Management

/**
 * SESSION MANAGEMENT
 * 
 * Simple JWT-based session management with HttpOnly cookies
 */

import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { User, SessionPayload } from '@/lib/types'

const SECRET_KEY = process.env.APP_SECRET || 'fitday-default-secret-change-in-production'
const key = new TextEncoder().encode(SECRET_KEY)

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

/**
 * Create a new session for a user
 */
export async function createSession(user: User) {
    try {
        const expires = new Date(Date.now() + SESSION_DURATION)

        const token = await new SignJWT({ user, expires: expires.toISOString() })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime(expires)
            .sign(key)

        const cookieStore = await cookies()
        cookieStore.set('session', token, {
            expires,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/'
        })

        console.log('✅ [Session] Created for user:', user.email)
        return { success: true }
    } catch (error) {
        console.error('❌ [Session] Creation failed:', error)
        return { success: false, error: 'Failed to create session' }
    }
}

/**
 * Verify a session token string
 */
export async function verifySession(token: string): Promise<SessionPayload | null> {
    try {
        const { payload } = await jwtVerify(token, key, {
            algorithms: ['HS256']
        })
        return payload as unknown as SessionPayload
    } catch (error) {
        return null
    }
}

/**
 * Get current session
 */
export async function getSession() {
    try {
        const cookieStore = await cookies()
        const sessionCookie = cookieStore.get('session')

        if (!sessionCookie?.value) {
            return null
        }

        return await verifySession(sessionCookie.value)
    } catch (error) {
        console.error('❌ [Session] Verification failed:', error)
        return null
    }
}

/**
 * Destroy current session
 */
export async function destroySession() {
    try {
        const cookieStore = await cookies()
        cookieStore.set('session', '', {
            expires: new Date(0),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/'
        })

        console.log('✅ [Session] Destroyed')
        return { success: true }
    } catch (error) {
        console.error('❌ [Session] Destruction failed:', error)
        return { success: false, error: 'Failed to destroy session' }
    }
}

/**
 * Get current user from session
 */
export async function getCurrentUser(): Promise<User | null> {
    const session = await getSession()
    return session?.user || null
}
