# Changelog

All notable changes to this project will be documented in this file.

See [CHANGELOG_ARCHIVE.md](CHANGELOG_ARCHIVE.md) for pre-2.0.0 history.

## [Unreleased]

- **Clickable bento cards** — Last Meeting card toggles the motion list to that meeting's motions; Your Ward card navigates to the ward detail page.
- **Year filter** — sidebar filter (desktop) lets users narrow the motion list to a specific year (2022–2026). Derived dynamically from loaded motions.
- **Summary snippets in motion list** — if a motion has a plain-language `summary`, a two-line excerpt is shown below the title in the list card.
- **Global search includes summaries** — `summary` field now included in search index. Summary-only matches show a highlighted one-line excerpt below the title. Title matches still rank above summary matches.
- **Clear filters button** — appears in the desktop sidebar when any filter is active. Resets topic, committee, vote type, year, notable-only, your-ward, and last-meeting filters in one click.
- **Summary snippets on councillor profiles** — vote history rows now show a two-line plain-language excerpt when a summary exists, matching the dashboard treatment.
- **Mobile year filter** — year pills added to the mobile filter pill row, consistent with the desktop sidebar.
- **Toronto mini-map on homepage** — `TorontoMiniMap.jsx` fills the empty right column of the motion list grid. Shows all 25 ward boundaries + 218 geocoded motion pins (green = Adopted, red = Lost). All Leaflet interaction disabled; clicking anywhere navigates to `/wards`. Lazy-loaded, shares the Leaflet chunk with WardMotionMap. Auto-zooms to saved ward when ward boundaries load. Fixed to zoom 12 centered on Toronto — no surrounding cities visible.
- **Compact filter sidebar** — replaced full-width button rows with small pill clusters in a fixed-height card (`h-[480px]`), matching the map height. Committee filter replaced with a search input: click to show all committees, type to narrow, select to apply.
- **Your Ward bento card redesigned** — ward number pill + ward name in top row; councillor name as bold headline. Matches the visual structure of the Notable motion cards.
- **"Show 20 more" pagination** — motion list now loads in increments of 20 (shows remaining count) instead of dumping all motions at once. Resets to 20 when filters change.
- **Ward ID normalization** — `src/utils/storage.js` introduced with `getWardId()` / `setWardId()`. Eliminates leading-zero bug (`"09"` → `"9"`) and removes duplicated localStorage IIFEs across 6 components.
- **Full Toronto map on Wards page** — `TorontoFullMap.jsx` replaces the ward card grid. Interactive map with all 25 ward polygons; hovering a card in the horizontal carousel flies the map to that ward. Saved ward highlighted in blue. Clicking any polygon or card navigates to the ward detail page.
- **Mini-map click destination fixed** — clicking the homepage mini-map now navigates to `/wards/${wardId}` if a ward is saved (landing on the ward detail map), otherwise `/wards`.

## [2.1.0] - 2026-04-10

### Added
- **Interactive map on ward detail pages** — `WardMotionMap.jsx` uses react-leaflet + OSM tiles. Shows ward boundary (GeoJSON) + coloured pins for address-bearing motions (green = Adopted, red = Lost). Click pin → motion page. Lazy-loaded chunk.
- **"Your Ward" filter on dashboard** — sidebar button filters motion list to ward-specific motions when a ward is saved. Shows councillor name as subtitle.
- **"Your Councillor" callout on motion pages** — coloured callout (green/red/grey) above vote breakdown showing your councillor's vote.
- **Geocoding pipeline** — `scripts/geocode_addresses.js` extracts all addresses from titles, geocodes via Nominatim (free, no key), stores `locations: [{address, lat, lng}]`. 218 motions geocoded. Multi-address support.
- **Field extraction pipeline** — `scripts/extract_fields.js` extracts `amounts[]`, `relatedMotions[]`, `staffRecommendation`, `developer` from body text before stripping. 88 motions with dollar amounts, 82 with cross-references.
- **Referenced motions on motion pages** — linked pills for cross-referenced motion IDs (e.g. "In response to 2025.MM35.15").
- **Funding amounts on motion pages** — normalized dollar strip (e.g. $299.4M) when present.
- **Plain-language summaries** — `scripts/generate_summaries.js` using Gemini 2.5 Flash. `scripts/strip_body.js` removes body before committing. In progress.
- **Councillor card on ward detail pages** — callout with photo, name, and profile link. Labels "Your Councillor" for saved ward.
- **"Your Councillor" highlight on councillors grid** — blue border + pill on saved ward's councillor card.
- **Vote history sort + outcome filter on councillor profiles** — Impact / Date sort and All / YES / NO filter pills.
- **Vote type filter on dashboard** — Close vote, Unanimous, Defeated, Landslide loss filters.
- **Search suggestion pills** — topic pills and common terms in global search empty state.
- **TMMIS scraper** — `scripts/scrape_agenda_text.js` scrapes body text from toronto.ca incrementally.

### Changed
- **Councillor roster corrected** — Rachel Chernos Lin (W15, by-election Nov 2024), Jon Burnside (W16), Neethan Shan (W25, by-election Sep 2025). Anthony Perruzza + Neethan Shan added to `COUNCILLORS` (were missing). Jennifer McKelvie → `FORMER_MEMBERS` (resigned May 2025). Chernos Lin tenure corrected to 2024.
- **Removed PROGRESSIVES/CONSERVATIVES** — editorial labels dropped from `data.js`.
- **Summaries model** — `gemini-2.0-flash` → `gemini-2.5-flash`, delay 4s → 10s.
- **Refactored topic colour constants** — `TOPIC_LIGHT` and `TOPIC_DOT` centralized in `data.js`.
- **Extracted VsPickerModal** — split out of `CouncillorProfile.jsx`.
- **CouncillorProfile back button** and **"Your Councillor" badge** on profile page.
- **Empty votes state** on motion pages.

### Fixed
- **Ward keyword coverage** — added keywords for 7 previously uncovered wards in `import_open_data.js`.

### Removed
- **Dead components** — `MotionDetail.jsx`, `MotionPanel.jsx`, `ProfilePanel.jsx`, `Scorecard.jsx`.
- **`scripts/fetch_motions.js`** — superseded by `import_open_data.js`.
- **`getPairwiseAlignment`** — unused export removed from `analytics.js`.

## [2.0.2] - 2026-04-10

### Changed
- **Renamed to Your City at Work** — browser tab, OG tags, navbar logo, and developer configuration updated from "Motions" to "Your City at Work".
- **Social Preview Updates** — generalized description text ("See every vote. Know every decision. It's your city.") and added a premium user-provided photo of Toronto City Hall as the social graphic.

## [2.0.1] - 2026-04-10

### Added
- **Site footer** — slim footer on every page with Toronto Open Data attribution, Civic Minds link, and GitHub link.
- **Vercel Analytics** — privacy-friendly page view tracking via `@vercel/analytics`. No cookies, no consent banner.

## [2.0.0] - 2026-04-10

### Infrastructure
- **Custom domain configuration** — successfully connected `yourcityatwork.ca` to Vercel. Configured root A record (`216.198.79.1`) and `www` CNAME (`fb8efec54f29146a.vercel-dns-017.com.`) in Spaceship.

### Added
- **Advisory committee vote totals** — motions now store `resultText` (e.g. "Carried, 7-3") from the CSV. On the motion page, the vote bar uses the actual totals when recorded councillor votes are a subset (e.g. advisory committees where most voters are community appointees, not City Councillors). A note clarifies when the breakdown is councillors-only.
- **YES/NO split vote layout** — councillor votes now display as two side-by-side columns (YES green, NO red), alphabetical within each group. Absent members are de-emphasised as compact inline chips. Empty columns are hidden.
- **Site renamed to Motions** — browser tab, OG tags, and navbar now say "Motions Toronto".
- **Wards page auto-scroll removed** — no longer scrolls to the saved ward on page load.
- **Page header subtitles removed** — "27 members · 2022–2026 term" style subtitles removed from Councillors, Committees, and Wards pages.
- **Motion detail pages** — `/motions/:id` now renders a dedicated `MotionPage` instead of a modal overlay. For multi-vote items the final vote is shown expanded at the top; procedural votes (Waive Referral, amendments, etc.) appear as collapsible rows below. Sub-entry URLs redirect to their primary page. `MotionPanel` removed from all views.
- **Multi-vote agenda items** — `import_open_data.js` now emits one entry per distinct motion type per agenda item. Items with multiple votes (e.g. "Waive Referral" + "Adopt Item") produce separate entries linked by a `parentId` field. Each entry has its own correct status and vote counts.
- **Sub-entries filtered from all lists** — DashboardView, CouncillorProfile, CommitteesView, WardGrid, and GlobalSearch now only show primary entries (`!parentId`). The full vote breakdown is on the motion page.
- **Committees on councillor profiles** — each councillor profile now shows committee membership pills derived from voting frequency. Clicking a committee navigates to that committee's page.
- **YourWardCard on Wards page** — the ward selection card appears in the stats strip at the top of the Wards page, consistent with the homepage. Geolocation machinery removed from WardGrid (YourWardCard handles it).
- **Committee URL routing** — committees now use `/committees/:slug` URLs. Title and subtitle update when navigating into a committee. No more local state toggling.
- **Committee members on committee pages** — each committee detail page shows a "Members" section with councillor pills derived from voting frequency (≥25% of that committee's motions). Clicking a member navigates to their profile.

### Changed
- **Dashboard layout unified** — homepage now uses two grids both with `[200px_1fr_220px]` column template so Notable cards and motion list share identical left/right edges. Filter sidebar is sticky; Last Meeting and Your Ward are not.
- **"Defeated" → "Lost"** — all 135 motions in `motions.json` updated; `import_open_data.js` now outputs "Lost"; UI conditionals cleaned up.
- **"Crushed" flag label renamed** — `landslide-defeat` flag now displays as "Landslide Loss".
- **Ward/homepage localStorage sync** — `YourWardCard` and `WardGrid` both read/write the same `motions_ward_id` key. Setting your ward on either page is reflected on the other.
- **Councillor back button removed** — redundant "← Councillors" link removed from profile header; nav tab serves the same purpose.
- **CommitteesView title** — page title and subtitle now update to reflect the selected committee name and motion count.

### Added
- **Councillor photos** — headshot images at `public/images/councillors/{LastName}.jpg` shown in profile header and list card avatars. Falls back to initials if no photo exists. Add new photos by filename with no code changes needed.
- **Councillor tenure** — `build_tenure.js` script fetches all 5 historical term CSVs (2006–2026) and produces `public/data/tenure.json` with each member's first elected year and list of terms. CouncillorProfile now shows "on council since XXXX" in the header stats strip. Manual corrections applied: Olivia Chow → 1991, Jon Burnside → 2022 (removed erroneous 2014 entry), Neethan Shan → 2017 (by-election).
- **Former members excluded from Councillors list** — John Tory (resigned Feb 2023), Jaye Robinson (passed away Jun 2024), and Gary Crawford (resigned Aug 2023) are filtered from the grid. Their profiles remain accessible directly; a banner notes their status and marks the record as historical.
- **Open Data import expanded** — `import_open_data.js` now includes committee-level votes, not just City Council votes. Items that reached full council keep the City Council vote as final; committee-only items are included as new entries. Motions count: 717 → 926. Each motion now stores a `committee` field from the CSV directly. Frontend updated to use `m.committee` with `getCommittee(m.id)` as fallback.
- **CouncillorProfile full page** — `/councillors/:slug` now renders a full-page profile instead of a modal overlay. Layout: back link + header (avatar, name, ward, stats strip, contact), two-column body on desktop (sticky left sidebar with Voting DNA + Most/Least Aligned; right column with full vote history). Topic filter pills + Notable Only toggle on the vote list. Compare button opens an inline picker to navigate to `/councillors/:slug/vs/:slug2`. Vote rows animate in and open MotionPanel on click.
- **Committee filter in sidebar** — homepage motion list can now be filtered by committee. Available committees are derived from the loaded motions. Filter appears in the desktop sidebar and mobile pill row.
- **Notable Votes are now clickable** — tapping a motion in a councillor's Notable Votes section opens the motion detail modal.
- **Vote split in highlights** — each highlight now shows YES/NO counts inline (e.g. `18–8`).

### Changed
- **Bento header layout** — top section redesigned as three columns: Last Meeting (200px), Most Recent Notable (flexible), Your Ward (220px). Section labels moved above cards. Removed outer card wrapper from Most Recent Notable so the 4 mini-cards sit directly in the column. Your Ward moved to the right column.
- **Equal card heights** — all three top-section columns use CSS grid `items-stretch` with `flex-1` / `h-full` to fill the row height consistently.
- **ProfilePanel and MotionPanel z-index** — raised backdrop to `z-[60]` and modal to `z-[70]` so they correctly overlay the sticky navbar (`z-50`).
- **Motion list sort order** — default sort is now date-descending (most recent first), with significance as tiebreaker within the same date.
- **Budget tab hidden** — Budget page removed from the navbar (route still exists).
- **Nav order updated** — Councillors → Scorecard → Committees → Wards.
- **Ward detail map removed** — the SVG ward boundary outline shown on ward detail pages has been removed; it added little value.
- **Search bar redesigned** — navbar search now looks like a real search input with a fixed width, placeholder text, and the ⌘K hint inside the field. Mobile gets an icon-only button.

### Changed
- **ProfilePanel → centered modal** — councillor detail panel replaced the right-side slide-in with a centered modal dialog (spring animation, backdrop blur). Works the same on mobile and desktop.
- **MotionPanel → centered modal** — motion detail panel is now a centered modal. Vote rows sorted YES → NO → ABSENT; a YES/NO summary bar shown above the full breakdown.
- **Homepage hero redesigned** — removed oversized stats column (text-5xl numbers, p-8 padding). Stats are now a single compact strip (text-xs inline row). Highlights list is denser (no card borders per item, line-clamp-1). Hero card and Your Ward card now sit side-by-side on desktop, both visible above the fold.
- **Your Ward card** — persistent homepage card that stores your ward in `localStorage`. Shows ward number, name, councillor name (linked to their profile), and their 4 most recent votes. Includes a "Find my ward" geolocation button with friendly error messages for denied/out-of-area/unsupported. A × button clears the ward to allow re-selection.
- **Collapsed homepage hero** — stat cards (Last Meeting, Substantive, Adopted) and "What's been happening" highlights merged into a single two-column card: stats on the left, recent highlights as a compact list on the right. Cuts homepage scroll significantly.
- **Motion detail panel** — clicking a motion now opens a slide-in panel (right edge, like the councillor profile) instead of navigating to a full page. Motion detail is now overlaid on the motions list so the list stays visible in context. Route `/motions/:id` still works and opens the panel with the list behind it.
- **Clickable councillors in motion panel** — councillor names in the vote breakdown are now clickable links to their profile panel. Clicking closes the motion panel and opens the councillor profile at `/councillors/:slug`.
- **Topics sidebar (desktop)** — on large screens the topic filter pills are now a sticky left sidebar alongside the motions list instead of a horizontal bar above it. Mobile keeps the horizontal pill row. Shows live motion count and a "Notable only" toggle.
- **Last meeting card: honest topic display** — the "By topic" bar (which was showing all-time topic distribution) is replaced with topic badges from the last meeting's actual motions + that meeting's adoption rate. Removes misleading all-time bar from a card labelled "Last Meeting".
- **Ward SVG map** — when you click into a ward, a simple SVG outline of the ward boundary is shown above the motions list (derived from the bundled `wards.geojson`, no external dependency). An "OpenStreetMap" link in the corner opens the ward in OSM.
- **VersusOverlay → full-page topic breakdown** — VS mode now renders full-width (replacing the councillor grid) instead of a sidebar. Content changed from a raw divergent-motions list to a topic-by-topic breakdown: each topic shows both councillors' YES rates as bars + agreement rate. Top 5 most significant divergent motions still shown below. External link icon on each motion row links to toronto.ca.
- **Ward card click-through** — clicking a ward card now shows a significance-sorted motion list for that ward (with back navigation). Previously cards were not interactive.
- **Bundled ward boundaries** — ward GeoJSON downloaded from Toronto ArcGIS and saved to `public/data/wards.geojson`. "Find my ward" no longer depends on the CKAN API (which was unreachable).
- **Scorecard dense ranking** — ties share the same rank number. Podium (gold/silver/bronze) hidden when top values are tied (e.g. multiple councillors at 100% attendance).
