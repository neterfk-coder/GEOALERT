/* ============================================================
   GEOALERT — js/ui/alerts.js
   Toasts, banners de alerta y estado de conexión
   ============================================================ */

GeoAlert.AlertsUI = (function () {

  function showToast(title, msg, type = 'info', duration = 6000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const icons = { critical: '🔴', warning: '⚠️', info: 'ℹ️', success: '✅' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-msg">${msg}</div>
        <div class="toast-time">${new Date().toLocaleTimeString()}</div>
      </div>
    `;

    toast.addEventListener('click', () => removeToast(toast));
    container.prepend(toast);

    if (duration > 0) {
      setTimeout(() => removeToast(toast), duration);
    }
  }

  function removeToast(toast) {
    toast.classList.add('exiting');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }

  function showStatus(msg, state = 'ok') {
    const el = document.getElementById('statusText');
    if (!el) return;
    const icons = { ok: '🟢', loading: '🟡', error: '🔴' };
    el.textContent = `${icons[state] || '⚪'} ${msg}`;
  }

  function showCriticalBanner(event) {
    const banner = document.getElementById('alertBanner');
    if (!banner) return;
    const mag  = event.magnitude?.toFixed(1) || '?';
    banner.innerHTML = `
      <span class="alert-icon">🚨</span>
      <span class="alert-text">SISMO FUERTE M${mag} — ${event.place || 'Localización en proceso'}</span>
      <button class="alert-close" onclick="this.parentElement.classList.add('hidden')">✕</button>
    `;
    banner.classList.remove('hidden');
    setTimeout(() => banner.classList.add('hidden'), 30000);
  }

  // Escuchar eventos críticos
  GeoAlert.State.on('events:new', (newEvents) => {
    const critical = newEvents.filter(e => (e.magnitude || 0) >= GeoAlert.CONFIG.THRESHOLDS.criticalMag);
    if (critical.length > 0) showCriticalBanner(critical[0]);
  });

  return { showToast, showStatus, showCriticalBanner };

})();
