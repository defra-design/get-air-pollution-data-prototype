// Management Areas Map – Version 16
// Displays Air Quality Management Area (AQMA) polygons from GeoJSON

import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

(function () {
  const AQMA_GEOJSON_URL = '/version-16/data/air-quality-management-areas.geojson';
  const AQMA_SOURCE_ID   = 'aqma-polygons';
  const AQMA_FILL_LAYER  = 'aqma-fill';
  const AQMA_LINE_LAYER  = 'aqma-line';

  // --- Map initialisation ---
  const map = new maplibregl.Map({
    container: 'map-viewport',
    style: {
      version: 8,
      sources: {
        osm: {
          type: 'raster',
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '© OpenStreetMap contributors'
        }
      },
      layers: [{
        id: 'osm',
        type: 'raster',
        source: 'osm'
      }]
    },
    center: [-1.5, 52.5],
    zoom: 6,
    minZoom: 5,
    maxZoom: 16
  });

  window.AQMap = map;

  map.on('load', () => {
    // Restore position from sessionStorage (map switcher)
    const flyToRaw = sessionStorage.getItem('mapFlyTo');
    if (flyToRaw) {
      try {
        const { lat, lng, zoom } = JSON.parse(flyToRaw);
        map.jumpTo({ center: [lng, lat], zoom: zoom || 6 });
      } catch (e) {}
      sessionStorage.removeItem('mapFlyTo');
    }

    // Load and display AQMA polygons
    fetch(AQMA_GEOJSON_URL, { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (geojson) {
        map.addSource(AQMA_SOURCE_ID, { type: 'geojson', data: geojson });

        // Fill layer
        map.addLayer({
          id: AQMA_FILL_LAYER,
          type: 'fill',
          source: AQMA_SOURCE_ID,
          paint: {
            'fill-color': '#1d70b8',
            'fill-opacity': 0.2
          }
        });

        // Outline layer
        map.addLayer({
          id: AQMA_LINE_LAYER,
          type: 'line',
          source: AQMA_SOURCE_ID,
          paint: {
            'line-color': '#0b0c0c',
            'line-width': 1.5,
            'line-opacity': 0.8
          }
        });
      })
      .catch(function (e) { console.warn('AQMA GeoJSON unavailable', e); });
  });

  // --- Controls ---
  const zoomInBtn  = document.getElementById('zoomIn');
  const zoomOutBtn = document.getElementById('zoomOut');
  const exitBtn    = document.getElementById('exit-map');
  const panelCloseBtn = document.getElementById('panel-close');
  const menuButton = document.getElementById('menu-button');
  const floatingPanel = document.getElementById('floating-panel');

  if (zoomInBtn)  zoomInBtn.addEventListener('click',  () => map.zoomIn());
  if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => map.zoomOut());

  if (exitBtn) {
    exitBtn.addEventListener('click', () => { window.history.back(); });
  }

  if (panelCloseBtn) {
    panelCloseBtn.addEventListener('click', (e) => {
      e.preventDefault();
      floatingPanel.style.display = 'none';
      if (menuButton) menuButton.removeAttribute('hidden');
    });
  }

  if (menuButton) {
    menuButton.addEventListener('click', (e) => {
      e.preventDefault();
      floatingPanel.style.display = 'block';
      menuButton.setAttribute('hidden', '');
    });
  }

})();
