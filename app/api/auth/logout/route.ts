// app/api/auth/logout/route.ts - Clean Logout API

import { NextResponse } from 'next/server'
import { destroySession } from '@/lib/session-manager'

export const runtime = 'nodejs'

export async function POST() {
    try {
        await destroySession()

        return NextResponse.json({
            success: true,
            message: 'Logged out successfully'
        })
    } catch (error) {
        console.error('❌ [Logout] Error:', error)
        return NextResponse.json(
            { success: false, error: 'Logout failed' },
            { status: 500 }
        )
    }
}
