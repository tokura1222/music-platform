"use client"

import React, { createContext, useContext, useState, useCallback } from 'react'
import { Movie } from '@/types'
import { useAudio } from '@/context/AudioContext'

interface VideoContextType {
    currentMovie: Movie | null
    isPlaying: boolean
    playMovie: (movie: Movie) => void
    togglePlay: () => void
    closeMovie: () => void
    setPlayingState: (playing: boolean) => void
}

const VideoContext = createContext<VideoContextType | undefined>(undefined)

export function VideoProvider({ children }: { children: React.ReactNode }) {
    const [currentMovie, setCurrentMovie] = useState<Movie | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const { togglePlay: toggleAudioPlay, isPlaying: isAudioPlaying } = useAudio()

    const playMovie = useCallback((movie: Movie) => {
        // もし音楽が再生中なら止める
        if (isAudioPlaying) {
            toggleAudioPlay()
        }
        setCurrentMovie(movie)
        setIsPlaying(true)
    }, [isAudioPlaying, toggleAudioPlay])

    const togglePlay = useCallback(() => {
        setIsPlaying((prev) => !prev)
    }, [])

    const closeMovie = useCallback(() => {
        setCurrentMovie(null)
        setIsPlaying(false)
    }, [])

    const setPlayingState = useCallback((playing: boolean) => {
        setIsPlaying(playing)
    }, [])

    const value = React.useMemo(() => ({
        currentMovie,
        isPlaying,
        playMovie,
        togglePlay,
        closeMovie,
        setPlayingState
    }), [currentMovie, isPlaying, playMovie, togglePlay, closeMovie, setPlayingState])

    return (
        <VideoContext.Provider value={value}>
            {children}
        </VideoContext.Provider>
    )
}

export function useVideo() {
    const context = useContext(VideoContext)
    if (context === undefined) {
        throw new Error('useVideo must be used within a VideoProvider')
    }
    return context
}
