/* ============================================================
   GEOALERT — js/map/heatmap.js
   Configuración de la capa de calor (Leaflet.heat)
   ============================================================ */

GeoAlert.Heatmap = (function () {

  // Opciones avanzadas para ajustar la capa de calor
  const OPTIONS = {
    radius:  28,
    blur:    22,
    maxZoom: 10,
    max:     1.0,
    gradient: {
      0.0: '#3730A3',
      0.2: '#1D4ED8',
      0.4: '#0EA5E9',
      0.6: '#FB923C',
      0.8: '#EF4444',
      1.0: '#7F1D1D',
    },
  };

  // Convertir eventos a formato [lat, lng, intensidad]
  function eventsToPoints(events) {
    return events
      .filter(e => e.lat != null && e.lng != null)
      .map(e => {
        const intensity = e.magnitude ? Math.min(1, e.magnitude / 9) : 0.3;
        return [e.lat, e.lng, intensity];
      });
  }

  return { OPTIONS, eventsToPoints };

})();
