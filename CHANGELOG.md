# Changelog

All notable changes to this project will be documented in this file.

See [CHANGELOG_ARCHIVE.md](CHANGELOG_ARCHIVE.md) for pre-2.0.0 history.

## [Unreleased]

### Added
- **"Your Ward" filter on dashboard** — when a ward is saved, a "Your Ward" button appears in the filter sidebar showing the councillor's name. Filters the motion list to motions specifically tagged to that ward.
- **"Your Councillor" callout on motion pages** — if a ward is saved and the councillor's vote is recorded, a coloured callout (green/red/grey) appears above the vote breakdown showing how your councillor voted.
- **Geocoding pipeline** — `scripts/geocode_addresses.js` extracts street addresses from motion titles using regex, geocodes them via Nominatim (free, no API key), and stores `locations: [{address, lat, lng}]` on each motion. 218 motions now have location data. Handles multi-address titles (e.g. "150 The Donway West and 4 Overland Drive") by storing all addresses as separate pins.
- **Field extraction pipeline** — `scripts/extract_fields.js` runs a regex pass over scraped body text before stripping it. Extracts: `amounts[]` (dollar values normalized to integers), `staffRecommendation` ('approval' | 'refusal' | null), `developer` (applicant name for zoning items), and `relatedMotions[]` (cross-referenced motion IDs like "In response to Council direction (2025.MM35.15)"). 88 motions have dollar amounts; 82 have cross-references.
- **Plain-language summaries** — `scripts/generate_summaries.js` reads scraped `body` text, calls Gemini 2.5 Flash API, and writes a 2-3 sentence plain-language `summary` to each motion. `scripts/strip_body.js` removes raw `body` before committing (pipeline-only field). In progress.
- **Councillor card on ward detail pages** — every ward detail page now shows a councillor callout with photo, name, and a link to their profile. Labels as "Your Councillor" when viewing your own ward.
- **"Your Councillor" highlight on councillors grid** — if a ward is saved, the matching councillor's card is highlighted with a blue border and "Your Councillor" pill, matching the "Your Ward" treatment on the wards page.
- **Vote history sort + outcome filter on councillor profiles** — Impact / Date sort toggle and All / YES / NO outcome filter pills added to the vote history section.
- **Vote type filter on dashboard** — sidebar and mobile pills now include Close vote, Unanimous, Defeated, and Landslide loss filters using the existing flags data.
- **Search suggestion pills** — the global search empty state now shows clickable topic pills and common search terms instead of a plain text hint.
- **Summary slot on motion pages** — `motion.summary` field renders below the title on motion detail pages; invisible until summaries are generated.
- **TMMIS scraper** — `scripts/scrape_agenda_text.js` added; uses Playwright to scrape agenda item body text from toronto.ca and stores it as a `body` field on each motion, incrementally.

### Changed
- **Councillor roster updated** — Rachel Chernos Lin (Ward 15, won by-election Nov 2024) and Neethan Shan (Ward 25, won by-election Sep 2025) replace Jaye Robinson and Jennifer McKelvie respectively. Anthony Perruzza (Ward 7) and Neethan Shan added to `COUNCILLORS` array where they were previously missing. Jennifer McKelvie added to `FORMER_MEMBERS` (resigned May 2025). Rachel Chernos Lin tenure corrected to 2024. Ward 16 mapping corrected to Jon Burnside (was incorrectly showing Chernos Lin).
- **Removed PROGRESSIVES/CONSERVATIVES constants** — editorial political lean labels removed from `data.js`. Were unused in the UI and based on subjective judgment.
- **Summaries model updated** — `generate_summaries.js` migrated from deprecated `gemini-2.0-flash` to `gemini-2.5-flash`. Delay adjusted from 4s to 10s to stay within free tier rate limits (6 req/min vs 10 RPM limit).
- **Refactored topic colour constants** — `TOPIC_LIGHT` and `TOPIC_DOT` centralized in `src/constants/data.js`; removed local duplicate definitions from `WardGrid`, `CouncillorProfile`, `CommitteesView`, `DashboardView`, `GlobalSearch`, and `VersusOverlay`.
- **Extracted VsPickerModal** — VS comparison picker modal split out of `CouncillorProfile.jsx` into its own `VsPickerModal.jsx` component.
- **CouncillorProfile back button** — added "← Back" nav at the top of every councillor profile page.
- **"Your Councillor" badge on profile page** — when viewing your own councillor, a blue "Your Councillor" pill appears next to their name in the profile header.
- **Empty votes state on motion pages** — when a motion has no recorded votes, the vote section now shows a clear "No recorded votes for this item." message instead of an empty bordered box.

### Fixed
- **Ward keyword coverage** — added geographic keywords for the 7 previously uncovered wards (6 York Centre, 7 Humber River–Black Creek, 17 Don Valley North, 20 Scarborough Southwest, 21 Scarborough Centre, 22 Scarborough–Agincourt, 24 Scarborough–Guildwood) in `import_open_data.js`. Previously 93.8% of motions fell through to "City".

### Removed
- **Dead component files** — deleted `MotionDetail.jsx`, `MotionPanel.jsx`, `ProfilePanel.jsx`, and `Scorecard.jsx`; all four were superseded and had no remaining imports.
- **`scripts/fetch_motions.js`** — old import script using CKAN API and different status vocabulary. Superseded by `import_open_data.js`.
- **`getPairwiseAlignment` in `analytics.js`** — exported but never imported anywhere. Removed.

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
