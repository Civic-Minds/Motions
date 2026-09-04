/** Geocode Victoria motion addresses extracted from official titles. */

import fetch from 'node-fetch';
import fs from 'node:fs';
import path from 'node:path';

/* global process */

const DATA_PATH = path.join(process.cwd(), 'public/data/victoria/motions.json');
const motions = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
const force = process.argv.includes('--force');

const known = {
    'City Hall': { lat: 48.4284, lng: -123.3656 },
    'Topaz Park': { lat: 48.4349, lng: -123.3506 },
};

const candidates = [...new Set(motions.flatMap(motion => motion.locationCandidates ?? []))];
const cache = new Map();

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function geocode(address) {
    if (known[address]) return { address, ...known[address], source: 'verified-place' };
    const query = encodeURIComponent(`${address}, Victoria, British Columbia, Canada`);
    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=ca`, {
        headers: { 'User-Agent': 'Motions/1.0 (motions.watch)' },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const result = (await response.json())[0];
    return result ? { address, lat: Number(result.lat), lng: Number(result.lon), source: 'geocoder' } : null;
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
