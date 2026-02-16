'use client';

import { useState, useEffect, FormEvent } from 'react';
import styles from './manage.module.css';
import { uploadToGitHub } from '@/lib/github-client';

type Status = {
    type: 'success' | 'error' | 'info';
    message: string;
    details?: string;
};

type GitConfig = {
    token: string;
    repo: string;
    branch: string;
};

export default function ManagePage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [gitConfig, setGitConfig] = useState<GitConfig | null>(null);

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
                setGitConfig(config);
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
        setGitConfig(null);
    };

    // ── Helpers ──
    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = reader.result as string;
                // remove "data:audio/mpeg;base64," prefix
                const base64 = result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
        });
    };

    const sanitizeFilename = (name: string) => {
        return name.replace(/[^a-zA-Z0-9._-]/g, '_');
    };

    // ── Publish ──
    const handlePublish = async (e: FormEvent) => {
        e.preventDefault();
        setStatus(null);

        if (!audioFile) {
            setStatus({ type: 'error', message: '音声ファイルを選択してください' });
            return;
        }

        if (!gitConfig) {
            setStatus({
                type: 'error',
                message: 'GitHub設定が読み込めませんでした。環境変数が設定されているか確認してください。'
            });
            return;
        }

        try {
            setPublishing(true);
            setStatus({ type: 'info', message: 'ファイルを処理中...' });

            const filesToUpload = [];

            // 1. Audio File
            const audioExt = audioFile.name.split('.').pop() || 'mp3';
            const audioFilename = `${sanitizeFilename(title)}_${Date.now()}.${audioExt}`;
            const audioContent = await fileToBase64(audioFile);
            const audioPath = `public/music/${audioFilename}`;

            filesToUpload.push({
                path: audioPath,
                content: audioContent
            });

            // 2. Cover File (Optional)
            let coverPath = undefined;
            if (coverFile) {
                const coverExt = coverFile.name.split('.').pop() || 'jpg';
                const coverFilename = `${sanitizeFilename(title)}_cover_${Date.now()}.${coverExt}`;
                const coverContent = await fileToBase64(coverFile);
                coverPath = `public/music/${coverFilename}`; // full path for git

                filesToUpload.push({
                    path: coverPath,
                    content: coverContent
                });
            }

            // 3. JSON Metadata
            const songId = title
                .toLowerCase()
                .replace(/[^a-z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]+/g, '-')
                .replace(/^-|-$/g, '')
                || `song-${Date.now()}`;

            const songData = {
                title,
                artist,
                category,
                url: `/music/${audioFilename}`, // Web path
                ...(coverPath && { coverPath: `/music/${coverPath.split('/').pop()}` }), // Web path
            };

            const jsonContent = Buffer.from(JSON.stringify(songData, null, 2)).toString('base64');
            const jsonPath = `content/songs/${songId}.json`;

            filesToUpload.push({
                path: jsonPath,
                content: jsonContent
            });

            // 4. Upload to GitHub
            setStatus({ type: 'info', message: 'GitHubへアップロード中...' });

            const result = await uploadToGitHub(
                gitConfig.token,
                gitConfig.repo,
                gitConfig.branch,
                `Add song: ${title}`,
                filesToUpload
            );

            if (result.success) {
                setStatus({
                    type: 'success',
                    message: '🎉 アップロード成功！ デプロイ完了まで数分お待ちください。',
                    details: 'GitHubへのプッシュが完了しました。'
                });
                // Reset form
                setTitle('');
                setArtist('');
                setCategory('other');
                setAudioFile(null);
                setCoverFile(null);
            } else {
                throw new Error(result.message);
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
                        ブラウザからGitHubへ直接アップロードします (制限なし)
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
                        <><span className={styles.spinner} /> GitHubへアップロード中...</>
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
