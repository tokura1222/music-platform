import SongCard from '@/components/SongCard';
import styles from './page.module.css';
import { getSongs } from '@/lib/songs';

export const dynamic = 'force-dynamic';

const CATEGORY_CONFIG = {
  instrument: { label: '🎸 Instrument', order: 1 },
  reggae: { label: '🎶 Reggae', order: 2 },
  other: { label: '📁 その他', order: 3 },
} as const;

export default async function Home() {
  const songs = await getSongs();

  // Group songs by category
  const grouped = songs.reduce((acc, song) => {
    const cat = song.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(song);
    return acc;
  }, {} as Record<string, typeof songs>);

  // Sort categories by configured order
  const sortedCategories = Object.entries(grouped).sort(([a], [b]) => {
    const orderA = CATEGORY_CONFIG[a as keyof typeof CATEGORY_CONFIG]?.order ?? 99;
    const orderB = CATEGORY_CONFIG[b as keyof typeof CATEGORY_CONFIG]?.order ?? 99;
    return orderA - orderB;
  });

  return (
    <div className={`container ${styles.container}`}>
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>Discover Free Music</h1>
        <p className={styles.heroSubtitle}>
          High quality, royalty-free music for your creative projects.
          No sign up required.
        </p>
      </section>

      {sortedCategories.map(([category, categorySongs]) => {
        const config = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG]
          || { label: category };
        return (
          <section key={category} className={styles.categorySection}>
            <h2 className={styles.sectionTitle}>{config.label}</h2>
            <div className={styles.grid}>
              {categorySongs.map((song, index) => (
                <SongCard key={song.id || `song-${index}`} song={song} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
