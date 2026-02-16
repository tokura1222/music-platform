export interface Track {
    id: string
    title: string
    artist: string
    url: string
    coverPath?: string
    category?: string
    // Stats
    plays: number
    likes: number
    // Optional metadata not yet in real data
    bpm?: number
    duration?: string
    genre?: string
}
