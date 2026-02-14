export type Song = {
    id: string;
    title: string;
    artist: string;
    url: string; // Path to audio file
    coverHost?: string;
    coverPath?: string;
    duration: number; // in seconds
    category?: 'instrument' | 'reggae' | 'other';
};

export const songs: Song[] = [
    {
        id: '1',
        title: 'Demo Track 1',
        artist: 'Antigravity',
        url: '/music/demo1.mp3',
        coverHost: 'https://images.unsplash.com',
        coverPath: '/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
        duration: 180,
    },
    {
        id: '2',
        title: 'Demo Track 2',
        artist: 'Antigravity',
        url: '/music/demo2.mp3',
        coverHost: 'https://images.unsplash.com',
        coverPath: '/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop',
        duration: 210,
    },
    {
        id: '3',
        title: 'Demo Track 3',
        artist: 'Antigravity',
        url: '/music/demo3.mp3',
        coverHost: 'https://images.unsplash.com',
        coverPath: '/photo-1514525253440-b393452e8d26?w=300&h=300&fit=crop',
        duration: 195,
    },
];
