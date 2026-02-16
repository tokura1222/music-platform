import { NextRequest, NextResponse } from 'next/server';
import { validateCredentials, setAdminSessionCookie } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json(
                { error: 'ユーザー名とパスワードを入力してください' },
                { status: 400 }
            );
        }

        if (!validateCredentials(username, password)) {
            return NextResponse.json(
                { error: 'ユーザー名またはパスワードが正しくありません' },
                { status: 401 }
            );
        }

        await setAdminSessionCookie();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'ログインに失敗しました' },
            { status: 500 }
        );
    }
}
