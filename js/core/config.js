/* ============================================================
   GEOALERT — js/core/config.js
   Configuración global: endpoints, intervalos, constantes
   ============================================================ */

window.GeoAlert = window.GeoAlert || {};

GeoAlert.CONFIG = {

  /* ---- APIS ---- */
  API: {
    USGS_BASE:    'https://earthquake.usgs.gov/fdsnws/event/1/query',
    USGS_FEED:    'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary',
    GDACS_RSS:    'https://www.gdacs.org/xml/rss.xml',
    NOAA_BASE:    'https://www.tsunami.gov/events/xml/PHEBtsunamiEvent.xml',
    NOMINATIM:    'https://nominatim.openstreetmap.org/search',
    GIBS_BASE:    'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best',
    FIRMS_KEY:    window._ENV?.FIRMS_KEY || 'DEMO_KEY',

    // Sentinel Hub — imágenes cada 5 días, gratis con registro
    // Regístrate en: https://www.sentinel-hub.com
    SENTINEL_INSTANCE: window._ENV?.SENTINEL_INSTANCE || '',
  },

  /* ---- TILES DE MAPA ---- */
  TILES: {
    dark: {
      url:         'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://carto.com">CartoDB</a> &copy; <a href="https://openstreetmap.org">OSM</a>',
      maxZoom: 19, type: 'base',
    },
    satellite: {
      url:         'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; <a href="https://www.esri.com">Esri</a> — 1-3 years old imagery',
      maxZoom: 19, type: 'base',
    },
    topo: {
      url:         'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
      maxZoom: 17, type: 'base',
    },
    streets: {
      url:         'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
      maxZoom: 19, type: 'base',
    },

    /* ---- NASA GIBS — ~24h de retraso, gratis sin key ---- */
    nasa_terra: {
      url:         'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/{date}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg',
      attribution: '&copy; <a href="https://nasa.gov">NASA</a> GIBS · Terra MODIS ~24h',
      maxZoom: 9, type: 'nasa',
      label:       'NASA Terra MODIS (yesterday)',
      description: 'Terra satellite — true color, images from ~24h ago. Full global coverage daily.',
    },
    nasa_aqua: {
      url:         'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Aqua_CorrectedReflectance_TrueColor/default/{date}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg',
      attribution: '&copy; <a href="https://nasa.gov">NASA</a> GIBS · Aqua MODIS ~24h',
      maxZoom: 9, type: 'nasa',
      label:       'NASA Aqua MODIS (yesterday)',
      description: 'Aqua satellite — true color, passes at different time than Terra. ~24h ago.',
    },
    nasa_dust: {
      url:         'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_Bands367/default/{date}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg',
      attribution: '&copy; <a href="https://nasa.gov">NASA</a> GIBS · False color dust/smoke',
      maxZoom: 9, type: 'nasa',
      label:       'NASA Dust & volcanic ash',
      description: 'False color bands — highlights dust storms, volcanic ash clouds and wildfire smoke.',
    },
    nasa_fires: {
      url:         'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_Thermal_Anomalies_Day/default/{date}/GoogleMapsCompatible_Level8/{z}/{y}/{x}.png',
      attribution: '&copy; <a href="https://nasa.gov">NASA</a> FIRMS · Active fire hotspots',
      maxZoom: 8, type: 'nasa_overlay',
      label:       'NASA Active fires (today)',
      description: 'MODIS thermal anomalies — each dot is an active fire or heat source detected today.',
    },
    nasa_storms: {
      url:         'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/GOES-East_ABI_Band2_Red_Visible_1km/default/10m/{z}/{y}/{x}.png',
      attribution: '&copy; NOAA GOES-East · Updated every 10 min',
      maxZoom: 7, type: 'nasa_realtime',
      label:       'GOES-East storms (10 min)',
      description: 'Geostationary satellite GOES-East — cloud cover and storms over Americas, updated every 10 minutes.',
    },

    /* ---- SENTINEL-2 (ESA) — 10m resolución, cada 5 días, gratis con registro ---- */
    sentinel_true: {
      url:         'https://services.sentinel-hub.com/ogc/wmts/{instanceId}?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=TRUE_COLOR&STYLE=default&TILEMATRIXSET=PopularWebMercator256&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/jpeg',
      attribution: '&copy; <a href="https://sentinel-hub.com">Sentinel Hub</a> / ESA Copernicus · 5-day revisit · 10m resolution',
      maxZoom: 14, type: 'sentinel',
      label:       '🛰 Sentinel-2 True Color (5 days · 10m)',
      description: 'ESA Copernicus Sentinel-2 — true color at 10m resolution. Images from the last 5 days. Requires free Sentinel Hub account.',
      requiresKey: true,
    },
    sentinel_false: {
      url:         'https://services.sentinel-hub.com/ogc/wmts/{instanceId}?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=FALSE_COLOR&STYLE=default&TILEMATRIXSET=PopularWebMercator256&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/jpeg',
      attribution: '&copy; <a href="https://sentinel-hub.com">Sentinel Hub</a> / ESA Copernicus',
      maxZoom: 14, type: 'sentinel',
      label:       '🛰 Sentinel-2 Vegetation (false color)',
      description: 'Sentinel-2 false color — highlights vegetation (red), water (dark blue), bare soil. 5-day revisit.',
      requiresKey: true,
    },
    sentinel_swir: {
      url:         'https://services.sentinel-hub.com/ogc/wmts/{instanceId}?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=SWIR&STYLE=default&TILEMATRIXSET=PopularWebMercator256&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/jpeg',
      attribution: '&copy; <a href="https://sentinel-hub.com">Sentinel Hub</a> / ESA Copernicus',
      maxZoom: 14, type: 'sentinel',
      label:       '🛰 Sentinel-2 SWIR (fire & burn scars)',
      description: 'Short-wave infrared — reveals active fires, recent burn scars and geological features invisible to the naked eye.',
      requiresKey: true,
    },
  },

  /* ---- INTERVALOS DE ACTUALIZACIÓN ---- */
  REFRESH: {
    fast:        15  * 1000,        // significant + hour feed cada 15s
    full:        60  * 1000,        // histórico 24h + GDACS cada 60s
    earthquakes: 15  * 1000,        // alias para compatibilidad
    gdacs:       3   * 60 * 1000,
    noaa:        2   * 60 * 1000,
    nasaDate:    60  * 60 * 1000,
  },

  /* ---- MAPA ---- */
  MAP: { center: [20, 0], zoom: 3, minZoom: 2, maxZoom: 18 },

  /* ---- UMBRALES ---- */
  THRESHOLDS: { criticalMag: 6.5, warnMag: 5.0, minDisplay: 3.0 },

  /* ---- COLORES ---- */
  MAG_COLORS: {
    low:     { max: 3.0,      color: '#FDE68A' },
    medium:  { max: 5.0,      color: '#FB923C' },
    high:    { max: 6.5,      color: '#EF4444' },
    extreme: { max: Infinity, color: '#B91C1C' },
  },

  /* ---- TIPOS DE DESASTRE ---- */
  DISASTER_TYPES: {
    earthquake: { label: 'Earthquake',      icon: '🔴', color: '#EF4444' },
    tsunami:    { label: 'Tsunami',         icon: '🌊', color: '#0EA5E9' },
    volcano:    { label: 'Volcanic eruption',icon: '🌋', color: '#F97316' },
    cyclone:    { label: 'Cyclone/Hurricane',icon: '🌀', color: '#8B5CF6' },
    flood:      { label: 'Flood',           icon: '💧', color: '#06B6D4' },
    wildfire:   { label: 'Wildfire',        icon: '🔥', color: '#DC2626' },
  },

  CACHE: { maxEvents: 2000, ttlSeconds: 15 },
};

console.log('[GeoAlert] Config loaded ✓');
