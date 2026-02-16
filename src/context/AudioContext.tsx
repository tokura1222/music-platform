"use client"

import React, { createContext, useContext, useState, useRef, useEffect } from 'react'
import { Track } from '@/types'

interface AudioContextType {
    currentTrack: Track | null
    isPlaying: boolean
    volume: number
    currentTime: number
    duration: number
    playTrack: (track: Track) => void
    togglePlay: () => void
    seek: (time: number) => void
    setVolume: (volume: number) => void
}

const AudioContext = createContext<AudioContextType | undefined>(undefined)

export function AudioProvider({ children }: { children: React.ReactNode }) {
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [volume, setVolumeState] = useState(1) // 0-1
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const audioRef = useRef<HTMLAudioElement | null>(null)

    useEffect(() => {
        audioRef.current = new Audio()
        const audio = audioRef.current

        const updateTime = () => setCurrentTime(audio.currentTime)
        const updateDuration = () => setDuration(audio.duration)
        const onEnded = () => setIsPlaying(false)

        audio.addEventListener('timeupdate', updateTime)
        audio.addEventListener('loadedmetadata', updateDuration)
        audio.addEventListener('ended', onEnded)

        return () => {
            audio.pause()
            audio.removeEventListener('timeupdate', updateTime)
            audio.removeEventListener('loadedmetadata', updateDuration)
            audio.removeEventListener('ended', onEnded)
        }
    }, [])

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume
        }
    }, [volume])

    const playTrack = async (track: Track) => {
        if (!audioRef.current) return

        // If same track, just toggle
        if (currentTrack?.id === track.id) {
            togglePlay()
            return
        }

        // New track
        setCurrentTrack(track)
        setIsPlaying(true)
        audioRef.current.src = track.url

        try {
            await audioRef.current.play()

            // Setup MediaSession
            if ('mediaSession' in navigator) {
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: track.title,
                    artist: track.artist,
                    artwork: track.coverPath ? [{ src: track.coverPath, sizes: '512x512', type: 'image/jpeg' }] : []
                });
            }

            // Increment play count
            fetch('/api/tracks/play', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: track.id })
            })
        } catch (e) {
            console.error("Play error:", e)
            setIsPlaying(false)
        }
    }

    const togglePlay = () => {
        if (!audioRef.current || !currentTrack) return
        if (isPlaying) {
            audioRef.current.pause()
            setIsPlaying(false)
        } else { // Resume
            audioRef.current.play()
            setIsPlaying(true)
        }
    }

    const seek = (time: number) => {
        if (!audioRef.current) return
        audioRef.current.currentTime = time
        setCurrentTime(time)
    }

    const setVolume = (vol: number) => {
        const newVol = Math.max(0, Math.min(1, vol))
        setVolumeState(newVol)
    }

    return (
        <AudioContext.Provider value={{ currentTrack, isPlaying, volume, currentTime, duration, playTrack, togglePlay, seek, setVolume }}>
            {children}
        </AudioContext.Provider>
    )
}

export function useAudio() {
    const context = useContext(AudioContext)
    if (context === undefined) {
        throw new Error('useAudio must be used within an AudioProvider')
    }
    return context
}
