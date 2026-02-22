import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import { getAllTracks } from '@/lib/tracks';

export const dynamic = 'force-dynamic';

export async function GET() {
    const isAdmin = await verifyAdminSession();
    if (!isAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tracks = await getAllTracks({ includeHidden: true, includeFreePlan: true });
    return NextResponse.json(tracks);
}
