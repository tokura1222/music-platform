export type Song = {
    id: string;
    title: string;
    artist: string;
    url: string; // Path to audio file
    coverHost?: string;
    coverPath?: string;
    category?: 'instrument' | 'reggae' | 'other';
};

// Demo data (no longer used in production — songs are loaded from content/songs/ folder)
export const songs: Song[] = [];
