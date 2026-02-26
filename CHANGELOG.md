# Changelog

All notable changes to this project will be documented in this file.

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
