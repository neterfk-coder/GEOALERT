/* ============================================================
   GEOALERT — js/core/config.js
   Configuración global: endpoints, intervalos, constantes
   ============================================================ */

window.GeoAlert = window.GeoAlert || {};

GeoAlert.CONFIG = {
  /* ---- APIS GRATUITAS ---- */
  API: {
    USGS_BASE: "https://earthquake.usgs.gov/fdsnws/event/1/query",
    USGS_FEED: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary",
    GDACS_RSS: "https://www.gdacs.org/xml/rss.xml",
    NOAA_BASE: "https://www.tsunami.gov/events/xml/PHEBtsunamiEvent.xml",
    OWM_BASE: "https://api.openweathermap.org/data/2.5",
    OWM_KEY: window._ENV?.OWM_KEY || "",
    NOMINATIM: "https://nominatim.openstreetmap.org/search",

    // NASA GIBS — imágenes satelitales con ~24h de antigüedad (gratuito, sin key)
    GIBS_BASE: "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best",
    // NASA FIRMS — incendios activos en tiempo real (gratuito)
    FIRMS_BASE: "https://firms.modaps.eosdis.nasa.gov/api/area/csv",
    FIRMS_KEY: window._ENV?.FIRMS_KEY || "DEMO_KEY",
  },

  /* ---- TILES DE MAPA ---- */
  TILES: {
    dark: {
      url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      attribution:
        '&copy; <a href="https://carto.com">CartoDB</a> &copy; <a href="https://openstreetmap.org">OSM</a>',
      maxZoom: 19,
      type: "base",
    },
    satellite: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: '&copy; <a href="https://www.esri.com">Esri</a>',
      maxZoom: 19,
      type: "base",
    },
    topo: {
      url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
      maxZoom: 17,
      type: "base",
    },
    streets: {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution:
        '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
      maxZoom: 19,
      type: "base",
    },
    // NASA GIBS — satélite real con ~24h de retraso
    nasa_terra: {
      url: "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/{date}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg",
      attribution:
        '&copy; <a href="https://nasa.gov">NASA</a> Worldview / GIBS · Imágenes Terra MODIS ~24h',
      maxZoom: 9,
      type: "nasa",
      label: "NASA Terra (ayer)",
      description: "Satélite Terra MODIS — color real, ~24h de retraso",
    },
    nasa_aqua: {
      url: "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Aqua_CorrectedReflectance_TrueColor/default/{date}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg",
      attribution:
        '&copy; <a href="https://nasa.gov">NASA</a> Worldview / GIBS · Imágenes Aqua MODIS ~24h',
      maxZoom: 9,
      type: "nasa",
      label: "NASA Aqua (ayer)",
      description: "Satélite Aqua MODIS — color real, ~24h de retraso",
    },
    nasa_fires: {
      url: "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_Thermal_Anomalies_Day/default/{date}/GoogleMapsCompatible_Level8/{z}/{y}/{x}.png",
      attribution:
        '&copy; <a href="https://nasa.gov">NASA</a> FIRMS · Incendios activos',
      maxZoom: 8,
      type: "nasa_overlay",
      label: "NASA Incendios activos",
      description: "Puntos de calor MODIS Terra — anomalías térmicas del día",
    },
    nasa_dust: {
      url: "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_Bands367/default/{date}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg",
      attribution:
        '&copy; <a href="https://nasa.gov">NASA</a> GIBS · Bandas falsas para polvo/humo',
      maxZoom: 9,
      type: "nasa",
      label: "NASA Polvo y humo",
      description: "Bandas falsas — detecta nubes de polvo, ceniza y humo",
    },
    nasa_storms: {
      url: "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/GOES-East_ABI_Band2_Red_Visible_1km/default/10m/{z}/{y}/{x}.png",
      attribution:
        '&copy; <a href="https://nasa.gov">NASA</a> / NOAA GOES-East · Actualización cada 10 min',
      maxZoom: 7,
      type: "nasa_realtime",
      label: "GOES-East (cada 10 min)",
      description:
        "Satélite geoestacionario GOES-East — nubes y tormentas en cuasi tiempo real",
    },
  },

  /* ---- ACTUALIZACIÓN AUTOMÁTICA ---- */
  REFRESH: {
    earthquakes: 30 * 1000,
    gdacs: 5 * 60 * 1000,
    noaa: 2 * 60 * 1000,
    nasaDate: 60 * 60 * 1000, // recalcular fecha NASA cada hora
  },

  /* ---- MAPA ---- */
  MAP: {
    center: [20, 0],
    zoom: 3,
    minZoom: 2,
    maxZoom: 18,
  },

  /* ---- UMBRALES DE ALERTA ---- */
  THRESHOLDS: {
    criticalMag: 6.5,
    warnMag: 5.0,
    minDisplay: 3.0,
  },

  /* ---- ESCALA DE COLORES POR MAGNITUD ---- */
  MAG_COLORS: {
    low: { max: 3.0, color: "#FDE68A" },
    medium: { max: 5.0, color: "#FB923C" },
    high: { max: 6.5, color: "#EF4444" },
    extreme: { max: Infinity, color: "#B91C1C" },
  },

  /* ---- TIPOS DE DESASTRE ---- */
  DISASTER_TYPES: {
    earthquake: { label: "Terremoto/Sismo", icon: "🔴", color: "#EF4444" },
    tsunami: { label: "Tsunami", icon: "🌊", color: "#0EA5E9" },
    volcano: { label: "Erupción volcánica", icon: "🌋", color: "#F97316" },
    cyclone: { label: "Ciclón/Huracán", icon: "🌀", color: "#8B5CF6" },
    flood: { label: "Inundación", icon: "💧", color: "#06B6D4" },
    wildfire: { label: "Incendio forestal", icon: "🔥", color: "#DC2626" },
  },

  /* ---- CACHE ---- */
  CACHE: {
    maxEvents: 1000,
    ttlSeconds: 60,
  },
};

console.log("[GeoAlert] Config cargada ✓");
