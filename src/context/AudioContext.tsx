'use client';

import React, { createContext, useContext, useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Song } from '@/data/songs';

type AudioContextType = {
    currentSong: Song | null;
    isPlaying: boolean;
    playSong: (song: Song) => void;
    togglePlay: () => void;
    pause: () => void;
    nextSong: () => void;
    prevSong: () => void;
    audioRef: React.RefObject<HTMLAudioElement | null>;
    progress: number;
    duration: number;
    seek: (time: number) => void;
    volume: number;
    setVolume: (vol: number) => void;
};

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
    const [currentSong, setCurrentSong] = useState<Song | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolumeState] = useState(1);

    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateProgress = () => setProgress(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration);
        const onEnded = () => setIsPlaying(false);
        const onError = (e: Event) => {
            console.error("Audio error:", (e.target as HTMLAudioElement).error);
            setIsPlaying(false);
        };

        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('loadedmetadata', updateDuration);
        audio.addEventListener('ended', onEnded);
        audio.addEventListener('error', onError);

        return () => {
            audio.removeEventListener('timeupdate', updateProgress);
            audio.removeEventListener('loadedmetadata', updateDuration);
            audio.removeEventListener('ended', onEnded);
            audio.removeEventListener('error', onError);
        };
    }, []);

    const playSong = useCallback(async (song: Song) => {
        setCurrentSong(song);
        setIsPlaying(true);

        if (audioRef.current) {
            audioRef.current.src = song.url;
            audioRef.current.load();

            try {
                await audioRef.current.play();
            } catch (error) {
                console.error("Playback failed:", error);
                setIsPlaying(false);
            }
        }
    }, []);

    const togglePlay = useCallback(() => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(prev => !prev);
    }, [isPlaying]);

    const pause = useCallback(() => {
        audioRef.current?.pause();
        setIsPlaying(false);
    }, []);

    const nextSong = useCallback(() => {
        // Implement playlist logic later
        console.log('Next song');
    }, []);

    const prevSong = useCallback(() => {
        // Implement playlist logic later
        console.log('Prev song');
    }, []);

    const seek = useCallback((time: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setProgress(time);
        }
    }, []);

    const setVolume = useCallback((vol: number) => {
        if (audioRef.current) {
            audioRef.current.volume = vol;
            setVolumeState(vol);
        }
    }, []);

    // Memoize the context value to prevent unnecessary re-renders
    const value = useMemo<AudioContextType>(() => ({
        currentSong,
        isPlaying,
        playSong,
        togglePlay,
        pause,
        nextSong,
        prevSong,
        audioRef,
        progress,
        duration,
        seek,
        volume,
        setVolume
    }), [currentSong, isPlaying, playSong, togglePlay, pause, nextSong, prevSong, progress, duration, seek, volume, setVolume]);

    return (
        <AudioContext.Provider value={value}>
            {children}
            <audio
                ref={audioRef}
                style={{ display: 'none' }}
                preload="metadata"
            />
        </AudioContext.Provider>
    );
}

export function useAudio() {
    const context = useContext(AudioContext);
    if (context === undefined) {
        throw new Error('useAudio must be used within an AudioProvider');
    }
    return context;
}
