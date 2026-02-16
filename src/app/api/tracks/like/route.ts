import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

export async function POST(request: Request) {
    try {
        const { id, increment = true } = await request.json()
        if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 })

        const key = `song:${id}:likes`
        let likes: number
        if (increment) {
            likes = await redis.incr(key)
        } else {
            // Prevent negative likes if decr
            // But decr is atomic, so let's just allow it for now or check
            likes = await redis.decr(key)
        }

        return NextResponse.json({ likes })
    } catch (error) {
        console.error('Like API Error:', error)
        return NextResponse.json({ error: 'Failed to update likes' }, { status: 500 })
    }
}
