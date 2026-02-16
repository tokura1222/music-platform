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
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'ファイルが選択されていません' }, { status: 400 });
        }

        // Validate file type
        const allowedAudio = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/aac'];
        const allowedImage = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        const isAudio = allowedAudio.includes(file.type);
        const isImage = allowedImage.includes(file.type);

        if (!isAudio && !isImage) {
            return NextResponse.json(
                { error: `対応していないファイル形式です: ${file.type}` },
                { status: 400 }
            );
        }

        // Generate unique filename
        const ext = path.extname(file.name) || (isAudio ? '.mp3' : '.jpg');
        const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
        const uniqueName = `${baseName}_${Date.now()}${ext}`;

        // Define paths
        const relativePath = `public/music/${uniqueName}`;
        const absolutePath = path.join(process.cwd(), 'public', 'music', uniqueName);
        const webPath = `/music/${uniqueName}`;

        // Read file content
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Commit and push (to GitHub or local)
        // Note: In Vercel (GitHub strategy), this will push to the repo but the file won't be available
        // via URL until the deployment finishes.
        const commitMessage = `Add media file: ${uniqueName}`;
        const result = await commitAndPush(commitMessage, [
            {
                absolutePath,
                relativePath,
                content: buffer,
            },
        ]);

        if (!result.success) {
            throw new Error(result.message);
        }

        return NextResponse.json({
            success: true,
            filePath: webPath,
            fileName: uniqueName,
            type: isAudio ? 'audio' : 'image',
            strategy: getCurrentStrategy(),
            message: 'ファイルがアップロードされました（デプロイ完了まで反映されません）'
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'ファイルのアップロードに失敗しました', details: String(error) },
            { status: 500 }
        );
    }
}
