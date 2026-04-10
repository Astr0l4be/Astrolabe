const CACHE = 'astrolabe-v15';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/style.css',
  '/supabase.js',
  '/app.js',
  '/lecture.js',
  '/auth.js',
  '/commentaires.js',
  '/notifications.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Pour les fichiers JS/CSS/HTML : network-first (toujours la version fraîche)
  // Pour les images : cache-first (perf)
  const url = new URL(e.request.url);
  const isAsset = /\.(js|css|html)$/.test(url.pathname) || url.pathname === '/';
  const isImage = /\.(png|jpg|jpeg|webp|gif|svg|ico)$/.test(url.pathname);

  if (isImage) {
    // Cache-first pour les images
    e.respondWith(
      caches.match(e.request).then(r => r || fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      }))
    );
    return;
  }

  if (isAsset) {
    // Network-first pour JS/CSS/HTML : on prend la version fraîche, sinon le cache
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Tout le reste : cache-first
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
