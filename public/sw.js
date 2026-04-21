// Service Worker for Kavana AI - Push Notifications & Caching

const CACHE_NAME = 'kavana-v1';
const urlsToCache = [
    '/',
    '/manifest.json'
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(urlsToCache))
    );
    self.skipWaiting();
});

// Activate event - cleanup old caches
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
    self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .catch(() => caches.match(event.request))
    );
});

// Push notification event
self.addEventListener('push', (event) => {
    const data = event.data?.json() || {};

    const options = {
        body: data.body || 'הגיע הזמן לכוונה היומית שלך',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        vibrate: [100, 50, 100],
        data: {
            url: data.url || '/'
        },
        actions: [
            { action: 'open', title: 'פתח' },
            { action: 'close', title: 'סגור' }
        ],
        dir: 'rtl',
        lang: 'he'
    };

    event.waitUntil(
        self.registration.showNotification(data.title || '🕎 כוונה', options)
    );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'close') return;

    event.waitUntil(
        clients.openWindow(event.notification.data.url || '/')
    );
});
