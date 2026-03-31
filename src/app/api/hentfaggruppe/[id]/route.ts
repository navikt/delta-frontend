import { NextResponse } from 'next/server';
import { getOboTokenFromRequest } from '@/auth/texas';

const scope = () =>
    process.env.NEXT_PUBLIC_CLUSTER === 'prod'
        ? 'api://prod-gcp.delta.delta-backend/.default'
        : 'api://dev-gcp.delta.delta-backend/.default';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const apiUrl = process.env.NODE_ENV === 'production'
        ? `http://delta-backend/api/faggrupper/${id}`
        : `http://localhost:8080/api/faggrupper/${id}`;

    const tokenResult = await getOboTokenFromRequest(request, scope());
    if (tokenResult instanceof Response) return tokenResult;

    try {
        const response = await fetch(apiUrl, {
            headers: { 'Authorization': `Bearer ${tokenResult}`, 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error(`Failed to fetch group: ${response.status}`);
        return NextResponse.json(await response.json());
    } catch (error) {
        console.error('Error fetching group:', error);
        return NextResponse.json({ error: 'Failed to fetch group' }, { status: 500 });
    }
}
