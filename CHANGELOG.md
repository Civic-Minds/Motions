# Changelog

All notable changes to this project will be documented in this file.

See [CHANGELOG_ARCHIVE.md](CHANGELOG_ARCHIVE.md) for pre-2.0.0 history.

## [2.0.2] - 2026-04-10

### Changed
- **Renamed to Your City at Work** — browser tab, OG tags, navbar logo, and developer configuration updated from "Motions" to "Your City at Work".

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
