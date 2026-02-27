import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';

export const maxDuration = 60; // 60 seconds

export async function POST(request: NextRequest) {
    const isAdmin = await verifyAdminSession();
    if (!isAdmin) {
        return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const uploadId = formData.get('uploadId') as string;
        const chunkIndex = parseInt(formData.get('chunkIndex') as string, 10);
        const totalChunks = parseInt(formData.get('totalChunks') as string, 10);
        const chunk = formData.get('chunk') as Blob;

        if (!uploadId || isNaN(chunkIndex) || isNaN(totalChunks) || !chunk) {
            return NextResponse.json({ error: '不正なリクエストパラメータです' }, { status: 400 });
        }

        const buffer = Buffer.from(await chunk.arrayBuffer());
        const tempFilePath = path.join(os.tmpdir(), uploadId);

        if (chunkIndex === 0) {
            // Write the first chunk (overwrites any existing file from a failed upload)
            await fs.writeFile(tempFilePath, buffer);
        } else {
            // Append subsequent chunks
            await fs.appendFile(tempFilePath, buffer);
        }

        const isComplete = chunkIndex === totalChunks - 1;

        return NextResponse.json({
            success: true,
            isComplete,
            message: `Chunk ${chunkIndex + 1}/${totalChunks} uploaded`
        });

    } catch (error) {
        console.error('Chunk upload error:', error);
        return NextResponse.json(
            { error: 'チャンクのアップロードに失敗しました', details: String(error) },
            { status: 500 }
        );
    }
}
