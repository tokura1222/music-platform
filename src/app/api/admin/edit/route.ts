import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import { commitAndPush, getCurrentStrategy } from '@/lib/git-strategy';
import path from 'path';
import fs from 'fs/promises';
import { getGenreBySlug } from '@/lib/genres';

export async function POST(request: NextRequest) {
    // Auth check
    const isAdmin = await verifyAdminSession();
    if (!isAdmin) {
        return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { id, title, artist, genreSlug, category } = body;

        if (!id || !title || !artist) {
            return NextResponse.json(
                { error: 'ID、タイトル、アーティストは必須です' },
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

        // Read existing data to preserve other fields (url, coverPath, stats if any in file)
        const fileContent = await fs.readFile(absolutePath, 'utf-8');
        const currentData = JSON.parse(fileContent);

        // Update fields
        // Note: category is derived from genreSlug if possible, or fallback to provided category/current
        let newCategory = category;
        if (genreSlug) {
            const genre = getGenreBySlug(genreSlug);
            if (genre) {
                newCategory = genre.category;
            }
        }

        const updatedData = {
            ...currentData,
            title,
            artist,
            category: newCategory || currentData.category || 'vocal',
            ...(genreSlug ? { genreSlug } : {}),
            // Ensure we don't lose the URL and coverPath
            url: currentData.url,
            coverPath: currentData.coverPath,
        };

        const updatedJson = JSON.stringify(updatedData, null, 2);

        // Write the updated JSON file
        await fs.writeFile(absolutePath, updatedJson, 'utf-8');

        // Commit and push
        const commitMessage = `Web管理画面から楽曲を更新: ${title} (${id})`;
        const result = await commitAndPush(commitMessage, [
            {
                absolutePath,
                relativePath,
                content: updatedJson,
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
        console.error('Edit error:', error);
        return NextResponse.json(
            { error: '楽曲の更新に失敗しました', details: String(error) },
            { status: 500 }
        );
    }
}
