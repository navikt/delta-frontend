import { NextResponse } from 'next/server';
import { getOboToken } from '../../obo';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const tokenResult = await getOboToken(request);
    if (typeof tokenResult !== 'string') return tokenResult.error;

    const apiUrl = process.env.NODE_ENV === 'production'
        ? `http://delta-backend/api/faggrupper/${id}/eier`
        : `http://localhost:8080/api/faggrupper/${id}/eier`;

    try {
        const response = await fetch(apiUrl, {
            headers: { Authorization: `Bearer ${tokenResult}`, 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error(`Backend responded with ${response.status}`);
        return NextResponse.json(await response.json());
    } catch (error) {
        console.error('Failed to check faggruppe ownership:', error);
        return NextResponse.json({ error: 'Failed to check ownership' }, { status: 500 });
    }
}
