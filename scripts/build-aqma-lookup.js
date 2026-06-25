// Fetches the UK Air AQMA list and builds a lookup JSON
// keyed by AQMA name: { localAuthority, pollutants[], declarationDate, amendmentDate, status }
// Run with: node scripts/build-aqma-lookup.js

const https = require('https');
const fs    = require('fs');
const path  = require('path');

const URL  = 'https://uk-air.defra.gov.uk/aqma/list?la=all&country=all&pollutant=all';
const OUT  = path.join(__dirname, '../app/data/aqma-lookup.json');

function formatDate(ddmmyyyy) {
  if (!ddmmyyyy || ddmmyyyy === '-') return '';
  const [d, m, y] = ddmmyyyy.split('/');
  if (!d || !m || !y) return ddmmyyyy;
  const months = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];
  return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`;
}

function normalisePollutants(raw) {
  const set = new Set();
  if (/nitrogen dioxide/i.test(raw))       set.add('Nitrogen dioxide (NO2)');
  if (/particulate matter pm10/i.test(raw)) set.add('Particulate matter (PM10)');
  if (/particulate matter pm2/i.test(raw))  set.add('Particulate matter (PM2.5)');
  if (/sulphur dioxide/i.test(raw))        set.add('Sulphur dioxide (SO2)');
  if (/benzene/i.test(raw))               set.add('Benzene');
  if (/carbon monoxide/i.test(raw))        set.add('Carbon monoxide (CO)');
  return [...set];
}

https.get(URL, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
  let html = '';
  res.on('data', chunk => html += chunk);
  res.on('end', () => {
    // Extract table rows: <tr>…<td>…</td>…</tr>
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    const stripTags = s => s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

    const lookup = {};
    let match;
    while ((match = rowRegex.exec(html)) !== null) {
      const rowHtml = match[1];
      const cells = [];
      let cm;
      const cellIter = new RegExp(cellRegex.source, 'gi');
      while ((cm = cellIter.exec(rowHtml)) !== null) {
        cells.push(stripTags(cm[1]));
      }
      if (cells.length < 4) continue;
      const localAuthority  = cells[0];
      const name            = cells[1];
      const pollutantsRaw   = cells[2];
      const declarationDate = cells[3];
      const amendmentDate   = cells[4] || '';

      if (!name || !localAuthority) continue;

      const status = (!amendmentDate || amendmentDate === '-') ? 'Active' : 'Active'; 
      // Note: amendment date ≠ revocation; all listed are considered active unless revoked
      // The "revoked" list is separate on UK Air. Here we treat all as active.

      lookup[name] = {
        localAuthority,
        pollutants: normalisePollutants(pollutantsRaw),
        declarationDate: formatDate(declarationDate),
        amendmentDate: (amendmentDate && amendmentDate !== '-') ? formatDate(amendmentDate) : '',
        status: 'active'
      };
    }

    const count = Object.keys(lookup).length;
    fs.writeFileSync(OUT, JSON.stringify(lookup, null, 2));
    console.log(`Written ${count} entries to ${OUT}`);
  });
}).on('error', err => {
  console.error('Fetch failed:', err.message);
});
