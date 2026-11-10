// ur.financialguy service worker: halaman diambil dari jaringan dulu supaya update langsung terasa, cadangan dari cache saat offline.
const CACHE = 'urfg-v2';
const CORE = ['./', './app/', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png', './icons/favicon.svg'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const url = new URL(r.url), same = url.origin === location.origin;
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).then((res) => { const cp = res.clone(); caches.open(CACHE).then((c) => c.put(r, cp)); return res; }).catch(() => caches.match(r, { ignoreSearch: true }).then((m) => m || caches.match('./app/'))));
    return;
  }
  if (same || /fonts\.(googleapis|gstatic)\.com/.test(r.url)) {
    e.respondWith(caches.match(r).then((m) => { const net = fetch(r).then((res) => { if (res.ok || res.type === 'opaque') { const cp = res.clone(); caches.open(CACHE).then((c) => c.put(r, cp)); } return res; }).catch(() => m); return m || net; }));
  }
});
