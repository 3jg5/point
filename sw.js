// خدمة بسيطة: تخزّن ملفات الموقع والمكتبات ليفتح أسرع ويعمل كتطبيق. بيانات Firebase لا تُخزَّن هنا.
const CACHE = 'wanar-v1';
const CDN = ['www.gstatic.com', 'cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com'];
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) =>
  e.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  )
);
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const same = url.origin === location.origin;
  if (!same && !CDN.includes(url.hostname)) return; // Firebase API: مباشرة من الشبكة
  if (url.pathname.endsWith('/config.js')) return; // دائماً أحدث نسخة
  e.respondWith(
    caches.open(CACHE).then(async (c) => {
      const hit = await c.match(req);
      const net = fetch(req)
        .then((r) => {
          if (r.ok) c.put(req, r.clone());
          return r;
        })
        .catch(() => hit);
      return hit || net;
    })
  );
});
