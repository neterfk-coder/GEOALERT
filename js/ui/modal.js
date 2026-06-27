/* ============================================================
   GEOALERT — js/ui/modal.js
   Modal de detalle completo para cada evento
   ============================================================ */

GeoAlert.ModalUI = (function () {

  function init() {
    document.getElementById('modalClose')?.addEventListener('click', close);
    document.getElementById('eventModal')?.addEventListener('click', function (e) {
      if (e.target === this) close();
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  }

  function open(eventId) {
    const events = GeoAlert.State.get('events');
    const event  = events.find(e => e.id === eventId);
    if (!event) return;
    GeoAlert.State.setActiveEvent(event);
    render(event);
    document.getElementById('eventModal')?.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    document.getElementById('eventModal')?.classList.add('hidden');
    document.body.style.overflow = '';
  }

  function render(event) {
    const D     = GeoAlert.DateUtils;
    const mag   = event.magnitude;
    const type  = event.type || 'earthquake';
    const ti    = GeoAlert.CONFIG.DISASTER_TYPES[type] || GeoAlert.CONFIG.DISASTER_TYPES.earthquake;
    const color = GeoAlert.Markers?.getMagColor(mag || 0) || ti.color;

    // Header
    document.getElementById('modalHeader').innerHTML = `
      <div style="display:flex;align-items:center;gap:16px">
        <div class="modal-mag" style="color:${color}">
          ${type === 'earthquake' ? (mag?.toFixed(1) || '?') : ti.icon}
        </div>
        <div>
          <div class="modal-title">${event.place || 'Ubicación desconocida'}</div>
          <div class="modal-subtitle">${ti.label} · ${D.formatFull(event.time)} UTC</div>
          ${event.alert ? `<span class="event-alert-tag tag-${event.alert}" style="margin-top:6px">${event.alert.toUpperCase()}</span>` : ''}
        </div>
      </div>
    `;

    // Body
    document.getElementById('modalBody').innerHTML = `
      <div class="modal-grid">
        ${mag != null ? `
        <div class="modal-field">
          <span class="modal-field-label">Magnitud</span>
          <span class="modal-field-value" style="color:${color};font-size:20px">M ${mag.toFixed(1)}</span>
        </div>` : ''}
        ${event.depth != null ? `
        <div class="modal-field">
          <span class="modal-field-label">Profundidad</span>
          <span class="modal-field-value">${event.depth.toFixed(1)} km</span>
        </div>` : ''}
        ${event.lat != null ? `
        <div class="modal-field">
          <span class="modal-field-label">Latitud</span>
          <span class="modal-field-value">${event.lat.toFixed(4)}°</span>
        </div>` : ''}
        ${event.lng != null ? `
        <div class="modal-field">
          <span class="modal-field-label">Longitud</span>
          <span class="modal-field-value">${event.lng.toFixed(4)}°</span>
        </div>` : ''}
        ${event.felt ? `
        <div class="modal-field">
          <span class="modal-field-label">Personas que lo sintieron</span>
          <span class="modal-field-value">${event.felt.toLocaleString()}</span>
        </div>` : ''}
        ${event.cdi ? `
        <div class="modal-field">
          <span class="modal-field-label">Intensidad (CDI)</span>
          <span class="modal-field-value">${event.cdi.toFixed(1)}</span>
        </div>` : ''}
        ${event.mmi ? `
        <div class="modal-field">
          <span class="modal-field-label">Sacudimiento (MMI)</span>
          <span class="modal-field-value">${event.mmi.toFixed(1)}</span>
        </div>` : ''}
        ${event.tsunami ? `
        <div class="modal-field">
          <span class="modal-field-label">Alerta Tsunami</span>
          <span class="modal-field-value" style="color:#0EA5E9">🌊 SÍ</span>
        </div>` : ''}
        <div class="modal-field">
          <span class="modal-field-label">Fuente</span>
          <span class="modal-field-value">${event.net?.toUpperCase() || event.source || 'USGS'}</span>
        </div>
        <div class="modal-field">
          <span class="modal-field-label">Estado</span>
          <span class="modal-field-value">${event.status || '—'}</span>
        </div>
        <div class="modal-field" style="grid-column:1/-1">
          <span class="modal-field-label">Tiempo transcurrido</span>
          <span class="modal-field-value">${D.timeAgo(event.time)}</span>
        </div>
      </div>
    `;

    // Footer
    const usgsLink = event.url
      ? `<a href="${event.url}" target="_blank" rel="noopener" class="btn-small">Ver en USGS →</a>`
      : '';
    document.getElementById('modalFooter').innerHTML = `
      ${usgsLink}
      <button class="btn-small" onclick="GeoAlert.Layers.focusEvent(GeoAlert.State.get('activeEvent'));GeoAlert.ModalUI.close()">Ver en mapa →</button>
      <button class="btn-small" onclick="GeoAlert.ExportUtils.singleToJSON(GeoAlert.State.get('activeEvent'))">Exportar JSON</button>
    `;
  }

  return { init, open, close };

})();
