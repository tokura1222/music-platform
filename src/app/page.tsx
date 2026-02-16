import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { HeroSection } from "@/components/features/hero-section"
import { TrackCard } from "@/components/features/track-card"
import { TrackRow } from "@/components/features/track-row"
import { mockTracks } from "@/lib/mock-data"

export default function HomePage() {
  const featuredTrack = mockTracks[0];
  const newReleases = mockTracks.slice(1, 5);
  const trending = mockTracks;

  return (
    <div className="h-full px-4 py-6 lg:px-8">
      <div className="space-y-8">
        {/* Hero Section */}
        <section>
          <HeroSection track={featuredTrack} />
        </section>

        {/* New Releases (Horizontal List) */}
        <section>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight">
                New Releases
              </h2>
              <p className="text-sm text-muted-foreground">
                Fresh reggae vibes for you.
              </p>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="relative">
            <ScrollArea>
              <div className="flex space-x-4 pb-4">
                {newReleases.map((track) => (
                  <TrackCard key={track.id} track={track} />
                ))}
                {/* Duplicate for demo interactions */}
                {newReleases.map((track) => (
                  <TrackCard key={`dup-${track.id}`} track={track} />
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        </section>

        {/* Trending (Vertical List) */}
        <section>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight">
                Top Charts
              </h2>
              <p className="text-sm text-muted-foreground">
                Most played tracks this week.
              </p>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="space-y-1">
            {trending.map((track, i) => (
              <TrackRow key={track.id} track={track} index={i} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
