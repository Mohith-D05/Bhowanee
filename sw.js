/* ============================================================
   Bhowanee - Service Worker (sw.js)
   Caches all app files for offline use.
   Farmer and block-admin dashboards continue working offline.
   Works at root (/) or under a subpath (e.g. /bhowanee/ on GitHub Pages).
   ============================================================ */

var CACHE = 'bhowanee-v7';

var LOCAL_FILES = [
  'index.html',
  'farmer.html',
  'block.html',
  'admin.html',
  'buyer.html',
  'investor.html',
  'logistics.html',
  'storage.html',
  'tokens.css',
  'shared.css',
  'data.js',
  'auth.js',
  'market.js',
  'components.js',
  'geo.js',
  'logo.png',
  'logo.jpg'
];

var REMOTE_FILES = [
  'https://fonts.googleapis.com/css2?family=Mukta:wght@400;500;600&family=Zilla+Slab:wght@500;600&display=swap',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

self.addEventListener('install', function (event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      var scope = self.registration.scope;
      var local = LOCAL_FILES.map(function (f) { return scope + f; });
      var remote = REMOTE_FILES;
      return cache.addAll(local).then(function () {
        return Promise.allSettled(remote.map(function (url) {
          return fetch(url).then(function (r) { return cache.put(url, r); });
        }));
      });
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })
      );
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  var url = req.url;
  var scope = self.registration.scope;
  var isApp = url.startsWith(scope) ||
              url.includes('leaflet') ||
              url.includes('fonts.googleapis') ||
              url.includes('fonts.gstatic') ||
              url.includes('tile.openstreetmap');

  if (!isApp) return;

  if (url.includes('tile.openstreetmap')) {
    // Map tiles: network first, cache fallback
    event.respondWith(
      fetch(req).then(function (r) {
        var clone = r.clone();
        caches.open(CACHE).then(function (c) { c.put(req, clone); });
        return r;
      }).catch(function () {
        return caches.match(req);
      })
    );
    return;
  }

  // HTML navigation & app pages: Network-first, fallback to cache
  var isHtml = req.mode === 'navigate' || url.endsWith('.html') || url.endsWith('/') || !url.split('/').pop().includes('.');
  if (isHtml) {
    event.respondWith(
      fetch(req).then(function (r) {
        if (r && r.status === 200) {
          var clone = r.clone();
          caches.open(CACHE).then(function (c) { c.put(req, clone); });
        }
        return r;
      }).catch(function () {
        return caches.match(req);
      })
    );
    return;
  }

  // Assets (CSS, JS, images): cache first, update in background
  event.respondWith(
    caches.match(req).then(function (cached) {
      if (cached) return cached;
      return fetch(req).then(function (r) {
        var clone = r.clone();
        caches.open(CACHE).then(function (c) { c.put(req, clone); });
        return r;
      });
    })
  );
});
