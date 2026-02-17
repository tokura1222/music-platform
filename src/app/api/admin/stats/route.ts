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
            // Fetch daily device stats to aggregate
            pipeline.get(`stats:device:mobile:${date}`);
            pipeline.get(`stats:device:desktop:${date}`);
        });

        // 3. Get Top Referrers (Total)
        pipeline.zrange('stats:referrers:total', 0, 9, { rev: true, withScores: true });

        const results = await pipeline.exec();

        const totalViews = (results[0] as number) || 0;

        // Calculate daily stats and aggregate devices
        const dailyStatsResults = results.slice(1, 1 + dates.length * 4);
        // The referrer result is at the end
        const referrerResults = results[results.length - 1] as (string | number)[];

        let totalMobile = 0;
        let totalDesktop = 0;

        const chartData = dates.map((date, index) => {
            const baseIndex = index * 4;
            const viewCount = dailyStatsResults[baseIndex] as number | null;
            const playCount = dailyStatsResults[baseIndex + 1] as number | null;
            const mobileCount = dailyStatsResults[baseIndex + 2] as number | null;
            const desktopCount = dailyStatsResults[baseIndex + 3] as number | null;

            if (mobileCount) totalMobile += mobileCount;
            if (desktopCount) totalDesktop += desktopCount;

            return {
                date,
                views: viewCount || 0,
                plays: playCount || 0,
            };
        });

        // Format Referrers
        // Redis ZREVRANGE withWITHSCORES returns [member1, score1, member2, score2, ...]
        const referrers = [];
        if (Array.isArray(referrerResults)) {
            for (let i = 0; i < referrerResults.length; i += 2) {
                referrers.push({
                    domain: referrerResults[i] as string,
                    count: referrerResults[i + 1] as number
                });
            }
        }

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
            chartData,
            devices: [
                { name: 'Mobile', value: totalMobile },
                { name: 'Desktop', value: totalDesktop }
            ],
            referrers
        });

    } catch (error) {
        console.error('Stats API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
