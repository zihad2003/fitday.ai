import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session-manager'
import { query } from '@/lib/database'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser() as any
        if (!user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const userId = user.id

        const { searchParams } = new URL(request.url)
        const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

        // Fetch user progress for the specific date
        // Note: Schema uses 'user_progress' table with 'water_liters' and 'weight_kg'
        const progressRes = await query(`
            SELECT * FROM user_progress 
            WHERE user_id = ? AND date = ?
        `, [userId, date])

        const progress = progressRes.data?.[0] || null

        return NextResponse.json({
            success: true,
            data: progress
        })

    } catch (error: any) {
        console.error('Daily tracking error:', error)
        return NextResponse.json({ error: 'Failed to fetch tracking data' }, { status: 500 })
    }
}
