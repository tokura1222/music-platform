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
            likes = await redis.decr(key)
            // Prevent negative likes
            if (likes < 0) {
                await redis.set(key, 0)
                likes = 0
            }
        }

        return NextResponse.json({ likes })
    } catch (error) {
        console.error('Like API Error:', error)
        return NextResponse.json({ error: 'Failed to update likes' }, { status: 500 })
    }
}
