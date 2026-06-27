/* ============================================================
   GEOALERT — js/utils/exportUtils.js
   Exportar datos a CSV y JSON
   ============================================================ */

GeoAlert.ExportUtils = (function () {

  function toCSV(events) {
    if (!events || !events.length) {
      GeoAlert.AlertsUI.showToast('Exportar', 'No hay eventos para exportar.', 'warning');
      return;
    }
    const headers = ['ID','Tipo','Lugar','Magnitud','Profundidad(km)','Latitud','Longitud','Tiempo UTC','Alerta','Tsunami'];
    const D = GeoAlert.DateUtils;
    const rows = events.map(e => [
      e.id, e.type, `"${(e.place||'').replace(/"/g,'""')}"`,
      e.magnitude ?? '', e.depth ?? '', e.lat ?? '', e.lng ?? '',
      D.formatFull(e.time), e.alert || '', e.tsunami ? 'Sí' : 'No',
    ].join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    download(csv, `geoalert_${Date.now()}.csv`, 'text/csv');
    GeoAlert.AlertsUI.showToast('Exportar', `${events.length} eventos exportados a CSV.`, 'success');
  }

  function singleToJSON(event) {
    if (!event) return;
    const json = JSON.stringify(event, null, 2);
    download(json, `evento_${event.id}.json`, 'application/json');
  }

  function download(content, filename, mime) {
    const blob = new Blob([content], { type: mime });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return { toCSV, singleToJSON };

})();
