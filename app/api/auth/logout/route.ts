import { NextRequest, NextResponse } from 'next/server'
import { destroySession } from '@/lib/session'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
    await destroySession()
    return NextResponse.json({ success: true, message: 'Logged out' })
}
