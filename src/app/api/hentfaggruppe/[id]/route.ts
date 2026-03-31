import { NextResponse } from 'next/server';
import { exchangeForOboToken } from '@/auth/texas';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const apiUrl = process.env.NODE_ENV === 'production'
        ? `http://delta-fastapi/api/groups/${id}`
        : `http://0.0.0.0:8087/api/groups/${id}`;

    try {
        let token: string;
        if (process.env.NODE_ENV === 'production') {
            const authHeader = request.headers.get('Authorization');
            if (!authHeader) return NextResponse.json({ error: 'Missing token' }, { status: 401 });

            const oboToken = await exchangeForOboToken(authHeader.replace('Bearer ', ''), 'api://prod-gcp.delta.delta-fastapi/.default');
            if (!oboToken) return NextResponse.json({ error: 'Token exchange failed' }, { status: 401 });
            token = oboToken;
        } else {
            token = 'placeholder-token';
        }

        const response = await fetch(apiUrl, {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        });

        if (!response.ok) throw new Error(`Failed to fetch group: ${response.status}`);
        return NextResponse.json(await response.json());
    } catch (error) {
        console.error('Error fetching group:', error);
        return NextResponse.json({ error: 'Failed to fetch group' }, { status: 500 });
    }
}
