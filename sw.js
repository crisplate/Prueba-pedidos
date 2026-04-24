const CACHE_NAME = 'dalepue-v2'; // Le subimos la versión
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); // Obliga a actualizar al instante
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName); // Borra la versión vieja
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Ahora siempre busca primero en internet. Si no hay señal, recién ahí usa la memoria.
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
