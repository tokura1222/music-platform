'use client';

import { useState, useEffect, useCallback } from 'react';

type SongStats = {
    views: number;
    downloads: number;
    likes: number;
};

export function useSongStats(songId: string) {
    const [stats, setStats] = useState<SongStats>({ views: 0, downloads: 0, likes: 0 });
    const [liked, setLiked] = useState(false);

    // Load stats and liked state
    useEffect(() => {
        // Check localStorage for liked state
        const likedSongs = JSON.parse(localStorage.getItem('likedSongs') || '{}');
        setLiked(!!likedSongs[songId]);

        // Fetch stats from API
        fetch(`/api/stats/${encodeURIComponent(songId)}`)
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => console.error('Failed to fetch stats:', err));
    }, [songId]);

    const trackView = useCallback(async () => {
        try {
            const res = await fetch(`/api/stats/${encodeURIComponent(songId)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'view' }),
            });
            const data = await res.json();
            setStats(prev => ({ ...prev, views: data.count }));
        } catch (err) {
            console.error('Failed to track view:', err);
        }
    }, [songId]);

    const trackDownload = useCallback(async () => {
        try {
            const res = await fetch(`/api/stats/${encodeURIComponent(songId)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'download' }),
            });
            const data = await res.json();
            setStats(prev => ({ ...prev, downloads: data.count }));
        } catch (err) {
            console.error('Failed to track download:', err);
        }
    }, [songId]);

    const toggleLike = useCallback(async () => {
        const newLiked = !liked;
        const action = newLiked ? 'like' : 'unlike';

        // Optimistic update
        setLiked(newLiked);
        setStats(prev => ({
            ...prev,
            likes: prev.likes + (newLiked ? 1 : -1),
        }));

        // Save to localStorage
        const likedSongs = JSON.parse(localStorage.getItem('likedSongs') || '{}');
        if (newLiked) {
            likedSongs[songId] = true;
        } else {
            delete likedSongs[songId];
        }
        localStorage.setItem('likedSongs', JSON.stringify(likedSongs));

        try {
            await fetch(`/api/stats/${encodeURIComponent(songId)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action }),
            });
        } catch (err) {
            console.error('Failed to toggle like:', err);
            // Revert on error
            setLiked(!newLiked);
            setStats(prev => ({
                ...prev,
                likes: prev.likes + (newLiked ? -1 : 1),
            }));
        }
    }, [songId, liked]);

    return { stats, liked, trackView, trackDownload, toggleLike };
}
