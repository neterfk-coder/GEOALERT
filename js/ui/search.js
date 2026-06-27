/* ============================================================
   GEOALERT — js/ui/search.js
   Búsqueda de lugares con Nominatim (OpenStreetMap, gratuito)
   ============================================================ */

GeoAlert.SearchUI = (function () {
  let debounceTimer = null;

  function init() {
    const input   = document.getElementById('searchInput');
    const results = document.getElementById('searchResults');
    if (!input) return;

    input.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      const q = input.value.trim();
      if (q.length < 3) { results?.classList.add('hidden'); return; }
      debounceTimer = setTimeout(() => search(q), 400);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { results?.classList.add('hidden'); input.value = ''; }
    });

    document.addEventListener('click', (e) => {
      if (!input.contains(e.target) && !results?.contains(e.target)) {
        results?.classList.add('hidden');
      }
    });
  }

  async function search(query) {
    const results = document.getElementById('searchResults');
    if (!results) return;
    results.innerHTML = `<div class="search-result-item"><div class="loading-spinner"></div> Buscando...</div>`;
    results.classList.remove('hidden');

    try {
      const url = `${GeoAlert.CONFIG.API.NOMINATIM}?q=${encodeURIComponent(query)}&format=json&limit=6&addressdetails=0`;
      const res  = await window.fetch(url, { headers: { 'Accept-Language': 'es' } });
      const data = await res.json();

      if (!data.length) {
        results.innerHTML = `<div class="search-result-item">Sin resultados para "${query}"</div>`;
        return;
      }

      results.innerHTML = data.map(r => `
        <div class="search-result-item" data-lat="${r.lat}" data-lng="${r.lon}">
          <span class="search-result-icon">📍</span>
          <div>
            <div class="search-result-name">${r.display_name.split(',')[0]}</div>
            <div class="search-result-detail">${r.display_name.split(',').slice(1,3).join(',').trim()}</div>
          </div>
        </div>
      `).join('');

      results.querySelectorAll('.search-result-item[data-lat]').forEach(item => {
        item.addEventListener('click', () => {
          const lat = parseFloat(item.dataset.lat);
          const lng = parseFloat(item.dataset.lng);
          GeoAlert.MapInit.flyTo(lat, lng, 9);
          results.classList.add('hidden');
          document.getElementById('searchInput').value = item.querySelector('.search-result-name')?.textContent || '';
        });
      });
    } catch (err) {
      results.innerHTML = `<div class="search-result-item">Error al buscar. Intenta de nuevo.</div>`;
    }
  }

  return { init };

})();
