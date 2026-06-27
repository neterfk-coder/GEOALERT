/* ============================================================
   GEOALERT — js/api/gdacs.js
   Fetch de desastres múltiples desde GDACS RSS (gratuito)
   Docs: https://www.gdacs.org
   ============================================================ */

GeoAlert.GDACS = (function () {

  // GDACS expone un RSS XML público
  const RSS_URL = GeoAlert.CONFIG.API.GDACS_RSS;

  // Mapa de códigos GDACS → tipo interno
  const TYPE_MAP = {
    'EQ': 'earthquake',
    'TC': 'cyclone',
    'FL': 'flood',
    'VO': 'volcano',
    'TS': 'tsunami',
    'DR': 'flood',
    'WF': 'wildfire',
  };

  function parseRSSItem(item) {
    const getText = (tag) => item.querySelector(tag)?.textContent?.trim() || '';
    const getGdacs = (tag) => item.querySelector(`gdacs\\:${tag}, [localName="${tag}"]`)?.textContent?.trim() || '';

    const typeCode = getGdacs('eventtype') || 'EQ';
    const lat  = parseFloat(getGdacs('latitude')  || item.querySelector('geo\\:lat')?.textContent  || 0);
    const lng  = parseFloat(getGdacs('longitude') || item.querySelector('geo\\:long')?.textContent || 0);
    const severity = getGdacs('severity');

    return {
      id:        'gdacs-' + (getGdacs('eventid') || Math.random().toString(36).slice(2)),
      type:      TYPE_MAP[typeCode] || 'flood',
      place:     getText('title') || 'Evento GDACS',
      magnitude: parseFloat(getGdacs('magnitude') || '0') || null,
      time:      new Date(getText('pubDate')).getTime() || Date.now(),
      lat:       isNaN(lat) ? null : lat,
      lng:       isNaN(lng) ? null : lng,
      depth:     null,
      alert:     getGdacs('alertlevel')?.toLowerCase() || null,
      severity:  severity || null,
      source:    'GDACS',
      url:       getText('link') || null,
    };
  }

  async function fetch() {
    const cached = GeoAlert.Cache.get('gdacs');
    if (cached) return cached;

    try {
      // Usar proxy CORS si es necesario
      const proxyURL = `https://api.allorigins.win/raw?url=${encodeURIComponent(RSS_URL)}`;
      const res = await window.fetch(proxyURL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();

      const parser = new DOMParser();
      const xml    = parser.parseFromString(text, 'text/xml');
      const items  = Array.from(xml.querySelectorAll('item'));
      const events = items.map(parseRSSItem).filter(e => e.lat && e.lng);

      GeoAlert.Cache.set('gdacs', events, 5 * 60 * 1000); // TTL 5 min
      console.log(`[GDACS] ${events.length} eventos cargados`);
      return events;
    } catch (err) {
      console.warn('[GDACS] No disponible:', err.message);
      return [];
    }
  }

  return { fetch };

})();
