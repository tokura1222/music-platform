"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function AnalyticsTracker() {
    const pathname = usePathname();
    const initialized = useRef(false);

    useEffect(() => {
        // Prevent double counting in strict mode or rapid changes
        // But actually we want to count every navigation

        // Skip analytics for admin pages
        if (pathname.startsWith('/manage') || pathname.startsWith('/api')) {
            return;
        }

        const trackView = async () => {
            try {
                await fetch('/api/analytics/view', { method: 'POST' });
            } catch (e) {
                // ignore
            }
        };

        trackView();
    }, [pathname]);

    return null;
}
