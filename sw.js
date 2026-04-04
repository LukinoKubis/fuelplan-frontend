/* ═══════════════════════════════════════════════
   FUELPLAN Service Worker — Offline Support
   Strategy: Network-first for app shell (always fresh),
   Cache fallback for offline use
═══════════════════════════════════════════════ */

const CACHE_NAME = 'fuelplan-v58'; // bump this whenever you deploy

// App shell files to cache
const SHELL_URLS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
];

// ── Install: cache the app shell ─────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(SHELL_URLS);
    }).then(() => self.skipWaiting())
  );
});

// ── Activate: wipe ALL old caches ────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => {
              console.log('[SW] Deleting old cache:', key);
              return caches.delete(key);
            })
      )
    ).then(() => self.clients.claim())
  );
});

// ── Push notifications ────────────────────────────────────────────────────────
self.addEventListener('push', event => {
  if (!event.data) return;
  let data;
  try { data = event.data.json(); } catch { data = { title: 'Fuelplan', body: event.data.text() }; }

  const options = {
    body: data.body || '',
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/icon-192.png',
    tag: data.tag || 'fuelplan',
    renotify: !!data.renotify,
    data: { url: data.url || '/' }
  };

  event.waitUntil(self.registration.showNotification(data.title || 'Fuelplan', options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

// ── Fetch: network-first for app shell, cache fallback ──
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Always network for API calls
  if (url.hostname.includes('railway.app') ||
      url.hostname.includes('anthropic.com') ||
      url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() =>
        new Response(JSON.stringify({ error: 'You are offline.' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        })
      )
    );
    return;
  }

  // Google Fonts — network first, cache fallback
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

  // App shell: NETWORK FIRST — always try to get fresh version
  // Fall back to cache only if offline
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Update cache with fresh version
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // Offline — serve from cache
        return caches.match(event.request)
          .then(cached => cached || caches.match('/index.html'));
      })
  );
});
