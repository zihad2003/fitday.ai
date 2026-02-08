import { NextRequest, NextResponse } from 'next/server'
import { mutate } from '@/lib/database'
import { getCurrentUser } from '@/lib/session-manager'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        const { event_name, feature_name, event_metadata, url } = await request.json() as {
            event_name: string,
            feature_name?: string,
            event_metadata?: any,
            url?: string
        }

        if (!event_name) {
            return NextResponse.json({ success: false, error: 'Event name required' }, { status: 400 })
        }

        const userAgent = request.headers.get('user-agent') || 'unknown'

        await mutate(`
            INSERT INTO analytics_events (user_id, event_name, feature_name, event_metadata, url, user_agent)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [
            user?.id || null,
            event_name,
            feature_name || null,
            event_metadata ? JSON.stringify(event_metadata) : null,
            url || null,
            userAgent
        ])

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Analytics log error:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
