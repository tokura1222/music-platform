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

        // --- 1. 既存データの取得 ---
        const fileName = `${data.id}.json`;
        const relativeFilePath = `content/movies/${fileName}`;
        const absoluteFilePath = path.join(process.cwd(), relativeFilePath);

        let existingData = {};
        try {
            const fileContents = await fs.readFile(absoluteFilePath, 'utf8');
            existingData = JSON.parse(fileContents);
        } catch (error) {
            // 新規作成の場合は無視
        }

        const mergedData = {
            ...existingData,
            title: data.title,
            artist: data.artist,
            youtubeId: data.youtubeId,
            thumbnailUrl: data.thumbnailUrl || undefined,
            description: data.description || undefined,
            genreSlug: data.genreSlug || undefined,
            hidden: data.hidden,
        };

        const updatedJson = JSON.stringify(mergedData, null, 2);

        // --- 2. 保存 & Git へのコミット & プッシュ ---
        const strategy = getCurrentStrategy();

        // ローカル環境の場合は物理ファイルも更新する
        if (strategy === 'local') {
            await fs.mkdir(path.dirname(absoluteFilePath), { recursive: true });
            await fs.writeFile(absoluteFilePath, updatedJson, 'utf8');
        }

        // Posix path format for Git
        const posixPath = relativeFilePath.split(path.sep).join(path.posix.sep);

        const result = await commitAndPush(
            `Update movie data: ${data.id}`,
            [{
                absolutePath: absoluteFilePath,
                relativePath: posixPath,
                content: updatedJson,
            }]
        );

        if (!result.success && strategy === 'github-api') {
            throw new Error(result.message || 'GitHubへの保存に失敗しました');
        } else if (!result.success) {
            console.warn('Git commit/push failed, but file was saved locally:', result.message);
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
