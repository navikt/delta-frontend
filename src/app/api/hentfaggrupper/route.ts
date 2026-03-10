import { NextResponse } from 'next/server';
import { getToken, validateToken, requestOboToken } from '@navikt/oasis';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const groupTypes = searchParams.getAll('group_type');
    const queryString = groupTypes.map(t => `group_type=${encodeURIComponent(t)}`).join('&');

    const baseUrl = process.env.NODE_ENV === 'production'
        ? 'http://delta-backend/api/groups'
        : 'http://localhost:8080/api/groups';
    const apiUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;

    console.log(`Fetching from API URL: ${apiUrl}`);

    try {
        let token: string | null;
        if (process.env.NODE_ENV === 'production') {
            token = getToken(request);
            if (!token) {
                return NextResponse.json({ error: 'Missing token' }, { status: 401 });
            }

            const validation = await validateToken(token);
            if (!validation.ok) {
                return NextResponse.json({ error: 'Token validation failed' }, { status: 401 });
            }

            const obo = await requestOboToken(token, process.env.NEXT_PUBLIC_CLUSTER === 'prod'
                ? 'api://prod-gcp.delta.delta-backend/.default'
                : 'api://dev-gcp.delta.delta-backend/.default');
            if (!obo.ok) {
                return NextResponse.json({ error: 'OBO token request failed' }, { status: 401 });
            }

            token = obo.token;
        } else {
            token = 'placeholder-token';
        }

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorDetails = await response.text();
            console.error('Network response was not ok:', response.status, errorDetails);
            throw new Error(`Network response was not ok: ${response.status} - ${errorDetails}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        if (error instanceof Error) {
            console.error('Fetch failed:', error.message, error.stack);
            return NextResponse.json({ error: 'Fetch failed', message: error.message }, { status: 500 });
        } else {
            console.error('An unknown error occurred');
            return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
        }
    }
}