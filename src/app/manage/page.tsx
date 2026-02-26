'use client';

import { useState, useEffect, FormEvent, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { GENRES, GenreDefinition, getGenresByCategory, getGenreBySlug } from '@/lib/genres';
import { Trash2, Edit2, Eye, EyeOff, LayoutDashboard, Music, Save, X, Settings2, FolderTree } from 'lucide-react';
import styles from './manage.module.css';
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard';
import { AlertModal } from '@/components/ui/alert-modal';

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

interface Movie {
    id: string;
    title: string;
    artist: string;
    youtubeId: string;
    thumbnailUrl?: string;
    description?: string;
    genreSlug?: string;
    hidden?: boolean;
    plays?: number;
    likes?: number;
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
    const [audioFiles, setAudioFiles] = useState<File[]>([]);
    const [coverFiles, setCoverFiles] = useState<File[]>([]);
    const [isFreePlan, setIsFreePlan] = useState(false);
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

    // Movies list and form state
    const [movies, setMovies] = useState<Movie[]>([]);
    const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
    const [movieTitle, setMovieTitle] = useState('');
    const [movieArtist, setMovieArtist] = useState('');
    const [movieYoutubeId, setMovieYoutubeId] = useState('');
    const [movieThumbnail, setMovieThumbnail] = useState('');
    const [movieGenreSlug, setMovieGenreSlug] = useState('');
    const [movieSaving, setMovieSaving] = useState(false);

    // Tabs state
    const [activeTab, setActiveTab] = useState<'dashboard' | 'songs' | 'genres' | 'movies'>('dashboard');

    // Genres State
    const [genresData, setGenresData] = useState<GenreDefinition[]>([]);
    const [newGenreName, setNewGenreName] = useState('');
    const [newGenreSlug, setNewGenreSlug] = useState('');
    const [newGenreCategory, setNewGenreCategory] = useState<'instrumentals' | 'vocal'>('vocal');
    const [isSavingGenres, setIsSavingGenres] = useState(false);

    // Delete Modals State
    const [songToDelete, setSongToDelete] = useState<Song | null>(null);
    const [movieToDelete, setMovieToDelete] = useState<Movie | null>(null);
    const [genreToDelete, setGenreToDelete] = useState<{ slug: string, name: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const searchParams = useSearchParams();
    const tabParam = searchParams.get('tab');

    useEffect(() => {
        if (tabParam === 'songs') {
            setActiveTab('songs');
        } else if (tabParam === 'genres') {
            setActiveTab('genres');
        } else if (tabParam === 'movies') {
            setActiveTab('movies');
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

    const fetchMovies = async () => {
        try {
            const res = await fetch('/api/admin/movies');
            if (res.ok) {
                const data = await res.json();
                setMovies(data);
            }
        } catch (error) {
            console.error('Failed to fetch movies', error);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchSongs();
            fetchMovies();
            setGenresData(GENRES); // Load initial GENRES from imported data

            // Set initial movie genre slug if movies exist and genres exist
            const movieGenres = GENRES.filter(g => g.category === 'movie');
            if (movieGenres.length > 0) {
                setMovieGenreSlug(movieGenres[0].slug);
            }
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

    const handlePublish = async (e: FormEvent) => {
        e.preventDefault();
        setStatus(null);

        if (!gitConfigured) {
            setStatus({
                type: 'error',
                message: 'GitHub設定が読み込めませんでした。環境変数が設定されているか確認してください。'
            });
            return;
        }

        try {
            setPublishing(true);

            if (editingSong) {
                // シングル編集ロジック
                let audioUrl = editingSong?.url;
                if (audioFiles.length > 0) {
                    setStatus({ type: 'info', message: '音声ファイルをアップロード中...' });
                    const audioFormData = new FormData();
                    audioFormData.append('file', audioFiles[0]);
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

                let coverPath = editingSong?.coverPath;
                if (coverFiles.length > 0) {
                    setStatus({ type: 'info', message: 'カバー画像をアップロード中...' });
                    const coverFormData = new FormData();
                    coverFormData.append('file', coverFiles[0]);
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

                setStatus({ type: 'info', message: '楽曲情報を更新中...' });
                const selectedGenre = getGenreBySlug(genreSlug);

                const publishRes = await fetch('/api/admin/edit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: editingSong.id,
                        title,
                        artist,
                        category: selectedGenre?.category || 'vocal',
                        genreSlug,
                        isFreePlan,
                        url: audioUrl,
                        coverPath,
                    }),
                });

                if (!publishRes.ok) {
                    const err = await publishRes.json();
                    throw new Error(err.error || '楽曲の更新に失敗しました');
                }

                const publishData = await publishRes.json();
                if (publishData.success) {
                    setStatus({
                        type: 'success',
                        message: '🎉 更新成功！ デプロイ完了まで数分お待ちください。',
                        details: publishData.message
                    });
                    handleCancelEdit();
                    fetchSongs();
                } else {
                    throw new Error(publishData.message || '更新に失敗しました');
                }
            } else {
                // 一括アップロードロジック（Vercelの4.5MB制限を回避するため1曲ずつ送信）
                if (audioFiles.length === 0) {
                    setStatus({ type: 'error', message: '音声ファイルを選択してください' });
                    return;
                }

                setStatus({ type: 'info', message: `0 / ${audioFiles.length} 曲をアップロード中... (複数ファイル処理中)` });
                const selectedGenre = getGenreBySlug(genreSlug);
                const categoryValue = selectedGenre?.category || 'vocal';

                let successCount = 0;
                let errorMessages: string[] = [];

                for (let i = 0; i < audioFiles.length; i++) {
                    const audioFile = audioFiles[i];

                    // 対応するカバー画像を探す (拡張子なしのファイル名で一致するか)
                    const audioBaseName = audioFile.name.substring(0, audioFile.name.lastIndexOf('.')) || audioFile.name;
                    const matchingCover = coverFiles.find(cover => {
                        const coverBaseName = cover.name.substring(0, cover.name.lastIndexOf('.')) || cover.name;
                        return coverBaseName === audioBaseName;
                    });

                    setStatus({ type: 'info', message: `${i + 1} / ${audioFiles.length} 曲をアップロード中... (${audioFile.name})` });

                    const batchFormData = new FormData();
                    batchFormData.append('artist', artist);
                    batchFormData.append('category', categoryValue);
                    batchFormData.append('genreSlug', genreSlug);
                    batchFormData.append('isFreePlan', isFreePlan.toString());
                    batchFormData.append('audioFiles', audioFile);

                    if (matchingCover) {
                        batchFormData.append('coverFiles', matchingCover);
                    }

                    try {
                        const publishRes = await fetch('/api/admin/batch-upload', {
                            method: 'POST',
                            body: batchFormData,
                        });

                        const publishData = await publishRes.json();

                        if (!publishRes.ok || !publishData.success) {
                            errorMessages.push(`${audioFile.name}: ${publishData.error || publishData.message || '公開に失敗しました'}`);
                        } else {
                            successCount++;
                        }
                    } catch (err) {
                        errorMessages.push(`${audioFile.name}: 通信エラー`);
                    }
                }

                if (successCount === audioFiles.length) {
                    setStatus({
                        type: 'success',
                        message: `🎉 アップロード成功！ 全${successCount}曲を登録しました。デプロイ後反映されます。`,
                    });
                    handleCancelEdit();
                    fetchSongs();
                } else if (successCount > 0) {
                    setStatus({
                        type: 'info',
                        message: `⚠️ 一部完了: ${successCount}曲成功、${audioFiles.length - successCount}曲失敗。デプロイ後反映されます。`,
                        details: `失敗: ${errorMessages.join(', ')}`
                    });
                    fetchSongs();
                } else {
                    throw new Error(`全曲の公開に失敗しました。\n詳細: ${errorMessages.join('\n')}`);
                }
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
        setIsFreePlan(!!song.isFreePlan);
        setAudioFiles([]);
        setCoverFiles([]);
        setStatus(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingSong(null);
        setTitle('');
        setArtist('');
        setGenreSlug(GENRES[0].slug);
        setIsFreePlan(false);
        setAudioFiles([]);
        setCoverFiles([]);
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

    const handleDelete = (song: Song) => {
        setSongToDelete(song);
    };

    const confirmSongDelete = async () => {
        if (!songToDelete) return;

        try {
            setIsDeleting(true);
            setStatus({ type: 'info', message: '楽曲を削除中...' });

            const res = await fetch('/api/admin/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: songToDelete.id }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setStatus({ type: 'success', message: '楽曲を削除しました' });
                setSongs(songs.filter(s => s.id !== songToDelete.id));
                if (editingSong?.id === songToDelete.id) handleCancelEdit();
            } else {
                throw new Error(data.message || '削除に失敗しました');
            }
        } catch (error) {
            console.error(error);
            setStatus({ type: 'error', message: '削除に失敗しました' });
        } finally {
            setIsDeleting(false);
            setSongToDelete(null);
        }
    };

    // ── Genre Management Hooks ──
    const handleSaveGenres = async (newGenresArray: GenreDefinition[]) => {
        setIsSavingGenres(true);
        setStatus({ type: 'info', message: 'ジャンルを更新中...' });
        try {
            const res = await fetch('/api/admin/genres', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ genres: newGenresArray }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setGenresData(newGenresArray); // Update local state
                setStatus({ type: 'success', message: '🎉 ジャンルを更新しました。デプロイ後反映されます。' });
            } else {
                throw new Error(data.error || '更新に失敗しました');
            }
        } catch (error) {
            console.error(error);
            setStatus({ type: 'error', message: 'ジャンルの更新に失敗しました' });
        } finally {
            setIsSavingGenres(false);
        }
    };

    const handleAddGenre = (e: FormEvent) => {
        e.preventDefault();
        if (!newGenreName || !newGenreSlug) return;

        // Validation for uniqueness
        if (genresData.some(g => g.slug === newGenreSlug)) {
            alert('このスラッグは既に使用されています。');
            return;
        }

        const newGenre = { slug: newGenreSlug, name: newGenreName, category: newGenreCategory };
        const updatedGenres = [...genresData, newGenre];
        handleSaveGenres(updatedGenres);

        setNewGenreName('');
        setNewGenreSlug('');
    };

    const handleDeleteGenre = (slug: string, name: string) => {
        setGenreToDelete({ slug, name });
    };

    const confirmGenreDelete = () => {
        if (!genreToDelete) return;
        const updatedGenres = genresData.filter(g => g.slug !== genreToDelete.slug);
        handleSaveGenres(updatedGenres);
        setGenreToDelete(null);
    };

    // Filtered songs
    const filteredSongs = songs.filter(song => {
        if (genreFilter === 'all') return true;
        return song.genreSlug === genreFilter;
    });

    // ── Movie Management Hooks ──
    const handleMovieEdit = (movie: Movie) => {
        setEditingMovie(movie);
        setMovieTitle(movie.title);
        setMovieArtist(movie.artist);
        setMovieYoutubeId(movie.youtubeId);
        setMovieThumbnail(movie.thumbnailUrl || '');
        setMovieGenreSlug(movie.genreSlug || '');
        setStatus(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelMovieEdit = () => {
        setEditingMovie(null);
        setMovieTitle('');
        setMovieArtist('');
        setMovieYoutubeId('');
        setMovieThumbnail('');
        const movieGenres = genresData.filter(g => g.category === 'movie');
        setMovieGenreSlug(movieGenres.length > 0 ? movieGenres[0].slug : '');
        setStatus(null);
    };

    const handleSaveMovie = async (e: FormEvent) => {
        e.preventDefault();
        setStatus(null);

        if (!movieTitle || !movieArtist || !movieYoutubeId) {
            setStatus({ type: 'error', message: 'タイトル、アーティスト、YouTube IDは必須です' });
            return;
        }

        try {
            setMovieSaving(true);

            // Generate ID if new
            const movieId = editingMovie?.id || `movie-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            // Auto-generate thumbnail if empty
            const finalThumbnail = movieThumbnail || `https://img.youtube.com/vi/${movieYoutubeId}/maxresdefault.jpg`;

            const res = await fetch('/api/admin/movies/edit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: movieId,
                    title: movieTitle,
                    artist: movieArtist,
                    youtubeId: movieYoutubeId,
                    thumbnailUrl: finalThumbnail,
                    genreSlug: movieGenreSlug,
                    hidden: editingMovie?.hidden || false
                }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setStatus({
                    type: 'success',
                    message: '🎉 動画を保存しました！ デプロイ後反映されます。',
                });
                handleCancelMovieEdit();
                fetchMovies();
            } else {
                throw new Error(data.error || '動画の保存に失敗しました');
            }
        } catch (error) {
            console.error(error);
            setStatus({ type: 'error', message: error instanceof Error ? error.message : '予期しないエラーが発生しました' });
        } finally {
            setMovieSaving(false);
        }
    };

    const handleToggleMovieHidden = async (movie: Movie) => {
        try {
            const newHidden = !movie.hidden;
            setMovies(movies.map(m => m.id === movie.id ? { ...m, hidden: newHidden } : m));

            const res = await fetch('/api/admin/movies/edit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...movie,
                    hidden: newHidden
                }),
            });

            if (!res.ok) {
                setMovies(movies.map(m => m.id === movie.id ? { ...m, hidden: movie.hidden } : m));
                throw new Error('更新に失敗しました');
            }
        } catch (error) {
            console.error(error);
            alert('ステータスの更新に失敗しました');
        }
    };

    const handleDeleteMovie = (movie: Movie) => {
        setMovieToDelete(movie);
    };

    const confirmMovieDelete = async () => {
        if (!movieToDelete) return;

        try {
            setIsDeleting(true);
            setStatus({ type: 'info', message: '動画を削除中...' });

            const res = await fetch('/api/admin/movies/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: movieToDelete.id }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setStatus({ type: 'success', message: '動画を削除しました' });
                setMovies(movies.filter(m => m.id !== movieToDelete.id));
                if (editingMovie?.id === movieToDelete.id) handleCancelMovieEdit();
            } else {
                throw new Error(data.error || '削除に失敗しました');
            }
        } catch (error) {
            console.error(error);
            setStatus({ type: 'error', message: '削除に失敗しました' });
        } finally {
            setIsDeleting(false);
            setMovieToDelete(null);
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
                <button
                    className={`${styles.tab} ${activeTab === 'movies' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('movies')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block w-4 h-4 mr-2"><path d="m22 8-6 4 6 4V8Z" /><rect width="14" height="12" x="2" y="6" rx="2" ry="2" /></svg>
                    Movies
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'genres' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('genres')}
                >
                    <FolderTree className="inline-block w-4 h-4 mr-2" />
                    Genres
                </button>
            </div>

            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
                <AnalyticsDashboard />
            )}

            {/* Genres Tab */}
            <div style={{ display: activeTab === 'genres' ? 'block' : 'none' }}>
                <div className="mb-6">
                    <h2 className="text-xl font-bold mb-2">ジャンル管理</h2>
                    <p className="text-muted-foreground text-sm mb-4">
                        新しいジャンルを追加したり、不要なジャンルを削除します。変更はGitへコミットされ、デプロイ後に反映されます。
                    </p>
                </div>

                {status && activeTab === 'genres' && (
                    <div className={`mb-6 ${status.type === 'success' ? styles.statusSuccess : status.type === 'error' ? styles.statusError : styles.statusInfo}`}>
                        <div>{status.message}</div>
                        {status.details && <div style={{ marginTop: '0.4rem', opacity: 0.8, fontSize: '0.78rem' }}>{status.details}</div>}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Add Genre Form */}
                    <div className="lg:col-span-1">
                        <form onSubmit={handleAddGenre} className="bg-card border border-border rounded-lg p-5">
                            <h3 className="font-semibold mb-4 text-card-foreground">新しいジャンルを追加</h3>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>表示名 (Name) *</label>
                                <input
                                    type="text"
                                    className={`${styles.input} text-sm`}
                                    value={newGenreName}
                                    onChange={e => setNewGenreName(e.target.value)}
                                    placeholder="例: J-Pop"
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>スラッグ (URL用) *</label>
                                <input
                                    type="text"
                                    className={`${styles.input} text-sm`}
                                    value={newGenreSlug}
                                    onChange={e => setNewGenreSlug(e.target.value)}
                                    placeholder="例: vocal-jpop"
                                    pattern="^[a-zA-Z0-9\-]+$"
                                    title="半角英数字とハイフンのみ"
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>カテゴリ *</label>
                                <select
                                    className={`${styles.select} text-sm`}
                                    value={newGenreCategory}
                                    onChange={e => setNewGenreCategory(e.target.value as any)}
                                >
                                    <option value="vocal">Vocal Songs</option>
                                    <option value="instrumentals">Instrumentals</option>
                                    <option value="movie">Movies</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                className={`${styles.submitBtn} text-sm mt-4 w-full`}
                                disabled={isSavingGenres}
                            >
                                {isSavingGenres ? '保存中...' : 'ジャンルを追加してPush'}
                            </button>
                        </form>
                    </div>

                    {/* Genres List View */}
                    <div className="lg:col-span-2">
                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead>
                                    <tr className={styles.tr}>
                                        <th className={styles.th}>Name</th>
                                        <th className={styles.th}>Slug</th>
                                        <th className={styles.th}>Category</th>
                                        <th className={styles.th}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {genresData.map((genre) => (
                                        <tr key={genre.slug} className={styles.tr}>
                                            <td className={styles.td}><span className="font-medium">{genre.name}</span></td>
                                            <td className={styles.td}><span className="text-muted-foreground text-sm">{genre.slug}</span></td>
                                            <td className={styles.td}>
                                                <span className={`px-2 py-1 text-xs rounded-full ${genre.category === 'vocal' ? 'bg-primary/20 text-primary' : genre.category === 'movie' ? 'bg-cyan-500/20 text-cyan-500' : 'bg-secondary text-secondary-foreground'}`}>
                                                    {genre.category === 'vocal' ? 'Vocal' : genre.category === 'movie' ? 'Movie' : 'Instrumental'}
                                                </span>
                                            </td>
                                            <td className={styles.td}>
                                                <button
                                                    className={styles.deleteBtn}
                                                    onClick={() => handleDeleteGenre(genre.slug, genre.name)}
                                                    title="削除"
                                                    disabled={isSavingGenres}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {genresData.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="text-center p-8 text-muted-foreground">ジャンルが見つかりません</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Songs Tab */}
            <div style={{ display: activeTab === 'songs' ? 'block' : 'none' }}>
                <div className="mb-6">
                    <h2 className="text-xl font-bold mb-2">{editingSong ? '楽曲の編集' : '新規楽曲登録'}</h2>
                    <p className="text-muted-foreground text-sm mb-4">
                        {editingSong ? '登録済み楽曲の内容を修正します' : 'サーバー経由でGitHubへアップロードします'}
                    </p>
                </div>

                <form onSubmit={handlePublish}>
                    {editingSong && (
                        <div className={styles.formGroup}>
                            <label className={styles.label} htmlFor="song-title">タイトル *</label>
                            <input
                                id="song-title"
                                type="text"
                                className={styles.input}
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="楽曲のタイトル"
                                required={!!editingSong}
                            />
                        </div>
                    )}

                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="song-artist">アーティスト *</label>
                        <input
                            id="song-artist"
                            type="text"
                            className={styles.input}
                            value={artist}
                            onChange={e => setArtist(e.target.value)}
                            placeholder="アーティスト名"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="song-genre">ジャンル *</label>
                        <select
                            id="song-genre"
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

                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="song-isfreeplan">SUNO 無料プラン</label>
                        <div className="flex items-center space-x-2 mt-1">
                            <input
                                id="song-isfreeplan"
                                type="checkbox"
                                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                checked={isFreePlan}
                                onChange={e => setIsFreePlan(e.target.checked)}
                            />
                            <label htmlFor="song-isfreeplan" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                この楽曲はSUNOの無料プランで作成されたものとしてマークする
                            </label>
                        </div>
                    </div>

                    <hr className={styles.divider} />

                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="song-audio">音声ファイル {editingSong ? '(変更する場合のみ)' : '*'}</label>
                        <div className={styles.fileInputWrapper}>
                            <input
                                id="song-audio"
                                type="file"
                                accept=".mp3,.wav,.ogg,.m4a"
                                className={styles.fileInput}
                                onChange={e => setAudioFiles(Array.from(e.target.files || []))}
                                multiple={!editingSong}
                            />
                            {audioFiles.length > 0 && <p className={styles.fileStatus}>選択中: {audioFiles.map(f => f.name).join(', ')}</p>}
                        </div>
                        {!editingSong && <p className="text-xs text-muted-foreground mt-1">※ファイル名からタイトルが自動設定されます。複数選択対応。</p>}
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="song-cover">カバー画像（任意）</label>
                        <div className={styles.fileInputWrapper}>
                            <input
                                id="song-cover"
                                type="file"
                                accept="image/*"
                                className={styles.fileInput}
                                onChange={e => setCoverFiles(Array.from(e.target.files || []))}
                                multiple={!editingSong}
                            />
                            {coverFiles.length > 0 && <p className={styles.fileStatus}>選択中: {coverFiles.map(f => f.name).join(', ')}</p>}
                        </div>
                        {!editingSong && <p className="text-xs text-muted-foreground mt-1">※音声ファイルと同名（拡張子違い）の画像が自動で紐付けられます。複数選択対応。</p>}
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

                    {status && activeTab === 'songs' && (
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
                            aria-label="ジャンルで絞り込む"
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

            {/* Movies Tab */}
            <div style={{ display: activeTab === 'movies' ? 'block' : 'none' }}>
                <div className="mb-6">
                    <h2 className="text-xl font-bold mb-2">{editingMovie ? '動画の編集' : '新規動画登録'}</h2>
                    <p className="text-muted-foreground text-sm mb-4">
                        YouTubeの動画情報を登録・管理します。
                    </p>
                </div>

                <form onSubmit={handleSaveMovie} className="bg-card border border-border rounded-lg p-5 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className={styles.formGroup}>
                            <label className={styles.label}>タイトル *</label>
                            <input
                                type="text"
                                className={styles.input}
                                value={movieTitle}
                                onChange={e => setMovieTitle(e.target.value)}
                                placeholder="動画のタイトル"
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>アーティスト *</label>
                            <input
                                type="text"
                                className={styles.input}
                                value={movieArtist}
                                onChange={e => setMovieArtist(e.target.value)}
                                placeholder="アーティスト名"
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>YouTube Video ID *</label>
                            <input
                                type="text"
                                className={styles.input}
                                value={movieYoutubeId}
                                onChange={e => {
                                    // URLがペーストされた場合のID抽出補助
                                    let val = e.target.value;
                                    const match = val.match(/[?&]v=([^&]+)/) || val.match(/youtu\.be\/([^?]+)/);
                                    if (match && match[1]) {
                                        val = match[1];
                                    }
                                    setMovieYoutubeId(val);
                                }}
                                placeholder="例: HX8YTpOB8Xk (URLのペーストも可)"
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>サムネイルURL (任意)</label>
                            <input
                                type="text"
                                className={styles.input}
                                value={movieThumbnail}
                                onChange={e => setMovieThumbnail(e.target.value)}
                                placeholder="空白の場合はYouTubeのデフォルトを使います"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>ジャンル (任意)</label>
                            <select
                                className={styles.select}
                                value={movieGenreSlug}
                                onChange={e => setMovieGenreSlug(e.target.value)}
                            >
                                <option value="">ジャンル未設定</option>
                                {genresData.filter(g => g.category === 'movie').map(g => (
                                    <option key={g.slug} value={g.slug}>{g.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                        <button
                            type="submit"
                            className={styles.submitBtn}
                            style={{ width: 'auto' }}
                            disabled={movieSaving}
                        >
                            {movieSaving ? (
                                <><span className={styles.spinner} /> 保存中...</>
                            ) : (
                                '🚀 保存してGit Push'
                            )}
                        </button>
                        {editingMovie && (
                            <button
                                type="button"
                                className={styles.cancelBtn}
                                onClick={handleCancelMovieEdit}
                                disabled={movieSaving}
                            >
                                キャンセル
                            </button>
                        )}
                    </div>

                    {status && activeTab === 'movies' && (
                        <div className={`mt-4 ${status.type === 'success' ? styles.statusSuccess : status.type === 'error' ? styles.statusError : styles.statusInfo}`}>
                            <div>{status.message}</div>
                            {status.details && <div style={{ marginTop: '0.4rem', opacity: 0.8, fontSize: '0.78rem' }}>{status.details}</div>}
                        </div>
                    )}
                </form>

                {/* Movies List */}
                <div className={styles.songsListSection}>
                    <div className={styles.filterSection}>
                        <h2 className={styles.sectionTitle}>登録済み動画 ({movies.length})</h2>
                    </div>

                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr className={styles.tr}>
                                    <th className={styles.th}>Title</th>
                                    <th className={styles.th}>Artist</th>
                                    <th className={styles.th}>Genre</th>
                                    <th className={styles.th}>YouTube ID</th>
                                    <th className={styles.th}>Status</th>
                                    <th className={styles.th}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {movies.map((movie) => (
                                    <tr key={movie.id} className={styles.tr}>
                                        <td className={styles.td}>
                                            <div className="flex items-center gap-3">
                                                {movie.thumbnailUrl && (
                                                    <img src={movie.thumbnailUrl} alt={movie.title} className="w-12 h-8 object-cover rounded" />
                                                )}
                                                <span className="font-medium">{movie.title}</span>
                                            </div>
                                        </td>
                                        <td className={styles.td}>{movie.artist}</td>
                                        <td className={styles.td}>{movie.genreSlug || '-'}</td>
                                        <td className={styles.td}>{movie.youtubeId}</td>
                                        <td className={styles.td}>
                                            <button
                                                className={`${styles.statusBadge} ${movie.hidden ? styles.private : styles.public}`}
                                                onClick={() => handleToggleMovieHidden(movie)}
                                            >
                                                {movie.hidden ? <EyeOff size={12} /> : <Eye size={12} />}
                                                {movie.hidden ? 'Private' : 'Public'}
                                            </button>
                                        </td>
                                        <td className={styles.td}>
                                            <div className="flex gap-1">
                                                <button
                                                    className={styles.editBtn}
                                                    onClick={() => handleMovieEdit(movie)}
                                                    title="詳細編集"
                                                >
                                                    <Settings2 size={14} />
                                                </button>
                                                <button
                                                    className={styles.deleteBtn}
                                                    onClick={() => handleDeleteMovie(movie)}
                                                    title="削除"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {movies.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center p-8 text-muted-foreground">登録されている動画はありません</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <AlertModal
                isOpen={!!songToDelete}
                onClose={() => setSongToDelete(null)}
                onConfirm={confirmSongDelete}
                loading={isDeleting}
                title="楽曲の削除"
                description={`本当に「${songToDelete?.title}」を削除しますか？この操作は取り消せません。`}
            />
            <AlertModal
                isOpen={!!movieToDelete}
                onClose={() => setMovieToDelete(null)}
                onConfirm={confirmMovieDelete}
                loading={isDeleting}
                title="動画の削除"
                description={`本当に「${movieToDelete?.title}」を削除しますか？この操作は取り消せません。`}
            />
            <AlertModal
                isOpen={!!genreToDelete}
                onClose={() => setGenreToDelete(null)}
                onConfirm={confirmGenreDelete}
                title="ジャンルの削除"
                description={`本当に「${genreToDelete?.name}」をジャンルから削除しますか？※既にこのジャンルが設定されている楽曲がある場合は注意してください。`}
            />
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
