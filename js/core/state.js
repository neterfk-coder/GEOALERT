/* ============================================================
   GEOALERT — js/core/state.js
   Estado global reactivo (patrón observer simple)
   ============================================================ */

GeoAlert.State = (function () {

  const _state = {
    events:        [],          // todos los eventos cargados
    filtered:      [],          // eventos tras aplicar filtros
    activeEvent:   null,        // evento seleccionado
    filters: {
      types:       ['earthquake','tsunami','volcano','cyclone','flood'],
      minMag:      3.0,
      hours:       24,
    },
    map: {
      style:       'dark',
      heatmapOn:   false,
      clustersOn:  true,
    },
    ui: {
      sidebarOpen: true,
      theme:       'dark',
      notifs:      false,
    },
    status: {
      connected:   false,
      lastFetch:   null,
      fetchErrors: 0,
    },
    stats: {
      total:       0,
      maxMag:      0,
      activeAlerts: 0,
    },
  };

  const _listeners = {};

  function on(event, fn) {
    if (!_listeners[event]) _listeners[event] = [];
    _listeners[event].push(fn);
  }

  function off(event, fn) {
    if (!_listeners[event]) return;
    _listeners[event] = _listeners[event].filter(f => f !== fn);
  }

  function emit(event, data) {
    (_listeners[event] || []).forEach(fn => fn(data));
  }

  function get(key) {
    return key ? _state[key] : _state;
  }

  function set(key, value) {
    if (typeof key === 'object') {
      Object.assign(_state, key);
      emit('change', _state);
      return;
    }
    if (typeof value === 'object' && !Array.isArray(value) && _state[key]) {
      _state[key] = { ..._state[key], ...value };
    } else {
      _state[key] = value;
    }
    emit('change:' + key, _state[key]);
    emit('change', _state);
  }

  function setEvents(events) {
    _state.events = events;
    // Calcular stats
    _state.stats.total   = events.length;
    _state.stats.maxMag  = events.reduce((m, e) => Math.max(m, e.magnitude || 0), 0);
    _state.stats.activeAlerts = events.filter(
      e => e.magnitude >= GeoAlert.CONFIG.THRESHOLDS.criticalMag
    ).length;
    applyFilters();
    emit('events:updated', _state.filtered);
    emit('stats:updated', _state.stats);
  }

  function addEvents(newEvents) {
    // Evitar duplicados por ID
    const existingIds = new Set(_state.events.map(e => e.id));
    const unique = newEvents.filter(e => !existingIds.has(e.id));
    if (unique.length > 0) {
      _state.events = [...unique, ..._state.events]
        .slice(0, GeoAlert.CONFIG.CACHE.maxEvents);
      setEvents(_state.events);
      emit('events:new', unique);
    }
  }

  function applyFilters() {
    const f = _state.filters;
    const cutoff = Date.now() - f.hours * 3600 * 1000;
    _state.filtered = _state.events.filter(e => {
      if (!f.types.includes(e.type)) return false;
      if ((e.magnitude || 0) < f.minMag) return false;
      if (e.time && e.time < cutoff) return false;
      return true;
    });
    emit('filtered:updated', _state.filtered);
  }

  function setFilter(key, value) {
    _state.filters[key] = value;
    applyFilters();
  }

  function setActiveEvent(event) {
    _state.activeEvent = event;
    emit('event:selected', event);
  }

  return { on, off, emit, get, set, setEvents, addEvents, applyFilters, setFilter, setActiveEvent };

})();

console.log('[GeoAlert] State listo ✓');
