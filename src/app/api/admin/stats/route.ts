import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { subDays, format } from 'date-fns';
import { verifyAdminSession } from '@/lib/admin-auth';

export async function GET() {
    const isAdmin = await verifyAdminSession();
    if (!isAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const daysToFetch = 30;
        const dates = [];
        for (let i = daysToFetch - 1; i >= 0; i--) {
            dates.push(format(subDays(new Date(), i), 'yyyy-MM-dd'));
        }

        const pipeline = redis.pipeline();

        // 1. Get Total Stats
        pipeline.get('stats:views:total');

        // 2. Get Daily Stats for each date
        dates.forEach(date => {
            pipeline.get(`stats:views:daily:${date}`);
            pipeline.get(`stats:plays:daily:${date}`);
        });

        const results = await pipeline.exec();

        const totalViews = (results[0] as number) || 0;

        // Skip first result (totalViews)
        const dailyStatsResults = results.slice(1);

        const chartData = dates.map((date, index) => {
            const viewCount = dailyStatsResults[index * 2] as number | null;
            const playCount = dailyStatsResults[index * 2 + 1] as number | null;

            return {
                date,
                views: viewCount || 0,
                plays: playCount || 0,
            };
        });

        // Calculate total plays from chart data (approx) or fetch sum? 
        // Actually we don't have a global "total plays" key easily accessible without iterating all songs?
        // Wait, we do not have a `stats:plays:total` key.
        // We only have `song:{id}:plays`.
        // We can sum up `stats:plays:daily:*` for the period, but that's not TOTAL total.
        // Or we can iterate all songs and sum their plays.
        // Iterating all songs is expensive.
        // Let's add `stats:plays:total` key going forward?
        // Or just show "Period Total" or "Views Total".

        // For now, let's just return what we have.
        // For Total Plays, we can't easily get it globally efficiently unless we track it.
        // I should have added `stats:plays:total` in play API. 
        // Let's verify if I should update play API again.
        // Yes, likely useful. But I can't backfill it easily.
        // I'll stick to chart data for now.

        return NextResponse.json({
            overview: {
                totalViews,
            },
            chartData
        });

    } catch (error) {
        console.error('Stats API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
