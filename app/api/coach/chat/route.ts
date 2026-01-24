import { NextRequest, NextResponse } from 'next/server';
import { ChatService } from '@/lib/chat-service';

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as { question: string; userId?: string };
        const { question, userId = 'demo-user' } = body;

        if (!question) {
            return NextResponse.json({ error: 'Question is required' }, { status: 400 });
        }

        // In a real app, you'd fetch from actual user state
        const stats = {
            dailyLimit: 2000,
            consumed: 1540
        };

        const answer = await ChatService.askCoach(userId, question, stats);

        return NextResponse.json({ answer });
    } catch (error: any) {
        console.error('Coach API Error:', error);
        return NextResponse.json({ error: error.message || 'Error communicating with coach' }, { status: 500 });
    }
}
