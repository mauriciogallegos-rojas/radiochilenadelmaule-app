/* Service Worker — Radio Chilena del Maule
   Guarda en caché la interfaz (no el streaming) para que la app
   abra al instante y funcione aunque la señal de datos sea débil. */

const CACHE = 'rcm-v1';
const ASSETS = [
  './',
  './index.html',
  './logo_header.png',
  './icon-192.png',
  './icon-512.png',
  './manifest.webmanifest'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) =>
      // addAll falla completo si falta un archivo; se cachea uno por uno
      Promise.allSettled(ASSETS.map((a) => c.add(a)))
    )
  );
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

  // El streaming de audio NUNCA se cachea: siempre directo a internet
  if (url.hostname.includes('digitalproserver.com')) return;

  // Interfaz: caché primero, red como respaldo (y actualiza el caché)
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const fetched = fetch(e.request)
        .then((res) => {
          if (res.ok && url.origin === location.origin) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || fetched;
    })
  );
});
