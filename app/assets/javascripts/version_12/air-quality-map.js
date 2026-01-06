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
  { id: 20, name: "Birmingham Acocks Green", lat: 52.438, lng: -1.824, authority: "Birmingham City Council", pollutants: ["PM2.5","PM10","NO2","O3"], status: "closed", daqi: null, siteType: "Urban background", startDate: "2011-03-18", endDate: "2021-10-01" },
  { id: 21, name: "Coventry Allesley", lat: 52.425, lng: -1.544, authority: "Coventry City Council", pollutants: ["PM2.5","PM10","NO2","O3"], status: "active", daqi: 2, siteType: "Suburban", startDate: "2000-01-01" },
  { id: 22, name: "Nottingham Centre", lat: 52.954, lng: -1.150, authority: "Nottingham City Council", pollutants: ["PM2.5","PM10","NO2","O3","SO2"], status: "active", daqi: 3, siteType: "Urban centre", startDate: "1998-01-01" },
  { id: 23, name: "Leicester University Road", lat: 52.624, lng: -1.120, authority: "Leicester City Council", pollutants: ["PM2.5","PM10","NO2","O3"], status: "active", daqi: 2, siteType: "Urban background", startDate: "2000-01-01" },
  { id: 24, name: "Derby St Alkmund's Way", lat: 52.926, lng: -1.478, authority: "Derby City Council", pollutants: ["PM10","NO2"], status: "closed", daqi: null, siteType: "Urban traffic", startDate: "1996-01-01", endDate: "2024-12-31" },
  { id: 25, name: "Wolverhampton Centre", lat: 52.585, lng: -2.129, authority: "Wolverhampton City Council", pollutants: ["PM2.5","PM10","NO2"], status: "active", daqi: 4, siteType: "Urban background", startDate: "2001-05-01" },
  { id: 26, name: "Stoke-on-Trent", lat: 53.002, lng: -2.179, authority: "Stoke-on-Trent City Council", pollutants: ["PM10","NO2","O3"], status: "active", daqi: 2, siteType: "Urban background", startDate: "2004-01-01" },
  { id: 71, name: "Birmingham A4540 Roadside", lat: 52.476, lng: -1.874, authority: "Birmingham City Council", pollutants: ["PM2.5","PM10","NO2","O3"], status: "active", daqi: 4, siteType: "Urban traffic", startDate: "2016-09-09" },
  {
  id: 66055,
  name: "Birmingham Ladywood",
  lat: 52.481346,
  lng: -1.918235,
  authority: "Birmingham City Council",
  pollutants: ["O3","NO","NO2","NOx","SO2","PM10","PM2.5"],
  status: "active",
  daqi: 3,
  siteType: "Urban background",
  startDate: "2018-08-23"
  },

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
  {
  id: 300362,
  name: "Wicken Fen",
  lat: 52.298500,
  lng: 0.290917,
  authority: "East Cambridgeshire District Council",
  pollutants: ["O3","NO","NO2","NOx","SO2","PM10","PM2.5"],
  status: "active",
  daqi: 1,
  siteType: "Rural background",
  startDate: "1997-10-15"
  },
  { id: 67, name: "Norwich Lakenfields", lat: 52.614, lng: 1.299, authority: "Norwich City Council", pollutants: ["PM2.5","PM10","NO2"], status: "inactive", daqi: null, siteType: "Urban background", startDate: "1998-01-01" },
  { id: 68, name: "Ipswich", lat: 52.0567, lng: 1.1482, authority: "Ipswich Borough Council", pollutants: ["PM10","NO2","O3"], status: "closed", daqi: null, siteType: "Urban background", startDate: "1996-01-01", endDate: "2024-12-31" },
  { id: 69, name: "Peterborough", lat: 52.572, lng: -0.243, authority: "Peterborough City Council", pollutants: ["PM2.5","PM10","NO2"], status: "active", daqi: 2, siteType: "Urban background", startDate: "2001-01-01" },
  { id: 70, name: "Lincoln", lat: 53.2307, lng: -0.5406, authority: "City of Lincoln Council", pollutants: ["PM10","NO2"], status: "inactive", daqi: null, siteType: "Urban background", startDate: "2000-01-01" }
];

// ---------------------------
// Data sources (networks) + dummy datasets
// ---------------------------

// Network IDs
const NETWORK = {
  AURN: 'aurn',
  LOCAL: 'local',
  URBAN_NO2: 'urban_no2',
  RURAL_NO2: 'rural_no2',
  ACID_GAS: 'acid_gas',
  MARGA: 'marga',

  // NEW (UK AIR networks)
  AUTO_HC: 'auto_hc',                 // Automatic Hydrocarbon Network
  NONAUTO_HC: 'nonauto_hc',           // Non-Automatic Hydrocarbon Network
  HEAVY_METALS: 'heavy_metals',       // Heavy Metals Network
  PAH: 'pah',                         // PAH Network
  NAMN: 'namn',                       // National Ammonia Monitoring Network
  AGANET: 'aganet',                   // Acid Gas and Aerosol Network (AGANet)
  PRECIPNET: 'precipnet',             // Precip-Net
  RURAL_MERCURY: 'rural_mercury',     // Rural Mercury Network
  BLACK_CARBON: 'black_carbon',       // Black Carbon Network
  PARTICLE_NUMBER: 'particle_number'  // Particle Concentrations and Numbers Network
};

// Metadata for rendering (group headings)
const NETWORK_META = {
  [NETWORK.AURN]:        { label: 'Automatic Urban and Rural Network', group: 'near' },
  [NETWORK.URBAN_NO2]:   { label: 'UK Urban NO2 Network', group: 'other_defra' },
  [NETWORK.RURAL_NO2]:   { label: 'Rural NO2', group: 'other_defra' },
  [NETWORK.ACID_GAS]:    { label: 'Acid Gas and Aerosol Network', group: 'other_defra' },
  [NETWORK.MARGA]:       { label: 'MARGA Network', group: 'other_defra' },
  [NETWORK.LOCAL]:       { label: 'locally-managed automatic monitoring', group: 'non_defra' },

  // NEW
  [NETWORK.AUTO_HC]:       { label: 'Automatic Hydrocarbon Network', group: 'near' },
  [NETWORK.NONAUTO_HC]:    { label: 'Non-Automatic Hydrocarbon Network', group: 'other_defra' },
  [NETWORK.HEAVY_METALS]:  { label: 'Heavy Metals Network', group: 'other_defra' },
  [NETWORK.PAH]:           { label: 'PAH Network', group: 'other_defra' },
  [NETWORK.NAMN]:          { label: 'National Ammonia Monitoring Network', group: 'other_defra' },
  [NETWORK.AGANET]:        { label: 'Acid Gas and Aerosol Network (AGANet)', group: 'other_defra' },
  [NETWORK.PRECIPNET]:     { label: 'Precip-Net', group: 'other_defra' },
  [NETWORK.RURAL_MERCURY]: { label: 'Rural Mercury Network', group: 'other_defra' },
  [NETWORK.BLACK_CARBON]:  { label: 'Black Carbon Network', group: 'other_defra' },
  [NETWORK.PARTICLE_NUMBER]: { label: 'Particle Concentrations and Numbers Network', group: 'other_defra' }
};



// Pollutant → networks mapping (your rules)
const POLLUTANT_NETWORKS = {
  'PM2.5': [NETWORK.AURN, NETWORK.LOCAL],
  'PM10':  [NETWORK.AURN, NETWORK.LOCAL],
  'NO2':   [NETWORK.AURN, NETWORK.LOCAL, NETWORK.URBAN_NO2, NETWORK.RURAL_NO2],
  'SO2':   [NETWORK.AURN, NETWORK.LOCAL, NETWORK.ACID_GAS, NETWORK.MARGA],
  'O3':    [NETWORK.AURN, NETWORK.LOCAL]
};

const POLLUTANT_GROUP_NETWORKS = {
  // Regulations group: keep your existing behaviour (these are the ones you already support)
  regulation: [NETWORK.AURN, NETWORK.LOCAL, NETWORK.URBAN_NO2, NETWORK.RURAL_NO2, NETWORK.ACID_GAS, NETWORK.MARGA],

  // Specialist groups
  vocs: [NETWORK.AUTO_HC, NETWORK.NONAUTO_HC],
  heavy_metals: [NETWORK.HEAVY_METALS],
  pahs: [NETWORK.PAH],

  // Ammonia: NH3 (NAMN) + NH4 etc can be at AGANet sites + (optionally) MARGA for hourly chemistry
  ammonia: [NETWORK.NAMN, NETWORK.AGANET, NETWORK.MARGA],

  ions_acids: [NETWORK.AGANET, NETWORK.MARGA],
  precipitation: [NETWORK.PRECIPNET],
  mercury: [NETWORK.RURAL_MERCURY],
  black_carbon: [NETWORK.BLACK_CARBON],
  particles: [NETWORK.PARTICLE_NUMBER]
};

// Other datasets
const NETWORK_DATASETS = {
  [NETWORK.AURN]: mockStations,

  [NETWORK.LOCAL]: [
    { id: 1001, name: "Local Leeds Roadside", lat: 53.800, lng: -1.550, authority: "Leeds City Council", pollutants: ["NO2","PM10"], status: "active", daqi: null, siteType: "Urban traffic", startDate: "2018-01-01" },
    { id: 1002, name: "Local Brighton Centre", lat: 50.823, lng: -0.137, authority: "Brighton & Hove City Council", pollutants: ["PM2.5","PM10"], status: "active", daqi: null, siteType: "Urban background", startDate: "2019-05-01" }
  ],

  [NETWORK.URBAN_NO2]: [
    { id: 2001, name: "Urban NO2 Birmingham Centre", lat: 52.479, lng: -1.902, authority: "Birmingham City Council", pollutants: ["NO2"], status: "active", daqi: null, siteType: "Urban centre", startDate: "2017-01-01" },
    { id: 2002, name: "Urban NO2 London Roadside", lat: 51.507, lng: -0.128, authority: "Westminster City Council", pollutants: ["NO2"], status: "active", daqi: null, siteType: "Urban traffic", startDate: "2016-06-01" }
  ],

  [NETWORK.RURAL_NO2]: [
    { id: 3001, name: "Rural NO2 Northumberland", lat: 55.200, lng: -2.000, authority: "Northumberland County Council", pollutants: ["NO2"], status: "active", daqi: null, siteType: "Rural background", startDate: "2015-01-01" },
    { id: 3002, name: "Rural NO2 Norfolk", lat: 52.700, lng: 1.300, authority: "Norfolk County Council", pollutants: ["NO2"], status: "active", daqi: null, siteType: "Rural background", startDate: "2014-09-01" },

    // ➕ Auchencorth Moss – UKEAP Rural NO2
    {
      id: 3003,
      name: "Auchencorth Moss",
      lat: 55.792160,
      lng: -3.242900,
      authority: "Midlothian Council",
      pollutants: ["NO2"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2023-12-27"
    },

    // ➕ Chilbolton Observatory – UKEAP Rural NO2
    {
      id: 3004,
      name: "Chilbolton Observatory",
      lat: 51.149617,
      lng: -1.438228,
      authority: "Hampshire County Council",
      pollutants: ["NO2"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2016-01-15"
    }
  ],

  [NETWORK.ACID_GAS]: [
    { id: 4001, name: "Acid Gas Newcastle", lat: 54.978, lng: -1.617, authority: "Newcastle City Council", pollutants: ["SO2"], status: "active", daqi: null, siteType: "Urban background", startDate: "2013-01-01" },
    { id: 4002, name: "Acid Gas Swansea", lat: 51.621, lng: -3.943, authority: "Swansea Council", pollutants: ["SO2"], status: "active", daqi: null, siteType: "Urban background", startDate: "2012-04-01" }
  ],

  [NETWORK.MARGA]: [
    { id: 5001, name: "MARGA Bristol", lat: 51.455, lng: -2.588, authority: "Bristol City Council", pollutants: ["SO2"], status: "active", daqi: null, siteType: "Urban background", startDate: "2020-01-01" },
    { id: 5002, name: "MARGA Glasgow", lat: 55.864, lng: -4.251, authority: "Glasgow City Council", pollutants: ["SO2"], status: "active", daqi: null, siteType: "Urban background", startDate: "2021-06-01" },

    // ➕ MARGA Auchencorth Moss
    {
      id: 5003,
      name: "Auchencorth Moss",
      lat: 55.792160,
      lng: -3.242900,
      authority: "Midlothian Council",
      pollutants: ["SO2"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2011-01-01"
    },

    // ➕ MARGA Chilbolton Observatory
    {
      id: 5004,
      name: "Chilbolton Observatory",
      lat: 51.149617,
      lng: -1.438228,
      authority: "Hampshire County Council",
      pollutants: ["SO2"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2016-01-11"
    }
  ],

  // NEW (VOCS) – dummy stations
  [NETWORK.AUTO_HC]: [
    { id: 6001, name: "Auto HC London West", lat: 51.508, lng: -0.210, authority: "Royal Borough of Kensington and Chelsea", pollutants: ["VOCS"], status: "active", daqi: null, siteType: "Urban background", startDate: "2022-01-01" },
    { id: 6002, name: "Auto HC Manchester Central", lat: 53.479, lng: -2.245, authority: "Manchester City Council", pollutants: ["VOCS"], status: "active", daqi: null, siteType: "Urban background", startDate: "2023-06-01" },
    { id: 6001, name: "Auto HC London Marylebone", lat: 51.5225, lng: -0.1545, authority: "Westminster City Council", pollutants: ["VOCs"], status: "active", daqi: null, siteType: "Urban traffic", startDate: "2010-01-01" },
    { id: 6002, name: "Auto HC Birmingham Centre", lat: 52.479, lng: -1.902, authority: "Birmingham City Council", pollutants: ["VOCs"], status: "active", daqi: null, siteType: "Urban centre", startDate: "2012-06-01" },

    // ➕ Auto HC Auchencorth Moss
    {
      id: 6003,
      name: "Auchencorth Moss",
      lat: 55.792160,
      lng: -3.242900,
      authority: "Midlothian Council",
      pollutants: ["VOCS"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2006-09-04"
    },

    // ➕ Auto HC Chilbolton Observatory
    {
      id: 6004,
      name: "Chilbolton Observatory",
      lat: 51.149617,
      lng: -1.438228,
      authority: "Hampshire County Council",
      pollutants: ["VOCS"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2016-01-19"
    }
  ],

  [NETWORK.NONAUTO_HC]: [
    { id: 7001, name: "Non-auto HC Bristol", lat: 51.454, lng: -2.600, authority: "Bristol City Council", pollutants: ["VOCS"], status: "inactive", daqi: null, siteType: "Urban background", startDate: "2021-03-01" },
    { id: 7002, name: "Non-auto HC Glasgow", lat: 55.864, lng: -4.270, authority: "Glasgow City Council", pollutants: ["VOCS"], status: "active", daqi: null, siteType: "Urban background", startDate: "2020-09-01" },
    { id: 6101, name: "Non-auto HC Harwell", lat: 51.571, lng: -1.319, authority: "Oxfordshire County Council", pollutants: ["VOCs"], status: "active", daqi: null, siteType: "Rural background", startDate: "2008-01-01" },
    { id: 6102, name: "Non-auto HC Glasgow", lat: 55.864, lng: -4.251, authority: "Glasgow City Council", pollutants: ["VOCs"], status: "active", daqi: null, siteType: "Urban background", startDate: "2015-01-01" },
    {
      id: 66055,
      name: "Birmingham Ladywood",
      lat: 52.481346,
      lng: -1.918235,
      authority: "Birmingham City Council",
      pollutants: ["VOCS"],
      status: "active",
      daqi: null,
      siteType: "Urban background",
      startDate: "2018-08-23"
    }
  ],

  // NEW: Heavy metals (PM10)
  [NETWORK.HEAVY_METALS]: [
    { id: 6201, name: "Heavy metals Sheffield", lat: 53.378, lng: -1.477, authority: "Sheffield City Council", pollutants: ["HM_PM10"], status: "active", daqi: null, siteType: "Urban background", startDate: "2006-01-01" },
    { id: 6202, name: "Heavy metals Swansea", lat: 51.621, lng: -3.943, authority: "Swansea Council", pollutants: ["HM_PM10"], status: "active", daqi: null, siteType: "Urban background", startDate: "2009-01-01" },
    {
      id: 300481,
      name: "Detling",
      lat: 51.307938,
      lng: 0.582650,
      authority: "Maidstone Borough Council",
      pollutants: ["Heavy metals"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2004-10-01"
    },

    // ➕ Heavy metals Auchencorth Moss
    {
      id: 6203,
      name: "Auchencorth Moss",
      lat: 55.792160,
      lng: -3.242900,
      authority: "Midlothian Council",
      pollutants: ["HM_PM10"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2003-01-23"
    },

    // ➕ Heavy metals Chilbolton Observatory
    {
      id: 6204,
      name: "Chilbolton Observatory",
      lat: 51.149617,
      lng: -1.438228,
      authority: "Hampshire County Council",
      pollutants: ["HM_PM10"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2016-01-11"
    }
  ],

  // NEW: PAHs
  [NETWORK.PAH]: [
    { id: 6301, name: "PAH Leeds", lat: 53.8008, lng: -1.5491, authority: "Leeds City Council", pollutants: ["PAH"], status: "active", daqi: null, siteType: "Urban background", startDate: "2007-01-01" },
    { id: 6302, name: "PAH Belfast", lat: 54.596, lng: -5.930, authority: "Belfast City Council", pollutants: ["PAH"], status: "active", daqi: null, siteType: "Urban background", startDate: "2011-01-01" },
    {
      id: 66055,
      name: "Birmingham Ladywood",
      lat: 52.481346,
      lng: -1.918235,
      authority: "Birmingham City Council",
      pollutants: ["PAH"],
      status: "active",
      daqi: null,
      siteType: "Urban background",
      startDate: "2018-08-23"
    },

    // ➕ PAH Auchencorth Moss
    {
      id: 6303,
      name: "Auchencorth Moss",
      lat: 55.792160,
      lng: -3.242900,
      authority: "Midlothian Council",
      pollutants: ["PAH"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2003-01-01"
    },

    // ➕ PAH Chilbolton Observatory
    {
      id: 6304,
      name: "Chilbolton Observatory",
      lat: 51.149617,
      lng: -1.438228,
      authority: "Hampshire County Council",
      pollutants: ["PAH"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2016-01-11"
    }
  ],

  // NEW: Ammonia
  [NETWORK.NAMN]: [
    { id: 6401, name: "NAMN Rural Cumbria", lat: 54.460, lng: -2.730, authority: "Westmorland and Furness Council", pollutants: ["NH3"], status: "active", daqi: null, siteType: "Rural", startDate: "2004-01-01" },
    { id: 6402, name: "NAMN Rural Norfolk", lat: 52.700, lng: 1.300, authority: "Norfolk County Council", pollutants: ["NH3"], status: "active", daqi: null, siteType: "Rural", startDate: "2008-01-01" },
    {
      id: 300481,
      name: "Detling",
      lat: 51.307938,
      lng: 0.582650,
      authority: "Maidstone Borough Council",
      pollutants: ["NH3"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2004-10-01"
    },

    // ➕ NAMN Auchencorth Moss
    {
      id: 6403,
      name: "Auchencorth Moss",
      lat: 55.792160,
      lng: -3.242900,
      authority: "Midlothian Council",
      pollutants: ["NH3"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "1999-01-01"
    },

    // ➕ NAMN Chilbolton Observatory
    {
      id: 6404,
      name: "Chilbolton Observatory",
      lat: 51.149617,
      lng: -1.438228,
      authority: "Hampshire County Council",
      pollutants: ["NH3"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2016-01-11"
    }
  ],

  // NEW: Particulate ions + acid gases (AGANet) + MARGA already exists
  [NETWORK.AGANET]: [
    { id: 6501, name: "AGANet Harwell", lat: 51.571, lng: -1.319, authority: "Oxfordshire County Council", pollutants: ["IONS_ACIDS"], status: "active", daqi: null, siteType: "Rural background", startDate: "2001-01-01" },
    { id: 6502, name: "Auchencorth Moss", lat: 55.793, lng: -3.243, authority: "Midlothian Council", pollutants: ["IONS_ACIDS"], status: "active", daqi: null, siteType: "Rural background", startDate: "2003-01-01" },
    {
      id: 300481,
      name: "Detling",
      lat: 51.307938,
      lng: 0.582650,
      authority: "Maidstone Borough Council",
      pollutants: ["IONS_ACIDS"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2004-10-01"
    },

    // ➕ AGANet Chilbolton Observatory
    {
      id: 6503,
      name: "Chilbolton Observatory",
      lat: 51.149617,
      lng: -1.438228,
      authority: "Hampshire County Council",
      pollutants: ["IONS_ACIDS"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2016-01-11"
    }
  ],

  // NEW: Precipitation chemistry (Precip-Net)
  [NETWORK.PRECIPNET]: [
    { id: 6601, name: "Precip-Net Eskdalemuir", lat: 55.316, lng: -3.207, authority: "Dumfries and Galloway Council", pollutants: ["PRECIP_CHEM"], status: "active", daqi: null, siteType: "Rural", startDate: "1990-01-01" },
    { id: 6602, name: "Precip-Net Rothamsted", lat: 51.809, lng: -0.354, authority: "Hertfordshire County Council", pollutants: ["PRECIP_CHEM"], status: "active", daqi: null, siteType: "Rural", startDate: "1995-01-01" }
  ],

  // NEW: Mercury
  [NETWORK.RURAL_MERCURY]: [
    { id: 6701, name: "Auchencorth Moss", lat: 55.793, lng: -3.243, authority: "Midlothian Council", pollutants: ["HG"], status: "active", daqi: null, siteType: "Rural", startDate: "2009-01-01" },
    { id: 6702, name: "Chilbolton Observatory", lat: 51.144, lng: -1.438, authority: "Hampshire County Council", pollutants: ["HG"], status: "active", daqi: null, siteType: "Rural", startDate: "2012-01-01" }
  ],

  // NEW: Black carbon
  [NETWORK.BLACK_CARBON]: [
    // ➕ Birmingham Ladywood (BC)
    {
      id: 66055,
      name: "Birmingham Ladywood",
      lat: 52.481346,
      lng: -1.918235,
      authority: "Birmingham City Council",
      pollutants: ["BC"],
      status: "active",
      daqi: null,
      siteType: "Urban background",
      startDate: "2018-08-23"
    },

    // ➕ Wicken Fen (BC)
    {
      id: 300362,
      name: "Wicken Fen",
      lat: 52.298500,
      lng: 0.290917,
      authority: "East Cambridgeshire District Council",
      pollutants: ["BC"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "1997-10-15"
    },

    // ➕ Detling (BC)
    {
      id: 300481,
      name: "Detling",
      lat: 51.307938,
      lng: 0.582650,
      authority: "Maidstone Borough Council",
      pollutants: ["BC"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2004-10-01"
    },

    // ➕ Auchencorth Moss (BC)
    {
      id: 6803,
      name: "Auchencorth Moss",
      lat: 55.792160,
      lng: -3.242900,
      authority: "Midlothian Council",
      pollutants: ["BC"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2011-01-01"
    },

    // ➕ Chilbolton Observatory (BC)
    {
      id: 6804,
      name: "Chilbolton Observatory",
      lat: 51.149617,
      lng: -1.438228,
      authority: "Hampshire County Council",
      pollutants: ["BC"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2016-01-11"
    }
  ],

  // NEW: Particles (number/size)
  [NETWORK.PARTICLE_NUMBER]: [
    { id: 6901, name: "Particle number London", lat: 51.514, lng: -0.077, authority: "City of London Corporation", pollutants: ["PN"], status: "active", daqi: null, siteType: "Urban background", startDate: "2014-01-01" },
    { id: 6902, name: "Particle number Manchester", lat: 53.4776, lng: -2.2374, authority: "Manchester City Council", pollutants: ["PN"], status: "active", daqi: null, siteType: "Urban traffic", startDate: "2017-01-01" },

    // ➕ Particle number Auchencorth Moss
    {
      id: 6903,
      name: "Auchencorth Moss",
      lat: 55.792160,
      lng: -3.242900,
      authority: "Midlothian Council",
      pollutants: ["PN"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2011-01-01"
    },

    // ➕ Particle number Chilbolton Observatory
    {
      id: 6904,
      name: "Chilbolton Observatory",
      lat: 51.149617,
      lng: -1.438228,
      authority: "Hampshire County Council",
      pollutants: ["PN"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2016-01-11"
    }
  ]
};




// Current selected network (default AURN)
let selectedNetwork = NETWORK.AURN;

// Helper: compute available networks from selected pollutants
function getAvailableNetworks() {
  // If user is in pollutant checkbox mode, use your existing pollutant->networks logic
  if (filterState.mode === 'pollutant') {
    const out = new Set();
    out.add(NETWORK.AURN);
    out.add(NETWORK.LOCAL);

    const selectedPollutantsSet = filterState.selected;
    if (selectedPollutantsSet && selectedPollutantsSet.size) {
      selectedPollutantsSet.forEach((p) => {
        (POLLUTANT_NETWORKS[p] || []).forEach(n => out.add(n));
      });
    }

    const ordered = [
      NETWORK.AURN,
      NETWORK.URBAN_NO2,
      NETWORK.RURAL_NO2,
      NETWORK.ACID_GAS,
      NETWORK.MARGA,
      NETWORK.LOCAL
    ].filter(n => out.has(n));

    return ordered;
  }

  // If user is in pollutant group mode, use the group->networks mapping
  const groupKey = filterState.groupKey || 'regulation';
  const list = POLLUTANT_GROUP_NETWORKS[groupKey] || [];

  // preserve your UI ordering preference (near -> other_defra -> non_defra)
  const ordered = [
    NETWORK.AURN,
    NETWORK.AUTO_HC,
    NETWORK.URBAN_NO2,
    NETWORK.RURAL_NO2,
    NETWORK.ACID_GAS,
    NETWORK.AGANET,
    NETWORK.MARGA,
    NETWORK.PRECIPNET,
    NETWORK.NAMN,
    NETWORK.RURAL_MERCURY,
    NETWORK.HEAVY_METALS,
    NETWORK.PAH,
    NETWORK.BLACK_CARBON,
    NETWORK.PARTICLE_NUMBER,
    NETWORK.NONAUTO_HC,
    NETWORK.LOCAL
  ].filter(n => list.includes(n));

  return ordered.length ? ordered : list;
}



// --- Filtering state + registry ---
const DAQI_CODES = ['PM2.5','PM10','NO2','O3','SO2'];
const AQS_CODES  = [...DAQI_CODES, 'NO','NOx','CO'];

// Default: pollutant mode, all 5 checked
let filterState = {
  mode: 'pollutant',                 // 'pollutant' | 'group'
  group: 'daqi',                     // just informational for your group UI
  selected: new Set(DAQI_CODES)      // used when mode === 'pollutant'
};

// Expose map/dataset switching to the menu code
let aqMapApi = null;

// Map feature: show/hide closed + inactive stations (default = show them)
let showClosedAndInactiveStations = true;


const markerRegistry = []; // [{ station, marker, inner, label }]

function stationMatches(station, state) {
  if (!state) return true;

  // NEW: Map feature filter (hide inactive/closed)
  if (!showClosedAndInactiveStations && station.status !== 'active') {
    return false;
  }

  // Group selection shows all stations (as per your current behaviour)
  if (state.mode === 'group') return true;

  // Pollutant checkbox mode:
  // show station if it monitors at least ONE selected pollutant
  if (state.mode === 'pollutant') {
    const selected = state.selected;
    if (!selected || selected.size === 0) return false; // none checked -> show none
    return station.pollutants.some(p => selected.has(p));
  }

  return true;
}


function applyFilter() {
  markerRegistry.forEach(({ station, marker }) => {
    const visible = stationMatches(station, filterState);
    marker.getElement().style.display = visible ? '' : 'none';
  });
}

// Keep existing signature for group usage
function setFilter(mode, value) {
  if (mode === 'group') {
    filterState.mode = 'group';
    filterState.group = value; // 'daqi' or 'aqs' (informational)
  } else if (mode === 'pollutant') {
    filterState.mode = 'pollutant';
    // value should be a Set of pollutant codes
    filterState.selected = value instanceof Set ? value : new Set(value || []);
  }
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

  <p class="govuk-!-margin-bottom-3 govuk-!-margin-top-3"><a href="/version-12/station/station.html" class="govuk-link">View and download data</a></p>
  <p class="govuk-!-margin-bottom-0">  <a href="/version-12/station/pm10-graph.html" role="button" id="map-btn" class="aq-button-secondary aq-button-secondary--icon">
                <span class="aq-button-secondary__icon">
                  <svg focusable="false" width="20" height="20" viewBox="0 0 20 20">
          <path d="M2.75 14.443v2.791H18v1.5H1.25V1.984h1.5v7.967L6.789 4.91l5.016 4.013 5.056-5.899 2.278 1.952-6.944 8.101L7.211 9.09 2.75 14.443z"></path>
        </svg>
                </span>
                <span class="aq-button-secondary__text" style="padding-left: 5px;">
                  View graph of pollution levels</span>
                  <span class="govuk-visually-hidden">
                  (Visual only)
                </span>
              </a>
              </p>
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
  updateZoomButtons();

  // Build initial dataset (AURN)
  buildMarkersFromStations(NETWORK_DATASETS[selectedNetwork] || mockStations);

  // Apply filter default (pollutant mode, all checked)
  setFilter('pollutant', filterState.selected);

  // Provide API for menu to switch dataset
  aqMapApi = {
    setNetwork(nextNetwork) {
      selectedNetwork = nextNetwork || NETWORK.AURN;
      buildMarkersFromStations(NETWORK_DATASETS[selectedNetwork] || mockStations);
    }
  };
});

function buildMarkersFromStations(stations) {
  // Remove existing markers
  markerRegistry.forEach(({ marker }) => marker.remove());
  markerRegistry.length = 0;

  stations.forEach((station) => {
    const markerContainer = document.createElement('div');
    markerContainer.className = 'station-marker-container';
    markerContainer.setAttribute('role', 'button');
    markerContainer.setAttribute('tabindex', '0');
    markerContainer.setAttribute('aria-label', `${station.name} monitoring station`);

    const inner = document.createElement('div');
    inner.className = 'station-marker-inner';
    inner.style.backgroundColor = getStatusColor(station.status);
    inner.style.width = '24px';
    inner.style.height = '24px';
    inner.style.borderRadius = '50%';
    inner.style.border = '3px solid white';
    inner.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
    inner.style.position = 'relative';
    markerContainer.appendChild(inner);

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
    label.style.display = 'none';
    inner.appendChild(label);

    // Keep ONLY one click + keydown handler
    markerContainer.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      lastTrigger = markerContainer;
      selectMarker(inner);
      showStationInfo(station);
    });

    markerContainer.addEventListener('keydown', (e) => {
      const isEnter = e.key === 'Enter';
      const isSpace = e.key === ' ' || e.code === 'Space' || e.key === 'Spacebar';
      if (isEnter || isSpace) {
        e.preventDefault(); e.stopPropagation();
        lastTrigger = markerContainer;
        selectMarker(inner);
        showStationInfo(station);
      }
    });

    markerContainer.addEventListener('focus', () => {
      inner.style.outline = '3px solid #ffdd00';
      inner.style.outlineOffset = '2px';
    });
    markerContainer.addEventListener('blur', () => { inner.style.outline = 'none'; });

    const marker = new maplibregl.Marker({ element: markerContainer, anchor: 'center' })
      .setLngLat([station.lng, station.lat])
      .addTo(map);

    markerRegistry.push({ station, marker, inner, label });
  });

  // Apply current filter and marker appearance after rebuild
  applyFilter();
  updateAllMarkers();
}

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
      // Go back to previous page if there is one
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // Fallback if opened as a direct entry page
       window.location.href = 'hub.html';
    }
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
// UI: "groups" vs "pollutant" + pollutant checkboxes
// -----------------------------
document.addEventListener('DOMContentLoaded', () => {
  initPollutantPanels();
});

function initPollutantPanels() {
  // Track all pollutant mounts so we can keep panels in sync
  const pollutantMounts = [];

  setupPanel(document.querySelector('#floating-panel #mobile-key-panel'));
  setupPanel(document.getElementById('mobile-key-panel-bottom'));

  // Sync initial UI state
  syncAllPollutantCheckboxes();
  // Render data sources for any panel currently showing pollutant mode
  pollutantMounts.forEach(({ root, mount, uiId }) => {
    if (mount.querySelector('.govuk-checkboxes__input[type="checkbox"]')) {
      renderDataSources(root, mount, uiId);
    }
  });

  function setupPanel(root) {
    if (!root) return;

    const extBtn   = root.querySelector('.ext-btn');
    const depthBtn = root.querySelector('.depth-btn');
    const mount    = root.querySelector('.radio-mount');

    if (!extBtn || !depthBtn || !mount) return;

    const uiId = `pollutant-ui-${Math.random().toString(36).slice(2, 8)}`;
    pollutantMounts.push({ root, mount, uiId });

    function setPressed(btn, pressed) {
      btn.setAttribute('aria-pressed', pressed ? 'true' : 'false');
      btn.classList.toggle('is-active', !!pressed);
    }

    function showMode(mode) {
      if (mode === 'groups') {
        setPressed(extBtn, true);
        setPressed(depthBtn, false);
        renderGroups();
      } else {
        setPressed(extBtn, false);
        setPressed(depthBtn, true);
        renderPollutants();
        syncAllPollutantCheckboxes();
        renderDataSources(root, mount, uiId);
      }
    }

  function renderGroups() {
  // Important: we’re using groupKey to drive data sources
  filterState.mode = 'group';
  if (!filterState.groupKey) filterState.groupKey = 'regulation';

  const GROUPS = [
    {
      key: 'regulation',
      title: 'Regulation pollutants',
      hint: 'PM2.5, PM10, NO2, O3, SO2, NO, NOx as NO2 and CO'
    },
    {
      key: 'vocs',
      title: 'Volatile organic compounds (VOCs)',
      hint: 'benzene and other hydrocarbons'
    },
    {
      key: 'heavy_metals',
      title: 'Heavy metals in air (PM10)',
      hint: 'arsenic (As), cadmium (Cd), chromium (Cr), cobalt (Co), copper (Cu), iron (Fe), lead (Pb), manganese (Mn), nickel (Ni), selenium (Se), vanadium (V), zinc (Zn)'
    },
    {
      key: 'pahs',
      title: 'Polycyclic aromatic hydrocarbons (PAHs)',
      hint: 'benzo(a)pyrene, benzo(a)anthracene, benzo(b)-/benzo(j)-/benzo(k)fluoranthene, indeno(1,2,3-cd)pyrene, dibenzo(ah)-/dibenzo(ac)anthracene, benzo(b+j)fluoranthene, 1-/2-methyl naphthalene, 1-/2-methyl anthracene, 1-methyl phenanthrene, 2-methyl phenanthrene, 4,5-methylene phenanthrene, 5-methyl chrysene, 9-methyl anthracene'
    },
    {
      key: 'ammonia',
      title: 'Ammonia',
      hint: 'gaseous ammonia NH3 (active, passive and diffusion tube) and particulate ammonium (NH4)'
    },
    {
      key: 'ions_acids',
      title: 'Particulate ions and acid gases',
      hint: 'particulates'
    },
    {
      key: 'precipitation',
      title: 'Precipitation chemistry',
      hint: 'aluminium (Al), antimony (Sb), arsenic (As), barium (Ba), beryllium (Be), cadmium (Cd), caesium (Cs), chromium (Cr), cobalt (Co), copper (Cu), iron (Fe), lead (Pb), lithium (Li), manganese (Mn), mercury (Hg), molybdenum (Mo), nickel (Ni), rubidium (Rb), selenium (Se), strontium (Sr), tin (Sn), titanium (Ti), tungsten (W), uranium (U), vanadium (V), zinc (Zn)'
    },
    {
      key: 'mercury',
      title: 'Mercury',
      hint: 'elemental mercury (Hg), reactive mercury (Hg), mercury in PM2.5 (Hg)'
    },
    {
      key: 'black_carbon',
      title: 'Black carbon',
      hint: 'black carbon (BC)'
    },
    {
      key: 'particles',
      title: 'Particles',
      hint: 'particle number / size (PN)'
    }
  ];

  const groupName = `${uiId}-pollutant-group`;

  mount.innerHTML = `
    <fieldset class="govuk-fieldset">
      <legend class="govuk-visually-hidden">Select a pollutant group</legend>

      <div class="govuk-radios govuk-radios--small" data-module="govuk-radios">
        ${GROUPS.map((g, idx) => {
          const id = `${uiId}-grp-${idx}`;
          const checked = (filterState.groupKey === g.key) ? 'checked' : '';
          const hintId = `${id}-hint`;
          return `
            <div class="govuk-radios__item" style="margin-bottom:5px;">
              <input class="govuk-radios__input"
                     id="${id}"
                     name="${groupName}"
                     type="radio"
                     value="${g.key}"
                     ${checked}
                     aria-describedby="${hintId}">
              <label class="govuk-label govuk-radios__label" for="${id}">
                ${g.title}
              </label>
              <div class="govuk-hint govuk-radios__hint pollutant-group-hint"
                    id="${hintId}"
                    hidden
                    style="display:none; margin-top:2px; margin-left:20px;">
                    ${g.hint}
                  </div>
            </div>
          `;
        }).join('')}
      </div>
    </fieldset>
  `;

  updateGroupHints();

    function updateGroupHints() {
  const radios = Array.from(mount.querySelectorAll(`input[name="${groupName}"]`));

  radios.forEach((radio) => {
    const hintId = `${radio.id}-hint`;
    const hintEl = mount.querySelector(`#${CSS.escape(hintId)}`);
    if (!hintEl) return;

    hintEl.style.display = radio.checked ? 'block' : 'none';
  });
}




  // Group mode shows all stations (your current behaviour)
  applyFilter();

  // Ensure data sources reflect the selected group
  renderDataSources(root, mount, uiId);

  // Bind change
  mount.querySelectorAll(`input[name="${groupName}"]`).forEach((r) => {
  r.addEventListener('change', () => {
    if (!r.checked) return;

    filterState.mode = 'group';
    filterState.groupKey = r.value;

    updateGroupHints();

    const available = getAvailableNetworks();
    selectedNetwork = available.includes(selectedNetwork) ? selectedNetwork : (available[0] || NETWORK.AURN);

    if (aqMapApi && typeof aqMapApi.setNetwork === 'function') {
      aqMapApi.setNetwork(selectedNetwork);
    }

    // ✅ User has interacted with filters
    hasUserInteractedWithFilters = true;

    requestAnimationFrame(updateGroupHints);
    renderDataSources(root, mount, uiId);
    applyFilter();
  });
});

}




    function renderPollutants() {
      const pollutants = [
        { code: 'PM2.5', label: 'Fine particulate matter (PM2.5)' },
        { code: 'PM10',  label: 'Particulate matter (PM10)' },
        { code: 'NO2',   label: 'Nitrogen dioxide (NO2)' },
        { code: 'O3',    label: 'Ozone (O3)' },
        { code: 'SO2',   label: 'Sulphur dioxide (SO2)' }
      ];

      if (!filterState.selected || filterState.selected.size === 0) {
        filterState.selected = new Set(DAQI_CODES);
      }

      mount.innerHTML = `
        <fieldset class="govuk-fieldset">
          <legend class="govuk-visually-hidden">Select pollutants</legend>
          <div class="govuk-checkboxes govuk-checkboxes--small" data-module="govuk-checkboxes">
            ${pollutants.map((p, idx) => {
              const id = `${uiId}-p-${idx}`;
              const checked = filterState.selected.has(p.code) ? 'checked' : '';
              return `
                <div class="govuk-checkboxes__item">
                  <input class="govuk-checkboxes__input" id="${id}" type="checkbox" value="${p.code}" ${checked}>
                  <label class="govuk-label govuk-checkboxes__label" for="${id}">
                    ${p.label}
                  </label>
                </div>
              `;
            }).join('')}
          </div>
        </fieldset>
      `;

      // Bind once per mount element
      if (!mount.dataset.pollutantCheckboxBound) {
       mount.addEventListener('change', (e) => {
        const target = e.target;
        if (!target || !target.matches('.govuk-checkboxes__input[type="checkbox"]')) return;

        const selected = new Set(
          Array.from(mount.querySelectorAll('.govuk-checkboxes__input[type="checkbox"]:checked'))
            .map(cb => cb.value)
        );

        setFilter('pollutant', selected);

        // ✅ User has interacted with filters now
        hasUserInteractedWithFilters = true;

        renderDataSources(root, mount, uiId);
        syncAllPollutantCheckboxes();
      });


        mount.dataset.pollutantCheckboxBound = 'true';
      }

      filterState.mode = 'pollutant';
      applyFilter();

    }

    extBtn.addEventListener('click', (e) => {
      e.preventDefault();

      filterState.mode = 'group';
      filterState.groupKey = 'regulation';

      hasUserInteractedWithFilters = true; // ✅
      showMode('groups');
    });

    depthBtn.addEventListener('click', (e) => {
      e.preventDefault();

      hasUserInteractedWithFilters = true; // ✅
      showMode('pollutant');
    });


        showMode('pollutant');
      }

  function syncAllPollutantCheckboxes() {
    if (!filterState.selected) return;

    pollutantMounts.forEach(({ mount }) => {
      const boxes = mount.querySelectorAll('.govuk-checkboxes__input[type="checkbox"]');
      if (!boxes.length) return;
      boxes.forEach(cb => { cb.checked = filterState.selected.has(cb.value); });
    });
  }
}

// Tracks whether the user has interacted with pollutant/group filters yet
let hasUserInteractedWithFilters = false;

function renderDataSources(root, mount, uiId) {
  // NEW: scroll container – where all dynamic content will live
  const scrollContainer =
    root.querySelector('.panel-scroll') || mount.parentElement;

  // Remove existing instances from *inside* the scroll container
  scrollContainer.querySelector(`#${uiId}-data-sources`)?.remove();
  scrollContainer.querySelector(`#${uiId}-map-features`)?.remove();

  // --- Determine which networks to show in the radios ---
  function getAvailableNetworksForUi() {
    // VOCs group: only hydrocarbon networks
    if (filterState.mode === 'group' && filterState.groupKey === 'vocs') {
      return [NETWORK.AUTO_HC, NETWORK.NONAUTO_HC];
    }

    // Regulation group: treat as “all DAQI pollutants selected”
    if (filterState.mode === 'group' && filterState.groupKey === 'regulation') {
      return getAvailableNetworks(new Set(DAQI_CODES));
    }

    // Pollutant mode: use actual selected checkboxes
    return getAvailableNetworks(filterState.selected);
  }

  const availableNetworks = getAvailableNetworksForUi();

  // Ensure selectedNetwork is valid for this view
  if (!availableNetworks.includes(selectedNetwork)) {
    selectedNetwork =
      (filterState.mode === 'group' && filterState.groupKey === 'vocs')
        ? NETWORK.AUTO_HC
        : NETWORK.AURN;

    if (aqMapApi && typeof aqMapApi.setNetwork === 'function') {
      aqMapApi.setNetwork(selectedNetwork);
    }
  }

  // -------------------------
  // Data sources (details)
  // -------------------------
    const details = document.createElement('details');
    details.className = 'govuk-details govuk-!-margin-top-3 govuk-!-margin-bottom-3';
    details.id = `${uiId}-data-sources`;

    // 👇 Start closed on page load; open after the user interacts
    details.open = hasUserInteractedWithFilters;



  details.innerHTML = `
    <summary class="govuk-details__summary">
      <span class="govuk-details__summary-text">Data sources</span>
    </summary>
    <div class="govuk-details__text">
      ${renderNetworkRadioGroupsHtml(uiId, availableNetworks)}
    </div>
  `;

  // Add into scroll area (⬅️ key change)
  scrollContainer.appendChild(details);

  const groupName = `${uiId}-networks`;

  // Bind radio change listener
  details.querySelectorAll(`input[name="${groupName}"]`).forEach((r) => {
    r.addEventListener('change', () => {
      if (!r.checked) return;

      selectedNetwork = r.value;

      if (aqMapApi && typeof aqMapApi.setNetwork === 'function') {
        aqMapApi.setNetwork(selectedNetwork);
      }

      // Re-render to ensure DAQI toggle appears/disappears correctly
      renderDataSources(root, mount, uiId);
    });
  });

  // Bind DAQI toggle IF present (only when AURN available & selected)
  const daqiId = `${uiId}-show-daqi-aurn`;
  const daqiCb = details.querySelector(`#${daqiId}`);
  daqiCb?.addEventListener('change', () => {
    colourByDaqi = !!daqiCb.checked;
    updateAllMarkers();
    renderKeyOverlay();
  });

  // -------------------------
  // Map features (details)
  // -------------------------
  const features = document.createElement('details');
  features.className = 'govuk-details govuk-!-margin-top-0 govuk-!-margin-bottom-0';
  features.id = `${uiId}-map-features`;
  features.open = false;

  const showStatusId = `${uiId}-show-closed-inactive`;

  features.innerHTML = `
    <summary class="govuk-details__summary">
      <span class="govuk-details__summary-text">Map features</span>
    </summary>
    <div class="govuk-details__text">
      <div class="govuk-checkboxes govuk-checkboxes--small" data-module="govuk-checkboxes">
        <div class="govuk-checkboxes__item">
          <input
            class="govuk-checkboxes__input"
            id="${showStatusId}"
            type="checkbox"
            ${showClosedAndInactiveStations ? 'checked' : ''}>
          <label class="govuk-label govuk-checkboxes__label" for="${showStatusId}">
            Show closed and inactive stations
          </label>
        </div>
      </div>
    </div>
  `;

  // Add into scroll area (⬅️ key change)
  scrollContainer.appendChild(features);

  // Bind show/hide closed+inactive
  const statusCb = root.querySelector(`#${showStatusId}`);
  statusCb?.addEventListener('change', () => {
    showClosedAndInactiveStations = !!statusCb.checked;
    applyFilter();
  });
}


function renderNetworkRadioGroupsHtml(uiId, availableNetworks) {
  const name = `${uiId}-networks`;

 const isVocs = availableNetworks.includes(NETWORK.AUTO_HC) || availableNetworks.includes(NETWORK.NONAUTO_HC);

const groups = {
  near: {
    heading: isVocs ? 'Near real-time data' : 'Near real-time data (Defra)',
    items: []
  },
  other_defra: {
    heading: isVocs ? 'Other data' : 'Other data (Defra)',
    items: []
  },
  non_defra: {
    heading: 'Non-Defra data',
    items: []
  }
};


  availableNetworks.forEach((n) => {
    const meta = NETWORK_META[n];
    if (!meta) return;
    groups[meta.group].items.push(n);
  });

  const ordered = ['near', 'other_defra', 'non_defra'];

  function renderRadioItem(n, idx) {
    const id = `${uiId}-net-${n}-${idx}`;
    const checked = (n === selectedNetwork) ? 'checked' : '';

    // Only show DAQI checkbox when:
    // - AURN is available in the current list AND
    // - This specific radio is AURN AND
    // - AURN is currently selected (keeps it visually “under” the AURN choice)
    const showDaqiUnderThis =
      availableNetworks.includes(NETWORK.AURN) &&
      n === NETWORK.AURN &&
      selectedNetwork === NETWORK.AURN;

    const daqiId = `${uiId}-show-daqi-aurn`;

    return `
      <div class="govuk-radios__item">
        <input class="govuk-radios__input" id="${id}" name="${name}" type="radio" value="${n}" ${checked}>
        <label class="govuk-label govuk-radios__label" for="${id}">
          ${NETWORK_META[n].label}
        </label>

        ${showDaqiUnderThis ? `
          <div class="govuk-checkboxes govuk-checkboxes--small govuk-!-margin-top-2" data-module="govuk-checkboxes">
            <div class="govuk-checkboxes__item">
              <input
                class="govuk-checkboxes__input"
                id="${daqiId}"
                type="checkbox"
                ${colourByDaqi ? 'checked' : ''}>
              <label class="govuk-label govuk-checkboxes__label" for="${daqiId}">
                Show Daily Air Quality Index (DAQI)
              </label>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  function radiosFor(list) {
    return list.map((n, idx) => renderRadioItem(n, idx)).join('');
  }

  return ordered
    .filter(key => groups[key].items.length > 0)
    .map(key => `
      <div class="govuk-!-margin-bottom-3">
        <p class="govuk-body-s govuk-!-margin-bottom-1"><strong>${groups[key].heading}</strong></p>
        <div class="govuk-radios govuk-radios--small" data-module="govuk-radios">
          ${radiosFor(groups[key].items)}
        </div>
      </div>
    `).join('');
}





