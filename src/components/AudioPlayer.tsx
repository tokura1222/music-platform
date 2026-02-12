'use client';

import { useAudio } from '@/context/AudioContext';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import styles from './AudioPlayer.module.css';

export default function AudioPlayer() {
    const { currentSong, isPlaying, togglePlay, progress, duration, seek, volume, setVolume, nextSong, prevSong } = useAudio();

    if (!currentSong) return null;

    const formatTime = (time: number) => {
        if (isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className={styles.player}>
            <div className={`container ${styles.container}`}>
                <div className={styles.songInfo}>
                    {currentSong.coverPath && (
                        <img
                            src={currentSong.coverHost ? `${currentSong.coverHost}${currentSong.coverPath}` : currentSong.coverPath}
                            alt={currentSong.title}
                            className={styles.cover}
                        />
                    )}
                    <div className={styles.details}>
                        <div className={styles.title}>{currentSong.title}</div>
                        <div className={styles.artist}>{currentSong.artist}</div>
                    </div>
                </div>

                <div className={styles.controls}>
                    <div className={styles.buttons}>
                        <button onClick={prevSong} className={styles.controlBtn}><SkipBack size={20} /></button>
                        <button onClick={togglePlay} className={`${styles.controlBtn} ${styles.playBtn}`}>
                            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                        </button>
                        <button onClick={nextSong} className={styles.controlBtn}><SkipForward size={20} /></button>
                    </div>
                    <div className={styles.progressContainer}>
                        <span className={styles.time}>{formatTime(progress)}</span>
                        <input
                            type="range"
                            min="0"
                            max={duration || 0}
                            value={progress}
                            onChange={(e) => seek(Number(e.target.value))}
                            className={styles.slider}
                        />
                        <span className={styles.time}>{formatTime(duration)}</span>
                    </div>
                </div>

                <div className={styles.volume}>
                    <Volume2 size={20} className={styles.volumeIcon} />
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(e) => setVolume(Number(e.target.value))}
                        className={`${styles.slider} ${styles.volumeSlider}`}
                    />
                </div>
            </div>
        </div>
    );
}
