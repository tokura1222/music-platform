export type GenreCategory = 'instrumentals' | 'vocal' | 'movie'

export interface GenreDefinition {
    slug: string
    name: string
    category: GenreCategory
}

import genresData from '../../content/genres.json';

/**
 * Master list of all genres, grouped by category.
 */
export const GENRES: GenreDefinition[] = genresData as GenreDefinition[];

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
    movie: 'Movies'
}
