/* ============================================================
   GEOALERT — js/api/cache.js
   Cache en memoria para reducir peticiones API
   ============================================================ */

GeoAlert.Cache = (function () {
  const _store = {};
  const DEFAULT_TTL = GeoAlert.CONFIG.CACHE.ttlSeconds * 1000;

  function set(key, data, ttl = DEFAULT_TTL) {
    _store[key] = { data, expires: Date.now() + ttl };
  }

  function get(key) {
    const entry = _store[key];
    if (!entry) return null;
    if (Date.now() > entry.expires) { delete _store[key]; return null; }
    return entry.data;
  }

  function invalidate(key) { delete _store[key]; }
  function clear() { Object.keys(_store).forEach(k => delete _store[k]); }

  return { set, get, invalidate, clear };
})();
