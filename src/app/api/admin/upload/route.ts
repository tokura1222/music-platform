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

        let file = formData.get('file') as File | null;
        let fileType = '';
        let originalName = '';
        let fileBuffer: Buffer | null = null;

        const uploadId = formData.get('uploadId') as string;
        const fileName = formData.get('fileName') as string;
        const providedFileType = formData.get('fileType') as string;

        if (uploadId && fileName) {
            const fs = await import('fs/promises');
            const os = await import('os');
            const tempFilePath = path.join(os.tmpdir(), uploadId);
            try {
                fileBuffer = await fs.readFile(tempFilePath);
                originalName = fileName;
                fileType = providedFileType || 'audio/mpeg';
                fs.unlink(tempFilePath).catch(err => console.error('Failed to rm temp', err));
            } catch (err) {
                console.error('Failed to read chunked temp file', err);
                return NextResponse.json({ error: 'アップロードの復元に失敗しました' }, { status: 400 });
            }
        } else if (file) {
            fileType = file.type;
            originalName = file.name;
            fileBuffer = Buffer.from(await file.arrayBuffer());
        } else {
            return NextResponse.json({ error: 'ファイルが選択されていません' }, { status: 400 });
        }

        // Validate file type
        const allowedAudio = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/aac'];
        const allowedImage = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        const isAudio = allowedAudio.includes(fileType);
        const isImage = allowedImage.includes(fileType);

        if (!isAudio && !isImage) {
            return NextResponse.json(
                { error: `対応していないファイル形式です: ${fileType}` },
                { status: 400 }
            );
        }

        // Generate unique filename
        const ext = path.extname(originalName) || (isAudio ? '.mp3' : '.jpg');
        const baseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
        const uniqueName = `${baseName}_${Date.now()}${ext}`;

        // Define paths
        const relativePath = `public/music/${uniqueName}`;
        const absolutePath = path.join(process.cwd(), 'public', 'music', uniqueName);
        const webPath = `/music/${uniqueName}`;

        // Read file content (already loaded in fileBuffer)
        const buffer = fileBuffer!;

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
