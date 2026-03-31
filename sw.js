/* ═══════════════════════════════════════════════
   FUELPLAN Service Worker — Offline Support
   Strategy: Cache-first for app shell,
   Network-first for API calls
═══════════════════════════════════════════════ */

const CACHE_NAME = 'fuelplan-v1';

// App shell — everything needed to run the app offline
const SHELL_URLS = [
  '/',
  '/index.html',
  'https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Figtree:wght@300;400;500;600&display=swap',
];

// ── Install: cache the app shell ─────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(SHELL_URLS);
    }).then(() => self.skipWaiting())
  );
});

// ── Activate: clean up old caches ────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: serve from cache, fall back to network ─
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Always go to network for API calls (plan generation, history etc.)
  // These can't work offline by nature
  if (url.pathname.startsWith('/api/') ||
      url.hostname.includes('railway.app') ||
      url.hostname.includes('anthropic.com')) {
    event.respondWith(
      fetch(event.request).catch(() =>
        new Response(JSON.stringify({ error: 'You are offline. Connect to the internet to generate plans or sync history.' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        })
      )
    );
    return;
  }

  // For Google Fonts — network first, cache fallback
  if (url.hostname.includes('fonts.googleapis.com') ||
      url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // App shell — cache first, network fallback
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        // Cache successful responses
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // If offline and not cached, return the main app (handles SPA routing)
        return caches.match('/index.html');
      });
    })
  );
});
