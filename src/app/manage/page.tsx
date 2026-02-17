'use client';

import { useState, useEffect, FormEvent } from 'react';
import { GENRES, getGenresByCategory, getGenreBySlug } from '@/lib/genres';
import styles from './manage.module.css';

type Status = {
    type: 'success' | 'error' | 'info';
    message: string;
    details?: string;
};

export default function ManagePage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [gitConfigured, setGitConfigured] = useState(false);

    // Login state
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginError, setLoginError] = useState('');

    // Song form state
    const [title, setTitle] = useState('');
    const [artist, setArtist] = useState('');
    const [genreSlug, setGenreSlug] = useState(GENRES[0].slug);
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [publishing, setPublishing] = useState(false);
    const [status, setStatus] = useState<Status | null>(null);

    // Check auth on mount & get git config
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch('/api/admin/session');
                setIsAuthenticated(res.ok);
                if (res.ok) {
                    await fetchGitConfig();
                }
            } catch {
                setIsAuthenticated(false);
            } finally {
                setIsCheckingAuth(false);
            }
        };
        checkAuth();
    }, []);

    const fetchGitConfig = async () => {
        try {
            const res = await fetch('/api/admin/config');
            if (res.ok) {
                const config = await res.json();
                setGitConfigured(config.configured ?? false);
            }
        } catch (error) {
            console.error('Failed to fetch git config', error);
        }
    };

    // ── Login ──
    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        setLoginLoading(true);
        setLoginError('');

        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json();

            if (res.ok) {
                setIsAuthenticated(true);
                setUsername('');
                setPassword('');
                fetchGitConfig();
            } else {
                setLoginError(data.error || 'ログインに失敗しました');
            }
        } catch {
            setLoginError('接続エラーが発生しました');
        } finally {
            setLoginLoading(false);
        }
    };

    // ── Logout ──
    const handleLogout = async () => {
        await fetch('/api/admin/logout', { method: 'POST' });
        setIsAuthenticated(false);
        setGitConfigured(false);
    };

    // ── Publish ──
    const handlePublish = async (e: FormEvent) => {
        e.preventDefault();
        setStatus(null);

        if (!audioFile) {
            setStatus({ type: 'error', message: '音声ファイルを選択してください' });
            return;
        }

        if (!gitConfigured) {
            setStatus({
                type: 'error',
                message: 'GitHub設定が読み込めませんでした。環境変数が設定されているか確認してください。'
            });
            return;
        }

        try {
            setPublishing(true);

            // 1. Upload audio file via server API
            setStatus({ type: 'info', message: '音声ファイルをアップロード中...' });
            const audioFormData = new FormData();
            audioFormData.append('file', audioFile);
            const audioRes = await fetch('/api/admin/upload', {
                method: 'POST',
                body: audioFormData,
            });
            if (!audioRes.ok) {
                const err = await audioRes.json();
                throw new Error(err.error || '音声ファイルのアップロードに失敗しました');
            }
            const audioData = await audioRes.json();
            const audioUrl = audioData.filePath; // e.g. /music/filename.mp3

            // 2. Upload cover file (optional) via server API
            let coverPath: string | undefined;
            if (coverFile) {
                setStatus({ type: 'info', message: 'カバー画像をアップロード中...' });
                const coverFormData = new FormData();
                coverFormData.append('file', coverFile);
                const coverRes = await fetch('/api/admin/upload', {
                    method: 'POST',
                    body: coverFormData,
                });
                if (!coverRes.ok) {
                    const err = await coverRes.json();
                    throw new Error(err.error || 'カバー画像のアップロードに失敗しました');
                }
                const coverData = await coverRes.json();
                coverPath = coverData.filePath;
            }

            // 3. Publish song metadata via server API
            setStatus({ type: 'info', message: '楽曲情報を公開中...' });
            const selectedGenre = getGenreBySlug(genreSlug);
            const publishRes = await fetch('/api/admin/publish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    artist,
                    category: selectedGenre?.category || 'vocal',
                    genreSlug,
                    url: audioUrl,
                    coverPath,
                }),
            });

            if (!publishRes.ok) {
                const err = await publishRes.json();
                throw new Error(err.error || '楽曲の公開に失敗しました');
            }

            const publishData = await publishRes.json();

            if (publishData.success) {
                setStatus({
                    type: 'success',
                    message: '🎉 アップロード成功！ デプロイ完了まで数分お待ちください。',
                    details: publishData.message
                });
                // Reset form
                setTitle('');
                setArtist('');
                setGenreSlug(GENRES[0].slug);
                setAudioFile(null);
                setCoverFile(null);
            } else {
                throw new Error(publishData.message || '公開に失敗しました');
            }

        } catch (err) {
            console.error(err);
            setStatus({
                type: 'error',
                message: err instanceof Error ? err.message : '予期しないエラーが発生しました',
            });
        } finally {
            setPublishing(false);
        }
    };

    // ── Loading ──
    if (isCheckingAuth) {
        return (
            <div className={styles.pageContainer}>
                <div className={styles.loginCard}>
                    <p style={{ textAlign: 'center', color: 'var(--secondary-foreground)' }}>
                        読み込み中...
                    </p>
                </div>
            </div>
        );
    }

    // ── Login Screen ──
    if (!isAuthenticated) {
        return (
            <div className={styles.pageContainer}>
                <div className={styles.loginCard}>
                    <h1 className={styles.loginTitle}>管理者ログイン</h1>
                    <form onSubmit={handleLogin}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>ユーザー名</label>
                            <input
                                type="text"
                                className={styles.input}
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                placeholder="admin"
                                required
                                autoComplete="username"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>パスワード</label>
                            <input
                                type="password"
                                className={styles.input}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                autoComplete="current-password"
                            />
                        </div>
                        {loginLoading && <p style={{ textAlign: 'center', fontSize: '0.8rem' }}>認証中...</p>}
                        {loginError && (
                            <div className={styles.statusError}>{loginError}</div>
                        )}
                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={loginLoading}
                        >
                            ログイン
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // ── Admin Dashboard ──
    return (
        <div className={styles.pageContainer}>
            <div className={styles.topBar}>
                <div>
                    <h1 className={styles.pageTitle}>楽曲管理</h1>
                    <p className={styles.pageDescription}>
                        サーバー経由でGitHubへアップロードします
                    </p>
                </div>
                <button onClick={handleLogout} className={styles.logoutBtn}>
                    ログアウト
                </button>
            </div>

            <form onSubmit={handlePublish}>
                <div className={styles.formGroup}>
                    <label className={styles.label}>タイトル *</label>
                    <input
                        type="text"
                        className={styles.input}
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="楽曲のタイトル"
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>アーティスト *</label>
                    <input
                        type="text"
                        className={styles.input}
                        value={artist}
                        onChange={e => setArtist(e.target.value)}
                        placeholder="アーティスト名"
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>ジャンル *</label>
                    <select
                        className={styles.select}
                        value={genreSlug}
                        onChange={e => setGenreSlug(e.target.value)}
                    >
                        <optgroup label="Instrumentals">
                            {getGenresByCategory('instrumentals').map(g => (
                                <option key={g.slug} value={g.slug}>{g.name}</option>
                            ))}
                        </optgroup>
                        <optgroup label="Vocal Songs">
                            {getGenresByCategory('vocal').map(g => (
                                <option key={g.slug} value={g.slug}>{g.name}</option>
                            ))}
                        </optgroup>
                    </select>
                </div>

                <hr className={styles.divider} />

                <div className={styles.formGroup}>
                    <label className={styles.label}>音声ファイル *</label>
                    <div className={styles.fileInputWrapper}>
                        <input
                            type="file"
                            accept=".mp3,.wav,.ogg,.m4a"
                            className={styles.fileInput}
                            onChange={e => setAudioFile(e.target.files?.[0] || null)}
                        />
                        {audioFile && <p className={styles.fileStatus}>選択中: {audioFile.name}</p>}
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>カバー画像（任意）</label>
                    <div className={styles.fileInputWrapper}>
                        <input
                            type="file"
                            accept="image/*"
                            className={styles.fileInput}
                            onChange={e => setCoverFile(e.target.files?.[0] || null)}
                        />
                        {coverFile && <p className={styles.fileStatus}>選択中: {coverFile.name}</p>}
                    </div>
                </div>

                <hr className={styles.divider} />

                <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={publishing}
                >
                    {publishing ? (
                        <><span className={styles.spinner} /> アップロード中...</>
                    ) : (
                        '🚀 公開してGit Push'
                    )}
                </button>

                {status && (
                    <div
                        className={
                            status.type === 'success'
                                ? styles.statusSuccess
                                : status.type === 'error'
                                    ? styles.statusError
                                    : styles.statusInfo
                        }
                    >
                        <div>{status.message}</div>
                        {status.details && (
                            <div style={{ marginTop: '0.4rem', opacity: 0.8, fontSize: '0.78rem' }}>
                                {status.details}
                            </div>
                        )}
                    </div>
                )}
            </form>
        </div>
    );
}
