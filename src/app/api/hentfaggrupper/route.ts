import { NextResponse } from 'next/server';
import { getOboTokenFromRequest } from '@/auth/texas';

const scope = () =>
    process.env.NEXT_PUBLIC_CLUSTER === 'prod'
        ? 'api://prod-gcp.delta.delta-backend/.default'
        : 'api://dev-gcp.delta.delta-backend/.default';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const groupTypes = searchParams.getAll('group_type');
    const queryString = groupTypes.map(t => `group_type=${encodeURIComponent(t)}`).join('&');

    const baseUrl = process.env.NODE_ENV === 'production'
        ? 'http://delta-backend/api/faggrupper'
        : 'http://localhost:8080/api/faggrupper';
    const apiUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;

    const tokenResult = await getOboTokenFromRequest(request, scope());
    if (tokenResult instanceof Response) return tokenResult;

    try {
        const response = await fetch(apiUrl, {
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenResult}` },
        });
        if (!response.ok) throw new Error(`Network response was not ok: ${response.status}`);
        return NextResponse.json(await response.json());
    } catch (error) {
        console.error('Fetch failed:', error instanceof Error ? error.message : error);
        return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
    }
}
