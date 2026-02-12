import SongCard from '@/components/SongCard';
import styles from './page.module.css';
import { getSongs } from '@/lib/songs';

export default async function Home() {
  const songs = await getSongs();

  return (
    <div className={`container ${styles.container}`}>
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>Discover Free Music</h1>
        <p className={styles.heroSubtitle}>
          High quality, royalty-free music for your creative projects.
          No sign up required.
        </p>
      </section>

      <section>
        <h2 className={styles.sectionTitle}>Featured Tracks</h2>
        <div className={styles.grid}>
          {songs.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </div>
      </section>
    </div>
  );
}
