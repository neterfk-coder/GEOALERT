/* ============================================================
   GEOALERT — sw.js
   Service Worker: cache offline y actualizaciones en background
   ============================================================ */

const CACHE_NAME    = 'geoalert-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/main.css',
  '/css/map.css',
  '/css/sidebar.css',
  '/css/alerts.css',
  '/css/filters.css',
  '/css/responsive.css',
  '/js/core/config.js',
  '/js/core/state.js',
  '/js/core/app.js',
  '/js/core/router.js',
  '/js/map/mapInit.js',
  '/js/map/markers.js',
  '/js/map/layers.js',
  '/js/map/clusters.js',
  '/js/map/heatmap.js',
  '/js/api/cache.js',
  '/js/api/usgs.js',
  '/js/api/gdacs.js',
  '/js/api/noaa.js',
  '/js/api/scheduler.js',
  '/js/ui/sidebar.js',
  '/js/ui/modal.js',
  '/js/ui/filters.js',
  '/js/ui/alerts.js',
  '/js/ui/stats.js',
  '/js/ui/search.js',
  '/js/ui/theme.js',
  '/js/utils/dateUtils.js',
  '/js/utils/geoUtils.js',
  '/js/utils/colorScale.js',
  '/js/utils/notifications.js',
  '/js/utils/exportUtils.js',
];

// Instalar: guardar assets estáticos en cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activar: limpiar caches viejos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: estrategia Network First para datos API, Cache First para estáticos
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // APIs de datos: siempre red, con fallback a cache
  if (url.includes('earthquake.usgs.gov') || url.includes('gdacs.org') || url.includes('allorigins.win')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // Recursos estáticos: cache first
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
