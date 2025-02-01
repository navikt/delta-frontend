import { NextResponse } from 'next/server';
import { getToken, validateToken, requestOboToken } from '@navikt/oasis';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const apiUrl = process.env.NODE_ENV === 'production'
        ? `http://delta-fastapi/api/groups/${params.id}/owners`
        : `http://0.0.0.0:8087/api/groups/${params.id}/owners`;

    try {
        let token: string | null;
        if (process.env.NODE_ENV === 'production') {
            token = getToken(request);
            if (!token) {
                return NextResponse.json({ isOwner: false }, { status: 401 });
            }

            const validation = await validateToken(token);
            if (!validation.ok) {
                return NextResponse.json({ isOwner: false }, { status: 401 });
            }

            const obo = await requestOboToken(token, 'api://prod-gcp.delta.delta-fastapi/.default');
            if (!obo.ok) {
                return NextResponse.json({ isOwner: false }, { status: 401 });
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

        const userData = await response.json();
        const userEmail = userData.email; // Assuming the API returns the user's email
        
        return NextResponse.json({ isOwner: true });

    } catch (error) {
        console.error('Error checking ownership:', error);
        return NextResponse.json({ isOwner: false });
    }
}