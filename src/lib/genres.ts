export type GenreCategory = 'instrumentals' | 'vocal'

export interface GenreDefinition {
    slug: string
    name: string
    category: GenreCategory
}

/**
 * Master list of all genres, grouped by category.
 */
export const GENRES: GenreDefinition[] = [
    // ── Instrumentals ──
    { slug: 'inst-piano', name: 'Piano Solo', category: 'instrumentals' },
    { slug: 'inst-lofi', name: 'Lo-Fi / Chill', category: 'instrumentals' },
    { slug: 'inst-acoustic', name: 'Acoustic', category: 'instrumentals' },
    { slug: 'inst-cinematic', name: 'Cinematic', category: 'instrumentals' },
    { slug: 'inst-electronic', name: 'Electronic', category: 'instrumentals' },

    // ── Vocal Songs ──
    { slug: 'vocal-reggae', name: 'Reggae / Roots', category: 'vocal' },
    { slug: 'vocal-pops', name: 'Pops', category: 'vocal' },
    { slug: 'vocal-hiphop', name: 'Hip-Hop', category: 'vocal' },
    { slug: 'vocal-rnb', name: 'R&B / Soul', category: 'vocal' },
    { slug: 'vocal-rock', name: 'Rock', category: 'vocal' },
]

/**
 * Get genre definition by slug.
 */
export function getGenreBySlug(slug: string): GenreDefinition | undefined {
    return GENRES.find(g => g.slug === slug)
}

/**
 * Get all genres belonging to a category.
 */
export function getGenresByCategory(category: GenreCategory): GenreDefinition[] {
    return GENRES.filter(g => g.category === category)
}

/**
 * Category display name mapping.
 */
export const CATEGORY_LABELS: Record<GenreCategory, string> = {
    instrumentals: 'Instrumentals',
    vocal: 'Vocal Songs',
}
