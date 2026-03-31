import { NextResponse } from 'next/server';
import { getOboTokenFromRequest } from '@/auth/texas';

const scope = () =>
    process.env.NEXT_PUBLIC_CLUSTER === 'prod'
        ? 'api://prod-gcp.delta.delta-backend/.default'
        : 'api://dev-gcp.delta.delta-backend/.default';

export async function POST(request: Request) {
    const apiUrl = process.env.NODE_ENV === 'production'
        ? 'http://delta-backend/api/groups'
        : 'http://localhost:8080/api/groups';

    const tokenResult = await getOboTokenFromRequest(request, scope());
    if (tokenResult instanceof Response) return tokenResult;

    try {
        const body = await request.json();
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${tokenResult}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (!response.ok) throw new Error(`Failed to create group: ${response.status}`);
        return NextResponse.json(await response.json());
    } catch (error) {
        console.error('Error creating group:', error);
        return NextResponse.json({ error: 'Failed to create group' }, { status: 500 });
    }
}
