// Cities Motions covers — the map and the homepage card grid both read from this.
export const COVERED_CITIES = [
  { name: 'Toronto', href: '/toronto', description: 'Toronto City Council motions, wards, councillors, and votes.', lat: 43.6532, lng: -79.3832 },
  { name: 'Vancouver', href: '/vancouver', description: 'Vancouver City Council motions, councillors, and votes.', lat: 49.2827, lng: -123.1207 },
];

// Not covered yet — shown as muted, non-clickable pins on the map for context.
export const OTHER_CITIES = [
  { name: 'Victoria', lat: 48.4284, lng: -123.3656 },
  { name: 'Calgary', lat: 51.0447, lng: -114.0719 },
  { name: 'Edmonton', lat: 53.5461, lng: -113.4938 },
  { name: 'Regina', lat: 50.4452, lng: -104.6189 },
  { name: 'Winnipeg', lat: 49.8951, lng: -97.1384 },
  { name: 'Ottawa', lat: 45.4215, lng: -75.6972 },
  { name: 'Montreal', lat: 45.5017, lng: -73.5673 },
  { name: 'Quebec City', lat: 46.8139, lng: -71.2080 },
  { name: 'Halifax', lat: 44.6488, lng: -63.5752 },
  { name: "St. John's", lat: 47.5615, lng: -52.7126 },
];
