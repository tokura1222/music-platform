import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import { commitAndPush, getCurrentStrategy, CommitFile } from '@/lib/git-strategy';
import path from 'path';

// Vercel execution limits
export const maxDuration = 60; // 60 seconds

export async function POST(request: NextRequest) {
    // Auth check
    const isAdmin = await verifyAdminSession();
    if (!isAdmin) {
        return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    try {
        const formData = await request.formData();

        const artist = formData.get('artist') as string;
        const category = formData.get('category') as string;
        const genreSlug = formData.get('genreSlug') as string;
        const isFreePlanStr = formData.get('isFreePlan') as string;
        const isFreePlan = isFreePlanStr === 'true';

        if (!artist) {
            return NextResponse.json({ error: 'アーティスト名は必須です' }, { status: 400 });
        }

        // Extract files
        const audioFiles = formData.getAll('audioFiles') as File[];
        const coverFiles = formData.getAll('coverFiles') as File[];

        if (!audioFiles || audioFiles.length === 0) {
            return NextResponse.json({ error: '音声ファイルが選択されていません' }, { status: 400 });
        }

        const commitFiles: CommitFile[] = [];
        const commitMessageParts: string[] = [];
        const songIds: string[] = [];

        // Validate allowed types
        const allowedAudio = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/aac', 'audio/x-m4a'];
        const allowedImage = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

        for (const file of audioFiles) {
            if (!allowedAudio.includes(file.type)) {
                return NextResponse.json(
                    { error: `対応していない音声ファイル形式です: ${file.name} (${file.type})` },
                    { status: 400 }
                );
            }
        }
        for (const file of coverFiles) {
            if (!allowedImage.includes(file.type)) {
                return NextResponse.json(
                    { error: `対応していない画像ファイル形式です: ${file.name} (${file.type})` },
                    { status: 400 }
                );
            }
        }

        // Process audio files
        for (const audioFile of audioFiles) {
            // e.g. "My Song.mp3" -> "My Song"
            // Get original extension to ensure correct saving
            const originalAudioExt = path.extname(audioFile.name) || '.mp3';
            const baseName = path.basename(audioFile.name, originalAudioExt);

            // Clean up baseName for title (replace underscores with spaces if any, though maybe keep as is)
            const title = baseName;

            const timestamp = Date.now();
            // Clean up for URL and filename
            const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf_-]/g, '_');
            const uniqueAudioName = `${sanitizedBaseName}_${timestamp}${originalAudioExt}`;

            // Generate song ID
            const songId = title
                .toLowerCase()
                .replace(/[^a-z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]+/g, '-')
                .replace(/^-|-$/g, '')
                || `song-${timestamp}`;

            // Check if there is a matching cover file by base filename
            let matchingCover: File | null = null;
            let uniqueCoverName: string | null = null;
            let coverPath: string | null = null;

            for (const cover of coverFiles) {
                const coverExt = path.extname(cover.name);
                const coverBaseName = path.basename(cover.name, coverExt);
                if (coverBaseName === baseName) {
                    matchingCover = cover;
                    uniqueCoverName = `${sanitizedBaseName}_${timestamp}${coverExt || '.jpg'}`;
                    coverPath = `/music/${uniqueCoverName}`;
                    break;
                }
            }

            const audioUrl = `/music/${uniqueAudioName}`;

            // Add audio file to commit
            const audioBytes = await audioFile.arrayBuffer();
            commitFiles.push({
                absolutePath: path.join(process.cwd(), 'public', 'music', uniqueAudioName),
                relativePath: `public/music/${uniqueAudioName}`,
                content: Buffer.from(audioBytes),
            });

            // Add cover file to commit if matched
            if (matchingCover && uniqueCoverName) {
                const coverBytes = await matchingCover.arrayBuffer();
                commitFiles.push({
                    absolutePath: path.join(process.cwd(), 'public', 'music', uniqueCoverName),
                    relativePath: `public/music/${uniqueCoverName}`,
                    content: Buffer.from(coverBytes),
                });
            }

            // Create song JSON
            const songData = {
                title,
                artist,
                category: category || 'vocal',
                ...(genreSlug && { genreSlug }),
                ...(isFreePlan ? { isFreePlan } : {}),
                url: audioUrl,
                ...(coverPath && { coverPath }),
            };

            const songJson = JSON.stringify(songData, null, 2);
            commitFiles.push({
                absolutePath: path.join(process.cwd(), `content/songs/${songId}.json`),
                relativePath: `content/songs/${songId}.json`,
                content: songJson,
            });

            commitMessageParts.push(title);
            songIds.push(songId);
        }

        // Commit and push 
        const commitMessage = `Web管理画面から一括登録: ${commitMessageParts.join(', ')}`;
        const result = await commitAndPush(commitMessage, commitFiles);

        if (!result.success) {
            throw new Error(result.message);
        }

        return NextResponse.json({
            success: true,
            message: `成功：${audioFiles.length}曲の登録とコミットが完了しました（デプロイ後反映）`,
            details: result.message,
            songIds,
            strategy: getCurrentStrategy(),
        });

    } catch (error) {
        console.error('Batch upload error:', error);
        return NextResponse.json(
            { error: '一括アップロードに失敗しました', details: String(error) },
            { status: 500 }
        );
    }
}
