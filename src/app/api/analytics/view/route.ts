import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function POST(request: Request) {
    try {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const ua = request.headers.get('user-agent') || '';
        const referer = request.headers.get('referer');
        const host = request.headers.get('host');

        // Determine device type
        const isMobile = /mobile|android|iphone|ipad|ipod/i.test(ua);
        const deviceType = isMobile ? 'mobile' : 'desktop';

        const pipeline = redis.pipeline();
        pipeline.incr('stats:views:total');
        pipeline.incr(`stats:views:daily:${today}`);

        // Track Device
        pipeline.incr(`stats:device:${deviceType}:${today}`);

        // Track Location (Country & City)
        const country = request.headers.get('x-vercel-ip-country');
        const city = request.headers.get('x-vercel-ip-city'); // City name (decoded usually needed?)
        // City headers might be URL encoded visually but Vercel documentation says names.
        // It's safer to store as is or decodeURIComponent if needed. 
        // Headers are usually ISO-8859-1, but Vercel sends UTF-8 in headers for city?
        // Let's store raw for now.

        if (country) {
            pipeline.zincrby('stats:location:country', 1, country);
        }
        if (city && country) {
            // Store as "City, Country" to avoid ambiguity
            const location = `${decodeURIComponent(city)}, ${country}`;
            pipeline.zincrby('stats:location:city', 1, location);
        }

        // Track Referrer (External only)
        if (referer) {
            try {
                const refererUrl = new URL(referer);
                const hostname = refererUrl.hostname;
                // Simple check to identify internal traffic (localhost or same domain)
                if (hostname !== host && !hostname.includes('localhost') && !hostname.includes('127.0.0.1')) {
                    // Use ZINCRBY to increment score in sorted set
                    pipeline.zincrby(`stats:referrers:total`, 1, hostname);
                    // Also track daily if needed, but total is prioritized for "Ranking"
                    // pipeline.zincrby(`stats:referrers:daily:${today}`, 1, hostname);
                }
            } catch (e) {
                // Ignore invalid referer URL
            }
        }

        await pipeline.exec();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Analytics View Error:', error);
        // Fail silently to not impact user experience
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
