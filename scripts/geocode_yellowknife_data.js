/**
 * Geocode Yellowknife motion addresses extracted from official titles.
 *
 * Yellowknife's agenda is dominated by appointments, bylaw readings, and
 * territorial/policy items rather than address-specific development
 * permits, so coverage here will always be much thinner than Toronto,
 * Vancouver, or Victoria — that's expected, not a bug in this script.
 *
 * Backfills locationCandidates on any motion imported before that field
 * existed, then geocodes whatever candidates aren't already cached.
 */

import fetch from 'node-fetch';
import fs from 'node:fs';
import path from 'node:path';
import { locationsFromTitle } from './lib/yellowknifeGeocoding.js';

/* global process */

const DATA_PATH = path.join(process.cwd(), 'public/data/yellowknife/motions.json');
const motions = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
const force = process.argv.includes('--force');

// Always re-derive from the title (cheap, no network call) rather than only
// backfilling missing ones, so a regex fix here also corrects any candidate
// list already written to disk under the old pattern.
for (const motion of motions) {
    const candidates = locationsFromTitle(motion.title);
    if (candidates.length) motion.locationCandidates = candidates;
    else delete motion.locationCandidates;
}

const candidates = [...new Set(motions.flatMap(motion => motion.locationCandidates ?? []))];
const cache = new Map(motions.flatMap(motion => (motion.locations ?? []).map(location => [location.address, location])));

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function geocode(address) {
    const query = encodeURIComponent(`${address}, Yellowknife, Northwest Territories, Canada`);
    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=ca`, {
        headers: { 'User-Agent': 'Motions/1.0 (motions.watch)' },
    });
    const result = response.ok ? (await response.json())[0] : null;
    if (result) return { address, lat: Number(result.lat), lng: Number(result.lon), source: 'geocoder' };

    const fallback = await fetch(`https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?SingleLine=${query}&f=json&maxLocations=1`);
    const candidate = fallback.ok ? (await fallback.json()).candidates?.[0] : null;
    if (candidate?.location && candidate.score >= 85) {
        return { address, lat: candidate.location.y, lng: candidate.location.x, source: 'geocoder' };
    }
    return null;
}

for (const address of candidates) {
    if (!force && cache.has(address)) continue;
    try {
        cache.set(address, await geocode(address));
        console.log(`${address}: ${cache.get(address) ? 'mapped' : 'unmatched'}`);
    } catch (error) {
        console.warn(`${address}: ${error.message}`);
        cache.set(address, null);
    }
    await sleep(1100);
}

for (const motion of motions) {
    const locations = (motion.locationCandidates ?? []).map(address => cache.get(address)).filter(Boolean);
    if (locations.length) motion.locations = locations;
    else delete motion.locations;
}
fs.writeFileSync(DATA_PATH, JSON.stringify(motions, null, 2));
console.log(`Mapped ${motions.filter(motion => motion.locations?.length).length} of ${motions.length} motions.`);
