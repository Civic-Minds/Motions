# Product Roadmap

Features, views, and UX improvements.

## Open Questions

- [ ] **Export page strategy** — the Export page (full motion table + CSV download) exposes the raw Toronto Open Data voting record, which is already public. The enriched data (significance scores, topic tags, flags) is the proprietary work. Decide: keep CSV download, remove it, or remove the Export page entirely and surface browsing via a renamed "Explore" view.

## Dashboard

- [ ] **Recent highlights section** — surface the most significant motions from the last meeting or last 30 days at the top of the dashboard, above the full motion list. Makes the homepage feel current rather than showing the full term by default.
- [ ] **Agenda Breakdown: per-topic breakdown** — show substantive vs procedural split per topic (Housing, Transit, etc.) as a secondary view on the dashboard.
- [ ] **Mobile responsive pass** — layout currently assumes a sidebar + main content split that breaks below ~900px.

## Councillors

- [ ] **Illustrated portraits** — sketch/illustration-style councillor portraits on the Councillors page and ProfilePanel. Hand-drawn or generative art aesthetic to fit the civic data visual language. Could use a consistent style (e.g. linework, limited palette) rather than real photos.

## Profiles & Comparison

- [ ] **ProfilePanel: vote history controls** — add sort (by date / by significance) and filter (by topic, by outcome) to the Notable Votes list. Currently fixed to top 20 by significance.
- [ ] **ProfilePanel: committee & board memberships** — surface which committees and boards each councillor sits on. See [Data Roadmap](ROADMAP_DATA.md) for sourcing approach.
- [ ] **VersusOverlay: no-data edge case** — currently shows "100% UNANIMOUS" when two councillors share no recorded votes. Should display a clear "not enough shared data" state instead.

## Views

- [ ] **Ward Impact: interactive map** — replace the current grid with a Leaflet.js choropleth map of Toronto's 25 wards, coloured by motion count or significance score.
- [ ] **Ward Impact: tooltip for "impactful" metric** — the impactCount figure (non-trivial motions per ward) is unlabelled; add a tooltip explaining how it's calculated.
- [ ] **AlignmentHeatmap: threshold note** — the grid silently excludes councillors with fewer than 5 recorded votes. Add a small label like "Showing 26 members with 5+ recorded votes."

## Data Module

- [ ] **Data Module: topic filter column** — the table has no topic filter; add a topic dropdown alongside the existing search and status filters.

---

[Back to Roadmap](ROADMAP.md)
