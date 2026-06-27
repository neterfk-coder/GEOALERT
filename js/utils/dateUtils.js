/* ============================================================
   GEOALERT — js/utils/dateUtils.js
   Funciones de formato de fechas y tiempo relativo
   ============================================================ */

GeoAlert.DateUtils = (function () {

  function timeAgo(timestamp) {
    if (!timestamp) return 'Desconocido';
    const diff = Date.now() - timestamp;
    const s = Math.floor(diff / 1000);
    if (s < 60)   return `Hace ${s}s`;
    const m = Math.floor(s / 60);
    if (m < 60)   return `Hace ${m}min`;
    const h = Math.floor(m / 60);
    if (h < 24)   return `Hace ${h}h`;
    const d = Math.floor(h / 24);
    return `Hace ${d}d`;
  }

  function formatFull(timestamp) {
    if (!timestamp) return '—';
    return new Date(timestamp).toISOString().replace('T', ' ').slice(0, 19);
  }

  function formatDate(timestamp) {
    if (!timestamp) return '—';
    return new Date(timestamp).toLocaleDateString('es-ES', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  }

  function formatTime(timestamp) {
    if (!timestamp) return '—';
    return new Date(timestamp).toLocaleTimeString('es-ES');
  }

  return { timeAgo, formatFull, formatDate, formatTime };

})();
