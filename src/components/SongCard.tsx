'use client';

import { Song } from '@/data/songs';
import { useAudio } from '@/context/AudioContext';
import { Play, Pause, Download } from 'lucide-react';
import styles from './SongCard.module.css';

interface SongCardProps {
    song: Song;
}

export default function SongCard({ song }: SongCardProps) {
    const { currentSong, isPlaying, playSong, togglePlay } = useAudio();

    // Guard against undefined IDs: only consider it the "current song"
    // if both IDs exist and match, AND we also check the URL matches
    const isCurrentSong = currentSong !== null &&
        currentSong.url === song.url;
    const isThisPlaying = isCurrentSong && isPlaying;

    const handlePlayClick = () => {
        if (isCurrentSong) {
            togglePlay();
        } else {
            playSong(song);
        }
    };

    return (
        <div className={styles.card}>
            <div className={styles.imageContainer}>
                <img
                    src={song.coverHost ? `${song.coverHost}${song.coverPath}` : song.coverPath}
                    alt={song.title}
                    className={styles.image}
                />
                <button
                    onClick={handlePlayClick}
                    className={styles.playOverlay}
                >
                    {isThisPlaying ? <Pause fill="currentColor" size={32} /> : <Play fill="currentColor" size={32} />}
                </button>
            </div>

            <div className={styles.content}>
                <div className={styles.info}>
                    <h3 className={styles.title}>{song.title}</h3>
                    <p className={styles.artist}>{song.artist}</p>
                </div>

                <a
                    href={song.url}
                    download
                    className={styles.downloadBtn}
                    title="Download"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Download size={20} />
                </a>
            </div>
        </div>
    );
}
