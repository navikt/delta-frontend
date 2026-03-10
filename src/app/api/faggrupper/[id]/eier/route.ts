import { NextResponse } from 'next/server';
import { getToken, validateToken, requestOboToken } from '@navikt/oasis';

const oboScope = () =>
    process.env.NEXT_PUBLIC_CLUSTER === 'prod'
        ? 'api://prod-gcp.delta.delta-backend/.default'
        : 'api://dev-gcp.delta.delta-backend/.default';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const apiUrl = process.env.NODE_ENV === 'production'
        ? `http://delta-backend/api/faggrupper/${id}/eier`
        : `http://localhost:8080/api/faggrupper/${id}/eier`;

    try {
        let token: string;
        if (process.env.NODE_ENV === 'production') {
            const rawToken = getToken(request);
            if (!rawToken) return NextResponse.json({ error: 'Missing token' }, { status: 401 });
            const validation = await validateToken(rawToken);
            if (!validation.ok) return NextResponse.json({ error: 'Token validation failed' }, { status: 401 });
            const obo = await requestOboToken(rawToken, oboScope());
            if (!obo.ok) return NextResponse.json({ error: 'OBO token request failed' }, { status: 401 });
            token = obo.token;
        } else {
            token = 'placeholder-token';
        }

        const response = await fetch(apiUrl, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error(`Backend responded with ${response.status}`);
        return NextResponse.json(await response.json());
    } catch (error) {
        console.error('Failed to check faggruppe ownership:', error);
        return NextResponse.json({ error: 'Failed to check ownership' }, { status: 500 });
    }
}
