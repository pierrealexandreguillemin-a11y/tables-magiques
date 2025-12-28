/**
 * Service Worker - Tables Magiques
 * ISO/IEC 25010 - PWA avec support offline
 */

const CACHE_VERSION = 'v3';
const CACHE_NAME = `tables-magiques-${CACHE_VERSION}`;

// Assets statiques a mettre en cache
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  // Icons
  '/icons/icon-72.png',
  '/icons/icon-96.png',
  '/icons/icon-128.png',
  '/icons/icon-144.png',
  '/icons/icon-152.png',
  '/icons/icon-192.png',
  '/icons/icon-384.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
  '/icons/favicon-16.png',
  '/icons/favicon-32.png',
  // Sounds (Kenney Interface Sounds - CC0)
  '/sounds/magic-ding.ogg',
  '/sounds/soft-oops.ogg',
  '/sounds/level-up.ogg',
  '/sounds/click.ogg',
  '/sounds/badge-unlock.ogg',
];

// Installation - Cache des assets statiques
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // Activer immediatement le nouveau SW
  self.skipWaiting();
});

// Activation - Nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter(
            (name) => name.startsWith('tables-magiques-') && name !== CACHE_NAME
          )
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  // Prendre le controle de toutes les pages
  self.clients.claim();
});

// Fetch - Strategies de cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requetes non-GET
  if (request.method !== 'GET') return;

  // Ignorer les requetes vers d'autres domaines
  if (url.origin !== location.origin) return;

  // Ignorer les requetes API
  if (url.pathname.startsWith('/api/')) return;

  // Navigation - Network First avec fallback offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Mettre en cache la reponse reussie
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Essayer le cache, sinon page offline
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            return caches.match('/offline');
          });
        })
    );
    return;
  }

  // Assets statiques - Cache First
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request).then((response) => {
        // Ne pas cacher les reponses non-ok
        if (!response || response.status !== 200) {
          return response;
        }
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone);
        });
        return response;
      });
    })
  );
});

// Message handler pour skip waiting et notifications
self.addEventListener('message', (event) => {
  if (!event.data) return;

  switch (event.data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'SCHEDULE_REMINDER':
      // Store reminder settings for later use
      // Note: Real scheduling would require a push server
      // This is a simplified local reminder approach
      console.log('[SW] Reminder scheduled:', event.data.payload);
      break;

    case 'CANCEL_REMINDERS':
      console.log('[SW] Reminders cancelled');
      break;
  }
});

// Push notification handler
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Tables Magiques';
  const options = {
    body: data.body || "C'est l'heure de s'entrainer !",
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    vibrate: [100, 50, 100],
    tag: data.tag || 'tables-magiques-reminder',
    data: {
      url: data.url || '/',
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Focus existing window if available
        for (const client of windowClients) {
          if (client.url.includes(location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});
