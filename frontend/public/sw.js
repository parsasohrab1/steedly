// Service Worker for PWA
const CACHE_VERSION = 'v1';
const CACHE_NAME = `steedly-${CACHE_VERSION}`;
const urlsToCache = [
  '/',
  '/blog',
  '/shop',
  '/services',
  '/competitions',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          return response;
        }

        // Fetch from network
        return fetch(event.request).then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Cache the response
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        });
      })
      .catch(() => {
        // Return offline page if available
        if (event.request.destination === 'document') {
          return caches.match('/');
        }
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all pages immediately
  return self.clients.claim();
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  let data = {};
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = {
        title: 'اعلان جدید',
        body: event.data.text() || 'شما یک اعلان جدید دارید',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: 'notification',
        requireInteraction: false,
        data: {}
      };
    }
  }

  const options = {
    title: data.title || 'اعلان جدید',
    body: data.message || data.body || 'شما یک اعلان جدید دارید',
    icon: data.icon || '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: data.tag || data.type || 'notification',
    data: {
      url: data.link || data.url || '/',
      type: data.type || 'system',
      ...data.data
    },
    requireInteraction: data.requireInteraction || false,
    dir: 'rtl',
    lang: 'fa',
    vibrate: [200, 100, 200],
    timestamp: Date.now()
  };

  event.waitUntil(
    self.registration.showNotification(options.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, open a new window/tab
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Background sync (optional - for offline support)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-notifications') {
    event.waitUntil(
      // Sync notifications when back online
      fetch('/api/notifications')
        .then(response => response.json())
        .catch(err => console.error('Sync failed:', err))
    );
  }
});

