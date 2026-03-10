import { NextResponse } from 'next/server';
import { getToken, validateToken, requestOboToken } from '@navikt/oasis';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const apiUrl = process.env.NODE_ENV === 'production'
        ? `http://delta-backend/api/groups/${id}`
        : `http://localhost:8080/api/groups/${id}`;

    try {
        const body = await request.json();
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

            const obo = await requestOboToken(token, process.env.NEXT_PUBLIC_CLUSTER === 'prod'
                ? 'api://prod-gcp.delta.delta-backend/.default'
                : 'api://dev-gcp.delta.delta-backend/.default');
            if (!obo.ok) {
                return NextResponse.json({ error: 'OBO token request failed' }, { status: 401 });
            }

            token = obo.token;
        } else {
            token = 'placeholder-token';
        }

        const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (response.status === 403) {
            return NextResponse.json({ error: 'Not authorized to edit this group' }, { status: 403 });
        }

        if (!response.ok) {
            throw new Error(`Failed to update group: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error updating group:', error);
        return NextResponse.json(
            { error: 'Failed to update group' },
            { status: 500 }
        );
    }
}
