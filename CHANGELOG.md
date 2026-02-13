# Changelog

All notable changes to this project will be documented in this file.

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
