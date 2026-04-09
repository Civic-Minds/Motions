# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
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

### Changed
- **Scorecard** — ranked leaderboard of all 26 councillors at `/analytics`. Sortable by attendance, majority alignment, yes rate, or votes cast. Active sort highlights with a podium top-3; non-active stats dim. Stats computed from live motions data via `getAttendance` and `getMemberAlignmentScore`.
- **CommitteesView** — new page at `/committees` listing all 15 committees derived from motion ID prefixes (e.g. `PH` → Planning & Housing). Each card shows total motions, adoption rate bar, substantive count, and top topics. Clicking drills into a significance-sorted motion list for that committee.
- **Committee badge on motion rows** — `getCommittee(id)` utility derives committee name from motion ID prefix; shown as a grey pill on every motion row in the dashboard.
- **COMMITTEE_NAMES mapping + `getCommittee()`** — added to `constants/data.js` with 15 committee code → full name entries.
- **CouncillorList** — 25-councillor card grid with alignment % and attendance % bars, search, compare mode (select two → opens VersusOverlay), shareable URLs (`/councillors/:slug`, `/councillors/:slug/vs/:slug2`).
- **ProfilePanel** — slide-in panel showing voting DNA by topic, most-aligned peers, top 20 notable votes sorted by significance, topic filter pills, attendance stats.
- **VersusOverlay** — slide-in split panel showing alignment score, YES/NO DNA bars for both councillors, full list of motions where they voted differently.
- **WardGrid** — 25-ward card grid with motion counts, councillor names, "Find my ward" geolocation (fetches Toronto Open Data GeoJSON, point-in-polygon lookup, highlights matched ward).
- **MotionDetail** — dedicated page at `/motions/:id` with full vote breakdown (YES/NO/ABSENT per councillor), back navigation.

- **MotionDetail: external link + committee + significance label** — each motion detail page now shows a "View on toronto.ca" link, the committee name, and the tiered significance label (High Impact / Notable) instead of the raw score.

### Changed
- **Dashboard motions list** — replaced the date-grouped meeting accordion with a flat list sorted by significance (highest first). Shows top 20 by default with a "Show all N motions" toggle. Topic filter and Notable toggle still apply.
- **Dashboard stat card** — "Motions" card now shows the count from the most recent meeting date instead of the all-time total.
- **Significance labels** — replaced raw score display ("66 significance") with tiered labels: "High Impact" (90+) and "Notable" (60–89) throughout the app.
- **Navbar** — removed redundant "Dashboard" tab (logo navigates home). Removed "717 motions" live pill. Added "Committees" tab with `Building2` icon.
- **Full clean rebuild** — moved project to `/Users/ryan/Desktop/Production/Motions`, rewrote entire frontend. Tailwind v4, React 19 + Vite 7, `framer-motion`, `react-router-dom` v7. Zero mock data — all views wired to `motions.json`.
- **Removed unused imports** — cleaned up `AnimatePresence`, `CheckCircle2`, `FileText`, `ChevronDown`, `ChevronUp`, `LayoutDashboard` after dashboard accordion removal.



## [1.2.0] - 2026-04-03

### Added
- **Clickable councillor names throughout** — councillor names in the motion detail vote breakdown (YES/NO/Absent), and the mover/seconder fields, are now interactive buttons that open that councillor's ProfilePanel. Names in the inline voter expansion in MotionTable are also clickable. Closes the loop between motions and people across the entire app.
- **Motion cross-references** — motion detail pages now parse item IDs from titles (e.g. "Re-Opening and Amending Item 2024.EX15.3") and render a References section linking to the cited motion. A Referenced By section appears on the target motion showing what later items point back to it. Bidirectional, derived entirely from title text.
- **Motion detail pages** (`/motions/:id`) — each motion now has a permanent, shareable URL. Shows full title, date, topic, outcome, mover/seconder, and a full YES/NO/Absent vote breakdown with all councillor names. Motion titles in the table are now links to their detail page.
- **Vote breakdown in MotionTable** — clicking the "Voters" bar on any motion card expands an inline panel showing individual YES/NO/Absent voters by last name, without leaving the table. The bar also remains a link to the full detail page.
- **Topic filter in ProfilePanel** — pill filters above the Notable Votes list let users drill into a specific topic (Housing, Transit, Finance, etc.) for the selected councillor.
- **"Sort by Bloc" toggle on AlignmentMatrix** — reorders the pairwise matrix rows and columns by consensus alignment score, causing ideological clusters to emerge as visible blocks without any hardcoded groupings.
- **Escape key closes panels** — pressing Escape dismisses the ProfilePanel or VersusOverlay (whichever is open), with the same navigate-back behaviour as the close button on councillor sub-routes.
- **Pairwise alignment matrix** — new `AlignmentMatrix` component on the Analytics page showing agreement % between every pair of councillors as a colour-coded NxN grid. Computed in one pass via `getPairwiseAlignment()` in analytics.js. Hovering a cell dims all unrelated rows/columns and shows a callout with the exact pairing and percentage. The colour scale runs from rose (low agreement) through amber to emerald (high), making the progressive/conservative fault line visible at a glance without any hardcoded groupings.
- **"Votes With" section in ProfilePanel** — shows the top 5 councillors this member agrees with most often (% agreement on shared non-trivial YES/NO votes, minimum 10 shared votes). A "Least aligned" row at the bottom shows the 3 most opposed councillors by last name + percentage. Powered by new `getVotedWith` utility in `analytics.js`.
- **Legislative Activity timeline in Scorecard** — horizontal bar chart showing motions per session across the full term. Each bar is split into adopted (green) and non-adopted (blue) segments. Hovering a bar shows the session date, total count, and adopted count. Spans the full term chronologically.
- **Shareable councillor URLs** — councillor profiles and VS comparisons now have permanent, linkable URLs:
  - `/councillors/:slug` — opens that councillor's ProfilePanel directly (e.g. `/councillors/josh-matlow`)
  - `/councillors/:slug/vs/:slug2` — opens the VersusOverlay for two councillors (e.g. `/councillors/josh-matlow/vs/gord-perks`)
  - New `src/utils/slug.js` utility: `nameToSlug` and `slugToName` for converting between display names and URL-safe slugs
  - Browser URL updates automatically when a card is clicked or a VS pair is completed
  - Navigating directly to a profile/VS URL reopens the correct panel without needing to click through the UI
  - Closing a panel from a sub-route navigates back to `/councillors`

### Fixed
- **Error state** — `App.jsx` now reads `error` from `useMotions` and renders a visible error card if `motions.json` fails to load. Previously the app would spin indefinitely.
- **VersusOverlay: no shared vote history** — when two councillors share zero vote records, alignment score now shows "NO SHARED VOTES" in the header and "No shared vote history for these two councillors." in the divergence panel. Previously it displayed a misleading "100% UNANIMOUS" message.
- **Alignment baseline** — `getMemberAlignmentScore` now returns `null` instead of an arbitrary 75% when a councillor has no recorded votes. `AlignmentHeatmap` and `CouncillorList` both guard against null.

### Changed
- **Centralized topic & flag styles** — `TOPIC_BADGE`, `TOPIC_PILL`, `TOPIC_COLOR`, `FLAG_STYLES`, `FLAG_LABELS`, and `FLAG_FILTER_STYLES` moved to `constants/data.js`. Removed duplicate definitions from `ContestBoard`, `VersusOverlay`, `ProfilePanel`, `MotionTable`, and `CouncillorList`.
- **AlignmentHeatmap: threshold note** — footnote added below the heatmap grid explaining that councillors with fewer than 5 recorded votes are excluded.

### Removed
- **`services/scraper.js`** — unused stub file (mock data, random alignment math). All real data comes from `public/data/motions.json` via the import pipeline.

### Added
- **Mobile responsive pass** — full layout support for screens below 768px:
  - **Navbar**: hamburger menu (Menu/X icon) collapses nav links into a sticky dropdown drawer on mobile. Desktop nav and Live Data indicator hidden on small screens.
  - **Stats grid**: `dashboard-stats-row` switches to 2-column on mobile; the mainline card spans full width and stacks its content vertically.
  - **Main content**: padding reduced from 32px to 16px on mobile.
  - **ProfilePanel & VersusOverlay**: side panels expand to full-screen (100vw / 100dvh, no border-radius) on mobile. Panel header and content padding reduced.
  - **MotionCard**: gap and padding tightened (`gap-2 p-3` → `gap-6 p-5` on `sm:`) and topic column narrowed (`w-[72px]` → `w-[88px]` on `sm:`) so motion titles have adequate room on 375px+ screens.
  - **Scorecard impact cards**: icon hidden on mobile to reduce clutter in the Impact Pulse list.

### Added
- **Ward → Councillor connection** — each ward card on the Wards page now shows the councillor's name for the 2022–2026 term (by-election winners included). Clicking a ward card opens that councillor's ProfilePanel directly.
- **Last Session widget** — compact strip on the Dashboard (between the stats row and filters) showing the most recent meeting date, adoption/defeat counts, and top 3 substantive motions. Gives return visitors immediate context without scrolling the full table.
- **"Locate my ward" geolocation** — button on the Wards page requests the user's location, fetches Toronto's official ward boundary GeoJSON from Toronto Open Data (lazily, cached for the session), runs a client-side point-in-polygon lookup, highlights the matched ward card with a "Your Ward" badge, scrolls to it, and opens that councillor's ProfilePanel automatically. Gracefully handles permission denial, out-of-Toronto locations, and network errors.

### Added
- **Framer Motion** — installed `framer-motion` as a dependency for all animation work.
- **Page transitions** — every route change fades and slides via `AnimatePresence` in `Layout.jsx`.
- **Dashboard stat card stagger** — the four header stat cards spring in with an 80ms stagger on load (`DashboardView`).
- **Topic filter pill animation** — active filter pill uses `layoutId` so the blue background slides between selections instead of snapping.
- **Meeting group stagger** — meeting rows in `MotionTable` stagger in on load; expanding a meeting animates height open/closed via `AnimatePresence`.
- **Motion card entrance** — individual motion cards stagger in with spring physics when a meeting is expanded.
- **Councillor grid stagger** — councillor cards stagger in on load (`CouncillorList`).
- **Alignment Heatmap stagger** — tier columns stagger in; member rows slide in from the left within each tier (`AlignmentHeatmap`).
- **Ward grid pop-in** — all 25 ward cells scale in with a 30ms per-cell stagger (`WardGrid`).
- **Scorecard animations** — stat cards stagger in; major adoption cards slide in from the left with stagger (`Scorecard`).
- **Budget Translator animations** — stat cards stagger in; department detail panels animate height open/closed with stat tiles staggering in on expand (`BudgetTranslator`).
- **Navbar refresh** — renamed logo to "Motions / Toronto Council", added explicit Dashboard nav link, added live data indicator dot on the right.

### Changed
- **MotionTable redesign** — replaced bloated glass-morphism accordion cards with a cleaner card-based feed. Meeting headers now use a solid `#004a99` MTG badge, visible `border-slate-200` card border, and `shadow-sm` at rest. Expanded motions render inside a `bg-slate-50/50` container with white motion cards. Motion cards use a coloured left border (green = adopted, red = defeated) as a quick-scan status indicator. Removed verbose "Official Council Meeting Transmission" subtitle.
- **BudgetTranslator chart** — changed bar chart container from dark `bg-slate-900` to a white card matching the rest of the page. Each department now has a distinct bar colour (TTC blue, Police purple, Shelter orange, Fire red, Parks green, All Others light grey). Chart height reduced from 430px to 320px. Bottom "Net vs Gross" callout changed from dark card to a light blue info block.
- **Scorecard sidebar** — Session Synopsis card changed from dark navy (`bg-slate-900`) to a white card with a blue border accent and icon that fills on hover. Legislative Fingerprint card changed from a solid green gradient to a white card with an emerald icon, eliminating the jarring colour contrast.
- **WardGrid cards** — reduced `mb-8` gap on ward name to `mb-3`; item count bumped from `text-[10px]` to `text-2xl` so each card has a clear focal point.

### Added
- **Readability Restoration** — Purged excessive `uppercase` styling from motion titles, navigation labels, and primary dashboard metrics to restore text scanning efficiency.
- **Jargon Elimination** — Replaced abstract terminology with standard, descriptive English:
    - `Outcome Pulse` → `Outcome`
    - `Consensus Flow` → `Votes`
    - `System Volume` → `Motions` / `Total Activity`
    - `Legislative Pulse` → `By Topic`
    - `Registry` → `Records`
- **Visual Spacing Refinement** — Abolished the `tracking-widest` and `tracking-[0.3em]` letter-spacing system across all `.pulse-label` and `.card-title` classes for a cleaner, modern look.
- **Definitive Search Bar Geometric Fix** — Abolished absolute icon positioning in favor of a robust flexbox-based layout across all modules. This ensures the search icon and placeholder text are physically decoupled as siblings in a row, making it impossible for them to overlap regardless of browser-specific CSS scaling or Tailwind utility overrides.
- Standardized dashboard card rounding to `32px` for visual consistency across all modules.

### Changed
- **Typography Density** — Adjusted the global font architecture to prioritize legibility over "technical telemetry" aesthetics while maintaining the high-fidelity 32px rounding.
- **Status Tags** — Standardized status indicators to use title-case labels and high-contrast semantic coloring without forced capitalization.
- **Navigation Transparency** — Updated the global navigation and logo to standard casing to improve professional brand clarity.
- **Old Jargon Elimination** — Purged abstract headers ("Legislative Ecosystem Feed") and ambiguous labels ("Active Cluster") in favor of direct, record-derived quantitative metrics.
- **Global Design System** — Standardized legacy components to 32px rounded Motions UI containers (white-to-slate architecture).
- **Motions UI Overhaul** — Purged experimental dark/tactical gradients in favor of high-fidelity "Pulse" white surfaces and diffused shadows.
- **Legislative Stream (Motions)** — Abolished legacy card formats for 32px rounded white cards with segmented consensus tracks and large binary outcome labels.
- **Metadata Vertical Rhythm** — Resolved typography collisions and overlap issues in categorical headers; optimized contrast for ID identifiers.
- **Geographic & Fiscal Intelligence** — Overhauled Ward cards, Budget Translator, and Scorecard into high-fidelity "Analytics Alpha" diagnostic modules with 32px rounding.

### Fixed
- **Motion Feed Integrity** — Performed a full structural JSX recovery in `MotionTable.jsx`, resolving persistent syntax errors and orphaned code blocks.
- **Search Terminal Interface** — Rectified the icon/placeholder overlap and geometric misalignment in the main query node.
- **Consensus Score Relocation** — Alignment Heatmap moved from Dashboard to the top of the Councillors page as a full-width 'Alignment Atlas'.
- **UI De-cluttering** — Removed redundant "Intelligence" and "Scorecard" labels; standardized on high-density metric tags and 10px tracking-widest labels.
- **Side Panels (Profile/Versus)** — Upgraded to 32px rounded floating panels with backdrop-blur and refined 40px internal padding.
- **Status Badges** — Swapped for high-density semantic tags with 9px font and 0.1em tracking.
- **Tailwind CSS missing utility classes** — Resolved issue where all platform-wide CSS was silently unapplied due to missing `@import "tailwindcss"`.
- **Export UI Redundancy** — Purged redundant CSV download triggers and legacy `/export` routes from the global architecture.
- **Navbar Telemetry** — Corrected status indicator clutter by removing legacy meeting date/count strings from the sticky nav.
- **DashboardView Labels** — Removed "Live" and "Live Database" prefixes from metric cards; updated JSX to use clean, high-density labels:
    ```jsx
    <span className="text-[9px] font-black text-slate-600 uppercase tracking-tight">{topic}</span>
    ...
    <span className="text-5xl font-black text-slate-900 tracking-tighter leading-none">{total}</span>
    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-tight">Items</span>
    ```

## [1.1.0] - 2026-04-02

### Added
- **Councillor attendance** — ProfilePanel now shows meeting day attendance (e.g. 68/71 days · 96%) derived from vote records. A councillor is counted as present on a given day if they cast at least one YES or NO vote. Score coloured green ≥90%, amber ≥75%, rose below.
- **ContestBoard: flag filter pills** — second row of filter pills for Close Vote, Unanimous, Crushed, and Defeated. Pills are styled per flag type (rose, emerald, slate). Deselects on second click. Empty state message when no motions match.
- **ContestBoard: mover byline** — motion mover now shown inline in each row on wider screens.
- **MotionTable: topic badge** — coloured topic pill (Housing, Transit, Finance, Parks, Climate, General) now displayed inline before each motion title.

### Added
- **Councillors page** (`/councillors`) — card grid of all 26 councillors showing attendance %, alignment score, vote count, and top topic. Click any card to open the existing ProfilePanel. Accessible from the top navbar.
- **Navbar** — replaces the sidebar. Sticky top bar with logo and links: Councillors, Wards, Analytics, Export, Budget. Shows live motion count and latest meeting date.
- **Dashboard: topic filter pills** — All · Housing · Transit · Finance · Parks · Climate · General filter pills replace the per-topic routes. Filtering is now in-page state; topic routes removed.
- **Dashboard: All Motions / Notable toggle** — two-button toggle above the motion list switches between the full MotionTable and the ContestBoard (notable/significant motions). Replaces the `/contested` route.

### Changed
- **Routes simplified** — removed `/contested`, `/housing`, `/transit`, `/finance`, `/parks`, `/climate`, `/general`. "Reports" route renamed to `/analytics`, "Open Data" renamed to `/export`.
- **ContestBoard** — topic filter pills removed (parent DashboardView handles topic filtering now). Flag filter pills remain.
- **Layout** — sidebar replaced by Navbar; main content now full-width centered at max 1400px.

### Docs
- **Roadmap restructured** — `ROADMAP.md` is now an index linking to three sub-roadmaps: `ROADMAP_PRODUCT.md` (features & UX), `ROADMAP_DATA.md` (pipelines & new sources), and `ROADMAP_TECHNICAL.md` (bugs & code quality). Populated with actionable items from the current codebase audit.

### Fixed
- **Sidebar logo underline** — `text-decoration: none` added to `.logo`; the site title was rendering as an underlined link.
- **"TRIVIALITY SCORE" card renamed to AGENDA BREAKDOWN** — replaced the opaque "42% Focus on Core" metric with a plain count ("423 of 717 motions were substantive"), a split bar, and a two-item legend showing substantive vs procedural/minor counts. The old jargon label and hardcoded two-variant analysis text are removed.
- **Layout header clutter** — removed "Live Analytics Engine" indicator, sparkle icon on page titles, "Export Insights" button (navigated to Reports, not an export), and "Reset View" button. Page titles are now clean labels.

### Changed
- **AlignmentHeatmap: score-coloured cards** — councillor cards now use a 4-tier colour scheme (green ≥85%, blue 70–84%, amber 55–69%, rose <55%) for both the card background/border and the score bar. Bars increased from 6px to 8px height for legibility.
- **ContestBoard: live result count** — subtitle now shows the actual filtered count instead of hardcoded "TOP 50".
- **ContestBoard: top-3 rank colouring** — #1 rank shown in amber, #2 in silver, #3 in bronze.
- **MotionTable: flag badges** — moved flag badges (Minor, Close, Crushed, Unanimous) below the title text to reduce horizontal clutter.

## [1.0.0] - 2026-04-02

### Added
- **WardGrid: dynamic highest-activity card** — top 2 wards by motion count now computed from real data; was hardcoded to Ward 15/13.
- **VersusOverlay: full topic badge coverage** — topic pills now style all 6 topics (Housing, Transit, Finance, Parks, Climate, General); previously only Housing and Transit had distinct colours.
- **VersusOverlay: slide-in panel CSS** — `.versus-overlay` styles were completely missing from index.css, causing the panel to never appear. Added fixed-position panel with slide-in transition matching the Profile panel.
- **DataModule: pagination** — table now renders 100 rows at a time with "Show more"; previously all 717 motions rendered at once.
- **App.css cleanup** — removed conflicting Vite template defaults (`.card`, `.logo`) that were overriding index.css styles.
- **Budget Translator overhaul** — expanded from 3 to 14 departments covering ~80% of the $18.8B operating budget (TTC, Police, Shelter, Children's Services, Fire, Parks, Infrastructure, Paramedic, Public Health, Long-Term Care, Solid Waste, Library, Economic Development, City Planning). Each department includes 4 real-world translation stats with context.
- **Budget Translator: spending breakdown chart** — horizontal bar chart (Recharts) ranking all departments by allocation with a tooltip showing per-resident cost. Remaining uncategorized budget shown as "All Other Services."
- **Budget Translator: accordion cards** — department cards now collapse/expand on click; collapsed state shows budget, % of total, and a proportional bar. Gross vs. net budget shown where applicable.
- **Vercel deployment config** — added `vercel.json` with explicit Vite framework, build command, output directory, and SPA rewrite rule so deep links and React Router routes resolve correctly on Vercel.
- **MotionTable filtering** — the Filter button now opens an inline filter bar with text search (title, mover, ID), a status dropdown (All / Adopted / Not adopted), and a "Hide minor items" checkbox. Active filter count shown as a badge on the button. Results count shown when filters are active. Empty state message when no motions match.
- **Scorecard: real Efficiency metric** — replaced hardcoded 92% with a live calculation: non-trivial motions adopted ÷ total non-trivial motions.
- **Scorecard: dynamic Session Summary** — replaced static AI copy with a generated paragraph drawn from real data: topic breakdown, adoption rate, split vote count, and top dissenter.
- **Data Module** — new `/data` route with a searchable, full-dataset table (ID, Date, Title, Topic, Mover, Ward, Vote, Status) and a Download CSV button that exports all tracked motions.
- **Vote column in MotionTable** — each motion row now shows a live YES–NO count derived from its vote record.
- **VersusOverlay: real DNA bars** — "Voter DNA" bars for each councillor now compute their YES% from actual vote records instead of hardcoded values.
- **Toronto Open Data pipeline** — new `scripts/import_open_data.js` downloads the City Council voting record CSV from the Toronto Open Data portal (2022–2026 term, ~40k vote records, 717 agenda items) and converts it to `motions.json`. Replaces the 5-item TMMIS scraper output with the full term's data. Supports `--term=` flag for historical terms back to 2006.
- **Climate topic** — added Climate as a distinct topic category (TransformTO, net zero, heat relief, emissions, etc.) with teal pill styling.
- **Significance score** — each motion now has a `significance` field (0–100) computed from five signals: vote margin, outcome (defeated/referred score higher), motion complexity (number of distinct motion types — amendments, referrals), multi-day (item spanned multiple meeting dates), and time spent (timestamp gap to next item in same session). `trivial` is now derived from `score < 25` rather than keyword matching alone. Median score: 20. Top motion: Housing Action Plan Avenues Policy Review at 83.
- **Motion flags** — each motion now carries a `flags` array: `close-vote`, `defeated`, `unanimous`, `landslide-defeat`, all gated on significance ≥ 25 to exclude procedural noise.
- **Flag badges in MotionTable** — Close, Unanimous, and Crushed badges render inline next to the motion title, same pattern as the existing Minor badge.
- **MotionTable pagination** — renders 50 rows at a time with a "Show more" button. Prevents browser strain on the full 717-motion dataset.
- **MotionTable: Notable filter + significance sort** — new "Notable only" checkbox shows flagged motions exclusively. New "Sort: Most Significant" option re-sorts by significance score descending.
- **MotionTable: significance score** — score shown as small grey number under each motion ID for quick reference.
- **MotionTable: Defeated status badge** — defeated motions now render a rose badge instead of grey.
- **Scorecard: dynamic date range** — title now derives the date range from the loaded motions instead of hardcoded "FEBRUARY 2026".
- **Scorecard: Impact Analysis sorted by significance** — "Major Wins" section now shows top 15 non-trivial adopted motions sorted by significance score, with the score shown as a badge on each card.
- **AlignmentHeatmap: data-derived councillor list** — no longer uses a hardcoded constant. Derives all councillors with ≥5 recorded votes from the motions data, sorted alphabetically by last name. Catches councillors missing from the static list (e.g. Rachel Chernos Lin).
- **ProfilePanel rewrite** — voting DNA now covers all 6 topics (Housing, Transit, Finance, Parks, Climate, General) with vote counts per topic. Notable votes now sorted by significance score instead of recency, showing top 20. Vote count shown in panel header.
- **ProfilePanel: ABSENT vote styling** — absent votes now render amber, distinct from YES (green) and NO (red).
- **Most Contested view** (`/contested`) — ranked list of top 50 non-trivial motions by significance score with topic filter pills, flag badges, vote counts, status badges, and significance bar per item.
- **Topic routes expanded** — added `/finance`, `/parks`, `/climate`, `/general` routes alongside the existing `/transit` and `/housing`.
- **Sidebar overhaul** — adds Most Contested, Finance, Parks, Climate nav links; status widget now shows live motion count and latest meeting date from loaded data instead of hardcoded session strings.

### Changed

### Fixed

## [0.4.0] - 2026-02-28

### Added
- **Routing**: Implemented `react-router-dom` for robust structural navigation, enabling deep-linking to dedicated views (Dashboard, Wards, Reports).
- **Custom Hooks**: Abstracted static JSON data fetching into a modular `useMotions` React hook for centralized state management.

### Changed
- **Documentation**: Refactored `CONTRIBUTING.md` to be more concise and direct, removing conversational filler.
- **Architectural Modularity**: Extracted monolithic `App.jsx` layout into discrete `Layout` and `DashboardView` components, eliminating duplicated presentation logic.
- **Business Logic Decoupling**: Migrated complex data analytics (triviality scores, member alignment, ward impacts) from inline React components to a dedicated `src/utils/analytics.js` service.

## [0.3.0] - 2026-02-25

### Added
- **Ward Legislative Footprint**: New `Ward Impact` view to visualize motion concentration across Toronto's 25 wards.
- **Geographic Data Model**: Defined exhaustive Toronto ward constants (`wards.js`) and neighborhood keyword mapping for automatic geolocation.
- **Autonomous Scraper Intelligence**: Fully overhauled `fetch_motions.js` with automatic voting table parsing, neighborhood-to-ward resolution, and enhanced triviality logic.
- **Session Monitoring UI**: Integrated real-time indicators for "Meeting 37" and "Meeting 38" to show exactly which TMMIS sessions are being monitored.
- **Automated Workflow**: Created a standardized `.agents/workflows/add-data.md` for non-technical data updates.

### Changed
- **Data Fidelity**: Replaced mock data with real-world February 2026 council records, including the 2026 City Budget and major housing demolition votes.
- **Triviality Engine**: Replaced character-length heuristics with a keyword-based impact vs. routine classifier.
- **UI Navigation**: Integrated Ward Impact into the sidebar and updated main header with session telemetry.
- **Project Structure**: Formalized project lifecycle with `LICENSE`, `SECURITY.md`, and `CONTRIBUTING.md`.
- **Dashboard Header Redesign**: Refined the main dashboard header to remove redundant session monitoring text, replacing it with a sleek "Live Analytics Engine" indicator.
- **Improved UX Copy**: Updated action labels (e.g., "Reset View", "Export Insights") to better reflect professional dashboard standards.
- **Animation Polish**: Integrated subtle micro-animations and pulse effects to the session monitoring indicator for a more dynamic feel.

## [0.2.0] - 2026-02-13

### Added
- **Dynamic Data Architecture**: Fully decoupled frontend from hardcoded data; motions are now fetched from `public/data/motions.json`.
- **Scorecard (Reports View)**: Comprehensive session performance analytics including Triviality Index and Top Dissenters.
- **Versus Mode**: Real-time councillor comparison logic based on actual voting records.
- **Voting DNA Profiles**: Data-driven profiles for each councillor showing support percentages across key categories (Housing, Transit, etc.).
- **TMMIS Scraper Persistence**: Updated `fetch_motions.js` to automatically persist data to the JSON store.

### Changed
- Refactored `App.jsx` to support async data loading and prop-driven state.
- Enhanced `AlignmentHeatmap` to calculate alignment based on consensus math.
- Updated `Sidebar` with active TMMIS sync status.

### Fixed
- Resolved multiple JSX syntax and linting errors.
- Fixed broken mover/seconder extraction in the scraping utility.

## [0.1.0] - 2026-02-10
- Initial prototype release.
- Static dashboard layout with mock data.
