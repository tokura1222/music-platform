import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { HeroSection } from "@/components/features/hero-section"
import { TrackCard } from "@/components/features/track-card"
import { TrackRow } from "@/components/features/track-row"
import { getAllTracks } from "@/lib/tracks"

export const dynamic = 'force-dynamic'

export default async function FreePlanExclusivePage() {
    // Fetch all tracks including free plan tracks
    const allTracks = await getAllTracks({ includeFreePlan: true })

    // Filter only tracks marked as isFreePlan (SUNO Free Plan)
    const tracks = allTracks.filter(track => track.isFreePlan)

    // Fallback if no free plan tracks
    if (tracks.length === 0) {
        return (
            <div className="flex h-[calc(100vh-140px)] items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold tracking-tight">No Tracks Found</h2>
                    <p className="text-muted-foreground mt-2">
                        There are currently no tracks marked as "SUNO Free Plan".
                    </p>
                </div>
            </div>
        )
    }

    const featuredTrack = tracks[0];
    const otherTracks = tracks.slice(1);

    return (
        <div className="h-full px-4 py-6 lg:px-8">
            <div className="space-y-8">
                <div className="mb-4">
                    <h1 className="text-3xl font-bold tracking-tight">Exclusive Free Tracks</h1>
                    <p className="text-muted-foreground mt-1">
                        Special collection of tracks created using the SUNO Free Plan.
                    </p>
                </div>

                {/* Hero Section */}
                <section>
                    <HeroSection track={featuredTrack} />
                </section>

                {otherTracks.length > 0 && (
                    <>
                        {/* All Output (Horizontal List) */}
                        <section>
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-semibold tracking-tight">
                                        Library
                                    </h2>
                                </div>
                            </div>
                            <Separator className="my-4" />
                            <div className="relative">
                                <ScrollArea>
                                    <div className="flex space-x-4 pb-4">
                                        {otherTracks.map((track) => (
                                            <TrackCard key={track.id} track={track} />
                                        ))}
                                    </div>
                                    <ScrollBar orientation="horizontal" />
                                </ScrollArea>
                            </div>
                        </section>

                        {/* List View (Vertical List) */}
                        <section>
                            <div className="flex items-center justify-between mt-8">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-semibold tracking-tight">
                                        All Tracks
                                    </h2>
                                </div>
                            </div>
                            <Separator className="my-4" />
                            <div className="space-y-1">
                                {otherTracks.map((track, i) => (
                                    <TrackRow key={track.id} track={track} index={i} />
                                ))}
                            </div>
                        </section>
                    </>
                )}
            </div>
        </div>
    )
}
