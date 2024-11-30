'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';

export function UmamiTracker() {
    const pathname = usePathname();

    useEffect(() => {
        // @ts-ignore
        if (window.umami) {
            // @ts-ignore
            window.umami.track(pathname);
        }
    }, [pathname]);

    return (
        <Script
            strategy="afterInteractive"
            src="https://cdn.nav.no/team-researchops/sporing/sporing.js"
            data-domains="delta.nav.no"
            data-host-url="https://umami.nav.no"
            data-website-id="efe951d8-ebbb-4fad-938e-91eee190f6aa"
            defer
        />
    );
}