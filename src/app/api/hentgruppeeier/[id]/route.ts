import { NextResponse } from 'next/server';
import { exchangeForOboToken } from '@/auth/texas';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const apiUrl = process.env.NODE_ENV === 'production'
        ? `http://delta-fastapi/api/groups/${id}/is-owner`
        : `http://0.0.0.0:8087/api/groups/${id}/is-owner`;

    try {
        let token: string;
        if (process.env.NODE_ENV === 'production') {
            const authHeader = request.headers.get('Authorization');
            if (!authHeader) return NextResponse.json({ isOwner: false });

            const oboToken = await exchangeForOboToken(authHeader.replace('Bearer ', ''), 'api://prod-gcp.delta.delta-fastapi/.default');
            if (!oboToken) return NextResponse.json({ isOwner: false });
            token = oboToken;
        } else {
            token = 'placeholder-token';
        }

        const response = await fetch(apiUrl, {
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) return NextResponse.json({ isOwner: false });
        return NextResponse.json(await response.json());
    } catch (error) {
        console.error('Error checking ownership:', error);
        return NextResponse.json({ isOwner: false });
    }
}
