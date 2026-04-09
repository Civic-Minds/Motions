# Technical Roadmap

Code quality, bugs, and structural improvements.

## Bugs

- [x] **Error state UI** — if `public/data/motions.json` fails to load, the app shows a blank screen. `useMotions.js` captures the error but never surfaces it. Add a simple error state to `App.jsx`.
- [x] **VersusOverlay: 0-vote alignment default** — `getMemberAlignmentScore` returns 75 as a baseline when a councillor has no recorded votes. This can produce misleading alignment scores in the Versus panel.


## Code Quality

- [x] **Centralize TOPIC_STYLES** — the topic colour mapping (`Housing → blue`, `Transit → red`, etc.) is duplicated across `ContestBoard.jsx`, `MotionTable.jsx`, `ProfilePanel.jsx`, and `VersusOverlay.jsx`. Extract to `src/constants/data.js`.
- [x] **Centralize FLAG_STYLES** — same issue as TOPIC_STYLES; flag badge styles (`close-vote`, `unanimous`, etc.) are duplicated across `ContestBoard.jsx` and `MotionTable.jsx`.


## Performance

- [ ] **DataModule pagination** — currently renders 100 rows at a time. Consider virtualizing the list (e.g. `react-window`) if dataset grows significantly beyond 717 motions.

---

[Back to Roadmap](ROADMAP.md)
