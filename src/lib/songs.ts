import fs from 'fs';
import path from 'path';
import { Song } from '@/data/songs';

export async function getSongs(): Promise<Song[]> {
    try {
        const songsDir = path.join(process.cwd(), 'content', 'songs');

        // Check if folder-based structure exists
        if (fs.existsSync(songsDir) && fs.statSync(songsDir).isDirectory()) {
            const files = await fs.promises.readdir(songsDir);
            const jsonFiles = files.filter(f => f.endsWith('.json'));

            const songs: Song[] = [];
            for (const file of jsonFiles) {
                const filePath = path.join(songsDir, file);
                const content = await fs.promises.readFile(filePath, 'utf8');
                const data = JSON.parse(content);
                // Use filename (without extension) as the ID
                const id = path.basename(file, '.json');
                songs.push({ id, ...data });
            }

            return songs;
        }

        // Fallback: read legacy single-file format
        const jsonPath = path.join(process.cwd(), 'content', 'songs.json');
        if (fs.existsSync(jsonPath)) {
            const fileContents = await fs.promises.readFile(jsonPath, 'utf8');
            const data = JSON.parse(fileContents);
            return (data.songs || []).map((s: Song, i: number) => ({
                ...s,
                id: s.id || `legacy-${i}`,
            }));
        }

        return [];
    } catch (error) {
        console.error('Error reading songs:', error);
        return [];
    }
}
