import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

export async function POST(request: Request) {
    try {
        const { id } = await request.json()
        if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 })

        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        // Increment plays using pipeline
        const pipeline = redis.pipeline();
        pipeline.incr(`song:${id}:plays`);
        pipeline.incr(`stats:plays:daily:${today}`);
        pipeline.incr(`song:${id}:plays:daily:${today}`); // Track per-song daily stats too

        const results = await pipeline.exec();
        const plays = results[0] as number;

        return NextResponse.json({ plays })
    } catch (error) {
        console.error('Play API Error:', error)
        return NextResponse.json({ error: 'Failed to increment plays' }, { status: 500 })
    }
}
