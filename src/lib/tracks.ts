import fs from 'fs'
import path from 'path'
import { redis } from '@/lib/redis'
import { Track } from '@/types'

const SONGS_DIR = path.join(process.cwd(), 'content/songs')

export async function getAllTracks(): Promise<Track[]> {
    // 1. Read JSON files
    if (!fs.existsSync(SONGS_DIR)) {
        return []
    }

    const files = fs.readdirSync(SONGS_DIR).filter(file => file.endsWith('.json'))
    const tracks: Track[] = []

    for (const file of files) {
        try {
            const filePath = path.join(SONGS_DIR, file)
            const content = fs.readFileSync(filePath, 'utf-8')
            const data = JSON.parse(content)
            const id = file.replace('.json', '')

            tracks.push({
                id,
                title: data.title,
                artist: data.artist,
                url: data.url,
                coverPath: data.coverPath,
                category: data.category,
                plays: 0, // Default, will fetch later
                likes: 0,
            })
        } catch (e) {
            console.error(`Error reading track ${file}:`, e)
        }
    }

    // 2. Fetch stats from Redis (Pipeline for performance)
    if (tracks.length > 0) {
        const pipeline = redis.pipeline()
        tracks.forEach(track => {
            pipeline.get<number>(`song:${track.id}:plays`)
            pipeline.get<number>(`song:${track.id}:likes`)
        })

        try {
            const results = await pipeline.exec()
            // results structure: [plays1, likes1, plays2, likes2, ...]
            tracks.forEach((track, index) => {
                const plays = results[index * 2]
                const likes = results[index * 2 + 1]
                track.plays = typeof plays === 'number' ? plays : 0
                track.likes = typeof likes === 'number' ? likes : 0
            })
        } catch (e) {
            console.error("Failed to fetch stats from Redis", e)
        }
    }

    return tracks
}
