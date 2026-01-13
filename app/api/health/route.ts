import { NextResponse } from 'next/server';
import { selectQuery } from '@/lib/d1';

export const runtime = 'edge';

export async function GET() {
    try {
        const data = await selectQuery('SELECT 1 as health');
        if (data === null) {
            return NextResponse.json({
                success: false,
                status: 'Database Offline',
                error: 'D1 binding missing or failed'
            }, { status: 503 });
        }
        return NextResponse.json({
            success: true,
            status: 'Operational',
            db: 'Healthy',
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            status: 'Error',
            error: error.message
        }, { status: 500 });
    }
}
