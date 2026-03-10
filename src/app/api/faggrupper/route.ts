import { NextResponse } from 'next/server';
import { getOboToken } from './obo';

const backendUrl = () =>
    process.env.NODE_ENV === 'production'
        ? 'http://delta-backend/api/faggrupper'
        : 'http://localhost:8080/api/faggrupper';

export async function GET(request: Request) {
    const tokenResult = await getOboToken(request);
    if (typeof tokenResult !== 'string') return tokenResult.error;

    try {
        const response = await fetch(backendUrl(), {
            headers: { Authorization: `Bearer ${tokenResult}`, 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error(`Backend responded with ${response.status}`);
        return NextResponse.json(await response.json());
    } catch (error) {
        console.error('Failed to fetch faggrupper:', error);
        return NextResponse.json({ error: 'Failed to fetch faggrupper' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const tokenResult = await getOboToken(request);
    if (typeof tokenResult !== 'string') return tokenResult.error;

    try {
        const body = await request.json();
        const response = await fetch(backendUrl(), {
            method: 'POST',
            headers: { Authorization: `Bearer ${tokenResult}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            return NextResponse.json(errorBody, { status: response.status });
        }
        return NextResponse.json(await response.json(), { status: 201 });
    } catch (error) {
        console.error('Failed to create faggruppe:', error);
        return NextResponse.json({ error: 'Failed to create faggruppe' }, { status: 500 });
    }
}
