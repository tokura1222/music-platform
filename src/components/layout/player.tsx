"use client"

import { Play, SkipBack, SkipForward, Repeat, Shuffle, Volume2, Mic2, ListMusic, MonitorSpeaker } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

interface PlayerProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Player({ className }: PlayerProps) {
    return (
        <div className={cn("fixed bottom-0 left-0 right-0 z-50 flex h-20 items-center justify-between border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4", className)}>
            {/* Left: Track Info */}
            <div className="flex w-1/3 items-center gap-4">
                <div className="h-14 w-14 overflow-hidden rounded-md bg-muted">
                    {/* Placeholder for Album Art */}
                    <div className="h-full w-full bg-primary/20 animate-pulse" />
                </div>
                <div className="flex flex-col justify-center overflow-hidden">
                    <span className="truncate text-sm font-semibold hover:underline cursor-pointer">
                        JAPAN TOUR
                    </span>
                    <span className="truncate text-xs text-muted-foreground hover:underline cursor-pointer">
                        toku
                    </span>
                </div>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    <span className="sr-only">Like</span>
                    {/* Heart Icon can go here */}
                </Button>
            </div>

            {/* Center: Controls */}
            <div className="flex w-1/3 flex-col items-center justify-center gap-2">
                <div className="flex items-center gap-4">
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <Shuffle className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-foreground">
                        <SkipBack className="h-5 w-5 fill-current" />
                    </Button>
                    <Button size="icon" className="h-10 w-10 rounded-full shadow-md" variant="default">
                        <Play className="h-5 w-5 fill-current ml-0.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-foreground">
                        <SkipForward className="h-5 w-5 fill-current" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <Repeat className="h-4 w-4" />
                    </Button>
                </div>
                <div className="flex w-full max-w-md items-center gap-2 text-xs text-muted-foreground">
                    <span>0:00</span>
                    <Slider defaultValue={[33]} max={100} step={1} className="w-full hover:cursor-pointer" />
                    <span>3:45</span>
                </div>
            </div>

            {/* Right: Volume & Tools */}
            <div className="flex w-1/3 justify-end items-center gap-2">
                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    <Mic2 className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    <ListMusic className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    <MonitorSpeaker className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2 w-32">
                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                    <Slider defaultValue={[75]} max={100} step={1} className="w-full" />
                </div>
            </div>
        </div>
    )
}
