import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs/promises';
import path from 'path';
import { Movie } from '@/types';
import { commitAndPush, getCurrentStrategy } from '@/lib/git-strategy';

const MOVIES_DIR = path.join(process.cwd(), 'content/movies');

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('admin_token');

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data: Partial<Movie> = await request.json();

        // 必須フィールドのチェック
        if (!data.id || !data.title || !data.artist || !data.youtubeId) {
            return NextResponse.json({ error: 'Missing required fields: id, title, artist, youtubeId' }, { status: 400 });
        }

        // --- 1. JSON ファイルの更新 ---
        await fs.mkdir(MOVIES_DIR, { recursive: true });

        const fileName = `${data.id}.json`;
        const filePath = path.join(MOVIES_DIR, fileName);

        let existingData = {};
        try {
            const fileContents = await fs.readFile(filePath, 'utf8');
            existingData = JSON.parse(fileContents);
        } catch (error) {
            // 新規作成の場合は無視
        }

        const mergedData = {
            ...existingData,
            title: data.title,
            artist: data.artist,
            youtubeId: data.youtubeId,
            thumbnailUrl: data.thumbnailUrl || undefined, // undefinedはJSON化で消える
            description: data.description || undefined,
            hidden: data.hidden,
        };

        await fs.writeFile(filePath, JSON.stringify(mergedData, null, 2), 'utf8');

        // --- 2. Git へのコミット & プッシュ (ローカルのみ) ---
        const strategy = getCurrentStrategy();
        if (strategy === 'local') {
            try {
                // git add のための相対パス
                const relativeFilePath = path.relative(process.cwd(), filePath);
                // Windows パスのバックスラッシュをスラッシュに変換（Git用）
                const posixPath = relativeFilePath.split(path.sep).join(path.posix.sep);

                await commitAndPush(
                    `Update movie data: ${data.id}`,
                    [{
                        absolutePath: filePath,
                        relativePath: posixPath,
                    }]
                );
            } catch (gitError) {
                console.warn('Git commit/push failed, but file was saved locally:', gitError);
                // Gitの失敗は致命的にしない（ローカルで作業している場合など）
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Movie data saved successfully'
        });

    } catch (error) {
        console.error('Failed to edit movie:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
