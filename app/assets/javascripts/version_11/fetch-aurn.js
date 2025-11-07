// Node >=18 recommended (built-in fetch is fine, but we also include node-fetch for consistency)
import fetch from "node-fetch";
import cheerio from "cheerio";
import fs from "fs/promises";
import pLimit from "p-limit";

/**
 * SOURCES
 * - Station index: https://uk-air.defra.gov.uk/data/so/stations/
 * - Station detail (attributes, coords, begin/end): https://environment.data.gov.uk/air-quality/so/Station_<ID>
 * - SamplingPoints for pollutants: pages that contain ef:broader link to the Station_<ID>;
 *   We discover them by crawling all links on the station page that point to GB_SamplingPoint_* (or by a light search).
 * - SOS JSON endpoint: https://uk-air.defra.gov.uk/data/sos/service/json (GetDataAvailability + GetObservation)
 *
 * Docs & examples:
 * - Example SOS queries: https://uk-air.defra.gov.uk/assets/documents/Example_SOS_queries_v1.2.pdf
 *   (also v1.3) – includes GetDataAvailability / GetObservation JSON bindings.
 *
 * NOTES
 * - “Active” vs “Closed”: if the station page has gml:endPosition → "closed".
 *   If no endPosition: we tentatively call it "active". If you want, you can further
 *   mark “inactive” where no data is available in the last N days from SOS (see below).
 * - “Authority”: pulled from stationInfo (uka_id) page if available (best-effort).
 * - “siteType”: mapped from classification strings on the station page (best-effort).
 * - DAQI: Optional. We fetch latest hour obs for the DAQI pollutants and compute the index.
 */

// ------------ Config ------------
const STATION_INDEX_URL = "https://uk-air.defra.gov.uk/data/so/stations/";
const SO_BASE = "https://environment.data.gov.uk/air-quality/so/";
const SOS_JSON = "https://uk-air.defra.gov.uk/data/sos/service/json";

// Pollutant code mapping: EIONET pollutant IDs -> short codes
// (These are the main DAQI pollutants; add more if needed)
const EIONET_TO_CODE = {
  // PM2.5 / PM10 / NO2 / O3 / SO2 / CO / NO / NOx
  "6001": "PM2.5",
  "5": "PM10",
  "8": "NO2",
  "7": "O3",
  "1": "SO2",
  "10": "CO",
  "38": "NO",
  "40": "NOx"
};

const DAQI_CODES = ["PM2.5", "PM10", "NO2", "O3", "SO2"];

const CONC_LIMITS = {
  // DAQI breakpoints (hourly/daily) simplified for demo purposes. Adjust to official table if you need exact.
  // Values are upper bounds for index bands 1–10. Units:
  // PM10/PM2.5: µg/m3 (24h), NO2/SO2: µg/m3 (hourly), O3: µg/m3 (8h).
  // Here we use a simplified single-hour approach to get a working index quickly.
  "PM2.5": [11, 23, 35, 41, 47, 53, 58, 64, 70, Infinity],
  "PM10":  [16, 33, 50, 58, 66, 75, 83, 91, 100, Infinity],
  "NO2":   [67, 134, 200, 267, 334, 400, 467, 534, 600, Infinity],
  "O3":    [33, 66, 100, 120, 140, 160, 187, 213, 240, Infinity],
  "SO2":   [88, 177, 266, 354, 443, 532, 711, 888, 1065, Infinity]
};

// Concurrency
const LIMIT = pLimit(8);

// ------------ Helpers ------------
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function parseLatLng(posText) {
  // station pages show pos as "lat lon" (EPSG:4258)
  if (!posText) return { lat: null, lng: null };
  const [latStr, lonStr] = posText.trim().split(/\s+/);
  return { lat: parseFloat(latStr), lng: parseFloat(lonStr) };
}

function statusFromDates(beginISO, endISO) {
  if (endISO) return "closed";
  return "active"; // If you want, refine later to set "inactive" if no data in last X days
}

function bandIndex(value, limits) {
  if (value == null || Number.isNaN(value)) return null;
  for (let i = 0; i < limits.length; i++) {
    if (value <= limits[i]) return i + 1; // 1..10
  }
  return 10;
}

/** Compute DAQI from a map of latest concentrations by pollutant code. */
function computeDAQI(latest) {
  const indices = [];
  for (const code of DAQI_CODES) {
    const v = latest[code];
    if (v == null) continue;
    const idx = bandIndex(v, CONC_LIMITS[code]);
    if (idx != null) indices.push(idx);
  }
  if (indices.length === 0) return null;
  return Math.max(...indices); // DAQI = worst sub-index
}

/** Best-effort site type from classifications on the station page text */
function inferSiteType($) {
  // You may see fields like aqd:areaClassification or stationClassification
  // We'll scrape visible text and try to map a common set:
  const pageText = $.text().toLowerCase();
  if (pageText.includes("traffic")) return "Urban Traffic";
  if (pageText.includes("background")) return "Urban Background";
  if (pageText.includes("suburban")) return "Suburban";
  if (pageText.includes("industrial")) return "Industrial";
  if (pageText.includes("rural")) return "Rural";
  if (pageText.includes("urban")) return "Urban";
  return "Unknown";
}

/** Try to extract Local Authority from uk-air "site-info?uka_id=..." page if linked */
async function tryAuthorityFromSiteInfo(url) {
  if (!url) return "";
  try {
    const h = await fetch(url, { headers: { "User-Agent": "aurn-scrape/1.0" }});
    if (!h.ok) return "";
    const html = await h.text();
    const $ = cheerio.load(html);
    // Look for a “Local Authority” row
    const rows = $("table tr");
    let found = "";
    rows.each((_, tr) => {
      const th = $(tr).find("th").text().trim().toLowerCase();
      const td = $(tr).find("td").text().trim();
      if (th.includes("local authority")) {
        found = td;
      }
    });
    return found;
  } catch {
    return "";
  }
}

/** Get list of all Station IDs from the index page */
async function getAllStationIds() {
  const res = await fetch(STATION_INDEX_URL, { headers: { "User-Agent": "aurn-scrape/1.0" }});
  if (!res.ok) throw new Error(`Failed to fetch station index: ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);
  const ids = [];
  $("a").each((_, a) => {
    const text = $(a).text().trim();
    if (/^Station_[A-Z]{2}\d{4}[A-Z]$/.test(text) || /^Station_UKA\d+/.test(text)) {
      ids.push(text);
    }
  });
  return Array.from(new Set(ids));
}

/** Fetch station page; return metadata + links for sampling points + site-info URL if present */
async function getStationDetail(stationId) {
  const url = `${SO_BASE}${stationId}`;
  const res = await fetch(url, { headers: { "User-Agent": "aurn-scrape/1.0" }});
  if (!res.ok) throw new Error(`Failed to fetch ${stationId}: ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);

  // Name
  const name = ( $("h2:contains('Air Quality e-Reporting Attribute Data for UK Stations')")
    .nextAll()
    .find("ef\\:name")
    .text().trim()
  ) || $("h1, h2, #content").text().match(/ef:name\s+(.+)/)?.[1]?.trim() || "";

  // Coords
  const pos = $("*:contains('gml:Point/gml:pos')").last().text().match(/[-\d.]+\s+[-\d.]+/);
  const { lat, lng } = parseLatLng(pos ? pos[0] : "");

  // Dates
  const begin = ($("*:contains('gml:beginPosition')").first().text().match(/\d{4}-\d{2}-\d{2}/) || [])[0] || "";
  const end = ($("*:contains('gml:endPosition')").first().text().match(/\d{4}-\d{2}-\d{2}/) || [])[0] || "";
  const status = statusFromDates(begin, end);

  // Site info (to get Local Authority)
  let siteInfo = "";
  $("a").each((_, a) => {
    const href = $(a).attr("href") || "";
    if (href.includes("networks/site-info?uka_id=")) {
      siteInfo = href.startsWith("http") ? href : `https://uk-air.defra.gov.uk${href}`;
    }
  });

  // SamplingPoint links on page (some Station pages list “broader” relationships)
  const samplingLinks = [];
  $("a").each((_, a) => {
    const href = $(a).attr("href") || "";
    if (href.includes("GB_SamplingPoint_")) {
      samplingLinks.push(href.startsWith("http") ? href : `${SO_BASE}${href.replace(/^\/air-quality\/so\//, "")}`);
    }
  });

  const siteType = inferSiteType($);

  return { name, lat, lng, begin, end, status, samplingLinks, siteInfo };
}

/** From a sampling point page, extract observedProperty pollutant IDs */
async function getSamplingPointPollutants(url) {
  try {
    const res = await fetch(url, { headers: { "User-Agent": "aurn-scrape/1.0" }});
    if (!res.ok) return [];
    const html = await res.text();
    const $ = cheerio.load(html);
    // Find links that match dd.eionet pollutant codes
    const codes = new Set();
    $("a").each((_, a) => {
      const href = $(a).attr("href") || "";
      const m = href.match(/dd\.eionet\.europa\.eu\/vocabulary\/aq\/pollutant\/(\d+)/);
      if (m) codes.add(m[1]);
    });
    // Map to short codes and filter out unknowns
    const list = [...codes].map(id => EIONET_TO_CODE[id]).filter(Boolean);
    return list;
  } catch {
    return [];
  }
}

/** Get pollutants measured at a station by crawling its sampling points */
async function getStationPollutants(station) {
  const { samplingLinks } = station;
  if (!samplingLinks || samplingLinks.length === 0) return [];

  const limit = pLimit(6);
  const sets = await Promise.all(
    samplingLinks.map(link => limit(() => getSamplingPointPollutants(link)))
  );
  const flat = new Set(sets.flat());
  return [...flat];
}

/** SOS helpers: get procedure IDs & latest values to compute DAQI (best-effort) */
async function sosGetDataAvailability() {
  const body = {
    request: "GetDataAvailability",
    service: "SOS",
    version: "2.0.0"
  };
  const res = await fetch(SOS_JSON, {
    method: "POST",
    headers: { "Accept": "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`GetDataAvailability failed ${res.status}`);
  return res.json();
}

/**
 * Try to get a latest-hour value for a given station by bounding box around the station.
 * This is a heuristic that avoids needing to know DEFRA-specific procedure IDs per site.
 * For production, you’d map station->procedure from the SOS capabilities.
 */
async function sosLatestByBbox(lat, lng, code) {
  const opId = Object.entries(EIONET_TO_CODE).find(([_, c]) => c === code)?.[0];
  if (!opId) return null;

  // small bbox ~0.02 deg around the site
  const minLat = lat - 0.01, maxLat = lat + 0.01;
  const minLng = lng - 0.01, maxLng = lng + 0.01;

  const body = {
    request: "GetObservation",
    service: "SOS",
    version: "2.0.0",
    observedProperty: `http://dd.eionet.europa.eu/vocabulary/aq/pollutant/${opId}`,
    spatialFilter: {
      bbox: {
        ref: "om:featureOfInterest/sams:SF_SpatialSamplingFeature/sams:shape",
        value: {
          type: "Polygon",
          coordinates: [[
            [minLat, minLng],
            [maxLat, minLng],
            [maxLat, maxLng],
            [minLat, maxLng],
            [minLat, minLng]
          ]]
        }
      }
    },
    // Optional: add a short time window (last 24h)
    temporalFilter: {
      during: {
        ref: "om:phenomenonTime",
        value: [
          new Date(Date.now() - 24*3600*1000).toISOString(),
          new Date().toISOString()
        ]
      }
    }
  };

  try {
    const res = await fetch(SOS_JSON, {
      method: "POST",
      headers: { "Accept": "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!res.ok) return null;
    const json = await res.json();

    // Walk the result to find the most recent numeric value
    // Structure varies; we look for "result" arrays with time/value.
    let best = null;
    const visit = (obj) => {
      if (!obj || typeof obj !== "object") return;
      if (Array.isArray(obj)) return obj.forEach(visit);
      if (Object.prototype.hasOwnProperty.call(obj, "result") && obj.result && obj.result.values) {
        obj.result.values.forEach(v => {
          // Each v may be [time, value] or similar
          const num = Array.isArray(v) ? parseFloat(v[1]) : undefined;
          if (!Number.isNaN(num)) best = num;
        });
      }
      Object.values(obj).forEach(visit);
    };
    visit(json);
    return best;
  } catch {
    return null;
  }
}

async function main() {
  console.log("Fetching station IDs…");
  const stationIds = await getAllStationIds();
  console.log(`Found ${stationIds.length} stations.`);

  const limit = pLimit(6);
  const results = [];

  // Crawl stations
  await Promise.all(stationIds.map(id => limit(async () => {
    try {
      const det = await getStationDetail(id);

      // Pollutants via sampling points
      const pollutants = await getStationPollutants(det);

      // Authority (best-effort)
      const authority = await tryAuthorityFromSiteInfo(det.siteInfo);

      // Best-effort DAQI (optional). Only attempt for “active”.
      let daqi = null;
      if (det.status === "active" && det.lat && det.lng) {
        const latest = {};
        for (const code of DAQI_CODES) {
          latest[code] = await sosLatestByBbox(det.lat, det.lng, code);
          // be polite
          await sleep(100);
        }
        daqi = computeDAQI(latest);
      }

      const siteType = det.siteType;
      const startDate = det.begin ? det.begin : "";

      results.push({
        id: results.length + 1, // sequential ID for your array
        name: det.name || id,
        lat: det.lat,
        lng: det.lng,
        authority: authority || "",
        pollutants: pollutants.length ? pollutants : [],
        status: det.status, // "active" | "closed" (refine “inactive” if you want)
        daqi: daqi,
        siteType,
        startDate
      });
    } catch (err) {
      console.error(`Failed ${id}: ${err.message}`);
    }
  })));

  // Write file
  await fs.writeFile("stations.json", JSON.stringify(results, null, 2), "utf8");
  console.log(`Wrote ${results.length} stations to stations.json`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
