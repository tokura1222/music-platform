import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'daily'; // 'monthly', 'daily', 'hourly'
        const date = searchParams.get('date'); // base date for filtering (e.g. 2024-02 for daily, 2024-02-19 for hourly)

        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');

        let data: { date?: string; time?: string; views: number }[] = [];

        if (type === 'monthly') {
            // Get last 12 months
            const labels = [];
            const keys = [];
            for (let i = 11; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const y = d.getFullYear();
                const m = String(d.getMonth() + 1).padStart(2, '0');
                const key = `${y}-${m}`;
                labels.push(key);
                keys.push(`stats:views:monthly:${key}`);
            }

            if (keys.length > 0) {
                const values = await redis.mget(...keys);
                data = labels.map((label, index) => ({
                    date: label,
                    views: Number(values[index]) || 0,
                }));
            }

        } else if (type === 'daily') {
            // Get days of the specified month or current month
            const targetMonth = date || `${year}-${month}`; // YYYY-MM
            const [targetYear, targetMonthNum] = targetMonth.split('-').map(Number);
            const daysInMonth = new Date(targetYear, targetMonthNum, 0).getDate();

            const labels = [];
            const keys = [];

            for (let i = 1; i <= daysInMonth; i++) {
                const d = String(i).padStart(2, '0');
                const key = `${targetMonth}-${d}`;
                labels.push(key);
                keys.push(`stats:views:daily:${key}`);
            }

            if (keys.length > 0) {
                const values = await redis.mget(...keys);
                data = labels.map((label, index) => ({
                    date: label,
                    views: Number(values[index]) || 0,
                }));
            }

        } else if (type === 'hourly') {
            // Get 24 hours of the specified day or current day
            const targetDate = date || `${year}-${month}-${day}`; // YYYY-MM-DD

            const labels = [];
            const keys = [];

            for (let i = 0; i < 24; i++) {
                const h = String(i).padStart(2, '0');
                const key = `${targetDate}:${h}`; // redis key: stats:views:hourly:YYYY-MM-DD:HH
                labels.push(`${h}:00`);
                keys.push(`stats:views:hourly:${key}`);
            }

            if (keys.length > 0) {
                const values = await redis.mget(...keys);
                data = labels.map((label, index) => ({
                    time: label,
                    views: Number(values[index]) || 0,
                }));
            }
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Failed to fetch access stats:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
