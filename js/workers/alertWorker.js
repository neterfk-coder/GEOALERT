/* ============================================================
   GEOALERT — js/workers/alertWorker.js
   Web Worker: detecta eventos críticos en segundo plano
   ============================================================ */

const CRITICAL_MAG = 6.5;
const WARN_MAG     = 5.0;

self.onmessage = function (e) {
  const { type, payload } = e.data;

  if (type === 'CHECK_EVENTS') {
    const { newEvents } = payload;
    const critical = newEvents.filter(ev => (ev.magnitude || 0) >= CRITICAL_MAG);
    const warnings = newEvents.filter(ev => (ev.magnitude || 0) >= WARN_MAG && (ev.magnitude || 0) < CRITICAL_MAG);
    const tsunamis = newEvents.filter(ev => ev.tsunami || ev.type === 'tsunami');

    self.postMessage({
      type: 'ALERT_RESULT',
      payload: { critical, warnings, tsunamis },
    });
  }
};
