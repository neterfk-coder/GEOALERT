/* ============================================================
   GEOALERT — js/ui/filters.js
   Lógica de filtros interactivos en tiempo real
   ============================================================ */

GeoAlert.FiltersUI = (function () {

  function init() {
    // Slider de magnitud
    const magSlider = document.getElementById('magFilter');
    const magLabel  = document.getElementById('magLabel');
    magSlider?.addEventListener('input', () => {
      const val = parseFloat(magSlider.value);
      if (magLabel) magLabel.textContent = val.toFixed(1);
    });

    // Filtro de tiempo
    document.getElementById('timeFilter')?.addEventListener('change', (e) => {
      GeoAlert.State.setFilter('hours', parseInt(e.target.value));
      GeoAlert.Cache.clear();
      GeoAlert.DataScheduler.fetchAll();
    });

    // Chips de tipo
    document.getElementById('typeFilters')?.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      chip.classList.toggle('active');
      const activeTypes = Array.from(document.querySelectorAll('.chip.active'))
        .map(c => c.dataset.type);
      GeoAlert.State.setFilter('types', activeTypes);
    });

    // Aplicar filtros
    document.getElementById('applyFilters')?.addEventListener('click', () => {
      const mag = parseFloat(document.getElementById('magFilter')?.value || 3);
      GeoAlert.State.setFilter('minMag', mag);
      GeoAlert.Cache.clear();
      GeoAlert.DataScheduler.fetchAll();
    });
  }

  return { init };

})();
