"use client"

import React, { createContext, useContext, useState, useRef, useEffect } from 'react'
import { Track } from '@/types'

interface AudioContextType {
    currentTrack: Track | null
    isPlaying: boolean
    volume: number
    playTrack: (track: Track, playlist?: Track[]) => void
    togglePlay: () => void
    setVolume: (volume: number) => void
}

interface AudioTimeContextType {
    currentTime: number
    duration: number
    seek: (time: number) => void
}

const AudioContext = createContext<AudioContextType | undefined>(undefined)
const AudioTimeContext = createContext<AudioTimeContextType | undefined>(undefined)

export function AudioProvider({ children }: { children: React.ReactNode }) {
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [volume, setVolumeState] = useState(1) // 0-1
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const currentTrackRef = useRef<Track | null>(null)
    const playlistRef = useRef<Track[]>([])
    const playNextTrackRef = useRef<(() => void) | null>(null)

    useEffect(() => {
        audioRef.current = new Audio()
        const audio = audioRef.current

        const updateTime = () => setCurrentTime(audio.currentTime)
        const updateDuration = () => setDuration(audio.duration)
        const onEnded = () => {
            if (playNextTrackRef.current) {
                playNextTrackRef.current()
            } else {
                setIsPlaying(false)
            }
        }

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

    const togglePlay = React.useCallback(() => {
        if (!audioRef.current || !currentTrack) return
        if (isPlaying) {
            audioRef.current.pause()
            setIsPlaying(false)
        } else { // Resume
            audioRef.current.play()
            setIsPlaying(true)
        }
    }, [currentTrack, isPlaying])

    const playTrack = React.useCallback(async (track: Track, playlist?: Track[]) => {
        if (!audioRef.current) return

        if (playlist) {
            playlistRef.current = playlist
        } else {
            // Keep existing playlist if the track is in it, otherwise clear it so it doesn't jump to unrelated songs
            if (!playlistRef.current.find(t => t.id === track.id)) {
                playlistRef.current = []
            }
        }

        // If same track, just toggle
        if (currentTrack?.id === track.id) {
            if (isPlaying) {
                audioRef.current.pause()
                setIsPlaying(false)
            } else {
                audioRef.current.play()
                setIsPlaying(true)
            }
            return
        }

        // New track
        setCurrentTrack(track)
        currentTrackRef.current = track
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
    }, [currentTrack, isPlaying])

    const playNextTrack = React.useCallback(() => {
        const current = currentTrackRef.current
        const pl = playlistRef.current
        if (!current || pl.length === 0) {
            setIsPlaying(false)
            return
        }

        const idx = pl.findIndex(t => t.id === current.id)
        if (idx !== -1 && idx < pl.length - 1) {
            const nextTrack = pl[idx + 1]
            playTrack(nextTrack, pl)
        } else {
            setIsPlaying(false) // Reached the end
        }
    }, [playTrack])

    useEffect(() => {
        playNextTrackRef.current = playNextTrack
    }, [playNextTrack])

    const seek = React.useCallback((time: number) => {
        if (!audioRef.current) return
        audioRef.current.currentTime = time
        setCurrentTime(time)
    }, [])

    const setVolume = React.useCallback((vol: number) => {
        const newVol = Math.max(0, Math.min(1, vol))
        setVolumeState(newVol)
    }, [])

    // Memoize context values to prevent unnecessary re-renders
    const audioContextValue = React.useMemo(() => ({
        currentTrack,
        isPlaying,
        volume,
        playTrack,
        togglePlay,
        setVolume
    }), [currentTrack, isPlaying, volume, playTrack, togglePlay, setVolume])

    const audioTimeContextValue = React.useMemo(() => ({
        currentTime,
        duration,
        seek
    }), [currentTime, duration, seek])

    return (
        <AudioContext.Provider value={audioContextValue}>
            <AudioTimeContext.Provider value={audioTimeContextValue}>
                {children}
            </AudioTimeContext.Provider>
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

export function useAudioTime() {
    const context = useContext(AudioTimeContext)
    if (context === undefined) {
        throw new Error('useAudioTime must be used within an AudioProvider')
    }
    return context
}
