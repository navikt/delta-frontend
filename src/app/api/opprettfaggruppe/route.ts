import { NextResponse } from 'next/server';
import { exchangeForOboToken } from '@/auth/texas';

const deltaBackendScope = () =>
    process.env.NEXT_PUBLIC_CLUSTER === 'prod'
        ? 'api://prod-gcp.delta.delta-backend/.default'
        : 'api://dev-gcp.delta.delta-backend/.default';

export async function POST(request: Request) {
    const apiUrl = process.env.NODE_ENV === 'production'
        ? 'http://delta-backend/api/groups'
        : 'http://localhost:8080/api/groups';

    try {
        const body = await request.json();
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
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!response.ok) throw new Error(`Failed to create group: ${response.status}`);
        return NextResponse.json(await response.json());
    } catch (error) {
        console.error('Error creating group:', error);
        return NextResponse.json({ error: 'Failed to create group' }, { status: 500 });
    }
}
