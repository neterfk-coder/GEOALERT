/* ============================================================
   GEOALERT — js/ui/alerts.js
   Toasts, banners críticos y estado de conexión en tiempo real
   ============================================================ */

GeoAlert.AlertsUI = (function () {

  /* ---- Toast ---- */
  function showToast(title, msg, type = 'info', duration = 6000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const icons = { critical: '🔴', warning: '🟠', info: 'ℹ️', success: '✅' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-msg">${msg}</div>
        <div class="toast-time">${new Date().toLocaleTimeString()}</div>
      </div>
      <button class="toast-dismiss" onclick="this.parentElement.remove()">✕</button>
    `;

    toast.addEventListener('click', (e) => {
      if (!e.target.classList.contains('toast-dismiss')) removeToast(toast);
    });
    container.prepend(toast);

    // Limitar a 5 toasts visibles
    const all = container.querySelectorAll('.toast');
    if (all.length > 5) all[all.length - 1].remove();

    if (duration > 0) setTimeout(() => removeToast(toast), duration);
  }

  function removeToast(toast) {
    if (!toast.isConnected) return;
    toast.classList.add('exiting');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }

  /* ---- Status bar ---- */
  function showStatus(msg, state = 'ok') {
    const el = document.getElementById('statusText');
    if (el) el.textContent = msg;
  }

  /* ---- Banner crítico (top, rojo pulsante) ---- */
  function showCriticalBanner(event) {
    const banner = document.getElementById('alertBanner');
    if (!banner) return;
    const mag   = event.magnitude?.toFixed(1) || '?';
    const depth = event.depth ? ` · Depth: ${event.depth} km` : '';
    const tsun  = event.tsunami ? ' 🌊 TSUNAMI WARNING' : '';

    banner.innerHTML = `
      <span class="alert-icon">🚨</span>
      <div class="alert-text">
        <strong>MAJOR EARTHQUAKE M${mag}</strong>${tsun} — ${event.place || 'Location pending'}${depth}
      </div>
      <span class="alert-age" id="bannerAge"></span>
      <button class="alert-close" onclick="this.parentElement.classList.add('hidden')">✕</button>
    `;
    banner.classList.remove('hidden');

    // Actualizar tiempo transcurrido en el banner
    const ageEl = document.getElementById('bannerAge');
    const updateAge = () => {
      if (ageEl && event.time) ageEl.textContent = GeoAlert.DateUtils?.timeAgo(event.time) || '';
    };
    updateAge();
    const ageTimer = setInterval(updateAge, 10000);

    // Auto-ocultar después de 2 minutos
    setTimeout(() => {
      banner.classList.add('hidden');
      clearInterval(ageTimer);
    }, 120000);
  }

  /* ---- Escuchar eventos nuevos críticos desde State ---- */
  GeoAlert.State.on('events:new', (newEvents) => {
    const critical = newEvents.filter(e => (e.magnitude || 0) >= GeoAlert.CONFIG.THRESHOLDS.criticalMag);
    if (critical.length > 0) showCriticalBanner(critical[0]);
  });

  return { showToast, showStatus, showCriticalBanner };

})();
