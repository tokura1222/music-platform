import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs/promises';
import path from 'path';
import { commitAndPush, getCurrentStrategy } from '@/lib/git-strategy';

const MOVIES_DIR = path.join(process.cwd(), 'content/movies');

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('admin_token');

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'Movie ID is required' }, { status: 400 });
        }

        const fileName = `${id}.json`;
        const relativeFilePath = `content/movies/${fileName}`;
        const absoluteFilePath = path.join(process.cwd(), relativeFilePath);

        const strategy = getCurrentStrategy();

        // 1. ローカルのファイルアクセス確認と削除
        try {
            await fs.access(absoluteFilePath);
            await fs.unlink(absoluteFilePath);
        } catch (error) {
            // ローカル環境の場合はファイルが見つからなければエラー
            if (strategy === 'local') {
                return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
            }
            // GitHub API (Vercel) の場合はローカルにファイルがなくても
            // GitHubリポジトリには存在する可能性があるためそのまま進める
        }

        // --- 2. Git へのコミット & プッシュ ---
        const posixPath = relativeFilePath.split(path.sep).join(path.posix.sep);

        const result = await commitAndPush(
            `Delete movie data: ${id}`,
            [{
                absolutePath: absoluteFilePath,
                relativePath: posixPath,
                deleted: true
            }]
        );

        if (!result.success && strategy === 'github-api') {
            throw new Error(result.message || 'GitHubからの削除に失敗しました');
        } else if (!result.success) {
            console.warn('Git commit/push failed for deletion:', result.message);
        }

        return NextResponse.json({ success: true, message: 'Movie deleted successfully' });

    } catch (error) {
        console.error('Failed to delete movie:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
