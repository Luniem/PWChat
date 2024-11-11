/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

// TODO: remove later
/**@type {ServiceWorkerGlobalScope} sw */
const sw = self;

const CHAT_CACHE_NAME = 'chat-cache';
const CHAT_CACHE_VERSION = 'v1';
const CHAT_CACHE_KEY = `${CHAT_CACHE_NAME}-${CHAT_CACHE_VERSION}`;

const CACHED_ASSETS = [
    '/index.html',
    '/',
    '/main.js',
    '/styles.css',
    '/favicon.ico',
    '/manifest.json',
    '/icons/android-chrome-192x192.png',
    '/icons/android-chrome-512x512.png',
    '/screenshots/example-wide.jpg',
    '/screenshots/example-narrow.png',
];

sw.addEventListener('install', (installEvent) => {
    // install new sw-version - add chached data
    installEvent.waitUntil(
        caches.open(CHAT_CACHE_KEY).then((cache) => {
            cache.addAll(CACHED_ASSETS);
        })
    );
});

sw.addEventListener('activate', (activateEvent) => {
    // activate new sw-version - remove old caches
    activateEvent.waitUntil(clearOldCaches());
});

self.addEventListener('fetch', (event) => {
    // choosen strategy
    // for chats and messages ==> network first
    // always the newest chats etc, but also old convos available when offline
    // for profile-pictures ==> stale while revalidate
    // fast loading-times, but cache gets updated

    const path = new URL(event.request.url).pathname;
    if (CACHED_ASSETS.includes(path)) {
        event.respondWith(
            caches.open(CHAT_CACHE_KEY).then(async (cache) => cache.match(event.request))
        );
    }

    // images - try cache or cache them
    if (path.includes('images')) {
        event.respondWith(cacheFirstOrStore(event.request));
    }
});

/**
 * Clears all caches that are not the current cache-version.
 * @returns a Promise that resolves when all the caches cleared or when the deletion of a single cache failed
 */
async function clearOldCaches() {
    // get all cache-keys
    const keys = await caches.keys();

    return Promise.all(
        // create a promise for deletion of every key
        keys.map((key) => {
            if (key.startsWith(CHAT_CACHE_NAME) && key !== CHAT_CACHE_KEY) {
                return caches.delete(key);
            }
        })
    );
}

async function cacheFirstOrStore(request) {
    const cache = await caches.open('pwa2-v1');
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
        // cache hit
        return cachedResponse;
    }

    // cache miss -> fetch and cache
    const response = await fetch(request);
    cache.put(request, response.clone());
    return response;
}
