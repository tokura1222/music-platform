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
        const { id } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'IDは必須です' },
                { status: 400 }
            );
        }

        const relativePath = `content/songs/${id}.json`;
        const absolutePath = path.join(process.cwd(), relativePath);

        // Check if file exists
        try {
            await fs.access(absolutePath);
        } catch {
            return NextResponse.json(
                { error: '指定された楽曲が見つかりません' },
                { status: 404 }
            );
        }

        // Delete the file
        await fs.unlink(absolutePath);

        // Commit and push (deletion)
        const commitMessage = `Web管理画面から楽曲を削除: ${id}`;
        const result = await commitAndPush(commitMessage, [
            {
                absolutePath,
                relativePath,
                deleted: true,
            },
        ]);

        const strategy = getCurrentStrategy();

        return NextResponse.json({
            success: result.success,
            message: result.message,
            details: result.details,
            id,
            strategy,
        });

    } catch (error) {
        console.error('Delete error:', error);
        return NextResponse.json(
            { error: '楽曲の削除に失敗しました', details: String(error) },
            { status: 500 }
        );
    }
}
