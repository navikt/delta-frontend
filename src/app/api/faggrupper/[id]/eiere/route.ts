import { NextResponse } from 'next/server';
import { getToken, validateToken, requestOboToken } from '@navikt/oasis';

const backendUrl = (id: string) =>
    process.env.NODE_ENV === 'production'
        ? `http://delta-backend/api/faggrupper/${id}/eiere`
        : `http://localhost:8080/api/faggrupper/${id}/eiere`;

const oboScope = () =>
    process.env.NEXT_PUBLIC_CLUSTER === 'prod'
        ? 'api://prod-gcp.delta.delta-backend/.default'
        : 'api://dev-gcp.delta.delta-backend/.default';

async function getOboToken(request: Request): Promise<string | { error: NextResponse }> {
    if (process.env.NODE_ENV !== 'production') return 'placeholder-token';
    const token = getToken(request);
    if (!token) return { error: NextResponse.json({ error: 'Missing token' }, { status: 401 }) };
    const validation = await validateToken(token);
    if (!validation.ok) return { error: NextResponse.json({ error: 'Token validation failed' }, { status: 401 }) };
    const obo = await requestOboToken(token, oboScope());
    if (!obo.ok) return { error: NextResponse.json({ error: 'OBO token request failed' }, { status: 401 }) };
    return obo.token;
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const tokenResult = await getOboToken(request);
    if (typeof tokenResult !== 'string') return tokenResult.error;

    try {
        const body = await request.json();
        const response = await fetch(backendUrl(id), {
            method: 'POST',
            headers: { Authorization: `Bearer ${tokenResult}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (response.status === 403) {
            return NextResponse.json({ error: 'Ikke tilgang til å administrere eiere' }, { status: 403 });
        }
        if (!response.ok) throw new Error(`Backend responded with ${response.status}`);
        return NextResponse.json(await response.json());
    } catch (error) {
        console.error('Failed to add faggruppe owner:', error);
        return NextResponse.json({ error: 'Failed to add owner' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const tokenResult = await getOboToken(request);
    if (typeof tokenResult !== 'string') return tokenResult.error;

    try {
        const { epost } = await request.json();
        const response = await fetch(`${backendUrl(id)}/${encodeURIComponent(epost)}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${tokenResult}` },
        });
        if (response.status === 403) {
            return NextResponse.json({ error: 'Ikke tilgang til å administrere eiere' }, { status: 403 });
        }
        if (!response.ok) throw new Error(`Backend responded with ${response.status}`);
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('Failed to remove faggruppe owner:', error);
        return NextResponse.json({ error: 'Failed to remove owner' }, { status: 500 });
    }
}
