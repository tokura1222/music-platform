"use client"

import { Play, Heart, Download, MoreHorizontal, Pause } from "lucide-react"
import { Track } from "@/types"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useAudio } from "@/context/AudioContext"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useDuration } from "@/hooks/useDuration"

interface TrackRowProps {
    track: Track
    index: number
}

export function TrackRow({ track, index }: TrackRowProps) {
    const { playTrack, currentTrack, isPlaying } = useAudio()
    const [isLiked, setIsLiked] = useState(false)
    const duration = useDuration(track.url)
    const isCurrent = currentTrack?.id === track.id
    const isCurrentPlaying = isCurrent && isPlaying

    useEffect(() => {
        // Check local storage for like status
        const likedSongs = JSON.parse(localStorage.getItem('likedTracks') || '[]')
        setIsLiked(likedSongs.includes(track.id))
    }, [track.id])

    const handleDownload = () => {
        toast.success(`Downloading ${track.title}...`, {
            description: "Thanks for downloading! Please consider supporting us.",
            action: {
                label: "Support",
                onClick: () => document.querySelector<HTMLButtonElement>('[data-donate-trigger]')?.click(),
            },
        })
        // Real download logic here
        const link = document.createElement('a')
        link.href = track.url
        link.download = `${track.title}.mp3` // approximation
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handleLike = async () => {
        const newLikedState = !isLiked
        setIsLiked(newLikedState)

        // Update Local Storage
        const likedSongs = JSON.parse(localStorage.getItem('likedTracks') || '[]')
        if (newLikedState) {
            if (!likedSongs.includes(track.id)) likedSongs.push(track.id)
        } else {
            const index = likedSongs.indexOf(track.id)
            if (index > -1) likedSongs.splice(index, 1)
        }
        localStorage.setItem('likedTracks', JSON.stringify(likedSongs))

        // Update Server (Global Stats) - Only increment on like, don't decrement global stats for local unlike for now (optional choice)
        // Actually, let's just increment/decrement
        fetch('/api/tracks/like', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: track.id, increment: newLikedState })
        })

        toast.success(newLikedState ? "Added to Liked Songs" : "Removed from Liked Songs")
    }

    return (
        <div className="group flex items-center gap-4 rounded-md p-2 hover:bg-muted/50 transition-colors">
            {/* Index / Play Button */}
            <div className="relative w-8 h-8 flex items-center justify-center text-sm text-muted-foreground">
                <span className={cn("transition-opacity duration-200", (isCurrentPlaying || "group-hover:opacity-0") && isCurrentPlaying ? "opacity-0" : "group-hover:opacity-0")}>
                    {index + 1}
                </span>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "absolute inset-0 h-8 w-8 transition-opacity duration-200",
                        isCurrentPlaying ? "opacity-100 text-primary" : "opacity-0 group-hover:opacity-100"
                    )}
                    onClick={() => playTrack(track)}
                    aria-label={isCurrentPlaying ? "一時停止" : "再生"}
                >
                    {isCurrentPlaying ? (
                        <Pause className="h-4 w-4 fill-current" />
                    ) : (
                        <Play className="h-4 w-4 fill-current" />
                    )}
                </Button>
            </div>

            {/* Cover */}
            <div className="h-10 w-10 flex-none overflow-hidden rounded bg-muted">
                {track.coverPath ? (
                    <img src={track.coverPath} alt={track.title} className="h-full w-full object-cover" />
                ) : (
                    <div className="h-full w-full bg-secondary" />
                )}
            </div>

            {/* Title & Artist */}
            <div className="flex-1 min-w-0">
                <div className={`truncate font-medium text-sm ${isCurrent ? "text-primary" : ""}`}>{track.title}</div>
                <div className="truncate text-xs text-muted-foreground">{track.artist}</div>
            </div>

            {/* Stats (Hidden on mobile) */}
            <div className="hidden md:flex items-center gap-3 w-32 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                    <Play className="h-3 w-3" />
                    {track.plays.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    {track.likes.toLocaleString()}
                </span>
            </div>
            <div className="hidden sm:block w-14 text-xs text-muted-foreground text-right">
                {duration}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn("h-8 w-8 hover:text-primary", isLiked ? "text-primary" : "text-muted-foreground")}
                    onClick={handleLike}
                    aria-label={isLiked ? "いいねを取り消す" : "いいね"}
                >
                    <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={handleDownload} aria-label="ダウンロード">
                    <Download className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" aria-label="その他のオプション">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
