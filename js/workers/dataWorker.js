/* ============================================================
   GEOALERT — js/workers/dataWorker.js
   Web Worker: procesa y filtra datos sin bloquear la UI
   Se usa con: const w = new Worker('js/workers/dataWorker.js')
   ============================================================ */

self.onmessage = function (e) {
  const { type, payload } = e.data;

  switch (type) {
    case 'FILTER':
      const { events, filters } = payload;
      const cutoff = Date.now() - filters.hours * 3600 * 1000;
      const filtered = events.filter(ev => {
        if (!filters.types.includes(ev.type)) return false;
        if ((ev.magnitude || 0) < filters.minMag) return false;
        if (ev.time && ev.time < cutoff) return false;
        return true;
      });
      self.postMessage({ type: 'FILTER_RESULT', payload: filtered });
      break;

    case 'STATS':
      const evts = payload.events;
      const stats = {
        total:        evts.length,
        maxMag:       evts.reduce((m, e) => Math.max(m, e.magnitude || 0), 0),
        byType:       {},
        byAlertLevel: { red: 0, orange: 0, green: 0, none: 0 },
      };
      evts.forEach(e => {
        stats.byType[e.type] = (stats.byType[e.type] || 0) + 1;
        const al = e.alert || 'none';
        if (al in stats.byAlertLevel) stats.byAlertLevel[al]++;
        else stats.byAlertLevel.none++;
      });
      self.postMessage({ type: 'STATS_RESULT', payload: stats });
      break;

    case 'DEDUPE':
      const seen  = new Set();
      const deduped = payload.events.filter(e => {
        if (seen.has(e.id)) return false;
        seen.add(e.id);
        return true;
      });
      self.postMessage({ type: 'DEDUPE_RESULT', payload: deduped });
      break;

    default:
      self.postMessage({ type: 'ERROR', payload: 'Tipo desconocido: ' + type });
  }
};
