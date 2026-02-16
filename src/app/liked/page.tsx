import { getAllTracks } from "@/lib/tracks"
import { LikedSongsList } from "./liked-songs-list"
import { Separator } from "@/components/ui/separator"

export default async function LikedPage() {
    const allTracks = await getAllTracks()
    return (
        <div className="h-full px-4 py-6 lg:px-8">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-semibold tracking-tight">
                            Liked Songs
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Your personal collection. (Saved in browser)
                        </p>
                    </div>
                </div>
                <Separator className="my-4" />
                <LikedSongsList allTracks={allTracks} />
            </div>
        </div>
    )
}
