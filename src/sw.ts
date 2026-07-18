/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope

import { precacheAndRoute } from 'workbox-precaching'

// Precaches the hashed build output (JS/CSS/HTML) — vite-plugin-pwa injects
// the manifest array at build time. Cache busting is automatic (per-file
// revision hash), no manual CACHE_NAME bump needed like the old sw.js.
precacheAndRoute(self.__WB_MANIFEST)

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

// ── Push notifications ──────────────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return
  let data: { title?: string; body?: string; icon?: string; badge?: string; tag?: string; renotify?: boolean; url?: string }
  try {
    data = event.data.json()
  } catch {
    data = { title: 'Fuelplan', body: event.data.text() }
  }

  const options = {
    body: data.body || '',
    icon: data.icon || '/icons/icon-192.png',
    badge: data.badge || '/icons/icon-192.png',
    tag: data.tag || 'fuelplan',
    renotify: !!data.renotify,
    data: { url: data.url || '/' },
  } as NotificationOptions

  event.waitUntil(self.registration.showNotification(data.title || 'Fuelplan', options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification.data && event.notification.data.url) || '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus()
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url)
    })
  )
})

// ── Fetch: network-first for API calls and app navigation, ──────────
// cache fallback offline. Precached shell assets are already handled by
// precacheAndRoute above; this covers everything else (API, fonts, nav).
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Always network for API calls — never serve stale plan/account data
  if (
    url.hostname.includes('railway.app') ||
    url.hostname.includes('anthropic.com') ||
    url.pathname.startsWith('/api/')
  ) {
    event.respondWith(
      fetch(event.request).catch(
        () =>
          new Response(JSON.stringify({ error: 'You are offline.' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          })
      )
    )
    return
  }

  // Google Fonts — network first, cache fallback
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone()
          caches.open('fuelplan-fonts').then((cache) => cache.put(event.request, clone))
          return response
        })
        .catch(() => caches.match(event.request).then((res) => res || Response.error()))
    )
    return
  }

  // Exercise library images/data — cache-first, so once a user has viewed
  // an exercise it stays available offline without precaching the whole
  // ~27MB library upfront.
  if (url.pathname.startsWith('/exercises/')) {
    event.respondWith(
      caches.match(event.request).then(
        (cached) =>
          cached ||
          fetch(event.request).then((response) => {
            if (response.ok) {
              const clone = response.clone()
              caches.open('fuelplan-exercises').then((cache) => cache.put(event.request, clone))
            }
            return response
          })
      )
    )
    return
  }

  // Navigation requests offline — fall back to the cached app shell
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html').then((res) => res || Response.error()))
    )
  }
})
