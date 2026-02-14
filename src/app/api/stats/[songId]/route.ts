import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ songId: string }> }
) {
    const { songId } = await params;

    const [views, downloads, likes] = await Promise.all([
        redis.get<number>(`song:${songId}:views`) ?? 0,
        redis.get<number>(`song:${songId}:downloads`) ?? 0,
        redis.get<number>(`song:${songId}:likes`) ?? 0,
    ]);

    return NextResponse.json({
        views: views || 0,
        downloads: downloads || 0,
        likes: likes || 0,
    });
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ songId: string }> }
) {
    const { songId } = await params;
    const body = await request.json();
    const { action } = body as { action: 'view' | 'download' | 'like' | 'unlike' };

    let result: number = 0;

    switch (action) {
        case 'view':
            result = await redis.incr(`song:${songId}:views`);
            break;
        case 'download':
            result = await redis.incr(`song:${songId}:downloads`);
            break;
        case 'like':
            result = await redis.incr(`song:${songId}:likes`);
            break;
        case 'unlike':
            result = await redis.decr(`song:${songId}:likes`);
            if (result < 0) {
                await redis.set(`song:${songId}:likes`, 0);
                result = 0;
            }
            break;
        default:
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ action, count: result });
}
