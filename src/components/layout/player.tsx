"use client"

import { Play, SkipBack, SkipForward, Repeat, Shuffle, Volume2, Mic2, ListMusic, MonitorSpeaker, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { useAudio } from "@/context/AudioContext"

interface PlayerProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Player({ className }: PlayerProps) {
    const { currentTrack, isPlaying, togglePlay, volume, setVolume, currentTime, duration, seek } = useAudio()

    const formatTime = (time: number) => {
        if (isNaN(time)) return "0:00"
        const minutes = Math.floor(time / 60)
        const seconds = Math.floor(time % 60)
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }

    const handleSeek = (value: number[]) => {
        seek(value[0])
    }

    return (
        <div className={cn("fixed bottom-0 left-0 right-0 z-50 flex h-20 items-center justify-between border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4", className)}>
            {/* Left: Track Info */}
            <div className="flex w-1/3 items-center gap-4">
                {currentTrack ? (
                    <>
                        <div className="h-14 w-14 flex-none overflow-hidden rounded-md bg-muted">
                            {currentTrack.coverPath ? (
                                <img src={currentTrack.coverPath} alt={currentTrack.title} className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full bg-primary/20 flex items-center justify-center">
                                    <ListMusic className="h-6 w-6 text-primary" />
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col justify-center overflow-hidden min-w-0">
                            <span className="truncate text-sm font-semibold hover:underline cursor-pointer">
                                {currentTrack.title}
                            </span>
                            <span className="truncate text-xs text-muted-foreground hover:underline cursor-pointer">
                                {currentTrack.artist}
                            </span>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center gap-4 opacity-50">
                        <div className="h-14 w-14 rounded-md bg-muted" />
                        <div className="flex flex-col gap-2">
                            <div className="h-4 w-24 bg-muted rounded" />
                            <div className="h-3 w-16 bg-muted rounded" />
                        </div>
                    </div>
                )}
            </div>

            {/* Center: Controls */}
            <div className="flex w-1/3 flex-col items-center justify-center gap-2">
                <div className="flex items-center gap-4">
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" disabled={!currentTrack}>
                        <Shuffle className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-foreground" disabled={!currentTrack}>
                        <SkipBack className="h-5 w-5 fill-current" />
                    </Button>
                    <Button
                        size="icon"
                        className="h-10 w-10 rounded-full shadow-md"
                        variant="default"
                        onClick={togglePlay}
                        disabled={!currentTrack}
                    >
                        {isPlaying ? (
                            <Pause className="h-5 w-5 fill-current ml-0.5" />
                        ) : (
                            <Play className="h-5 w-5 fill-current ml-0.5" />
                        )}
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-foreground" disabled={!currentTrack}>
                        <SkipForward className="h-5 w-5 fill-current" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" disabled={!currentTrack}>
                        <Repeat className="h-4 w-4" />
                    </Button>
                </div>
                <div className="flex w-full max-w-md items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatTime(currentTime)}</span>
                    <Slider
                        value={[currentTime]}
                        max={duration || 100}
                        step={1}
                        className="w-full hover:cursor-pointer"
                        onValueChange={handleSeek}
                        disabled={!currentTrack}
                    />
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            {/* Right: Volume & Tools */}
            <div className="flex w-1/3 justify-end items-center gap-2">
                <div className="flex items-center gap-2 w-32">
                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                    <Slider
                        value={[volume]}
                        max={1}
                        step={0.01}
                        className="w-full"
                        onValueChange={(vals) => setVolume(vals[0])}
                    />
                </div>
            </div>
        </div>
    )
}
