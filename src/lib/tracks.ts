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

        const fileNames = fs.readdirSync(SONGS_DIR)
        const allTracksData = fileNames
            .filter((fileName) => fileName.endsWith('.json'))
            .map((fileName) => {
                const fullPath = path.join(SONGS_DIR, fileName)
                const fileContents = fs.readFileSync(fullPath, 'utf8')
                const songData = JSON.parse(fileContents)

                return {
                    id: fileName.replace(/\.json$/, ''),
                    ...songData,
                }
            })

        // 2. Fetch stats from Redis
        if (allTracksData.length === 0) return []

        // Use pipeline to fetch all stats in one go
        const pipeline = redis.pipeline()
        allTracksData.forEach((track: any) => {
            pipeline.get(`track:${track.id}:plays`)
            pipeline.get(`track:${track.id}:likes`)
        })

        const results = await pipeline.exec()

        // 3. Combine data
        const tracks: Track[] = allTracksData.map((track: any, index: number) => {
            const playCount = results[index * 2] as number | null
            const likeCount = results[index * 2 + 1] as number | null

            return {
                ...track,
                plays: playCount || 0,
                likes: likeCount || 0,
            }
        })

        // Sort by plays (descending) by default
        return tracks.sort((a, b) => b.plays - a.plays)
    } catch (error) {
        console.error('Error fetching tracks:', error)
        // Return empty array to prevent crash
        return []
    }
}
