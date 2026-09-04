// Election-only places are not jurisdictions and therefore do not have routes.
export const OTHER_ELECTION_CITIES = [
// Other major Canadian cities with a confirmed municipal election this cycle —
// represented as muted, non-clickable records with just their election date. This is
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
  { id: 'winnipeg', name: 'Winnipeg', electionDate: '2026-10-28', status: 'Coming soon', lat: 49.8951, lng: -97.1384 },
  { id: 'ottawa', name: 'Ottawa', electionDate: '2026-10-26', lat: 45.4215, lng: -75.6972 },
  { id: 'hamilton', name: 'Hamilton', electionDate: '2026-10-26', lat: 43.2557, lng: -79.8711 },
];
