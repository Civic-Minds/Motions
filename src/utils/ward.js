let cachedBoundaries = null;

export async function fetchWardBoundaries() {
  if (cachedBoundaries) return cachedBoundaries;
  const data = await fetch('/data/wards.geojson').then(r => r.json());
  cachedBoundaries = data;
  return cachedBoundaries;
}

export function extractWardId(props) {
  for (const key of ['AREA_SHORT_CODE', 'WARD_NUM', 'WARD', 'ward_num', 'ward']) {
    if (props[key] != null) {
      // Strip leading zeros so "01" matches "1"
      const val = String(props[key]).replace(/^0+/, '');
      return val || '0';
    }
  }
  const name = props.AREA_NAME ?? props.area_name ?? '';
  const m = name.match(/\((\d+)\)/);
  return m ? String(Number(m[1])) : null;
}

function pointInRing(point, ring) {
  const [px, py] = point;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi)
      inside = !inside;
  }
  return inside;
}

export function pointInFeature(point, geometry) {
  const polys = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  return polys.some(poly => pointInRing(point, poly[0]));
}

export async function geolocateWard() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) { reject(new Error('no_geolocation')); return; }
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const geojson = await fetchWardBoundaries();
        const point = [coords.longitude, coords.latitude];
        for (const feature of geojson.features) {
          if (pointInFeature(point, feature.geometry)) {
            const id = extractWardId(feature.properties);
            if (id) { resolve(id); return; }
          }
        }
        reject(new Error('not_in_toronto'));
      },
      (err) => reject(new Error(err.code === 1 ? 'denied' : 'location_error')),
      { timeout: 10000 }
    );
  });
}
