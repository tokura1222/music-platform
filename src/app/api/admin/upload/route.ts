import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import path from 'path';
import fs from 'fs/promises';

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

        // Save to public/music/
        const musicDir = path.join(process.cwd(), 'public', 'music');
        await fs.mkdir(musicDir, { recursive: true });
        const filePath = path.join(musicDir, uniqueName);

        const bytes = await file.arrayBuffer();
        await fs.writeFile(filePath, Buffer.from(bytes));

        return NextResponse.json({
            success: true,
            filePath: `/music/${uniqueName}`,
            fileName: uniqueName,
            type: isAudio ? 'audio' : 'image',
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'ファイルのアップロードに失敗しました' },
            { status: 500 }
        );
    }
}
