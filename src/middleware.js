import { NextResponse } from 'next/server';

export async function middleware(req) {
    const url = req.nextUrl.clone();
    console.log(`Middleware triggered for: ${url.pathname}`);

    const event = {
        app_id: "65faca38-5cd7-492f-aebe-52674521f66c",
        url_host: url.host,
        url_path: url.pathname,
        url_query: url.search,
        event_name: "pageview"
    };

    try {
        const response = await fetch('https://fastapi.nav.no/api/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(event)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        console.log('Event sent successfully');
    } catch (error) {
        console.error('Failed to send event:', error);
    }

    return NextResponse.next();
}