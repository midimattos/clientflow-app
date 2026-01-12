const CACHE_NAME = 'clientflow-v2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './script.js',
  './manifest.json',
  // Se você tiver um style.css separado, adicione aqui:
  // './style.css',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@0.454.1/dist/lucide.min.js', // Versão fixa é mais segura para cache
  'https://cdn.jsdelivr.net/npm/dayjs@1/dayjs.min.js'
];

self.addEventListener('install', event => {
  // skipWaiting força o novo SW a assumir o controle imediatamente
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
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
  // Garante que o SW controle a página imediatamente sem precisar recarregar
  self.clients.claim();
});

// Estratégia: NETWORK FIRST com fallback para CACHE
// Assim, se o cliente tiver internet, ele vê as atualizações do Vercel.
// Se estiver no modo avião, ele usa o cache instantaneamente.
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});