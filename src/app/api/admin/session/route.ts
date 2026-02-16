import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';

export async function GET() {
    const isAdmin = await verifyAdminSession();
    if (!isAdmin) {
        return NextResponse.json({ authenticated: false }, { status: 401 });
    }
    return NextResponse.json({ authenticated: true });
}
