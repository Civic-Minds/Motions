// Cities Motions covers — the map and the homepage card carousel both read from this.
export const COVERED_CITIES = [
  { id: 'toronto', name: 'Toronto', href: '/toronto', tagline: '25 wards · Mayor Olivia Chow', lat: 43.6532, lng: -79.3832 },
  { id: 'vancouver', name: 'Vancouver', href: '/vancouver', tagline: 'Elected at-large · Mayor Ken Sim', lat: 49.2827, lng: -123.1207 },
];

// Real candidates from docs/roadmap/DATA_CITIES.md — shown as muted, non-clickable
// pins for context. Not a promise of when (or whether) these get added; keep this
// list in sync with that roadmap doc rather than adding cities for visual filler.
export const ROADMAP_CITIES = [
  { name: 'Calgary', lat: 51.0447, lng: -114.0719 },
  { name: 'Ottawa', lat: 45.4215, lng: -75.6972 },
  { name: 'Montreal', lat: 45.5017, lng: -73.5673 },
];
