import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={`container ${styles.container}`}>
                <p>&copy; {new Date().getFullYear()} Zion online. All rights reserved.</p>
                <p className={styles.credit}>Detailed for hobby use.</p>
            </div>
        </footer>
    );
}
