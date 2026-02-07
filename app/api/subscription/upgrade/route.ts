import { NextRequest, NextResponse } from 'next/server'
import { SubscriptionService } from '@/lib/subscription'
import { getUserSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
    try {
        const session = await getUserSession()
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Simulate payment verification delay
        await new Promise(resolve => setTimeout(resolve, 1500))

        const { planId } = await request.json()

        if (planId === 'premium_monthly') {
            await SubscriptionService.upgradeToPremium(session.userId)
            return NextResponse.json({ success: true, message: 'Upgraded to Premium' })
        }

        return NextResponse.json({ success: false, error: 'Invalid plan' }, { status: 400 })

    } catch (error: any) {
        console.error('Subscription Upgrade Error:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
