import { getAllTracks } from "@/lib/tracks"
import { TrackCard } from "@/components/features/track-card"

export const dynamic = 'force-dynamic'

export default async function AllSongsPage() {
    const tracks = await getAllTracks()

    return (
        <div className="h-full px-4 py-6 lg:px-8">
            <div className="mb-8 space-y-1">
                <h2 className="text-2xl font-semibold tracking-tight">
                    All Songs
                </h2>
                <p className="text-sm text-muted-foreground">
                    Explore all tracks in our library.
                </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
                {tracks.map((track) => (
                    <TrackCard
                        key={track.id}
                        track={track}
                        className="w-full flex-auto"
                    />
                ))}
            </div>

            {tracks.length === 0 && (
                <div className="flex h-[400px] items-center justify-center text-muted-foreground">
                    No songs found.
                </div>
            )}
        </div>
    )
}
