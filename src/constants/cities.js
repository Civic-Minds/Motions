// Cities Motions covers — the map and the homepage card carousel both read from this.
export const COVERED_CITIES = [
  { id: 'toronto', name: 'Toronto', href: '/toronto', tagline: '25 wards · Mayor Olivia Chow', lat: 43.6532, lng: -79.3832 },
  { id: 'vancouver', name: 'Vancouver', href: '/vancouver', tagline: 'Elected at-large · Mayor Ken Sim', lat: 49.2827, lng: -123.1207 },
  { id: 'yellowknife', name: 'Yellowknife', href: '/yellowknife', tagline: '8 councillors · Mayor Ben Hendriksen', lat: 62.4540, lng: -114.3718 },
];

// Other major Canadian cities with a confirmed municipal election this cycle —
// shown as muted, non-clickable pins with just their election date. This is
// informational (which cities are voting when), NOT a claim that Motions plans
// to cover them — Ottawa happens to also be a real candidate per
// docs/roadmap/DATA_CITIES.md, but that's incidental to why it's shown here.
// Each date is set by provincial law (one province-wide election day), verified
// per province before adding any city:
//   Ontario — Oct 26, 2026 (Municipal Elections Act, same day as Toronto)
//   British Columbia — Oct 17, 2026 (Local Government Act, same day as Vancouver)
//   Manitoba — Oct 28, 2026
//   Northwest Territories — Oct 19, 2026 (City of Yellowknife)
// Alberta (next 2029), Saskatchewan (2028), Nova Scotia (2028), and
// Newfoundland (2029) do NOT have a 2026 municipal election — don't add cities
// from those provinces here without re-checking their cycle first.
export const OTHER_ELECTION_CITIES = [
  { name: 'Winnipeg', electionDate: '2026-10-28', status: 'Coming soon', lat: 49.8951, lng: -97.1384 },
  { name: 'Ottawa', electionDate: '2026-10-26', lat: 45.4215, lng: -75.6972 },
  { name: 'Hamilton', electionDate: '2026-10-26', lat: 43.2557, lng: -79.8711 },
  { name: 'Victoria', electionDate: '2026-10-17', lat: 48.4284, lng: -123.3656 },
];
