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
const SAVE_EVERY = 20;

// Matches: "2775 Jane Street", "641 to 663 Danforth Road East",
//          "4884-4896 Dundas Street West", "150 The Donway West"
const ADDRESS_RE = /\b(\d{1,5}(?:\s*(?:to|-|–)\s*\d{1,5})?\s+(?:The\s+)?[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?\s+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Boulevard|Blvd|Lane|Ln|Court|Ct|Way|Crescent|Cres|Place|Pl|Trail|Terrace|Gate|Path|Circle|Parkway|Pkwy|Square|Sq)(?:\.)?(?:\s+(?:East|West|North|South))?)\b/gi;

function extractAddresses(title) {
  return [...title.matchAll(ADDRESS_RE)].map(m => m[1].trim());
}

async function geocode(address) {
  // Normalize ranges for Nominatim: "353 to 355 Sherbourne" → "353 Sherbourne"
  const normalized = address.replace(/^(\d+)\s*(?:to|-|–)\s*\d+/, '$1');
  const query = encodeURIComponent(`${normalized}, Toronto, Ontario, Canada`);
  const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=ca`;

  const res = await fetch(url, {
    headers: { 'User-Agent': 'Motions/1.0 (motions.watch)' }
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const results = await res.json();
  if (!results.length) return null;

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
    extractAddresses(m.title).length > 0 &&
    (FORCE || !m.locations)
  ).slice(0, LIMIT);

  console.log(`📍 ${targets.length} motions to geocode`);
  if (!targets.length) { console.log('Nothing to do.'); return; }

  let done = 0, skipped = 0;

  for (const motion of targets) {
    const addresses = extractAddresses(motion.title);
    process.stdout.write(`[${done + 1}/${targets.length}] ${motion.id} — ${addresses.join(' + ').slice(0, 50)}… `);

    const locations = [];
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
