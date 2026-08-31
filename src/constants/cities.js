// Cities Motions covers — the map and the homepage card carousel both read from this.
export const COVERED_CITIES = [
  { id: 'toronto', name: 'Toronto', href: '/toronto', tagline: '25 wards · Mayor Olivia Chow', lat: 43.6532, lng: -79.3832 },
  { id: 'vancouver', name: 'Vancouver', href: '/vancouver', tagline: 'Elected at-large · Mayor Ken Sim', lat: 49.2827, lng: -123.1207 },
];

// Real candidates from docs/roadmap/DATA_CITIES.md with an actual upcoming
// election — shown as muted, non-clickable pins for context. Not a promise of
// when (or whether) these get added. Calgary and Montreal are also on that
// roadmap but just held their elections (Calgary Oct 2025, next 2029;
// Montreal Nov 2025, next ~2029) so they're left off this list rather than
// showing up on a page framed entirely around upcoming elections.
export const ROADMAP_CITIES = [
  { name: 'Ottawa', lat: 45.4215, lng: -75.6972 },
];
