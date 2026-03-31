import { NextResponse } from 'next/server';
import { exchangeForOboToken } from '@/auth/texas';

const deltaBackendScope = () =>
    process.env.NEXT_PUBLIC_CLUSTER === 'prod'
        ? 'api://prod-gcp.delta.delta-backend/.default'
        : 'api://dev-gcp.delta.delta-backend/.default';

export async function getOboToken(request: Request): Promise<string | { error: NextResponse }> {
    if (process.env.NODE_ENV !== 'production') return 'placeholder-token';

    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return { error: NextResponse.json({ error: 'Missing token' }, { status: 401 }) };

    const userToken = authHeader.replace('Bearer ', '');
    const token = await exchangeForOboToken(userToken, deltaBackendScope());
    if (!token) return { error: NextResponse.json({ error: 'Token exchange failed' }, { status: 401 }) };

    return token;
}

