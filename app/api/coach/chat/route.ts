import { NextRequest, NextResponse } from 'next/server';
import { ChatService } from '@/lib/chat-service';
import { getCurrentUser } from '@/lib/session-manager';
import { SubscriptionService } from '@/lib/subscription';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser() as any;
        if (!user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = user.id;

        const body = (await req.json()) as { question: string };
        const { question } = body;

        if (!question) {
            return NextResponse.json({ error: 'Question is required' }, { status: 400 });
        }

        // Check subscription
        const { allowed } = await SubscriptionService.consumeCredit(userId);
        if (!allowed) {
            return NextResponse.json({
                error: 'AI Credits exhausted. Please upgrade.',
                code: 'CREDIT_LIMIT_REACHED'
            }, { status: 402 });
        }

        // In a real app, you'd fetch from actual user state
        const stats = { dailyLimit: 2000, consumed: 1540 }; // Mock

        const answer = await ChatService.askCoach(userId.toString(), question, stats);

        return NextResponse.json({ answer });
    } catch (error: any) {
        console.error('Coach API Error:', error);
        return NextResponse.json({ error: error.message || 'Error communicating with coach' }, { status: 500 });
    }
}
