# Technical Roadmap

Code quality, bugs, and structural improvements.

## Bugs

- [x] **Error state UI** — if `public/data/motions.json` fails to load, the app shows a blank screen. `useMotions.js` captures the error but never surfaces it. Add a simple error state to `App.jsx`.
- [x] **VersusOverlay: 0-vote alignment default** — `getMemberAlignmentScore` returns 75 as a baseline when a councillor has no recorded votes. This can produce misleading alignment scores in the Versus panel.


## Code Quality

- [x] **Centralize TOPIC_STYLES** — the topic colour mapping (`Housing → blue`, `Transit → red`, etc.) is duplicated across `ContestBoard.jsx`, `MotionTable.jsx`, `ProfilePanel.jsx`, and `VersusOverlay.jsx`. Extract to `src/constants/data.js`.
- [x] **Centralize FLAG_STYLES** — same issue as TOPIC_STYLES; flag badge styles (`close-vote`, `unanimous`, etc.) are duplicated across `ContestBoard.jsx` and `MotionTable.jsx`.


## Architecture

- [ ] **Multi-jurisdiction refactor** — transition from a Toronto-centric model to a generic engine.
    - Remove hardcoded `/toronto` basename in `App.jsx`.
    - Refactor `useMotions` to support dynamic loading from `/data/{jurisdiction}/motions.json`.
    - Create a shared `representatives.json` schema to handle MPs, MPPs, and Councillors.
- [ ] **Jurisdiction Registry** — implement a centralized registry (`src/constants/jurisdictions.js`) to manage regional branding, representative types (MP vs Councillor), and geography terms (Riding vs Ward).

## Performance

- [ ] **DataModule pagination** — currently renders 100 rows at a time. Consider virtualizing the list (e.g. `react-window`) if dataset grows significantly beyond 717 motions.

---

[Back to Roadmap](ROADMAP.md)
