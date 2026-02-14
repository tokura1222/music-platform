'use client';

import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
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

    const playSong = async (song: Song) => {
        setCurrentSong(song);
        setIsPlaying(true);

        if (audioRef.current) {
            audioRef.current.src = song.url;
            audioRef.current.load(); // Explicitly load the new source

            try {
                await audioRef.current.play();
            } catch (error) {
                console.error("Playback failed:", error);
                setIsPlaying(false);
            }
        }
    };

    const togglePlay = () => {
        if (!currentSong) return;

        if (isPlaying) {
            audioRef.current?.pause();
        } else {
            audioRef.current?.play();
        }
        setIsPlaying(!isPlaying);
    };

    const pause = () => {
        audioRef.current?.pause();
        setIsPlaying(false);
    };

    const nextSong = () => {
        // Implement playlist logic later
        console.log('Next song');
    };

    const prevSong = () => {
        // Implement playlist logic later
        console.log('Prev song');
    };

    const seek = (time: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setProgress(time);
        }
    };

    const setVolume = (vol: number) => {
        if (audioRef.current) {
            audioRef.current.volume = vol;
            setVolumeState(vol);
        }
    };

    return (
        <AudioContext.Provider value={{
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
        }}>
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
