# Product Roadmap

Features, views, and UX improvements.

## Motion Pages & Detail

- [x] **Motion full-page view** — dedicated `/motions/:id` pages with vote bar, YES/NO split layout, collapsible sub-votes, and shareable URLs. Replaced modal overlay in v2.0.0.
- [x] **Multi-vote agenda items** — items with multiple distinct votes (e.g. Waive Referral + Adopt Item) split into separate entries with a parentId link. Final adoption vote shown as primary.
- [ ] **Plain-language summaries** — AI-generated blurb per motion, shown below the title. Could source from toronto.ca agenda item text or generate via Claude API.
- [ ] **Advisory committee full breakdowns** — toronto.ca pages include community appointee votes not in the Open Data CSV. Scrape these to show complete YES/NO/ABSENT for advisory committees.
- [ ] **Motion search by vote margin** — filter by close votes (≤5 margin), landslide wins, unanimous, etc.

---

## Multi-City Expansion

The long-term vision is to expand beyond Toronto — letting residents of any Canadian (and eventually North American) city see what their council is actually doing.

- [ ] **City selector** — allow users to switch between cities (e.g. Toronto, Ottawa, Vancouver, Montreal). Each city would have its own data pipeline and import script.
- [ ] **City comparison view** — compare adoption rates, topic focus, and council activity across cities. "How does Toronto's housing vote record compare to Vancouver's?"
- [ ] **Database migration** — static JSON per city won't scale. Migrate to Postgres (Neon/Supabase) with a city-keyed schema and API layer when expanding beyond Toronto.
- [ ] **VoteFlow** — track how individual councillors' positions on recurring topics shift over time. Surface flip detection (voted YES on transit 3 years ago, now votes NO).
- [ ] **Ward digest email** — bi-weekly email summarizing your councillor's top votes. Personalized by ward, AI-generated summary paragraph, opt-in subscription.
- [ ] **Motion map** — geospatial layer showing motions localized to city blocks/neighbourhoods (not just ward-level). Show what's changing near you on a map.
- [ ] **Topics** — user-defined or curated topic pages (e.g. "Bike Lanes", "Shelter Beds", "Zoning") that aggregate all motions, votes, and councillor positions around a named issue over time. Different from the current topic tags (which are broad categories) — Topics would be specific, named civic issues residents actually care about.

## Significance Scoring

- [ ] **AI pairwise significance scoring** — replace the current keyword-based significance scorer with anchor-based pairwise comparisons via Gemini. Hand-pick 10–15 anchor motions spanning the full significance range, then for each motion ask "is this more or less significant than these examples?" Output a 0–100 score with a short reason. Can be generated alongside summaries in the same pipeline call and throttled incrementally. Fixes the current over-inflation of scores for motions that mention common keywords like "transit" or "police".

## Open Questions

- [ ] **Export page strategy** — the Export page (full motion table + CSV download) exposes the raw Toronto Open Data voting record, which is already public. The enriched data (significance scores, topic tags, flags) is the proprietary work. Decide: keep CSV download, remove it, or remove the Export page entirely and surface browsing via a renamed "Explore" view.

## Dashboard

- [x] **Recent highlights section** — surface the most significant motions from the last meeting or last 30 days at the top of the dashboard, above the full motion list. Makes the homepage feel current rather than showing the full term by default.
- [ ] **Agenda Breakdown: per-topic breakdown** — show substantive vs procedural split per topic (Housing, Transit, etc.) as a secondary view on the dashboard.
- [x] **Mobile responsive pass** — layout currently assumes a sidebar + main content split that breaks below ~900px.


## Councillors

- [ ] **Illustrated portraits** — sketch/illustration-style councillor portraits on the Councillors page and ProfilePanel. Hand-drawn or generative art aesthetic to fit the civic data visual language. Could use a consistent style (e.g. linework, limited palette) rather than real photos.

## Profiles & Comparison

- [x] **Committees on councillor profiles** — committee membership pills derived from voting frequency. Clicking a committee navigates to that committee's page.
- [x] **Vote history controls** — sort (Impact / Date) and outcome filter (All / YES / NO) added to the vote history list on councillor profiles.
- [ ] **Formal committee & board memberships** — surface official committee assignments per councillor. See [Data Roadmap](ROADMAP_DATA.md) for sourcing approach.
- [x] **VersusOverlay: no-data edge case** — shows "No shared vote history" when two councillors share no recorded votes.

## Views

- [ ] **Ward Impact: interactive map** — replace the current grid with a Leaflet.js choropleth map of Toronto's 25 wards, coloured by motion count or significance score.
- [ ] **Ward Impact: tooltip for "impactful" metric** — the impactCount figure (non-trivial motions per ward) is unlabelled; add a tooltip explaining how it's calculated.
- [x] **AlignmentHeatmap: threshold note** — the grid silently excludes councillors with fewer than 5 recorded votes. Add a small label like "Showing 26 members with 5+ recorded votes."


## Election 2026

- [/] **Election 2026 Dashboard** — a central page for the upcoming October 26 municipal election. (Hidden draft at `/election`)
- [x] **Countdown & Key Dates** — live countdown to election day and tracking of the nomination period.
- [x] **Candidate Tracker** — automated scraper (`scripts/fetch_candidates.js`) pulls real-time data from toronto.ca.
- [/] **Incumbent Performance** — linking candidates to their voting records.

---

## Data Module

- [ ] **Data Module: topic filter column** — the table has no topic filter; add a topic dropdown alongside the existing search and status filters.

---

[Back to Roadmap](ROADMAP.md)
