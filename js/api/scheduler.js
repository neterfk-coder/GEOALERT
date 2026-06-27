/* ============================================================
   GEOALERT — js/api/scheduler.js
   Orquesta las actualizaciones automáticas de todos los APIs
   ============================================================ */

GeoAlert.DataScheduler = (function () {
  const intervals = {};
  let paused = false;

  async function fetchAll() {
    if (paused) return;
    const s = GeoAlert.State;
    const filters = s.get('filters');

    try {
      GeoAlert.AlertsUI?.showStatus('Actualizando datos...', 'loading');

      // Fetch paralelo
      const [quakes, disasters] = await Promise.allSettled([
        GeoAlert.USGS.fetch(filters.hours, filters.minMag),
        GeoAlert.GDACS.fetch(),
      ]);

      const allEvents = [
        ...(quakes.status === 'fulfilled'    ? quakes.value    : []),
        ...(disasters.status === 'fulfilled' ? disasters.value : []),
      ];

      // Detectar eventos nuevos antes de actualizar
      const existing = new Set(s.get('events').map(e => e.id));
      const newEvents = allEvents.filter(e => !existing.has(e.id));

      s.setEvents(allEvents);

      // Notificar eventos críticos nuevos
      newEvents.forEach(e => {
        if ((e.magnitude || 0) >= GeoAlert.CONFIG.THRESHOLDS.criticalMag) {
          GeoAlert.AlertsUI?.showToast(
            `🔴 Sismo M${e.magnitude?.toFixed(1)} — ${e.place}`,
            `Profundidad: ${e.depth ? e.depth + ' km' : 'desconocida'} · ${GeoAlert.DateUtils?.timeAgo(e.time) || ''}`,
            'critical'
          );
          GeoAlert.Notifications?.send(
            `Sismo M${e.magnitude?.toFixed(1)}`,
            `${e.place} · ${GeoAlert.DateUtils?.timeAgo(e.time) || ''}`
          );
        }
      });

      const now = new Date();
      s.set('status', { connected: true, lastFetch: now, fetchErrors: 0 });
      GeoAlert.AlertsUI?.showStatus('🟢 Datos actualizados', 'ok');
      GeoAlert.StatsUI?.updateLastFetch(now);

    } catch (err) {
      console.error('[Scheduler] Error general:', err);
      const prev = GeoAlert.State.get('status');
      GeoAlert.State.set('status', { fetchErrors: (prev.fetchErrors || 0) + 1 });
      GeoAlert.AlertsUI?.showStatus('⚠ Error al actualizar', 'error');
    }
  }

  function startAll() {
    const CFG = GeoAlert.CONFIG.REFRESH;

    // USGS: cada 30 segundos
    intervals.usgs = setInterval(() => {
      if (!paused) {
        GeoAlert.Cache.invalidate('usgs');
        fetchAll();
      }
    }, CFG.earthquakes);

    // GDACS: cada 5 minutos
    intervals.gdacs = setInterval(() => {
      if (!paused) {
        GeoAlert.Cache.invalidate('gdacs');
        fetchAll();
      }
    }, CFG.gdacs);

    // Contador regresivo de próxima actualización
    let countdown = GeoAlert.CONFIG.REFRESH.earthquakes / 1000;
    intervals.countdown = setInterval(() => {
      if (!paused) {
        countdown--;
        if (countdown <= 0) countdown = GeoAlert.CONFIG.REFRESH.earthquakes / 1000;
        const el = document.getElementById('nextUpdate');
        if (el) el.textContent = `Próx. actualización: ${countdown}s`;
      }
    }, 1000);

    console.log('[Scheduler] Actualizaciones automáticas iniciadas ✓');
  }

  function pauseAll() {
    paused = true;
  }

  function resumeAll() {
    paused = false;
  }

  function stopAll() {
    Object.values(intervals).forEach(clearInterval);
  }

  return { fetchAll, startAll, pauseAll, resumeAll, stopAll };

})();
