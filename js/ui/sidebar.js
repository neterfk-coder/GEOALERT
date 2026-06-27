/* ============================================================
   GEOALERT — js/ui/sidebar.js
   Renderiza la lista de eventos en el panel lateral
   ============================================================ */

GeoAlert.SidebarUI = (function () {

  const list    = () => document.getElementById('eventList');
  const counter = () => document.getElementById('eventCount');

  function init() {
    // Toggle sidebar
    document.getElementById('sidebarToggle')?.addEventListener('click', toggleSidebar);

    // Escuchar eventos filtrados
    GeoAlert.State.on('filtered:updated', renderList);

    // Exportar CSV
    document.getElementById('exportBtn')?.addEventListener('click', () => {
      GeoAlert.ExportUtils.toCSV(GeoAlert.State.get('filtered'));
    });

    // Selección activa
    GeoAlert.State.on('event:selected', (e) => {
      highlightCard(e?.id);
      if (e) GeoAlert.Layers.focusEvent(e);
    });
  }

  function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const btn     = document.getElementById('sidebarToggle');
    sidebar?.classList.toggle('collapsed');
    if (btn) btn.textContent = sidebar?.classList.contains('collapsed') ? '▶' : '◀';
  }

  function renderList(events) {
    const ul = list();
    if (!ul) return;

    if (!events || events.length === 0) {
      ul.innerHTML = `<li class="event-loading"><span>No se encontraron eventos con los filtros actuales.</span></li>`;
      if (counter()) counter().textContent = '0 eventos';
      return;
    }

    if (counter()) counter().textContent = `${events.length} eventos`;

    // Renderizar máximo 200 en la lista para no saturar DOM
    const visible = events.slice(0, 200);
    ul.innerHTML = visible.map(buildCardHTML).join('');

    // Click en tarjeta
    ul.querySelectorAll('.event-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        const event = events.find(e => e.id === id);
        if (event) GeoAlert.State.setActiveEvent(event);
      });
    });
  }

  function buildCardHTML(event) {
    const D    = GeoAlert.DateUtils;
    const mag  = event.magnitude;
    const cls  = GeoAlert.Markers?.getMagClass(mag || 0) || 'low';
    const type = event.type || 'earthquake';
    const typeInfo = GeoAlert.CONFIG.DISASTER_TYPES[type] || GeoAlert.CONFIG.DISASTER_TYPES.earthquake;
    const isBadgeType = type !== 'earthquake';

    const alertTag = event.alert
      ? `<span class="event-alert-tag tag-${event.alert === 'red' ? 'red' : event.alert === 'orange' ? 'orange' : 'green'}">${event.alert}</span>`
      : '';

    const magDisplay = isBadgeType
      ? `<span style="font-size:20px">${typeInfo.icon}</span>`
      : `${mag?.toFixed(1) || '?'}`;

    return `
      <li class="event-card" data-id="${event.id}">
        <div class="event-mag-badge ${isBadgeType ? type : cls}">${magDisplay}</div>
        <div class="event-info">
          <div class="event-place">${event.place || 'Ubicación desconocida'}</div>
          <div class="event-meta">
            ${mag ? `<span>M${mag.toFixed(1)}</span>` : ''}
            ${event.depth != null ? `<span class="event-depth">↓${event.depth.toFixed(0)}km</span>` : ''}
            <span>${typeInfo.label}</span>
            <span class="event-time">${D.timeAgo(event.time)}</span>
          </div>
          ${alertTag}
        </div>
      </li>
    `;
  }

  function highlightCard(id) {
    document.querySelectorAll('.event-card').forEach(c => c.classList.remove('active'));
    if (id) document.querySelector(`.event-card[data-id="${id}"]`)?.classList.add('active');
  }

  return { init, renderList, toggleSidebar };

})();
