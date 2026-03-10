import { NextResponse } from 'next/server';
import { getOboToken } from '../obo';

const backendUrl = (id: string) =>
    process.env.NODE_ENV === 'production'
        ? `http://delta-backend/api/faggrupper/${id}`
        : `http://localhost:8080/api/faggrupper/${id}`;

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const tokenResult = await getOboToken(request);
    if (typeof tokenResult !== 'string') return tokenResult.error;

    try {
        const response = await fetch(backendUrl(id), {
            headers: { Authorization: `Bearer ${tokenResult}`, 'Content-Type': 'application/json' },
        });
        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            return NextResponse.json(errorBody, { status: response.status });
        }
        return NextResponse.json(await response.json());
    } catch (error) {
        console.error('Failed to fetch faggruppe:', error);
        return NextResponse.json({ error: 'Failed to fetch faggruppe' }, { status: 500 });
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
        const response = await fetch(backendUrl(id), {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${tokenResult}` },
        });
        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            return NextResponse.json(errorBody, { status: response.status });
        }
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('Failed to delete faggruppe:', error);
        return NextResponse.json({ error: 'Failed to delete faggruppe' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const tokenResult = await getOboToken(request);
    if (typeof tokenResult !== 'string') return tokenResult.error;

    try {
        const body = await request.json();
        const response = await fetch(backendUrl(id), {
            method: 'PUT',
            headers: { Authorization: `Bearer ${tokenResult}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            return NextResponse.json(errorBody, { status: response.status });
        }
        return NextResponse.json(await response.json());
    } catch (error) {
        console.error('Failed to update faggruppe:', error);
        return NextResponse.json({ error: 'Failed to update faggruppe' }, { status: 500 });
    }
}
