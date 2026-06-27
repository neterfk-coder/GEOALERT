/* ============================================================
   GEOALERT — js/api/noaa.js
   Alertas de tsunami desde NOAA (gratuito)
   ============================================================ */

GeoAlert.NOAA = (function () {

  async function fetch() {
    try {
      const proxyURL = `https://api.allorigins.win/raw?url=${encodeURIComponent(GeoAlert.CONFIG.API.NOAA_BASE)}`;
      const res  = await window.fetch(proxyURL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const parser = new DOMParser();
      const xml    = parser.parseFromString(text, 'text/xml');

      const events = Array.from(xml.querySelectorAll('event')).map(el => {
        const getText = (tag) => el.querySelector(tag)?.textContent?.trim() || '';
        const lat = parseFloat(getText('latitude'));
        const lng = parseFloat(getText('longitude'));
        return {
          id:        'noaa-' + getText('eventid'),
          type:      'tsunami',
          place:     getText('region') || 'Tsunami NOAA',
          magnitude: parseFloat(getText('magnitude')) || null,
          time:      new Date(getText('eventtime')).getTime() || Date.now(),
          lat:       isNaN(lat) ? null : lat,
          lng:       isNaN(lng) ? null : lng,
          depth:     null,
          alert:     'red',
          source:    'NOAA',
          url:       getText('url') || null,
        };
      }).filter(e => e.lat && e.lng);

      console.log(`[NOAA] ${events.length} alertas de tsunami cargadas`);
      return events;
    } catch (err) {
      console.warn('[NOAA] No disponible:', err.message);
      return [];
    }
  }

  return { fetch };

})();
