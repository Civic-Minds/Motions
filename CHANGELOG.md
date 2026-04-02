# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [0.5.0] - 2026-04-02

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
