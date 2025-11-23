import { NextResponse } from 'next/server';
import { saveUrl } from '@/lib/storage';

export async function POST(request) {
    try {
        const { url, retention, alias } = await request.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        let shortCode;
        try {
            shortCode = await saveUrl(url, retention, alias);
        } catch (error) {
            if (error.message === 'Alias already exists') {
                return NextResponse.json({ error: '이미 사용 중인 단축 주소입니다.' }, { status: 409 });
            }
            throw error;
        }

        // Dynamic domain detection for Vercel and Localhost
        const host = request.headers.get('host');
        const protocol = host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https';
        const displayUrl = `${protocol}://${host}/${shortCode}`;

        const redirectUrl = `/${shortCode}`; // Relative path for local testing

        return NextResponse.json({
            shortCode,
            displayUrl,
            redirectUrl
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
