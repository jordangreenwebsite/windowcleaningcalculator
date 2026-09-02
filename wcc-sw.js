const CACHE = 'wcc-pwa-v1.4.1';
const PRECACHE = [
  '/',
  '/wcc-manifest.webmanifest',
  '/wcc-icon-192.png',
  '/wcc-icon-512.png',
  '/wcc-apple-touch-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== CACHE && key.startsWith('wcc-pwa-'))
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(req, copy));
          return response;
        })
        .catch(async () => (await caches.match(req)) || (await caches.match('/')))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(cached => {
      const network = fetch(req)
        .then(response => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE).then(cache => cache.put(req, copy));
          }
          return response;
        })
        .catch(() => cached);

      return cached || network;
    })
  );
});
