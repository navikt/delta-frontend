import { NextResponse } from 'next/server';
import { getToken, validateToken, requestOboToken } from '@navikt/oasis';

export const oboScope = () =>
    process.env.NEXT_PUBLIC_CLUSTER === 'prod'
        ? 'api://prod-gcp.delta.delta-backend/.default'
        : 'api://dev-gcp.delta.delta-backend/.default';

export async function getOboToken(request: Request): Promise<string | { error: NextResponse }> {
    if (process.env.NODE_ENV !== 'production') return 'placeholder-token';
    const token = getToken(request);
    if (!token) return { error: NextResponse.json({ error: 'Missing token' }, { status: 401 }) };
    const validation = await validateToken(token);
    if (!validation.ok) return { error: NextResponse.json({ error: 'Token validation failed' }, { status: 401 }) };
    const obo = await requestOboToken(token, oboScope());
    if (!obo.ok) return { error: NextResponse.json({ error: 'OBO token request failed' }, { status: 401 }) };
    return obo.token;
}
