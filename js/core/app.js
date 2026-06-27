/* ============================================================
   GEOALERT — js/core/app.js
   Punto de entrada: inicializa todos los módulos en orden
   ============================================================ */

document.addEventListener('DOMContentLoaded', async function () {
  console.log('[GeoAlert] Iniciando aplicación...');

  try {
    // 1. Inicializar mapa
    GeoAlert.MapInit.init();

    // 2. Inicializar capas
    GeoAlert.Layers.init();

    // 3. Inicializar UI
    GeoAlert.ThemeUI.init();
    GeoAlert.FiltersUI.init();
    GeoAlert.SidebarUI.init();
    GeoAlert.ModalUI.init();
    GeoAlert.AlertsUI.init();
    GeoAlert.StatsUI.init();
    GeoAlert.SearchUI.init();

    // 4. Inicializar notificaciones del navegador
    GeoAlert.Notifications.init();

    // 5. Primera carga de datos
    GeoAlert.AlertsUI.showStatus('Conectando con fuentes de datos...', 'loading');
    await GeoAlert.DataScheduler.fetchAll();

    // 6. Iniciar actualizaciones automáticas
    GeoAlert.DataScheduler.startAll();

    // 7. Registrar Service Worker (PWA)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js')
        .then(() => console.log('[GeoAlert] Service Worker registrado ✓'))
        .catch(err => console.warn('[GeoAlert] SW error:', err));
    }

    console.log('[GeoAlert] App iniciada correctamente ✓');

  } catch (err) {
    console.error('[GeoAlert] Error al iniciar:', err);
    GeoAlert.AlertsUI.showStatus('Error al conectar con datos sísmicos', 'error');
    GeoAlert.AlertsUI.showToast(
      'Error de conexión',
      'Algunos datos podrían no estar disponibles. Reintentando...',
      'critical'
    );
  }
});

// Escuchar cambios de visibilidad (tab inactivo → pausar; activo → reanudar)
document.addEventListener('visibilitychange', function () {
  if (document.hidden) {
    GeoAlert.DataScheduler.pauseAll();
    console.log('[GeoAlert] Tab inactivo — actualizaciones pausadas');
  } else {
    GeoAlert.DataScheduler.resumeAll();
    GeoAlert.DataScheduler.fetchAll(); // fetch inmediato al volver
    console.log('[GeoAlert] Tab activo — actualizaciones reanudadas');
  }
});

// Escuchar estado de red
window.addEventListener('online',  () => {
  GeoAlert.AlertsUI.showStatus('Conectado', 'ok');
  GeoAlert.DataScheduler.fetchAll();
  GeoAlert.AlertsUI.showToast('Conexión restaurada', 'Reanudando monitoreo en tiempo real.', 'success');
});
window.addEventListener('offline', () => {
  GeoAlert.AlertsUI.showStatus('Sin conexión a Internet', 'error');
  GeoAlert.AlertsUI.showToast('Sin conexión', 'Los datos pueden estar desactualizados.', 'warning');
});
