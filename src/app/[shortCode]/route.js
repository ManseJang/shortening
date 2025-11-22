import { redirect } from 'next/navigation';
import { getUrl } from '@/lib/storage';

export async function GET(request, { params }) {
    const { shortCode } = await params; // params is a promise in newer Next.js versions
    const decodedShortCode = decodeURIComponent(shortCode);
    const originalUrl = getUrl(decodedShortCode);

    if (originalUrl) {
        redirect(originalUrl);
    } else {
        return new Response('URL not found or expired', { status: 404 });
    }
}
