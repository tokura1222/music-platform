"use client"

import { Play } from "lucide-react"
import { Movie } from "@/types"
import { Button } from "@/components/ui/button"
import { useVideo } from "@/context/VideoContext"
import { cn } from "@/lib/utils"

interface MovieCardProps {
    movie: Movie
    className?: string
}

export function MovieCard({ movie, className }: MovieCardProps) {
    const { playMovie, currentMovie, isPlaying } = useVideo()
    const isCurrent = currentMovie?.id === movie.id
    const isCurrentPlaying = isCurrent && isPlaying

    return (
        <div className={cn("group relative w-full flex-col space-y-3", className)}>
            {/* Cover Image Container */}
            <div className="relative aspect-video overflow-hidden rounded-md bg-muted">
                {movie.thumbnailUrl ? (
                    <img
                        src={movie.thumbnailUrl}
                        alt={movie.title}
                        className="h-full w-full object-cover bg-black/20 transition-all duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="h-full w-full bg-secondary flex items-center justify-center text-muted-foreground">
                        No Thumbnail
                    </div>
                )}

                {/* Hover Overlay */}
                <div className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity duration-300 ${isCurrentPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <Button
                        size="icon"
                        className="rounded-full bg-primary text-primary-foreground shadow-xl hover:scale-105 transition-transform"
                        onClick={() => playMovie(movie)}
                        aria-label={isCurrentPlaying ? "再生中" : "動画を再生"}
                    >
                        {isCurrentPlaying ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><rect width="14" height="14" x="5" y="5" rx="1" ry="1" /></svg> // 簡便のため停止風アイコン
                        ) : (
                            <Play className="h-6 w-6 fill-current ml-1" />
                        )}
                    </Button>
                </div>
            </div>

            {/* Info */}
            <div className="space-y-1 text-sm">
                <h3 className="font-medium leading-tight line-clamp-2">{movie.title}</h3>
                <p className="text-xs text-muted-foreground truncate">{movie.artist}</p>
            </div>
        </div>
    )
}
