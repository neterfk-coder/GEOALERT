/* ============================================================
   GEOALERT — js/api/usgs.js
   USGS Earthquake API — polling agresivo + feed significant
   ============================================================ */

GeoAlert.USGS = (function () {

  const BASE = GeoAlert.CONFIG.API.USGS_BASE;
  const FEED = GeoAlert.CONFIG.API.USGS_FEED;

  // IDs ya vistos en este ciclo de vida (evita re-alertar)
  const _seenIds = new Set();

  function buildURL(hours, minMag) {
    const end   = new Date().toISOString();
    const start = new Date(Date.now() - hours * 3600 * 1000).toISOString();
    return `${BASE}?format=geojson&starttime=${start}&endtime=${end}&minmagnitude=${minMag}&orderby=time&limit=500`;
  }

  function getFeedURL(period, level) {
    return `${FEED}/${level}_${period}.geojson`;
  }

  function parseFeature(f) {
    const p = f.properties;
    const c = f.geometry?.coordinates || [];
    return {
      id:        f.id,
      type:      'earthquake',
      place:     p.place    || 'Unknown location',
      magnitude: p.mag != null ? parseFloat(p.mag.toFixed(1)) : null,
      time:      p.time     || null,
      updated:   p.updated  || null,
      lng:       c[0] != null ? parseFloat(c[0].toFixed(4)) : null,
      lat:       c[1] != null ? parseFloat(c[1].toFixed(4)) : null,
      depth:     c[2] != null ? parseFloat(c[2].toFixed(1)) : null,
      alert:     p.alert    || null,
      tsunami:   p.tsunami  === 1,
      felt:      p.felt     || 0,
      cdi:       p.cdi      || null,
      mmi:       p.mmi      || null,
      status:    p.status   || null,
      net:       p.net      || null,
      url:       p.url      || null,
      detail:    p.detail   || null,
    };
  }

  /* ---- Fetch principal (últimas N horas, minMag) ---- */
  async function fetch(hours = 24, minMag = 3.0) {
    const cached = GeoAlert.Cache.get('usgs_main');
    if (cached) return cached;
    try {
      const res  = await window.fetch(buildURL(hours, minMag));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const events = (json.features || []).map(parseFeature);
      GeoAlert.Cache.set('usgs_main', events, 15 * 1000); // TTL 15s
      console.log(`[USGS] ${events.length} events loaded`);
      return events;
    } catch (err) {
      console.warn('[USGS] Main fetch failed, trying fallback:', err.message);
      return fetchFallback(minMag);
    }
  }

  /* ---- Feed de 1 hora (muy liviano, ~15-20 KB) ---- */
  async function fetchHour(minMag = 2.5) {
    const cached = GeoAlert.Cache.get('usgs_hour');
    if (cached) return cached;
    try {
      const level = minMag >= 4.5 ? '4.5' : minMag >= 2.5 ? '2.5' : 'all';
      const res   = await window.fetch(getFeedURL('hour', level));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json  = await res.json();
      const events = (json.features || []).map(parseFeature);
      GeoAlert.Cache.set('usgs_hour', events, 15 * 1000); // TTL 15s
      console.log(`[USGS·hour] ${events.length} events in last hour`);
      return events;
    } catch (err) {
      console.warn('[USGS·hour] Failed:', err.message);
      return [];
    }
  }

  /* ---- Feed "significant" — sismos importantes, se publica en ~1-2 min ---- */
  async function fetchSignificant() {
    const cached = GeoAlert.Cache.get('usgs_significant');
    if (cached) return cached;
    try {
      const res  = await window.fetch(getFeedURL('day', 'significant'));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const events = (json.features || []).map(parseFeature);
      GeoAlert.Cache.set('usgs_significant', events, 15 * 1000); // TTL 15s
      console.log(`[USGS·significant] ${events.length} significant events`);
      return events;
    } catch (err) {
      console.warn('[USGS·significant] Failed:', err.message);
      return [];
    }
  }

  /* ---- Fallback feed día ---- */
  async function fetchFallback(minMag = 3.0) {
    try {
      const level = minMag >= 4.5 ? '4.5' : '2.5';
      const res   = await window.fetch(getFeedURL('day', level));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json  = await res.json();
      return (json.features || []).map(parseFeature);
    } catch (err) {
      console.error('[USGS·fallback] Failed:', err.message);
      return [];
    }
  }

  /* ---- Detectar eventos NUEVOS no vistos antes ---- */
  function extractNew(events) {
    const newOnes = events.filter(e => !_seenIds.has(e.id));
    newOnes.forEach(e => _seenIds.add(e.id));
    // Limpiar IDs viejos si hay demasiados
    if (_seenIds.size > 5000) {
      const arr = [..._seenIds];
      arr.slice(0, 2000).forEach(id => _seenIds.delete(id));
    }
    return newOnes;
  }

  return { fetch, fetchHour, fetchSignificant, fetchFallback, parseFeature, extractNew };

})();
