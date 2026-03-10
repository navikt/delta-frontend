import { NextResponse } from 'next/server';
import { getToken, validateToken, requestOboToken } from '@navikt/oasis';

const backendUrl = (id: string) =>
    process.env.NODE_ENV === 'production'
        ? `http://delta-backend/api/faggrupper/${id}`
        : `http://localhost:8080/api/faggrupper/${id}`;

const oboScope = () =>
    process.env.NEXT_PUBLIC_CLUSTER === 'prod'
        ? 'api://prod-gcp.delta.delta-backend/.default'
        : 'api://dev-gcp.delta.delta-backend/.default';

async function getToken_(request: Request): Promise<string | { error: NextResponse }> {
    if (process.env.NODE_ENV !== 'production') return 'placeholder-token';
    const token = getToken(request);
    if (!token) return { error: NextResponse.json({ error: 'Missing token' }, { status: 401 }) };
    const validation = await validateToken(token);
    if (!validation.ok) return { error: NextResponse.json({ error: 'Token validation failed' }, { status: 401 }) };
    const obo = await requestOboToken(token, oboScope());
    if (!obo.ok) return { error: NextResponse.json({ error: 'OBO token request failed' }, { status: 401 }) };
    return obo.token;
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const tokenResult = await getToken_(request);
    if (typeof tokenResult !== 'string') return tokenResult.error;

    try {
        const response = await fetch(backendUrl(id), {
            headers: { Authorization: `Bearer ${tokenResult}`, 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error(`Backend responded with ${response.status}`);
        return NextResponse.json(await response.json());
    } catch (error) {
        console.error('Failed to fetch faggruppe:', error);
        return NextResponse.json({ error: 'Failed to fetch faggruppe' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const tokenResult = await getToken_(request);
    if (typeof tokenResult !== 'string') return tokenResult.error;

    try {
        const body = await request.json();
        const response = await fetch(backendUrl(id), {
            method: 'PUT',
            headers: { Authorization: `Bearer ${tokenResult}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (response.status === 403) {
            return NextResponse.json({ error: 'Not authorized to edit this faggruppe' }, { status: 403 });
        }
        if (!response.ok) throw new Error(`Backend responded with ${response.status}`);
        return NextResponse.json(await response.json());
    } catch (error) {
        console.error('Failed to update faggruppe:', error);
        return NextResponse.json({ error: 'Failed to update faggruppe' }, { status: 500 });
    }
}
