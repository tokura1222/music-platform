import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import { commitAndPush, getCurrentStrategy } from '@/lib/git-strategy';
import path from 'path';
import fs from 'fs/promises';

export async function POST(request: NextRequest) {
    // Auth check
    const isAdmin = await verifyAdminSession();
    if (!isAdmin) {
        return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { title, artist, category, url, coverPath } = body;

        if (!title || !artist || !url) {
            return NextResponse.json(
                { error: 'タイトル、アーティスト、音声ファイルは必須です' },
                { status: 400 }
            );
        }

        // Generate song ID from title
        const songId = title
            .toLowerCase()
            .replace(/[^a-z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]+/g, '-')
            .replace(/^-|-$/g, '')
            || `song-${Date.now()}`;

        // Create song JSON
        const songData = {
            title,
            artist,
            category: category || 'other',
            url,
            ...(coverPath && { coverPath }),
        };

        const songJson = JSON.stringify(songData, null, 2);
        const relativePath = `content/songs/${songId}.json`;
        const absolutePath = path.join(process.cwd(), relativePath);

        // Ensure directory exists
        await fs.mkdir(path.dirname(absolutePath), { recursive: true });

        // Write the song JSON file
        await fs.writeFile(absolutePath, songJson, 'utf-8');

        // Commit and push
        const commitMessage = `Web管理画面から楽曲を追加: ${title}`;
        const result = await commitAndPush(commitMessage, [
            {
                absolutePath,
                relativePath,
                content: songJson,
            },
        ]);

        const strategy = getCurrentStrategy();

        return NextResponse.json({
            success: result.success,
            message: result.message,
            details: result.details,
            songId,
            strategy,
        });
    } catch (error) {
        console.error('Publish error:', error);
        return NextResponse.json(
            { error: '楽曲の公開に失敗しました', details: String(error) },
            { status: 500 }
        );
    }
}
