"use client"

import { Play, Pause } from "lucide-react"
import { Track } from "@/types"
import { Button } from "@/components/ui/button"
import { useAudio } from "@/context/AudioContext"

interface TrackCardProps {
    track: Track
}

export function TrackCard({ track }: TrackCardProps) {
    const { playTrack, currentTrack, isPlaying } = useAudio()
    const isCurrent = currentTrack?.id === track.id
    const isCurrentPlaying = isCurrent && isPlaying

    return (
        <div className="group relative w-[180px] flex-none space-y-3">
            {/* Cover Image Container */}
            <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
                {track.coverPath ? (
                    <img
                        src={track.coverPath}
                        alt={track.title}
                        className="h-full w-full object-contain bg-black/20 transition-all duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="h-full w-full bg-secondary flex items-center justify-center text-muted-foreground">
                        No Cover
                    </div>
                )}

                {/* Hover Overlay */}
                <div className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity duration-300 ${isCurrentPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <Button
                        size="icon"
                        className="rounded-full bg-primary text-primary-foreground shadow-xl hover:scale-105 transition-transform"
                        onClick={() => playTrack(track)}
                    >
                        {isCurrentPlaying ? (
                            <Pause className="h-6 w-6 fill-current" />
                        ) : (
                            <Play className="h-6 w-6 fill-current ml-1" />
                        )}
                    </Button>
                </div>
            </div>

            {/* Info */}
            <div className="space-y-1 text-sm">
                <h3 className="font-medium leading-none truncate">{track.title}</h3>
                <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
            </div>
        </div>
    )
}
