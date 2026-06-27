/* ============================================================
   GEOALERT — js/ui/stats.js
   Panel de estadísticas en el header
   ============================================================ */

GeoAlert.StatsUI = (function () {

  function init() {
    GeoAlert.State.on('stats:updated', render);
  }

  function render(stats) {
    const total  = document.getElementById('statTotal');
    const maxMag = document.getElementById('statMaxMag');
    const alerts = document.getElementById('statAlerts');
    if (total)  total.textContent  = stats.total.toLocaleString();
    if (maxMag) maxMag.textContent = stats.maxMag ? `M${stats.maxMag.toFixed(1)}` : '—';
    if (alerts) alerts.textContent = stats.activeAlerts;
  }

  function updateLastFetch(date) {
    const el = document.getElementById('lastUpdate');
    if (el) el.textContent = `Última actualización: ${date.toLocaleTimeString()}`;
  }

  return { init, render, updateLastFetch };

})();
