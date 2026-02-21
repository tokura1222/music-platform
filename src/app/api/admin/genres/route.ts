import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import { commitAndPush, getCurrentStrategy } from '@/lib/git-strategy';
import path from 'path';

export async function POST(request: NextRequest) {
    // Auth check
    const isAdmin = await verifyAdminSession();
    if (!isAdmin) {
        return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { genres } = body;

        if (!Array.isArray(genres)) {
            return NextResponse.json(
                { error: 'ジャンルデータは配列である必要があります' },
                { status: 400 }
            );
        }

        const genresJson = JSON.stringify(genres, null, 4);
        const relativePath = `content/genres.json`;
        const absolutePath = path.join(process.cwd(), relativePath);

        // Commit and push
        const commitMessage = `Web管理画面からジャンルを更新`;
        const result = await commitAndPush(commitMessage, [
            {
                absolutePath,
                relativePath,
                content: genresJson,
            },
        ]);

        const strategy = getCurrentStrategy();

        return NextResponse.json({
            success: result.success,
            message: result.message,
            details: result.details,
            strategy,
        });
    } catch (error) {
        console.error('Update genres error:', error);
        return NextResponse.json(
            { error: 'ジャンルの更新に失敗しました', details: String(error) },
            { status: 500 }
        );
    }
}
