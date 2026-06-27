/* ============================================================
   GEOALERT — js/map/mapInit.js
   Mapa Leaflet con NASA GIBS + Sentinel-2 (ESA Copernicus)
   ============================================================ */

GeoAlert.MapInit = (function () {
  let map         = null;
  let baseLayer   = null;
  let nasaLayer   = null;
  let nasaOverlay = null;
  let nasaDateStr = '';

  function getNasaDate(daysBack = 1) {
    const d = new Date(Date.now() - daysBack * 86400000);
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`;
  }

  function buildNasaTile(style) {
    const cfg = GeoAlert.CONFIG.TILES[style];
    if (!cfg) return null;
    const url = cfg.url
      .replace('{date}', nasaDateStr)
      .replace('{instanceId}', GeoAlert.CONFIG.API.SENTINEL_INSTANCE || '');
    return L.tileLayer(url, {
      attribution: cfg.attribution,
      maxZoom:     cfg.maxZoom || 9,
      tileSize:    256,
      opacity:     0.93,
    });
  }

  function init() {
    nasaDateStr = getNasaDate(1);

    map = L.map('map', {
      center:    GeoAlert.CONFIG.MAP.center,
      zoom:      GeoAlert.CONFIG.MAP.zoom,
      minZoom:   GeoAlert.CONFIG.MAP.minZoom,
      maxZoom:   GeoAlert.CONFIG.MAP.maxZoom,
      zoomControl: true,
      attributionControl: true,
    });
    map.zoomControl.setPosition('bottomright');

    setBaseLayer('dark');
    GeoAlert.map = map;

    // Selector de estilo
    document.getElementById('mapStyle')?.addEventListener('change', (e) => {
      applyStyle(e.target.value);
      GeoAlert.State.set('map', { style: e.target.value });
    });

    document.getElementById('btnReset')?.addEventListener('click', () =>
      map.setView(GeoAlert.CONFIG.MAP.center, GeoAlert.CONFIG.MAP.zoom)
    );
    document.getElementById('btnFullscreen')?.addEventListener('click', () => {
      const el = document.getElementById('map');
      document.fullscreenElement ? document.exitFullscreen() : el.requestFullscreen?.();
    });

    // Recalcular fecha NASA cada hora
    setInterval(() => {
      nasaDateStr = getNasaDate(1);
      const st = GeoAlert.State.get('map').style;
      if (st?.startsWith('nasa') || st?.startsWith('sentinel')) applyStyle(st);
      updateNasaDateBadge();
    }, GeoAlert.CONFIG.REFRESH.nasaDate);

    buildNasaPanel();
    buildSentinelKeyModal();
    updateNasaDateBadge();

    GeoAlert.Markers.bindZoomListener(map);
    console.log('[MapInit] ✓ NASA date:', nasaDateStr);
    return map;
  }

  /* ---- Aplicar estilo ---- */
  function applyStyle(style) {
    const cfg = GeoAlert.CONFIG.TILES[style];
    if (!cfg) return;

    // Sentinel requiere key
    if (cfg.type === 'sentinel') {
      if (!GeoAlert.CONFIG.API.SENTINEL_INSTANCE) {
        showSentinelKeyModal(style);
        // Resetear selector al valor anterior
        document.getElementById('mapStyle').value = GeoAlert.State.get('map').style || 'dark';
        return;
      }
    }

    if (cfg.type === 'base') {
      clearNasaLayers();
      setBaseLayer(style);

    } else if (cfg.type === 'nasa') {
      clearNasaLayers();
      setBaseLayer('satellite');   // fondo Esri para zonas sin cobertura MODIS
      nasaLayer = buildNasaTile(style);
      nasaLayer?.addTo(map);
      showNasaInfo(cfg);

    } else if (cfg.type === 'nasa_overlay') {
      if (nasaOverlay) map.removeLayer(nasaOverlay);
      nasaOverlay = buildNasaTile(style);
      nasaOverlay?.addTo(map);
      showNasaInfo(cfg);

    } else if (cfg.type === 'nasa_realtime') {
      clearNasaLayers();
      nasaLayer = buildNasaTile(style);
      nasaLayer?.addTo(map);
      showNasaInfo(cfg);

    } else if (cfg.type === 'sentinel') {
      clearNasaLayers();
      setBaseLayer('dark');
      nasaLayer = buildNasaTile(style);
      nasaLayer?.addTo(map);
      showNasaInfo(cfg);
    }

    updateNasaDateBadge();
  }

  function setBaseLayer(style) {
    const cfg = GeoAlert.CONFIG.TILES[style] || GeoAlert.CONFIG.TILES.dark;
    if (baseLayer) map.removeLayer(baseLayer);
    baseLayer = L.tileLayer(cfg.url, {
      attribution: cfg.attribution,
      maxZoom:     cfg.maxZoom,
      subdomains:  'abcd',
    }).addTo(map);
    baseLayer.setZIndex(1);
    nasaLayer?.setZIndex(2);
    nasaOverlay?.setZIndex(3);
  }

  function clearNasaLayers() {
    if (nasaLayer)   { map.removeLayer(nasaLayer);   nasaLayer   = null; }
    if (nasaOverlay) { map.removeLayer(nasaOverlay); nasaOverlay = null; }
    document.getElementById('nasaPanel')?.classList.add('hidden');
  }

  /* ---- Panel de info de capa activa ---- */
  function buildNasaPanel() {
    if (document.getElementById('nasaPanel')) return;
    const p = document.createElement('div');
    p.id        = 'nasaPanel';
    p.className = 'nasa-panel hidden';
    p.innerHTML = `
      <div class="nasa-panel-header">
        <span class="nasa-logo">🛰</span>
        <div>
          <div class="nasa-panel-title" id="nasaPanelTitle">NASA Earthdata</div>
          <div class="nasa-panel-date" id="nasaDateLabel"></div>
        </div>
        <button class="nasa-panel-close" onclick="document.getElementById('nasaPanel').classList.add('hidden')">✕</button>
      </div>
      <div class="nasa-panel-desc" id="nasaDesc"></div>
      <div class="nasa-panel-links">
        <a href="https://worldview.earthdata.nasa.gov" target="_blank" rel="noopener">Open NASA Worldview →</a>
        &nbsp;·&nbsp;
        <a href="https://www.sentinel-hub.com/explore/eobrowser/" target="_blank" rel="noopener">Open EO Browser →</a>
      </div>
    `;
    document.querySelector('.map-wrapper')?.appendChild(p);
  }

  function showNasaInfo(tileCfg) {
    const p = document.getElementById('nasaPanel');
    if (p) p.classList.remove('hidden');
    const t = document.getElementById('nasaPanelTitle');
    if (t) t.textContent = tileCfg.label || 'Satellite imagery';
    const d = document.getElementById('nasaDesc');
    if (d) d.textContent = tileCfg.description || '';
    updateNasaDateBadge();
  }

  function updateNasaDateBadge() {
    const el = document.getElementById('nasaDateLabel');
    if (el) el.textContent = `Images: ${nasaDateStr} UTC`;
  }

  /* ---- Modal para introducir Sentinel Instance ID ---- */
  function buildSentinelKeyModal() {
    if (document.getElementById('sentinelModal')) return;
    const m = document.createElement('div');
    m.id        = 'sentinelModal';
    m.className = 'sentinel-modal hidden';
    m.innerHTML = `
      <div class="sentinel-modal-card">
        <div class="sentinel-modal-header">
          <span>🛰 Sentinel-2 Setup</span>
          <button onclick="document.getElementById('sentinelModal').classList.add('hidden')">✕</button>
        </div>
        <p class="sentinel-modal-desc">
          Sentinel-2 requires a free <strong>Sentinel Hub</strong> account.<br>
          Resolution: <strong>10 meters</strong> · Revisit: <strong>every 5 days</strong> · Cost: <strong>Free</strong>
        </p>
        <ol class="sentinel-modal-steps">
          <li>Go to <a href="https://www.sentinel-hub.com" target="_blank">sentinel-hub.com</a> and create a free account</li>
          <li>Create a new Configuration (any name)</li>
          <li>Copy the <strong>Instance ID</strong> from your dashboard</li>
          <li>Paste it below and click Save</li>
        </ol>
        <div class="sentinel-modal-input-row">
          <input type="text" id="sentinelInstanceInput" placeholder="e.g. a1b2c3d4-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
          <button onclick="GeoAlert.MapInit.saveSentinelKey()">Save & Apply</button>
        </div>
        <div id="sentinelModalMsg" class="sentinel-modal-msg"></div>
      </div>
    `;
    document.body.appendChild(m);
  }

  function showSentinelKeyModal(pendingStyle) {
    const m = document.getElementById('sentinelModal');
    if (m) {
      m.classList.remove('hidden');
      m._pendingStyle = pendingStyle;
    }
  }

  function saveSentinelKey() {
    const val = document.getElementById('sentinelInstanceInput')?.value?.trim();
    const msg = document.getElementById('sentinelModalMsg');
    if (!val || val.length < 10) {
      if (msg) msg.textContent = '⚠ Please enter a valid Instance ID.';
      return;
    }
    GeoAlert.CONFIG.API.SENTINEL_INSTANCE = val;
    localStorage.setItem('geoalert_sentinel_id', val);
    if (msg) { msg.style.color = '#3fb950'; msg.textContent = '✓ Saved! Loading imagery...'; }
    setTimeout(() => {
      const m = document.getElementById('sentinelModal');
      const pending = m?._pendingStyle;
      m?.classList.add('hidden');
      if (pending) {
        document.getElementById('mapStyle').value = pending;
        applyStyle(pending);
      }
    }, 800);
  }

  // Restaurar key guardada
  const savedKey = localStorage.getItem('geoalert_sentinel_id');
  if (savedKey) GeoAlert.CONFIG.API.SENTINEL_INSTANCE = savedKey;

  function getMap()  { return map; }
  function flyTo(lat, lng, zoom = 8) { map.flyTo([lat, lng], zoom, { duration: 1.2 }); }
  function getNasaDateStr() { return nasaDateStr; }

  return { init, getMap, flyTo, applyStyle, setBaseLayer, saveSentinelKey, getNasaDate: getNasaDateStr };

})();
