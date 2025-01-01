import { NextResponse } from 'next/server';

export async function middleware(req) {
    const url = req.nextUrl.clone();

    // Do not trigger middleware for /internal, /favicon, /_next paths, prefetching requests, or URLs containing ?_rsc=
    if (url.pathname.startsWith('/internal') || url.pathname.startsWith('/favicon') || url.pathname.startsWith('/_next') || req.headers.get('next-url')) {
        return NextResponse.next();
    }

    // Only trigger middleware for GET requests
    if (req.method !== 'GET') {
        return NextResponse.next();
    }

    const event = {
        app_id: "65faca38-5cd7-492f-aebe-52674521f66c",
        url_host: "delta.ansatt.nav.no",
        url_path: url.pathname,
        url_query: url.search,
        event_name: "pageview"
    };

    // Send the analytics event without waiting for the response
    fetch('https://fastapi.nav.no/api/send', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
    }).then(response => {
        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`);
        }
    }).catch(error => {
        console.error('Failed to send event:', error);
    });

    return NextResponse.next();
}