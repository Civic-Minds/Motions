# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- **Readability Restoration** — Purged excessive `uppercase` styling from motion titles, navigation labels, and primary dashboard metrics to restore text scanning efficiency.
- **Jargon Elimination** — Replaced abstract 'Navigator-Premium' terminology with standard, descriptive English:
    - `Outcome Pulse` → `Outcome`
    - `Consensus Flow` → `Votes`
    - `System Volume` → `Motions` / `Total Activity`
    - `Legislative Pulse` → `By Topic`
    - `Registry` → `Records`
- **Visual Spacing Refinement** — Abolished the `tracking-widest` and `tracking-[0.3em]` letter-spacing system across all `.pulse-label` and `.card-title` classes for a cleaner, modern look.
- **Search Bar Layout Recovery** — Standardized the search terminal with a reliable 48px leading icon offset and non-overlapping placeholder text.
- **Dynamic Efficiency Pulse** — Purged redundant "Live" and "Pulse" jargon from telemetry cards in favor of direct metric labeling.
- Resolved persistent search bar overlap by transitioning to a flex-row geometric layout; decoupled search terminal from ID metadata to ensure high-contrast legibility.
- Standardized dashboard card rounding to `32px` for visual consistency across all modules.

### Changed
- **Typography Density** — Adjusted the global font architecture to prioritize legibility over "technical telemetry" aesthetics while maintaining the high-fidelity 32px rounding.
- **Status Tags** — Standardized status indicators to use title-case labels and high-contrast semantic coloring without forced capitalization.
- **Navigation Transparency** — Updated the global navigation and logo to standard casing to improve professional brand clarity.
- **Old Jargon Elimination** — Purged abstract headers ("Legislative Ecosystem Feed") and ambiguous labels ("Active Cluster") in favor of direct, record-derived quantitative metrics.
- **Global Design System** — Standardized legacy components to 32px rounded "Navigator-Premium" containers (white-to-slate architecture).
- **Navigator-Premium UI Overhaul** — Purged experimental dark/tactical gradients in favor of high-fidelity "Pulse" white surfaces and diffused shadows.
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
