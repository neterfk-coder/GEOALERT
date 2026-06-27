/* ============================================================
   GEOALERT — js/utils/notifications.js
   API de notificaciones push del navegador
   ============================================================ */

GeoAlert.Notifications = (function () {
  let enabled = false;

  function init() {
    const btn = document.getElementById('notifToggle');
    btn?.addEventListener('click', toggle);
    // Restaurar preferencia
    enabled = localStorage.getItem('geoalert_notifs') === 'true';
    if (enabled && Notification.permission === 'granted') {
      btn.textContent = '🔔';
    }
  }

  async function toggle() {
    if (!('Notification' in window)) {
      GeoAlert.AlertsUI.showToast('Notificaciones', 'Tu navegador no soporta notificaciones.', 'warning');
      return;
    }
    if (enabled) {
      enabled = false;
      localStorage.setItem('geoalert_notifs', 'false');
      document.getElementById('notifToggle').textContent = '🔕';
      GeoAlert.AlertsUI.showToast('Notificaciones', 'Notificaciones desactivadas.', 'info');
    } else {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        enabled = true;
        localStorage.setItem('geoalert_notifs', 'true');
        document.getElementById('notifToggle').textContent = '🔔';
        GeoAlert.AlertsUI.showToast('Notificaciones', 'Recibirás alertas de sismos importantes.', 'success');
      } else {
        GeoAlert.AlertsUI.showToast('Notificaciones', 'Permiso denegado.', 'warning');
      }
    }
  }

  function send(title, body, icon = 'assets/icons/earthquake.svg') {
    if (!enabled || Notification.permission !== 'granted') return;
    try {
      new Notification(title, { body, icon, tag: 'geoalert-event' });
    } catch (e) {
      console.warn('[Notifications] Error:', e);
    }
  }

  return { init, send };

})();
