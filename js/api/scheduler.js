/* ============================================================
   GEOALERT — js/api/scheduler.js
   Scheduler de alta frecuencia:
   · Significant feed  → cada 15s  (sismos grandes, ~1-2 min retraso real)
   · Hour feed         → cada 15s  (todos los sismos última hora)
   · Main feed         → cada 60s  (histórico 24h completo)
   · GDACS             → cada 3min (otros desastres)
   ============================================================ */

GeoAlert.DataScheduler = (function () {

  const timers = {};
  let paused   = false;
  let _countdown = 15;

  /* ================================================================
     FETCH RÁPIDO — significant + hour (cada 15 segundos)
     Es liviano: son feeds pre-generados por USGS, ~20-50 KB cada uno
  ================================================================ */
  async function fetchFast() {
    if (paused) return;
    try {
      // Invalidar cache de feeds rápidos
      GeoAlert.Cache.invalidate('usgs_significant');
      GeoAlert.Cache.invalidate('usgs_hour');

      const [sig, hour] = await Promise.allSettled([
        GeoAlert.USGS.fetchSignificant(),
        GeoAlert.USGS.fetchHour(GeoAlert.State.get('filters').minMag),
      ]);

      const incoming = [
        ...(sig.status  === 'fulfilled' ? sig.value  : []),
        ...(hour.status === 'fulfilled' ? hour.value : []),
      ];

      // Deduplicar por ID
      const seen = new Map();
      incoming.forEach(e => seen.set(e.id, e));
      const deduped = [...seen.values()];

      // Detectar realmente nuevos (no vistos en ningún fetch anterior)
      const brandNew = GeoAlert.USGS.extractNew(deduped);

      if (brandNew.length > 0) {
        console.log(`[Scheduler·fast] ${brandNew.length} NEW events detected`);
        GeoAlert.State.addEvents(brandNew);
        handleNewEvents(brandNew);
      }

      updateStatus('ok');

    } catch (err) {
      console.warn('[Scheduler·fast] Error:', err.message);
    }
  }

  /* ================================================================
     FETCH COMPLETO — histórico 24h + GDACS (cada 60 segundos)
  ================================================================ */
  async function fetchFull() {
    if (paused) return;
    try {
      GeoAlert.Cache.invalidate('usgs_main');
      GeoAlert.Cache.invalidate('gdacs');

      GeoAlert.AlertsUI?.showStatus('Updating data...', 'loading');

      const filters = GeoAlert.State.get('filters');
      const [main, gdacs] = await Promise.allSettled([
        GeoAlert.USGS.fetch(filters.hours, filters.minMag),
        GeoAlert.GDACS.fetch(),
      ]);

      const all = [
        ...(main.status  === 'fulfilled' ? main.value  : []),
        ...(gdacs.status === 'fulfilled' ? gdacs.value : []),
      ];

      // Marcar como vistos para no re-alertar
      GeoAlert.USGS.extractNew(all);

      GeoAlert.State.setEvents(all);

      const now = new Date();
      GeoAlert.State.set('status', { connected: true, lastFetch: now, fetchErrors: 0 });
      GeoAlert.StatsUI?.updateLastFetch(now);
      updateStatus('ok');

    } catch (err) {
      console.error('[Scheduler·full] Error:', err.message);
      const prev = GeoAlert.State.get('status');
      GeoAlert.State.set('status', { fetchErrors: (prev.fetchErrors || 0) + 1 });
      updateStatus('error');
    }
  }

  /* ================================================================
     PRIMERA CARGA — secuencial para no saturar
  ================================================================ */
  async function fetchAll() {
    await fetchFull();   // primero los datos completos
    await fetchFast();   // luego los más recientes encima
  }

  /* ================================================================
     ARRANCAR TODOS LOS TIMERS
  ================================================================ */
  function startAll() {
    // Fetch rápido cada 15 segundos
    timers.fast = setInterval(fetchFast, 15 * 1000);

    // Fetch completo cada 60 segundos
    timers.full = setInterval(fetchFull, 60 * 1000);

    // Countdown visual en la barra de estado
    _countdown = 15;
    timers.countdown = setInterval(() => {
      if (paused) return;
      _countdown--;
      if (_countdown <= 0) _countdown = 15;
      const el = document.getElementById('nextUpdate');
      if (el) el.textContent = `Next update: ${_countdown}s`;
    }, 1000);

    console.log('[Scheduler] ✓ Fast: 15s · Full: 60s · GDACS: 60s');
  }

  /* ================================================================
     MANEJAR EVENTOS NUEVOS — alertas y notificaciones inmediatas
  ================================================================ */
  function handleNewEvents(events) {
    const CFG = GeoAlert.CONFIG.THRESHOLDS;

    events.forEach(e => {
      const mag = e.magnitude || 0;

      // Sismo CRÍTICO — M6.5+
      if (mag >= CFG.criticalMag) {
        GeoAlert.AlertsUI?.showCriticalBanner(e);
        GeoAlert.AlertsUI?.showToast(
          `🔴 M${mag.toFixed(1)} — ${e.place}`,
          `Depth: ${e.depth ? e.depth + ' km' : 'unknown'} · ${GeoAlert.DateUtils?.timeAgo(e.time) || 'just now'}`,
          'critical',
          0  // no auto-dismiss para críticos
        );
        GeoAlert.Notifications?.send(
          `🔴 Major Earthquake M${mag.toFixed(1)}`,
          `${e.place} · Depth: ${e.depth ? e.depth + ' km' : 'unknown'}`
        );
        // Sonido de alerta si el navegador lo permite
        playAlertSound('critical');
      }

      // Sismo MODERADO — M5.0-6.4
      else if (mag >= CFG.warnMag) {
        GeoAlert.AlertsUI?.showToast(
          `🟠 M${mag.toFixed(1)} — ${e.place}`,
          `Depth: ${e.depth ? e.depth + ' km' : 'unknown'} · ${GeoAlert.DateUtils?.timeAgo(e.time) || 'just now'}`,
          'warning',
          12000
        );
        GeoAlert.Notifications?.send(
          `⚠️ Earthquake M${mag.toFixed(1)}`,
          `${e.place}`
        );
        playAlertSound('warning');
      }

      // TSUNAMI detectado
      if (e.tsunami) {
        GeoAlert.AlertsUI?.showToast(
          `🌊 TSUNAMI WARNING`,
          `${e.place} · M${mag.toFixed(1)}`,
          'critical',
          0
        );
        GeoAlert.Notifications?.send('🌊 TSUNAMI WARNING', e.place);
        playAlertSound('critical');
      }
    });
  }

  /* ================================================================
     SONIDO DE ALERTA (Web Audio API, sin archivos externos)
  ================================================================ */
  function playAlertSound(level) {
    try {
      const ctx  = new (window.AudioContext || window.webkitAudioContext)();
      const freq = level === 'critical' ? [880, 660, 880, 440] : [440, 550];
      let time   = ctx.currentTime;

      freq.forEach(f => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type      = 'sine';
        osc.frequency.setValueAtTime(f, time);
        gain.gain.setValueAtTime(0.18, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
        osc.start(time);
        osc.stop(time + 0.3);
        time += 0.32;
      });
    } catch (_) {
      // Silencioso si el navegador bloquea AudioContext sin interacción
    }
  }

  /* ================================================================
     HELPERS
  ================================================================ */
  function updateStatus(state) {
    const msgs = {
      ok:      '🟢 Live — updating every 15s',
      loading: '🟡 Updating...',
      error:   '🔴 Connection error — retrying',
    };
    GeoAlert.AlertsUI?.showStatus(msgs[state] || msgs.ok, state);
  }

  function pauseAll()  { paused = true;  }
  function resumeAll() { paused = false; }
  function stopAll()   { Object.values(timers).forEach(clearInterval); }

  return { fetchAll, fetchFast, fetchFull, startAll, pauseAll, resumeAll, stopAll };

})();
