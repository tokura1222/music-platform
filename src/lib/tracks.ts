import fs from 'fs'
import path from 'path'
import { redis } from '@/lib/redis'
import { Track } from '@/types'

const SONGS_DIR = path.join(process.cwd(), 'content/songs')

export const getAllTracks = async (options: { includeHidden?: boolean, includeFreePlan?: boolean } = {}): Promise<Track[]> => {
    try {
        if (!fs.existsSync(SONGS_DIR)) {
            return []
        }

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

        if (allTracksData.length === 0) return []

        // Use pipeline to fetch all stats in one go
        const pipeline = redis.pipeline()
        allTracksData.forEach((track) => {
            pipeline.get(`song:${track.id}:plays`)
            pipeline.get(`song:${track.id}:likes`)
        })

        const results = await pipeline.exec()

        const tracks: Track[] = allTracksData.map((track, index: number) => {
            const playCount = results[index * 2] as number | null
            const likeCount = results[index * 2 + 1] as number | null

            const plays = playCount ? Number(playCount) : 0;
            const likes = likeCount ? Number(likeCount) : 0;

            return {
                ...track,
                plays,
                likes,
            } as Track
        })

        // Filter hidden tracks unless requested
        let visibleTracks = options.includeHidden
            ? tracks
            : tracks.filter(track => !track.hidden);

        // Filter free plan tracks unless requested
        visibleTracks = options.includeFreePlan
            ? visibleTracks
            : visibleTracks.filter(track => !track.isFreePlan);

        return visibleTracks.sort((a, b) => b.plays - a.plays)
    } catch (error) {
        console.error('Error fetching tracks:', error)
        return []
    }
}

/**
 * Get tracks filtered by genreSlug.
 */
export const getTracksByGenre = async (genreSlug: string): Promise<Track[]> => {
    const allTracks = await getAllTracks()
    return allTracks.filter(track => track.genreSlug === genreSlug)
}
