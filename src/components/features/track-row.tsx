"use client"

import { Play, Heart, Download, MoreHorizontal } from "lucide-react"
import { Track } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface TrackRowProps {
    track: Track
    index: number
}

export function TrackRow({ track, index }: TrackRowProps) {
    const handleDownload = () => {
        toast.success(`Downloaded ${track.title}`, {
            description: "Thanks for downloading! Please consider supporting us.",
            action: {
                label: "Support",
                onClick: () => document.querySelector<HTMLButtonElement>('[data-donate-trigger]')?.click(), // Hacky but works for prototype
            },
        })
    }

    return (
        <div className="group flex items-center gap-4 rounded-md p-2 hover:bg-muted/50 transition-colors">
            {/* Index / Play Button */}
            <div className="w-8 text-center text-sm text-muted-foreground">
                <span className="group-hover:hidden">{index + 1}</span>
                <Button variant="ghost" size="icon" className="hidden h-8 w-8 group-hover:inline-flex -ml-2">
                    <Play className="h-4 w-4 fill-current" />
                </Button>
            </div>

            {/* Cover */}
            <div className="h-10 w-10 flex-none overflow-hidden rounded bg-muted">
                <img src={track.coverImage} alt={track.title} className="h-full w-full object-cover" />
            </div>

            {/* Title & Artist */}
            <div className="flex-1 min-w-0">
                <div className="truncate font-medium text-sm">{track.title}</div>
                <div className="truncate text-xs text-muted-foreground">{track.artist}</div>
            </div>

            {/* Stats (Hidden on mobile) */}
            <div className="hidden md:block w-24 text-xs text-muted-foreground">
                {track.plays.toLocaleString()} plays
            </div>
            <div className="hidden sm:block w-16 text-xs text-muted-foreground">
                {track.duration}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                    <Heart className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={handleDownload}>
                    <Download className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
