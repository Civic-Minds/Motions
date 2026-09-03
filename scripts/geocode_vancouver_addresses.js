/** Add high-confidence Vancouver address locations to imported motions. */
import fs from 'fs';
import path from 'path';
import { extractAddresses as extractAddressesShared } from './lib/addressExtraction.js';

const DATA_PATH = path.join(process.cwd(), 'public/data/vancouver/motions.json');
const CACHE_PATH = path.join(process.cwd(), 'scripts/cache/vancouver_address_geocodes.json');
const BOUNDS = { minLat: 49.15, maxLat: 49.35, minLng: -123.30, maxLng: -123.00 };
const ADDRESS_RE = /\b(\d{1,5}(?:\s*(?:to|-|–)\s*\d{1,5})?\s+(?:The\s+)?[A-Z][a-zA-Z.'-]*(?:\s+[A-Z][a-zA-Z.'-]*){0,4}\s+(?:Street|St\.?|Avenue|Ave\.?|Road|Rd\.?|Drive|Dr\.?|Boulevard|Blvd\.?|Lane|Ln\.?|Court|Ct\.?|Way|Crescent|Cres\.?|Place|Pl\.?|Trail|Terrace|Gate|Path|Circle|Parkway|Pkwy|Square|Sq\.?|Esplanade)(?:\s+(?:East|West|North|South))?)/gi;
const GROUPED_ADDRESS_RE = /\b((?:\d{1,5}(?:(?:\s*,\s*|\s+and\s+|\s*&\s*)\d{1,5})+))\s+((?:The\s+)?[A-Z][a-zA-Z.'-]*(?:\s+[A-Z][a-zA-Z.'-]*){0,4}\s+(?:Street|St\.?|Avenue|Ave\.?|Road|Rd\.?|Drive|Dr\.?|Boulevard|Blvd\.?|Lane|Ln\.?|Court|Ct\.?|Way|Crescent|Cres\.?|Place|Pl\.?|Trail|Terrace|Gate|Path|Circle|Parkway|Pkwy|Square|Sq\.?|Esplanade)(?:\s+(?:East|West|North|South))?)/gi;

const EXCLUDE_RE = /^\d{4}\s+(?:Street|Water Street|Supplemental Street)$/i;
const cleanupAddress = address => address.replace(/\.$/, '').replace(/\s+/g, ' ');

function extractAddresses(title) {
  return extractAddressesShared(title, {
    addressRe: ADDRESS_RE,
    groupedRe: GROUPED_ADDRESS_RE,
    exclude: EXCLUDE_RE,
    cleanup: cleanupAddress,
  });
}

function isVancouver(location) {
  return location && location.y >= BOUNDS.minLat && location.y <= BOUNDS.maxLat
    && location.x >= BOUNDS.minLng && location.x <= BOUNDS.maxLng;
}

async function geocode(address) {
  const params = new URLSearchParams({
    SingleLine: `${address}, Vancouver, British Columbia, Canada`,
    f: 'json',
    maxLocations: '1',
  });
  const response = await fetch(`https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?${params}`);
  if (!response.ok) throw new Error(`Geocoder returned HTTP ${response.status}`);
  const candidate = (await response.json()).candidates?.[0];
  if (!candidate || candidate.score < 90 || !isVancouver(candidate.location)) return null;
  return { address, lat: candidate.location.y, lng: candidate.location.x, source: 'geocoded-address' };
}

async function main() {
  const motions = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  const cache = fs.existsSync(CACHE_PATH) ? JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8')) : {};
  const addresses = [...new Set(motions.flatMap(motion => extractAddresses(motion.title)))];
  let fetched = 0;

  for (const address of addresses) {
    if (Object.prototype.hasOwnProperty.call(cache, address)) continue;
    cache[address] = await geocode(address);
    fetched++;
    fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
    fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
  }

  for (const motion of motions) {
    const locations = extractAddresses(motion.title).map(address => cache[address]).filter(Boolean);
    if (locations.length) motion.locations = locations;
    else delete motion.locations;
  }
  fs.writeFileSync(DATA_PATH, JSON.stringify(motions, null, 2));
  console.log(`Geocoded ${fetched} new addresses; ${motions.filter(m => m.locations?.length).length} motions now have locations.`);
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
