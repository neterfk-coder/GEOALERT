/* ============================================================
   GEOALERT — js/utils/colorScale.js
   Escala de colores para magnitudes e intensidades
   ============================================================ */

GeoAlert.ColorScale = (function () {

  const SCALE = [
    { min: 0,   max: 1,   color: '#94A3B8', label: 'Micro' },
    { min: 1,   max: 2,   color: '#BAE6FD', label: 'Menor' },
    { min: 2,   max: 3,   color: '#6EE7B7', label: 'Pequeño' },
    { min: 3,   max: 4,   color: '#FDE68A', label: 'Ligero' },
    { min: 4,   max: 5,   color: '#FCD34D', label: 'Moderado' },
    { min: 5,   max: 6,   color: '#FB923C', label: 'Fuerte' },
    { min: 6,   max: 7,   color: '#EF4444', label: 'Muy fuerte' },
    { min: 7,   max: 8,   color: '#DC2626', label: 'Grande' },
    { min: 8,   max: 9,   color: '#B91C1C', label: 'Enorme' },
    { min: 9,   max: 10,  color: '#7F1D1D', label: 'Épico' },
  ];

  function getColor(magnitude) {
    const entry = SCALE.find(s => magnitude >= s.min && magnitude < s.max);
    return entry ? entry.color : '#7F1D1D';
  }

  function getLabel(magnitude) {
    const entry = SCALE.find(s => magnitude >= s.min && magnitude < s.max);
    return entry ? entry.label : 'Extremo';
  }

  function getRadius(magnitude) {
    return Math.max(8, Math.min(40, magnitude * 5));
  }

  return { SCALE, getColor, getLabel, getRadius };

})();
