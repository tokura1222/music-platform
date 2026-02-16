"use client"

import { useState, useEffect } from "react"

function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function useDuration(url: string): string {
    const [duration, setDuration] = useState<string>("--:--")

    useEffect(() => {
        if (!url) return

        const audio = new Audio()
        audio.preload = "metadata"

        const handleLoaded = () => {
            if (audio.duration && isFinite(audio.duration)) {
                setDuration(formatDuration(audio.duration))
            }
        }

        audio.addEventListener("loadedmetadata", handleLoaded)
        audio.src = url

        return () => {
            audio.removeEventListener("loadedmetadata", handleLoaded)
            audio.src = ""
        }
    }, [url])

    return duration
}
