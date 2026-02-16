import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

export async function POST(request: Request) {
    try {
        const { id } = await request.json()
        if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 })

        // Increment plays
        const plays = await redis.incr(`song:${id}:plays`)
        return NextResponse.json({ plays })
    } catch (error) {
        console.error('Play API Error:', error)
        return NextResponse.json({ error: 'Failed to increment plays' }, { status: 500 })
    }
}
