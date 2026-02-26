import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAllMovies } from '@/lib/movies';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('admin_token');

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const movies = await getAllMovies({ includeHidden: true });
        return NextResponse.json(movies);

    } catch (error) {
        console.error('Failed to fetch movies:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
