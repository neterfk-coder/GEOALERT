/* ============================================================
   GEOALERT — js/map/mapInit.js
   Inicializa el mapa Leaflet con capas base + NASA GIBS
   ============================================================ */

GeoAlert.MapInit = (function () {
  let map = null;
  let baseLayer = null; // capa base activa (carto, esri, osm…)
  let nasaLayer = null; // capa NASA GIBS activa
  let nasaOverlay = null; // overlay adicional (incendios encima de base)
  let nasaDateStr = ""; // fecha formateada para GIBS

  /* ---- Calcular fecha NASA (ayer UTC para asegurar disponibilidad) ---- */
  function getNasaDate(daysBack = 1) {
    const d = new Date(Date.now() - daysBack * 86400000);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  /* ---- Crear tile NASA GIBS con fecha en la URL ---- */
  function buildNasaTile(style) {
    const cfg = GeoAlert.CONFIG.TILES[style];
    if (!cfg) return null;
    const url = cfg.url.replace("{date}", nasaDateStr);
    return L.tileLayer(url, {
      attribution: cfg.attribution,
      maxZoom: cfg.maxZoom || 9,
      tileSize: 256,
      opacity: 0.92,
    });
  }

  function init() {
    const cfg = GeoAlert.CONFIG;
    nasaDateStr = getNasaDate(1);

    map = L.map("map", {
      center: cfg.MAP.center,
      zoom: cfg.MAP.zoom,
      minZoom: cfg.MAP.minZoom,
      maxZoom: cfg.MAP.maxZoom,
      zoomControl: true,
      attributionControl: true,
    });
    map.zoomControl.setPosition("bottomright");

    // Capa base inicial
    setBaseLayer("dark");

    // Exponer mapa globalmente
    GeoAlert.map = map;

    // Cambio de estilo desde el selector
    document.getElementById("mapStyle")?.addEventListener("change", (e) => {
      const val = e.target.value;
      GeoAlert.State.set("map", { style: val });
      applyStyle(val);
    });

    // Botón reset
    document.getElementById("btnReset")?.addEventListener("click", () => {
      map.setView(cfg.MAP.center, cfg.MAP.zoom);
    });

    // Botón fullscreen
    document.getElementById("btnFullscreen")?.addEventListener("click", () => {
      const el = document.getElementById("map");
      if (!document.fullscreenElement) {
        el.requestFullscreen?.() || el.webkitRequestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
    });

    // Actualizar fecha NASA cada hora
    setInterval(() => {
      nasaDateStr = getNasaDate(1);
      const currentStyle = GeoAlert.State.get("map").style;
      if (currentStyle?.startsWith("nasa")) applyStyle(currentStyle);
    }, GeoAlert.CONFIG.REFRESH.nasaDate);

    // Panel NASA
    buildNasaPanel();
    updateNasaDateBadge();

    console.log("[MapInit] Mapa inicializado ✓ · Fecha NASA:", nasaDateStr);
    return map;
  }

  /* ---- Aplica el estilo seleccionado ---- */
  function applyStyle(style) {
    const tileCfg = GeoAlert.CONFIG.TILES[style];
    if (!tileCfg) return;

    if (tileCfg.type === "base") {
      // Quitar capa NASA si había
      clearNasaLayers();
      setBaseLayer(style);
    } else if (tileCfg.type === "nasa") {
      // NASA reemplaza la capa base completamente
      clearNasaLayers();
      // Poner satélite Esri de fondo para zonas sin cobertura MODIS
      setBaseLayer("satellite");
      nasaLayer = buildNasaTile(style);
      if (nasaLayer) nasaLayer.addTo(map);
      showNasaInfo(tileCfg);
    } else if (tileCfg.type === "nasa_overlay") {
      // Incendios se ponen encima de la capa base actual sin reemplazarla
      if (nasaOverlay) map.removeLayer(nasaOverlay);
      nasaOverlay = buildNasaTile(style);
      if (nasaOverlay) nasaOverlay.addTo(map);
      showNasaInfo(tileCfg);
    } else if (tileCfg.type === "nasa_realtime") {
      // GOES-East reemplaza todo
      clearNasaLayers();
      nasaLayer = buildNasaTile(style);
      if (nasaLayer) nasaLayer.addTo(map);
      showNasaInfo(tileCfg);
    }

    updateNasaDateBadge();
  }

  function setBaseLayer(style) {
    const cfg = GeoAlert.CONFIG.TILES[style] || GeoAlert.CONFIG.TILES.dark;
    if (baseLayer) map.removeLayer(baseLayer);
    baseLayer = L.tileLayer(cfg.url, {
      attribution: cfg.attribution,
      maxZoom: cfg.maxZoom,
      subdomains: "abcd",
    }).addTo(map);
    // Base va siempre abajo
    baseLayer.setZIndex(1);
    if (nasaLayer) nasaLayer.setZIndex(2);
    if (nasaOverlay) nasaOverlay.setZIndex(3);
  }

  function clearNasaLayers() {
    if (nasaLayer) {
      map.removeLayer(nasaLayer);
      nasaLayer = null;
    }
    if (nasaOverlay) {
      map.removeLayer(nasaOverlay);
      nasaOverlay = null;
    }
    hideNasaInfo();
  }

  /* ---- Panel de info NASA (aparece al activar capa NASA) ---- */
  function buildNasaPanel() {
    const panel = document.createElement("div");
    panel.id = "nasaPanel";
    panel.className = "nasa-panel hidden";
    panel.innerHTML = `
      <div class="nasa-panel-header">
        <span class="nasa-logo">🛰</span>
        <div>
          <div class="nasa-panel-title">NASA Earthdata</div>
          <div class="nasa-panel-date" id="nasaDateLabel"></div>
        </div>
        <button class="nasa-panel-close" onclick="document.getElementById('nasaPanel').classList.add('hidden')">✕</button>
      </div>
      <div class="nasa-panel-desc" id="nasaDesc"></div>
      <div class="nasa-panel-links">
        <a href="https://worldview.earthdata.nasa.gov" target="_blank" rel="noopener">Ver en NASA Worldview →</a>
      </div>
    `;
    document.querySelector(".map-wrapper")?.appendChild(panel);
  }

  function showNasaInfo(tileCfg) {
    const panel = document.getElementById("nasaPanel");
    const desc = document.getElementById("nasaDesc");
    if (panel) panel.classList.remove("hidden");
    if (desc) desc.textContent = tileCfg.description || "";
    updateNasaDateBadge();
  }

  function hideNasaInfo() {
    document.getElementById("nasaPanel")?.classList.add("hidden");
  }

  function updateNasaDateBadge() {
    const el = document.getElementById("nasaDateLabel");
    if (el) el.textContent = `Imágenes: ${nasaDateStr} UTC`;
    // También actualizar badge en el selector si existe
    const badge = document.getElementById("nasaDateBadge");
    if (badge) badge.textContent = nasaDateStr;
  }

  function getMap() {
    return map;
  }
  function getNasaDate_() {
    return nasaDateStr;
  }
  function flyTo(lat, lng, zoom = 8) {
    map.flyTo([lat, lng], zoom, { duration: 1.2 });
  }

  return {
    init,
    getMap,
    flyTo,
    applyStyle,
    setBaseLayer,
    getNasaDate: getNasaDate_,
  };
})();
