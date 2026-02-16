"use client"

import { Play } from "lucide-react"
import { Track } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"

interface TrackCardProps {
    track: Track
}

export function TrackCard({ track }: TrackCardProps) {
    return (
        <div className="group relative w-[180px] flex-none space-y-3">
            {/* Cover Image Container */}
            <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
                <img
                    src={track.coverImage}
                    alt={track.title}
                    className="h-full w-full object-cover transition-all duration-300 group-hover:scale-105"
                />
                {/* Hover Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <Button size="icon" className="rounded-full bg-primary text-primary-foreground shadow-xl hover:scale-105 transition-transform">
                        <Play className="h-6 w-6 fill-current ml-1" />
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
