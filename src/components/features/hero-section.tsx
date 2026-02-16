"use client"

import { Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Track } from "@/types"
import { useAudio } from "@/context/AudioContext"

interface HeroSectionProps {
    track: Track
}

export function HeroSection({ track }: HeroSectionProps) {
    const { playTrack, currentTrack, isPlaying } = useAudio() // Added useAudio hook
    const isCurrent = currentTrack?.id === track.id // Added isCurrent check

    return (
        <div className="relative h-[400px] w-full overflow-hidden rounded-xl">
            {/* Background Image with Gradient */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${track.coverPath || '/images/default-cover.jpg'})` }} // Modified image path
            >
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative flex h-full flex-col justify-end p-8 md:p-12">
                <span className="mb-2 inline-block rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary backdrop-blur-md">
                    Featured Track
                </span>
                <h1 className="mb-2 text-4xl font-bold tracking-tight md:text-6xl text-white shadow-lg">
                    {track.title}
                </h1>
                <p className="mb-6 text-lg text-gray-200 md:text-xl shadow-md">
                    {track.artist}
                </p>
                <div className="flex gap-4">
                    <Button
                        size="lg"
                        className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                        onClick={() => playTrack(track)} // Added onClick handler
                    >
                        <Play className="h-5 w-5 fill-current" />
                        {isCurrent && isPlaying ? "Pause" : "Play Now"} {/* Modified button text */}
                    </Button>
                    <Button size="lg" variant="secondary" className="rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-md border border-white/10">
                        More Info
                    </Button>
                </div>
            </div>
        </div>
    )
}
