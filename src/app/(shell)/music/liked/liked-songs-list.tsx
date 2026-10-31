"use client"

import { useEffect, useState } from "react"
import { Track } from "@/types"
import { TrackRow } from "@/components/features/track-row"

interface LikedSongsListProps {
    allTracks: Track[]
}

export function LikedSongsList({ allTracks }: LikedSongsListProps) {
    const [likedTracks, setLikedTracks] = useState<Track[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const likedIds = JSON.parse(localStorage.getItem('likedTracks') || '[]')
        const filtered = allTracks.filter(track => likedIds.includes(track.id))
        setLikedTracks(filtered)
        setIsLoading(false)
    }, [allTracks])

    if (isLoading) {
        return <div className="p-4 text-muted-foreground">Loading...</div>
    }

    if (likedTracks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-muted-foreground">No liked songs yet.</p>
                <p className="text-xs text-muted-foreground mt-1">Go browse and give some hearts!</p>
            </div>
        )
    }

    return (
        <div className="space-y-1">
            {likedTracks.map((track, i) => (
                <TrackRow key={track.id} track={track} index={i} playlist={likedTracks} />
            ))}
        </div>
    )
}
