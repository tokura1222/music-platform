'use client';

import { useState, useEffect, FormEvent, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { GENRES, getGenresByCategory, getGenreBySlug } from '@/lib/genres';
import { Trash2, Edit2, Eye, EyeOff, LayoutDashboard, Music, Save, X, Settings2 } from 'lucide-react';
import styles from './manage.module.css';
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard';

type Status = {
    type: 'success' | 'error' | 'info';
    message: string;
    details?: string;
};

interface Song {
    id: string;
    title: string;
    artist: string;
    genreSlug?: string;
    category?: string;
    hidden?: boolean;
    [key: string]: any;
}

function ManageContent() {
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

    // Inline Edit State
    const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);
    const [inlineTitle, setInlineTitle] = useState('');
    const [inlineArtist, setInlineArtist] = useState('');
    const [inlineLoading, setInlineLoading] = useState(false);

    const handleStartInlineEdit = (song: Song) => {
        setInlineEditingId(song.id);
        setInlineTitle(song.title);
        setInlineArtist(song.artist);
    };

    const handleCancelInlineEdit = () => {
        setInlineEditingId(null);
        setInlineTitle('');
        setInlineArtist('');
    };

    const handleSaveInlineEdit = async (song: Song) => {
        if (!inlineTitle || !inlineArtist) return;
        setInlineLoading(true);
        try {
            // Optimistic update
            const originalSongs = [...songs];
            setSongs(songs.map(s => s.id === song.id ? { ...s, title: inlineTitle, artist: inlineArtist } : s));

            const res = await fetch('/api/admin/edit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: song.id,
                    title: inlineTitle,
                    artist: inlineArtist,
                    genreSlug: song.genreSlug,
                    hidden: song.hidden
                }),
            });

            if (!res.ok) {
                // Revert
                setSongs(originalSongs);
                throw new Error('Failed to update');
            }

            setStatus({ type: 'success', message: '楽曲情報を更新しました', details: `Updated: ${inlineTitle}` });
            handleCancelInlineEdit();
        } catch (e) {
            console.error(e);
            alert('更新に失敗しました: ' + (e instanceof Error ? e.message : String(e)));
            setStatus({ type: 'error', message: '更新に失敗しました' });
        } finally {
            setInlineLoading(false);
        }
    };

    // Songs list state
    const [songs, setSongs] = useState<Song[]>([]);
    const [editingSong, setEditingSong] = useState<Song | null>(null);
    const [genreFilter, setGenreFilter] = useState('all');

    // Tabs state
    const [activeTab, setActiveTab] = useState<'dashboard' | 'songs'>('dashboard');

    const searchParams = useSearchParams();
    const tabParam = searchParams.get('tab');

    useEffect(() => {
        if (tabParam === 'songs') {
            setActiveTab('songs');
        } else {
            setActiveTab('dashboard');
        }
    }, [tabParam]);

    // Check auth on mount & get git config
    // Check auth on mount & get git config
    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Check if admin_token cookie exists
                const token = document.cookie.split('; ').find(row => row.startsWith('admin_token='));
                if (token) {
                    setIsAuthenticated(true);
                    await fetchGitConfig();
                } else {
                    setIsAuthenticated(false);
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

    const fetchSongs = async () => {
        try {
            const res = await fetch('/api/admin/songs');
            if (res.ok) {
                const data = await res.json();
                setSongs(data);
            }
        } catch (error) {
            console.error('Failed to fetch songs', error);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchSongs();
        }
    }, [isAuthenticated]);

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

        e.preventDefault();
        setStatus(null);

        if (!editingSong && !audioFile) {
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

            // 1. Upload audio file via server API (SKIP if editing and no file)
            let audioUrl = editingSong?.url;
            if (audioFile) {
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
                audioUrl = audioData.filePath;
            }

            // 2. Upload cover file (optional) via server API
            let coverPath = editingSong?.coverPath;
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

            // 3. Publish/Update song metadata via server API
            setStatus({ type: 'info', message: editingSong ? '楽曲情報を更新中...' : '楽曲情報を公開中...' });
            const selectedGenre = getGenreBySlug(genreSlug);

            const apiEndpoint = editingSong ? '/api/admin/edit' : '/api/admin/publish';

            const publishRes = await fetch(apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingSong?.id, // Only for edit
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
                    message: editingSong ? '🎉 更新成功！ デプロイ完了まで数分お待ちください。' : '🎉 アップロード成功！ デプロイ完了まで数分お待ちください。',
                    details: publishData.message
                });
                // Reset form
                handleCancelEdit();
                fetchSongs(); // Refresh list
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

    const handleEdit = (song: Song) => {
        setEditingSong(song);
        setTitle(song.title);
        setArtist(song.artist);
        setGenreSlug(song.genreSlug || GENRES[0].slug);
        setAudioFile(null);
        setCoverFile(null);
        setStatus(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingSong(null);
        setTitle('');
        setArtist('');
        setGenreSlug(GENRES[0].slug);
        setAudioFile(null);
        setCoverFile(null);
        setStatus(null);
    };

    const handleToggleHidden = async (song: Song) => {
        try {
            // Optimistic update
            const newHidden = !song.hidden;
            setSongs(songs.map(s => s.id === song.id ? { ...s, hidden: newHidden } : s));

            const res = await fetch('/api/admin/edit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: song.id,
                    title: song.title,
                    artist: song.artist,
                    hidden: newHidden
                }),
            });

            if (!res.ok) {
                // Revert on failure
                setSongs(songs.map(s => s.id === song.id ? { ...s, hidden: song.hidden } : s));
                throw new Error('更新に失敗しました');
            }
        } catch (error) {
            console.error(error);
            alert('ステータスの更新に失敗しました');
        }
    };

    const handleDelete = async (song: Song) => {
        if (!confirm(`本当に「${song.title}」を削除しますか？\nこの操作は取り消せません。`)) {
            return;
        }

        try {
            setStatus({ type: 'info', message: '楽曲を削除中...' });

            const res = await fetch('/api/admin/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: song.id }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setStatus({ type: 'success', message: '楽曲を削除しました' });
                setSongs(songs.filter(s => s.id !== song.id));
                if (editingSong?.id === song.id) handleCancelEdit();
            } else {
                throw new Error(data.message || '削除に失敗しました');
            }
        } catch (error) {
            console.error(error);
            setStatus({ type: 'error', message: '削除に失敗しました' });
        }
    };

    // Filtered songs
    const filteredSongs = songs.filter(song => {
        if (genreFilter === 'all') return true;
        return song.genreSlug === genreFilter;
    });

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


            {/* Tabs */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'dashboard' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('dashboard')}
                >
                    <LayoutDashboard className="inline-block w-4 h-4 mr-2" />
                    Dashboard
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'songs' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('songs')}
                >
                    <Music className="inline-block w-4 h-4 mr-2" />
                    Songs
                </button>
            </div>

            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
                <AnalyticsDashboard />
            )}

            {/* Songs Tab */}
            <div style={{ display: activeTab === 'songs' ? 'block' : 'none' }}>
                <div className="mb-6">
                    <h2 className="text-xl font-bold mb-2">{editingSong ? '楽曲の編集' : '新規楽曲登録'}</h2>
                    <p className="text-muted-foreground text-sm mb-4">
                        {editingSong ? '登録済み楽曲の内容を修正します' : 'サーバー経由でGitHubへアップロードします'}
                    </p>
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
                        <label className={styles.label}>音声ファイル {editingSong ? '(変更する場合のみ)' : '*'}</label>
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

                    {editingSong && (
                        <button
                            type="button"
                            className={styles.cancelBtn}
                            onClick={handleCancelEdit}
                            disabled={publishing}
                        >
                            キャンセル
                        </button>
                    )}

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

                {/* Songs List */}
                <div className={styles.songsListSection}>
                    <div className={styles.filterSection}>
                        <h2 className={styles.sectionTitle}>登録済み楽曲 ({filteredSongs.length})</h2>
                        <select
                            className={styles.filterSelect}
                            value={genreFilter}
                            onChange={(e) => setGenreFilter(e.target.value)}
                        >
                            <option value="all">全てのジャンル</option>
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

                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr className={styles.tr}>
                                    <th className={styles.th}>Title</th>
                                    <th className={styles.th}>Artist</th>
                                    <th className={styles.th}>Genre</th>
                                    <th className={styles.th}>Status</th>
                                    <th className={styles.th}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSongs.map((song) => (
                                    <tr key={song.id} className={styles.tr}>
                                        <td className={styles.td}>
                                            {inlineEditingId === song.id ? (
                                                <input
                                                    className={styles.input}
                                                    style={{ padding: '4px 8px', height: 'auto', fontSize: '0.9rem' }}
                                                    value={inlineTitle}
                                                    onChange={e => setInlineTitle(e.target.value)}
                                                    autoFocus
                                                />
                                            ) : (
                                                <div className="flex items-center gap-2 group">
                                                    <span className="font-medium">{song.title}</span>
                                                    <button
                                                        onClick={() => handleStartInlineEdit(song)}
                                                        className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-foreground transition-opacity"
                                                        title="名前を変更"
                                                    >
                                                        <Edit2 size={12} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                        <td className={styles.td}>
                                            {inlineEditingId === song.id ? (
                                                <input
                                                    className={styles.input}
                                                    style={{ padding: '4px 8px', height: 'auto', fontSize: '0.9rem' }}
                                                    value={inlineArtist}
                                                    onChange={e => setInlineArtist(e.target.value)}
                                                />
                                            ) : (
                                                <div className="flex items-center gap-2 group">
                                                    {song.artist}
                                                    <button
                                                        onClick={() => handleStartInlineEdit(song)}
                                                        className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-foreground transition-opacity"
                                                        title="アーティスト名を変更"
                                                    >
                                                        <Edit2 size={12} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                        <td className={styles.td}>{song.genreSlug || '-'}</td>
                                        <td className={styles.td}>
                                            <button
                                                className={`${styles.statusBadge} ${song.hidden ? styles.private : styles.public}`}
                                                onClick={() => handleToggleHidden(song)}
                                            >
                                                {song.hidden ? <EyeOff size={12} /> : <Eye size={12} />}
                                                {song.hidden ? 'Private' : 'Public'}
                                            </button>
                                        </td>
                                        <td className={styles.td}>
                                            {inlineEditingId === song.id ? (
                                                <div className="flex gap-1">
                                                    <button onClick={() => handleSaveInlineEdit(song)} disabled={inlineLoading} className={styles.editBtn} title="保存" style={{ color: 'var(--primary)' }}>
                                                        <Save size={14} />
                                                    </button>
                                                    <button onClick={handleCancelInlineEdit} disabled={inlineLoading} className={styles.deleteBtn} title="キャンセル">
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex gap-1">
                                                    <button
                                                        className={styles.editBtn}
                                                        onClick={() => handleEdit(song)}
                                                        title="詳細編集 (ファイル更新など)"
                                                    >
                                                        <Settings2 size={14} />
                                                    </button>
                                                    <button
                                                        className={styles.deleteBtn}
                                                        onClick={() => handleDelete(song)}
                                                        title="削除"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ManagePage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
            <ManageContent />
        </Suspense>
    );
}
