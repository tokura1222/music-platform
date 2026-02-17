export interface Track {
    id: string
    title: string
    artist: string
    url: string
    coverPath?: string
    category?: 'instrumentals' | 'vocal' | string
    genreSlug?: string
    hidden?: boolean
    // Stats
    plays: number
    likes: number
    // Optional metadata
    bpm?: number
    duration?: string
    genre?: string
}
