// app/assets/javascripts/version_11/air-quality-map.js
// Import MapLibre GL JS and CSS
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// ---------------------------
// Mock AURN station data
// ---------------------------// AURN station data - formatted with ordered pollutants and proper naming
const mockStations = [
  // --- LONDON & SE ---
  { id: 1,  name: "London Marylebone Road", lat: 51.5225, lng: -0.1545, authority: "Westminster City Council", pollutants: ["PM2.5","PM10","NO2","O3"], status: "active", daqi: 2, siteType: "Urban traffic", startDate: "1997-01-01" },
  { id: 2,  name: "London Bloomsbury", lat: 51.5225, lng: -0.1256, authority: "London Borough of Camden", pollutants: ["PM2.5","PM10","NO2","O3","SO2"], status: "active", daqi: 3, siteType: "Urban background", startDate: "1998-01-01" },
  { id: 3,  name: "London N. Kensington", lat: 51.5210, lng: -0.2130, authority: "Royal Borough of Kensington and Chelsea", pollutants: ["PM2.5","PM10","NO2","O3","SO2"], status: "active", daqi: 2, siteType: "Urban background", startDate: "1996-01-01" },
  { id: 4,  name: "London Bexley", lat: 51.456, lng: 0.148, authority: "London Borough of Bexley", pollutants: ["PM2.5","PM10","NO2","O3"], status: "active", daqi: 1, siteType: "Suburban", startDate: "1997-06-01" },
  { id: 5,  name: "London Eltham", lat: 51.450, lng: 0.070, authority: "Royal Borough of Greenwich", pollutants: ["PM10","NO2","O3"], status: "active", daqi: 4, siteType: "Suburban", startDate: "1996-08-01" },
  { id: 6,  name: "London Teddington", lat: 51.424, lng: -0.338, authority: "London Borough of Richmond upon Thames", pollutants: ["NO2","O3"], status: "closed", daqi: null, siteType: "Suburban", startDate: "1996-01-01", endDate: "2024-12-31" },
  { id: 7,  name: "London Haringey Roadside", lat: 51.592, lng: -0.099, authority: "London Borough of Haringey", pollutants: ["PM10","NO2"], status: "active", daqi: 2, siteType: "Urban traffic", startDate: "2009-05-01" },
  { id: 8,  name: "London Harlington", lat: 51.488, lng: -0.441, authority: "London Borough of Hillingdon", pollutants: ["PM2.5","PM10","NO2","O3"], status: "active", daqi: 3, siteType: "Suburban", startDate: "2004-01-01" },
  { id: 9,  name: "London Sir John Cass School", lat: 51.514, lng: -0.077, authority: "City of London Corporation", pollutants: ["PM10","NO2"], status: "closed", daqi: null, siteType: "Urban background", startDate: "1996-01-01", endDate: "2024-12-31" },
  { id: 10, name: "Gravesham", lat: 51.441, lng: 0.368, authority: "Gravesham Borough Council", pollutants: ["PM10","NO2","O3"], status: "active", daqi: 2, siteType: "Urban background", startDate: "1997-01-15" },
  { id: 11, name: "Rochester Stoke", lat: 51.431, lng: 0.640, authority: "Medway Council", pollutants: ["PM10","NO2","SO2"], status: "closed", daqi: null, siteType: "Industrial", startDate: "1996-02-01", endDate: "2024-12-31" },
  { id: 12, name: "Southampton Centre", lat: 50.909, lng: -1.404, authority: "Southampton City Council", pollutants: ["PM2.5","PM10","NO2","O3"], status: "active", daqi: 2, siteType: "Urban background", startDate: "2003-01-01" },
  { id: 13, name: "Portsmouth", lat: 50.805, lng: -1.090, authority: "Portsmouth City Council", pollutants: ["PM10","NO2","SO2"], status: "active", daqi: 3, siteType: "Urban background", startDate: "1999-01-01" },
  { id: 14, name: "Brighton Preston Park", lat: 50.842, lng: -0.146, authority: "Brighton and Hove City Council", pollutants: ["PM2.5","PM10","NO2","O3"], status: "active", daqi: 2, siteType: "Urban background", startDate: "2001-01-01" },
  { id: 15, name: "Crawley", lat: 51.111, lng: -0.189, authority: "Crawley Borough Council", pollutants: ["PM2.5","PM10","NO2"], status: "active", daqi: 2, siteType: "Urban background", startDate: "2002-01-01" },
  { id: 16, name: "Oxford St Ebbes", lat: 51.750, lng: -1.258, authority: "Oxford City Council", pollutants: ["PM2.5","PM10","NO2"], status: "active", daqi: 3, siteType: "Urban background", startDate: "1996-01-01" },
  { id: 17, name: "Reading New Town", lat: 51.454, lng: -0.959, authority: "Reading Borough Council", pollutants: ["PM2.5","PM10","NO2","O3"], status: "active", daqi: 2, siteType: "Urban background", startDate: "2003-01-01" },
  { id: 18, name: "Canterbury", lat: 51.280, lng: 1.079, authority: "Canterbury City Council", pollutants: ["PM10","NO2","O3"], status: "active", daqi: 1, siteType: "Urban background", startDate: "2000-06-01" },

  // --- MIDLANDS ---
  { id: 19, name: "Birmingham Tyburn", lat: 52.5099, lng: -1.8340, authority: "Birmingham City Council", pollutants: ["PM10","NO2","O3"], status: "active", daqi: 2, siteType: "Urban background", startDate: "2011-06-01" },
  { id: 20, name: "Birmingham Acocks Green", lat: 52.438, lng: -1.824, authority: "Birmingham City Council", pollutants: ["PM2.5","PM10","NO2","O3"], status: "active", daqi: 3, siteType: "Urban background", startDate: "2019-01-01" },
  { id: 21, name: "Coventry Allesley", lat: 52.425, lng: -1.544, authority: "Coventry City Council", pollutants: ["PM2.5","PM10","NO2","O3"], status: "active", daqi: 2, siteType: "Suburban", startDate: "2000-01-01" },
  { id: 22, name: "Nottingham Centre", lat: 52.954, lng: -1.150, authority: "Nottingham City Council", pollutants: ["PM2.5","PM10","NO2","O3","SO2"], status: "active", daqi: 3, siteType: "Urban centre", startDate: "1998-01-01" },
  { id: 23, name: "Leicester University Road", lat: 52.624, lng: -1.120, authority: "Leicester City Council", pollutants: ["PM2.5","PM10","NO2","O3"], status: "active", daqi: 2, siteType: "Urban background", startDate: "2000-01-01" },
  { id: 24, name: "Derby St Alkmund's Way", lat: 52.926, lng: -1.478, authority: "Derby City Council", pollutants: ["PM10","NO2"], status: "closed", daqi: null, siteType: "Urban traffic", startDate: "1996-01-01", endDate: "2024-12-31" },
  { id: 25, name: "Wolverhampton Centre", lat: 52.585, lng: -2.129, authority: "Wolverhampton City Council", pollutants: ["PM2.5","PM10","NO2"], status: "active", daqi: 4, siteType: "Urban background", startDate: "2001-05-01" },
  { id: 26, name: "Stoke-on-Trent", lat: 53.002, lng: -2.179, authority: "Stoke-on-Trent City Council", pollutants: ["PM10","NO2","O3"], status: "active", daqi: 2, siteType: "Urban background", startDate: "2004-01-01" },

  // --- NORTH WEST / YORKS & HUMBER ---
  { id: 27, name: "Manchester Piccadilly", lat: 53.4776, lng: -2.2374, authority: "Manchester City Council", pollutants: ["PM2.5","PM10","NO2"], status: "active", daqi: null, siteType: "Urban traffic", startDate: "2003-08-01" },
  { id: 28, name: "Salford Eccles", lat: 53.484, lng: -2.337, authority: "Salford City Council", pollutants: ["PM10","NO2","O3"], status: "active", daqi: 2, siteType: "Urban background", startDate: "2005-01-01" },
  { id: 29, name: "Liverpool Speke", lat: 53.340, lng: -2.855, authority: "Liverpool City Council", pollutants: ["PM2.5","PM10","NO2","O3","SO2"], status: "active", daqi: 3, siteType: "Suburban", startDate: "2000-01-01" },
  { id: 30, name: "Preston", lat: 53.763, lng: -2.704, authority: "Preston City Council", pollutants: ["PM2.5","PM10","NO2"], status: "active", daqi: 2, siteType: "Urban background", startDate: "2008-01-01" },
  { id: 31, name: "Blackpool Marton", lat: 53.798, lng: -3.026, authority: "Blackpool Council", pollutants: ["PM10","NO2","O3"], status: "active", daqi: 1, siteType: "Suburban", startDate: "1998-01-01" },
  { id: 32, name: "Warrington", lat: 53.392, lng: -2.580, authority: "Warrington Borough Council", pollutants: ["PM2.5","PM10","NO2"], status: "active", daqi: 2, siteType: "Urban background", startDate: "2001-01-01" },
  { id: 33, name: "Leeds Centre", lat: 53.8008, lng: -1.5491, authority: "Leeds City Council", pollutants: ["PM10","NO2"], status: "closed", daqi: null, siteType: "Urban centre", startDate: "1999-03-01", endDate: "2024-12-31" },
  { id: 34, name: "Sheffield Devonshire Green", lat: 53.378, lng: -1.477, authority: "Sheffield City Council", pollutants: ["PM2.5","PM10","NO2","O3"], status: "active", daqi: 2, siteType: "Urban background", startDate: "2011-01-01" },
  { id: 35, name: "York Bootham", lat: 53.964, lng: -1.091, authority: "City of York Council", pollutants: ["PM2.5","PM10","NO2","O3"], status: "active", daqi: 3, siteType: "Urban background", startDate: "2000-01-01" },
  { id: 36, name: "Rotherham", lat: 53.430, lng: -1.355, authority: "Rotherham Metropolitan Borough Council", pollutants: ["PM10","NO2"], status: "active", daqi: 1, siteType: "Urban background", startDate: "2000-01-01" },
  { id: 37, name: "Doncaster", lat: 53.5228, lng: -1.1285, authority: "Doncaster Metropolitan Borough Council", pollutants: ["PM2.5","PM10","NO2"], status: "active", daqi: 2, siteType: "Urban background", startDate: "2001-06-01" },
  { id: 38, name: "Hull Freetown", lat: 53.756, lng: -0.337, authority: "Kingston upon Hull City Council", pollutants: ["PM10","NO2"], status: "active", daqi: 3, siteType: "Urban background", startDate: "2009-10-01" },
  { id: 39, name: "Barnsley Gawber", lat: 53.565, lng: -1.503, authority: "Barnsley Metropolitan Borough Council", pollutants: ["PM10","NO2"], status: "closed", daqi: null, siteType: "Urban background", startDate: "1997-01-01", endDate: "2024-12-31" },

  // --- NORTH EAST ---
  { id: 40, name: "Newcastle Centre", lat: 54.9738, lng: -1.6131, authority: "Newcastle City Council", pollutants: ["PM10","NO2"], status: "active", daqi: 5, siteType: "Urban centre", startDate: "2002-03-01" },
  { id: 41, name: "Sunderland Centre", lat: 54.906, lng: -1.383, authority: "Sunderland City Council", pollutants: ["PM10","NO2","O3"], status: "active", daqi: 2, siteType: "Urban background", startDate: "2000-01-01" },
  { id: 42, name: "Middlesbrough", lat: 54.576, lng: -1.235, authority: "Middlesbrough Council", pollutants: ["PM10","NO2","SO2"], status: "closed", daqi: null, siteType: "Industrial", startDate: "1996-01-01", endDate: "2024-12-31" },
  { id: 43, name: "Stockton-on-Tees Eaglescliffe", lat: 54.528, lng: -1.350, authority: "Stockton-on-Tees Borough Council", pollutants: ["PM2.5","PM10","NO2"], status: "active", daqi: 2, siteType: "Suburban", startDate: "2013-01-01" },
  { id: 44, name: "Darlington", lat: 54.523, lng: -1.556, authority: "Darlington Borough Council", pollutants: ["PM10","NO2"], status: "active", daqi: 1, siteType: "Urban background", startDate: "2000-01-01" },

  // --- SCOTLAND ---
  { id: 45, name: "Glasgow Townhead", lat: 55.866, lng: -4.243, authority: "Glasgow City Council", pollutants: ["PM2.5","PM10","NO2","O3","SO2"], status: "active", daqi: 3, siteType: "Urban background", startDate: "1998-01-01" },
  { id: 46, name: "Glasgow Kerbside", lat: 55.860, lng: -4.251, authority: "Glasgow City Council", pollutants: ["PM2.5","PM10","NO2"], status: "closed", daqi: null, siteType: "Urban traffic", startDate: "2004-01-01", endDate: "2024-12-31" },
  { id: 47, name: "Edinburgh St Leonards", lat: 55.9456, lng: -3.1820, authority: "City of Edinburgh Council", pollutants: ["PM2.5","PM10","NO2"], status: "active", daqi: 2, siteType: "Urban background", startDate: "2005-01-01" },
  { id: 48, name: "Aberdeen", lat: 57.149, lng: -2.094, authority: "Aberdeen City Council", pollutants: ["PM2.5","PM10","NO2","O3"], status: "active", daqi: 3, siteType: "Urban background", startDate: "2000-01-01" },
  { id: 49, name: "Dundee", lat: 56.462, lng: -2.970, authority: "Dundee City Council", pollutants: ["PM10","NO2"], status: "active", daqi: 3, siteType: "Urban background", startDate: "2000-01-01" },
  { id: 50, name: "Inverness", lat: 57.477, lng: -4.224, authority: "Highland Council", pollutants: ["PM2.5","PM10","NO2","O3"], status: "active", daqi: 2, siteType: "Urban background", startDate: "2003-01-01" },
  { id: 51, name: "Paisley", lat: 55.846, lng: -4.423, authority: "Renfrewshire Council", pollutants: ["PM10","NO2"], status: "active", daqi: 1, siteType: "Urban background", startDate: "2001-01-01" },

  // --- WALES ---
  { id: 52, name: "Cardiff Centre", lat: 51.4816, lng: -3.1791, authority: "Cardiff Council", pollutants: ["PM10","NO2","O3"], status: "active", daqi: 3, siteType: "Urban centre", startDate: "2000-06-01" },
  { id: 53, name: "Swansea Morriston", lat: 51.663, lng: -3.934, authority: "Swansea Council", pollutants: ["PM10","NO2","O3","SO2"], status: "active", daqi: 2, siteType: "Urban background", startDate: "2001-01-01" },
  { id: 54, name: "Newport", lat: 51.586, lng: -2.998, authority: "Newport City Council", pollutants: ["PM2.5","PM10","NO2"], status: "active", daqi: 1, siteType: "Urban background", startDate: "2000-01-01" },
  { id: 55, name: "Wrexham", lat: 53.045, lng: -2.991, authority: "Wrexham County Borough Council", pollutants: ["PM10","NO2"], status: "active", daqi: 2, siteType: "Urban background", startDate: "2000-01-01" },
  { id: 56, name: "Port Talbot Margam", lat: 51.595, lng: -3.778, authority: "Neath Port Talbot Council", pollutants: ["PM10","NO2","SO2"], status: "active", daqi: 3, siteType: "Industrial", startDate: "2000-01-01" },

  // --- NORTHERN IRELAND ---
  { id: 57, name: "Belfast Centre", lat: 54.596, lng: -5.930, authority: "Belfast City Council", pollutants: ["PM2.5","PM10","NO2","O3","SO2"], status: "active", daqi: 2, siteType: "Urban background", startDate: "2003-01-01" },
  { id: 58, name: "Derry", lat: 54.997, lng: -7.321, authority: "Derry City and Strabane District Council", pollutants: ["PM2.5","PM10","NO2","O3"], status: "active", daqi: 3, siteType: "Urban background", startDate: "2004-01-01" },
  { id: 59, name: "Lisburn", lat: 54.516, lng: -6.058, authority: "Lisburn and Castlereagh City Council", pollutants: ["PM10","NO2"], status: "active", daqi: 3, siteType: "Urban background", startDate: "2000-01-01" },
  { id: 60, name: "Newry", lat: 54.175, lng: -6.339, authority: "Newry, Mourne and Down District Council", pollutants: ["PM10","NO2"], status: "active", daqi: 5, siteType: "Urban background", startDate: "2002-01-01" },

  // --- SOUTH WEST ---
  { id: 61, name: "Bristol St Paul's", lat: 51.4627, lng: -2.5843, authority: "Bristol City Council", pollutants: ["PM2.5","PM10","NO2","O3","SO2"], status: "active", daqi: 4, siteType: "Urban background", startDate: "2008-09-01" },
  { id: 62, name: "Bath", lat: 51.381, lng: -2.359, authority: "Bath and North East Somerset Council", pollutants: ["PM2.5","PM10","NO2"], status: "closed", daqi: null, siteType: "Urban background", startDate: "1997-01-01", endDate: "2024-12-31" },
  { id: 63, name: "Exeter Heavitree", lat: 50.721, lng: -3.516, authority: "Exeter City Council", pollutants: ["PM2.5","PM10","NO2","O3"], status: "active", daqi: 2, siteType: "Urban background", startDate: "2001-01-01" },
  { id: 64, name: "Plymouth Centre", lat: 50.375, lng: -4.142, authority: "Plymouth City Council", pollutants: ["PM10","NO2","O3"], status: "inactive", daqi: null, siteType: "Urban background", startDate: "2000-01-01" },
  { id: 65, name: "Gloucester", lat: 51.864, lng: -2.245, authority: "Gloucester City Council", pollutants: ["PM10","NO2"], status: "inactive", daqi: null, siteType: "Urban background", startDate: "2000-06-01" },

  // --- EASTERN / EAST MIDLANDS ---
  { id: 66, name: "Cambridge", lat: 52.205, lng: 0.119, authority: "Cambridge City Council", pollutants: ["PM2.5","PM10","NO2","O3"], status: "active", daqi: 2, siteType: "Urban background", startDate: "1997-01-01" },
  { id: 67, name: "Norwich Lakenfields", lat: 52.614, lng: 1.299, authority: "Norwich City Council", pollutants: ["PM2.5","PM10","NO2"], status: "inactive", daqi: null, siteType: "Urban background", startDate: "1998-01-01" },
  { id: 68, name: "Ipswich", lat: 52.0567, lng: 1.1482, authority: "Ipswich Borough Council", pollutants: ["PM10","NO2","O3"], status: "closed", daqi: null, siteType: "Urban background", startDate: "1996-01-01", endDate: "2024-12-31" },
  { id: 69, name: "Peterborough", lat: 52.572, lng: -0.243, authority: "Peterborough City Council", pollutants: ["PM2.5","PM10","NO2"], status: "active", daqi: 2, siteType: "Urban background", startDate: "2001-01-01" },
  { id: 70, name: "Lincoln", lat: 53.2307, lng: -0.5406, authority: "City of Lincoln Council", pollutants: ["PM10","NO2"], status: "inactive", daqi: null, siteType: "Urban background", startDate: "2000-01-01" }
];


// --- Filtering state + registry ---
const DAQI_CODES = ['PM2.5','PM10','NO2','O3','SO2'];
const AQS_CODES  = [...DAQI_CODES, 'NO','NOx','CO'];

let filterState = { mode: 'group', value: 'daqi' }; // default
const markerRegistry = []; // [{ station, marker }]

function stationMatches(station, state) {
  if (!state) return true;

  // Specific pollutant still filters
  if (state.mode === 'pollutant') {
    return station.pollutants.includes(state.value);
  }

  // Any "group" selection (DAQI or AQS) shows all stations
  if (state.mode === 'group') {
    return true;
  }

  return true;
}



function applyFilter() {
  markerRegistry.forEach(({ station, marker }) => {
    const visible = stationMatches(station, filterState);
    marker.getElement().style.display = visible ? '' : 'none';
  });
}

function setFilter(mode, value) {
  filterState = { mode, value };
  applyFilter();
}


// ---------------------------
// Helpers
// ---------------------------

// --- DAQI colouring toggle + helpers ---
let colourByDaqi = false; // default = use status colours

function getDaqiColor(daqi) {
  if (daqi == null) return '#505a5f';             // fallback grey if unknown
  if (daqi <= 3) return '#00703c';                // green: Low (1-3)
  if (daqi <= 6) return '#ffdd00';                // yellow: Moderate (4-6)
  if (daqi <= 9) return '#d4351c';                // red: High (7-9)
  return '#0b0c0c';                               // black: Very High (10)
}

function getTextColorForBg(bg) {
  // Make text readable on the fill:
  // yellow gets dark text, everything else gets white.
  const hex = (bg || '').toLowerCase();
  return (hex === '#ffdd00') ? '#0b0c0c' : '#ffffff';
}

// Update a single marker’s appearance
function updateMarkerAppearance(station, entry) {
  const { inner, label } = entry; // provided when we create markers
  if (!inner) return;

  if (colourByDaqi) {
    const bg = getDaqiColor(station.daqi);
    inner.style.backgroundColor = bg;
    if (label) {
      label.textContent = (station.daqi ?? '') === '' ? '' : String(station.daqi);
      label.style.color = getTextColorForBg(bg);
      label.style.display = station.daqi == null ? 'none' : 'block';
    }
  } else {
    inner.style.backgroundColor = getStatusColor(station.status);
    if (label) {
      label.textContent = '';
      label.style.display = 'none';
    }
  }
}

function updateAllMarkers() {
  markerRegistry.forEach(({ station, inner, label }) => {
    updateMarkerAppearance(station, { inner, label });
  });
}


function getStatusColor(status) {
  switch (status) {
    case 'active': return '#1D70B8';
    case 'inactive': return '#505A5F';
    case 'closed': return '#0B0C0C';
    default: return '#505a5f';
  }
}

function getDaqiLabel(daqi) {
  if (!daqi) return 'N/A';
  if (daqi <= 3) return 'Low';
  if (daqi <= 6) return 'Moderate';
  if (daqi <= 9) return 'High';
  return 'Very High';
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-GB', options);
}

// --- Legend panel (Status vs DAQI) ---
// --- Key overlay panel (styled like station overlay) ---
let keyClosedByUser = false;        // persists until user re-opens with the button
let keyHiddenByOverlay = false;     // temporary hide while station overlay is shown

function legendItem(label, fill) {
  return `
    <div class="aq-legend__item" role="listitem" aria-label="${label}">
      <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true" focusable="false">
        <circle cx="14" cy="14" r="11" fill="${fill}"></circle>
      </svg>
      <div class="aq-legend__text">${label}</div>
    </div>
  `;
}

function ensureLegendStylesOnce() {
  if (document.getElementById('aq-legend-styles')) return;
  const style = document.createElement('style');
  style.id = 'aq-legend-styles';
  style.textContent = `
    .aq-legend {
      display: flex;
      gap: 20px;
      justify-content: space-between;
      flex-wrap: nowrap; /* NEW: keep one row on wider view */
    }

    .aq-legend__item {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      min-width: 100px; /* NEW: enough for “Very high” at 19px */
      flex: 0 0 auto;   /* NEW: don’t shrink; size to content */
    }

    .aq-legend__item svg {
      width: 40px;
      height: 40px;
    }

    .aq-legend__text {
      font-family: "GDS Transport", Arial, sans-serif;
      font-weight: 400;
      font-size: 19px;
      line-height: 1.3;
      color: #0b0c0c;
      margin-top: 4px;
      text-align: center;
      white-space: nowrap; /* NEW: keep label on one line */
    }

    @media (max-width: 640px) {
      .aq-legend { 
        gap: 12px;
        flex-wrap: wrap; /* NEW: allow wrapping on narrow screens */
      }
    }
  `;
  document.head.appendChild(style);
}



function createKeyOverlay() {
  ensureLegendStylesOnce();

  // Remove any older instance
  document.getElementById('map-key-overlay')?.remove();

  // Build the overlay using the SAME classes as station overlay for look/feel/position
  const panel = document.createElement('div');
  panel.id = 'map-key-overlay';
  panel.className = 'defra-map-info'; // same base class as station info
  panel.setAttribute('role', 'region');
  panel.setAttribute('aria-label', 'Map key');

  panel.innerHTML = `
    <button class="defra-map-info__close" id="close-key-overlay" aria-label="Close map key">
      <svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 20 20">
        <path d="M10,8.6L15.6,3L17,4.4L11.4,10L17,15.6L15.6,17L10,11.4L4.4,17L3,15.6L8.6,10L3,4.4L4.4,3L10,8.6Z"></path>
      </svg>
      <span class="govuk-visually-hidden">Close</span>
    </button>
    <div class="defra-map-info__container">
      <h2 class="govuk-heading-m govuk-!-margin-bottom-2">Key</h2>
      <div class="aq-legend" id="aq-legend-body" role="list"></div>
    </div>
  `;

  // Mount beside map UI (same container family as station panel)
  const host = document.querySelector('.defra-map');
  (host || document.body).appendChild(panel);

  // Wire close
  panel.querySelector('#close-key-overlay')?.addEventListener('click', () => {
    hideKeyOverlay({ byUser: true });
  });
}

function renderKeyOverlay() {
  const body = document.getElementById('aq-legend-body');
  if (!body) return;

  if (colourByDaqi) {
    body.innerHTML = [
      legendItem('Low',       '#00703c'),
      legendItem('Moderate',  '#ffdd00'),
      legendItem('High',      '#d4351c'),
      legendItem('Very high', '#0b0c0c'),
    ].join('');
  } else {
    body.innerHTML = [
      legendItem('Active',   '#1D70B8'),
      legendItem('Inactive', '#505A5F'),
      legendItem('Closed',   '#0B0C0C'),
    ].join('');
  }
}



function showKeyOverlay() {
  const panel = document.getElementById('map-key-overlay');
  if (!panel) return;
  panel.classList.add('visible');       // same class your station overlay uses
  document.getElementById('key-button')?.setAttribute('hidden', ''); // hide reopen btn
 
}

function hideKeyOverlay({ byUser = false } = {}) {
  const panel = document.getElementById('map-key-overlay');
  if (!panel) return;
  panel.classList.remove('visible');

  if (byUser) {
    keyClosedByUser = true;
    document.getElementById('key-button')?.removeAttribute('hidden'); // show reopen btn
  }
  
}

// Re-open from the small button next to the menu
document.addEventListener('DOMContentLoaded', () => {
  const keyBtn = document.getElementById('key-button');
  keyBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    keyClosedByUser = false;
    showKeyOverlay();
  });
});



// ---------------------------
// Main
// ---------------------------
document.addEventListener('DOMContentLoaded', () => {

  createKeyOverlay();
  renderKeyOverlay();
  showKeyOverlay();

  const mapViewport = document.getElementById('map-viewport');
  if (!mapViewport) return;

  // Mark body as "map active" (useful if your CSS keys off it)
  document.body.classList.add('defra-map-active');

  // Keep GOV.UK template body fixed for fullscreen map (compatible with your SCSS)
  const govukTemplate = document.querySelector('.govuk-template');
  if (govukTemplate) {
    govukTemplate.classList.add('defra-map-html');
  }
  const govukBody = document.querySelector('.govuk-template__body');
  if (govukBody) {
    govukBody.classList.add('defra-map-body');
  }

  
  // Init map
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

  // Keep attribution visible and compact
  map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

  // --- Panels & focus management ---
  const legendPanel = document.getElementById('map-key');
  const openKeyBtn = document.getElementById('open-key');
  const closeKeyBtn = document.getElementById('close-key');
  const stationInfo = document.getElementById('station-info');
  const closeInfoBtn = document.getElementById('close-info');
  const exitBtn = document.getElementById('exit-map');
  let lastTrigger = null;

  function toggleLegend() {
    if (!legendPanel || !openKeyBtn) return;
    const isOpen = legendPanel.classList.contains('defra-map--key-open');
    if (isOpen) {
      legendPanel.classList.remove('defra-map--key-open');
      openKeyBtn.setAttribute('aria-expanded', 'false');
      (lastTrigger || openKeyBtn).focus();
    } else {
      lastTrigger = openKeyBtn;
      legendPanel.classList.add('defra-map--key-open');
      openKeyBtn.setAttribute('aria-expanded', 'true');
      legendPanel.focus();
    }
  }

  function closeLegend() {
    if (!legendPanel || !openKeyBtn) return;
    legendPanel.classList.remove('defra-map--key-open');
    openKeyBtn.setAttribute('aria-expanded', 'false');
    (lastTrigger || openKeyBtn).focus();
  }

      // GOV.UK tag HTML helpers
    function statusTag(status) {
      // blue if active, grey if inactive, black if closed
      const map = {
        active: 'govuk-tag--blue',
        inactive: 'govuk-tag--grey',
        closed: 'govuk-tag--black' // custom class below
      };
      const cls = map[status] || '';
      const label = (status || '').toString().replace(/\b\w/g, c => c.toUpperCase());
      return `<strong class="govuk-tag ${cls}">${label}</strong>`;
    }

    function daqiTag(daqi) {
  if (daqi == null) return '';
  // green 1–3, yellow 4–6, red 7–9, black 10
  let cls = 'govuk-tag--green';
  if (daqi >= 4 && daqi <= 6) cls = 'govuk-tag--yellow';
  else if (daqi >= 7 && daqi <= 9) cls = 'govuk-tag--red';
  else if (daqi >= 10) cls = 'govuk-tag--black';

  const word = getDaqiLabel(daqi).toLowerCase(); // "low", "moderate", etc
  return `<strong class="govuk-tag ${cls}">${daqi} (${word})</strong>`;
}


    // --- Selected marker border management ---
let selectedInnerEl = null;

function selectMarker(innerEl) {
  // revert old selection
  if (selectedInnerEl && selectedInnerEl !== innerEl) {
    selectedInnerEl.style.border = '3px solid white';
  }
  // apply new selection
  innerEl.style.border = '3px solid #0B0C0C'; // black
  selectedInnerEl = innerEl;
}

function clearSelectedMarker() {
  if (selectedInnerEl) {
    selectedInnerEl.style.border = '3px solid white';
    selectedInnerEl = null;
  }
}



  function showStationInfo(station) {
  hideKeyOverlay({ byUser: false });   // temporarily hide key
  if (!stationInfo) return;

  const infoContent = document.getElementById('station-info-content');

  const daqiText   = station.daqi == null ? 'N/A' : `${station.daqi} (${getDaqiLabel(station.daqi)})`;

  // Optional: if you added the GOV.UK tag helpers earlier, you can keep them;
  // this version keeps your existing structure but adds the End date row.
  infoContent.innerHTML = `
  <div class="station-header">
    <h2 class="govuk-heading-m govuk-!-margin-bottom-0">${station.name}</h2>
    ${statusTag(station.status)}
  </div>

  <dl class="govuk-body-s station-info-list">
    <div class="station-info-row">
      <dt>Pollutants:</dt>
      <dd>${station.pollutants.join(', ')}</dd>
    </div>

    ${station.status && station.status.toLowerCase() === 'active' && station.daqi != null ? `
      <div class="station-info-row">
        <dt>DAQI:</dt>
        <dd>${daqiTag(station.daqi)}</dd>
      </div>` : ''}

    <div class="station-info-row">
      <dt>Local authority:</dt>
      <dd>${station.authority}</dd>
    </div>

    <div class="station-info-row">
      <dt>Site type:</dt>
      <dd>${station.siteType}</dd>
    </div>

    <div class="station-info-row">
      <dt>Start date:</dt>
      <dd>${formatDate(station.startDate)}</dd>
    </div>

    ${station.status && station.status.toLowerCase() === 'closed' && station.endDate ? `
      <div class="station-info-row">
        <dt>End date:</dt>
        <dd>${formatDate(station.endDate)}</dd>
      </div>` : ''}
  </dl>

  <p><a href="/version-11/station/station.html" class="govuk-link">View and download data for this station</a></p>
`;


  stationInfo.classList.add('visible');
  stationInfo.setAttribute('aria-label', `Information for ${station.name}`);
  lastTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : lastTrigger;
  stationInfo.focus();
}


  function closeStationInfo() {
  if (!stationInfo) return;
  stationInfo.classList.remove('visible');
  clearSelectedMarker();

  // If the user didn’t explicitly close the key, bring it back
  if (!keyClosedByUser) showKeyOverlay();
  keyHiddenByOverlay = false;

  if (lastTrigger && typeof lastTrigger.focus === 'function') {
    lastTrigger.focus();
  }
}



  // --- Map load: add markers ---
  map.on('load', () => {
    // Add zoom state on load
    updateZoomButtons();

    mockStations.forEach((station) => {
  // Outer container (unchanged)
  const markerContainer = document.createElement('div');
  markerContainer.className = 'station-marker-container';
  markerContainer.setAttribute('role', 'button');
  markerContainer.setAttribute('tabindex', '0');
  markerContainer.setAttribute('aria-label', `${station.name} monitoring station`);

  // Inner visible circle (unchanged base styles)
  const inner = document.createElement('div');
  inner.className = 'station-marker-inner';
  inner.style.backgroundColor = getStatusColor(station.status);
  inner.style.width = '24px';
  inner.style.height = '24px';
  inner.style.borderRadius = '50%';
  inner.style.border = '3px solid white';
  inner.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
  inner.style.position = 'relative'; // allow centered label
  markerContainer.appendChild(inner);

  // NEW: centered DAQI label
  const label = document.createElement('span');
  label.style.position = 'absolute';
  label.style.top = '50%';
  label.style.left = '50%';
  label.style.transform = 'translate(-50%, -50%)';
  label.style.fontSize = '12px';
  label.style.lineHeight = '12px';
  label.style.fontWeight = '700';
  label.style.userSelect = 'none';
  label.style.pointerEvents = 'none';
  label.style.display = 'none'; // hidden until DAQI mode on
  inner.appendChild(label);

  markerContainer.addEventListener('click', (e) => {
  e.preventDefault(); e.stopPropagation();
  lastTrigger = markerContainer;
  selectMarker(inner);            // <— NEW: set black border
  showStationInfo(station);
});

markerContainer.addEventListener('keydown', (e) => {
  const isEnter = e.key === 'Enter';
  const isSpace = e.key === ' ' || e.code === 'Space' || e.key === 'Spacebar';
  if (isEnter || isSpace) {
    e.preventDefault(); e.stopPropagation();
    lastTrigger = markerContainer;
    selectMarker(inner);          // <— NEW: set black border
    showStationInfo(station);
  }
});


  // Hover/focus handlers (unchanged) ...
  markerContainer.addEventListener('focus', () => {
    inner.style.outline = '3px solid #ffdd00';
    inner.style.outlineOffset = '2px';
  });
  markerContainer.addEventListener('blur', () => { inner.style.outline = 'none'; });

  markerContainer.addEventListener('click', (e) => {
    e.preventDefault(); e.stopPropagation();
    lastTrigger = markerContainer;
    showStationInfo(station);
  });
  markerContainer.addEventListener('keydown', (e) => {
    const isEnter = e.key === 'Enter';
    const isSpace = e.key === ' ' || e.code === 'Space' || e.key === 'Spacebar';
    if (isEnter || isSpace) {
      e.preventDefault(); e.stopPropagation();
      lastTrigger = markerContainer;
      showStationInfo(station);
    }
  });

  const marker = new maplibregl.Marker({ element: markerContainer, anchor: 'center' })
    .setLngLat([station.lng, station.lat])
    .addTo(map);

  // Register with extra refs so we can recolour quickly
  markerRegistry.push({ station, marker, inner, label });
});

// Keep your default filter
setFilter('group', 'daqi');

});

  // --- Zoom controls ---
  const zoomInBtn = document.getElementById('zoomIn');
  const zoomOutBtn = document.getElementById('zoomOut');

  function setZoomButtonDisabled(btn, disabled, labelWhenEnabled, labelWhenDisabled) {
    if (!btn) return;
    if (disabled) {
      btn.classList.add('zoom-disable');
      btn.setAttribute('aria-disabled', 'true');
      if (labelWhenDisabled) btn.setAttribute('aria-label', labelWhenDisabled);
    } else {
      btn.classList.remove('zoom-disable');
      btn.removeAttribute('aria-disabled');
      if (labelWhenEnabled) btn.setAttribute('aria-label', labelWhenEnabled);
    }
  }

  function updateZoomButtons() {
    const z = map.getZoom();
    setZoomButtonDisabled(
      zoomInBtn,
      z >= 16,
      'Zoom in',
      'Zoom in disabled because max zoom has been reached'
    );
    setZoomButtonDisabled(
      zoomOutBtn,
      z <= 5,
      'Zoom out',
      'Zoom out disabled because min zoom has been reached'
    );
  }

  if (zoomInBtn) {
    zoomInBtn.addEventListener('click', () => map.zoomIn());
  }
  if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', () => map.zoomOut());
  }
  map.on('zoom', updateZoomButtons);
  map.on('load', updateZoomButtons);

  // --- Legend events ---
  if (openKeyBtn) {
    openKeyBtn.addEventListener('click', () => {
      lastTrigger = openKeyBtn;
      toggleLegend();
    });
  }
  if (closeKeyBtn) {
    closeKeyBtn.addEventListener('click', () => closeLegend());
  }
  if (legendPanel) {
    legendPanel.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeLegend();
      }
    });
  }

  // --- Station info events ---
  if (closeInfoBtn) {
    closeInfoBtn.addEventListener('click', () => closeStationInfo());
  }
  if (stationInfo) {
    stationInfo.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeStationInfo();
      }
    });
  }

  // --- Exit button ---
  if (exitBtn) {
    exitBtn.addEventListener('click', () => {
      // Clean up classes we added for fullscreen
      document.body.classList.remove('defra-map-active');
      if (govukTemplate) govukTemplate.classList.remove('defra-map-html');
      if (govukBody) govukBody.classList.remove('defra-map-body');
      // Navigate away
      window.location.href = 'hub.html';
    });
  }
});

const floatingPanel = document.getElementById('floating-panel'); // your .panel
const panelCloseBtn = document.getElementById('panel-close');
const menuButton    = document.getElementById('menu-button');    // add if you want the reopen button

function openPanel() {
  if (!floatingPanel || !menuButton) return;
  floatingPanel.style.display = '';      // shows (your media query will handle final display)
  menuButton.hidden = true;
  floatingPanel.focus();
}
function closePanel() {
  if (!floatingPanel || !menuButton) return;
  floatingPanel.style.display = 'none';  // hide panel
  menuButton.hidden = false;             // reveal menu button 10px above zoom
  menuButton.focus();
}

panelCloseBtn?.addEventListener('click', (e) => { e.preventDefault(); closePanel(); });
menuButton?.addEventListener('click',   (e) => { e.preventDefault(); openPanel();  });


// -----------------------------
// Radios for "groups" vs "pollutant"
// -----------------------------
(function initPollutantPanels() {
  // Initialise both panels by their root containers
  setupPanel(document.querySelector('#floating-panel #mobile-key-panel'));
  setupPanel(document.getElementById('mobile-key-panel-bottom'));

  function setupPanel(root) {
    if (!root) return;

    const extBtn   = root.querySelector('.ext-btn');   // "Pollutant groups"
    const depthBtn = root.querySelector('.depth-btn'); // "Pollutant"
    const mount    = root.querySelector('.radio-mount');

    if (!extBtn || !depthBtn || !mount) return;

    // Unique radio name per panel so selections don't clash
    const radioName = `pollutant-choice-${Math.random().toString(36).slice(2, 8)}`;

function renderGroups() {
  // Hint text (lowercase, comma-separated as requested)
  const daqiHint =
    'fine particulate matter (PM2.5), particulate matter (PM10), nitrogen dioxide (NO2), ozone (O3), sulphur dioxide (SO2)';

  const aqsHint =
    'fine particulate matter (PM2.5), particulate matter (PM10), nitrogen dioxide (NO2), ozone (O3), sulphur dioxide (SO2), nitric oxide (NO), nitrogen oxides (NOx), carbon monoxide (CO)';

  mount.innerHTML = `
    <fieldset class="govuk-fieldset">
      <div class="govuk-radios govuk-radios--small" data-module="govuk-radios">

        <div class="govuk-radios__item">
          <input
            class="govuk-radios__input"
            id="${radioName}-group-particulates"
            name="${radioName}"
            type="radio"
            value="particulates">
          <label class="govuk-label govuk-radios__label" for="${radioName}-group-particulates">
            Daily Air Quality Index (DAQI) pollutants
          </label>
          <div class="govuk-hint aq-radio-hint" id="${radioName}-hint-daqi" hidden style="margin-top:0px; margin-left: 35px;">
            ${daqiHint}
          </div>
        </div>

        <div class="govuk-radios__item govuk-!-margin-top-0">
          <input
            class="govuk-radios__input"
            id="${radioName}-group-gases"
            name="${radioName}"
            type="radio"
            value="gases">
          <label class="govuk-label govuk-radios__label" for="${radioName}-group-gases">
            Pollutants in the Air Quality Standards Regulations 2010
          </label>
          <div class="govuk-hint aq-radio-hint" id="${radioName}-hint-aqs" hidden style="margin-top:0px; margin-left: 35px;">
            ${aqsHint}
          </div>
        </div>
        

      </div>
    </fieldset>
  `;

  const daqiInput  = root.querySelector(`#${radioName}-group-particulates`);
  const aqsInput   = root.querySelector(`#${radioName}-group-gases`);
  const daqiHintEl = root.querySelector(`#${radioName}-hint-daqi`);
  const aqsHintEl  = root.querySelector(`#${radioName}-hint-aqs`);

  function updateHints() {
    daqiHintEl.hidden = true;
    aqsHintEl.hidden  = true;
    daqiInput.removeAttribute('aria-describedby');
    aqsInput.removeAttribute('aria-describedby');
    if (daqiInput.checked) {
      daqiHintEl.hidden = false;
      daqiInput.setAttribute('aria-describedby', daqiHintEl.id);
    } else if (aqsInput.checked) {
      aqsHintEl.hidden = false;
      aqsInput.setAttribute('aria-describedby', aqsHintEl.id);
    }
  }

  // Always force group-mode + re-show everything
  function applyGroupSelection(kind) {
    setFilter('group', kind === 'aqs' ? 'aqs' : 'daqi'); // state value retained (for your UI), but group mode shows all
    applyFilter();        // make sure visibility updates immediately
    renderKeyOverlay();   // keep key in sync
    updateHints();
  }

  // Change listeners (normal case)
  daqiInput?.addEventListener('change', () => { if (daqiInput.checked) applyGroupSelection('daqi'); });
  aqsInput ?.addEventListener('change', () => { if (aqsInput.checked)  applyGroupSelection('aqs');  });

  // Click listeners (covers “already-checked” case)
  daqiInput?.addEventListener('click', () => applyGroupSelection('daqi'));
  aqsInput ?.addEventListener('click', () => applyGroupSelection('aqs'));

  // Default reflect current state
  if (!root.querySelector(`input[name="${radioName}"]:checked`)) {
    daqiInput.checked = true;
    applyGroupSelection('daqi');
  } else {
    updateHints();
  }

  renderDaqiToggle(root, mount, radioName);
}


function renderPollutants() {
  mount.innerHTML = `
    <fieldset class="govuk-fieldset">
      <div class="govuk-radios govuk-radios--small" data-module="govuk-radios">
        ${[
          { code: 'PM2.5', label: 'Fine particulate matter (PM2.5)' },
          { code: 'PM10',  label: 'Particulate matter (PM10)' },
          { code: 'NO2',   label: 'Nitrogen dioxide (NO2)' },
          { code: 'O3',    label: 'Ozone (O3)' },
          { code: 'SO2',   label: 'Sulphur dioxide (SO2)' }
        ].map((p, idx) => `
          <div class="govuk-radios__item">
            <input class="govuk-radios__input" id="${radioName}-p-${idx}" name="${radioName}" type="radio" value="${p.code}">
            <label class="govuk-label govuk-radios__label" for="${radioName}-p-${idx}">${p.label}</label>
          </div>
        `).join('')}
      </div>
    </fieldset>
  `;

  // Attach the change handler ONCE per panel (mount element persists; innerHTML changes)
  if (!mount.dataset.pollutantChangeBound) {
    mount.addEventListener('change', (e) => {
      const target = e.target;
      if (target && target.matches('.govuk-radios__input[type="radio"]')) {
        if (target.checked) {
          setFilter('pollutant', target.value); // updates markers every time
        }
      }
    });
    mount.dataset.pollutantChangeBound = 'true';
  }

  // Reflect current global state if we're already in pollutant mode
  if (filterState.mode === 'pollutant') {
    const current = root.querySelector(`input[name="${radioName}"][value="${filterState.value}"]`);
    if (current) current.checked = true;
  }
  renderDaqiToggle(root, mount, radioName);

}



    // Toggle helpers
    function setPressed(btn, pressed) {
      btn.setAttribute('aria-pressed', pressed ? 'true' : 'false');
      btn.classList.toggle('is-active', !!pressed);
    }

   function showMode(mode) {
  if (mode === 'groups') {
    setPressed(extBtn, true);
    setPressed(depthBtn, false);
    renderGroups();

    // NEW: re-apply current group selection (or DAQI by default)
    const checked = root.querySelector(`input[name="${radioName}"]:checked`);
    const kind = checked?.value === 'gases' ? 'aqs' : 'daqi';
    // Fire the same path the click uses:
    const target = kind === 'aqs'
      ? root.querySelector(`#${radioName}-group-gases`)
      : root.querySelector(`#${radioName}-group-particulates`);
    target?.dispatchEvent(new Event('click', { bubbles: true }));
  } else {
    setPressed(extBtn, false);
    setPressed(depthBtn, true);
    renderPollutants();
  }
}


    // Wire up clicks (and keyboard activation since these are <button>)
    extBtn.addEventListener('click', (e) => { e.preventDefault(); showMode('groups'); });
    depthBtn.addEventListener('click', (e) => { e.preventDefault(); showMode('pollutant'); });

    // Initial render honours current aria-pressed state
    const initialMode = extBtn.getAttribute('aria-pressed') === 'true' ? 'groups' : 'pollutant';
    showMode(initialMode);
  }
})();



// Add a small features block with the DAQI toggle (appended under the radios)
function renderDaqiToggle(root, mount, radioName) {
  if (!root || !mount || !radioName) return;

  const id = `${radioName}-colour-by-daqi`;

  // Remove any previous instance for this panel to avoid duplicates
  const existing = root.querySelector(`#${id}`)?.closest('.map-features');
  if (existing) existing.remove();

  // Build wrapper just below the radios
  const wrapper = document.createElement('div');
  wrapper.className = 'map-features govuk-!-margin-top-3';
  wrapper.innerHTML = `
    <h3 class="govuk-heading-s govuk-!-margin-bottom-1">Map features</h3>
    <div class="govuk-checkboxes govuk-checkboxes--small" data-module="govuk-checkboxes">
      <div class="govuk-checkboxes__item">
        <input class="govuk-checkboxes__input" id="${id}" type="checkbox" ${colourByDaqi ? 'checked' : ''}>
        <label class="govuk-label govuk-checkboxes__label" for="${id}">
          Show Daily Air Quality Index (DAQI)
        </label>
      </div>
    </div>
  `;

  // Insert right after the radio mount
  mount.insertAdjacentElement('afterend', wrapper);

  const cb = root.querySelector(`#${id}`);
  cb?.addEventListener('change', () => {
  colourByDaqi = !!cb.checked;
  updateAllMarkers();
  renderKeyOverlay();          // <-- add this
});

}


