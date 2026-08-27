/**
 * assign_ward_locations.js
 *
 * Adds map points for motions that explicitly name one or more Toronto wards
 * but do not have a more precise address location. The point is the centroid
 * of the official ward boundary and is labelled as a ward, not an address.
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

const motions = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
const wards = JSON.parse(fs.readFileSync(WARDS_PATH, 'utf8'));
const centroids = Object.fromEntries(
  wards.features.map(feature => [
    String(feature.properties.AREA_SHORT_CODE).replace(/^0+/, ''),
    featureCentroid(feature),
  ])
);

let assigned = 0;
for (const motion of motions) {
  if (motion.parentId || motion.locations?.length) continue;

  const wardIds = [...motion.title.matchAll(WARD_RE)]
    .map(match => match[1])
    .filter(id => VALID_WARDS.has(id));
  WARD_RE.lastIndex = 0;
  if (!wardIds.length) continue;

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

  if (!locations.length) continue;
  motion.locations = locations;
  assigned++;
  console.log(`${motion.id} → ${uniqueWardIds.map(id => `Ward ${id}`).join(', ')}`);
}

fs.writeFileSync(DATA_PATH, JSON.stringify(motions, null, 2));
console.log(`\nAssigned ward-level locations to ${assigned} motions.`);
