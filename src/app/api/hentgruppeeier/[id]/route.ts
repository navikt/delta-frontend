import { NextResponse } from 'next/server';
import { getToken, validateToken, requestOboToken } from '@navikt/oasis';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const apiUrl = process.env.NODE_ENV === 'production'
        ? `http://delta-fastapi/api/groups/${params.id}/is-owner`
        : `http://0.0.0.0:8087/api/groups/${params.id}/is-owner`;

    try {
        let token: string | null;
        if (process.env.NODE_ENV === 'production') {
            token = getToken(request);
            if (!token) {
                return NextResponse.json({ isOwner: false });
            }

            const validation = await validateToken(token);
            if (!validation.ok) {
                return NextResponse.json({ isOwner: false });
            }

            const obo = await requestOboToken(token, 'api://prod-gcp.delta.delta-fastapi/.default');
            if (!obo.ok) {
                return NextResponse.json({ isOwner: false });
            }

            token = obo.token;
        } else {
            token = 'placeholder-token';
        }

        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            return NextResponse.json({ isOwner: false });
        }

        // Just pass through the response from the API
        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('Error checking ownership:', error);
        return NextResponse.json({ isOwner: false });
    }
}