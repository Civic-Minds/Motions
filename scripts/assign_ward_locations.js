/**
 * assign_ward_locations.js
 *
 * Labels address locations with their official Toronto ward. Also adds map
 * points for motions that explicitly name one or more wards but do not have a
 * more precise address location.
 */

import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'public/data/motions.json');
const WARDS_PATH = path.join(process.cwd(), 'public/data/wards.geojson');

const WARD_RE = /\bward\s+(\d{1,2})\b/gi;
const VALID_WARDS = new Set(Array.from({ length: 25 }, (_, i) => String(i + 1)));

function polygonCentroid(ring) {
  let area = 0;
  let lat = 0;
  let lng = 0;

  for (let i = 0; i < ring.length - 1; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[i + 1];
    const cross = x1 * y2 - x2 * y1;
    area += cross;
    lng += (x1 + x2) * cross;
    lat += (y1 + y2) * cross;
  }

  if (area === 0) {
    const [lng, lat] = ring[0];
    return { lat, lng, area: 0 };
  }

  return {
    lat: lat / (3 * area),
    lng: lng / (3 * area),
    area: Math.abs(area / 2),
  };
}

function featureCentroid(feature) {
  const polygons = feature.geometry.type === 'Polygon'
    ? [feature.geometry.coordinates]
    : feature.geometry.coordinates;
  const outerRings = polygons.map(polygon => polygon[0]);
  return outerRings
    .map(polygonCentroid)
    .sort((a, b) => b.area - a.area)[0];
}

function pointInRing([px, py], ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function pointInFeature([lng, lat], feature) {
  const polygons = feature.geometry.type === 'Polygon'
    ? [feature.geometry.coordinates]
    : feature.geometry.coordinates;
  return polygons.some(polygon => pointInRing([lng, lat], polygon[0]));
}

const motions = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
const wards = JSON.parse(fs.readFileSync(WARDS_PATH, 'utf8'));
const centroids = Object.fromEntries(
  wards.features.map(feature => [
    String(feature.properties.AREA_SHORT_CODE).replace(/^0+/, ''),
    featureCentroid(feature),
  ])
);

let labelled = 0;
let assigned = 0;
for (const motion of motions) {
  if (motion.parentId) continue;

  if (motion.locations?.length) {
    for (const location of motion.locations) {
      if (location.ward || !Number.isFinite(location.lat) || !Number.isFinite(location.lng)) continue;
      const feature = wards.features.find(candidate => pointInFeature([location.lng, location.lat], candidate));
      const ward = feature && String(feature.properties.AREA_SHORT_CODE).replace(/^0+/, '');
      if (ward && VALID_WARDS.has(ward)) {
        location.ward = ward;
        labelled++;
      }
    }
    motion.scope = 'ward';
    continue;
  }

  const wardIds = [...motion.title.matchAll(WARD_RE)]
    .map(match => match[1])
    .filter(id => VALID_WARDS.has(id));
  WARD_RE.lastIndex = 0;
  if (!wardIds.length) {
    motion.scope = 'citywide';
    continue;
  }

  const uniqueWardIds = [...new Set(wardIds)];
  const locations = uniqueWardIds
    .map(id => centroids[id] && ({
      address: `Ward ${id}`,
      ward: id,
      source: 'ward',
      lat: centroids[id].lat,
      lng: centroids[id].lng,
    }))
    .filter(Boolean);

  if (!locations.length) {
    motion.scope = 'citywide';
    continue;
  }
  motion.locations = locations;
  motion.scope = 'ward';
  assigned++;
  console.log(`${motion.id} → ${uniqueWardIds.map(id => `Ward ${id}`).join(', ')}`);
}

fs.writeFileSync(DATA_PATH, JSON.stringify(motions, null, 2));
console.log(`\nLabelled ${labelled} address locations and assigned ward-level locations to ${assigned} motions.`);
