'use client';

import Link from 'next/link';
import { Search, Music } from 'lucide-react';
import styles from './Header.module.css';

export default function Header() {
    return (
        <header className={styles.header}>
            <div className={`container ${styles.container}`}>
                <Link href="/" className={styles.logo}>
                    <Music className={styles.icon} />
                    <span>Zion online</span>
                </Link>

                <nav className={styles.nav}>
                    <Link href="/" className={styles.link}>Home</Link>
                    <Link href="/browse" className={styles.link}>Browse</Link>
                </nav>

                <div className={styles.search}>
                    <Search className={styles.searchIcon} size={18} />
                    <input
                        type="text"
                        placeholder="Search music..."
                        className={styles.searchInput}
                    />
                </div>
            </div>
        </header>
    );
}
