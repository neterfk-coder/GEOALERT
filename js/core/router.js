/* ============================================================
   GEOALERT — js/core/router.js
   Navegación SPA sencilla basada en hash (#/vista)
   ============================================================ */

GeoAlert.Router = (function () {

  const routes = {
    '':      () => showView('map'),
    'map':   () => showView('map'),
    'list':  () => showView('list'),
    'stats': () => showView('stats'),
  };

  function showView(name) {
    // Aquí podrías cambiar paneles si expandes la app
    console.log('[Router] Vista:', name);
    GeoAlert.State.emit('route:changed', name);
  }

  function navigate(hash) {
    window.location.hash = hash;
  }

  function init() {
    function handle() {
      const hash = window.location.hash.replace('#/', '').toLowerCase();
      const fn = routes[hash] || routes[''];
      fn();
    }
    window.addEventListener('hashchange', handle);
    handle(); // ruta inicial
  }

  return { init, navigate };

})();
