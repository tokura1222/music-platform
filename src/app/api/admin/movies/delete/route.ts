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
        const filePath = path.join(MOVIES_DIR, fileName);

        // ファイルの存在確認
        try {
            await fs.access(filePath);
        } catch (error) {
            return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
        }

        // ファイル削除
        await fs.unlink(filePath);

        // --- Git へのコミット & プッシュ (ローカルのみ) ---
        const strategy = getCurrentStrategy();
        if (strategy === 'local') {
            try {
                // git rm のための相対パス (posix形式)
                const relativeFilePath = path.relative(process.cwd(), filePath);
                const posixPath = relativeFilePath.split(path.sep).join(path.posix.sep);

                await commitAndPush(
                    `Delete movie data: ${id}`,
                    [{
                        absolutePath: filePath,
                        relativePath: posixPath,
                        deleted: true
                    }]
                );
            } catch (gitError) {
                console.warn('Git commit/push failed for deletion:', gitError);
            }
        }

        return NextResponse.json({ success: true, message: 'Movie deleted successfully' });

    } catch (error) {
        console.error('Failed to delete movie:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
