// Sisgate Hub — Service Worker
// Cache-first for static assets, network-first for API/data

const CACHE_NAME = 'sisgate-hub-v2';
const STATIC_ASSETS = [
    '/',
    '/dashboard',
    '/favicon.png',
    '/favicon.ico',
];

// Install: pre-cache critical assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
    );
    self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

// Fetch strategy
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // API / Supabase calls → network-first
    if (url.hostname.includes('supabase') || url.pathname.startsWith('/rest/') || url.pathname.startsWith('/auth/')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Cache successful API responses briefly
                    if (request.url.startsWith('http')) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                    }
                    return response;
                })
                .catch(() => caches.match(request))
        );
        return;
    }

    // Static assets → cache-first
    event.respondWith(
        caches.match(request).then((cached) => {
            if (cached) return cached;
            return fetch(request).then((response) => {
                // Cache static assets for future use
                if (response.ok && request.url.startsWith('http') && (url.pathname.match(/\.(js|css|png|jpg|svg|woff2?)$/) || url.pathname === '/')) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                }
                return response;
            });
        }).catch(() => {
            // Offline fallback — serve the cached root shell
            if (request.mode === 'navigate') {
                return caches.match('/');
            }
        })
    );
});

// Background sync stub — ready for future expansion
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-pending') {
        event.waitUntil(
            // Future: process queued offline mutations here
            Promise.resolve()
        );
    }
});
