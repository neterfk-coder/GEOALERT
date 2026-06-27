/* ============================================================
   GEOALERT — js/map/layers.js
   Gestiona capas: clusters, heatmap, marcadores, círculos impacto
   ============================================================ */

GeoAlert.Layers = (function () {
  let clusterGroup = null;
  let heatLayer    = null;
  let rawGroup     = null;

  function init() {
    const map = GeoAlert.map;

    // Registrar listener de zoom para círculos de impacto
    GeoAlert.Markers.bindZoomListener(map);

    // Grupo de clusters
    clusterGroup = L.markerClusterGroup({
      chunkedLoading:    true,
      chunkInterval:     200,
      chunkDelay:        50,
      maxClusterRadius:  60,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      iconCreateFunction: function (cluster) {
        const count   = cluster.getChildCount();
        const markers = cluster.getAllChildMarkers();
        const maxMag  = markers.reduce((m, mk) => {
          const ev = GeoAlert.State.get('events').find(e => e.id === mk._eventId);
          return Math.max(m, ev?.magnitude || 0);
        }, 0);
        const cls   = count < 10 ? 'small' : count < 50 ? 'medium' : 'large';
        const color = GeoAlert.Markers.getMagColor(maxMag);
        return L.divIcon({
          html: `<div style="background:${color};width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;color:#fff;border:2px solid rgba(255,255,255,.3);box-shadow:0 0 0 3px ${color}55"><span>${count}</span></div>`,
          className: `marker-cluster marker-cluster-${cls}`,
          iconSize: [42, 42],
        });
      }
    });

    // Grupo plano (sin clusters)
    rawGroup = L.featureGroup();

    // Capa de calor
    heatLayer = L.heatLayer([], {
      radius:  28,
      blur:    22,
      maxZoom: 10,
      gradient: { 0.2: '#3B82F6', 0.5: '#FB923C', 0.8: '#EF4444', 1.0: '#B91C1C' },
    });

    // Default: clusters activos
    map.addLayer(clusterGroup);

    // Botones
    document.getElementById('btnClusters')?.addEventListener('click', toggleClusters);
    document.getElementById('btnHeatmap')?.addEventListener('click', toggleHeatmap);

    // Reaccionar a eventos filtrados
    GeoAlert.State.on('filtered:updated', renderEvents);

    console.log('[Layers] Capas inicializadas ✓');
  }

  function renderEvents(events) {
    clearAll();
    const points = [];

    events.forEach(event => {
      if (event.lat == null || event.lng == null) return;

      const marker = GeoAlert.Markers.createMarker(event);
      if (!marker) return;

      const mapState = GeoAlert.State.get('map');
      if (mapState.clustersOn) {
        clusterGroup.addLayer(marker);
      } else {
        rawGroup.addLayer(marker);
      }

      const intensity = Math.min(1, (event.magnitude || 1) / 9);
      points.push([event.lat, event.lng, intensity]);
    });

    heatLayer.setLatLngs(points);

    const map    = GeoAlert.map;
    const mapSt  = GeoAlert.State.get('map');
    if (mapSt.clustersOn) {
      if (!map.hasLayer(clusterGroup)) map.addLayer(clusterGroup);
    } else {
      if (!map.hasLayer(rawGroup)) map.addLayer(rawGroup);
    }
  }

  function clearAll() {
    // Eliminar también los círculos de impacto de cada marcador
    const removeCircles = (group) => {
      group.eachLayer(marker => {
        if (marker._impactCircles) {
          marker._impactCircles.forEach(c => c.remove());
        }
      });
    };
    removeCircles(clusterGroup);
    removeCircles(rawGroup);
    clusterGroup.clearLayers();
    rawGroup.clearLayers();
  }

  function toggleClusters() {
    const map    = GeoAlert.map;
    const state  = GeoAlert.State.get('map');
    const newVal = !state.clustersOn;
    GeoAlert.State.set('map', { clustersOn: newVal });

    if (newVal) {
      map.removeLayer(rawGroup);
      map.addLayer(clusterGroup);
      document.getElementById('btnClusters')?.classList.add('active');
    } else {
      map.removeLayer(clusterGroup);
      map.addLayer(rawGroup);
      document.getElementById('btnClusters')?.classList.remove('active');
    }
    renderEvents(GeoAlert.State.get('filtered'));
  }

  function toggleHeatmap() {
    const map    = GeoAlert.map;
    const state  = GeoAlert.State.get('map');
    const newVal = !state.heatmapOn;
    GeoAlert.State.set('map', { heatmapOn: newVal });

    if (newVal) {
      map.addLayer(heatLayer);
      document.getElementById('btnHeatmap')?.classList.add('active');
    } else {
      map.removeLayer(heatLayer);
      document.getElementById('btnHeatmap')?.classList.remove('active');
    }
  }

  function focusEvent(event) {
    if (event?.lat == null || event?.lng == null) return;
    const zoom = event.magnitude >= 6.5 ? 6 : event.magnitude >= 5 ? 7 : 9;
    GeoAlert.map.flyTo([event.lat, event.lng], zoom, { duration: 1.2 });
  }

  return { init, renderEvents, clearAll, toggleClusters, toggleHeatmap, focusEvent };

})();
