/* ============================================================
   GEOALERT — js/utils/geoUtils.js
   Utilidades geoespaciales: distancias, formato de coords
   ============================================================ */

GeoAlert.GeoUtils = (function () {

  // Distancia Haversine entre dos puntos en km
  function haversine(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat/2)**2 +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  function toRad(deg) { return deg * Math.PI / 180; }

  // Formato legible de coordenadas
  function formatCoords(lat, lng) {
    const latDir = lat >= 0 ? 'N' : 'S';
    const lngDir = lng >= 0 ? 'E' : 'W';
    return `${Math.abs(lat).toFixed(3)}°${latDir}, ${Math.abs(lng).toFixed(3)}°${lngDir}`;
  }

  // Validar coordenadas
  function isValid(lat, lng) {
    return lat != null && lng != null &&
           !isNaN(lat) && !isNaN(lng) &&
           lat >= -90 && lat <= 90 &&
           lng >= -180 && lng <= 180;
  }

  // Bounding box → filtrar eventos dentro de área visible
  function filterByBounds(events, bounds) {
    if (!bounds) return events;
    return events.filter(e =>
      e.lat != null && e.lng != null &&
      e.lat >= bounds.south && e.lat <= bounds.north &&
      e.lng >= bounds.west  && e.lng <= bounds.east
    );
  }

  return { haversine, formatCoords, isValid, filterByBounds };

})();
