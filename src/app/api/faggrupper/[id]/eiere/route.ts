import { NextResponse } from 'next/server';
import { getOboToken } from '../../obo';

const backendUrl = (id: string) =>
    process.env.NODE_ENV === 'production'
        ? `http://delta-backend/api/faggrupper/${id}/eiere`
        : `http://localhost:8080/api/faggrupper/${id}/eiere`;

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
        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            return NextResponse.json(errorBody, { status: response.status });
        }
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
        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            return NextResponse.json(errorBody, { status: response.status });
        }
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('Failed to remove faggruppe owner:', error);
        return NextResponse.json({ error: 'Failed to remove owner' }, { status: 500 });
    }
}
