'use client';

import { Song } from '@/data/songs';
import { useAudio } from '@/context/AudioContext';
import { useSongStats } from '@/hooks/useSongStats';
import { Play, Pause, Download, Heart, Eye } from 'lucide-react';
import styles from './SongCard.module.css';

interface SongCardProps {
    song: Song;
}

export default function SongCard({ song }: SongCardProps) {
    const { currentSong, isPlaying, playSong, togglePlay } = useAudio();
    const { stats, liked, trackView, trackDownload, toggleLike } = useSongStats(song.id);

    const isCurrentSong = currentSong !== null &&
        currentSong.url === song.url;
    const isThisPlaying = isCurrentSong && isPlaying;

    const handlePlayClick = () => {
        if (isCurrentSong) {
            togglePlay();
        } else {
            playSong(song);
            trackView();
        }
    };

    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation();
        trackDownload();
    };

    const formatCount = (n: number) => {
        if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
        return String(n);
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

                <div className={styles.actions}>
                    <button
                        onClick={toggleLike}
                        className={`${styles.actionBtn} ${liked ? styles.liked : ''}`}
                        title="Like"
                    >
                        <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
                        <span className={styles.count}>{formatCount(stats.likes)}</span>
                    </button>

                    <a
                        href={song.url}
                        download
                        className={styles.actionBtn}
                        title="Download"
                        onClick={handleDownload}
                    >
                        <Download size={16} />
                        <span className={styles.count}>{formatCount(stats.downloads)}</span>
                    </a>
                </div>
            </div>

            <div className={styles.statsBar}>
                <span className={styles.stat}>
                    <Eye size={13} />
                    {formatCount(stats.views)}
                </span>
            </div>
        </div>
    );
}
