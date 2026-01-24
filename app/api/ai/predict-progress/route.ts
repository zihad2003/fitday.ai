import { NextRequest, NextResponse } from 'next/server'
import { predictProgress } from '@/lib/ai-progress-predictor'
import { selectQuery } from '@/lib/d1'

export const runtime = 'edge'

/**
 * AI Progress Prediction API
 * POST /api/ai/predict-progress
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as { userId: string | number; targetWeight?: number; targetDate?: string }
        const { userId, targetWeight, targetDate } = body

        if (!userId) {
            return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 })
        }

        // Fetch user and historical progress
        const [users, history] = await Promise.all([
            selectQuery('SELECT * FROM users WHERE id = ?', [Number(userId)]),
            selectQuery(
                'SELECT date, weight_kg as weight FROM user_progress WHERE user_id = ? ORDER BY date DESC LIMIT 30',
                [Number(userId)]
            )
        ])

        if (users.length === 0) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
        }

        const user = users[0] as any
        const latestProgress = history[0] as any || { weight: user.weight_kg, date: new Date().toISOString() }

        // Prepare goal
        const goal = {
            targetWeight: targetWeight || (user.goal === 'lose_weight' ? user.weight_kg - 5 : user.goal === 'gain_muscle' ? user.weight_kg + 3 : user.weight_kg),
            targetDate: targetDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ahead
            type: (user.goal || 'maintain') as any
        }

        // Generate prediction
        const prediction = predictProgress(
            latestProgress,
            history as any[],
            goal as any
        )

        return NextResponse.json({
            success: true,
            data: prediction,
            summary: {
                current: latestProgress.weight,
                target: goal.targetWeight,
                days: Math.ceil((new Date(goal.targetDate).getTime() - Date.now()) / (86400000))
            }
        })

    } catch (error: any) {
        console.error('Progress Prediction API Error:', error)
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to predict progress' },
            { status: 500 }
        )
    }
}
