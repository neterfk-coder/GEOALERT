/* ============================================================
   GEOALERT — js/map/markers.js
   Marcadores con pulsos animados y anillos de impacto por zoom
   ============================================================ */

GeoAlert.Markers = (function () {

  /* ---- Helpers de escala ---- */
  function getMagClass(mag) {
    if (mag < 3.0) return 'low';
    if (mag < 5.0) return 'medium';
    if (mag < 6.5) return 'high';
    return 'extreme';
  }

  function getMagColor(mag) {
    if (mag < 3.0) return '#FDE68A';
    if (mag < 5.0) return '#FB923C';
    if (mag < 6.5) return '#EF4444';
    return '#B91C1C';
  }

  function getPulseColor(type, mag) {
    const colors = {
      earthquake: getMagColor(mag || 0),
      tsunami:    '#0EA5E9',
      volcano:    '#F97316',
      cyclone:    '#8B5CF6',
      flood:      '#06B6D4',
      wildfire:   '#DC2626',
    };
    return colors[type] || getMagColor(mag || 0);
  }

  function getMarkerSize(mag) {
    return Math.max(20, Math.min(48, Math.round(20 + (mag / 10) * 34)));
  }

  /* ---- Radios de impacto en km según magnitud / tipo ---- */
  function getImpactRadii(event) {
    const mag  = event.magnitude || 0;
    const type = event.type || 'earthquake';

    if (type === 'earthquake') {
      // Zona epicentral, área de daños moderados, área de sacudimiento
      const r1 = Math.pow(10, 0.5 * mag - 1.8) * 10;   // km — zona crítica
      const r2 = r1 * 2.8;                               // km — daños moderados
      const r3 = r1 * 6.0;                               // km — sacudimiento leve
      return [
        { km: Math.max(15,  Math.round(r1)), label: 'Zona crítica',      color: '#B91C1C', opacity: 0.25 },
        { km: Math.max(60,  Math.round(r2)), label: 'Daños moderados',   color: '#EF4444', opacity: 0.15 },
        { km: Math.max(150, Math.round(r3)), label: 'Sacudimiento leve', color: '#FB923C', opacity: 0.08 },
      ];
    }
    if (type === 'tsunami') {
      return [
        { km: 50,  label: 'Zona inundación',  color: '#0EA5E9', opacity: 0.28 },
        { km: 200, label: 'Alerta costera',   color: '#38BDF8', opacity: 0.15 },
        { km: 600, label: 'Vigilancia',       color: '#7DD3FC', opacity: 0.07 },
      ];
    }
    if (type === 'volcano') {
      return [
        { km: 10,  label: 'Zona de exclusión', color: '#F97316', opacity: 0.35 },
        { km: 50,  label: 'Lluvia de ceniza',  color: '#FB923C', opacity: 0.18 },
        { km: 150, label: 'Afectación leve',   color: '#FCD34D', opacity: 0.09 },
      ];
    }
    if (type === 'cyclone') {
      const r = mag ? mag * 15 : 100;
      return [
        { km: Math.round(r * 0.4), label: 'Ojo (vientos max)', color: '#7C3AED', opacity: 0.35 },
        { km: Math.round(r * 1.0), label: 'Vientos huracanados', color: '#8B5CF6', opacity: 0.18 },
        { km: Math.round(r * 2.2), label: 'Vientos destructivos', color: '#A78BFA', opacity: 0.09 },
      ];
    }
    if (type === 'flood') {
      return [
        { km: 20,  label: 'Inundación grave', color: '#0891B2', opacity: 0.30 },
        { km: 80,  label: 'Inundación parcial', color: '#06B6D4', opacity: 0.15 },
        { km: 200, label: 'Alerta preventiva', color: '#67E8F9', opacity: 0.08 },
      ];
    }
    // Genérico
    return [
      { km: 50,  label: 'Zona de impacto', color: '#EF4444', opacity: 0.22 },
      { km: 150, label: 'Área afectada',   color: '#FB923C', opacity: 0.12 },
    ];
  }

  /* ---- Icono con pulso animado ---- */
  function createEarthquakeIcon(event) {
    const mag   = event.magnitude || 0;
    const cls   = getMagClass(mag);
    const color = getMagColor(mag);
    const size  = getMarkerSize(mag);
    const label = mag.toFixed(1);
    const pulses = mag >= 6.5 ? 3 : mag >= 5.0 ? 2 : 1;
    const speed  = mag >= 6.5 ? '1.2s' : mag >= 5.0 ? '1.8s' : '2.5s';

    // Generar anillos de pulso
    let pulseRings = '';
    for (let i = 0; i < pulses; i++) {
      const delay = (i * (parseFloat(speed) / pulses)).toFixed(2) + 's';
      pulseRings += `<div class="pulse-ring pulse-ring-${cls}" style="animation-delay:${delay};animation-duration:${speed};border-color:${color}"></div>`;
    }

    return L.divIcon({
      className: '',
      html: `
        <div class="marker-pulse-wrapper" style="width:${size + 40}px;height:${size + 40}px">
          ${pulseRings}
          <div class="custom-marker mag-${cls}" style="
            width:${size}px;height:${size}px;
            background:${color};
            font-size:${Math.max(9, size / 3.5)}px;
            position:absolute;
            top:50%;left:50%;
            transform:translate(-50%,-50%);
          ">${label}</div>
        </div>`,
      iconSize:    [size + 40, size + 40],
      iconAnchor:  [(size + 40) / 2, (size + 40) / 2],
      popupAnchor: [0, -((size + 40) / 2)],
    });
  }

  function createDisasterIcon(event) {
    const type  = event.type;
    const t     = GeoAlert.CONFIG.DISASTER_TYPES[type] || GeoAlert.CONFIG.DISASTER_TYPES.earthquake;
    const color = t.color;
    const speed = type === 'tsunami' ? '1.4s' : type === 'volcano' ? '1.0s' : '2.0s';

    return L.divIcon({
      className: '',
      html: `
        <div class="marker-pulse-wrapper" style="width:76px;height:76px">
          <div class="pulse-ring pulse-ring-disaster" style="animation-duration:${speed};border-color:${color}"></div>
          <div class="pulse-ring pulse-ring-disaster" style="animation-duration:${speed};animation-delay:${parseFloat(speed) / 2}s;border-color:${color}"></div>
          <div class="custom-marker marker-${type}" style="
            width:40px;height:40px;
            background:${color};
            font-size:22px;
            position:absolute;
            top:50%;left:50%;
            transform:translate(-50%,-50%);
          ">${t.icon}</div>
        </div>`,
      iconSize:    [76, 76],
      iconAnchor:  [38, 38],
      popupAnchor: [0, -40],
    });
  }

  /* ---- HTML del popup ---- */
  function buildPopupHTML(event) {
    const D        = GeoAlert.DateUtils;
    const mag      = (event.magnitude || 0).toFixed(1);
    const magColor = getMagColor(event.magnitude || 0);
    const typeInfo = GeoAlert.CONFIG.DISASTER_TYPES[event.type] || GeoAlert.CONFIG.DISASTER_TYPES.earthquake;
    const radii    = getImpactRadii(event);

    const impactRows = radii.map(r =>
      `<div class="popup-impact-row">
        <span class="popup-impact-dot" style="background:${r.color}"></span>
        <span class="popup-impact-label">${r.label}</span>
        <span class="popup-impact-km">${r.km.toLocaleString()} km</span>
       </div>`
    ).join('');

    return `
      <div class="event-popup">
        <div class="event-popup-header">
          <div class="event-popup-mag" style="color:${magColor}">
            ${event.type === 'earthquake' ? mag : typeInfo.icon}
          </div>
          <div class="event-popup-info">
            <h3>${event.place || 'Ubicación desconocida'}</h3>
            <span>${typeInfo.label} · ${D.timeAgo(event.time)}</span>
          </div>
        </div>
        <div class="event-popup-details">
          ${event.magnitude != null ? `
          <div class="popup-detail-item">
            <span class="popup-detail-label">Magnitud</span>
            <span class="popup-detail-value" style="color:${magColor}">${mag}</span>
          </div>` : ''}
          ${event.depth != null ? `
          <div class="popup-detail-item">
            <span class="popup-detail-label">Profundidad</span>
            <span class="popup-detail-value">${event.depth.toFixed(1)} km</span>
          </div>` : ''}
          ${event.lat != null ? `
          <div class="popup-detail-item">
            <span class="popup-detail-label">Coordenadas</span>
            <span class="popup-detail-value">${event.lat.toFixed(3)}, ${event.lng.toFixed(3)}</span>
          </div>` : ''}
          ${event.alert ? `
          <div class="popup-detail-item">
            <span class="popup-detail-label">Alerta</span>
            <span class="popup-detail-value">${event.alert.toUpperCase()}</span>
          </div>` : ''}
        </div>
        <div class="popup-impact-section">
          <div class="popup-impact-title">📐 Rangos de impacto estimados</div>
          ${impactRows}
        </div>
        <button class="popup-btn" onclick="GeoAlert.ModalUI.open('${event.id}')">Ver detalle completo →</button>
      </div>`;
  }

  /* ---- Crear marcador completo (icono + círculos de impacto) ---- */
  function createMarker(event) {
    if (event.lat == null || event.lng == null) return null;

    const icon = event.type === 'earthquake'
      ? createEarthquakeIcon(event)
      : createDisasterIcon(event);

    const marker = L.marker([event.lat, event.lng], { icon, zIndexOffset: Math.round((event.magnitude || 0) * 100) })
      .bindPopup(buildPopupHTML(event), { maxWidth: 300, className: 'geo-popup' });

    // Círculos de impacto (se añaden / quitan al hacer zoom)
    const impactCircles = createImpactCircles(event);

    marker.on('add', function (e) {
      impactCircles.forEach(c => c.addTo(e.target._map));
    });
    marker.on('remove', function () {
      impactCircles.forEach(c => c.remove());
    });
    marker.on('click', () => {
      GeoAlert.State.setActiveEvent(event);
      // Mostrar círculos al hacer clic
      impactCircles.forEach(c => { c._geoVisible = true; updateCircleVisibility(c, GeoAlert.map.getZoom()); });
    });

    marker._eventId     = event.id;
    marker._impactCircles = impactCircles;
    return marker;
  }

  /* ---- Círculos de impacto con Leaflet ---- */
  function createImpactCircles(event) {
    const radii  = getImpactRadii(event);
    const mag    = event.magnitude || 0;

    // Umbral de zoom: solo mostrar círculos cuando se acerca suficiente
    const zoomThreshold = mag >= 6.5 ? 4 : mag >= 5.0 ? 5 : 6;

    return radii.map((r, i) => {
      const circle = L.circle([event.lat, event.lng], {
        radius:      r.km * 1000,          // metros
        color:       r.color,
        fillColor:   r.color,
        fillOpacity: r.opacity,
        weight:      i === 0 ? 1.5 : 1,
        dashArray:   i === 0 ? null : '6 4',
        opacity:     r.opacity * 2.5,
        interactive: false,
        className:   'impact-circle',
      });

      circle._zoomThreshold = zoomThreshold - i;   // cada anillo aparece en distinto zoom
      circle._geoVisible    = false;

      // Tooltip con rango al pasar el ratón
      circle.bindTooltip(
        `<b>${r.label}</b><br>Radio: ${r.km.toLocaleString()} km`,
        { sticky: true, className: 'impact-tooltip', opacity: 0.92 }
      );

      return circle;
    });
  }

  /* ---- Mostrar / ocultar círculos según zoom ---- */
  function updateCircleVisibility(circle, zoom) {
    if (!circle._map) return;
    const show = zoom >= circle._zoomThreshold;
    circle.setStyle({ opacity: show ? circle.options.opacity : 0, fillOpacity: show ? circle.options.fillOpacity : 0 });
  }

  /* ---- Hook global: actualizar visibilidad al cambiar zoom ---- */
  function bindZoomListener(map) {
    map.on('zoomend', function () {
      const zoom = map.getZoom();
      map.eachLayer(function (layer) {
        if (layer._zoomThreshold !== undefined) {
          updateCircleVisibility(layer, zoom);
        }
      });
    });
  }

  return {
    createMarker,
    buildPopupHTML,
    getMagClass,
    getMagColor,
    getPulseColor,
    getMarkerSize,
    getImpactRadii,
    bindZoomListener,
    updateCircleVisibility,
  };

})();
