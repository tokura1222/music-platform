import { Separator } from "@/components/ui/separator"
import { TrackRow } from "@/components/features/track-row"
import { getTracksByGenre } from "@/lib/tracks"
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

    const tracks = await getTracksByGenre(slug)
    const categoryLabel = CATEGORY_LABELS[genre.category]

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
                        {tracks.length} {tracks.length === 1 ? 'track' : 'tracks'}
                    </p>
                    <Separator className="my-4" />
                </section>

                {/* Track List */}
                <section>
                    {tracks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <p className="text-muted-foreground">
                                このジャンルにはまだ楽曲がありません。
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {tracks.map((track, i) => (
                                <TrackRow key={track.id} track={track} index={i} />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}
