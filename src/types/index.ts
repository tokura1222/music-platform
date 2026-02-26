export interface Track {
    id: string
    title: string
    artist: string
    url: string
    coverPath?: string
    category?: 'instrumentals' | 'vocal' | string
    genreSlug?: string
    hidden?: boolean
    isFreePlan?: boolean
    // Stats
    plays: number
    likes: number
    // Optional metadata
    bpm?: number
    duration?: string
    genre?: string
}

export interface Movie {
    id: string
    title: string
    artist: string
    youtubeId: string
    thumbnailUrl?: string
    description?: string
    genreSlug?: string
    hidden?: boolean
    // Stats
    plays: number
    likes: number
}
