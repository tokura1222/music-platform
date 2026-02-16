'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import useSWR from 'swr';

type SongStats = {
    views: number;
    downloads: number;
    likes: number;
};

const STORAGE_KEY = 'likedSongs_v1';

const fetcher = (url: string) => fetch(url).then(res => res.json());

/**
 * Read liked songs from localStorage with schema versioning.
 * Migrates from v0 (unversioned) to v1 if needed.
 */
function readLikedSongs(): Record<string, boolean> {
    try {
        // Try reading v1 first
        const v1 = localStorage.getItem(STORAGE_KEY);
        if (v1) return JSON.parse(v1);

        // Migrate from legacy unversioned key
        const legacy = localStorage.getItem('likedSongs');
        if (legacy) {
            const data = JSON.parse(legacy);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            localStorage.removeItem('likedSongs');
            return data;
        }

        return {};
    } catch {
        return {};
    }
}

function writeLikedSongs(data: Record<string, boolean>) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useSongStats(songId: string) {
    // SWR for automatic deduplication and caching
    const { data, mutate } = useSWR<SongStats>(
        `/api/stats/${encodeURIComponent(songId)}`,
        fetcher,
        {
            fallbackData: { views: 0, downloads: 0, likes: 0 },
            revalidateOnFocus: false,
            dedupingInterval: 10000,
        }
    );

    const stats = data ?? { views: 0, downloads: 0, likes: 0 };
    const [liked, setLiked] = useState(false);

    // Cache liked state in ref to avoid stale closures
    const likedRef = useRef(liked);
    likedRef.current = liked;

    // Load liked state once
    useEffect(() => {
        const likedSongs = readLikedSongs();
        setLiked(!!likedSongs[songId]);
    }, [songId]);

    const trackView = useCallback(async () => {
        try {
            const res = await fetch(`/api/stats/${encodeURIComponent(songId)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'view' }),
            });
            const result = await res.json();
            mutate(prev => prev ? { ...prev, views: result.count } : prev, false);
        } catch (err) {
            console.error('Failed to track view:', err);
        }
    }, [songId, mutate]);

    const trackDownload = useCallback(async () => {
        try {
            const res = await fetch(`/api/stats/${encodeURIComponent(songId)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'download' }),
            });
            const result = await res.json();
            mutate(prev => prev ? { ...prev, downloads: result.count } : prev, false);
        } catch (err) {
            console.error('Failed to track download:', err);
        }
    }, [songId, mutate]);

    const toggleLike = useCallback(async () => {
        const currentLiked = likedRef.current;
        const newLiked = !currentLiked;
        const action = newLiked ? 'like' : 'unlike';

        // Optimistic update
        setLiked(newLiked);
        mutate(
            prev => prev ? { ...prev, likes: prev.likes + (newLiked ? 1 : -1) } : prev,
            false
        );

        // Update localStorage
        const likedSongs = readLikedSongs();
        if (newLiked) {
            likedSongs[songId] = true;
        } else {
            delete likedSongs[songId];
        }
        writeLikedSongs(likedSongs);

        try {
            await fetch(`/api/stats/${encodeURIComponent(songId)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action }),
            });
        } catch (err) {
            console.error('Failed to toggle like:', err);
            // Revert on error
            setLiked(currentLiked);
            mutate(
                prev => prev ? { ...prev, likes: prev.likes + (newLiked ? -1 : 1) } : prev,
                false
            );
        }
    }, [songId, mutate]);

    return { stats, liked, trackView, trackDownload, toggleLike };
}
