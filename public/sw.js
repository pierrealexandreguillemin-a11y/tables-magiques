/**
 * Service Worker - Tables Magiques
 * ISO/IEC 25010 - PWA avec support offline
 *
 * VERSION 5 - Force refresh des icones PWA
 */

const CACHE_VERSION = 'v5';
const CACHE_NAME = `tables-magiques-${CACHE_VERSION}`;
const ICON_CACHE_NAME = `tables-magiques-icons-${CACHE_VERSION}`;

// Assets statiques a mettre en cache (SANS les icones - gerees separement)
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  // Sounds (Kenney Interface Sounds - CC0)
  '/sounds/magic-ding.ogg',
  '/sounds/soft-oops.ogg',
  '/sounds/level-up.ogg',
  '/sounds/click.ogg',
  '/sounds/badge-unlock.ogg',
];

// Icones PWA - cache separe avec Network First
const ICON_ASSETS = [
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
  '/icons/icon-source.png',
  '/favicon.ico',
];

// Installation - Cache des assets statiques + icones fraiches
self.addEventListener('install', (event) => {
  console.log('[SW v5] Installing...');
  event.waitUntil(
    Promise.all([
      // Cache assets statiques
      caches.open(CACHE_NAME).then((cache) => {
        console.log('[SW v5] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      // Cache icones avec fetch force (bypass cache navigateur)
      caches.open(ICON_CACHE_NAME).then(async (cache) => {
        console.log('[SW v5] Fetching fresh icons from network...');
        const iconPromises = ICON_ASSETS.map(async (iconUrl) => {
          try {
            // Force fetch depuis le reseau (bypass cache)
            const response = await fetch(iconUrl, {
              cache: 'reload',
              headers: { 'Cache-Control': 'no-cache' },
            });
            if (response.ok) {
              await cache.put(iconUrl, response);
              console.log(`[SW v5] Cached fresh: ${iconUrl}`);
            }
          } catch (error) {
            console.warn(`[SW v5] Failed to fetch ${iconUrl}:`, error);
          }
        });
        return Promise.all(iconPromises);
      }),
    ])
  );
  // Activer immediatement le nouveau SW
  self.skipWaiting();
});

// Activation - SUPPRESSION TOTALE de tous les anciens caches
self.addEventListener('activate', (event) => {
  console.log('[SW v5] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            // Supprimer TOUS les caches sauf les versions actuelles
            return name !== CACHE_NAME && name !== ICON_CACHE_NAME;
          })
          .map((name) => {
            console.log('[SW v5] Deleting cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  // Prendre le controle de toutes les pages immediatement
  self.clients.claim();
  // Notifier les clients que le SW est pret
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({ type: 'SW_ACTIVATED', version: CACHE_VERSION });
    });
  });
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

  // ICONES - Network First (toujours essayer de recuperer la version fraiche)
  if (url.pathname.startsWith('/icons/') || url.pathname === '/favicon.ico') {
    event.respondWith(
      fetch(request, { cache: 'reload' })
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(ICON_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // MANIFEST - Network First (important pour les mises a jour PWA)
  if (url.pathname === '/manifest.json') {
    event.respondWith(
      fetch(request, { cache: 'reload' })
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // Navigation - Network First avec fallback offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
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

  // Autres assets statiques - Cache First
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request).then((response) => {
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

// Message handler
self.addEventListener('message', (event) => {
  if (!event.data) return;

  switch (event.data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'FORCE_REFRESH_ICONS':
      // Force le rechargement des icones
      caches.open(ICON_CACHE_NAME).then(async (cache) => {
        console.log('[SW v5] Force refreshing icons...');
        for (const iconUrl of ICON_ASSETS) {
          try {
            const response = await fetch(iconUrl, {
              cache: 'reload',
              headers: { 'Cache-Control': 'no-cache' },
            });
            if (response.ok) {
              await cache.put(iconUrl, response);
            }
          } catch (error) {
            console.warn(`[SW v5] Failed to refresh ${iconUrl}`);
          }
        }
        event.source?.postMessage({ type: 'ICONS_REFRESHED' });
      });
      break;

    case 'CLEAR_ALL_CACHES':
      // Supprime tous les caches (pour debug/force refresh)
      caches.keys().then((names) => {
        Promise.all(names.map((name) => caches.delete(name))).then(() => {
          console.log('[SW v5] All caches cleared');
          event.source?.postMessage({ type: 'CACHES_CLEARED' });
        });
      });
      break;

    case 'SCHEDULE_REMINDER':
      console.log('[SW v5] Reminder scheduled:', event.data.payload);
      break;

    case 'CANCEL_REMINDERS':
      console.log('[SW v5] Reminders cancelled');
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
        for (const client of windowClients) {
          if (client.url.includes(location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});
