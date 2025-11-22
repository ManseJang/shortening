// Simple in-memory storage
// NOTE: Data will be lost on server restart, but using global to persist across dev server hot reloads
const globalForUrlDatabase = global;

if (!globalForUrlDatabase.urlDatabase) {
    globalForUrlDatabase.urlDatabase = new Map();
}

const urlDatabase = globalForUrlDatabase.urlDatabase;

export function saveUrl(originalUrl, retentionPeriod, customAlias = null) {
    let shortCode;

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

    let expiresAt = null;
    if (retentionPeriod === '1week') {
        expiresAt = createdAt + 7 * 24 * 60 * 60 * 1000;
    } else if (retentionPeriod === '1month') {
        expiresAt = createdAt + 30 * 24 * 60 * 60 * 1000;
    } else if (retentionPeriod === '1year') {
        expiresAt = createdAt + 365 * 24 * 60 * 60 * 1000;
    }

    urlDatabase.set(shortCode, {
        originalUrl,
        createdAt,
        expiresAt
    });

    return shortCode;
}

export function getUrl(shortCode) {
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
