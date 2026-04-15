# Changelog

All notable changes to this project will be documented in this file.

See [CHANGELOG_ARCHIVE.md](CHANGELOG_ARCHIVE.md) for earlier history.

## [2.4.5] - 2026-04-15

### Added
- **AI summaries generated** — Gemini 2.5 Flash summaries written for 926 primary motions.
- **Geocoding complete** — 221 motions with street addresses geocoded to lat/lng via Nominatim for ward map pins.
- **City-scoped URLs** — all routes now live under `/toronto/` (e.g. `/toronto/committees`, `/toronto/motions/:id`). Implemented via React Router `basename`. Root `/` redirects to `/toronto`. Designed for future multi-city expansion.
- **Elo notability ranking** — `rank_notability.js` rewritten to use Elo rating system. Strict 1v1 Gemini matchups, scores persist across runs, new motions can be added incrementally. Writes `eloScore` to motions.json.

### Fixed
- **Compare mode resets on navigation** — leaving the councillors section now automatically cancels compare mode.
- **Compare from profile page** — clicking Compare while on a councillor profile now navigates to the councillors list first.

### Changed
- **Body text stripped** — raw scraped body removed from motions.json (12.1 MB saved); summaries retained.

## [2.4.4] - 2026-04-14

### Added
- **Meeting pages** — new `/meetings/:ref` route (e.g. `/meetings/2026.PH29`) with full agenda item list, ward tags, in-camera badges, and links out to TMMIS. Two-column layout: agenda left, meeting meta sidebar right.
- **TMMIS agenda API integration** — `fetch_meetings.js` now pulls published agendas from `secure.toronto.ca/council/api` for each upcoming meeting. Stores `agendaItems` (reference, title, wards, inCamera, url) and `meetingReference` on each meeting object. Uses browser-level headers to bypass Akamai WAF.
- **`rank_notability.js` written** — pairwise quicksort script using Gemini API. Strict 1v1 comparisons against a random pivot, recurses into groups, writes `notabilityRank` to motions.json. Caches comparison results for resumability. Ready to run.

### Fixed
- **Daily import no longer wipes summaries** — `import_open_data.js` now merges enriched fields (`summary`, `keyAmounts`, `notabilityRank`, etc.) from the previous motions.json before writing, so GitHub Actions daily runs preserve all AI-generated data.
- **Mini map navigates to full map** — clicking the Toronto map on the dashboard now always goes to `/wards` (the choropleth full map) instead of `/wards/:id` (the ward motion list).

### Changed
- **Meeting page header matches MotionPage pattern** — date, time, and location moved from sidebar card into a metadata row below the h1 (`reference · date · time · location`). Sidebar now contains only agenda status and committee link.
- **Committee detail redesigned** — two-column layout matching MotionPage: motions on the left (2/3), sticky sidebar on the right with stats (adoption bar), upcoming meetings, and member pills. Back button added.
- **Upcoming meeting rows link to meeting pages** — clicking a meeting row in the committee sidebar or dashboard "Coming Up" card now navigates to `/meetings/:ref`.
- **Scraper targets all primary motions** — removed the `significance >= 25` filter from `scrape_agenda_text.js`. All 926 primary motions now scraped.
- **Navbar M logo removed** — just "Motions · Toronto" text.
- **VISION.md added** — north star statement extracted from ROADMAP.md into its own file.
- **README updated** — stack reordered (AI first), stale entries removed, vision one-liner added.

## [2.4.3] - 2026-04-14

### Added
- **Multi-select filtering** — the Dashboard filter sidebar and mobile filters now support selecting multiple topics, committees, vote types, and years simultaneously. Selected committees are displayed as removable inline chips below the search bar.

### Fixed
- **Councillor header responsiveness** — fixed a flexbox bug that was aggressively crushing the right-hand stat cards by restricting the width of the main Identity container.
- **Committee pills aesthetic** — transformed the bulky gray committee pills next to councillor names into a clean, space-saving, comma-separated text inline string positioned below the contact info.
- **Recent votes cleanup** — removed redundant header text ("Most Recent Votes" and small duplicated link) to focus attention on the main "See all N votes →" call to action button.
- **Navbar collapse breakpoint** — updated the mobile-menu (`Menu`) breakpoint from `md` to `lg` to prevent the desktop navigation bar from overlapping utility right-side buttons on medium width screens (e.g., 900px-1024px).

## [2.4.2] - 2026-04-14

### Changed
- **Councillor committee threshold fixed** — committee pills on councillor profiles now use a fixed minimum of 5 votes instead of a percentage-based threshold that was filtering out all non-City-Council committees.

### Added
- **Upcoming meetings on committee pages** — committee detail pages now show a scheduled meetings section above the motions list, pulling from meetings.json.

## [2.4.1] - 2026-04-14

### Changed
- **Your Following column hidden when empty** — instead of a blank placeholder card, the column disappears and Notable expands to fill the space.
- **Most Notable bento label** — renamed from "Most Recent Notable" to "Most Notable".
- **Notable cards prefer last 45 days** — bento highlights now prioritise motions from the last 45 days, falling back to older motions only if the window is empty.

## [2.4.0] - 2026-04-14

### Changed
- **Rebranded to Motions** — site name updated from "Your City at Work" to "Motions" and domain updated to `motions.watch` across all metadata, OG tags, canonical URL, nav logo, and scripts.

### Added
- **Multi-committee following** — users can now follow multiple committees simultaneously.
- **Aggregated dashboard feed** — the "Your Following" card now displays the most recent meeting across all favorite committees, with automatic label pivoting.
- **Committee Educational Blurbs** — added descriptive mission statements for all major committees to help users understand their specific mandates and civic impact.
- **Bento 1-4-1 Layout** — restructured the dashboard header into a balanced grid: 1 followed card, 2 notable + 2 ward motion cards, and 1 upcoming meeting card. When no ward is set, all 4 center cards show notable motions.
- **Your Ward in Bento Grid** — the center grid now includes 2 cards showing the most recent motions your ward councillor voted on, with a dedicated "Your Ward" section label.
- **Bento Card Deduplication** — motions shown in "Your Following" are excluded from "Most Recent Notable", and both are excluded from "Your Ward", preventing duplicates across the dashboard header.
- **Ward Button Navigation** — the navbar ward button ("Ward 7 · Perruzza") now navigates to your ward page instead of clearing your ward.
- **Coming Up Clickthrough** — the Coming Up card now shows the meeting room/location and clicks through to the committee page.
- **Complete Committee Blurbs** — added descriptions for all 30 committees in the dataset, including TO Live, Toronto Zoo, FIFA World Cup Subcommittee, and Confronting Anti-Black Racism Advisory Committee.
- **Ward sidebar** — centralized "Your Ward" details and the Ward Map into the right-hand sidebar for a cleaner main feed.
- **Motion Authorship Cards** — extracted Mover and Seconder data into dedicated, interactive pills within the motion summary, including automatic title cleanup of redundant "by Councillor" text.
- **Title Clamping & Tooltips** — enforced a strict 3-line height limit for all cards across the app, paired with a full-text hover tooltip for accessibility.
- **Expanded Councillor History** — increased the "Recent Notable Votes" visibility on councillor profiles from 4 items to 10 for better retrospective analysis.
- **Sidebar Height Alignment** — scaled the Toronto Mini-Map to 480px to perfectly match the height of the filter sidebar.
- **"Find My Ward" Global Onboarding** — updated the Navbar label to "Find My Ward" to improve clarity for new users.
- **Multi-committee Activity Aggregation** — implemented intelligent labeling (e.g., "Multiple Committees") in the dashboard feed to handle overlapping meeting schedules.

### Changed
- **Navbar Centering** — absolutely centered the Councillors/Committees/Wards nav so it no longer shifts when the Compare button appears or disappears.
- **Navbar Button Order** — Compare button now appears before the Ward button for better visual hierarchy.
- **Number Formatting** — added comma separators to motion counts (e.g., "1,234 motions" instead of "1234").
- **Header Synchronization** — standardized column widths across the entire dashboard (200px | 1fr | 220px) for a seamless vertical flow.
- **Improved Action styling** — redesigned the "Find my ward" button with a soft, integrated aesthetic for better sidebar fit.
- **Data Density** — increased the "Most Recent Notable" slice to 4 items to fill the expanded central grid.
- **Refined Labels** — removed redundant all-caps labels ("YOUR WARD", "WARD MAP") to reduce UI noise.
- **Status Deduplication** — removed redundant status badges from the final vote record on single-vote motions for a cleaner detail view.
- **Layout Harmonization** — removed the redundant "Your Ward" card to streamline the spatial intelligence column.
- **Typography Standardization** — refined Motion Page header typography and removed italics from "Motion Summary" for an editorial look.
- **Councillor Feed Pivot** — transitioned councillor vote history from a horizontal scroll to a chronologically sorted (latest first) vertical feed.
- **Improved Vote Context** — expanded councillor vote items to include topic tags and specific meeting dates for better scanability.
- **Global Cursor Pointer** — all buttons, links, and interactive elements now show the hand cursor on hover.
- **Councillor Callout Link** — the "Your Councillor" card on motion pages now uses a clickable blue link matching the Mover/Seconder format, linking directly to the councillor's profile.
- **Ward Motion Sorting** — ward detail pages now sort motions by date (newest first) instead of significance only.
- **Explicit Vote Breakdowns** — updated the vote breakdown UI to explicitly list non-councillor votes (e.g., "+ 2 non-councillors") inline with the Yes/No lists, replacing the easily missed footnote, and preventing supposedly "empty" columns from disappearing.
- **Motion Page Layout** — refactored the motion detail page into a dense 2-column grid to reduce vertical scrolling, and made the "Back" button hang dynamically in the left gutter on large screens to reduce vertical space usage.
## [2.3.0] - 2026-04-13

### Added
- **Upcoming meetings strip** — "Coming Up" section on the dashboard shows the next 10 meetings (next 90 days, major committees only) as horizontal scrollable cards. City Council meetings are highlighted in blue. Powered by a new `fetch_meetings.js` script pulling from Toronto Open Data's meeting schedule CSV. `meetings.json` is now fetched on app load alongside `motions.json` and committed daily by GitHub Actions.

## [2.2.0] - 2026-04-13

### Added
- **Sub-motion context** — when expanding a sub-vote on a motion page (e.g. "Refer Item"), a plain-language description of what that motion type means is shown, plus the sub-entry's title if it differs from the parent.
- **Councillor voting record page** — `/councillors/:slug/votes` shows every motion (no trivial filter), newest first, with topic and yes/no filters. Profile page now shows only 5 recent notable votes and a "See all N votes →" link.
- **Ward finder on councillors page** — compact "Find my ward / change" bar at top of councillor list so users can set or clear their ward without going to the dashboard.
- **2025 councillor expenses** — sourced from the City of Toronto annual remuneration report (year ended December 31, 2025). Councillor profiles now show an office expenses card: total spent vs. the $60,053 constituency services budget, a utilization bar, and a breakdown of top spending categories.
- **Multi-select filters on councillor page** — category and vote filters now toggle independently; multiple selections can be active simultaneously.
- **"Years on council" stat** — displays accurate total years based on actual terms served. `build_tenure.js` includes `SUPPLEMENTAL_TERMS` overrides for pre-2006 service and a `TERM_YEARS` map for correct 3-year term lengths. Stored as `totalYears` in `tenure.json`.
- **Labeled amount extraction** — `extract_fields.js` now stores `{ value, context }[]` instead of bare numbers; each amount carries the line of body text it came from. UI handles both formats with graceful fallback and hover tooltip.
- **Gemini-labeled keyAmounts** — `generate_summaries.js` now extracts up to 2 key financial figures per motion alongside the summary. Each has a plain-language label, value, unit, and type. `--fill-amounts` flag backfills existing summaries. Backfill complete: 363/363 processed.
- **Clickable bento cards** — Last Meeting card toggles the motion list to that meeting's motions; Your Ward card navigates to the ward detail page.
- **Year filter** — sidebar filter (desktop) narrows the motion list to a specific year (2022–2026), derived dynamically from loaded motions.
- **Summary snippets in motion list** — two-line plain-language excerpt shown below the title in list cards when a summary exists.
- **Summary snippets on councillor profiles** — vote history rows show a two-line excerpt when a summary exists, matching the dashboard treatment.
- **Global search includes summaries** — `summary` field included in search index; summary-only matches show a highlighted excerpt. Title matches still rank above summary matches.
- **Clear filters button** — appears in the desktop sidebar when any filter is active; resets all filters in one click.
- **Mobile year filter** — year pills added to the mobile filter pill row, consistent with the desktop sidebar.
- **Toronto mini-map on homepage** — `TorontoMiniMap.jsx` fills the right column of the motion list grid. Shows all 25 ward boundaries + geocoded motion pins (green = Adopted, red = Lost). Interaction disabled; clicking navigates to `/wards`. Lazy-loaded.
- **"Show 20 more" pagination** — motion list loads in increments of 20 instead of all at once. Resets to 20 when filters change.
- **Full Toronto map on Wards page** — `TorontoFullMap.jsx` replaces the ward card grid. Interactive map with all 25 ward polygons; hovering a card flies the map to that ward. Saved ward highlighted in blue.

### Changed
- **Councillor profile redesigned** — header integrates photo/name alongside stat bento cards (Votes, Attendance, Yes Rate, Tenure, Office Spend) in one row. Body is a 3-column layout: Voting DNA + alignment in left sidebar; 4 recent notable votes as 2×2 card grid in centre; 2025 expenses in right sidebar. Most/Least Aligned use councillor photos with initials fallback. Former members filtered from alignment list.
- **Ward finder moved to navbar** — "My ward" / "W{id} · {Last name}" button always visible in the navbar; removed from the councillors list page.
- **VS page redesigned for density** — topics and divergences sit side by side in matching cards; topic breakdown is a compact table (topic, C1 yes%, C2 yes%, agree%); divergences capped at 6; motion ID shown on each row.
- **Compare button moved to navbar** — appears beside the search bar only when on the councillors page; state lifted to AppShell.
- **Committees breadcrumb** — the `←` icon on committee detail pages replaced with a plain "Committees" text link above the title.
- **Councillor profile filter bar consolidated** — category, vote (Yes/No), and sort controls merged into a single row.
- **Redundant badges hidden when filtering** — Yes/No, topic, and Notable/High Impact badges hide when their respective filter makes them self-evident.
- **Impact sort removed** — vote history always sorts newest first; significance score no longer exposed to users.
- **Stats strip consolidated** — committee badges and contact info merged into the same flex row as vote/attendance stats, separated by dividers.
- **Councillor vote history defaults to newest first**.
- **Funding panel capped at 3 amounts** — motions with many dollar figures show the first 3 with a "+N more" label.
- **Funding panel hidden for high-volume motions** — suppressed when a motion has >10 amounts (e.g. budget documents).
- **Compact filter sidebar** — small pill clusters in a fixed-height card (`h-[480px]`). Committee filter replaced with a search input.
- **Your Ward bento card redesigned** — ward number pill + ward name in top row; councillor name as bold headline.

### Fixed
- **GitHub Actions write permissions** — added `permissions: contents: write` to `refresh-data.yml` so the daily data refresh can commit and push `motions.json`.
- **Mini-map click destination** — clicking the homepage mini-map now navigates to `/wards/${wardId}` if a ward is saved, otherwise `/wards`.
- **Yes/No casing** — vote labels display as "Yes" / "No" throughout the councillor page (pills, cards, and DNA chart).
- **Ward ID normalization** — `src/utils/storage.js` introduced with `getWardId()` / `setWardId()`. Eliminates leading-zero bug (`"09"` → `"9"`) and removes duplicated localStorage logic across 6 components.

## [2.1.1] - 2026-04-10

### Fixed
- **Ward detail page runtime fix** — imported the missing `ArrowRight` icon in `WardGrid.jsx`, restoring individual ward pages at `/wards/:wardId`.

### Changed
- **Package metadata version sync** — bumped `package.json` to `2.1.1` and aligned the root `package-lock.json` version fields.

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
