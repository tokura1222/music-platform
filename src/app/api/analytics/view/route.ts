import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function POST(request: Request) {
    try {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        const pipeline = redis.pipeline();
        pipeline.incr('stats:views:total');
        pipeline.incr(`stats:views:daily:${today}`);

        await pipeline.exec();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Analytics View Error:', error);
        // Fail silently to not impact user experience
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
