/* ============================================================
   GEOALERT — js/api/usgs.js
   Fetch y parseo de la API de terremotos USGS (gratuita)
   Docs: https://earthquake.usgs.gov/fdsnws/event/1/
   ============================================================ */

GeoAlert.USGS = (function () {

  const BASE = GeoAlert.CONFIG.API.USGS_BASE;

  // Parámetros de consulta
  function buildURL(hours, minMag) {
    const endTime   = new Date().toISOString();
    const startTime = new Date(Date.now() - hours * 3600 * 1000).toISOString();
    return `${BASE}?format=geojson&starttime=${startTime}&endtime=${endTime}&minmagnitude=${minMag}&orderby=time&limit=500`;
  }

  // Alternativa: feeds estáticos (más rápidos, sin parámetros)
  function getFeedURL(period, level) {
    // period: hour | day | week | month
    // level:  significant | 4.5 | 2.5 | 1.0 | all
    return `${GeoAlert.CONFIG.API.USGS_FEED}/${level}_${period}.geojson`;
  }

  // Parsear feature GeoJSON → objeto normalizado
  function parseFeature(feature) {
    const p = feature.properties;
    const c = feature.geometry?.coordinates || [];
    return {
      id:        feature.id,
      type:      'earthquake',
      place:     p.place  || 'Desconocido',
      magnitude: p.mag    != null ? parseFloat(p.mag.toFixed(1)) : null,
      time:      p.time   || null,
      updated:   p.updated|| null,
      lng:       c[0]     != null ? parseFloat(c[0].toFixed(4)) : null,
      lat:       c[1]     != null ? parseFloat(c[1].toFixed(4)) : null,
      depth:     c[2]     != null ? parseFloat(c[2].toFixed(1)) : null,
      alert:     p.alert  || null,
      tsunami:   p.tsunami === 1,
      felt:      p.felt   || 0,
      cdi:       p.cdi    || null,
      mmi:       p.mmi    || null,
      status:    p.status || null,
      net:       p.net    || null,
      url:       p.url    || null,
      detail:    p.detail || null,
    };
  }

  async function fetch(hours = 24, minMag = 3.0) {
    const cached = GeoAlert.Cache.get('usgs');
    if (cached) {
      console.log('[USGS] Usando datos en cache');
      return cached;
    }

    try {
      const url = buildURL(hours, minMag);
      const res = await window.fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const events = (json.features || []).map(parseFeature);
      GeoAlert.Cache.set('usgs', events);
      console.log(`[USGS] ${events.length} eventos cargados`);
      return events;
    } catch (err) {
      console.error('[USGS] Error de fetch:', err);
      // Intentar feed de respaldo
      return await fetchFallback(minMag);
    }
  }

  async function fetchFallback(minMag = 3.0) {
    try {
      const level = minMag >= 4.5 ? '4.5' : minMag >= 2.5 ? '2.5' : 'all';
      const url = getFeedURL('day', level);
      const res = await window.fetch(url);
      if (!res.ok) throw new Error(`Fallback HTTP ${res.status}`);
      const json = await res.json();
      const events = (json.features || []).map(parseFeature);
      console.log(`[USGS] Fallback: ${events.length} eventos`);
      return events;
    } catch (err) {
      console.error('[USGS] Error en fallback:', err);
      return [];
    }
  }

  return { fetch, fetchFallback, parseFeature };

})();
