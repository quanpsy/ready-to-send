/* ============================================
   Service Worker - Division Zero SPA v2.3
   ============================================
   
   OPTIMIZED SPA CACHING:
   - NO precaching
   - SPA navigation: cache AND serve under '/'
   - Files cached as loaded
   - API cached for 15 minutes
   
   ============================================ */

const CACHE_VERSION = '2.4';
const CACHE_NAME = `divisionzero-${CACHE_VERSION}`;
const API_CACHE = 'divisionzero-api';
const API_CACHE_DURATION = 15 * 60 * 1000;


// === INSTALL ===
self.addEventListener('install', (event) => {
    console.log('[SW] Installing v' + CACHE_VERSION);
    self.skipWaiting();
});


// === ACTIVATE ===
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating v' + CACHE_VERSION);
    event.waitUntil(
        caches.keys().then((names) => {
            return Promise.all(
                names.map((name) => {
                    if (name.startsWith('divisionzero-') &&
                        name !== CACHE_NAME &&
                        name !== API_CACHE) {
                        console.log('[SW] Clearing old cache:', name);
                        return caches.delete(name);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});


// === FETCH ===
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Skip non-GET
    if (event.request.method !== 'GET') return;

    // === CLOUDFLARE API ===
    if (url.hostname.includes('workers.dev')) {
        event.respondWith(handleApiRequest(event.request));
        return;
    }

    // === EXTERNAL ===
    if (!url.origin.includes(self.location.origin)) {
        return;
    }

    // === SPA NAVIGATION ===
    if (event.request.mode === 'navigate') {
        event.respondWith(handleNavigation(event.request));
        return;
    }

    // === PROJECTS.JSON (20-min cache) ===
    if (url.pathname.includes('projects.json')) {
        event.respondWith(handleProjectsData(event.request));
        return;
    }

    // === STATIC ASSETS ===
    event.respondWith(handleStatic(event.request));
});


// Handle SPA navigation - always serve index.html from cache or network
async function handleNavigation(request) {
    const cache = await caches.open(CACHE_NAME);

    // Try to get cached SPA shell (stored under '/')
    let cached = await cache.match('/');

    if (cached) {
        console.log('[SW] SPA from cache');
        return cached;
    }

    // Not cached - fetch the actual root
    try {
        const response = await fetch('/');
        if (response.ok) {
            // Cache under '/' for future navigations
            cache.put('/', response.clone());
            console.log('[SW] SPA cached');
        }
        return response;
    } catch (err) {
        console.error('[SW] Navigation fetch failed:', err);
        // Return whatever we can
        return new Response('<h1>Offline</h1>', {
            status: 503,
            headers: { 'Content-Type': 'text/html' }
        });
    }
}


// Handle static assets with cache-first strategy
async function handleStatic(request) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);

    if (cached) {
        return cached;
    }

    try {
        const response = await fetch(request);
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    } catch (err) {
        return new Response('Not found', { status: 404 });
    }
}


// Handle projects.json with 20-min cache (syncs every 60 min)
const PROJECTS_CACHE_DURATION = 20 * 60 * 1000; // 20 minutes

async function handleProjectsData(request) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);

    if (cached) {
        const cachedAt = cached.headers.get('sw-cached-at');
        if (cachedAt && (Date.now() - parseInt(cachedAt)) < PROJECTS_CACHE_DURATION) {
            console.log('[SW] projects.json from cache (20-min)');
            return cached;
        }
        console.log('[SW] projects.json cache expired, refreshing...');
    }

    try {
        const response = await fetch(request);
        if (response.ok) {
            const headers = new Headers(response.headers);
            headers.set('sw-cached-at', Date.now().toString());
            const toCache = new Response(response.clone().body, {
                status: response.status,
                statusText: response.statusText,
                headers
            });
            cache.put(request, toCache);
            console.log('[SW] projects.json cached for 20-min');
        }
        return response;
    } catch (err) {
        // Return stale cache if network fails
        return cached || new Response('[]', { status: 503 });
    }
}


// Handle API requests with 15-min cache
async function handleApiRequest(request) {
    const cache = await caches.open(API_CACHE);
    const cached = await cache.match(request);

    if (cached) {
        const cachedAt = cached.headers.get('sw-cached-at');
        if (cachedAt && (Date.now() - parseInt(cachedAt)) < API_CACHE_DURATION) {
            console.log('[SW] API from cache');
            return cached;
        }
    }

    try {
        const response = await fetch(request);
        if (response.ok) {
            const headers = new Headers(response.headers);
            headers.set('sw-cached-at', Date.now().toString());
            const toCache = new Response(response.clone().body, {
                status: response.status,
                statusText: response.statusText,
                headers
            });
            cache.put(request, toCache);
        }
        return response;
    } catch (err) {
        return cached || new Response('{}', { status: 503 });
    }
}


// === MESSAGE ===
self.addEventListener('message', (event) => {
    if (event.data === 'skipWaiting') self.skipWaiting();
});
