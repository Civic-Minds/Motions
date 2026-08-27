/**
 * geocode_addresses.js
 *
 * Extracts all street addresses from motion titles, geocodes them via
 * Nominatim (free, no API key), and stores results as:
 *   motion.locations = [{ address, lat, lng }, ...]
 *
 * Incremental — skips motions that already have a `locations` field.
 * False positives (bylaw numbers etc.) are silently dropped when
 * Nominatim returns no results.
 *
 * Usage:
 *   node scripts/geocode_addresses.js
 *   node scripts/geocode_addresses.js --limit=10   (test run)
 *   node scripts/geocode_addresses.js --force       (re-geocode all)
 *
 * Rate limit: 1 req/s per Nominatim policy.
 */

import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'public/data/motions.json');

const args = Object.fromEntries(
  process.argv.slice(2)
    .filter(a => a.startsWith('--'))
    .map(a => { const [k, v] = a.slice(2).split('='); return [k, v ?? true]; })
);
const LIMIT = args['limit'] ? parseInt(args['limit'], 10) : Infinity;
const FORCE = !!args['force'];
const IDS = args['ids'] ? new Set(String(args['ids']).split(',').map(id => id.trim())) : null;
const SAVE_EVERY = 20;

// Matches: "2775 Jane Street", "641 to 663 Danforth Road East",
//          "4884-4896 Dundas Street West", "150 The Donway West"
const ADDRESS_RE = /\b(\d{1,5}(?:\s*(?:to|-|–)\s*\d{1,5})?\s+(?:The\s+)?[A-Z][a-zA-Z.'-]*(?:\s+[A-Z][a-zA-Z.'-]*){0,4}\s+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Boulevard|Blvd|Lane|Ln|Court|Ct|Way|Crescent|Cres|Place|Pl|Trail|Terrace|Gate|Path|Circle|Parkway|Pkwy|Square|Sq|Expressway|Promenade|Esplanade)(?:\.)?(?:\s+(?:East|West|North|South))?)\b/gi;
const GROUPED_ADDRESS_RE = /\b((?:\d{1,5}(?:(?:\s*,\s*|\s+and\s+|\s*&\s*)\d{1,5})+))\s+((?:The\s+)?[A-Z][a-zA-Z.'-]*(?:\s+[A-Z][a-zA-Z.'-]*){0,4}\s+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Boulevard|Blvd|Lane|Ln|Court|Ct|Way|Crescent|Cres|Place|Pl|Trail|Terrace|Gate|Path|Circle|Parkway|Pkwy|Square|Sq|Expressway|Promenade|Esplanade)(?:\.)?(?:\s+(?:East|West|North|South))?)/gi;

// Verified fallbacks for addresses that the public geocoders sometimes return
// only as an unnamed road or fail to return at all.
const KNOWN_LOCATIONS_BY_ADDRESS = {
  '701 Fleet Street': { lat: 43.6361243, lng: -79.4019812 },
  '60 Guildwood Parkway': { lat: 43.746874, lng: -79.2031135 },
  '251 Staines Road': { lat: 43.793583, lng: -79.232139 },
  '311 Staines Road': { lat: 43.793583, lng: -79.232139 },
};

const KNOWN_LOCATIONS_BY_MOTION_ID = {
  // TTC16.4 names Yorkdale Station but contains no street address.
  'TTC16.4': { address: 'Yorkdale Station', lat: 43.7246418, lng: -79.4475031, source: 'verified-place' },
  // These motions name a specific place but do not include a street number.
  'PH32.7': { address: 'Billy Bishop Toronto City Airport', lat: 43.6280558, lng: -79.3979969, source: 'verified-place' },
  'NY34.78': { address: 'Brookwell Park', lat: 43.7457520, lng: -79.4899065, source: 'verified-place' },
  'MM42.64': { address: "Hanlan's Point Beach", lat: 43.6190685, lng: -79.3907277, source: 'verified-place' },
  'MM41.20': { address: 'Toronto Island Park', lat: 43.6202078, lng: -79.3677528, source: 'verified-place' },
  'SC31.18': { address: 'Scarborough Civic Centre', lat: 43.7729485, lng: -79.2575865, source: 'verified-place' },
  'MM40.25': { address: 'Barbara Hall Park', lat: 43.6667215, lng: -79.3805430, source: 'verified-place' },
  'EX20.5': { address: 'Moss Park Arena', lat: 43.6549624, lng: -79.3702748, source: 'verified-place' },
  'TE20.29': { address: 'Nathan Phillips Square', lat: 43.6527083, lng: -79.3838423, source: 'verified-place' },
  'EX16.5': { address: 'Ontario Science Centre', lat: 43.7148380, lng: -79.3402429, source: 'verified-place' },
  'IE26.12': { address: 'Cynthia Lai Park', lat: 43.7930884, lng: -79.2335417, source: 'verified-place' },
  'EY26.21': { address: 'Martingrove Gardens Park', lat: 43.6893877, lng: -79.5633302, source: 'verified-place' },
  'MM33.34': { address: 'Toronto Zoo', lat: 43.8196233, lng: -79.1844977, source: 'verified-place' },
  'EX23.1': { address: 'Toronto Island Park', lat: 43.6202078, lng: -79.3677528, source: 'verified-place' },
  'EX19.26': { address: 'Guild Park and Gardens', lat: 43.7454833, lng: -79.1926546, source: 'verified-place' },
  'EX18.3': { address: 'Port Lands', lat: 43.6430648, lng: -79.3506012, source: 'verified-place' },
  'EX17.5': { address: 'Billy Bishop Toronto City Airport', lat: 43.6280558, lng: -79.3979969, source: 'verified-place' },
  'EX15.5': { address: 'Moss Park Arena', lat: 43.6549624, lng: -79.3702748, source: 'verified-place' },
  'EX15.4': { address: 'Sankofa Square', lat: 43.6560277, lng: -79.3801254, source: 'verified-place' },
  'MM13.11': { address: 'Centennial Park Stadium', lat: 43.6537326, lng: -79.5850888, source: 'verified-place' },
  'MM13.32': { address: 'Glencairn Station', lat: 43.7094841, lng: -79.4412385, source: 'verified-place' },
  'IE3.7': { address: 'High Park', lat: 43.6462813, lng: -79.4637945, source: 'verified-place' },
  'EC3.17': { address: 'Yorkdale Shopping Centre', lat: 43.7256238, lng: -79.4523079, source: 'verified-place' },
  'GG3.15': { address: 'Felstead Park', lat: 43.6793916, lng: -79.3294616, source: 'verified-place' },
  'IE15.2': { address: 'Toronto Island Park', lat: 43.6202078, lng: -79.3677528, source: 'verified-place' },
};

function extractAddresses(title) {
  const grouped = [...title.matchAll(GROUPED_ADDRESS_RE)].flatMap(match =>
    match[1].split(/\s*(?:,|and|&)\s*/i).map(number => `${number} ${match[2]}`)
  );
  const individual = [...title.matchAll(ADDRESS_RE)].map(m => m[1].trim());
  return [...new Set([...grouped, ...individual])]
    .filter(address => !/^(?:\d+\s+Complete Street|\d{4}\s+Local Road|\d+\s+on Updates)/i.test(address));
}

async function geocode(address) {
  const known = KNOWN_LOCATIONS_BY_ADDRESS[address];
  if (known) return { address, ...known, source: 'verified-address' };

  // Normalize ranges for Nominatim: "353 to 355 Sherbourne" → "353 Sherbourne"
  const normalized = address.replace(/^(\d+)\s*(?:to|-|–)\s*\d+/, '$1');
  const query = encodeURIComponent(`${normalized}, Toronto, Ontario, Canada`);
  const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=ca`;

  const res = await fetch(url, {
    headers: { 'User-Agent': 'Motions/1.0 (motions.watch)' }
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  let results = await res.json();
  if (!results.length) {
    const fallbackUrl = `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?SingleLine=${query}&f=json&maxLocations=1`;
    const fallbackRes = await fetch(fallbackUrl);
    if (fallbackRes.ok) {
      const fallback = await fallbackRes.json();
      const candidate = fallback.candidates?.[0];
      if (candidate?.location && candidate.score >= 90) {
        return {
          address,
          lat: candidate.location.y,
          lng: candidate.location.x,
        };
      }
    }
    return null;
  }

  return {
    address,
    lat: parseFloat(results[0].lat),
    lng: parseFloat(results[0].lon),
  };
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const motions = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

  const targets = motions.filter(m =>
    !m.parentId &&
    (
      (extractAddresses(m.title).length > 0 && !m.locations?.length) ||
      (KNOWN_LOCATIONS_BY_MOTION_ID[m.id] &&
        (FORCE || !m.locations?.some(location => location.address === KNOWN_LOCATIONS_BY_MOTION_ID[m.id].address)))
    ) &&
    (!IDS || IDS.has(m.id)) &&
    (FORCE || !m.locations?.length || KNOWN_LOCATIONS_BY_MOTION_ID[m.id])
  ).slice(0, LIMIT);

  console.log(`📍 ${targets.length} motions to geocode`);
  if (!targets.length) { console.log('Nothing to do.'); return; }

  let done = 0, skipped = 0;

  for (const motion of targets) {
    const addresses = extractAddresses(motion.title);
    process.stdout.write(`[${done + 1}/${targets.length}] ${motion.id} — ${addresses.join(' + ').slice(0, 50)}… `);

    const knownPlace = KNOWN_LOCATIONS_BY_MOTION_ID[motion.id];
    const locations = knownPlace
      ? (motion.locations || []).filter(location => location.source !== 'ward')
      : [...(motion.locations || [])];
    if (knownPlace && !locations.some(location => location.address === knownPlace.address)) {
      locations.push(knownPlace);
    }
    for (const address of addresses) {
      try {
        await sleep(1100); // Nominatim: max 1 req/s
        const result = await geocode(address);
        if (result) locations.push(result);
      } catch (err) {
        // silently skip failed geocodes
      }
    }

    const idx = motions.findIndex(m => m.id === motion.id);
    if (locations.length > 0) {
      motions[idx].locations = locations;
      console.log(`✓ (${locations.length} location${locations.length > 1 ? 's' : ''})`);
      done++;
    } else {
      console.log('— no results');
      skipped++;
    }

    if ((done + skipped) % SAVE_EVERY === 0) {
      fs.writeFileSync(DATA_PATH, JSON.stringify(motions, null, 2));
      console.log(`   💾 Saved (${done} geocoded, ${skipped} skipped)`);
    }
  }

  fs.writeFileSync(DATA_PATH, JSON.stringify(motions, null, 2));
  console.log(`\n✅ Done — ${done} geocoded, ${skipped} no results`);
  console.log(`   Total with locations: ${motions.filter(m => m.locations?.length).length}`);
}

main().catch(err => { console.error(err); process.exit(1); });
