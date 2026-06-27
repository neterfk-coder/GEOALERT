# 🌍 GeoAlert — Desastres Naturales en Tiempo Real

Aplicación web para monitorear sismos, tsunamis, volcanes, ciclones e inundaciones
en tiempo real usando APIs públicas y gratuitas.

---

## ⚡ Inicio rápido

1. Descomprime el ZIP
2. Abre `index.html` en tu navegador (Chrome/Firefox recomendado)
3. ¡Listo! Los datos se cargan automáticamente desde USGS y GDACS

> Para funcionar completamente necesitas conexión a Internet.
> Para desarrollo local avanzado, usa un servidor local (ver abajo).

---

## 🗂️ Estructura del proyecto

```
geoalert-app/
├── index.html              ← Página principal
├── manifest.json           ← PWA (instalar como app)
├── sw.js                   ← Service Worker (offline)
├── css/                    ← Estilos por componente
├── js/
│   ├── core/               ← Configuración, estado global, router
│   ├── api/                ← Conexión con APIs de datos
│   ├── map/                ← Mapa Leaflet y marcadores
│   ├── ui/                 ← Interfaz: sidebar, modal, filtros
│   ├── utils/              ← Fechas, colores, exportación
│   └── workers/            ← Web Workers para procesamiento
├── data/                   ← JSONs estáticos de referencia
└── assets/                 ← Íconos, fuentes, imágenes
```

---

## 🛰️ APIs utilizadas (todas gratuitas, sin key necesaria)

| API | Datos | Frecuencia |
|-----|-------|-----------|
| USGS GeoJSON | Terremotos globales | Cada 30s |
| GDACS RSS | Tsunamis, volcanes, ciclones, inundaciones | Cada 5 min |
| NOAA Tsunami | Alertas oficiales de tsunami | Cada 2 min |
| Nominatim (OSM) | Geocoding para búsqueda | Por demanda |

---

## 🛠️ Servidor local (recomendado para desarrollo)

```bash
# Python 3
python -m http.server 8080

# Node.js (npx)
npx serve .

# VS Code: instalar extensión "Live Server"
```

Luego abre: http://localhost:8080

---

## ✨ Características

- 🗺️ Mapa mundial interactivo con CartoDB/OSM/Satélite/Topográfico
- 🔴 Marcadores escalados por magnitud
- 🌡️ Capa de calor por densidad de eventos
- 📦 Agrupación automática (clusters) de eventos cercanos
- 🔔 Notificaciones push del navegador para sismos críticos
- 🌙 Modo oscuro / claro con persistencia
- 📱 Diseño responsive (móvil, tablet, desktop)
- 💾 Funciona offline gracias al Service Worker (PWA)
- ⬇️ Exportar datos a CSV o JSON
- 🔍 Búsqueda de lugares con geocoding gratuito

---

## 🚀 Para soportar muchos usuarios (despliegue en producción)

Opciones gratuitas recomendadas:
- **GitHub Pages** — Arrastra la carpeta, activa Pages en Settings
- **Netlify** — Arrastra la carpeta en netlify.com/drop
- **Vercel** — `vercel deploy` desde la carpeta del proyecto
- **Cloudflare Pages** — Conecta tu repositorio

La app es 100% frontend (HTML + CSS + JS). No necesita servidor backend.
Las APIs de datos se consumen directamente desde el navegador.

---

## 📋 Requisitos

- Navegador moderno: Chrome 90+, Firefox 88+, Edge 90+, Safari 14+
- Conexión a Internet para datos en tiempo real
- Sin instalación, sin dependencias, sin compilación

---

## 🔧 Personalización

Edita `js/core/config.js` para:
- Cambiar el intervalo de actualización (`REFRESH`)
- Ajustar los umbrales de alerta (`THRESHOLDS`)
- Agregar nuevas fuentes de datos (`API`)

---

*Construido con Leaflet.js · USGS · GDACS · NOAA · OpenStreetMap*
