const CACHE_NAME = 'clientflow-v2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './script.js',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@0.454.1/dist/lucide.min.js', 
  'https://cdn.jsdelivr.net/npm/dayjs@1/dayjs.min.js'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // [Ajuste]: Força a atualização imediata
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // [Ajuste]: Tenta cachear, mas ignora se falhar em algum recurso externo
      return Promise.allSettled(
        ASSETS_TO_CACHE.map(url => cache.add(url))
      );
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(keyList.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }));
    })
  );
  self.clients.claim();
});

// [Ajuste]: Estratégia Network-First (Tenta internet, se falhar usa cache)
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
  );
});