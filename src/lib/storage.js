import { kv } from '@vercel/kv';

// Check if Vercel KV is configured
const IS_KV_CONFIGURED = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

// In-memory fallback for local development without KV keys
const globalForUrlDatabase = global;
if (!globalForUrlDatabase.urlDatabase) {
    globalForUrlDatabase.urlDatabase = new Map();
}
const urlDatabase = globalForUrlDatabase.urlDatabase;

export async function saveUrl(originalUrl, retentionPeriod, customAlias = null) {
    let shortCode;
    let expiresSeconds;

    // Calculate expiration in seconds
    if (retentionPeriod === '1week') {
        expiresSeconds = 7 * 24 * 60 * 60;
    } else if (retentionPeriod === '1month') {
        expiresSeconds = 30 * 24 * 60 * 60;
    } else if (retentionPeriod === '1year') {
        expiresSeconds = 365 * 24 * 60 * 60;
    } else {
        expiresSeconds = 7 * 24 * 60 * 60; // Default 1 week
    }

    if (IS_KV_CONFIGURED) {
        // --- Vercel KV Logic ---
        if (customAlias) {
            const exists = await kv.exists(customAlias);
            if (exists) {
                throw new Error('Alias already exists');
            }
            shortCode = customAlias;
        } else {
            // Generate unique code
            let attempts = 0;
            do {
                shortCode = Math.random().toString(36).substring(2, 8);
                const exists = await kv.exists(shortCode);
                if (!exists) break;
                attempts++;
                if (attempts > 10) throw new Error('Failed to generate unique code');
            } while (true);
        }

        // Save to Redis with expiration
        await kv.set(shortCode, originalUrl, { ex: expiresSeconds });

    } else {
        // --- In-Memory Fallback Logic ---
        console.warn('Vercel KV not configured. Using in-memory storage (data will be lost on restart).');

        if (customAlias) {
            if (urlDatabase.has(customAlias)) {
                throw new Error('Alias already exists');
            }
            shortCode = customAlias;
        } else {
            do {
                shortCode = Math.random().toString(36).substring(2, 8);
            } while (urlDatabase.has(shortCode));
        }

        const createdAt = Date.now();
        const expiresAt = createdAt + (expiresSeconds * 1000);

        urlDatabase.set(shortCode, {
            originalUrl,
            createdAt,
            expiresAt
        });
    }

    return shortCode;
}

export async function getUrl(shortCode) {
    if (IS_KV_CONFIGURED) {
        // --- Vercel KV Logic ---
        const url = await kv.get(shortCode);
        return url;
    } else {
        // --- In-Memory Fallback Logic ---
        const data = urlDatabase.get(shortCode);

        if (!data) {
            return null;
        }

        if (data.expiresAt && Date.now() > data.expiresAt) {
            urlDatabase.delete(shortCode);
            return null;
        }

        return data.originalUrl;
    }
}
