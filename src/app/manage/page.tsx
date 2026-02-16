'use client';

import { useState, useEffect, FormEvent } from 'react';
import styles from './manage.module.css';

type Status = {
    type: 'success' | 'error' | 'info';
    message: string;
    details?: string;
};

export default function ManagePage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    // Login state
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginError, setLoginError] = useState('');

    // Song form state
    const [title, setTitle] = useState('');
    const [artist, setArtist] = useState('');
    const [category, setCategory] = useState('other');
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [audioPath, setAudioPath] = useState('');
    const [coverPath, setCoverPath] = useState('');
    const [publishing, setPublishing] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState<Status | null>(null);

    // Check auth on mount
    useEffect(() => {
        fetch('/api/admin/session')
            .then(res => {
                setIsAuthenticated(res.ok);
            })
            .catch(() => setIsAuthenticated(false))
            .finally(() => setIsCheckingAuth(false));
    }, []);

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
    };

    // ── File Upload ──
    const uploadFile = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/admin/upload', {
            method: 'POST',
            body: formData,
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'アップロードに失敗しました');
        }

        const data = await res.json();
        return data.filePath;
    };

    // ── Publish ──
    const handlePublish = async (e: FormEvent) => {
        e.preventDefault();
        setStatus(null);

        if (!audioFile && !audioPath) {
            setStatus({ type: 'error', message: '音声ファイルを選択してください' });
            return;
        }

        try {
            // Upload files if not already uploaded
            setUploading(true);
            let finalAudioPath = audioPath;
            let finalCoverPath = coverPath;

            if (audioFile && !audioPath) {
                finalAudioPath = await uploadFile(audioFile);
                setAudioPath(finalAudioPath);
            }

            if (coverFile && !coverPath) {
                finalCoverPath = await uploadFile(coverFile);
                setCoverPath(finalCoverPath);
            }
            setUploading(false);

            // Publish
            setPublishing(true);
            setStatus({ type: 'info', message: '楽曲を公開中...' });

            const res = await fetch('/api/admin/publish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    artist,
                    category,
                    url: finalAudioPath,
                    coverPath: finalCoverPath || undefined,
                }),
            });

            const data = await res.json();

            if (data.success) {
                setStatus({
                    type: 'success',
                    message: `🎉 サイトの更新が完了しました！ (${data.strategy === 'github-api' ? 'GitHub API' : 'ローカルGit'})`,
                    details: data.message,
                });
                // Reset form
                setTitle('');
                setArtist('');
                setCategory('other');
                setAudioFile(null);
                setCoverFile(null);
                setAudioPath('');
                setCoverPath('');
            } else {
                setStatus({
                    type: 'error',
                    message: data.message || '公開に失敗しました',
                    details: data.details,
                });
            }
        } catch (err) {
            setStatus({
                type: 'error',
                message: err instanceof Error ? err.message : '予期しないエラーが発生しました',
            });
        } finally {
            setPublishing(false);
            setUploading(false);
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
                        {loginError && (
                            <div className={styles.statusError}>{loginError}</div>
                        )}
                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={loginLoading}
                        >
                            {loginLoading ? (
                                <><span className={styles.spinner} /> ログイン中...</>
                            ) : (
                                'ログイン'
                            )}
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
                        楽曲を追加し、サイトに公開できます
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
                    <label className={styles.label}>カテゴリ</label>
                    <select
                        className={styles.select}
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                    >
                        <option value="instrument">Instrument</option>
                        <option value="reggae">Reggae</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                <hr className={styles.divider} />

                <div className={styles.formGroup}>
                    <label className={styles.label}>音声ファイル *</label>
                    <div className={styles.fileInputWrapper}>
                        <input
                            type="file"
                            accept="audio/*"
                            className={styles.fileInput}
                            onChange={e => {
                                setAudioFile(e.target.files?.[0] || null);
                                setAudioPath('');
                            }}
                        />
                        {audioPath && (
                            <p className={styles.fileStatus}>✓ アップロード済み: {audioPath}</p>
                        )}
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>カバー画像（任意）</label>
                    <div className={styles.fileInputWrapper}>
                        <input
                            type="file"
                            accept="image/*"
                            className={styles.fileInput}
                            onChange={e => {
                                setCoverFile(e.target.files?.[0] || null);
                                setCoverPath('');
                            }}
                        />
                        {coverPath && (
                            <p className={styles.fileStatus}>✓ アップロード済み: {coverPath}</p>
                        )}
                    </div>
                </div>

                <hr className={styles.divider} />

                <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={publishing || uploading}
                >
                    {uploading ? (
                        <><span className={styles.spinner} /> ファイルをアップロード中...</>
                    ) : publishing ? (
                        <><span className={styles.spinner} /> 公開してGit Push中...</>
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
