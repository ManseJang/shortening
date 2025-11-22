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
            shortCode = saveUrl(url, retention, alias);
        } catch (error) {
            if (error.message === 'Alias already exists') {
                return NextResponse.json({ error: '이미 사용 중인 단축 주소입니다.' }, { status: 409 });
            }
            throw error;
        }

        // In a real scenario with a custom domain, this would be constructed differently.
        // For this demo, we return the code and a display URL.
        // Using encodeURI to handle Korean characters in the display URL if needed, 
        // but browsers usually handle unencoded display fine. 
        // However, for the link to work in the browser tool, we might need to be careful.
        // For display purposes:
        const displayUrl = `http://약수.울산/${shortCode}`;
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
