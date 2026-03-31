import { NextResponse } from 'next/server';
import { exchangeForOboToken } from '@/auth/texas';

const deltaBackendScope = () =>
    process.env.NEXT_PUBLIC_CLUSTER === 'prod'
        ? 'api://prod-gcp.delta.delta-backend/.default'
        : 'api://dev-gcp.delta.delta-backend/.default';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const groupTypes = searchParams.getAll('group_type');
    const queryString = groupTypes.map(t => `group_type=${encodeURIComponent(t)}`).join('&');

    const baseUrl = process.env.NODE_ENV === 'production'
        ? 'http://delta-backend/api/groups'
        : 'http://localhost:8080/api/groups';
    const apiUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;

    try {
        let token: string;
        if (process.env.NODE_ENV === 'production') {
            const authHeader = request.headers.get('Authorization');
            if (!authHeader) return NextResponse.json({ error: 'Missing token' }, { status: 401 });

            const oboToken = await exchangeForOboToken(authHeader.replace('Bearer ', ''), deltaBackendScope());
            if (!oboToken) return NextResponse.json({ error: 'Token exchange failed' }, { status: 401 });
            token = oboToken;
        } else {
            token = 'placeholder-token';
        }

        const response = await fetch(apiUrl, {
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) throw new Error(`Network response was not ok: ${response.status}`);
        return NextResponse.json(await response.json());
    } catch (error) {
        console.error('Fetch failed:', error instanceof Error ? error.message : error);
        return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
    }
}
