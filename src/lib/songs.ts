import fs from 'fs';
import path from 'path';
import { Song } from '@/data/songs';

export async function getSongs(): Promise<Song[]> {
    try {
        const jsonPath = path.join(process.cwd(), 'content', 'songs.json');
        const fileContents = await fs.promises.readFile(jsonPath, 'utf8');
        const data = JSON.parse(fileContents);
        return data.songs || [];
    } catch (error) {
        console.error('Error reading songs.json:', error);
        return [];
    }
}
