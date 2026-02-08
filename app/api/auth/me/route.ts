// app/api/auth/me/route.ts - Get Current User API

import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session-manager'

export const runtime = 'nodejs'

export async function GET() {
    try {
        const user = await getCurrentUser()

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Not authenticated' },
                { status: 401 }
            )
        }

        return NextResponse.json({
            success: true,
            user
        })
    } catch (error) {
        console.error('❌ [Me] Error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to get user' },
            { status: 500 }
        )
    }
}
