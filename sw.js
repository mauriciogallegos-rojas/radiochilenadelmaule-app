// Service Worker — Radio Chilena del Maule
// Cachea la interfaz de la app para carga instantánea.
// El stream de audio NUNCA se cachea (siempre va directo a la red).

const CACHE = 'radio-chilena-v2';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './logo_header.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // El stream de audio va siempre directo a la red, sin cache
  if (url.hostname.includes('digitalproserver.com')) return;

  // Interfaz: cache primero, red como respaldo
  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request))
  );
});
