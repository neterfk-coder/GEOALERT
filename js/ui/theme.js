/* ============================================================
   GEOALERT — js/ui/theme.js
   Toggle modo oscuro / claro con persistencia en localStorage
   ============================================================ */

GeoAlert.ThemeUI = (function () {

  function init() {
    const saved = localStorage.getItem('geoalert_theme') || 'dark';
    applyTheme(saved);

    document.getElementById('themeToggle')?.addEventListener('click', () => {
      const current = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
      const next    = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem('geoalert_theme', next);
    });
  }

  function applyTheme(theme) {
    const btn = document.getElementById('themeToggle');
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
      if (btn) btn.textContent = '🌙';
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
      if (btn) btn.textContent = '☀️';
    }
    GeoAlert.State?.set('ui', { theme });
  }

  return { init };

})();
