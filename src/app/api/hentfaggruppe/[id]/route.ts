import { NextResponse } from 'next/server';
import { getToken, validateToken, requestOboToken } from '@navikt/oasis';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const apiUrl = process.env.NODE_ENV === 'production'
        ? `http://delta-fastapi/api/groups/${id}`
        : `http://0.0.0.0:8087/api/groups/${id}`;

    console.log(`Fetching single group from API URL: ${apiUrl}`);

    try {
        let token: string | null;
        if (process.env.NODE_ENV === 'production') {
            token = getToken(request);
            if (!token) {
                return NextResponse.json({ error: 'Missing token' }, { status: 401 });
            }

            const validation = await validateToken(token);
            if (!validation.ok) {
                return NextResponse.json({ error: 'Token validation failed' }, { status: 401 });
            }

            const obo = await requestOboToken(token, 'api://prod-gcp.delta.delta-fastapi/.default');
            if (!obo.ok) {
                return NextResponse.json({ error: 'OBO token request failed' }, { status: 401 });
            }

            token = obo.token;
        } else {
            token = 'placeholder-token';
        }

        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error('API response not OK:', response.status, await response.text());
            throw new Error(`Failed to fetch group: ${response.status}`);
        }

        const data = await response.json();
        console.log('API response data:', JSON.stringify(data, null, 2));
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching group:', error);
        return NextResponse.json(
            { error: 'Failed to fetch group' },
            { status: 500 }
        );
    }
}
