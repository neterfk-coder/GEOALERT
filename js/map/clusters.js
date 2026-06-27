/* ============================================================
   GEOALERT — js/map/clusters.js
   Configuración avanzada de clusters de marcadores
   (La lógica principal está en layers.js; aquí van helpers extra)
   ============================================================ */

GeoAlert.Clusters = (function () {

  // Calcula radio de cluster dinámico según zoom
  function dynamicRadius(zoom) {
    if (zoom >= 10) return 20;
    if (zoom >= 7)  return 40;
    if (zoom >= 5)  return 60;
    return 80;
  }

  // Color de cluster según máxima magnitud del grupo
  function clusterColor(maxMag) {
    if (maxMag >= 6.5) return '#B91C1C';
    if (maxMag >= 5.0) return '#EF4444';
    if (maxMag >= 3.0) return '#FB923C';
    return '#FDE68A';
  }

  return { dynamicRadius, clusterColor };

})();
