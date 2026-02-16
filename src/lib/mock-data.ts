export interface Track {
    id: string;
    title: string;
    artist: string;
    coverImage: string;
    audioUrl: string;
    genre: string;
    bpm: number;
    duration: string;
    likes: number;
    plays: number;
}

export const mockTracks: Track[] = [
    {
        id: "1",
        title: "JAPAN TOUR",
        artist: "toku",
        coverImage: "https://images.unsplash.com/photo-1514525253440-b393452e8d03?q=80&w=2670&auto=format&fit=crop",
        audioUrl: "#",
        genre: "Reggae",
        bpm: 90,
        duration: "3:45",
        likes: 1240,
        plays: 5400,
    },
    {
        id: "2",
        title: "Roots Rock",
        artist: "Jah Works",
        coverImage: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2670&auto=format&fit=crop",
        audioUrl: "#",
        genre: "Roots",
        bpm: 78,
        duration: "4:20",
        likes: 890,
        plays: 3200,
    },
    {
        id: "3",
        title: "Dub Session Vol.1",
        artist: "Echo Chamber",
        coverImage: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=2670&auto=format&fit=crop",
        audioUrl: "#",
        genre: "Dub",
        bpm: 140,
        duration: "5:10",
        likes: 2100,
        plays: 8900,
    },
    {
        id: "4",
        title: "One Love",
        artist: "Unity Band",
        coverImage: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2670&auto=format&fit=crop",
        audioUrl: "#",
        genre: "Lovers Rock",
        bpm: 85,
        duration: "3:30",
        likes: 1560,
        plays: 6700,
    },
    {
        id: "5",
        title: "Raggamuffin Style",
        artist: "DJ Selecta",
        coverImage: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=2670&auto=format&fit=crop",
        audioUrl: "#",
        genre: "Dancehall",
        bpm: 100,
        duration: "3:15",
        likes: 3400,
        plays: 12000,
    },
    {
        id: "6",
        title: "Sunset Vibes",
        artist: "Island Crew",
        coverImage: "https://images.unsplash.com/photo-1507838153414-b4b713384ebd?q=80&w=2670&auto=format&fit=crop",
        audioUrl: "#",
        genre: "Reggae",
        bpm: 92,
        duration: "4:05",
        likes: 980,
        plays: 4100,
    },
];
