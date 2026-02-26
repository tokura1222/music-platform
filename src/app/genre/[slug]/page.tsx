import { Separator } from "@/components/ui/separator"
import { TrackRow } from "@/components/features/track-row"
import { MovieCard } from "@/components/features/movie-card"
import { getTracksByGenre } from "@/lib/tracks"
import { getMoviesByGenre } from "@/lib/movies"
import { getGenreBySlug, CATEGORY_LABELS } from "@/lib/genres"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"

export const dynamic = 'force-dynamic'

interface GenrePageProps {
    params: Promise<{ slug: string }>
}

export default async function GenrePage({ params }: GenrePageProps) {
    const { slug } = await params
    const genre = getGenreBySlug(slug)

    if (!genre) {
        notFound()
    }

    const categoryLabel = CATEGORY_LABELS[genre.category]

    let items: any[] = []
    if (genre.category === 'movie') {
        items = await getMoviesByGenre(slug)
    } else {
        items = await getTracksByGenre(slug)
    }

    return (
        <div className="h-full px-4 py-6 lg:px-8">
            <div className="space-y-6">
                {/* Header */}
                <section>
                    <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs">
                            {categoryLabel}
                        </Badge>
                    </div>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight">
                        {genre.name}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {items.length} {genre.category === 'movie' ? (items.length === 1 ? 'movie' : 'movies') : (items.length === 1 ? 'track' : 'tracks')}
                    </p>
                    <Separator className="my-4" />
                </section>

                {/* List */}
                <section>
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <p className="text-muted-foreground">
                                このジャンルにはまだ{genre.category === 'movie' ? '動画' : '楽曲'}がありません。
                            </p>
                        </div>
                    ) : (
                        genre.category === 'movie' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {items.map((movie) => (
                                    <MovieCard key={movie.id} movie={movie} />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {items.map((track, i) => (
                                    <TrackRow key={track.id} track={track} index={i} />
                                ))}
                            </div>
                        )
                    )}
                </section>
            </div>
        </div>
    )
}
