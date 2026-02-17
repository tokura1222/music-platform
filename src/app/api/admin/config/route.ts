import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';

export async function GET() {
    // Auth check
    const isAdmin = await verifyAdminSession();
    if (!isAdmin) {
        return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const token = process.env.GITHUB_TOKEN;
    const repo = process.env.GITHUB_REPO;
    const branch = process.env.GIT_BRANCH || 'main';

    if (!token || !repo) {
        return NextResponse.json(
            { error: 'サーバー側のGitHub設定が不足しています' },
            { status: 500 }
        );
    }

    // Note: Do not expose GITHUB_TOKEN directly to the client.
    // The token is used server-side only via the upload/publish API routes.
    return NextResponse.json({
        configured: true,
        repo,
        branch,
    });
}
