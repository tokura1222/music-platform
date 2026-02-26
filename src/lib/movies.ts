import fs from 'fs'
import path from 'path'
import { redis } from '@/lib/redis'
import { Movie } from '@/types'

const MOVIES_DIR = path.join(process.cwd(), 'content/movies')

export const getAllMovies = async (options: { includeHidden?: boolean } = {}): Promise<Movie[]> => {
    try {
        if (!fs.existsSync(MOVIES_DIR)) {
            return []
        }

        const fileNames = fs.readdirSync(MOVIES_DIR)
        const allMoviesData = fileNames
            .filter((fileName) => fileName.endsWith('.json'))
            .map((fileName) => {
                const fullPath = path.join(MOVIES_DIR, fileName)
                const fileContents = fs.readFileSync(fullPath, 'utf8')
                const movieData = JSON.parse(fileContents)

                return {
                    id: fileName.replace(/\.json$/, ''),
                    ...movieData,
                }
            })

        if (allMoviesData.length === 0) return []

        // Use pipeline to fetch all stats in one go
        const pipeline = redis.pipeline()
        allMoviesData.forEach((movie) => {
            pipeline.get(`movie:${movie.id}:plays`)
            pipeline.get(`movie:${movie.id}:likes`)
        })

        const results = await pipeline.exec()

        const movies: Movie[] = allMoviesData.map((movie, index: number) => {
            const playCount = results[index * 2] as number | null
            const likeCount = results[index * 2 + 1] as number | null

            const plays = playCount ? Number(playCount) : 0;
            const likes = likeCount ? Number(likeCount) : 0;

            return {
                ...movie,
                plays,
                likes,
            } as Movie
        })

        // Filter hidden movies unless requested
        let visibleMovies = options.includeHidden
            ? movies
            : movies.filter(movie => !movie.hidden);

        return visibleMovies.sort((a, b) => b.plays - a.plays)
    } catch (error) {
        console.error('Error fetching movies:', error)
        return []
    }
}

/**
 * Get movies filtered by genreSlug.
 */
export const getMoviesByGenre = async (genreSlug: string): Promise<Movie[]> => {
    const allMovies = await getAllMovies()
    return allMovies.filter(movie => movie.genreSlug === genreSlug)
}
