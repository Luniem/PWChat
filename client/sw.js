/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

// TODO: remove later
/**@type {ServiceWorkerGlobalScope} sw */
const sw = self;

const INDEXED_DB_NAME = 'CHAT_DB';
const INDEXED_DB_VERSION = 1;

const CHAT_CACHE_NAME = 'chat-cache';
const CHAT_CACHE_VERSION = 'v1';
const CHAT_CACHE_KEY = `${CHAT_CACHE_NAME}-${CHAT_CACHE_VERSION}`;

const CACHED_ASSETS = [
    '/index.html',
    '/',
    '/main.js',
    '/styles.css',
    '/scrollbar.css',
    '/favicon.ico',
    '/manifest.json',
    '/icons/android-chrome-192x192.png',
    '/icons/android-chrome-512x512.png',
    '/screenshots/example-wide.jpg',
    '/screenshots/example-narrow.png',
    '/icons/trash-can-128x128.png',
    '/images/chat-background.jpg',
    '/dedicated-worker.js',
    '/shared-worker.js',
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
            caches.open(CHAT_CACHE_KEY).then(async (cache) => {
                const test  = await cache.match(path)
                return test
            })
            
        );
    }

    // images - try cache or cache them
    if (path.includes('images')) {
        event.respondWith(cacheFirstOrStore(event.request));
    }

    if (path.includes('users') || path.includes('conversations')) {
        event.respondWith(networkFirstOrIndexedDB(event.request));
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
            // delete old app-shell-caches, explicitely not other caches
            if (key.startsWith(CHAT_CACHE_NAME) && key !== CHAT_CACHE_KEY) {
                return caches.delete(key);
            }
        })
    );
}

/**
 *  Get the desired request from cache first. If the request is not in the the cache, fetch it and store it in the cache.
 * @param {*} request the initial network-request
 * @returns a Promise that resolves with the response from the cache first or else the network
 */
async function cacheFirstOrStore(request) {
    const cache = await caches.open(CHAT_CACHE_KEY);
    const cachedResponse = await cache.match(request);

    if (cachedResponse !== undefined) {
        // cache hit
        return cachedResponse;
    }

    // cache miss -> fetch and cache
    const response = await fetch(request);
    cache.put(request, response.clone());
    return response;
}

function networkFirstOrIndexedDB(request) {
    return fetch(request)
        .then((response) => {
            // clone to be able to return it later
            const clonedResponse = response.clone();

            // read out resource
            return response.json().then((resource) => {
                // save in indexeddb
                // note on this one since it seems a little unorthodox
                // i just save the response of each fetch in this indexedDB no matter if users, convos or messages in convos are accessed
                // we never really want to filter single users, convos or messages out of this indexedDB

                //alternatively we could also create a better structured table (objectstore) for each of the entities but that would require more code
                saveToIndexedDB(request.url, resource);
                
                // return original response
                return clonedResponse;
            });
        })
        .catch(() => {
            return getFromIndexedDB(request.url);
        });
}


function saveToIndexedDB(url, data) {
    const dbRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    
    dbRequest.onupgradeneeded = function(event) {
        const db = event.target.result;
        db.createObjectStore('resources', { keyPath: 'url' });
    }

    dbRequest.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction('resources', 'readwrite');
        const store = transaction.objectStore('resources');
        store.put({ url: url, data: data });
    };

    dbRequest.onerror = function(event) {
        console.error('IndexedDB error:', event.target.error);
    };
}

function getFromIndexedDB(url) {
    return new Promise((resolve, reject) => {
        const dbRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        
        dbRequest.onsuccess = function(event) {
            const db = event.target.result;
            const transaction = db.transaction('resources', 'readonly');
            const store = transaction.objectStore('resources');
            const request = store.get(url);
            request.onsuccess = function() {
                resolve(new Response(JSON.stringify(request.result.data)));
            };
        };
    
        dbRequest.onerror = function(event) {
            reject('IndexedDB error:', event.target.error)
        };
    });
}
